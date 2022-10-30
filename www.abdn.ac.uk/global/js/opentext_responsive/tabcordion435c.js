(function($) {

    /**
     * Returns the correct dimensions of hidden elements
     *
     * @param  {Boolean} outer - if true, use outerWidth / OutherHeight
     * @param  {String} display_mode - forces the element size to be computed for a specific `display` mode
     *                                  (size would be different for `inline`, `inline-block` or `block`)
     * @return {Object}      JSON object containing width, height and position in the page
     */
    $.fn.getDimensions = function(outer, display_mode) {
        var $this = $(this),
            $hiddenParents = $this.parents(':hidden');
        $hiddenParents.css({display: 'block'});
        if (display_mode) {
            // cache maxHeight
            var maxHeight = $this.css('maxHeight');
            $this.css({display: display_mode});
            $this.css({maxHeight: 'none'});
            $this.css({visibility: 'hidden'});
            if (maxHeight !== 'none' && maxHeight > 0) {
                $this.css({maxHeight: maxHeight});
            }
        }
        var dimensions = {
            width:      (outer) ? $this.outerWidth() : $this.innerWidth(),
            height:     (outer) ? $this.outerHeight() : $this.innerHeight(),
            offsetTop:  $this.offset().top,
            offsetLeft: $this.offset().left
        };
        $this.css({display: ''});
        $this.css({maxHeight: ''});
        $this.css({visibility: ''});
        $hiddenParents.css({display: ''});
        return dimensions;
    }

    // stop window jumping aboot when panel is focused
    $.fn.focusWithoutScrolling = function(){
        var x = $(document).scrollLeft(), y = $(document).scrollTop();
        this.focus();
        window.scrollTo(x, y);
        return this; //chainability
    };

    // https://john-dugan.com/javascript-debounce/
    debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait || 200);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };

    $.fn.tabcordion = function() {

        return this.each(function() {
            this.$tabcordion = $(this);
            this.config = {};
            this.config.total_tabs_width = 0;
            // Default settings
            this.settings = {
                forceAccordion: false,
                urlFragments: false,
                openFirstPanel: false,
                forceAccordionUntil: false,
                openTab: false, // id of panel
                disableOpenTabAutoScroll: false
            };
            this.mode = 'accordion',
            this.tabnav = $('<ul class="tabcordion_nav"></ul>');
            this.tabnav.attr("role", "tablist");
            this.$tabcordion.wrap('<div class="tabcordion_wrapper"></div>');
            this.$tabcordionWrapper = this.$tabcordion.parent();

            // use self inside inner methods
            var self = this;
            /**
             * We can set configurations inline via a `data-tabcordion` attribute, for example:
             * `<dl class="tabcordion" data-tabcordion='{"forceAccordion": true, "urlFragments": true }'>`
             * These inline settings would override the default ones, if specified
             */
            if (!!this.$tabcordion.data('tabcordion')) {
                $.extend(this.settings, this.$tabcordion.data('tabcordion'));
            }

            /**
             * Initial setup for the accordion
             */
            function setup() {
                // This loads the correct styles for our accordion
                self.$tabcordion.addClass('tabcordion_loaded');
                // Initialize aria roles for tabs
                self.$tabcordion.find('> dt').each(function(i, e) {
                    var $tab = $(this),
                        $li = $('<li role="presentation"></li>'),
                        $panel = self.$tabcordion.find('> dd').eq(i),
                        width = $tab.getDimensions(true).width;
                    $tab.css({left: self.config.total_tabs_width});
                    $a = $tab.find('a');
                    $a.data('index', i);
                    $a.attr('role', 'tab');
                    $a.attr('aria-controls', $panel.attr('id'));
                    $a.attr('aria-selected', 'false');
                    self.config.total_tabs_width += width;
                    // set up the tabcordion wrapper
                    $panel.wrapInner('<div role="tabpanel"></div>');
                    $panel.attr('tabindex', '-1');
                    // copy the dt contents into the tab navigation
                    $li.html($tab.html());
                    $li.find('a').data('index', i);
                    $li.find('a').attr('tabindex', '-1');
                    $li.find('a').click(function(e){
                        var index = $(this).data('index');
                        closeAnyTabs();
                        openTab(index, true);
                        updateUrl($(this));
                        e.stopPropagation();
                        e.preventDefault();
                    });
                    self.tabnav.append($li);
                    $tab.wrapInner('<div role="tablist"></div>');
                });
                self.$tabcordion.before(self.tabnav);
                // Initialize aria roles for panels
                self.$tabcordion.find('> dd').each(function(i, e) {
                    var $panel = $(this);
                    $panel.data('index', i);
                    $panel.attr('aria-hidden', 'true');
                });

                /**
                 * If we are using url fragments and one is detected,
                 * open the corresponding tab by default and scroll to it
                 */
                if ((self.settings.urlFragments && window.location.hash.length > 0) ||  (!!self.settings.openTab)) {
                    var panelId = (!self.settings.openTab) ? window.location.hash.replace('#', '') : self.settings.openTab,
                        $panel = self.$tabcordion.find('> dd#' + panelId),
                        index;
                    if ($panel.length) {
                        index = $panel.data('index');
                        openTab(index, false, true);
                        if (!self.settings.disableOpenTabAutoScroll) {
                            $('html, body').animate({
                                scrollTop: $panel.parents('.tabcordion_wrapper').first().offset().top
                            }, 1200);
                        }
                        return;
                    }
                    else {
                        var inner_index = -1;

                        self.$tabcordion.find('> dd').each(function() {
                            var contains_hash = $(this).find('dd#' + panelId);

                            if (contains_hash.length) {
                                inner_index = $(this).data('index');
                                return false;
                            }
                        });

                        if (inner_index != -1) {
                            openTab(inner_index, false, true);
                            return;
                        }
                    }
                }
                /**
                 * If we are using tabs, open the first tab by default
                 */
                if (isInTabsMode() || self.settings.openFirstPanel) {
                    openTab(0);
                }
            }

            /**
             * Checks if the width of the tabs exceeds the width of the container and
             * @return {Boolean} true if it does
             */
            function isInAccordionMode() {
                var total_tabcordion_width = self.$tabcordion.getDimensions(true).width;
                if (
                    total_tabcordion_width < self.config.total_tabs_width // if the width of the tabs is greater than the width of the container
                    || self.settings.forceAccordion // or we always want to show an accordion
                    || total_tabcordion_width < self.settings.forceAccordionUntil // the width of the accordion is smaller than a set width
                ) {
                    return true;
                }
                return false;
            }

            function isInTabsMode() {
                return !isInAccordionMode();
            }

            /**
             * Opens a tab
             * @param  {integer} index      the index of the tab
             * @param  {Boolean} forceFocus will force the panel to be focused, useful when
             *                              we want to set focus after indirect tab selection,
             *                              such as left-right keyboard navigation
             */
            function openTab(index, forceFocus, skipAnimation) {
                if (isInTabsMode()) {
                    closeAnyTabs();
                }
                forceFocus = forceFocus || false;
                skipAnimation = skipAnimation || false;
                self.$tabcordion.find('> dt > div[role="tablist"] > a').eq(index).attr('aria-selected', 'true');
                self.$tabcordionWrapper.find('> .tabcordion_nav > li > a').eq(index).attr({'aria-selected': 'true', 'tabindex': 0});
                var $panel = self.$tabcordion.find('> dd').eq(index);
                /**
                 * In order to animate the accordion opening, we need to compute an accurate max-height
                 * because it's not possible to use css animations for `height: auto`
                 */

                if (isInAccordionMode()) {
                    $panel.data('height', $panel.getDimensions(true, 'block').height + 32);
                }
                if (!skipAnimation) {
                    $panel.addClass('tabcordion_animating');
                    $panel.outerWidth(); // triggers a reflow, without it there would be no animation because the browser is not "aware" that the current element is no longer `display: none`
                    $panel.css({maxHeight: $panel.data('height')});
                }

                $panel.attr('aria-hidden', 'false');
                $panel.attr('tabindex', '0');
                if (forceFocus) {
                    $panel.focusWithoutScrolling();
                }
            }

            // when the animation completes, remove the animation class and the inlined maxHeight value
            self.$tabcordion.find('> dd').on('transitionend', function(e){
                var $target = $(e.target);
                if ($target.is('.tabcordion > dd')) {
                    $target.removeClass('tabcordion_animating');
                    $target.css({maxHeight: ''});
                    e.stopPropagation();
                }
            });

            /**
             * returns an array containing all the open tabs
             */
            function getOpenTabs() {
                return self.$tabcordion.find('> dt > div[role="tablist"] > a[aria-selected="true"]');
            }

            /**
             * Returns an array containing all the tabs
             */
            function getTabs(index) {
                return self.$tabcordion.find('> dt');
            }

            /**
             * Returns an array containing all the panels
             */
            function getPanels(index) {
                return self.$tabcordion.find('> dd');
            }

            /**
             * Checks if the tab is open or not
             * @param  {integer} index the index of the tab
             */
            function isOpenTab(index) {
                if (self.$tabcordion.find('> dt > div[role="tablist"] > a').eq(index).attr('aria-selected') === 'true') {
                    return true;
                }
                return false;
            }

            /**
             * Closes a all the tabs of the current accordion
             */
            function closeAnyTabs() {
                self.$tabcordion.find('> dt a[aria-selected="true"]').attr('aria-selected', 'false');
                self.$tabcordion.find('> dd[aria-hidden="false"]').attr('aria-hidden', 'true');
                self.$tabcordion.find('> dd[tabindex="0"]').attr('tabindex', '-1');
                self.$tabcordionWrapper.find('> .tabcordion_nav > li a[aria-selected="true"]').attr({'aria-selected': 'false', 'tabindex': -1});
            }

            /**
             * Closes a tab
             * @param  {integer} index the index of the tab
             */
            function closeTab(index) {
                self.$tabcordion.find('> dt > div[role="tablist"] > a').eq(index).attr('aria-selected', 'false');
                self.$tabcordionWrapper.find('> .tabcordion_nav > li a').eq(index).attr({'aria-selected': 'false', 'tabindex': -1});
                var $panel = self.$tabcordion.find('> dd').eq(index);

                /**
                 * If we're in accordion mode, we need to measure and declare the current height,
                 * add the animation class and set the height to 0 so the panel will close using the maxHeight transition
                 */
                if (isInAccordionMode()) {
                    $panel.data('height', $panel.getDimensions(true, 'block').height + 32);
                    $panel.css({maxHeight: $panel.data('height')});
                    $panel.outerWidth(); // triggers a reflow necessary for the animation to work correctly
                    $panel.addClass('tabcordion_animating');
                    $panel.css({maxHeight: 0});
                }

                // if we're in accordion mode we need to wait until the animation is complete before closing the panel
                var closeTimeout = (isInAccordionMode()) ? 301 : 1;
                setTimeout(function(){
                    $panel.attr('aria-hidden', 'true');
                    $panel.attr('tabindex', '-1');
                }, closeTimeout);

                setTimeout(function(){ self.$tabcordion.find('> dt').eq(index).find('> a').focus(); }, 1);
            }

            /**
             * This function hadles switching from tabs to accordion and back
             */
            function draw() {
                var mode = mode || 'tabs',
                    transition = false,
                    lastDrawMode = self.mode,
                    $focused_accordion = self.$tabcordion.find('> dt a:focus'),
                    $focused_tab = self.$tabcordionWrapper.find('> .tabcordion_nav > li > a:focus'),
                    index;
                if (isInAccordionMode()) {
                    mode = 'accordion';
                }
                self.mode = mode;
                // we need to figure out if the mode is changed from the last resize event or not
                transition = (lastDrawMode != mode) ? lastDrawMode + '_to_' + mode : false;
                self.$tabcordion.removeClass('tabcordion_mode_tabs tabcordion_mode_accordion').addClass('tabcordion_mode_' + mode);
                self.$tabcordionWrapper.removeClass('tabcordion_mode_tabs tabcordion_mode_accordion').addClass('tabcordion_mode_' + mode);
                // reset the computed cached heights for panels
                // TODO move this
                $panels = getPanels();
                $panels.each(function(i, panel){
                    var $panel = $(panel);
                    $panel.data('height', '');
                });
                var openTabs = getOpenTabs();
                if (isInTabsMode() && !openTabs.length) {
                    openTab(0);
                }
                if (isInTabsMode() && openTabs.length > 1) {
                    closeAnyTabs();
                    openTab(openTabs.first().data('index'));
                }
                // maintains focus when switching from accordion to tabs
                if (transition === 'accordion_to_tabs' && ($focused_accordion.length > 0)) {
                    index = $focused_accordion.data('index');
                    self.$tabcordionWrapper.find('> .tabcordion_nav > li > a').eq(index).focus();
                }
                // maintains focus when switching from tabs to accordion
                if (transition === 'tabs_to_accordion' && ($focused_tab.length > 0)) {
                    index = $focused_tab.data('index');
                    self.$tabcordion.find('> dt > div[role="tablist"] > a').eq(index).focus();
                }
            }

            function updateUrl($anchor) {
                /**
                 * Prevent the hash from being changed unless
                 * the urlFragments option is activated
                 */
                if (!self.settings.urlFragments) {
                    return false;
                }

                // We need to change the id of the target so that we don't trigger a page scroll
                var $panel = $($anchor.attr("href")),
                    panelId = $panel.attr('id');
                $panel.attr('id', $panel.attr('id') + 'hashchange');

                if (isOpenTab($panel.data('index'))) {
                    history.pushState({}, '', $anchor.attr("href"));
                } else {
                    history.pushState({}, '', location.href.replace(location.hash, ''));
                }

                $panel.attr('id', panelId);
            }

            /**
             * Handle the clicking events for accordions
             */
            self.$tabcordion.find('> dt a').click(function(e) {
                var index = $(this).data('index');
                if (isOpenTab(index)) {
                    closeTab(index);
                } else {
                    openTab(index, true);
                }
                updateUrl($(this));
                e.stopPropagation();
                e.preventDefault();
            });

            /**
             * Listen for left-right arrows being pressed
             */
            self.$tabcordionWrapper.keydown(function(e) {
                /* if the keys are not left or right arrow, continue as usual */
                if ([37, 39].indexOf(e.which) === -1) {
                    return;
                }
                // left-right should only work when we are focused on a tab
                var $focused = $('a[role="tab"]:focus');
                if (!$focused.length) {
                    return;
                }
                var keysToDirections = {
                        37: -1, // prev
                        39: 1 // next
                    };
                var direction = keysToDirections[e.which],
                    //get the currently focused tab
                    index = $focused.data('index');
                index += direction;
                index = Math.min(index, getTabs().length - 1); // can't be larger than the number of tabs
                index = Math.max(index, 0); // can't be lower than 0
                if (isInTabsMode()) {
                    self.$tabcordionWrapper.find('> .tabcordion_nav > li > a').eq(index).focus();
                    openTab(index);
                } else {
                    self.$tabcordion.find('> dt > div[role="tablist"] > a').eq(index).focus();
                }
                e.preventDefault();
                e.stopPropagation();
            });

            /**
             * Initial setup
             */
            setup();

            /**
             * Listen for resize events
             */
            $(window).resize(debounce(function() {
                draw();
            }, 16)).resize();

            /**
             * Listen for hash change events
             */
            if ('onhashchange' in window) {
                $(window).on('hashchange', function () {
                    // try and find a link that exists for the tab on the current tabcordion
                    var $link = self.$tabcordionWrapper.find('> .tabcordion_nav a[href="' + window.location.hash + '"]');

                    // we found a link, this hash belongs to this tabcordion
                    if ($link.length) {
                        // get the index of the tab
                        var tabIndex = $link.data('index');

                        // if the tab isn't already open, the has was not changed by the tabcordion, must have been another link
                        if (!isOpenTab(tabIndex)) {
                            closeAnyTabs();
                            openTab(tabIndex, true);

                            // scroll the top of the tab into view
                            if (isInTabsMode()) {
                                $('html, body').animate({
                                    scrollTop: $link.parents('.tabcordion_nav').first().offset().top,
                                }, 1200);
                            } else {
                                $('html, body').animate({
                                    scrollTop: $('.tabcordion [aria-controls="' + $link.attr('href').replace('#', '') + '"]').first().offset().top,
                                }, 1200);
                            }
                        }
                    }
                });
            }
        });
    };

    $(document).ready(function() {
        $('.tabcordion').tabcordion();
    });

})(jQuery)

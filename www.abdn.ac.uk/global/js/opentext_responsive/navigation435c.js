/*!
 * hoverIntent v1.8.1 // 2014.08.11 // jQuery v1.9.1+
 * http://briancherne.github.io/jquery-hoverIntent/
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */

/* hoverIntent is similar to jQuery's built-in "hover" method except that
 * instead of firing the handlerIn function immediately, hoverIntent checks
 * to see if the user's mouse has slowed down (beneath the sensitivity
 * threshold) before firing the event. The handlerOut function is only
 * called after a matching handlerIn.
 *
 * // basic usage ... just like .hover()
 * .hoverIntent( handlerIn, handlerOut )
 * .hoverIntent( handlerInOut )
 *
 * // basic usage ... with event delegation!
 * .hoverIntent( handlerIn, handlerOut, selector )
 * .hoverIntent( handlerInOut, selector )
 *
 * // using a basic configuration object
 * .hoverIntent( config )
 *
 * @param  handlerIn   function OR configuration object
 * @param  handlerOut  function OR selector for delegation OR undefined
 * @param  selector    selector OR undefined
 * @author Brian Cherne <brian(at)cherne(dot)net>
 */

;
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (jQuery && !jQuery.fn.hoverIntent) {
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    // default configuration values
    var _cfg = {
        interval: 100,
        sensitivity: 7,
        timeout: 800
    };

    // counter used to generate an ID for each instance
    var INSTANCE_COUNT = 0;

    // current X and Y position of mouse, updated during mousemove tracking (shared across instances)
    var cX, cY;

    // saves the current pointer position coordinates based on the given mousemove event
    var track = function (ev) {
        cX = ev.pageX;
        cY = ev.pageY;
    };

    // compares current and previous mouse positions
    var compare = function (ev, $el, s, cfg) {
        // compare mouse positions to see if pointer has slowed enough to trigger `over` function
        if (Math.sqrt((s.pX - cX) * (s.pX - cX) + (s.pY - cY) * (s.pY - cY)) < cfg.sensitivity) {
            $el.off(s.event, track);
            delete s.timeoutId;
            // set hoverIntent state as active for this element (permits `out` handler to trigger)
            s.isActive = true;
            // overwrite old mouseenter event coordinates with most recent pointer position
            ev.pageX = cX;
            ev.pageY = cY;
            // clear coordinate data from state object
            delete s.pX;
            delete s.pY;
            return cfg.over.apply($el[0], [ev]);
        } else {
            // set previous coordinates for next comparison
            s.pX = cX;
            s.pY = cY;
            // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
            s.timeoutId = setTimeout(function () {
                compare(ev, $el, s, cfg);
            }, cfg.interval);
        }
    };

    // triggers given `out` function at configured `timeout` after a mouseleave and clears state
    var delay = function (ev, $el, s, out) {
        delete $el.data('hoverIntent')[s.id];
        return out.apply($el[0], [ev]);
    };

    $.fn.hoverIntent = function (handlerIn, handlerOut, selector) {
        // instance ID, used as a key to store and retrieve state information on an element
        var instanceId = INSTANCE_COUNT++;

        // extend the default configuration and parse parameters
        var cfg = $.extend({}, _cfg);
        if ($.isPlainObject(handlerIn)) {
            cfg = $.extend(cfg, handlerIn);
            if (!$.isFunction(cfg.out)) {
                cfg.out = cfg.over;
            }
        } else if ($.isFunction(handlerOut)) {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerOut,
                selector: selector
            });
        } else {
            cfg = $.extend(cfg, {
                over: handlerIn,
                out: handlerIn,
                selector: handlerOut
            });
        }

        // A private function for handling mouse 'hovering'
        var handleHover = function (e) {
            // cloned event to pass to handlers (copy required for event object to be passed in IE)
            var ev = $.extend({}, e);

            // the current target of the mouse event, wrapped in a jQuery object
            var $el = $(this);

            // read hoverIntent data from element (or initialize if not present)
            var hoverIntentData = $el.data('hoverIntent');
            if (!hoverIntentData) {
                $el.data('hoverIntent', (hoverIntentData = {}));
            }

            // read per-instance state from element (or initialize if not present)
            var state = hoverIntentData[instanceId];
            if (!state) {
                hoverIntentData[instanceId] = state = {
                    id: instanceId
                };
            }

            // state properties:
            // id = instance ID, used to clean up data
            // timeoutId = timeout ID, reused for tracking mouse position and delaying "out" handler
            // isActive = plugin state, true after `over` is called just until `out` is called
            // pX, pY = previously-measured pointer coordinates, updated at each polling interval
            // event = string representing the namespaced event used for mouse tracking

            // clear any existing timeout
            if (state.timeoutId) {
                state.timeoutId = clearTimeout(state.timeoutId);
            }

            // namespaced event used to register and unregister mousemove tracking
            var mousemove = state.event = 'mousemove.hoverIntent.hoverIntent' + instanceId;

            // handle the event, based on its type
            if (e.type === 'mouseenter') {
                // do nothing if already active
                if (state.isActive) {
                    return;
                }
                // set "previous" X and Y position based on initial entry point
                state.pX = ev.pageX;
                state.pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $el.off(mousemove, track).on(mousemove, track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                state.timeoutId = setTimeout(function () {
                    compare(ev, $el, state, cfg);
                }, cfg.interval);
            } else { // "mouseleave"
                // do nothing if not already active
                if (!state.isActive) {
                    return;
                }
                // unbind expensive mousemove event
                $el.off(mousemove, track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                state.timeoutId = setTimeout(function () {
                    delay(ev, $el, state, cfg.out);
                }, cfg.timeout);
            }
        };

        // listen for mouseenter and mouseleave
        return this.on({
            'mouseenter.hoverIntent': handleHover,
            'mouseleave.hoverIntent': handleHover
        }, cfg.selector);
    };
});


/* MEGA MENU - Uses hoverIntent plugin 
------------------------------------------------------------ */

$(document).ready(function () {
    var $dropdowns = $('.uni_menu>ul>li'); // Specifying the element is faster for older browsers

    function isTouchDevice() {
        return 'ontouchstart' in document.documentElement;
    }

    if (isTouchDevice()) {
        $('.uni_menu_close').click(function () {
            $('.uni_menu>ul>li.hover').removeClass('hover');
            return false;
        });

        $dropdowns.each(function () {
            var $this = $(this);

            this.addEventListener('touchstart', function (e) {
                if (e.touches.length === 1) {
                    // Prevent touch events within dropdown bubbling down to document
                    e.stopPropagation();

                    // Toggle hover
                    if (!$this.hasClass('hover')) {
                        // Prevent link on first touch
                        if (e.target === this || e.target.parentNode === this) {
                            e.preventDefault();
                        }

                        // Hide other open dropdowns
                        $dropdowns.removeClass('hover');
                        $this.addClass('hover');

                        // Hide dropdown on touch outside
                        document.addEventListener('touchstart', closeDropdown = function (e) {
                            e.stopPropagation();

                            $this.removeClass('hover');
                            document.removeEventListener('touchstart', closeDropdown);
                        });
                    }
                }
            }, false);
        });
    } else {
        // The mouse can be used to control hover effects so no need for close button
        $('.uni_menu_close a').css('display', 'none');

        // add focus / keyup handlers to global nav items
        var $global_nav_links = $('.uni_menu > ul > li > a');

        $global_nav_links.each(function(obj_key, obj_value) {
            var $this = $(this);

            // show the megamenu when the parent link is focused
            this.addEventListener('focus', function() {
                $dropdowns.removeClass('hover');
                var parent_li = $this.parent();
                parent_li.addClass('hover');
            });

            this.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowRight') {
                    if ($global_nav_links[obj_key + 1]) {
                        $dropdowns.removeClass('hover');
                        $global_nav_links[obj_key + 1].focus();
                    } else {
                        $dropdowns.removeClass('hover');
                        $('#uni_search_toggle').focus();
                    }
                }

                if (e.key === 'ArrowLeft') {
                    if ($global_nav_links[obj_key - 1]) {
                        $dropdowns.removeClass('hover');
                        $global_nav_links[obj_key - 1].focus();
                    }
                }

                // shift tab focuses the previous (correctly) but should also hide the current megamenu
                if (e.shiftKey && e.key === 'Tab') {
                    $this.parent().removeClass('hover');
                }
            });
        });

        document.getElementById('uni_search_toggle').addEventListener('focus', function() {
            $dropdowns.removeClass('hover');
        });
    }

    // If menu item is hovered over show menu
    function showMegaMenu() {
        $(this).addClass('hover');
    }

    // If you move out hide menu
    function hideMegaMenu() {
        $(this).removeClass('hover');
    }

    $('.uni_menu').hoverIntent({
        over: showMegaMenu,
        out: hideMegaMenu,
        timeout: 400,
        selector: 'ul li'
    });


    /* progressively enhance search panel
    ------------------------------------------------------------ */

    // add aria
    $('.uni_search_toggle').attr('aria-controls', 'global_search');
    $('.uni_search_toggle').attr('aria-expanded', 'false');

    var search_top_trap = '';
    var search_bottom_trap = '';

    // provide a click handler
    $('.uni_search_toggle').click(function (e) {
        e.preventDefault();

        // flip the state of the search
        search_expanded = $('.uni_search_toggle').attr('aria-expanded');
        search_expanded = (search_expanded == 'false' ? 'true' : 'false');

        // do the schnizzle
        if (search_expanded == 'true') {
            // expanded / active state
            showModalOverlay();
            showSearch();
        } else {
            // collapsed / inactive state
            hideSearch(true);
            hideModalOverlay();
        }
    });


    /* progressively enhance the subsection nav
    ------------------------------------------------------------ */

    $('#section_nav_wrapper').addClass('can_toggle');

    // add aria
    $('.uni_menu_toggle').attr('aria-controls', 'section_nav');
    $('.uni_menu_toggle').attr('aria-expanded', 'false');

    var top_trap = '';
    var bottom_trap = '';

    // provide a click handler
    $('.uni_menu_toggle').click(function (e) {
        e.preventDefault();

        section_nav_expanded = $('.uni_menu_toggle').attr('aria-expanded');
        section_nav_expanded = (section_nav_expanded == 'false' ? 'true' : 'false');

        // do the schnizzle
        if (section_nav_expanded == 'true') {
            // expanded / active state
            showModalOverlay();
            showSectionNav();
        } else {
            // collapsed / inactive state
            hideSectionNav(true);
            hideModalOverlay();
        }
    });


    /* zoomy hovers
    ------------------------------------------------------------ */

    // there needs to be a link to link to
    $('.feature_box .feature_image img, .feature_box .feature_content h2, .feature_box .feature_more a').hover(function () {
        // is there a link button?
        if ($(this).parents('.feature_box').find('.feature_more a').length > 0) {
            var this_box = $(this).parents('.feature_box');
            var this_box_image_wrapper = this_box.find('.feature_image');
            var this_box_image = this_box.find('.feature_image img');
            var this_box_h2 = this_box.find('.feature_content h2');
            var the_link_element = this_box.find('.feature_more a');
            var the_link = this_box.find('.feature_more a').attr('href');
            var the_link_text = this_box.find('.feature_more a').html();

            the_link_element.addClass('hover');
            this_box_image_wrapper.addClass('zoomed');
            this_box_image.add(this_box_h2).css('cursor', 'pointer');

            // add link to image and h2
            this_box_image.add(this_box_h2).click(function () {
                document.location = the_link;
            });
        };
    }, function () {
        $(this).parents('.feature_box').find('.feature_image').removeClass('zoomed');
        $(this).parents('.feature_box').find('.feature_more a').removeClass('hover');
    });
});


function showModalOverlay() {
    // show (or hide) the modal fade
    $('#modal_fade').addClass('active');

    // allow clicks on the modal fade to close the menu
    $('#modal_fade').click(function () {
        hideModalOverlay();
    });
}


function hideModalOverlay() {
    $('#modal_fade').removeClass('active');
    $('#modal_fade').off('click');

    // clicking should dismiss associated controls
    if ($('#section_nav').hasClass('active')) {
        hideSectionNav();
    }

    if ($('#global_search').hasClass('active')) {
        hideSearch();
    }
}


/* progressively enhance the section nav toggles
------------------------------------------------------------ */

function showSectionNav() {
    // create the focus trap if it doesn't exist
    if (!document.getElementById('section_nav_top_buffer')) {
        var focusable = $('#section_nav').find('a');

        top_trap = focusable[0];
        bottom_trap = focusable[focusable.length - 1];

        // create the top and bottom buffers
        var top_buffer = $('#section_nav').prepend('<div id="section_nav_top_buffer" tabindex="0"></div>');
        var bottom_buffer = $('#section_nav').append('<div id="section_nav_bottom_buffer" tabindex="0"></div>');

        // add the event listeners to both buffers
        $('#section_nav_top_buffer').focus(function () {
            hideModalOverlay();
            hideSectionNav(true);
        });
        $('#section_nav_bottom_buffer').focus(function () {
            hideModalOverlay();
            hideSectionNav(true);
        });
    }

    $('.uni_menu_toggle').attr('aria-expanded', 'true');
    $('#section_nav').off('transitionend');

    // show (or hide) the subsection navigation
    $('#section_nav_wrapper').addClass('active');

    setTimeout(function () {
        $('#section_nav').addClass('active');
    }, 10);

    setTimeout(function () {
        top_trap.focus();
    }, 300);

    $('#section_nav').keyup(function (e) {
        if (e.which == 27) {
            hideModalOverlay();
            hideSectionNav(true);
        }
    });

    // also make sure the search is hidden
    if ($('#global_search').hasClass('active')) {
        hideSearch(false);
    }
}


function hideSectionNav(do_focus) {
    $('.uni_menu_toggle').attr('aria-expanded', 'false');

    $('#section_nav').off('transitionend');
    $('#section_nav').removeClass('active');

    setTimeout(function () {
        $('#section_nav_wrapper').removeClass('active');

        if (do_focus) {
            $('.uni_menu_toggle').focus();
        }
    }, 300);
}


/* progressively enhance the search toggles
------------------------------------------------------------ */

var is_expanded = 'false';

function showSearch() {
    // create the focus trap if it doesn't exist
    if (!document.getElementById('search_top_buffer')) {
        var focusable = $('#global_search').find('select, input, button, a');

        search_top_trap = focusable[1]; // the text input, which we could just call by id...
        search_bottom_trap = focusable[focusable.length - 1];

        // create the top and bottom buffers
        var top_buffer = $('#global_search').prepend('<div id="search_top_buffer" tabindex="0"></div>');
        var bottom_buffer = $('#global_search').append('<div id="search_bottom_buffer" tabindex="0"></div>');

        // add the event listeners to both buffers
        $('#search_top_buffer').focus(function () {
            hideModalOverlay();
            hideSearch(true);
        });
        $('#search_bottom_buffer').focus(function () {
            hideModalOverlay();
            hideSearch(true);
        });
    }

    $('.uni_search_toggle').attr('aria-expanded', 'true');

    $('#global_search').addClass('active');
    $('#global_search').slideDown(400, function () {
        search_top_trap.focus();
    });

    $('#global_search').keyup(function (e) {
        if (e.which == 27) {
            hideModalOverlay();
            hideSearch(true);
        }
    });

    // also make sure the subsection nav is hidden
    if ($('#section_nav').hasClass('active')) {
        hideSectionNav(false);
    }
}


function hideSearch(do_focus) {
    $('.uni_search_toggle').attr('aria-expanded', 'false');

    $('#global_search').removeClass('active');
    $('#global_search').slideUp(400, function () {
        if (do_focus) {
            $('.uni_search_toggle').focus();
        }
    });
}

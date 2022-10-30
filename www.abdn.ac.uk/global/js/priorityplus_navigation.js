/**
 * Priority Plus Navigation Pattern
 *
 * Described here:
 * http://bradfrost.com/blog/post/revisiting-the-priority-pattern/
 *
 * Created 04 Apr 2016
 * Updated 15 Apr 2016
 *
 * @author Zeno D Zaplaic
 * @author Allan A Beattie
 * @version 0.0.2
 */


var PriorityPlusList = (function (window, document, undefined ) {
    "use strict";

    var Util = {
        //shorthand for querySelectorAll
        q: function(selector, context) {
            context = context || document;
            return context.querySelectorAll(selector);
        },
        //iterates through node lists
        each: function(array, fn) {
            var l = array.length,
                i;
            for (i = 0; i < l; i++) {
                fn.call(this, i, array[i]);
            }
        },
        //string to Node object
        html: function(str) {
          var wrapper= document.createElement('div');
          wrapper.innerHTML= str;
          var html = wrapper.firstChild;
          return html;
        },
        //toggles a class
        toggleClass: function(el, className){
            if (el.classList) {
              el.classList.toggle(className);
            } else {
              var classes = el.className.split(' ');
              var existingIndex = classes.indexOf(className);

              if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
              else
                classes.push(className);

              el.className = classes.join(' ');
            }
        },
        slugify: function(text){
            return text.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^\w\_]+/g, '')
        }
    };

    var List = function(nav, config, uid) {
        this.nav = nav;
        this.list = this.getListItemsHTML(this.nav);
        this.listArray = this.listArray || [];
        this.moreButton = config.moreButton;
        this.moreButtonClass = config.moreButtonClass;
        this.moreDropdownClass = config.moreDropdownClass;
        this.uid = uid;
        var self = this;
        //remember initial items
        if (!this.listArray.length) {
            Util.each(self.list, function(i, listItem){
                self.listArray.push({
                    html: listItem.cloneNode(true),
                    width: listItem.offsetWidth
                });
            });
        }
        this.draw();
        (function (self) {
            window.addEventListener('resize', function(){
                self.draw();
            });
        })(this);

        return this;
    };

    List.prototype.getMoreBtnHTML = function(nav) {
        return Util.q('.priority_plus_more', nav)[0];
    };

    List.prototype.getListItemsHTML = function(nav) {
        return Util.q('li', nav);
    };

    List.prototype.getMoreListHTML = function(nav) {
        return Util.q('.more_list', nav)[0];
    };

    List.prototype.draw = function() {
        var totalListWidth = 0,
            list,
            moreListArray = [],
            nav,
            moreButtonHTML,
            moreList;
        nav = this.nav;

        //compute the width of all list items
        Util.each(this.listArray, function(i, item){
            totalListWidth += item.width;
        });

        //measure the width of the "More" button
        nav.appendChild(Util.html(this.moreButton));
        var moreButtonWidth = this.getMoreBtnHTML(nav).offsetWidth;
        nav.removeChild(this.getMoreBtnHTML(nav));
        //remove all the original list items
        list = this.getListItemsHTML(nav);
        Util.each(list, function(i, listItem){
            nav.removeChild(listItem);
        });
        //redraw
        var total = 0,
            navWidth = nav.offsetWidth;
        Util.each(this.listArray, function(i, item){
            total += item.width;
            if (totalListWidth >= navWidth && total >= navWidth - moreButtonWidth - 5) {
                moreListArray.push(item);
            } else {
                nav.appendChild(item.html);
            }
        });

        // check if we need to toggle the "more" button
        if (totalListWidth < navWidth) {
            return;
        } else {
            //add the More Button
            nav.appendChild(Util.html(this.moreButton));
            moreButtonHTML = this.getMoreBtnHTML(nav);
            // and the dropdown list
            moreButtonHTML.appendChild(Util.html('<ul class="more_list"></ul>'));
            moreList = this.getMoreListHTML(nav);
            Util.each(moreListArray, function(i, item){
                moreList.appendChild(item.html);
            });

            var moreButtonHTMLLink =  Util.q('.' + this.moreButtonClass + '>a', nav)[0],
                self = this;
            // set up aria roles
            moreList.setAttribute('id', 'priority_list_' + this.uid);
            moreButtonHTMLLink.setAttribute('aria-controls', 'priority_list_' + self.uid);
            moreButtonHTMLLink.setAttribute('aria-label', 'Toggle display of more links');
            moreButtonHTMLLink.setAttribute('aria-expanded', 'false');
            moreList.setAttribute('aria-hidden', 'true');
            var toggleDropdownState = function(e){
                Util.toggleClass(moreButtonHTML, 'active');
                var isAreaExpanded = moreButtonHTMLLink.getAttribute('aria-expanded') === 'true';
                // tabindex
                if (!isAreaExpanded) {
                    moreButtonHTMLLink.setAttribute('aria-expanded', 'true');
                    moreList.setAttribute('aria-hidden', 'false');
                } else {
                    moreButtonHTMLLink.setAttribute('aria-expanded', 'false');
                    moreList.setAttribute('aria-hidden', 'true');
                }
                e.preventDefault();
            };
            moreButtonHTMLLink.onclick = toggleDropdownState;
        }
    };

    var PriorityPlusList = function (options) {
        var opts = options || {},
            targets,
            config;

        this.selector = opts.selector;
        config = {};
        config.moreButtonClass = opts.moreButtonClass || 'priority_plus_more';
        config.moreDropdownClass = opts.moreButtonClass || 'more_list';
        config.moreButtonContent = opts.moreButtonContent || '<a href="#"><b>More &#8964;</b></a>';
        config.moreButton = '<li class="' + config.moreButtonClass + '">' + config.moreButtonContent + '</li>';
        targets = Util.q(this.selector);
        Util.each(targets, function(i, nav){
            var uid = Util.slugify(opts.selector);
            new List(nav, config, uid);
        });
    };
    return PriorityPlusList;

})(window, document);

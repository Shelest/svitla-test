/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'jquery/ui',
    'mage/menu'
], function($){
    $.widget('svitla.menu', $.mage.menu, {
        options: {
            expanded: false,
            collapsible: false,
            pageWrapper: '.page-wrapper',
            navContainer: '.nav-sections',
            toggleActionEl: '.action.toggle.nav',
            titleWithSubmenu: 'li.parent > a',
            submenu: 'li.parent > .submenu',
            openedMenuClass: 'nav-open',
            itemsContainer: '> ul',
            topLevel: 'li.level0',
            topLevelSubmenu: '> .submenu',
            topLevelHoverClass: 'hover',
            expandedTopLevel: '.more',
            submenuActionsTemplate:
            '<script type="text/x-magento-template">' +
                '<li class="action all">' +
                    '<a href="<%= categoryURL %>"><span>All <%= category %></span></a>' +
                '</li>' +
            '</script>'
        },
        _init: function () {
            this.navContainer = $(this.options.navContainer);
            this.pageWrapper = $(this.options.pageWrapper);

            this._super();
        },
        _toggleMobileMode: function () {
            $(this.options.submenu, this.options.itemsContainer, $(this.options.topLevel, this.element))
                .removeAttr('style');

            this.toggleAction = $(this.options.toggleActionEl).detach().clone();
            this.pageWrapper.prepend(this.toggleAction);

            this.mobileNav = $(this.element).detach();
            this.navContainer.append(this.mobileNav);
            this.mobileNav.find('> ul').addClass('nav');
            this.mobileNav.scroll($.proxy(function () {
                this._fixedBackLink();
            }, this));

            this._renderSubmenuActions();
            this._bindDocumentEvents();
        },
        /**
         * @private
         */
        _hideAllSubmenus: function () {
            var topItemsWithSubmenu = this.mobileNav.find('.submenu.level0');

            $.each(
                topItemsWithSubmenu,
                function (index, item) {
                    $(item).removeClass('opened');
                    $(item.previousElementSibling).removeClass('action back');
                }
            );
        },

        /**
         * @param {jQuery.Event} e
         * @private
         */
        _showSubmenu: function (e) {
            var submenu;

            $(e.currentTarget).addClass('action back');
            submenu = $(e.currentTarget).siblings('.submenu');

            submenu.removeAttr('style').addClass('opened');
        },
        /**
         * @private
         */
        _renderSubmenuActions: function () {
            $.each(
                $(this.options.itemWithSubmenu),
                $.proxy(function (index, item) {
                    var actions = $(mageTemplate(
                        this.options.submenuActionsTemplate,
                        {
                            category: $('> a > span', item).text(),
                            categoryURL: $('> a', item).attr('href')
                        }
                        )),
                        submenu = $('> .submenu', item),
                        items = $('> ul', submenu);

                    items.prepend(actions);
                }, this)
            );
        },
        /**
         * @private
         */
        _bindDocumentEvents: function () {
            if (!this.eventsBound) {
                $(document)
                    .on('click.toggleMenu', this.options.toggleActionEl, $.proxy(function (e) {
                        if ($(this.element).data('opened')) {
                            this._hideAllSubmenus();
                            this._hideMenu();
                        }
                        e.stopPropagation();
                        this.mobileNav.find('.level0.first a.level-top').trigger('click.showSubmenu');
                        this.mobileNav.scrollTop(0);
                        this._fixedBackLink();
                    }, this))

                    .on('click.showSubmenu', this.options.titleWithSubmenu, $.proxy(function (e) {
                        if (!$(e.currentTarget).hasClass('action back')) {
                            this._hideAllSubmenus(e);
                            this._showSubmenu(e);

                            e.preventDefault();
                            this.mobileNav.scrollTop(0);
                            this._fixedBackLink();
                        }
                    }, this));

                this.eventsBound = true;
            }
        },

        /**
         * @private
         */
        _fixedBackLink: function () {
            var linksBack = this.mobileNav.find('.submenu .action.back'),
                linkBack = this.mobileNav.find('.submenu.opened > ul > .action.back').last(),
                subMenu, navOffset, linkBackHeight;

            linksBack.removeClass('fixed');

            if (linkBack.length) {
                subMenu = linkBack.parent();
                navOffset = this.mobileNav.find('.nav').position().top;
                linkBackHeight = linkBack.height();

                if (navOffset <= 0) {
                    linkBack.addClass('fixed');
                    subMenu.css({
                        paddingTop: linkBackHeight
                    });
                } else {
                    linkBack.removeClass('fixed');
                    subMenu.css({
                        paddingTop: 0
                    });
                }
            }
        }
    });

    return $.svitla.menu;

});

'use strict';


var animation = (function(window, undefined) {

    var index = 0;
    var instances = [];
    var firstOpen = true;
    var isBoot = false;
    var view;

    // Enum of CSS selectors

    var SELECTORS = {
        logo:           '.header',
        pageFooter:     '.footer',
        learn:          '#learn',
        encyclopedia:   '#encyclopedia',
        know:           '#know',
        qa:             '#qa',
        lab:            '#lab',
        container:      '.container__platforms',
        platforms:      '.platform',
        name:           '.platform__name',
        definition:     '.platform__definition',
        introduction:   '.platform__introduction',
        description:    '.platform__description',
        descriptionMore:'.platform__description--more',
        status:         '.platform__status',
        launchingDate:  '.platform__launching',
        link:           '.platform__link',
        figure:         '.platform__figure img',
        footer:         '.platform__footer',
        curr:           '.platform__current'
    };

    // Enum of Media Queries

    var MEDIAQ = {
        mobile:    '(max-width: 767px)',
        tablet:    '(min-width:768px) and (max-width:1024px)',
        desktopHD: '(min-width: 1200px)'
    };

    // Enum of Default Settings

    var DEFAULTS = {
        open:  { ease: Expo.easeInOut },
        close: { ease: Expo.easeInOut }
    };


    function Platform($el, config) {

        var that = this;

        this._$el = $el;
        this._id = $el.attr('id');
        this._index = index++;
        this.isOpen  = false;
        this.firstOpen = true;

        this._settings = $.extend(true, {}, DEFAULTS, config || {});

        this._definitionBox     = $el.find(SELECTORS.definition)[0];
        this._introduction      = $el.find(SELECTORS.introduction)[0];
        this._description       = $el.find(SELECTORS.description)[0];
        this._descriptionMore   = $el.find(SELECTORS.descriptionMore)[0];
        this._status            = $el.find(SELECTORS.status)[0];
        this._launching         = $el.find(SELECTORS.launchingDate)[0];
        this._link              = $el.find(SELECTORS.link)[0];
        this._figure            = $el.find(SELECTORS.figure)[0];
        this._name              = $el.find(SELECTORS.name)[0];
        this._footer            = $el.find(SELECTORS.footer)[0];
        this._type              = $el.attr('class').indexOf('current') !== -1 ? 'current' : 'coming';

        this.openTL;
        this.closeTL;

        // Add this instances to the List
        instances.push(this);

        // ********************* Custom events ***********************

        $el.bind('click', function() {

            // Wait till the boot phase has been finished
            if (!isBoot) return;

            view === 'mobile' ? that.openMobile() : that.open();

        });

        /*
         * When a platform was clicked it triggers a :close event to all the
         * other platforms.
         *
         * This event is triggered ONLY on Tablet and Desktop Views
         *
         * In the case of mobile devices, it is the 'openMobile' method that
         * handles the close action
         */

        $el.bind(':close', function(event, data) {

            that.close(data.reference);

            /*
             * When the current platform was previously clicked, we need to stop
             * its Timeline to prevent any further tween to take action
             */

            if (that.isOpen) {
                that.openTL.stop();
            }

            // Save the information
            that.isOpen = false;

        });
    }

    /*
     * It handles the open action on Tablet and Desktop Views
     */

    Platform.prototype.open = function() {

        var platform = this,
            id       = platform._id,
            type     = platform._type,
            settings = platform._settings;

        var otherPlatforms;

        /*
         * If this platform was previously clicked and it is currently open,
         * ignore the open event
         */

        if (this.isOpen) {
            return; // do nothing
        }

        otherPlatforms = instances.filter(function(item) {
            return item._index !== platform._index;
        });

        /*
         * Trigger the :close event that informs all the other platforms
         * After receiving this type of event, the receiving platform
         * closes immediately itself
         *
         * The event carries with it a reference to the opened platform
         *
         */

        otherPlatforms.forEach(function(item) {
            item._$el.trigger(':close', [{ reference: platform }]);
        });


        platform.openTL = new TimelineLite();

        platform.openTL.add(platform._setDefaultCursor());
        platform.openTL.add(TweenMax.to(platform._$el, 0.75, normalize(settings.open, id, type), 'openPlatform'), 0);


        if (view === 'tablet') {

            platform.openTL.add(platform._scalePlatformName());
            platform.openTL.add(platform._resetRotatePlatformName());
            platform.openTL.add(platform._resetFooterAlignCenter());

        } else {

            /*
             * Reset the properties only for previously 'closed' platforms
             * every time a platform is clicked, all the other platforms will be
             * closed (becoming a 'close' platform)
             */

            platform.openTL.add(platform._resetScalePicture(), 0.2);

            /*
             * When a platform is opened for the first time, change only its
             * state, otherwise reset the scale property previously applied to
             * the platform's name (logo text). This tween makes the effect that
             * the logo text is growing up
             */

            firstOpen ? (firstOpen = false) : platform.openTL.add(platform._resetScalePlatformName(), 0.3);

        }


        platform.openTL.add(platform._showDefinitionBox(), 0.3);
        platform.openTL.add(platform._showDescriptionMore(), 0.5);
        platform.openTL.add(platform._showDescription(), '+=1');
        platform.openTL.add(platform._showStatus());

        // When the platform contains a link, show it

        if (this._link) {
            platform.openTL.add(platform._showLink(), 1.5);
        }

        platform.openTL.add(platform._showLaunchingDate());

        // Save the information
        this.isOpen = true;
    };

    /*
     * It represents a dedicated method used to handle the 'open' action on
     * mobile devices.
     *
     * Since the mobile animation is different from the Desktop or Tablet ones,
     * this method handles the 'close' action too.
     * Indeed, in mobile mode, when a platform was clicked, the Application
     * first checks to see if the current opened platform is the same as
     * the clicked one (the click is twice). If this is true, it closes the
     * platform and stop any further action. Otherwise it looks for an open
     * platform and when it gets one, it closes the previous one and then opens
     * the wanted (currently clicked) platform.
     *
     */

    Platform.prototype.openMobile = function() {

        var platform = this,
            $el      = platform._$el;

        // When the active platform is the current one do nothing
        if (platform.isOpen) {
            return;
        }

         /*
          * On Mobile version, at the beginning pause the animation.
          * After that the box's animation has been completed, scroll the Window
          * at the top of the box
          */

        platform.openTL = new TimelineLite({
            paused: true,
            onComplete: function() {
                TweenMax.to(window, 1, {
                    scrollTo:{ y:$el.position().top - 20 },
                    ease: Expo.easeInOut});
            }
        });

        platform.openTL.add(platform._showDescription());
        platform.openTL.add(platform._showDescriptionMore());
        platform.openTL.add(platform._showStatus());

        platform.openTL.play();
        platform.isOpen = true;

    };

    /*
     * It handles the close action on Tablet and Desktop Views
     */

    Platform.prototype.close = function(refPlatform) {

        var platform = this,
            id       = refPlatform._id,
            type     = refPlatform._type,
            settings = platform._settings,
            options  = normalize(settings.close, id, type);

        platform.closeTL = new TimelineLite();


        if (view === 'tablet') {


            if (options.width === '15%') {
                platform.closeTL.add(platform._rotatePlatformName());
                platform.closeTL.add(platform._footerAlignCenter());
            } else if (options.height === '20%') {
                platform.closeTL.add(platform._resetRotatePlatformName());
                platform.closeTL.add(platform._resetFooterAlignCenter());
            }

        }


        platform.closeTL.add(TweenMax.to(platform._$el, 0.75, options, 'closePlatform'), '-=0.1');
        platform.closeTL.add(platform._scalePlatformName());

        if (platform._link) {
            platform.closeTL.add(platform._hideLink());
        }


        platform.closeTL.add(TweenMax.set(this._hideDefinitionBox()));
        platform.closeTL.add(TweenMax.set(this._hideDescriptionMore()));
        platform.closeTL.add(TweenMax.set(this._resetDefaultCursor()));
        platform.closeTL.add(TweenMax.set(this._hideIntroduction()));
        platform.closeTL.add(TweenMax.set(this._hideDescription()));
        platform.closeTL.add(TweenMax.set(this._scalePicture()));
        platform.closeTL.add(TweenMax.set(this._hideStatus()));
        platform.closeTL.add(TweenMax.set(this._hideLaunchingDate()));

    };

    Platform.prototype._hideIntroduction = function() {

        var tween = TweenMax.to(this._introduction, 1, {
            autoAlpha: 0,
            display: 'none',
            scaleY: 0,
            ease: Expo.easeInOut
        });

        return tween;
    };

    Platform.prototype._showIntroduction = function() {

        var tween = TweenMax.set(this._introduction, {
            autoAlpha: 1,
            clearProps:'display, scaleY'
        });

        return tween;
    };

    Platform.prototype._hideDefinitionBox = function() {

        var tween = TweenMax.to(this._definitionBox, 1, {
            autoAlpha: 0,
            display: 'none'
        });

        return tween;
    };

    Platform.prototype._showDefinitionBox = function() {

        var tween = TweenMax.to(this._definitionBox, 1, {
            display: 'block',
            autoAlpha: 1
        });

        return tween;
    };

    Platform.prototype._footerAlignCenter = function() {

        var tween = TweenMax.set(this._footer, {
            textAlign: 'center'
        });

        return tween;
    };

    Platform.prototype._resetFooterAlignCenter = function() {

        var tween = TweenMax.set(this._footer, {
            clearProps:'textAlign'
        });

        return tween;
    };

    Platform.prototype._scalePicture = function() {

        var tween = TweenMax.set(this._figure, {
            width: '32px'
        });

        return tween;
    };

    Platform.prototype._resetScalePicture = function() {

        var tween = TweenMax.to(this._figure, 0.05, {
            width:'42px'
        });

        return tween;
    };

    Platform.prototype._hideLink = function() {

        var tween = TweenMax.set(this._link, {
            display: 'none'
        });

        return tween;
    };

    Platform.prototype._showLink = function() {

        var tween = TweenMax.to(this._link, 0.3, {
            display: 'block',
            autoAlpha: 1
        });

        return tween;
    };

    Platform.prototype._hideDescription = function() {

        var tween = TweenMax.set(this._description, {
            display: 'none'
        });

        return tween;
    };

    Platform.prototype._showDescription = function() {

        var tween = TweenMax.set(this._description, {
            autoAlpha: 1,
            display: 'block'
        });

        return tween;
    };

    Platform.prototype._hideDescriptionMore = function() {

        var tween = TweenMax.set(this._descriptionMore, {
            autoAlpha: 0
        });

        return tween;
    };

    Platform.prototype._showDescriptionMore = function() {

        var tween = TweenMax.to(this._descriptionMore, 1.4, {
            autoAlpha: 1
        });

        return tween;
    };

    Platform.prototype._hideLaunchingDate = function() {

        var tween = TweenMax.set(this._launching, {
            autoAlpha: 0
        });

        return tween;
    };

    Platform.prototype._showLaunchingDate = function() {

        var tween = TweenMax.set(this._launching,{
            autoAlpha: 1,
            visibility:'visible'
        });

        return tween;
    };

    Platform.prototype._setDefaultCursor = function() {

        var tween = TweenMax.set(this._$el, {
            cursor: 'default'
        });

        return tween;
    };

    Platform.prototype._resetDefaultCursor = function() {

        var tween = TweenMax.set(this._$el, {
            clearProps:'cursor'
        });

        return tween;
    };

    Platform.prototype._removePaddingToPltName = function() {

        var tween = TweenMax.set(this._name, {
            paddingLeft: 'inherit'
        });

        return tween;
    };

    Platform.prototype._rotatePlatformName = function() {

        TweenMax.set(this._name, {
            autoAlpha:0
        });

        var tween = TweenMax.to(this._name, 0.1, {
            rotation:-90,
            transformOrigin:'left top',
            position: 'absolute',
            left: '38.5%',
            textAlign: 'left',
            autoAlpha: 1
        });

        return tween;

    };

    Platform.prototype._resetRotatePlatformName = function() {

        var tween = TweenMax.set(this._name, {
            clearProps:'rotation, transformOrigin, position, left, textAlign, marginTop'
        });

        return tween;

    };

    Platform.prototype._addPaddingToPltName = function() {

        var tween = TweenMax.set(this._name, {
            display: 'inline-block',
            paddingLeft: '0.25em'
        });

        return tween;
    };

    Platform.prototype._scalePlatformName = function() {

        var tween;

        if (view === 'tablet') {

            tween = TweenMax.set(this._name, {
                fontSize: '1.5em',
                paddingLeft: '0.5em'
            });

        } else {

            tween = TweenMax.set(this._name, {
                fontSize: '0.8em'
            });

        }

        return tween;
    };

    Platform.prototype._resetScalePlatformName = function() {

        var tween;

        if (view === 'tablet') {

            tween = TweenMax.to(this._name, 1, {
                clearProps: 'fontSize, paddingLeft'
            });

        } else {

            tween = TweenMax.to(this._name, 0.05, {
                fontSize: '1.5em'
            });

        }

        return tween;
    };

    Platform.prototype._showStatus = function() {

        var tween = TweenMax.set(this._status, {
            autoAlpha: 1,
            display: 'block'
        });

        return tween;
    };

    Platform.prototype._hideStatus = function() {

        var tween = TweenMax.set(this._status, {
            autoAlpha: 0,
            display: 'none'
        });

        return tween;
    };

    Platform.prototype.resetTimeLine = function(timeLine) {

        var tweens;

        if (!timeLine) {
            return;
        }

        tweens  = timeLine.getChildren();

        // Each tweened elements must be cleared
        tweens.forEach(function(element) {
            TweenMax.set(element.target, {
                clearProps: 'width, height, top, right, left, fontSize, display'
            });
        });
    };

    /*
     * This method is called when we want to reset the page layout by
     * removing all the previous animations
     */

    Platform.prototype.reset = function() {

        this._showIntroduction();

        if (this.isOpen) {
            this.resetTimeLine(this.openTL);
            this._hideStatus();
            this._hideDescription();
            this._hideDescriptionMore();
            this._showLaunchingDate();
            this.isOpen = false;
        } else {
            this.resetTimeLine(this.closeTL);
            this._showDefinitionBox();

            this._showLaunchingDate();
            this._resetRotatePlatformName();
            this._resetFooterAlignCenter();
        }
    };


    /*
     * Utility Function used to remove all the unnecessary objects from
     * the options provided to the TweenMax engine
     *
     * It preserves only the special 'ease' object
     */

    function normalize(parentObj, id, type) {

        var newObj = {},
            typeObj = parentObj[type] || void 0,
            idObj   = parentObj[id]   || void 0;

        var prop = void 0;

        // First it looks for the ID, then falls back to the TYPE,
        // otherwise there is no target

        var target = idObj || typeObj || {};


        // Loop through the parent object and if the current property is neither
        // an object nor the special 'ease' object, add it to the resulting obj

        for (prop in parentObj) {
            if (parentObj.hasOwnProperty(prop)) {

                // Skip objects different from ease

                if (typeof parentObj[prop] === 'object' && prop !== 'ease') {
                    break;
                }

                // if the target object has the same properties as its parent
                // maintains the target's properties

                if (target[prop]) {
                    newObj[prop] = target[prop];
                } else {
                    // The target obj doesn't have this property
                    // use the parent one

                    newObj[prop] = parentObj[prop];
                }
            }
        }

        // Copy the remainig properties (if any) from the target to the new obj

        for (prop in target) {
            if (!newObj[prop] && typeof target[prop] !== 'object') {
                newObj[prop] = target[prop];
            }
        }


        return newObj;

    }

    /*
     * Utility Function used to handle the resize window event
     * It calls the reset method on all the platforms only when the current
     * view has been changed with respect to the original one
     */

    function handleResize() {

        if (getCurrentView() !== view) {

            view = getCurrentView();

            instances.forEach(function(platform) {
                platform.reset();
            });

        }

    }

    // Set the current View type

    function getCurrentView() {

        var view;

        if (window.matchMedia(MEDIAQ.mobile).matches) {
            view = 'mobile';
        } else if (window.matchMedia(MEDIAQ.tablet).matches) {
            view = 'tablet';
        } else {
            view = 'desktop';
        }

        return view;
    }


    function init() {

        var logo       = $(SELECTORS.logo),
            pageFooter = $(SELECTORS.pageFooter);

        var learn, encyclopedia, know, qa, lab;

        var scene = new TimelineLite({
            onComplete:function(){
                isBoot = true;
            }});

        view = getCurrentView();

        learn = new Platform($(SELECTORS.learn), {
            open: {
                height: '100%',
                width: '51%'
            },
            close: {
                height: '100%',
                width: '15%'
            }
        });

        encyclopedia = new Platform($(SELECTORS.encyclopedia), {
            open: {
                height: '100%',
                width: '51%',
                left: '16.33333%',
            },
            close: {
                height: '100%',
                width: '15%',
                left: '16.33333%',
                current: {
                    left: '52.333333%',
                }
            }
        });

        know  = new Platform($(SELECTORS.know), {
            open: {
                height: '77%',
                width: '51%',
                right: '15%'
            },
            close: {
                height: '77%',
                width: '15%',
                right: '15%',
                qa: {
                    right: '51%'
                },
                lab: {
                    height: '20%',
                    width: '33.033335%',
                    right: '33%'
                }
            }
        });

        qa = new Platform($(SELECTORS.qa), {
            open: {
                height: '77%',
                width: '51%'
            },
            close: {
                width: '15%',
                height: '77%',
                lab: {
                    height: '20%',
                    width: '33.033335%'
                }
            }
        });

        lab = new Platform($(SELECTORS.lab), {
            open: {
                top: (view === 'tablet') ? '22%' : '23.1%',
                height: (view === 'tablet') ? '77.9%' : '76.7%',
                width: '67.4%'
            },
            close: {
                width: '67.4%',
                top: (view === 'tablet') ? '79%' : '80%',
                height: (view === 'tablet') ? '21%' : '20%',
                current: {
                    width: '31.33333%'
                }
            }
        });

        /*
         * Definition of the initial animation
         */

        scene.add(TweenMax.from(logo, 2.5, {
            autoAlpha:0
        }), 0);

        scene.add(TweenMax.from(pageFooter, 1, {
            autoAlpha:0
        }), 0.5);

        scene.add(TweenMax.staggerFrom([learn._$el, encyclopedia._$el], 1.3, {
            autoAlpha:0,
            x: '+250px',
            ease: Expo.easeOut
        }, 0.1), 0.1);


        scene.add(TweenMax.staggerFrom([know._$el, qa._$el], 1.3, {
            autoAlpha:0,
            y: '+250px',
            ease: Expo.easeOut
        }, 0.1), 0.3);


        scene.add(TweenMax.from(lab._$el, 1.3, {
            autoAlpha:0,
            y: '-100px',
            ease: Expo.easeOut
        }), 0.650);

    }

    // public API

    return {
        init: init,
        handleResize: handleResize
    };

})(window);




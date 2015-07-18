var deviceMenu;
//FastClick.attach(document.body);
$(function(){
  //initPointerEventsDisabler();
  checkMobile();
  preventDefaultMenu();
  initModules('global-layout');

  TweenLite.ticker.useRAF(true);
});


var NP = {
  start: function(){
  },
  stop: function(){
  }
};

__module('global-layout', function(module){
  var baseFontSize = 12;

  function updateFontSize() {
    fastdom.read(function(){
      var height = getViewport().height;
      var width = getViewport().width;
      var fontSize = baseFontSize

      if (width>=642) fontSize = 12;
      if (641>=width && width>580) {
        fontSize = 12.8 + (width-320)/((640-320)/3.5)
      }
      if (580>=width && width>460) {
        fontSize = 10.8 + (width-320)/((640-320)/3.5)
      }
      if (460>=width && width>=320) {
        fontSize = 8 + (width-320)/((640-320)/3.5)
      }
      if(width < 320){
        fontSize = 8;
      }

    var layoutClassName = width/height>1?'landscape':'portrait';
    fastdom.write(function(){
      module
        .css({ fontSize:fontSize })
        .removeClass('landscape portrait')
        .addClass(layoutClassName);
      });
    })
  }

  var width = getViewport().width;
  updateFontSize();

  $(window).resize(_.debounce(function(){
    var _width = getViewport().width;
    if (width === _width) return;
    width = _width;

    updateFontSize();
  }, 200))
});


var iScrollHelpers = {
  setup_slides_width : function(selector, w){
    $(selector).width(w);
  },
  fix_slides_sizes : function(selector){
    //$(selector).each(fix_slide_items_sizes);
  },
  slider_width : function(selector){
    return $(selector).width();
  },
  setup_slider_pane_width : function(selector, w, size){
    $(selector).width(w*size);
  },
  setup_common_width : function(selector, w){
    $(selector).width(w);
  }
};



function initCategoryAnimation() {
    function initHover(self) {
      var tl = new TimelineMax(),
          hover = self.find('.store-cat__hover'),
          btn = self.find('.store-cat__btn'),
          btnWrap = self.find('.store-cat__btn-wrapper'),
          quantity = self.find('.store-cat__quantity')

      tl.timeScale(10);
      tl.stop();
      tl.to(hover, 3.5, { startAt:{ opacity:1, scaleY:0, transformOrigin:"50% 100%" }, scaleY:1, force3D: true, immediateRender:true, ease:Power2.easeInOut }, 0);
      tl.to(quantity,3, { startAt:{opacity:1}, opacity:0, force3D: true, immediateRender:true, ease:Power2.easeInOut }, 0);
      tl.to(btnWrap, 1, { startAt:{ opacity:0, y:10 }, opacity:1, y:0, force3D: true, immediateRender:false, ease:Power2.ease }, 1.5);
      tl.to(btn, 1, { startAt:{ y:10 }, y:0, force3D: true, immediateRender:false, ease:Power2.ease }, 1.5);
      return tl;
    }

    function initClick(self) {
      var cat = self,
          btn = cat.find('.store-cat__btn'),
          btnWrap = self.find('.store-cat__btn-wrapper'),
          tl = new TimelineMax({onStart : function(){cat.addClass('active'); btn.addClass('opacity'); },
                                onReverseComplete : function(){
                                  cat.removeClass('active'); cat.removeClass('inprogress'); btn.removeClass('opacity');
                                  cat.css('height', 'auto');
                                }
                              }),
          cat = self.closest('.store-cat'),
          click = cat.find('.store-cat__click'),
          btnMore = cat.find('.store-cat__btn-more'),
          btnClose = cat.find('.store-cat__btn-close'),
          groupColumn = cat.find('.store-cat__group-column'),
          btnIcons = cat.find('.store-cat__btn-icons'),
          iconLine1 = cat.find('.store-cat__icon-line_1'),
          iconLine2 = cat.find('.store-cat__icon-line_2'),
          groupColumnHeight = groupColumn.outerHeight();

      tl.timeScale(10);
      tl.stop();

      var catHeight = 0;
      if (getViewport().width  > 1007) catHeight = 200;
      if (getViewport().width <= 765) catHeight = 160;

      tl.to(btnIcons, 3, { startAt:{rotationZ:180, transformOrigin:"50% 50%"}, rotationZ:360, force3D: true, transformOrigin:"50% 50%", immediateRender:true, ease:Power2.easeInOut }, 0);
      tl.to(click,5, {startAt:{transformOrigin:"50% 50%", scaleY:0, opacity:1}, scaleY:3, force3D:true, immediateRender:false, ease:Power2.easeInOut}, 0);
      tl.to(groupColumn,4,{autoAlpha:1,force3D:true, immediateRender:false, ease:Power2.easeInOut},0);
      tl.to(cat, 5, { css:{height: catHeight + groupColumnHeight + 'px' }, force3D:true, immediateRender:false, ease:Power2.easeInOut}, 0);
      tl.to(btnMore, 3, {startAt:{opacity:1}, opacity:0, force3D:true, immediateRender:false,ease:Power2.easeInOut }, 0);
      tl.to(btnClose,3,{startAt:{opacity:0, x:50}, opacity:1, x : 0, force3D:true,immediateRender:true,ease:Power2.easeInOut }, 3);
      return tl;
    }


    // каклбэки, управляющие анимацией
    if (layoutState!=='mobile')
      $("[data-hover='category']")
        .mouseenter(function() {
          var self = $(this);
          var tlHover = self.data('timeline-hover');
          if (!tlHover) self.data('timeline-hover', tlHover = initHover(self))
          tlHover.play();
        })

        .mouseleave(function() {
          var self = $(this);
          var tlHover = self.data('timeline-hover');
          if (!tlHover) self.data('timeline-hover', tlHover = initHover(self))

          if(!self.hasClass('active') || self.hasClass('inprogress')){
            tlHover.reverse();
          }
        })

        .click(function(e) {
          var self = $(this);
          var active = $("[data-hover='category'].active");
          console.log('active', active)
          var isBtn = $(e.target).closest('.store-cat__btn').length;

          var tlClick = self.data('timeline-click');
          var tlHover = self.data('timeline-hover');
          if (!tlClick) self.data('timeline-click', tlClick = initClick(self))
          if (!tlHover) self.data('timeline-hover', tlHover = initHover(self))


          if (active.length) {
            window.activeCategoryStore = active;
            hideActive();
            if (active[0] === this) {
              self.removeClass('active');
              return;
            }
          }

          if (_isMobile) {
            tlClick.progress(.99)
            tlHover.progress(.99)
          }
          tlClick.play();
          tlHover.play();
        });

  function hideActive(){
    var active = $("[data-hover='category'].active");
    if(!active.length) return;
    active.removeClass('active');
    var tlClick = active.data('timeline-click');
    var tlHover = active.data('timeline-hover');
    if (!tlClick) active.data('timeline-click', tlClick = initClick(active))
    if (!tlHover) active.data('timeline-hover', tlHover = initHover(active))

    if (tlClick && _isMobile) tlClick.progress(.001)
    if (tlHover && _isMobile) tlHover.progress(.001)
    if (tlClick) tlClick.reverse()
    if (tlHover) tlHover.reverse()
  }

  var prevWidth;
  $(window).resize(_.debounce(function(){
    var width = getViewport().width;
    if (width == prevWidth) return;
    prevWidth = width;
    reInit();
  }, 500));


  function reInit(){
    hideActive();
    $("[data-hover='category']").each(function(){
      $(this).data('timeline-click', false);
      $(this).data('timeline-hover', false);
    });
  }

  return {
    reInit : reInit
  }

}

function preventDefaultMenu(){
  $('.nav .nav__link, .nav .nav__logo, .nav').click(function(e){
    e.preventDefault();
  });
}

function checkMobile(){
  if(_isMobile) $('body').addClass('isMobile');
  if(_isSafari) $('body').addClass('isSafari');
}

function initFotorama(){
var config = { width: '100%',
    fit: 'cover',
    nav: 'thumbs',
    arrows: true,
    thumbwidth: 104,
    thumbheight: 50,
    thumbmargin: 1,
    thumbborderwidth : 0,
    loop: true,
    allowfullscreen : true
  };
  $('.fotorama').fotorama(config);
}

function initGalleryFotorama(){

var config = window.fotoramaDefaults = { width: '100%',
    fit: 'cover',
    nav: 'thumbs',
    arrows: true,
    thumbwidth: 104,
    thumbheight: 50,
    thumbmargin: 1,
    thumbborderwidth : 0,
    loop: true,
    height : '548px',
    allowfullscreen : true
  };

  $('.fotorama').fotorama(config);
}

function initStoreDropDown(){

  var configAnimation = {
    header : {
      'desktop' : 70,
      'tablet' : 60,
      'mobile' : 60
    },
    offset : {
      'desktop' : 90,
      'tablet' : 60,
      'mobile' : 60
    },
    paddingTop : {
      'desktop' : 80,
      'tablet' : 50,
      'mobile' : 50
    },
    paddingBottom : {
      'desktop' : 78,
      'tablet' : 48,
      'mobile' : 48
    },
  }

  function initTimeline(){
    var self = $('.inner-page-line__stores'),
        arrow = $('.inner-page-line__stores-arrow'),
        dropDown = $('.dropdown_stores'),
        bg = $('.dropdown_stores').find('.dropdown__bg'),
        scrollbar = $('.dropdown_stores').find('.scrollbar');
        group = $('.dropdown_stores').find('.dropdown__group-column'),
        tl = new TimelineMax({onStart:function(){self.toggleClass('inner-page-line__stores_active');},onReverseComplete:function(){self.toggleClass('inner-page-line__stores_active');} });
        tl.to(arrow, 0.3, { startAt:{ transformOrigin:"50% 50%" }, rotation:"180_cw", force3D: true, immediateRender:true, ease:Power2.easeInOut }, 0);
        tl.to(dropDown, 0.3, { startAt:{ css:{visibility:'hidden' } }, css : { visibility:'visible'}, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0);

        tl.to(scrollbar, 0.3, { startAt:{ opacity : 0 }, opacity : 1, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0.3);

        tl.to(bg, 0.3, { startAt : {transformOrigin:"50% 0%", scaleY:0}, scaleY : 1, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0);
        tl.to(group, 0.3, { startAt : {opacity : 0}, opacity : 1, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0.2);
        return tl;

  }

  $('.inner-page-line__stores').click(function(e){
    var self = $(this);
    var tl = self.data('timeline');
    var dropdown = $('.dropdown_stores');

    if($('.category-btn').hasClass('active')){
      $('.category-btn').removeClass('active');
    }

    $(window).on('resize.dropdownscroll scroll.dropdownscroll', function(){
      function handler(){
        var maxsize = getViewport().height - configAnimation.offset[layoutState];
        var menusize = configAnimation.header[layoutState] - $(window).scrollTop();
        if (menusize<0) menusize = 0;
        maxsize = maxsize-menusize;

        var cols = dropdown.find('.dropdown__column');
        var maxcolsize = Math.max(
            $(cols[0]).height(),
            cols[1]?$(cols[1]).height():0,
            cols[2]?$(cols[2]).height():0
          );
        maxcolsize = maxcolsize + configAnimation.paddingTop[layoutState] + configAnimation.paddingBottom[layoutState];

        var boxsize = Math.min(maxsize, maxcolsize);
        dropdown.find('.viewport').height(boxsize);
        dropdown.height(boxsize);
        if (dropdown.data("plugin_tinyscrollbar"))
          dropdown.data("plugin_tinyscrollbar").update()

        dropdown[maxcolsize>maxsize?'removeClass':'addClass']('removescroll')
      }

      handler();
      return handler;
    }());
    dropdown.on('colsresized', function(){
      $(window).trigger('resize.dropdownscroll')
    })

    if(!tl) self.data('timeline', tl = initTimeline() );


    if( $('.category-btn').hasClass('category-btn_active') ){
      $('.category-btn').data('timeline').reverse();
      setTimeout(function(){
        tl.play();
      },700);
      return;
    }
    if( self.hasClass('inner-page-line__stores_active') ){
      tl.reverse();
      $(window).off('resize.dropdownscroll scroll.dropdownscroll');
    }
    else{
      tl.play();

        if( !self.hasClass('inner-page-line__stores_active') ){
          setTimeout(function(){
              $(".dropdown_stores").tinyscrollbar({scrollInvert : true});
          },500);
        }


    }
  });
}


function initRadio(){
  $('.radio-group').each(function(){
    $(this).find('.radio__label').first().addClass('checked');
  });
  $('.radio__label').click(function(){
      var self = $(this);
      self.closest('.radio-group').find('label').removeClass('checked');
      self.addClass('checked');
  });

}

function initFitVids(){
  $('.store,.news').fitVids();
}



  function initCategoryDropDown(){
    function initCssAnimation(){

      $('.category-btn').click(function(){

        $(this).toggleClass('active');
      });
    }
    initCssAnimation();
    function initTimeline(){
      var self = $('.category-btn'),
          dropDown = $('.dropdown_category'),
          bg = dropDown.find('.dropdown__bg'),
          group = dropDown.find('.dropdown__group-column'),
          tl = new TimelineMax({onStart:function(){self.toggleClass('category-btn_active');},onReverseComplete:function(){self.toggleClass('category-btn_active');} });

          tl.to(dropDown, 0.3, { startAt:{ css:{visibility:'hidden' } }, css : { visibility:'visible'}, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0);
          tl.to(bg, 0.3, { startAt : {transformOrigin:"50% 0%", scaleY:0}, scaleY : 1, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0);
          tl.to(group, 0.3, { startAt : {opacity : 0}, opacity : 1, force3D: true, immediateRender:true, ease:Power2.easeInOut  }, 0.2);

          return tl;
    }


    if( $('.dropdown_category').hasClass('dropdown_contactsus') ){


       $('.dropdown__link').click(function(e){
          $('.category-btn').click();
       });

    }


    $('.category-btn').click(function(e){
      var self = $(this);
      var tl = self.data('timeline');
      if(!tl) self.data('timeline', tl = initTimeline() );

      if( $('.inner-page-line__stores').hasClass('inner-page-line__stores_active') ){
        $('.inner-page-line__stores').data('timeline').reverse();
        setTimeout(function(){
          tl.play();

        },700);
        return;
      }
      if( self.hasClass('category-btn_active') ){
        tl.reverse();
      }
      else{
        tl.play();
      }
    });
  }

var controllerScrollMagic;
function resetMainPageAnimation(){
  if(controllerScrollMagic){
    controllerScrollMagic  =  controllerScrollMagic.destroy(true);
  }
}

function mainPageAnimation(){
    // Закоментил анимацию на главной
    //return;

    if(_isMobile){
      return;
    }

    controllerScrollMagic = new ScrollMagic();

    (function(){
      var tl = new TimelineMax();
      var el = $('[data-hover=about]');
      tl.timeScale(3);
      tl.to(el[0], 2, {
        startAt:{ scale:.8, autoAlpha:0, transformOrigin:'50% 90%', transformPerspective:800 },
        scale:1, autoAlpha:1, immediateRender:true, force3D:true, ease:Power3.easeOut,
        onStart : function(){
          var tween = new TweenMax($(el[0]).find('.about-block__images'), 4, { startAt:{ scale:1.1 }, scale:1, immediateRender:true, force3D:true, ease:Power4.easeOut });
          $(el[0]).data('scaleTween', tween)
        }
      }, 0);
      tl.to(el[1], 1.5, {
        startAt:{ scale:.8, autoAlpha:0, transformOrigin:'50% 90%', transformPerspective:800 },
        scale:1, autoAlpha:1, immediateRender:true, force3D:true, ease:Power3.easeOut,
        onStart : function(){
          var tween = new TweenMax($(el[1]).find('.about-block__images'), 3.5, { startAt:{ scale:1.1 }, scale:1, immediateRender:true, force3D:true, ease:Power4.easeOut });
          $(el[1]).data('scaleTween', tween)
        }
      }, .3);
      tl.to(el[2], 1, {
        startAt:{ scale:.8, autoAlpha:0, transformOrigin:'50% 90%', transformPerspective:800 },
        scale:1, autoAlpha:1, immediateRender:true, force3D:true, ease:Power3.easeOut,
        onStart : function(){
          var tween = new TweenMax($(el[2]).find('.about-block__images'), 3, { startAt:{ scale:1.1 }, scale:1, immediateRender:true, force3D:true, ease:Power4.easeOut });
          $(el[2]).data('scaleTween', tween)
        }
      }, .5);
      var scene = new ScrollScene({
          triggerElement: $('#about'),
          triggerHook : 0
        });
      scene.offset(getViewport().height/-2)
      scene.setTween(tl)
      scene.addTo(controllerScrollMagic);
    })();

    // Catalog
    $('.store-cat').each(function(){
      var tl = new TimelineMax();
      tl.to(this, 1, { startAt:{ rotationX:-45, transformOrigin:'50% 0%', transformPerspective:800 }, rotationX:0, immediateRender:true, force3D:true, ease:Power2.easeOut }, 0);
      var scene = new ScrollScene({
          triggerElement: this,
          triggerHook : "1"
        });
      scene.setTween(tl)
      scene.addTo(controllerScrollMagic);
    });

    // Map
    (function(){
      var tl = new TimelineMax();
      tl.to('body > .background', 1, { startAt:{ yPercent:0 }, yPercent:-25, immediateRender:true, force3D:true, ease:Power2.easeOut }, 0);
      var scene = new ScrollScene({
          triggerElement: '#map',
          triggerHook : 0.1,
          offset : -getViewport().height
        });
      scene.duration(function(){ return getViewport().height*3; })
      scene.setTween(tl)
      scene.addTo(controllerScrollMagic);
    })();

    // Application
    (function(){
      var scene = new ScrollScene({
          triggerElement: $('#card'),
          triggerHook : .1
        });
      var tl = new TimelineMax();
      tl.timeScale(15)
      tl.to('.main-card__hand', 2, { startAt:{ autoAlpha:0 }, autoAlpha:1, immediateRender:true, force3D:true, ease:Power3.easeOut }, 0);
      tl.to('.main-card__hand', 10, { startAt:{ yPercent:30 }, yPercent:0, immediateRender:true, force3D:true, ease:Power3.easeOut }, 0);
      scene.setTween(tl)
      scene.offset(getViewport().height/-2)
      scene.addTo(controllerScrollMagic);
    })();
}

function initInnerNavNext(){

    var btn = $('.inner-nav-btn_next'),
        hover = btn.find('.inner-nav-btn__hover'),
        line = btn.find('.inner-nav-btn__line'),
        text = btn.find('.inner-nav-btn__text'),
        arrow = btn.find('.inner-nav-btn__arrow'),
        arrowActive = btn.find('.inner-nav-btn__arrow-active'),
        tl = new TimelineMax();
        tl.to(arrow,0.2,{startAt:{opacity:1}, opacity:0,force3D:true,immediateRender:true});
        tl.to(arrowActive,0.2,{startAt:{opacity:0}, opacity:1,force3D:true,immediateRender:true},0);
        tl.set(hover,{opacity:1});
        tl.to(hover, 0.4, {startAt:{scaleX:0, transformOrigin : "center right"}, scaleX:1, force3D:true,immediateRender:true,ease:Power2.easeInOut });
        tl.to(line, 0.2, {startAt:{opacity:0}, opacity:1, force3D:true,immediateRender:true },0.4);
        tl.to(text, 0.2, {startAt:{opacity:0}, opacity:1, force3D:true,immediateRender:true },0.4);
        tl.stop();
        $(btn).mouseenter(function(){
            if(layoutState == 'desktop'){
              tl.play();
            }
        });
        $(btn).mouseleave(function(){
            if(layoutState == 'desktop'){
              tl.reverse();
            }
        })
}


function initInnerNavPrev(){
    var btn = $('.inner-nav-btn_prev'),
        hover = btn.find('.inner-nav-btn__hover'),
        line = btn.find('.inner-nav-btn__line'),
        text = btn.find('.inner-nav-btn__text'),
        arrow = btn.find('.inner-nav-btn__arrow'),
        arrowActive = btn.find('.inner-nav-btn__arrow-active'),
        tl = new TimelineMax();
        tl.to(arrow,0.2,{startAt:{opacity:1}, opacity:0,force3D:true,immediateRender:true});
        tl.to(arrowActive,0.2,{startAt:{opacity:0}, opacity:1,force3D:true,immediateRender:true},0);
        tl.set(hover,{opacity:1});
        tl.to(hover, 0.4, {startAt:{scaleX:0, transformOrigin : "center left"}, scaleX:1, force3D:true,immediateRender:true,ease:Power2.easeInOut });
        tl.to(line, 0.2, {startAt:{opacity:0}, opacity:1, force3D:true,immediateRender:true },0.4);
        tl.to(text, 0.2, {startAt:{opacity:0}, opacity:1, force3D:true,immediateRender:true },0.4);
        tl.stop();
        $(btn).mouseenter(function(){
            if(layoutState == 'desktop'){
              tl.play();
            }
        });
        $(btn).mouseleave(function(){
            if(layoutState == 'desktop'){
              tl.reverse();
            }
        })
}

function destroyNavLogo(){
  $('.main-about').waypoint('destroy');
}


function hideMainLoader(){
  var loader = $('.loader_main');
  TweenMax.to(loader, 0.5, {startAt:{opacity:1,autoAlpha:1}, autoAlpha:0, opacity : 0, force3D : true, immediateRender:true,ease:Power2.easeInOut});

}

function showMainLoader(){
  var loader = $('.loader_main');
  TweenMax.to(loader, 0.5, {startAt:{opacity:0,autoAlpha:0}, autoAlpha:1, opacity : 1, force3D : true, immediateRender:true,ease:Power2.easeInOut});
}


function replaceFooterContactsToHandheld(){

  var elems = $('.contacts-info .contacts-info__item'),
      first  = elems.eq(0),
      third  = elems.eq(2),
      second = elems.eq(1);

      first.insertAfter(third);
}

function replaceFooterContactsToDesktop(){
  var elems = $('.contacts-info .contacts-info__item'),
      first  = elems.eq(0),
      third  = elems.eq(2),
      second = elems.eq(1);

      third.insertBefore(first);
}

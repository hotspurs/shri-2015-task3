(function(){
	console.log('Loaded');
})();



__module('nav-sticky', function(module){
  var win = $(window);
  var header = module.find('.nav:not(.nav_fixed)');
  var stickyHeader = module.find('.nav_fixed').show();
  var offsetTop = header.offset().top;

  TweenMax.set(stickyHeader, { y:-200, force3D:true })

  var isFixed;
  var handler = throttleByKeyFrame(function(){
    if (pageState !== 'main') return;
    if (layoutState !== 'desktop') return;
    var scrollTop = win.scrollTop();

    _isFixed = false;
    if (scrollTop >= offsetTop) _isFixed = true;
    if (scrollTop<0) _isFixed = false; // ios overscroll

    if (_isFixed === isFixed) return;
    isFixed = _isFixed;

    if (isFixed) {
      TweenMax.set(stickyHeader, { y:0, force3D:true })
    } else {
      TweenMax.set(stickyHeader, { y:-200, force3D:true })
    }
  })
  handler();

  $('body').on('pagechange', function(){
    if (pageState == 'main') {
      handler();
    } else {
      TweenMax.set(stickyHeader, { y:-200, force3D:true })
    }
  })

  win.on('scroll touchmove', handler);
})


function throttleByKeyFrame(fn) {
  var raf;
  return function throttleByKeyFrameThrottler(){
    var args = arguments;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function throttleByKeyFrameHandler(){
      fn.apply(args);
    });
  }
}
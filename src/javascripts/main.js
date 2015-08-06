modules.require(
    ['i-bem__dom_init', 'jquery', 'next-tick'],
    function(init, $, nextTick) {

    $(function() {
        nextTick(init);
    });
});

(function(){

"use strict";

//workaround to chrome making users directly inject their js/css files into the html (firefox doesn't like that)
$('body').load('options.html', function() {
    if (document.readyState === 'complete') {
        initialize();
    } else {
        $(document).ready(initialize);
    }
});

}());
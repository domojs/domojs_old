route.on('settings', function(url, params, unchanged){
    $.ajax(loadHtml('settings', $.noop));
});

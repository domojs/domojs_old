route.on('scenarii*', function(url, params, unchanged){
    if(unchanged)
        loadFile('/api/explorer'+params.wildcard);
    else
        $.ajax(loadHtml('scenarii', function(){
            loadFile('/api/explorer'+params.wildcard);
        }));
});

route.on('scenarii', function(url, params, unchanged){
    $.ajax(loadHtml('scenarii', function(){
    }));
});

route.on('epg', function(url, params, unchanged){
    $.ajax(loadHtml('epg', function(){
        page.init();
    }));
});

route.on('epg/*', function(url, params, unchanged){
    $.ajax(loadHtml('epg', function(){
        page.init(params.wildcard);
    }));
});

route.on('shopping', function(url, params, unchanged){
    $.ajax(loadHtml('shopping', function(){
    }));
});

route.on('settings', function(url, params, unchanged){
    $.ajax(loadHtml('settings', $.noop));
});

route.on('recipe', function(url, params, unchanged){
    $.ajax(loadHtml('recipe', function(){
        page.init();
    }));
});

route.on('recipe/*', function(url, params, unchanged){
    $.ajax(loadHtml('recipe', function(){
        page.loadRecipe(params.wildcard);
    }));
});

route.on('chat', function(url, params, unchanged){
    $.ajax(loadHtml('chat', function(){
    }));
});

route.on('edit/*', function(url, params, unchanged){
        $.ajax(loadHtml('edit', function(){
            loadJson(params.wildcard);
        }));
});

route.on('events/register', function(url, params, unchanged){
        $.ajax(loadHtml('events/register', function(){
        }));
});

route.on('config/logs', function(url, params, unchanged){
        $.ajax(loadHtml('config/logs', function(){
            loadJson(params.wildcard);
        }));
});

route.on('leaving', function(){
    $('.fixedHeader').remove();
})
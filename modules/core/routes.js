route.on('leaving', function(){
    if(page && page.leaving)
        page.leaving();
});
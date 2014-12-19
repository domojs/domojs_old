route.on('leaving', function(){
    if(page.leaving)
        page.leaving();
});
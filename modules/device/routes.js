route.on('device', function(url, params, unchanged){
    $.ajax(loadJsonFromUrl('/device')).done(function(){page.addCommand({name:'Nouveau', url:'#device/_new'})}); 
});

route.on('device/category/{category}', function(url, params)
{
    $.ajax(loadJsonFromUrl('/device/category/'+params.category));
});

route.on('device/_new', function()
{
   $.ajax(loadHtml('/device/_new', function(){
       
   })); 
});

route.on('device/{device}', function(url, params)
{
    $.ajax(loadJsonFromUrl('/device/index/'+params.device));
});
var getInfo=function(callback)
{
	var position=$.settings('position');
		$.getJSON('http://api.wunderground.com/api/eff76d6447a195e1/geolookup/conditions/lang:FR/q/'+position.latitude+','+position.longitude+'.json', callback);
	
};

module.exports={
	restart:function(callback){
		process.exit();
	}
}
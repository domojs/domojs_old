var getInfo=function(callback)
{
	var position=$.settings('position');
		$.getJSON('http://api.wunderground.com/api/eff76d6447a195e1/geolookup/conditions/lang:FR/q/'+position.latitude+','+position.longitude+'.json', callback);
	
};

module.exports={
	get:function(callback){
		getInfo(callback);
	},
	temperature:function(callback){
		getInfo(function(data){
			callback({celsius:data.current_observation.temp_c, fahrenheit:data.current_observation.temp_f});
		});
	}
}
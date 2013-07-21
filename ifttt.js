function that(fields, trigger)
{
	var params={};
	$.each(fields, function(){
		params[this]=$('router/formatter.js')(this)(trigger.fields);
	});
	this.delegate(params);
}

var trigger=$('./modules/date.js').triggers[0].delegate({hour:20,minute:15});

(function loop()
{
	var raiser=new EventEmitter();
	raiser.on('trigger', that);
	trigger(raiser);

	process.nextTick(loop);
})();
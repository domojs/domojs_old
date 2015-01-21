var EventEmitter=$('events').EventEmitter;

var settings={};

var doNotWrite=false;

var emitter=function(name, value)
{
	if(name.indexOf('.')>0)
	{
		var firstName=name.substring(0,name.indexOf('.'));
		if(typeof(settings[firstName])=='undefined')
			settings[firstName]={};
		if(typeof(value)=='undefined')
			return settings[firstName][name.substring(firstName.length+1)];
		settings[firstName][name.substring(firstName.length+1)]=value;
		emitter.emit(firstName, settings[firstName]);
	}
	else if(typeof(value)=='undefined')
		return settings[name];
	else
		settings[name]=value;
    console.log('updated settings');
    console.log(settings);
	emitter.emit(name, value);
	if(!doNotWrite)
	    $('fs').writeFileSync('./settings.json', JSON.stringify(settings));
};

$.extend(emitter,new EventEmitter());

$.settings=emitter;

emitter.all=settings;

exports.init=function(config, app)
{
	if($('fs').existsSync('./settings.json'))
	{
	    doNotWrite=true;
		data=$('fs').readFileSync('./settings.json');
	    doNotWrite=false;
		emitter.all=settings=JSON.parse(data);
		if(config)
			$.each(config, emitter);
	}
};

module.exports={
	index:function(){
		return this.view($.settings.all);
	},
	post:function(body){
		var settings={};
		$.each(body, function(name, value){
			if(name.indexOf('.')>0)
			{
				var firstName=name.substring(0,name.indexOf('.'));
				if(typeof(settings[firstName])=='undefined' && name.substring(firstName.length+1)!='0')
					settings[firstName]={};
				else if (name.substring(firstName.length+1)=='0')
				    settings[firstName]=[];
				settings[firstName][name.substring(firstName.length+1)]=value;
			}
			else
				settings[name]=value;
		});
		$.each(settings, $.settings);
		return this.view($.settings.all);
	}
}
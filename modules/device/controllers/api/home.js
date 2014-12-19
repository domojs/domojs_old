module.exports={
    add:function(body, callback)
    {
        var device={name:body.name, type:body.type, category:body.category, commands:{}};
        $.ajax({url:{hostname:'localhost', protocol:'http', port:global.port, pathname:'/js/device.js'}, success:function(data)
        {
            var deviceTypes={};
            $('vm').runInContext(data, $('vm').createContext({$:$, deviceTypes:deviceTypes, console:{log:console.log}}), 'js/device.js'); 
            if(typeof(deviceTypes[device.type])!='undefined' && typeof(deviceTypes[device.type].onServerSave)!='undefined')
                deviceTypes[device.type].onServerSave(device, body);
            $.device(device, body);
            callback(200);
        }});
    },
	get:function(id, cmd, status, callback)
	{
		if(typeof(id)=='undefined')
			callback($.map($.device(), function(item,index){ return {name:index, length:item.length,url:"/api/device/category/"+index} }));
		else
		{
			var device=$.map($.device(),function(item){ var devices=$.grep(item, function(dev){ return dev.name==id;}); if(devices.length>0) return devices[0]; })[0];
			if(!device)
				return callback(404);
			if(typeof(cmd)!='undefined')
			{
				var command=device.commands[cmd];
				return command.call(this, callback);
			}
			else if(typeof(status)!='undefined' && typeof(device.status)!='undefined')
				return device.status(function(s){
				    console.log(s);
				    if(s && s.state && !s.color)
				        s.color=s.state==status?'green':'red';
					if(s && typeof(s[status])!='undefined')
						return callback(s[status]);
					else
						return callback(s);
				});
			else
			{
				var subdevices=$.map(device.subdevices || [], function(item, index)
				{
					return {name:id+'.'+item.name, type:'device', url:'/api/device/'+id+'.'+item.name};
				});
				var commands=$.map(device.commands || {}, function(item, index)
				{
					return {name:index, type:'command', cmd:'/api/device/'+device.name+'?cmd='+index};
				});

				callback(subdevices.concat(commands));
			}
		}
	},
	category:function(id, callback)
	{
		callback($.map($.device()[id],function(item){
			return {name:item.name, length:(item.commands && Object.keys(item.commands).length || 0)+(item.subdevices && item.subdevices.length || 0), url:'/api/device/'+item.name};
		}));
	}
};


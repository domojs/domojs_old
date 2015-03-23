devices={};
var savedDevices=[];
var initializing=true;

exports.init=function(config){
    if(config)
        $.each(config, function(index,item){
            register($(index).device(item));
        });
    $('fs').exists('./modules/device/devices.json', function(exists){
      if(!exists)  
        {
            console.log('could not find file devices.json')
            return ;
        }
        console.log('loading devices');
        savedDevices=require('./devices.json');
        $.eachAsync(savedDevices, function(index,item, next){
            require('./controllers/api/home.js').add(item, next);
        }, function(){
            initializing=false;
        });
    });
};

$.device=function register(device, body)
{
	if(typeof(device)=='undefined')
		return devices;
    if(typeof(devices[device.type])=='undefined')
        Object.defineProperty(devices, device.type, {configurable:false, enumerable:device.type.indexOf('.')!==0, writable:false, value:[]});
    devices[device.type].push(device);
    device.remove=function(){
        var indexOfThis=devices[device.type].indexOf(this);
        devices[device.type].splice(indexOfThis, 1);
    };
    switch(device.type)
    {
        case 'switch':
            if(typeof(device.commands.toggle)=='undefined' && typeof(device.status)!='undefined')
            {
                console.log('setting toggle command');
                device.commands.toggle=function(callback){
                    var self=this;
                    device.status(function(status){
                        if(status.state)
                            device.commands.off.call(self, callback);
                        else
                            device.commands.on.call(self, callback);
                    });
                };
            }
            break;
    }
    $.each(device.commands || [], function(name, command){
        if($.isFunction(command))
            return;
        if(!$.isArray(command))
            command=[command];    
        device.commands[name]=function(callback){
            var self=this;
            $.eachAsync(command, function(index, command, next){
                if(typeof(command)=='string')
                    command={url:command};
                var url=$('url').parse(command.url);
                if(url.hostname===null)
                {
                    url.protocol='http';
                    command.url=$('url').format(url);
                }
                $.ajax($.extend({}, command, {success:function(data){ next(data); }, error:function(){ callback(500); }}));
            }, callback);
        };
    });
    if(device.subdevices)
    {
        $.each(device.subdevices, function(index,item){
            register($.extend({}, item, {name: device.name+'.'+item.name}));
        });
    }
    if(body && !initializing)
    {
        savedDevices.push(body);
        $('fs').writeFile('./modules/device/devices.json', JSON.stringify(savedDevices), function(err){
            if(err)
                console.log(err);
        });
    }
}

$(function(req,res,next){
		$('fs').readdir('./modules', function(err, files){
		    if(err)
		        return res.send(500, JSON.stringify(err));
	        res.setHeader('content-type','text/javascript');
			$.eachAsync(files, function(index, file, next){
				$('fs').exists('./modules/'+file+'/device.js', function(exists){
					if(!exists)
						return next();

					$('fs').readFile('./modules/'+file+'/device.js', {encoding:'utf8'},function(err, data){
						if(err)
						{
							console.log(err);
							next();
							return;
						}
						res.write(data);
						next();
					});
				});
			}, function(){ res.end(); });
		});
	}).get('/js/device.js');

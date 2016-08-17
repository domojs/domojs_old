var EventEmitter=require('events');
var debug=$('debug')('domojs:device');
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
            debug('could not find file devices.json');
            initializing=false;
            return ;
        }
        debug('loading devices');
        savedDevices=require('./devices.json');
        $.eachAsync(savedDevices, function(index,item, next){
            require('./controllers/api/home.js').add(item, next);
        }, function(){
            initializing=false;
        });
    });
    
    $.io.of('/device').on('connection', function(socket){
        var socketDevices=[];
        socket.on('device', function(device){
            device=$.extend(new EventEmitter(), device);
            var commands={};
            $.each(device.commands, function(i, cmd){
                commands[cmd]=function(callback){
                    socket.emit('command', {device:device.name, command:cmd});
                    callback(204);
                };
            });
            device.commands=commands;
            socketDevices.push(device);
            $.device(device);
        });
        
        socket.on('disconnect', function(){
            $.each(socketDevices, function(i, device){
                device.remove();
            });
        });
        
        socket.on('status', function(status){
            if(status.device==device.name)
                device.emit('status', status.state);
        });
    });
};

$.device=function register(device, body, callback)
{
	if(typeof(device)=='undefined')
		return devices;
    onStatus= function(state){
        debug(device.name, 'is now in state',state);
        $.emitTo('status', 'device:'+device.name, {device:device.name, state:state});
        if(typeof(state)=='string')
           $.emitTo('state:'+state, 'device:'+device.name, {device:device.name, state:state});
    };
    if(callback)
    {
        device=new EventEmitter();
        device.name=body.name;
        device.type=body.type;
        device.category=body.category;
        device.commands={};
        $.ajax({url:{hostname:'localhost', protocol:'http', port:global.port, pathname:'/js/device.js'}, success:function(data)
        {
	    if(data.length>0 && data[0]=='<')
		return;
            var deviceTypes={};
            $('vm').runInContext(data, $('vm').createContext({$:$, deviceTypes:deviceTypes, console:{log:debug, error:console.error}, process:process, Buffer:Buffer}), 'js/device.js'); 
            if(typeof(deviceTypes[device.type])!='undefined' && typeof(deviceTypes[device.type].onServerSave)!='undefined')
                deviceTypes[device.type].onServerSave(device, body);
            $.device(device, body);
            callback(device);
        }});
        return;
    }
    if(device instanceof EventEmitter)
        device.on('status', onStatus);

    if(typeof(devices[device.type])=='undefined')
        Object.defineProperty(devices, device.type, {configurable:false, enumerable:device.type.indexOf('.')!==0, writable:false, value:[]});
    devices[device.type].push(device);
    $.emit('device.new', device);
    device.remove=function(){
        var indexOfThis=devices[device.type].indexOf(this);
        devices[device.type].splice(indexOfThis, 1);
    };
    switch(device.type)
    {
        case 'switch':
            if(typeof(device.commands.toggle)=='undefined' && typeof(device.status)!='undefined')
            {
                debug('setting toggle command');
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
            register($.extend(new EventEmitter(), item, {name: device.name+'.'+item.name}));
        });
    }
    if(body && !initializing)
    {
        savedDevices.push(body);
        $('fs').writeFile('./modules/device/devices.json', JSON.stringify(savedDevices), function(err){
            if(err)
                debug(err);
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
							debug(err);
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

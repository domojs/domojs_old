var EventEmitter=require('events');
var debug=require('debug')('domojs:notification')
exports.init = function (config, app)
{
    var io = $('socket.io').listen(global.server);
    
    if(global.localServer)
        var io2=$('socket.io').listen(global.localServer);
        
    var bus=new EventEmitter();

    // io.configure('production', function ()
    // {
        // io.enable('browser client minification');  // send minified client
        // io.enable('browser client etag');          // apply etag caching logic based on version number
        // io.enable('browser client gzip');          // gzip the file
        // io.set('log level', 1);                    // reduce logging    
    // });

    $.io = exports.io = io;
	
    $.on=function(){
        io.on.apply(io, arguments); 
        if(io2) 
            io2.on.apply(io2, arguments); 
        bus.on.apply(bus, arguments);
    };

    $.emit = function(){ 
        bus.emit.apply(bus, arguments); 
        io.sockets.emit.apply(io.sockets, arguments); 
        if(io2) 
            io2.sockets.emit.apply(io2.sockets, arguments);
    };

    $.bus=bus;
    
   
   $.emitTo=function(eventName, to, message)
   {
       debug('emitting '+eventName+' to '+to+' with the following message: ', message);
        io.to(to).emit(eventName, message);
        if(io2)
            io2.to(to).emit(eventName, message);
   };
    
    $.on('connection', function(socket){
        socket.on('join', function(roomName){
            debug('joining '+roomName);
            socket.join(roomName);
        });
        socket.on('leave', function(roomName){
            debug('leaving '+roomName);
            socket.leave(roomName);
        });
        
        socket.on('error', function(error){
            console.error(error);
        });
        
        socket.on('message', function(message){
            if(typeof(message)=='string')
                message={text:message};
            if(!message.date || message.date<new Date())
                $.emit('message', message);
            else
                bus.emit('message', message);
        });
        
        socket.on('refresh', function(roomName){
            if(!roomName)
                $.emit('refresh', null);
            else
                $.emitTo('refresh', roomName, null);
        });
    });
};

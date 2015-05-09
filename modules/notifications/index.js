
exports.init = function (config, app)
{
    var io = $('socket.io').listen(global.server);
    
    if(global.localServer)
        var io2=$('socket.io').listen(global.localServer);

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
    };

    $.emit = function(){ 
        io.sockets.emit.apply(io.sockets, arguments); 
        if(io2) 
            io2.sockets.emit.apply(io2.sockets, arguments);
    };
   
   $.emitTo=function(eventName, to, message)
   {
        io.to(to).emit(eventName, message);
        if(io2)
            io2.to(to).emit(eventName, message);
   }
    
    $.on('connection', function(socket){
        socket.on('join', function(roomName){
            console.log('joining '+roomName);
            socket.join(roomName);
        });
        socket.on('leave', function(roomName){
            console.log('leaving '+roomName);
            socket.leave(roomName);
        });
    });

};
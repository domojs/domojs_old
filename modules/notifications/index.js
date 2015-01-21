
exports.init = function (config, app)
{
    var io = $('socket.io').listen(global.server);

    // io.configure('production', function ()
    // {
        // io.enable('browser client minification');  // send minified client
        // io.enable('browser client etag');          // apply etag caching logic based on version number
        // io.enable('browser client gzip');          // gzip the file
        // io.set('log level', 1);                    // reduce logging    
    // });

    $.io = exports.io = io;
	
    $.on=function(){ io.on.apply(io, arguments); };

    $.emit = function(){ io.sockets.emit.apply(io.sockets, arguments); };
   
    
    io.on('connection', function(socket){
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
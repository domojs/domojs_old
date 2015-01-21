var debug=$('debug')('jnode:db');
var redis=require('redis');
var client;

exports.init=function(config){
    $.settings.on('db', function(){
        $.db=client=redis.createClient(Number($.settings('db.port')), $.settings('db.host'), {});
    });
    $.settings.on('db.host', function(){
        $.db=client=redis.createClient(Number($.settings('db.port')), $.settings('db.host'), {});
    });
    $.settings.on('db.password', function(){
		var password=$.settings('db.password');
		if(password)
			client.auth(password, $.noop);
    });
    var port=$.settings('db.port');
    var host=$.settings('db.host');
    if(!port && !host)
        $.settings('db', {port:6379, host:'localhost'});
    else if(!port)
        $.settings('db.port', 6379);
    else if(!host)
        $.settings('db.host', 'localhost');
    
    $.db=client=redis.createClient(Number($.settings('db.port')), $.settings('db.host'), {});
};

$(function(req,res,next){
    client.loadDatabase(function(){
        db.find(req.body.filter).skip(req.body.skip).limit(req.body.take).exec(function(err, results){
            if(err)
                res.send(500, err);
            else
                res.send(results);
        });
    });
}).post('/db/{collection}');
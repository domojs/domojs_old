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
    $.db.another=function(){
        return redis.createClient(Number($.settings('db.port')), $.settings('db.host'), {});
    }
    $.db.osort=function(key, columns, sortKey, start, count, callback){
        
        if(arguments.length<5)
        {
            if($.isFunction(sortKey))
            {
                start=sortKey;
                sortKey=false;
            }
            else if(!isNaN(sortKey))
            {
                callback=count;
                count=start;
                start=sortKey;
                sortKey=false;
            }
            if($.isFunction(start))
            {
                callback=start;
                start=count=false;
            }
        }
        var args=[key];
        if(sortKey!==false)
        {
            args.push('BY');
            args.push(sortKey);
        }
        if(start!==false)
        {
            args.push('LIMIT');
            args.push(start);
            args.push(count);
        }
        for(var i in columns)
		{
            args.push('GET');
            if(columns[i]=='id')
                args.push('#');
            else if(columns[i].charAt(0)!='*')
                args.push('*->'+columns[i]);
            else
            {
                args.push(columns[i]);
                columns[i]=columns[i].substring(columns[i].indexOf('->')+2);
            }
		}
		args.push('ALPHA');
        $.db.sort(args, function(error, replies){
            var result=[];
            if(error)
                return callback(error);

            for(var i=0; i<replies.length;)
            {
                var item={};
                for(var c in columns)
                {
                    item[columns[c]]=replies[i++];
                }
                result.push(item);
            }
            callback(null, result);
        });
    };
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
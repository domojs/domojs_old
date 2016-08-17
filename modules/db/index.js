var debug=$('debug')('jnode:db');
var redis=require('redis');

exports.init=function(config, app){
    var port=$.settings('db.port');
    var host=$.settings('db.host');
    if(!port && !host)
        $.settings('db', {port:6379, host:'localhost'});
    else if(!port)
        $.settings('db.port', 6379);
    else if(!host)
        $.settings('db.host', 'localhost');
    
    $.db=buildClient();
    
    app.use(function(req,res,next){
        var client;
        Object.defineProperty(req, 'db', {get:function(){
            if(!client)
                client=buildClient();
            return client;
        }});
        var password=$.settings('db.password');
		if(password)
			client.auth(password, function(){
                next();
            });
        else
            next();
        res.on('finish', function(){
            if(client)
                client.quit();
            client=null;
        });
    });
    
    function buildClient(){
        var db= redis.createClient(Number($.settings('db.port')), $.settings('db.host'), {});
        var quit=db.quit.bind(db);
        var err = new Error();
        var timeOut=setTimeout(function(){
            if(!db._persistent)
                debug(err.stack);
            // quit();
        }, 60000)
        db.quit=function()
        {
            clearTimeout(timeOut);
            quit();
        }
        db.another=buildClient;
        db.on('error', function(error){
            console.log(error);
            client=null;
        })
        db.osort=function(key, columns, sortKey, start, count, callback){

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
            if(sortKey)
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
    		if(sortKey!==false)
    		    args.push('ALPHA');
    		console.log(args);
            db.sort(args, function(error, replies){
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
        
        return db;
    }
};

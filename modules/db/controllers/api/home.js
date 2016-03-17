module.exports={
    databases:function(db, callback){
        db.info(function(error, result){
            if(error)
                callback(500, error);
            else
            {
                result=$.grep(result.split('\n'), function(item){
                    console.log(item);
                    return item.substr(0, 2)=='db';
                });
                var databases=[];
                for(var i in result)
                {
                    databases[i]=/^(db[0-9]+):/.exec(result[i])[1];
                }
                callback(200, databases);
            }
        });
    },
    get:function(db, id, key, callback)
    {
        var dbCallback=function(err, value)
        {
            if(err)
                callback(500, err);
            else
                callback(200, value);
        }
                    
        if(isNaN(id) && typeof(key)=='undefined')
        {
            key=id;
            id=0;
        }
        db.select(id, function(){
            if(typeof(key)=='undefined')
                db.keys('*', dbCallback);
            else
                db.type(key, function(err, type)
                {
                    switch(type)
                    {
                        case 'string':
                            db.get(key, dbCallback);
                            break;
                        case 'list':
                            db.llen(key, function(err, length)
                            {
                                if(err)
                                    callback(500, err);
                                else
                                    db.lrange(key, 0, length, dbCallback);
                            });
                            break;
                        case 'set':
                        case 'zset':
                            db.smembers(key, dbCallback);
                            break;
                        case 'hash':
                            db.hgetall(key, dbCallback);
                            break;
                        default:
                            if(err)
                                callback(500, err);
                            else
                                db.keys(key, dbCallback);
                    }
                });
        })
    },
    post:function(db, id, key, body, callback)
    {
        var dbCallback=function(err, value)
            {
                if(err)
                    callback(500, err);
                else
                    callback(200, value);
            };
            
        if(isNaN(id))
        {
            key=id;
            id=0;
        }
        db.select(id, function(){
            if($.isArray(body))
            {
                body.unshift(key);
                db.sadd(body, dbCallback);
            }
            else if($.isString(body))
            {
                db.set(key, body, dbCallback);
            }
            else
            {
                var args=[key];
                $.each(body, function(index, value)
                {
                    args.push(index);
                    args.push(value);
                })
                db.hset(args, dbCallback());
            }
        })    
    }
};
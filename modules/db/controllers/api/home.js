module.exports={
    get:function(id, callback)
    {
        var dbCallback=function(err, value)
                    {
                        if(err)
                            callback(500, err);
                        else
                            callback(200, value);
                    }
        $.db.type(id, function(err, type)
        {
            switch(type)
            {
                case 'string':
                    $.db.get(id, dbCallback);
                    break;
                case 'list':
                    $.db.llen(id, function(err, length)
                    {
                        if(err)
                            callback(500, err);
                        else
                            $.db.lrange(id, 0, length, dbCallback);
                    });
                    break;
                case 'set':
                case 'zset':
                    $.db.smembers(id, dbCallback);
                    break;
                case 'hash':
                    $.db.hgetall(id, dbCallback);
                    break;
                default:
                    if(err)
                        callback(500, err);
                    else
                        $.db.keys(id, dbCallback);
            }
        });
    },
    post:function(id, body, callback)
    {
        var dbCallback=function(err, value)
            {
                if(err)
                    callback(500, err);
                else
                    callback(200, value);
            };
        if($.isArray(body))
        {
            body.unshift(id);
            $.db.sadd(body, dbCallback);
        }
        else if($.isString(body))
        {
            $.db.set(id, body, dbCallback);
        }
        else
        {
            var args=[id];
            $.each(body, function(index, value)
            {
                args.push(index);
                args.push(value);
            })
            $.db.hset(args, dbCallback());
        }
    }
};
 module.exports={
    index:function(){
        this.view();
    },
    list:function(db, id, key, callback)
    {
        if(typeof(id)=='undefined' && typeof(key)=='undefined')
            require('./api/home.js').databases(db, function(code, result)
            {
                callback(code, $.map(result, function(item){
                    return { name:item, level:0, children:'/db/list/'+/[0-9]/.exec(item) };
                }));
            });
        else
            require('./api/home.js').get(db, id, key, function(code, result)
            {
                if(code==500)
                    return callback(code, result);
                
                if(typeof(key)=='undefined')
                    callback(code, $.map(result, function(item){
                        return { name:item, level:1, children:'/db/list/'+id+'?key='+item };
                    }));
                else
                    callback(code, result);
            });
    }
 };
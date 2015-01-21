var Db=require('nedb');

var collections={};

module.exports={
    get:function(id, callback)
    {
        if(collections[id])
            collections[id]=new Db({file:'./db/'+id+'.nedb'});
    }
};
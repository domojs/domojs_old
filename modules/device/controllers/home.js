var api=require('./api/home.js');

 module.exports={
    _new:function(body){
        var self=this;
        if(body && Object.keys(body).length>0)
        {
            api.add(body, function(){ self.view('create')});
            return;
        }
        return this.view('create');
    },
    index:function(id){
        var self=this;
        if(!id)
            return api.get(undefined, undefined, undefined, function(categories){
                var result=[];
                $.each(categories, function(index, item){
                    var icon='glyphicon ';
                    switch(item.name)
                    {
                        case 'sensor':
                            icon+='glyphicon-import';
                            break;
                    }
                    result.push({text:item.name, icon:icon, url:'#device/category/'+item.name});
                });
                self.send(result);
            });
        else
            return api.get(id, undefined, undefined, function(items){
                var result=[];
                $.each(items, function(index, item){
                    if(item.name.indexOf(id+'.')==0)
                        result.push({text:item.name, url:'#device/'+item.name});
                    else
                        result.push({text:item.name, cmd:item.cmd});
                });
                self.send(result);
            });
    },
    category:function(id){
        var self=this;
        return api.category(id, function(devices){
            var result=[];
            $.eachAsync(devices, function(index, item, next){
                deviceBlock(item, function(block){
                    result.push(block);
                    next();
                });
            }, function(){
                self.send(result);
            });
        });
    }
};

function deviceBlock(item, callback)
{
    switch(item.category)
    {
        case 'actuator':
            switch(item.type)
            {
                case 'switch':
                    if(typeof(item.status)!='undefined')
                        item.status(function(status)
                        {
                            if(status.state)
                                callback({text:item.name, color:'green', icon:'power', cmd:'/api/devices/'+item.name+'?cmd=off', refresh:'self'});
                            else
                                callback({text:item.name, color:'red', icon:'power', cmd:'/api/devices/'+item.name+'?cmd=on', refresh:'self'});
                        });
                    else        
                        callback({text:item.name+ ' ('+Object.keys(item.commands).length+')', url:':#device/'+item.name});
                    break;
                case 'analogic':
                    callback({text:item.name+ ' ('+Object.keys(item.commands).length+')', url:'#device/'+item.name});
                    break;
                case 'values':
                    callback({text:item.name+ ' ('+Object.keys(item.commands).length+')', url:'#device/'+item.name});
                    break;
                default:
                    callback({text:item.name+ ' ('+Object.keys(item.commands).length+')', url:'#device/'+item.name});
                    break;
            }
            break;
        default:
            callback({text:item.name+ ' ('+item.length+')', url:'#device/'+item.name});
            break;
    }
}
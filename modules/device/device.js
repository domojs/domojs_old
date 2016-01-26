deviceTypes.rest={
    name:'http',
    onChange:function(){
        return 'static';
    },
    onAdd:function(){
        $('<li class="form-group">')
            .append('<div class="col-sm-2"><input type="text" class="commandsName form-control" placeholder="Name" name="commandsName" /></div>')
            .append('<div class="col-sm-10"><input type="text" class="commandsUrl form-control" placeholder="Url" name="commandsUrl" /></div>')
            .appendTo('#commands');
        return false;
    }, 
    onSave:function(data){
        var commands=[];
        $('#commands li').each(function(index, item){
            commands.push({name:$('.commandsName', item).val(), value:$('.commandsUrl', item).val()});
        });
        data.append('commands', JSON.stringify(commands));
    },
    onServerSave:function(device, body){
        var commands=JSON.parse(body.commands);
        $.each(commands, function(index, command){
            device.commands[command.name]=command.value;
        });
    }
}; 
deviceTypes.virtual={
    name:'virtual',
    onChange:function(){
        return 'static';
    },
    onAdd:function(){
        $('<li class="form-group">')
            .append('<div class="col-sm-2"><input type="text" class="commandName form-control" placeholder="Name" /></div>')
            .append('<div class="col-sm-10"><textarea class="commandScript form-control" placeholder="Function body"></textarea></div>')
            .appendTo('#commands');

    },
    onSave:function(data){
        var commands=[];
        $('#commands li').each(function(index, item){
            commands.push({name:$('.commandName', item).val(), value:$('.commandScript', item).val()});
        });
        data.append('commands', JSON.stringify(commands));
    },
    onServerSave:function(device, body){
        var commands=JSON.parse(body.commands);
        $.each(commands, function(index, command){
            device.commands[command.name]=new Function(command.value);
        });
    }
};


deviceTypes.virtualState={
    name:'virtualState',
    onChange:function(){
        return 'static';
    },
    onAdd:function(){
        $('<li class="form-group">')
            .append('<div class="col-sm-2"><input type="text" class="state form-control" placeholder="State" /></div>')
            .appendTo('#commands');

    },
    onSave:function(data){
        var states=[];
        
        $('#commands li').each(function(index, item){
            commands.push($('.state', item).val());
        });
        data.append('states', JSON.stringify(states));
    },
    onServerSave:function(device, body){
        var states=body.states;
        if(typeof(states)=='string')
            var states=JSON.parse(states);
        device.status=function(callback){
            callback(device.state);
        };
        $.each(states, function(index, command){
            device.commands[command]=function(){
                device.state=command;
                device.emit('status', command);
            };
        });
    }
};

deviceTypes.complexVirtual={
    name:'complex virtual',
    onChange:function(){
        $('<li class="form-group">')
            .append('<div class="col-sm-2"><div class="form-control-static">Script</div></div>')
            .append('<div class="col-sm-10"><textarea rows="15" class="commandScript form-control" placeholder="Script"></textarea></div>')
            .appendTo('#commands');
        return 'dynamic';
    },
    onSave:function(data){
        data.append('script', $('.commandScript').val());
    },
    onServerSave:function(device, body){
        var deviceFunc=new Function('device', 'state', body.script);
        var state={save:function(callback){
            $('fs').writeFile(device.name+'.state.json', this, callback);
        }};
        $('fs').exists(device.name+'.state.json', function(exists){
        if(exists)
        {
            $('fs').readFile(device.name+'.state.json', function(err, deviceState)
            {
                if(err)
                    console.log(err);
                else
                    deviceFunc(device, $.extend(state, deviceState));
            });
        }
        else
        {
            deviceFunc(device, state);
        }
    }); 
    }
};
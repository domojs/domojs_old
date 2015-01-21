var selector=4;

var up=18;
var down=17;
var stop=21;

function changeChannel(newChannel, callback){
    if(newChannel==state.currentChannel)
        callback();
    else
        $.ajax({type:'get', url:'/api/gpio/press/'+selector+'?repeat='+((newChannel-(state.currentChannel || 0)+5)%5), success:function(){
            state.currentChannel=newChannel;
            callback();
        }});
}


device.commands={};
$.each([1,2,3,4,5], function(i){
    device.commands['up'+(i+1)]=function(callback){
        changeChannel(i, function(){
            $.ajax({type:'get', url:'/api/gpio/press/'+up, success:callback, error:callback});
        });
    };
    device.commands['down'+(i+1)]=function(callback){
        changeChannel(i, function(){
            $.ajax({type:'get', url:'/api/gpio/press/'+down, success:callback, error:callback});
        });
    };
    device.commands['halt'+(i+1)]=function(callback){
        changeChannel(i, function(){
            $.ajax({type:'get', url:'/api/gpio/press/'+stop, success:callback, error:callback});
        });
    };
}); 
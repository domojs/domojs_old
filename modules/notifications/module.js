(function(){
    var $module=$('<li class="dropdown"><a href class="dropdown-toggle fa fa-bell" data-toggle="dropdown" role="button" aria-expanded="false">\
                        <span class="badge"></span>\
                    </a>\
                    <ul class="dropdown-menu" role="menu">\
                    </ul>\
                    </li>');
    
                    
    socket.on('message', function(msg){
            $('<li></li>').text(msg.text || msg).appendTo($module.find('.dropdown-menu'));
            $module.find('.badge').text($module.find('.dropdown-menu li').length);
        });
    
    $('#modulePlaceHolder').prepend($module);
})();

 
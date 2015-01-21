(function(){
    var r=window.$require=function(path, callback)
    {
        $.ajax({url:path, type:'get', dataType:'text', success:function(data){
            var module={require:r, exports:{}};
            (new Function('module', 'require', 'exports', data))(module,module.require,module.exports);
            callback(module.exports);
        }});
    }
})();
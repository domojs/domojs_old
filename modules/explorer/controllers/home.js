function search(terms, path, callback){
    $('fs').readdir(path, function(err, files)
    {
        if(err)
        {
            console.log(err);
            callback([]);
        }
        else
        {
            var result=[];
            $.eachAsync(files, function(index, item, next){
                var file=path+item;
                $('fs').stat(file, function(err, stat){
                    
                    if(err)
                    {
                        console.log(err);
                        return;
                    }
                    if(stat.isFile())
                    {
                        if($.grep(terms, function(term){ return file.indexOf(term)>=0; }).length==terms.length)
                        {
                            result.push({label:item, description:file.substr(2), value:file.replace('./', '/api/explorer/')});
                            next();
                        }
                        else
                            next();
                    }
                    else if (stat.isDirectory())
                    {
                        search(terms, file+'/', function(res)
                        {
                            $.each(res, function(index,item){
                                result.push(item);
                            });
                            next();
                        });
                    }
                    else
                        next();
                });
            }, function(){
                callback(result);
            });
        }
    })
}

module.exports={
    index:function()
    {
        return this.view();
    },
    search:function(term, callback){
        if(term)
            search(term.split(' '), './', this.send);
        else
            this.send([]);
    }
}

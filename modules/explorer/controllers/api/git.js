var debug=require('debug')('jnode:git');
var git = require('nodegit').Repository;
var StatusFile = require('nodegit').StatusFile;
var Status = require('nodegit').Status;
var Submodule=require('nodegit').Submodule;
if(typeof(git.prototype.getStatus)=='undefined')
{
    git.prototype.getStatus = function(opts) {
      var statusCallback = function() {
          
      };
    
      if (!opts) {
        opts = {
          flags: Status.OPT.INCLUDE_UNTRACKED | Status.OPT.RENAMES_INDEX_TO_WORKDIR,
          show: Status.SHOW.WORKDIR_ONLY 
        };
      }
      
      debug('getting status ');
      return Status.foreachExt(this, opts, statusCallback);
    };
}


function statusHandler(basePath, repo, result){
    return function(index, item, next){
        console.log(basePath+'/'+item.path());
        if(!$('fs').lstatSync(basePath+'/'+item.path()).isDirectory())
        {
            result.push({ path:item.path(), status:item.status() });
            next();
        }
        else
        {
                $('fs').exists(basePath+'/'+item.path()+'/.git', function(exists){
                    if(exists)
                    {
                        git.open(basePath+'/'+item.path()).then(function(subrepo){
                            try{
                                var subResult=[];
                                var statuses=subrepo.getStatusExt({
                                      flags: Status.OPT.INCLUDE_UNTRACKED | Status.OPT.RENAMES_INDEX_TO_WORKDIR,
                                      show: Status.SHOW.WORKDIR_ONLY 
                                    });
                                    $.eachAsync(statuses, statusHandler(basePath+'/'+item.path(), subrepo, subResult), function(){
                                        result.push({path:item.path(), status:item.status(), files:subResult});
                                        next();
                                    })
                            }
                            catch(e)
                            {
                                console.log(e);
                                next(e);
                            }
                        })
                    }
                    else
                    {
                        console.log(item.path()+' is not a git repository');
                        next();
                    }
                });
        }
    }
}


 module.exports={
     get:function(callback)
     {
        git.open($('path').resolve('.')).then(function(repo){
            var statuses=repo.getStatusExt({
              flags: Status.OPT.INCLUDE_UNTRACKED | Status.OPT.RENAMES_INDEX_TO_WORKDIR,
              show: Status.SHOW.WORKDIR_ONLY 
            });
            var result=[];
            $.eachAsync(statuses, statusHandler('.', repo, result), function(){
                callback(result);
            });
        });
     },
     stage:function(id, root, callback)
     {
         if(!root)
            root='';
        else
            root='/'+root;
         console.log($('path').resolve('.')+root);
        git.open($('path').resolve('.')+root).then(function(repo){
            console.log('repo')
            repo.index().then(function(index){
                console.log('index')
                index.addByPath(id);
                index.write();
                callback(200);
            })
        });
         
     }
 }
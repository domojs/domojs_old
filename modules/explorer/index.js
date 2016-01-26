var debug=$('debug')('jnode:browser');
/*var git = require('nodegit').Repository;
var StatusFile = require('nodegit').StatusFile;
var Status = require('nodegit').Status;
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
}*/
exports.init=function(config)
{
	$.each(config, function(baseUrl, item){
		var stat=$('fs').lstatSync(item);
		debug('isFile: '+stat.isFile());
		if(stat.isFile())
		{
			$.get(baseUrl, function(req,res,next){
				res.pipe($('fs').createReadStream(item));
			});
		}
		else
		{
		    baseUrl+='/';
			$(function(req,res,next){
				debug(req.params.wildcard);
				$('fs').exists(item+(req.params.wildcard || ''), function(exists){
                    if(exists)
                    {
                        var stat=$('fs').lstatSync(item+(req.params.wildcard || ''));
                        debug('isFile: '+stat.isFile());
                        if(stat.isFile())
                            $('fs').createReadStream(item+(req.params.wildcard || '')).pipe(res);
                        else
                        {
                			if(req.params.wildcard)
            			    	req.params.wildcard+='/';
        			    	else
        			    	    req.params.wildcard='';
    			    	    debug(item+req.params.wildcard);
	                        $('fs').readdir(item+(req.params.wildcard || ''), function(error, files){
	                            if(error)
	                            {
	                                return next(error);
	                            }
                                /*var result=git.openExt(item+req.params.wildcard, 0, $('path').resolve(item+'/..')).then(function(repo){
                                    repo.getStatus({
                                      flags: Status.OPT.INCLUDE_UNTRACKED | Status.OPT.RENAMES_INDEX_TO_WORKDIR,
                                      show: Status.SHOW.WORKDIR_ONLY 
                                    }).then(function(statuses){
                                        debug('pwic');
                                        var result=[];
                                        if(error)
                                            return next(error);
        
                                        var nodes=[],leaves=[];
                                        $.each(files, function(index,file){
                                            node={name:$('path').basename(file), url:baseUrl+req.params.wildcard+file};
                                            debug(file);
                                            var status=$.grep(statuses, function(status){
                                                debug(status.path()+' '+status.isModified());
                                                return status.path().startsWith(req.params.wildcard+file) && status.isModified();
                                            });
                                            var hasChanged=status.length>0;
                                            if($('fs').statSync((req.params.wildcard || './')+file).isFile())
                                                leaves.push($.extend(node, {isLeaf:true, hasChanged:hasChanged}));
                                            else
                                                nodes.push($.extend(node, {isLeaf:false, hasChanged:hasChanged}));
                                        });
        
                                        res.send(nodes.concat(leaves));
                                    },  function(err){
                                        debug(err);*/
                                        var nodes=[],leaves=[];
                                            $.each(files, function(index,file){
                                                node={name:$('path').basename(file), url:baseUrl+req.params.wildcard+file};
                                                if($('fs').statSync((req.params.wildcard || './')+file).isFile())
                                                    leaves.push($.extend(node, {isLeaf:true, hasChanged:false}));
                                                else
                                                    nodes.push($.extend(node, {isLeaf:false}));
                                            });
    
                                            res.send(nodes.concat(leaves));
                                    /*});
                                }, function(err){
                                    debug(err);
                                    var nodes=[],leaves=[];
                                        $.each(files, function(index,file){
                                            node={name:$('path').basename(file), url:baseUrl+req.params.wildcard+file};
                                            if($('fs').statSync((req.params.wildcard || '.')+'/'+file).isFile())
                                                leaves.push($.extend(node, {isLeaf:true, hasChanged:false}));
                                            else
                                                nodes.push($.extend(node, {isLeaf:false}));
                                        });

                                        res.send(nodes.concat(leaves));
                                });*/
                            });
                        }
                    }
                    else
                        next();
				})
			}).get(baseUrl.substring(0,baseUrl.length-1)).get(baseUrl+'*');

			$(function(req,res,next){
				var stat;
				if(req.params.wildcard.startsWith('git/'))
				    return next();
				debug(item+(req.params.wildcard || ''));
				if(!$('fs').existsSync(item+(req.params.wildcard || '')))
					stat={isFile:function(){ return req.headers['content-length']>0;}};
				else
					stat=$('fs').lstatSync(item+(req.params.wildcard || ''));
				
				debug('isFile: '+stat.isFile());
				if(stat.isFile())
				{
					req.pipe($('fs').createWriteStream(item+(req.params.wildcard || '')));
					res.send({error:null});
				}
				else
				{
					$('fs').mkdir(item+(req.params.wildcard || ''), function(error){
						res.send({error:error});
					});
				}
			}).post(baseUrl.substring(0, baseUrl.length-1)).post(baseUrl+'*')
		}
	});
}

var debug=$('debug')('jnode:browser');
/*var git = require('nodegit').Repository;
var StatusFile = require('nodegit').StatusFile;
var Status = require('nodegit').Status;
git.prototype.getStatus = function(opts) {
  var statuses = [];
  var statusCallback = function(path, status) {
    statuses.push(new StatusFile({path: path, status: status}));
  };

  if (!opts) {
    opts = {
      flags: Status.OPT.INCLUDE_UNTRACKED |
             Status.OPT.RECURSE_UNTRACKED_DIRS
    };
  }
  
  debug('getting status ');
  debug(Status);
  return Status.foreachExt(this, opts, statusCallback).then(function() {
      debug(statuses);
    return statuses;
  }, function(err)
  {
      debug(err);
  });
};*/

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
                            $('fs').readdir(item+(req.params.wildcard || ''), function(error, files){
                                /*var result=git.openExt(item+(req.params.wildcard || ''), 0, $('path').resolve(item+'/..')).then(function(repo){
                                    repo.getStatus().then(function(statuses){
                                        debug('pwic');
                                        var result=[];
                                        if(error)
                                            return next(error);
        
                                        var nodes=[],leaves=[];
                                        $.each(files, function(index,file){
                                            if(req.params.wildcard)
                                                node={name:$('path').basename(file), url:baseUrl+'/'+req.params.wildcard+'/'+file};
                                            else
                                                node={name:$('path').basename(file), url:baseUrl+'/'+file};
                                            var status=$.grep(statuses, function(status){
                                                return file.startsWith(status.path());
                                            });
                                            var hasChanged=false;
                                            if(status.length==1)
                                                hasChanged=status[0].isModified();
                                            if($('fs').statSync((req.params.wildcard || '.')+'/'+file).isFile())
                                                leaves.push($.extend(node, {isLeaf:true, hasChanged:hasChanged}));
                                            else
                                                nodes.push($.extend(node, {isLeaf:false}));
                                        });
        
                                        res.send(nodes.concat(leaves));
                                    },  function(err){
                                        debug(err);
                                        var nodes=[],leaves=[];
                                            $.each(files, function(index,file){
                                                if(req.params.wildcard)
                                                    node={name:$('path').basename(file), url:baseUrl+'/'+req.params.wildcard+'/'+file};
                                                else
                                                    node={name:$('path').basename(file), url:baseUrl+'/'+file};
                                                if($('fs').statSync((req.params.wildcard || '.')+'/'+file).isFile())
                                                    leaves.push($.extend(node, {isLeaf:true, hasChanged:false}));
                                                else
                                                    nodes.push($.extend(node, {isLeaf:false}));
                                            });
    
                                            res.send(nodes.concat(leaves));
                                    });
                                }, function(err){
                                    debug(err);*/
                                    var nodes=[],leaves=[];
                                        $.each(files, function(index,file){
                                            if(req.params.wildcard)
                                                node={name:$('path').basename(file), url:baseUrl+'/'+req.params.wildcard+'/'+file};
                                            else
                                                node={name:$('path').basename(file), url:baseUrl+'/'+file};
                                            if($('fs').statSync((req.params.wildcard || '.')+'/'+file).isFile())
                                                leaves.push($.extend(node, {isLeaf:true, hasChanged:false}));
                                            else
                                                nodes.push($.extend(node, {isLeaf:false}));
                                        });

                                        res.send(nodes.concat(leaves));
                                //});
                            });
                        }
                    }
                    else
                        res.send(404);
				})
			}).get(baseUrl).get(baseUrl+'/*');

			$(function(req,res,next){
				var stat;
				if(!$('fs').existsSync(item+(req.params.wildcard || '')))
					stat={isFile:function(){ return req.headers['content-length']>0;}};
				else
					stat=$('fs').lstatSync(item+(req.params.wildcard || ''));
				
				debug('isFile: '+stat.isFile());
				console.log(stat.isFile());
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
			}).post(baseUrl).post(baseUrl+'/*')
		}
	});
}

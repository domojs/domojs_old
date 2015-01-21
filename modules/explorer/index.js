var debug=$('debug')('jnode:browser');

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
                                var result=[];
                                if(error)
                                    return next(error);

                                var nodes=[],leaves=[];
                                $.each(files, function(index,file){
                                    if(req.params.wildcard)
                                        node={name:$('path').basename(file), url:baseUrl+'/'+req.params.wildcard+'/'+file};
                                    else
                                        node={name:$('path').basename(file), url:baseUrl+'/'+file};
                                    if($('fs').statSync((req.params.wildcard || '.')+'/'+file).isFile())
                                        leaves.push($.extend(node, {isLeaf:true}));
                                    else
                                        nodes.push($.extend(node, {isLeaf:false}));
                                });

                                res.send(nodes.concat(leaves));
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

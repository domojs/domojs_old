exports.init=function(config, app)
{
    concatFiles=function(fileName)
    {
        $(function(req,res,next){
    		$('fs').readdir('./modules', function(err, files){
    			res.writeHead(200, {'content-type':'application/javascript'});
    			$.eachAsync(files, function(index, file, next){
    				$('fs').exists('./modules/'+file+'/'+fileName, function(exists){
    					if(!exists)
    						return next();
    
    					$('fs').readFile('./modules/'+file+'/'+fileName, {encoding:'utf8'},function(err, data){
    						if(err)
    						{
    							console.log(err);
    							next();
    							return;
    						}
    						res.write(data);
    						next();
    					});
    				});
    			}, function(){ res.end(); });
    		});
    	}).get('/js/'+fileName);
    }
    
	concatFiles('routes.js');
	concatFiles('module.js');

	$(function(req,res,next){
		var filePath='./modules/'+req.params.module+'/assets/'+req.params.wildcard;
		$('fs').exists(filePath, function(exists){
			if(!exists)
				next();
			else
			{
				res.setHeader('content-type', $('mime').lookup(filePath));
				var file=$('fs').createReadStream(filePath);
				file.pipe(res);
			}
		});
	}).get('/assets/{module}/*');
}

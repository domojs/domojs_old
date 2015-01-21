exports.init=function(config, app)
{
	$(function(req,res,next){
		$('fs').readdir('./modules', function(err, files){
			res.writeHead(200);
			$.eachAsync(files, function(index, file, next){
				$('fs').exists('./modules/'+file+'/routes.js', function(exists){
					if(!exists)
						return next();

					$('fs').readFile('./modules/'+file+'/routes.js', {encoding:'utf8'},function(err, data){
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
	}).get('/js/routes.js');

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

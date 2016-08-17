var debug=$('debug')('domojs:core');

exports.init=function(config, app)
{
	var tiles=[];
	var disabledTiles=config.disabledTiles || [];

	$(function(req,res,next){
		var result=[];
		$.eachAsync(tiles, function(index, item, next){
			if($.isFunction(item))
				item(function(tile){
			        result=result.concat(tile);
					//result.push(tile);
					next();
				});
			else
			{
				result.push(item);
				next();
			}
		}, function(){
			res.send(result);
		});
	}).get('/assets/blocs/domojs.json');

	$('fs').readdir('./modules', function(err, files){
		$.each(files, function(index, file){
			if(disabledTiles.indexOf(file)>=0)
				return;

			$('fs').exists('./modules/'+file+'/controllers/tile.js', function(exists){
				if(!exists)
					$('fs').exists('./modules/'+file+'/assets/tile.png', function(exists){
						if(exists)
							tiles.push({text: file, background:'/assets/'+file+'/tile.png', url:'#'+file});
						else
							debug('no file ./modules/'+file+'/assets/tile.png exists');
					});
				else
				{
					tiles.push($('./modules/'+file+'/controllers/tile.js').index);
				}
			});
		});
	});
	$('fs').watch('./modules', {persistent:false}, function(event, fileName){
		if(fileName)
			debug(fileName+' was '+event);
		process.exit();
	});
}

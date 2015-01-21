route.on('music', function(url, params, unchanged){
    $('.music').show();
	$('.navbar-nav li:has(a[href="#music"])').addClass('active');
	if(respondCanvas)
		respondCanvas();
});

route.on('video/lastPlayed', function(){
	activate('video', 'lastPlayed');
	$.ajax({url:'/vlc/mru', dataType:'json', success:function(mru){
		var list=$('<ul>');
		$.each(mru, function(index,item){
			list.append(renderMedia(item));
		});
		$('.video #lastPlayed.tab-pane').append(list);
	}});
});

route.on('music/tracks', function(){
	activate('music', 'tracks');
	$('.music #libraryTracks').DataTable({
		serverSide:true,
		ordering:false,
		searching:false,
		retrieve:true,
		columns: [
            { title:"Artiste", data: "artist" },
            { title:"Album", data: "album" },
            { data: "track" },
            { title:"Nom", data: "title" },
			{ title:"Commandes", data:"id", createdCell:function(cell,cellData,rowData, rowIndex,colIndex){
				$(cell).empty().addClass('navbar-inverse')
					.append($('<a class="pull-left" title="Lire" href="#music/tracks"><span class="icon-32 icon-play-32"></span></a>').click(function(){
						commands.play(cellData);
					}))
					.append($('<a class="pull-left" title="Ajouter à la liste de lecture" href="#music/tracks"><span class="icon-32 icon-back-32"></span></a>').click(function(){
						commands.append(cellData);
					}))
					;
			}}
        ],
		ajax:'/vlc/library/ByName',
		dom:'tS',
		scrollY:'85%',
		scroller:{
			loadingIndicator:true
		}
	});
});

function activate(category, tab)
{
	$('.'+category).show();
	$('.navbar-nav li, .tab-pane').removeClass('active');
	$('.navbar-nav li:has(a[href="#'+category+'"])').addClass('active');
	$('.navbar-nav li:has(a[href="#'+category+'/'+tab+'"])').addClass('active');
	$('.'+category+' #'+tab+'.tab-pane').addClass('active');
	
	if(category=='music' && respondCanvas && tab=='current')
		respondCanvas();		
}

$.each(['music','video'], function(index,item){
	route.on(item+'/*', function(url, params, unchanged){
		activate(item, params.wildcard);
	});
});

route.on('video', function(url, params, unchanged){
    $('.video').show();
	$('.navbar-nav li:has(a[href="#video"])').addClass('active');
});

route.on('search/{mediaType}/*', function(url, params, unchanged){
	commands.search(params.wildcard, params.mediaType);
});

route.on('search/*', function(url, params, unchanged){
    commands.search(params.wildcard);
});

route.on('leaving', function(){
    $('.music, .video, #results').hide();
	$('.navbar-nav li, .tab-pane').removeClass('active');
})

route.trap(function(url){
	
});
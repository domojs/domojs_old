String.prototype.endsWith=function(s)
{
	return this.substring(this.length-s.length)==s;
};
String.prototype.startsWith=function(s)
{
	return this.substring(0,s.length)==s;
};

        window.route.trap(function(url){
            $.ajax(loadJson(url || 'domojs'));
        });

		function loadContent(hash)
		{
			var url;
			if(hash)
				url=hash.substr(1);
			if(!url)
				url='domojs';
			var ajax=loadJson(url);
			$.extend(ajax, {complete:function(jqXHR, textStatus) {
				if(jqXHR.status==404)
				{
					ajax=loadHtml(url);
					$.ajax(ajax);
				}
			}});
			$.ajax(ajax);
		}

        window.page={addCommand:function(cmd){
            $('.navbar-nav').append('<li class="dynamic"><a href="'+cmd.url+'">'+cmd.name+'</a></li>');
        }};
        
        function cleanUI(){
            $('.navbar-nav .dynamic').remove();
        }

        function loadJsonFromUrl(url)
        {
            return {url:url, dataType:'json', beforeSend:cleanUI, success:function(json){
				if(url=='/assets/blocs/domojs.json')
				{
					$('.previous').css('visibility', 'hidden');
					$('#navbar .title').text('DomoJS');
				}
				else
					$('.previous').css('visibility', 'visible');

				if(!$.isArray(json))
				{
			        $('#navbar .title').text(json.name || json.text);
    				$('#content').empty().append(BuildBlock(json.subBlocks, 256, 2).children());
				}
				else
				    $('#content').empty().append(BuildBlock(json, 256, 2).children());

				$.ajax({url:'/api/explorer/ui/'+url+'.json', success:function(){
				    $('#navbar .edit').show();
				}, error:function(){
				    $('#navbar .edit').hide();
				}});
				
				// (location.hash=="#cookie"?$('body > div:first > .block'):$('.block')).draggable({revert:true});
			}};
        }

		function loadJson(url)
		{
		    return loadJsonFromUrl('assets/blocs/'+url+'.json');
		}

		function BuildBlock(item, size, isOutBlock)
		{
			var block;
            var ratio=1;
            var children=[];
            if(!$.isArray(item))
                children=item.subBlocks || children;
            else
                children=item;
            while(isOutBlock!=2 && children && Math.pow(2,ratio)<children.length)
            {
                ratio++;
            }
    		var childrenSize=(size/ratio);
    		if($.isArray(item))
			{
            	block=$('<div class="block block-'+size+' block-noimg"></div>').data('block', item);
				var blocks=null;
                updateBlock(block, {}, size, isOutBlock);
				$.each(item, function(){
                    var block=BuildBlock(this, childrenSize, Math.max(isOutBlock-1,0));
					if(!blocks)
						blocks=block;
					else
						blocks=blocks.add(block);
				});
				block.append(blocks);
			}
			else
			{
                if(item.size)
                    size=item.size;
				if(item.subBlocks && (!item.back || !isOutBlock))
					block= BuildBlock(item.subBlocks, size, false).addClass('icon-'+size);
				else if(isOutBlock || item.back)
					block=$('<div class="block block-'+size+' icon-'+size+' block-noimg"></div>').data('block', item);
				else
				    block=$('<div class="block block-'+size+' col-md-6 icon-'+size+' block-noimg"></div>').data('block', item);
				updateBlock(block, item, size, isOutBlock);
			}
                if(isOutBlock)
                    block.addClass('outblock');

			return block;
		}

		function updateBlock(block, item, size, isOutBlock)
		{
			if(item.subBlocks && !item.back || $.isArray(item))
				block.empty().append(BuildBlock(item.subBlocks || item, size).children());
			if(isOutBlock && item.back)
			{
				var front;
				if(item.front)
					front=BuildBlock(item.front, size, isOutBlock-1);
				else
					front=BuildBlock(item, size, isOutBlock-1);
				front.removeClass('col-md-6');
				if(!item.color && (!item.front || !item.front.color))
				{
					colors=['black', 'blue', 'brown', 'green','lime','magenta','orange','pink','purple','red','viridian'];
					var color=colors[Math.floor((Math.random()*10)+1)];
					item.color=false;
					item.name='';
					front.addClass('block-'+color);
				}
				else
					front.addClass('block-'+(item.color || item.front && item.front.color));
					front.addClass('front');
				var back=BuildBlock(item.back, size, isOutBlock-1);
				if(!item.back.color)
				{
					colors=['black', 'blue', 'brown', 'green','lime','magenta','orange','pink','purple','red','viridian'];
					var color=colors[Math.floor((Math.random()*10)+1)];
					back.addClass('block-'+color)
					back.addClass('back');
				}
				else
					back.addClass('block-'+item.back.color);

				block.addClass('rotate3d rotate3dY faces');
				var faces=$('<div class="faces"></div>');
				block.append(faces);
				faces.append(back);
				faces.append(front);
			}
			if(item.color)
            {
				if(/^\//.test(item.color))
				{
					$.ajax({url:item.color, type:'GET', dataType:'json', cache:false, success:function(result){
					    if(!result)
					        return;
						if(item.name)
							block.addClass('block-text-'+result.color);
						else
							block.addClass('block-'+result.color);
					}});
				}
                if(item.name)
                    block.addClass('block-text-'+item.color);
                else
				    block.addClass('block-'+item.color);
            }
            else if(isOutBlock && typeof(item.name)=='undefined')
            {
                colors=['black', 'blue', 'brown', 'green','lime','magenta','orange','pink','purple','red','viridian'];
                var color=colors[Math.floor((Math.random()*10)+1)];
			    block.addClass('block-'+color);
            }
			if(item.name)
				block.text(item.name);
			if(item.html)
				block.html(item.html);
			if(item.text)
			{
				block.addClass('block-text').html('<div>'+item.text+'</div>');
			}
			if(item.icon)
			{
		        if(item.icon.startsWith('glyphicon'))
		        {
		            block.append('<span class="'+item.icon+'"></span>');
		        }
		        else
		        {
                    block.each(function(){
                        var classes=this.className.split(' ');
                        for(var i in classes)
                        {
                            if(classes[i].length>8 && classes[i].startsWith('icon-'))
                                $(this).removeClass(classes[i]);
                        }
                    });
                    if(item.size)
                        block.addClass('icon-'+item.icon+'-'+item.size).removeClass('block-noimg');
                    else
                        block.addClass('icon-'+item.icon+'-'+size).removeClass('block-noimg');
		        }
			}
			if(item.size)
				block.removeClass('block-'+size).addClass('block-'+item.size);
			if(item.background)
			{
				if(item.size)
					block.css({'background-image': 'url('+item.background+')', 'background-size':'contain', 'background-position':'center center', 'background-repeat':'no-repeat'});
				else
					block.css({'background-image': 'url('+item.background+')', 'background-size':'initial', 'background-position':'center center', 'background-repeat':'no-repeat'});
			}

			if(item.bigtext)
			{
				if(typeof(item.bigtext)=='string')
					block.addClass('block-bigtext').text(item.bigtext);
				else
				{
					$.get(item.bigtext.url,function(data){
						block.addClass('block-bigtext').text(data);
					});
					if(item.bigtext.refreshInterval)
					{
						setInterval(function(){
							$.get(item.bigtext.url,function(data){
								block.addClass('block-bigtext').text(data);
							});
						},item.bigtext.refreshInterval);
					}
				}
			}

			if(item.url)
			{
				if(item.url.startsWith('rtsp://'))
				{
					$('<object classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://downloads.videolan.org/pub/videolan/vlc/latest/win32/axvlc.cab" width="'+(item.size || size)+'" height="'+((item.size || size)*3/4)+'" events="True"> \
        <param name="Src" value="'+item.url+'"></param> \
        <param name="ShowDisplay" value="True" ></param> \
        <param name="AutoLoop" value="no"></param> \
        <param name="AutoPlay" value="yes"></param> \
        <embed type="application/x-google-vlc-plugin" name="vlc" autoplay="yes" loop="no" width="'+(item.size || size)+'" height="'+((item.size || size)*3/4)+'" target="'+item.url+'"></embed> \
    </object> ').appendTo(block);
				}
				else
				{
					block.on('click', function(){
						$('#navbar .title').text(item.name || item.text);
						window.location=item.url;
					});
				}
			}
			else if(typeof(item.cmd)!='undefined')
			{
				if($.isPlainObject(item.cmd))
				{
					if(item.cmd.refresh)
						item.cmd.ajax=refresh(item.cmd.refresh, item.cmd.ajax || item.cmd, block);
					if(item.cmd.notify)
					{
						$.each(item.cmd.notify.events, function(){
							socket.on(this.toString(), function (data) {
								if(item.cmd.notify.get)
									$.ajax(refresh(item.cmd.refresh || 'self', {dataType:'json', cache:false, url:item.cmd.notify.get, data:data.id}, block));
								else
									item.cmd.ajax=refresh(item.cmd.refresh || 'self', {}, block).success(data);
							});
						});
					}
                    block.click(function(){ queryData.call(this, item); });
				}
				else
					block.click(function(){ $.ajax({type:'get', url:item.cmd, cache:false}); });
			}
		}

		function refresh(mode, ajax, block)
		{
			var success;
			switch(mode)
			{
				case 'self':
					success=function(data){
						updateBlock(block, data);
					}
					break;
				case 'parent':
					success=function(data){
						updateBlock(block.parent(), data);
					}
					break;
				case 'all':
					success=function(data){
						if(data)
							loadJson(mode).success(data);
						else
							loadContent(location.hash);
					}
					break;
				case 'content':
				    success=function(){
						window.onhashchange();
					}
					break;
                case 'page':
                    ajax.complete=window.location.reload;
			}

            if(typeof(ajax)=='string')
                ajax={url:ajax};

			if(ajax.success)
				ajax.success=[ajax.success, success];
			else
				ajax.success=success;

			ajax.cache=false;
			return ajax;
		}

		function queryData(item)
		{
			var block=$(this);
			var cmd=item.cmd;
			var dialog=$('<div></div>');
			for(var key in cmd)
			{
				if(key=='ajax' || key=='refresh')
					continue;
				if(cmd[key].mode!='hidden')
					dialog.append('<span class="label">'+cmd[key].displayText+'</span>');
				dialog.append('<input id="'+key+'" type="'+(cmd[key].mode || 'text')+ '" name="'+key+'" value="'+ (cmd[key].defaultValue || '')+'">');
			}
			if(dialog.find(':input').length==0)
				return $.ajax(cmd.ajax);
			dialog.dialog({buttons:{OK:function(){
				for(var key in cmd)
				{
					if(key=='ajax')
						continue;
					if(cmd[key].isRequired && !$('#'+key).val())
					{
						$('<div></div>').html('Vous n\'avez pas saisi la valeur du champ <i>'+cmd[key].displayText+'</i>').dialog({dialogClass:'alert', width:'100%', height:'150', resizable:false, modal:true, buttons:{OK:function(){ $(this).dialog('close') }}});
						return;
					}
				}
				if(cmd.ajax.refresh)
				{
					refresh(cmd.ajax.refresh, cmd.ajax, block);
				}
					$.ajax($.extend(cmd.ajax, {data:dialog.find(':input').serializeArray()}));

				$(this).dialog('close');
			}, Annuler:function(){ $(this).dialog('close'); } } });
		}

		function loadHtml(url, callback)
		{
            $('#navbar .edit').hide();
			return {url:url, beforeSend:cleanUI, success:function(html){
				if(url=='domojs')
					$('.previous').css('visibility','hidden');
				else
					$('.previous').show('visibility','visible');

                var $html=$(html);
                if($html.length==0)
                    {
                        $('body > div:first').text(html);
                        return;
                    }

                    html=$html;
				var head=html.find('header');
				var title=head.find('title').text();
				if(title=='')
				{
					if(url=='domojs')
						title="DomoJS";
					else
						title=url.substr(url.indexOf('/')+1, -1)
				}
				$('#navbar .title').text(title);
				if(head.length>0)
					$('head').append(head.children().not('title, script'));
				var body=html.find('article');
				if(body.length==0)
					body=html;
				$('#content').html(body.not('script'));
				html.filter('script').add(head.children('script')).appendTo('head');
				if(typeof(page)!='undefined' && page.edit)
				    $('#navbar .edit').show();
				if(callback)
				    callback();
			}};
		}

		// $(function(){ $('a.icon-home-32').droppable({tolerance:'pointer', drop:function(event, ui){
			// var cookie=JSON.parse($.cookie('cookie')) || [];

			// if(window.location.hash=="#cookie")
				// cookie.splice(ui.draggable.index(),1);
			// else
				// cookie.push(ui.draggable.data('block'))

			// $.cookie('cookie', JSON.stringify(cookie));
		// }
		// });
	// });
    // socket = io.connect('http://home.dragon-angel.fr');

    // socket.on('message', function (data) {
        // if(typeof(data)=='string')
            // $.gritter.add({text:data, sticky:true});
        // else
            // $.gritter.add($.extend({sticky:true}, data));
    // });

    function edit()
    {
        window.location='#edit'+(window.location.hash.replace('#','/') || '/domojs');
    }

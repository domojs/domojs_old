route.on('code', function(url, params, unchanged){
    $.ajax(loadHtml('explorer', function(){
        $('#editor').bindKey('ctrl+,', function(){
            var dialog=$('<div></div>').css('z-index', 10000).dialog();

            var input=$('<input />').desccomplete({
                autoFocus:true,
                source:'/explorer/search',
                minLength: 2,
                focus:function(event, ui){
                  return false;  
                },
                select: function( event, ui ) {
                    activeFile=ui.item.value;
                    openFile(ui.item.value);
                    dialog.dialog('close');
              }}).appendTo(dialog);
              input.focus();
        });
        $('#fileExplorer').niceScroll({cursorborderradius :0, cursorwidth :10, cursorborder :'0px', autohidemode:'leave', cursorcolor:'#646464', cursoropacitymax:0.7, horizrailenabled:false});
        $('#git').niceScroll({cursorborderradius :0, cursorwidth :10, cursorborder :'0px', autohidemode:'leave', cursorcolor:'#646464', cursoropacitymax:0.7, horizrailenabled:false});
        // $('#explorer').resizable({handles:"e", maxWidth:375, stop:function(){
        //     $("#fileExplorer").getNiceScroll().resize();
        // }});
        $('#fileExplorer').on('click', '.addFolder', function(){
            var treeNode=$(this).closest('.node');
            var path=treeNode.data('node').url;
            $('<div><input id="folderName" name="folder" /></div>').dialog({title:'folder name', buttons:{OK:function(){
                path+='/'+$('#folderName', this).val();
                if($('#folderName', this).val()!=null)
                {
                    $.ajax({url:path, type:'post', success:function(){
                        treeNode.tree('refresh');
                    }});
                    $(this).dialog('close');
                }
            }}});
        });
        $('#fileExplorer').on('click', '.addFile', function(){
            var treeNode=$(this).closest('.node');
            var path=treeNode.data('node').url;
            $('<div><input id="fileName" name="file" /></div>').dialog({title:'file name', buttons:{OK:function(){
                path+='/'+$('#fileName', this).val();
                if($('#fileName', this).val()!=null)
                {
                    openFile(path);
                    openedFiles[path].data('lastSavedAt', -1);
                    openedFiles[path].data('onSave', function(){ 
                        treeNode.tree('refresh');
                        openedFiles[path].data('onSave', null);
                    });
                    $(this).dialog('close');
                }
            }}});
        });
        
        $('#fileExplorer').on('click', '.refresh', function(){
            var treeNode=$(this).closest('.node');
            treeNode.tree('refresh');
        });

        var openedFiles={};
        var openFile=function(file){
            if(!openedFiles[file])
                    {
                        openedFiles[file]=$('<li><a href="#code"><span class="btn pull-right glyphicon glyphicon-remove" style="padding:0; padding-left:12px; font-size:smaller"></span><span class="glyphicon glyphicon-pencil pull-right" style="padding:0; padding-left:12px; font-size:smaller"></span>'+file.substr(file.lastIndexOf('/')+1)+'</a></li>')
                            .data('extension', file.match(/\.[A-Z]+$/i)[0])
                            .data('name', file.substr(file.lastIndexOf('/')+1))
                            .data('path', file.substr('/api/explorer/'.length))
                            .data('lastSavedAt', 0)
                            .prop('title', file.substr('/api/explorer/'.length))
                            .on('click', function(){
                                activeFile=file;
                                setContent();
                            })
                            .appendTo('#fileTabs')
                        ;
                        $('.icon-close-32, .glyphicon-remove', openedFiles[file]).on('click', function(){
                            closeFile(file);
                        });
                        
                        var mode='';
                        switch(openedFiles[file].data('extension'))
                        {
                            case '.css':
                                openedFiles[file].addClass('css');
                                mode='ace/mode/css';
                                break;
                            case '.html':
                            case '.htm':
                                openedFiles[file].addClass('html');
                                mode='ace/mode/html';
                                break;
                            case '.xml':
                                openedFiles[file].addClass('xml');
                                mode='ace/mode/xml';
                                break;
                            case '.json':
                                openedFiles[file].addClass('json');
                                mode='ace/mode/json';
                                break;
                            case '.js':
                            case '.jnode':
                            case '.onsm':
                                openedFiles[file].addClass('js');
                                mode='ace/mode/javascript';
                                break;
                            default:
                                break;
                        }
                        
                        $.ajax({url:file, success:function(data){
                            var session=ace.createEditSession(data, mode);
                            session.on('change', function(e){
                                setTimeout(function(){
                                if(session.getUndoManager().$undoStack.length!=openedFiles[file].data('lastSavedAt'))
                                    openedFiles[file].addClass('unsaved');
                                else
                                    openedFiles[file].removeClass('unsaved');
                                },0);
                            });

                            openedFiles[file].data('session', session);
                            setContent();
                        }, error:function(xhr)
                        {
                            if(xhr.status==404)
                            {
                                var session=ace.createEditSession(' ', mode);
                                session.on('change', function(e){
                                    setTimeout(function(){
                                    if(session.getUndoManager().$undoStack.length!=openedFiles[file].data('lastSavedAt'))
                                        openedFiles[file].addClass('unsaved');
                                    else
                                        openedFiles[file].removeClass('unsaved');
                                    },0);
                                });
    
                                openedFiles[file].data('session', session);
                                activeFile=file;
                                setContent();
                            }
                        }});
                    }
                    else
                    {
                        setContent();
                    }
        };
        var activeFile=null;
        var editor=ace.edit('editor');
        editor.setTheme('ace/theme/monaco');
        editor.renderer.setShowPrintMargin(false)
        editor.setFontSize(12);
        editor.commands.removeCommand('showSettingsMenu');
        editor.commands.addCommand({
			name: 'upload',
			bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
			exec: function(editor) {
                console.log(editor.getSession().getValue());
                var file=activeFile;
				$.ajax({type:'POST', contentType:'text/plain', url:file, data:editor.getSession().getValue(), success:function(data){
					if(!data.error)
                    {
                        if(openedFiles[file].data('onSave'))
                           openedFiles[file].data('onSave')(); 
                        openedFiles[file].data('lastSavedAt', openedFiles[file].data('session').getUndoManager().$undoStack.length);
                        openedFiles[file].removeClass('unsaved');
						$.gritter.add({title:'Code Editor', text:'file save successfully'});
                    }
					else
						$.gritter.add({title:'Code Editor', text:'file NOT saved\n'+data.error});
				}, error:function(error)
                {
    				$.gritter.add({title:'Code Editor', text:'file NOT saved\n'+error});
                }
				});
			},
			readOnly: false // false if this command should not apply in readOnly mode
		});
    	editor.commands.addCommand({
			name: 'add',
			bindKey: {win: 'Ctrl-N',  mac: 'Command-N'},
			exec: function(editor) {
			    var input=$('<input type="text" />');
			    input.dialog({'title':'new file name ?', buttons:{CREATE:function(){ $(this).dialog('close'); setCurrentFile('/api/explorer/'+input.val()); }, CANCEL:function(){ $(this).dialog('close'); }}}).focus();
                editor.setValue('');
			},
			readOnly: false // false if this command should not apply in readOnly mode
		});
        editor.commands.addCommand({
            name: 'close',
            bindKey: {win: 'Ctrl-W',  mac: 'Command-W'},
            exec: function(editor) {
                closeFile(activeFile);
            },
            readOnly: false // false if this command should not apply in readOnly mode
        });

        var closeFile=function(file){
            var isActive= openedFiles[file].is('.active');
            if(isActive)
            {
                var index=openedFiles[file].index();
                var parent=openedFiles[file].parent();
            }
            openedFiles[file].remove();
            if(isActive)
                activeFile=Object.keys(openedFiles)[Math.max(0,index-1)];
            delete openedFiles[file];
            if(isActive)
                setContent();
        };
        var setContent=function(){
            $('#fileTabs .active').removeClass('active');
            if(openedFiles[activeFile])
            {
                openedFiles[activeFile].addClass('active');
                openedFiles[activeFile].data('document')
                editor.setSession(openedFiles[activeFile].data('session'));
            }
            else
                editor.setSession(ace.createEditSession('', 'ace/mode/text'));
            editor.focus();
        };

        $('#git').on('click', '.fa-upload', function(){
            var treeNode=$(this).closest('.node');
            var node=treeNode.data('node');
            debugger;
            $.ajax({url:'/api/explorer/git/stage/'+encodeURIComponent(node.path)+'?root='+encodeURIComponent(node.parent.path), type:'post', success:function(){
                $('#git').tree('refresh');
            }});
        });
        $('#git').tree({
            source:'/api/explorer/git',
            children:function(node){
                return node.files;
            },
            label:function(node)
            {
                var actions='<span class="fa fa-upload pull-right"></span>';
                var classNames='glyphicon ';
                if(node.files)
                    classNames+='glyphicon-folder-close';
                else
                {
                    var extension=node.path.match(/\.[A-Z]+$/i);
                    if(extension)
                        switch(extension[0])
                        {
                            case '.css':
                                classNames+='css ';
                                break;
                            case '.html':
                            case '.htm':
                                classNames+='html ';
                                break;
                            case '.xml':
                                classNames+='xml ';
                                break;
                            case '.json':
                                classNames+='json ';
                                break;
                            case '.js':
                            case '.jnode':
                            case '.onsm':
                                classNames+='js ';
                                break;
                            default:
                                classNames+='glyphicon-file ';
                                break;
                        }
                    else
                        classNames+='glyphicon-file ';
                    if(node.status.indexOf('WT_NEW')>-1)
                    {
                        actions='<span class="fa fa-question-circle"></span>'+actions;
                    }
                }
                return actions+'<span class="'+classNames+'"></span>\
                 '+node.path; 
            },
            focusedNodeChanged:function(ev, treeNode){
                var file=activeFile=$(treeNode).data('node').url;
                if(!$(treeNode).data('node').isLeaf)
                {
                    $('#fileExplorer').data('treeOptions')._toggleTreeNode.call(treeNode);
                    $("#fileExplorer").getNiceScroll().resize();
                }
                else
                {
                    openFile(file);
                }
            },
            loaded:function(){ $("#fileExplorer").getNiceScroll().resize(); }
        });

        $('#fileExplorer').tree({
            source:'/api/explorer',
            toggled:function(){$('> .ui-state-focus', this).toggleClass('ui-state-active'); },
            label:function(node){
                var classNames='glyphicon ';
                if(!node.isLeaf)
                    classNames+='glyphicon-folder-close';
                else
                {
                    var extension=node.name.match(/\.[A-Z]+$/i);
                    if(extension)
                        switch(extension[0])
                        {
                            case '.css':
                                classNames+='css ';
                                break;
                            case '.html':
                            case '.htm':
                                classNames+='html ';
                                break;
                            case '.xml':
                                classNames+='xml ';
                                break;
                            case '.json':
                                classNames+='json ';
                                break;
                            case '.js':
                            case '.jnode':
                            case '.onsm':
                                classNames+='js ';
                                break;
                            default:
                                classNames+='glyphicon-file ';
                                break;
                        }
                    else
                        classNames+='glyphicon-file ';
                }
                if(node.hasChanged)
                    return '<span class="glyphicon glyphicon-exclamation-sign"></span>\
                     <span class="has-changed '+classNames+'"></span>\
                     <span class="glyphicon glyphicon-refresh refresh pull-right"></span>\
                     <span class="glyphicon glyphicon-plus addFolder pull-right"></span>\
                     <span class="glyphicon glyphicon-plus addFile pull-right"></span>\
                     '+node.name; 
                 return '<span class="'+classNames+'"></span>\
                 <span class="glyphicon glyphicon-refresh refresh pull-right"></span>\
                 <span class="glyphicon glyphicon-plus addFolder pull-right"></span>\
                 <span class="glyphicon glyphicon-plus addFile pull-right"></span>\
                 '+node.name; 
                 },
            key:function(node){ return node.url; },
            children:function(node){ return !node.isLeaf && node.url; },
            focusedNodeChanged:function(ev, treeNode){
                var file=activeFile=$(treeNode).data('node').url;
                if(!$(treeNode).data('node').isLeaf)
                {
                    $('#fileExplorer').data('treeOptions')._toggleTreeNode.call(treeNode);
                    $("#fileExplorer").getNiceScroll().resize();
                }
                else
                {
                    openFile(file);
                }
            },
            loaded:function(){ $("#fileExplorer").getNiceScroll().resize(); }
        });
    }));
});

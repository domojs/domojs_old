route.on( 'code', function( url, params, unchanged ) {
    function modal( config ) {
        var dialog = $( '#modal' );
        dialog.find( '.modal-body' ).append( config.content );
        dialog.find( '.modal-title' ).text( config.title );
        if( config.footer )
            dialog.find( '.modal-footer' ).append( config.footer );
        if( $.isFunction( config.onOpen ) )
            dialog.one( 'shown.bs.modal', config.onOpen );
        if( $.isFunction( config.onClose ) )
            dialog.one( 'hidden.bs.modal', config.onClose );
        dialog.modal();
        dialog.one( 'hidden.bs.modal', function() {
            $( '#modal .modal-body' ).empty();
            $( '#modal .modal-title' ).empty();
            $( '#modal .modal-footer' ).empty();
        });
    }

    $.ajax( loadHtml( 'explorer', function() {
        var editor;
        require.config( { paths: { 'vs': 'assets/explorer/js/vs' } });
        require( [ 'vs/editor/editor.main' ], function() {
            var e = monaco.editor.create( document.getElementById( 'editor' ), {
                folding: true,
                roundedSelection: false,
                model: null
            });

            editor = e;

            $.ajax( {
                url: '/assets/explorer/js/monaco.d.ts', success: function( data ) {
                    monaco.languages.typescript.javascriptDefaults.addExtraLib( data, '/assets/explorer/js/monaco.d.ts' );
                }
            });

            editor.addAction( {
                // An unique identifier of the contributed action.
                id: 'upload',

                // A label of the action that will be presented to the user.
                label: 'Save',
                keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S ],

                keybindingContext: null,

                run: function( editor ) {
                    console.log( editor.getValue() );
                    var file = activeFile;
                    $.ajax( {
                        type: 'POST', contentType: 'text/plain', url: file, data: editor.getValue(), success: function( data ) {
                            if( !data.error ) {
                                if( openedFiles[ file ].data( 'onSave' ) )
                                    openedFiles[ file ].data( 'onSave' )();
                                openedFiles[ file ].data( 'lastSavedAt', openedFiles[ file ].data( 'session' ).getAlternativeVersionId() );
                                openedFiles[ file ].removeClass( 'unsaved' );
                                $( '#fileExplorer .node:has(>.ui-state-focus)' ).removeClass( 'unsaved' );
                                $.gritter.add( { title: 'Code Editor', text: 'file save successfully' });
                                debugger;
                                if( e.getModel().getModeId() == 'typescript' && file.endsWith( '.ts' ) ) {
                                    e.getModel().getMode().getEmitOutput( e.getModel().uri, 'js' ).then( function( output ) {
                                        if( output && typeof output.content === "string" ) {
                                            $.ajax( {
                                                type: 'POST', contentType: 'text/plain', url: file.substring( 0, file.length - 3 ) + '.ts', data: output.content, success: function( data ) {
                                                    if( !data.error ) {
                                                        if( openedFiles[ file ].data( 'onSave' ) )
                                                            openedFiles[ file ].data( 'onSave' )();
                                                        openedFiles[ file ].data( 'lastSavedAt', openedFiles[ file ].data( 'session' ).getAlternativeVersionId() );
                                                        openedFiles[ file ].removeClass( 'unsaved' );
                                                        $( '#fileExplorer .node:has(>.ui-state-focus)' ).removeClass( 'unsaved' );
                                                        $.gritter.add( { title: 'Code Editor', text: 'file save successfully' });
                                                    }
                                                }
                                            });
                                        }
                                    }, function( err ) {
                                        if( err.name === 'Canceled' ) {
                                            return;
                                        }

                                        console.error( err );
                                    });
                                }
                            }
                            else
                                $.gritter.add( { title: 'Code Editor', text: 'file NOT saved\n' + data.error });
                        }, error: function( error ) {
                            $.gritter.add( { title: 'Code Editor', text: 'file NOT saved\n' + error });
                        }
                    });
                },
                enablement: {
                    writeableEditor: true,
                }
            });
            editor.addAction( {
                id: 'add',
                label: 'New File',
                keyBindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_N ],
                run: function( editor ) {
                    var input = $( '<input type="text" />' );
                    input.dialog( { 'title': 'new file name ?', buttons: { CREATE: function() { $( this ).dialog( 'close' ); openFile( '/api/explorer/' + input.val() ); }, CANCEL: function() { $( this ).dialog( 'close' ); } } }).focus();
                },
                enablement: {
                    writeableEditor: true,
                }
            });
            editor.addAction( {
                id: 'close',
                label: 'Close File',
                keyBindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Key_W ],
                run: function( editor ) {
                    closeFile( activeFile );
                },
                enablement: {
                    writeableEditor: true,
                }
            });
        });
        $( '#editor' ).bindKey( 'ctrl+,', function() {
            var input = $( '<input />' ).desccomplete( {
                autoFocus: true,
                source: '/explorer/search',
                minLength: 2,
                focus: function( event, ui ) {
                    return false;
                },
                select: function( event, ui ) {
                    activeFile = ui.item.value;
                    openFile( ui.item.value );
                    dialog.dialog( 'close' );
                }
            });
            modal( {
                title: 'File search', content: input, onOpen: function() {
                    input.focus();
                }
            });
        }).bindKey( 'ctrl+tab', function() {
            var wasPrevious = false;
            for( var file in openFiles ) {
                if( wasPrevious ) {
                    activeFile = file;
                    setContent();
                    break;
                }
                if( file == activeFile )
                    wasPrevious = true;
            }
        });

        $( window ).on( 'beforeunload', function() {
            var openedPaths = Object.keys( openedFiles )
            if( openedPaths.length > 0 ) {
                if( $.grep( openedPaths, function( path ) {
                    console.log( path );
                    return openedFiles[ path ].hasClass( 'unsaved' );
                }).length )
                    return 'Il reste des fichiers ouverts et NON ENREGISTRES, voulez-vous vraiment fermer ?';
                return 'Il reste des fichiers ouverts, voulez-vous vraiment fermer ?';
            }
        });

        var arrowFunctions = {
            left: function expLeft() {
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                if( !activeNode.closest( 'li' ).hasClass( 'expanded' ) ) {
                    activeNode = activeNode.parent().closest( '.node' );
                    activeNode.tree( 'focus', activeNode );
                }
                else
                    activeNode.tree( 'option' )._toggleTreeNode.call( activeNode );
                return false;
            },
            right: function expRight() {
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                if( activeNode.closest( 'li' ).hasClass( 'expanded' ) )
                    arrowFunctions.down();
                else
                    arrowFunctions.enter();
                return false;
            },
            up: function expUp() {
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                var index = activeNode.parent().index() - 1;
                if( index == -1 )
                    activeNode = activeNode.parent().closest( '.node' );
                else
                    activeNode = activeNode.parent().prev().find( '.node:first' );
                if( activeNode.closest( 'li' ).hasClass( 'expanded' ) ) {
                    activeNode = activeNode.find( '>ul>li:last>.node' );
                }
                activeNode.tree( 'focus', activeNode );
                return false;
            },
            down: function expDown() {
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                var currentNode = activeNode;
                if( activeNode.closest( 'li' ).hasClass( 'expanded' ) )
                    activeNode = currentNode.find( '.node:first' );
                else
                    activeNode = currentNode.parent().next().find( '.node:first' );
                if( activeNode.length === 0 )
                    activeNode = currentNode.parent().closest( '.node' ).parent().next().find( '.node:first' );
                if( activeNode.length == 0 )
                    return;
                activeNode.tree( 'focus', activeNode );

                return false;
            },
            enter: function() {
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                if( activeNode.data( 'node' ).isLeaf ) {
                    activeFile = activeNode.data( 'node' ).url;
                    openFile( activeFile );
                }
                else
                    activeNode.tree( 'option' )._toggleTreeNode.call( activeNode );
                return false;
            },
            search: function expSearch( ev ) {
                var letter = String.fromCharCode( ev.charCode ).toLowerCase();
                if( letter.trim().length == 0 )
                    return;
                var activeNode = $( '#fileExplorer .ui-state-focus' ).closest( '.node' );
                var foundNode = false;
                while( !foundNode && activeNode.attr( 'id' ) != 'fileExplorer' && activeNode.length > 0 ) {
                    activeNode.find( '.node .label' ).each( function() {
                        if( foundNode )
                            return;
                        if( $( this ).text().trim()[ 0 ].toLowerCase() == letter ) {
                            foundNode = this;
                        }
                    });
                    activeNode = activeNode.parent().closest( '.node' );
                }
                activeNode.tree( 'focus', $( foundNode ).closest( '.node' ) );
            },
            scrollTo: function( element, callback ) {
                var min = element[ 0 ].offsetTop + element.outerHeight();
                var maxHeight = element.closest( '.tab-content' ).innerHeight();
                var idealPosition = maxHeight / 2;
                if( element.outerHeight() - idealPosition > 0 )
                    element.parents().stop().animate( { scrollTop: element[ 0 ].offsetTop - element.closest( '.tab-content' ).offset().top }, { complete: callback });
                else
                    element.parents().stop().animate( { scrollTop: element[ 0 ].offsetTop - idealPosition }, { complete: callback });
            }
        }



        $( '#explorer' ).focus().
            bindKey( 'left', arrowFunctions.left ).
            bindKey( 'right', arrowFunctions.right ).
            bindKey( 'up', arrowFunctions.up ).
            bindKey( 'down', arrowFunctions.down ).
            bindKey( 'enter', arrowFunctions.enter ).
            bind( 'keypress', arrowFunctions.search );

        $( '#fileExplorer' ).on( 'click', '.addFolder', function() {
            var treeNode = $( this ).closest( '.node' );
            var path = treeNode.data( 'node' ).url;
            var button = $( '<a class="btn btn-lg btn-success">OK</a>' ).click( function() {
                path += '/' + $( '#modal #folderName' ).val();
                if( $( '#modal #folderName' ).val() != null ) {
                    $.ajax( {
                        url: path, type: 'post', success: function() {
                            treeNode.tree( 'refresh' );
                        }
                    });
                    $( '#modal' ).modal( 'hide' );
                }
            });
            modal( {
                title: 'Add Folder', content: $( '<input id="folderName" name="folder"/>' ).bindKey( 'enter', function() {
                    button.click();
                }), onOpen: function() {
                    $( '#folderName' ).focus();
                }, footer: button
            });
        });
        $( '#fileExplorer' ).on( 'click', '.addFile', function() {
            var treeNode = $( this ).closest( '.node' );
            var path = treeNode.data( 'node' ).url;
            var button = $( '<a class="btn btn-lg btn-success">OK</a>' ).click( function() {
                path += '/' + $( '#modal #fileName' ).val();
                if( $( '#modal #fileName' ).val() != null ) {
                    openFile( path );
                    openedFiles[ path ].data( 'lastSavedAt', -1 );
                    openedFiles[ path ].data( 'onSave', function() {
                        treeNode.tree( 'refresh' );
                        openedFiles[ path ].data( 'onSave', null );
                    });
                    $( '#modal' ).modal( 'hide' );
                }
            });
            modal( {
                title: 'Add file', content: $( '<input id="fileName" name="file" />' ).bindKey( 'enter', function() {
                    button.click();
                }), onOpen: function() {
                    $( '#fileName' ).focus();
                }, footer: button
            });
        });

        $( '#fileExplorer' ).on( 'click', '.refresh', function() {
            var treeNode = $( this ).closest( '.node' );
            treeNode.tree( 'refresh' );
        });

        var openedFiles = {};
        var openFile = function( file ) {
            if( !openedFiles[ file ] ) {
                openedFiles[ file ] = $( '<li><a href="#code"><span class="btn pull-right glyphicon glyphicon-remove" style="padding:0; padding-left:12px; font-size:smaller"></span><span class="glyphicon glyphicon-pencil pull-right" style="padding:0; padding-left:12px; font-size:smaller"></span>' + file.substr( file.lastIndexOf( '/' ) + 1 ) + '</a></li>' )
                    .data( 'extension', file.match( /\.[A-Z]+$/i )[ 0 ] )
                    .data( 'name', file.substr( file.lastIndexOf( '/' ) + 1 ) )
                    .data( 'path', file.substr( '/api/explorer/'.length ) )
                    .data( 'lastSavedAt', 0 )
                    .prop( 'title', file.substr( '/api/explorer/'.length ) )
                    .on( 'click', function() {
                        activeFile = file;
                        setContent();
                    })
                    .appendTo( '#fileTabs' )
                    ;
                $( '.icon-close-32, .glyphicon-remove', openedFiles[ file ] ).on( 'click', function() {
                    closeFile( file );
                });

                var mode = '';
                switch( openedFiles[ file ].data( 'extension' ) ) {
                    case '.css':
                        openedFiles[ file ].addClass( 'css' );
                        mode = 'css';
                        break;
                    case '.html':
                    case '.htm':
                        openedFiles[ file ].addClass( 'html' );
                        mode = 'html';
                        break;
                    case '.xml':
                        openedFiles[ file ].addClass( 'xml' );
                        mode = 'xml';
                        break;
                    case '.json':
                        openedFiles[ file ].addClass( 'json' );
                        mode = 'json';
                        break;
                    case '.js':
                    case '.jnode':
                    case '.onsm':
                        openedFiles[ file ].addClass( 'js' );
                        mode = 'javascript';
                        break;
                    case '.ts':
                        openedFiles[ file ].addClass( 'js' );
                        mode = 'typescript';
                        break;
                    case '.sh':
                        openedFiles[ file ].addClass( 'sh' );
                        mode = 'sh';
                        break;
                    default:
                        break;
                }

                $.ajax( {
                    url: file, success: function( data ) {
                        var session = monaco.editor.createModel( data, mode );
                        session.onDidChangeContent( function( e ) {
                            if( session.getAlternativeVersionId() != openedFiles[ file ].data( 'lastSavedAt' ) ) {
                                openedFiles[ file ].addClass( 'unsaved' );
                                $( '#fileExplorer' ).find( '.node:has(> div > input[value="' + file + '"])' ).addClass( 'unsaved' );

                            }
                            else {
                                openedFiles[ file ].removeClass( 'unsaved' );
                                $( '#fileExplorer' ).find( '.node:has(> div > input[value="' + file + '"])' ).removeClass( 'unsaved' );
                            }
                        });

                        openedFiles[ file ].data( 'session', session );
                        setContent();
                    }, error: function( xhr ) {
                        if( xhr.status == 404 ) {
                            var session = monaco.editor.createModel( '', mode );
                            session.onDidChangeContent( function( e ) {
                                if( session.getAlternativeVersionId() != openedFiles[ file ].data( 'lastSavedAt' ) ) {
                                    $( '#fileExplorer' ).find( '.node:has(> div > input[value="' + file + '"])' ).addClass( 'unsaved' );
                                    openedFiles[ file ].addClass( 'unsaved' );
                                }
                                else {
                                    openedFiles[ file ].removeClass( 'unsaved' );
                                    $( '#fileExplorer' ).find( '.node:has(> div > input[value="' + file + '"])' ).removeClass( 'unsaved' );
                                }
                            });

                            openedFiles[ file ].data( 'session', session );
                            activeFile = file;
                            setContent();
                        }
                    }
                });
            }
            else {
                setContent();
            }
        };
        var activeFile = null;
        window.initEditor = function( editor ) {

        }
        var closeFile = function( file ) {
            var isActive = openedFiles[ file ].is( '.active' );
            if( isActive ) {
                var index = openedFiles[ file ].index();
                var parent = openedFiles[ file ].parent();
            }
            openedFiles[ file ].remove();
            if( isActive )
                activeFile = Object.keys( openedFiles )[ Math.max( 0, index - 1 ) ];
            delete openedFiles[ file ];
            if( isActive )
                setContent();
        };
        var setContent = function() {
            $( '#fileTabs .active' ).removeClass( 'active' );
            if( openedFiles[ activeFile ] ) {
                openedFiles[ activeFile ].addClass( 'active' );
                openedFiles[ activeFile ].data( 'document' )
                editor.setModel( openedFiles[ activeFile ].data( 'session' ) );
            }
            else
                editor.setModel( monaco.editor.createModel( '', 'text' ) );
            $( '#fileExplorer' ).tree( 'focus', activeFile );
            editor.focus();
        };

        $( '#git' ).on( 'click', '.fa-upload', function() {
            var treeNode = $( this ).closest( '.node' );
            var node = treeNode.data( 'node' );
            $.ajax( {
                url: '/api/explorer/git/stage/' + encodeURIComponent( node.path ) + '?root=' + encodeURIComponent( node.parent.path ), type: 'post', success: function() {
                    $( '#git' ).tree( 'refresh' );
                }
            });
        });
        $( '#git' ).tree( {
            source: '/api/explorer/git',
            children: function( node ) {
                return node.files;
            },
            label: function( node ) {
                var actions = '<span class="fa fa-upload pull-right"></span>';
                var classNames = 'glyphicon ';
                if( node.files )
                    classNames += 'glyphicon-folder-close';
                else {
                    var extension = node.path.match( /\.[A-Z]+$/i );
                    if( extension )
                        switch( extension[ 0 ] ) {
                            case '.css':
                                classNames += 'css ';
                                break;
                            case '.html':
                            case '.htm':
                                classNames += 'html ';
                                break;
                            case '.xml':
                                classNames += 'xml ';
                                break;
                            case '.json':
                                classNames += 'json ';
                                break;
                            case '.sh':
                                classNames += 'sh ';
                                break;
                            case '.js':
                            case '.jnode':
                            case '.onsm':
                                classNames += 'js ';
                                break;
                            default:
                                classNames += 'glyphicon-file ';
                                break;
                        }
                    else
                        classNames += 'glyphicon-file ';
                    if( node.status.indexOf( 'WT_NEW' ) > -1 ) {
                        actions = '<span class="fa fa-question-circle"></span>' + actions;
                    }
                }
                return actions + '<span class="' + classNames + '"></span>\
                 '+ node.path;
            },
            focusedNodeChanged: function( ev, treeNode, target ) {
                if( target ) {
                    var file = $( treeNode ).data( 'node' ).url;
                    if( !$( treeNode ).data( 'node' ).isLeaf ) {
                        $( '#fileExplorer' ).data( 'treeOptions' )._toggleTreeNode.call( treeNode );
                    }
                    else {
                        activeFile = file;
                        openFile( file );
                    }
                }
            },
            loaded: function() { }
        });

        $( '#fileExplorer' ).tree( {
            source: '/api/explorer',
            toggled: function() { $( '> .ui-state-focus', this ).toggleClass( 'ui-state-active' ); },
            label: function( node ) {
                var classNames = 'glyphicon ';
                if( !node.isLeaf )
                    classNames += 'glyphicon-folder-close';
                else {
                    var extension = node.name.match( /\.[A-Z]+$/i );
                    if( extension )
                        switch( extension[ 0 ] ) {
                            case '.css':
                                classNames += 'css ';
                                break;
                            case '.html':
                            case '.htm':
                                classNames += 'html ';
                                break;
                            case '.xml':
                                classNames += 'xml ';
                                break;
                            case '.json':
                                classNames += 'json ';
                                break;
                            case '.sh':
                                classNames += 'sh ';
                                break;
                            case '.js':
                            case '.jnode':
                            case '.onsm':
                                classNames += 'js ';
                                break;
                            default:
                                classNames += 'glyphicon-file ';
                                break;
                        }
                    else
                        classNames += 'glyphicon-file ';
                }
                if( node.hasChanged )
                    return '<span class="glyphicon glyphicon-exclamation-sign"></span>\
                     <span class="has-changed '+ classNames + '"></span>\
                     <span class="glyphicon glyphicon-refresh refresh pull-right"></span>\
                     <span class="glyphicon glyphicon-plus addFolder pull-right"></span>\
                     <span class="glyphicon glyphicon-plus addFile pull-right"></span>\
                     '+ node.name;
                return '<span class="' + classNames + '"></span>\
                 <span class="glyphicon glyphicon-refresh refresh pull-right"></span>\
                 <span class="glyphicon glyphicon-plus addFolder pull-right"></span>\
                 <span class="glyphicon glyphicon-plus addFile pull-right"></span>\
                 '+ node.name;
            },
            key: function( node ) { return node.url; },
            children: function( node ) { return !node.isLeaf && node.url; },
            focusedNodeChanged: function( ev, treeNode, target ) {

                if( !target ) {
                    arrowFunctions.scrollTo( treeNode );
                    return;
                }
                var file = $( treeNode ).data( 'node' ).url;
                if( !$( treeNode ).data( 'node' ).isLeaf ) {
                    $( '#fileExplorer' ).data( 'treeOptions' )._toggleTreeNode.call( treeNode );
                }
                else {
                    activeFile = file;
                    openFile( file );
                }
            },
            loaded: function() { }
        });
    }) );
});

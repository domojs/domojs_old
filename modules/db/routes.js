 route.on('db', function(url, params, unchanged){
    var reload=arguments.callee;
    $.ajax(loadHtml('db', function(){
            $('#tree').tree({
            source:'/db/list',
            toggled:function(){$('> .ui-state-focus', this).toggleClass('ui-state-active'); },
            label:function(node){
                return node.name;
            },
            key:function(node){ return node.level+'-'+node.name },
            children:function(node){ return node.children },
            focusedNodeChanged:function(ev, treeNode)
            {
                var node=$(treeNode).data('node');
                if(node.level<1)
                    $('#tree').data('treeOptions')._toggleTreeNode.call(treeNode);
                else
                {
                    $.get(node.children, function(result){
                        var details=$('#details');
                        details.empty();
                        if($.isArray(result))
                        {
                            details=$('<ul></ul>').appendTo(details);
                            $.each(result, function(){
                                $('<li></li>').text(this).appendTo(details);
                            });
                        }
                        else if($.isPlainObject(result))
                        {
                            details=$('<table></table>').appendTo(details);
                            $.each(Object.keys(result), function(){
                                $('<tr></tr>')
                                    .append($('<th></th>').text(this))
                                    .append($('<td></td>').text(result[this]))
                                    .appendTo(details);
                            });
                        }
                        else
                            details.text(JSON.stringify(result));
                    });
                }
            }
        });
    }));
});
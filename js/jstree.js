(function ($) {
    var toggleTreeNode = function(ev) {
        var treeNode = $(this).closest("div.node") //parent();
        var node = treeNode.data('node');
        if (node.IsValid !== false) {
            var treeOptions = treeNode.data('root').data('treeOptions');
            if (!$(ev && ev.target).is(":input")) {
                if (typeof(treeOptions.children(node)) != 'undefined' && treeOptions.children(node).length > 0 && treeNode.children('ul').length == 0) {
                    treeNode.tree('load', treeOptions.children(node));
                } else {
                    if (typeof(treeOptions.children(node)) == 'undefined' || treeOptions.children(node).length == 0) $(this).removeClass('ui-icon');
                    treeNode.find('ul:first').toggle();
                }
                treeNode.parent().toggleClass(treeOptions.expandedClass).toggleClass(treeOptions.collapsedClass);
            }
        }
        if (ev)
                ev.preventDefault();
        };

    var highlight = function (treeNode) {
        treeNode.find('.ui-state-default:first').addClass('ui-state-hover'); //.removeClass('ui-state-default');
    };
    var lowlight = function (treeNode) {
        treeNode.find('.ui-state-default:first').removeClass('ui-state-hover'); //.addClass('ui-state-default');
    };

    var focus = function (treeNode, ev) {
        var root = treeNode.data('root');
        var event = $.Event('tree.focusedNodeChanging');
        event.target = ev && ev.target;
        root.trigger(event, treeNode);
        if(event.isDefaultPrevented())
            return false;
        root.find('input[type=hidden].focusedNode').val(treeNode.data('node').value);
        root.find('.ui-state-focus').removeClass('ui-state-focus');
        treeNode.find('.ui-state-default:first').addClass('ui-state-focus');
        root.trigger({ type: 'tree.focusedNodeChanged', target: ev && ev.target }, treeNode);
    };

    var refresh = function (treeNode) {
        $.ajax({
            type: 'get',
            url: treeNode.data("node").self,
            data: { "id": treeNode.data('root').data('treeOptions').key(treeNode.data("node")) },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            cache: false,
            success: function (msg) {
                UpdateNode(treeNode, msg.d);
            },
            error: function (msg) {
                alert(msg.statusText);
            }
        });
    }
    function UpdateNode(treeNode, newValues) {
        if (!newValues) {
            treeNode.remove();
            return;
        }
        var treeOptions = treeNode.data('root').data('treeOptions');
        var child = treeNode.find(".ui-state-default:first");

        treeNode.find(".label:first").html(treeOptions.label(newValues));
        if (newValues.IsEnabled == child.hasClass("ui-state-disabled"))
            child.toggleClass("ui-state-disabled");

        if (treeNode.parent().hasClass(treeOptions.expandedClass))
            toggleTreeNode.call(child);
        $('.ui-icon:first', treeNode).css('background-position', '');
        treeNode.find('ul:first').remove();
        if (treeNode.parent().hasClass(treeOptions.collapsedClass))
            toggleTreeNode.call(child);
    }

    $.extend($.fn, {
        tree: function (options, value) {
            if (typeof (options) == 'string') {
                var treeNode;
                switch (options) {
                    case "refresh":
                        refresh($("#levels .ui-state-focus").closest(".node"));
                        break;
                    case 'focus':
                        focus($(this).find('.node input[value="' + value + '"]'));
                        break;
                    case 'select':

                        selection = value;
                        $(this).data('root').find("input").each(function (j, it) { it.checked = false; });
                        for (var i = 0; i < value.length; i++) {
                            treeNode = $(this).data('root').find(".node>div:has(input[value='" + value[i] + "'])");
                            treeNode.find('input[value="' + value[i] + '"]').each(function (j, it) {
                                it.checked = true;
                            });
                            if ($(this).data('root').data('treeOptions').focusable) focus(treeNode);
                        }
                        $(this).data('root').trigger({ type: 'tree.selectionChanged' }, $(this).data('root'));
                        break;
                    case 'loaded':
                        this.bind('tree.loaded', value);
                        break;
                    case 'load':
                        if ($.isArray(value)) {
                            this.data('tree', value);
                            var selector = this;
                            var root = selector.data('root');
                            if (typeof (root) == 'undefined') {
                                selector.data('root', selector);
                                root = selector;
                            }
                            var childNodes = $('<ul />').data('tree', value);
                            if (value.length == 0)
                                $('.ui-icon:first', selector).css('background-position', '-112px -144px');
                            else
							{
								var treeOptions=root.data('treeOptions');
                                $.each(value, function (i, node) {
                                    node.value = treeOptions.value(node, value);
                                    treeNode = $('<div class="node" />').data('node', node).data('root', root)
                                        .append($('<div class="ui-state-default ui-state-' + treeOptions.state(node) + '"><span class="ui-icon">&nbsp;</span></div>')//.click(toggleTreeNode)
                                        .append('<span class="label">' + root.data('treeOptions').label(node) + '</span>'));
                                    if (typeof (treeOptions.children(node)) == 'undefined' || !treeOptions.children(node) || treeOptions.children(node).length == 0)
                                        $('.ui-icon:first', treeNode).css('background-position', '-112px -144px');
                                    if (root.data('treeOptions').multiple) {
                                        var inputTmpl = $('<input type="checkbox" name="' + root[0].id + '" value="' + node.value + '" />');
                                        var selection = root.find('input[type=hidden].selection').val().split(';');
                                        if (selection.indexOf(node.value) >= 0 || selector.find('input:checkbox:checked').length)
                                            inputTmpl.prop('checked', 'checked');
                                        treeNode.find(':first-child:first').prepend(inputTmpl);
                                        inputTmpl.click(function () {
                                            if (selection) {
                                                var checkbox = $(this)[0];
                                                if (checkbox.checked)
                                                    selection.push(checkbox.value);
                                                else {
                                                    var val = parseInt(checkbox.value);
                                                    var index = selection.indexOf(val);
                                                    selection.splice(index, 1);
                                                }
                                            }
                                            self = $(this);
                                            self.parents('.node:first').find('ul > li > .node input:checkbox').prop('checked', self.prop('checked'));
                                            self.parentsUntil(root, 'div.node').each(function (index, parent) {
                                                parent = $(parent);
                                                if (parent.find('ul:first > li > .node input:checkbox').length - parent.find('ul:first > li > .node input:checkbox:checked').length > 0) {
                                                    parent.find('input:checkbox:first').removeAttr('checked');
                                                    if (parent.find('ul:first > li > .node input:checkbox:checked').length > 0)
                                                        parent.find('input:checkbox:first').prop('indeterminate', 'true');
                                                    else
                                                        parent.find('input:checkbox:first').removeProp('indeterminate');
                                                }
                                                else {
                                                    if (self[0] == parent.find('input:checkbox:first')[0])
                                                        return;
                                                    parent.find('input:checkbox:first').prop('checked', 'checked');
                                                    parent.find('input:checkbox:first').removeProp('indeterminate');
                                                }
                                            });
                                            self.find('input[type=hidden].selection').val(selection.join(';'));
                                            root.trigger({ type: 'tree.selectionChanged' }, root);
                                        });
                                    }
                                    childNodes.append($('<li class="collapsed"/>').append(treeNode));
                                    treeNode.find("span.ui-icon").click(toggleTreeNode);

                                    if (selection)
                                        $.each(selection, function (i, selectedItem) {
                                            var nodeValue = node.value;
                                            if ((selectedItem + '/').substr(0, nodeValue.length + 1) == nodeValue + '/' && nodeValue.length != selectedItem.length) {
                                                treeNode.find('input:checkbox:first').prop('indeterminate', 'true');
                                            }
                                        });
                                });
							}
                            selector.append(childNodes);
                            root.trigger('tree.loaded');
                        }
                        else {
                            if (typeof (value) == 'string') {
                                var self = this;
                                value = {
                                    url: value,
                                    cache: false,
                                    type: 'get',
                                    success: function (data) {
                                        if (self.data('root'))
                                            $.extend(data.d, {
                                                parentKey: self.data('root').data('treeOptions').key(self.data('node')),
                                                parentValue: self.data('node').value
                                            });
                                        self.tree('load', data.d || $.isArray(data) && data);
                                    }
                                };
                                if (typeof (this.data('root')) != 'undefined')
                                    $.extend(value, { data: { parentKey: this.data('root').data('treeOptions').key(this.data('node')) } });
                            }
                            $.ajax(value);
                        }
                        break;
                    case 'option':
                        if (typeof (value) == 'undefined')
                            return this.data('treeOptions') || this.data('root').data('treeOptions');
                        if (value == "selection")
                            return this.find('input[type=hidden].selection').val();
                        if (value == "focus")
                            return this.find('.node:has(> .ui-state-focus)').data('node');
                }
            } else {
                options = $.extend({}, {
                    autoload: true,
                    multiple: false,
                    collapsedClass: 'collapsed',
                    expandedClass: 'expanded',
                    focusable: true,
                    nodeKey: 'key',
                    key: function (node) { return node[this.nodeKey]; },
                    value: function (node) { return options.key(node); },
                    label: function (node) { return node.label; },
					children: function(node) { return node.children; },
                    state: function () { return 'default'; },
                    _toggleTreeNode: toggleTreeNode
                }, options);

                this.data('treeOptions', options);

                this.each(function (index, item) {
                    $(item).filter(':not(:has(input[type=hidden].selection))').append('<input type="hidden" name="' + this.id + '" class="selection">');
                });

                if (options.autoload) this.tree('load', options.source);

                if (typeof (options.focusedNodeChanged) != 'undefined')
                    this.bind('tree.focusedNodeChanged', options.focusedNodeChanged);
                
                if (typeof (options.focusedNodeChanging) != 'undefined')
                    this.bind('tree.focusedNodeChanging', options.focusedNodeChanging);
                if (typeof (options.selectionChanged) != 'undefined')
                    this.bind('tree.selectionChanged', options.selectionChanged);

                this.addClass('ui-widget-tree ui-widget');

                this.on('mouseenter', 'li .node', function () {
                    highlight($(this));
                });
                this.on('mouseleave', 'li .node', function () {
                    lowlight($(this));
                });
                if (options.focusable) {
                    this.on('click', 'li .node', function (ev) {
                        focus($(this), ev);
                        ev.stopPropagation();
                    });
                }
            }
        }
    });
})(jQuery);

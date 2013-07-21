(function ($) {

    $.extend($.fn, {
        bindKey: function (hotkey, handler) {
            hotkey = hotkey.toLowerCase();
            var needCtrl = /ctrl\+/.test(hotkey);
            var needAlt = /alt\+/.test(hotkey);
            var needShift = /shift\+/.test(hotkey);
            var key = hotkey.match(/(^|\+)([^\+]+)$/)[2];
            var charCode;
            switch (key) {
                case 'esc':
                    charCode = 27;
                    break;
                case 'enter':
                    charCode = 13;
                    break;
                case 'backspace':
                    charCode = 8;
                    break;
				case 'space':
					charCode=32;
					break;
				case 'left':
					charCode=37;
					break;
				case 'up':
					charCode=38;
					break;
				case 'right':
					charCode=39;
					break;
				case 'down':
					charCode=40;
					break;
				case 'plus':
					charCode=107;
					break;
				case 'minus':
					charCode=109;
					break;
				case '²':
					charCode=222;
					break;
                default:
                    charCode = key.charCodeAt(1) - 97 + 65;
                    break;
            }

            return this.bind('keydown', function (evt) {
                if (needCtrl != evt.ctrlKey) return;
                if (needAlt != evt.altKey) return;
                if (needShift != evt.shiftKey) return;

                var result = true;

                if (evt.keyCode == charCode) result = handler(evt);

                if (result === false) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    evt.keyCode = 0;
                    evt.cancelBubble = true;
                    evt.returnValue = false;
                    if (window.event) try {
                        window.event.keyCode = 0;
                    } catch (e) { }
                    return false;
                }
            });
        }
    });

    /*********  New Variable function only here for the Variable extender purpose **************************/
    $.fn.newVariable = function (options) {
        if (typeof (options.name) == 'undefined')
            options.name = this.selector;
        window[options.name] = this;
    }; /*********  Drop down menu (the equivalent of the ajax control toolkit extender)  **************************/
    $.fn.dropdown = function (options) {

        var defaults = {
            highlightClass: 'ui-state-highlight',
            displayArrow: true
        };

        var opt = $.extend({}, defaults, options);
        if (typeof (opt.dropDowns) == 'undefined')
            throw "You have not defined drop down(s)";
        if (typeof (opt.dropDowns) == 'string')
            opt.dropDowns = $(opt.dropDowns);
        if (opt.method == "reapply") {
            $.fn.dropdown.reapply.call(this, options);
            return;
        }

        opt.dropDowns
        .hide()
        .live('mousemove', function () { $(this).stop(true, false); })
        .live('mouseout', function () {
            $(this).animate({ duration: 200 }, {
                step: function () { }, complete: function () {
                    $(this).data('source').removeClass(opt.highlightClass);
                    $(this).hide();
                    if (opt.displayArrow)
                        $('#dropdown_arrow', $(this).data('source')).remove();
                }
            });
        });
        this.live('mouseover', function () {
            var jq = $(this);
            $(this).data('target').stop(true, false).data('source', jq).positionTo({ parentSelector: $(this), parentAlignment: ["left", "bottom"], childAlignment: ["left", "top"] });

            //        .css({ 'position': 'absolute', 'left': $(this).offset().left, 'top': $(this).offset().top + 4 + $(this).height() });
            if (!jq.hasClass(opt.highlightClass)) {
                jq.addClass(opt.highlightClass);
                if (opt.displayArrow) {
                    jq.prepend($('<div id="dropdown_arrow" class="' + opt.highlightClass + '" style="border-top:none;border-right:none;border-bottom:none;float:right;text-align:center;background-color:#9999FF;"><div style="width:0px;height:0px; border-left:solid #9999FF 3px;border-right:solid #9999FF 3px;border-top:solid black 3px "></div></div>'));
                    $('#dropdown_arrow', jq).height(jq.innerHeight()).width(jq.innerHeight()).children("div").css({ 'margin-top': 3 * jq.innerHeight() / 8, 'border-top-width': jq.innerHeight() / 4, 'border-left-width': jq.innerHeight() / 4, 'border-right-width': jq.innerHeight() / 4 });
                }
            }
        })
    .live('mouseout', function () {
        $(this).data('target').animate({ duration: 200 }, {
            step: function () { }, complete: function () {
                var source = $(this).data('source');
                source.removeClass(opt.highlightClass);
                $(this).hide();
                $('#dropdown_arrow', source).remove();
            }
        });
    });
        $.fn.dropdown.reapply.call(this, opt);
    };
    $.fn.dropdown.reapply = function (opt) {
        if (typeof (opt.dropDowns) == 'string')
            opt.dropDowns = $(opt.dropDowns);

        if (opt.dropDowns.length && opt.dropDowns.length == this.length && opt.dropDowns.length != 1)
            this.each(function (index) {
                var element = this;
                opt.dropDowns.each(function (i) {
                    if (index == i) {
                        $(element).data('target', this).bind('click', function () {
                            $(this).show();
                        });
                        if (opt.show)
                            $(element).bind('click', opt.show);

                    }
                });
            });
        else {
            var targets = $(this);
            if (opt.show)
                targets.bind('click', opt.show);
            $(this).data('target', $(opt.dropDowns[0])).bind('click', function () { $(this).data('target').show(); });
        }
    }; /*********  Cascading drop down list (equivalent to the AjaxControlToolkit extender)  **************************/
    $.fn.cascade = function (options) {
        var defaults = {
            useLiveQuery: true,
            useWebService: false,
            webServiceUrl: null,
            webServiceMethod: "GetElements",
            getValues: null,
            classPrefix: "sub_",
            addDefaultOption: true,
            defaultValue: "",
            defaultText: "-- Select an option --",
            focusTarget: true
        };
        var opt = $.extend({}, defaults, options);
        if (!opt.parentDropDowns)
            throw "A parent drop down should be specified";
        if (typeof (opt.parentDropDowns) == 'string')
            opt.parentDropDowns = $(opt.parentDropDowns);
        var targets = this;
        var getValuesFromWebService = function () {
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: opt.webServiceUrl + "/" + opt.webServiceMethod,
                data: "{ selectedValue:" + $(this).val() + " }",
                dataType: "json",
                complete: function (data) {
                    if (typeof (data) == 'string')
                        data = eval(data);
                    targets.empty();
                    if (opt.addDefaultOption)
                        targets.append('<option value="' + opt.defaultValue + '">' + opt.defaultText + '</option>');
                    $.each(data, function (key, value) {
                        targets.append('<option value="' + key + '">' + value + '</option>');
                    });
                    if (opt.focusTarget)
                        targets.focus();
                }
            });
        };
        var getValuesFromClass = function () {
            targets.each(function () {
                if (!$(this).data('items')) {
                    $(this).data('items', $.map($('option'), function (element) {
                        return { className: element.className, key: element.value, value: $(element).text() };
                    }));
                }
            });
            $('option', targets).remove();
            var selectedValue = $(this).val();
            targets.empty();
            if (opt.addDefaultOption)
                targets.append('<option value="' + opt.defaultValue + '">' + opt.defaultText + '</option>');
            targets.each(function () {
                var target = $(this);
                var selectOptions = $.grep(target.data('items'), function (element) { return element.className == opt.classPrefix + selectedValue; });
                $.each(selectOptions, function () {
                    target.append('<option value="' + this.key + '">' + this.value + '</option>');
                });
            });
            targets.val(0);
            targets.change();
            if (opt.focusTarget)
                targets.focus();
        };
        if (!opt.getValues) {
            if (opt.useWebService)
                opt.getValues = getValuesFromWebService;
            else
                opt.getValues = getValuesFromClass;
        }

        if (opt.useLiveQuery)
            opt.parentDropDowns.bind('change', opt.getValues);
        else
            opt.parentDropDowns.live('change', opt.getValues);
        opt.parentDropDowns.change();
    };
    $.caret = {
        pos: function (ctrl, pos) {
            return this.position(ctrl, pos);
        },
        position: function (ctrl, pos, selectFromLastPosition) {
            if (typeof (pos) == 'undefined') {
                var CaretPos = 0;
                // IE Support
                if (document.selection) {

                    ctrl.focus();
                    var Sel = document.selection.createRange();
                    var SelLength = document.selection.createRange().text.length;
                    Sel.moveStart('character', -ctrl.value.length);
                    CaretPos = Sel.text.length - SelLength;
                }
                    // Firefox support
                else if (ctrl.selectionStart || ctrl.selectionStart == '0')
                    CaretPos = ctrl.selectionStart;

                return (CaretPos);
            }
            else {

                // IE Support
                if (document.selection) {

                    // Set focus on the element
                    ctrl.focus();

                    // Create empty selection range
                    var caret = this.position(ctrl);
                    var oSel = document.selection.createRange();

                    // Move selection start and end to 0 position
                    oSel.moveEnd('character', -ctrl.value.length);

                    // Move selection start and end to desired position
                    if (selectFromLastPosition) {
                        if (caret > pos) {
                            oSel.moveStart('character', pos);
                            oSel.moveEnd('character', caret);
                        }
                        else {
                            oSel.moveStart('character', caret);
                            oSel.moveEnd('character', pos);
                        }
                    }
                    else {
                        oSel.moveStart('character', pos);
                    }


                    oSel.select();
                }

                    // Firefox support
                else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
                    ctrl.selectionStart = pos;
                    ctrl.selectionEnd = pos;
                    ctrl.focus();
                }
            }
        }
    };

    /*********  List selector (equivalent to the sharepoint user selection interface)  **************************/
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function (ul, items) {
            var that = this,
              currentCategory = "";
            $.each(items, function (index, item) {
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                that._renderItemData(ul, item);
            });
        }
    });

    $.extend($.fn, {
        tag: function (options) {

            if (typeof (options) == 'string' && options == 'values') {
                if (this.val() === '')
                    return [];
                return this.val().split(this.data('tag-options').separator);
            }

            if (typeof (options) == 'string' && options == 'clear') {
                this.val('');
                this.closest('.ui-widget-taglist').find('li:not(.input)').remove();
                return;
            }

            if (typeof (options) == 'string' && options == 'autocomplete.open') {
                this.autocomplete('search', '');
                return;
            }

            if (typeof (options) == 'string' && options == 'select') {
                this.data('tag-options')._select.call(this, { target: this }, arguments[1], arguments[2]);
                return;
            }

            options = $.extend({}, {
                separator: ',',
                autocompleteValidates: true,
                autocompleteFunction: 'autocomplete'
            }, options);
            var selector = this;

            selector = $($.grep(selector, function (v) { return !$(v).data('tag-options'); }));

            if (selector.length == 0)
                return;

            selector.data('tag-options', options);

            var select = function (ev, value, text, resolving) {
                if (!resolving && new RegExp('^' + value + '(;|$)|;' + value + '(;|$)').test($(ev.target).val()))
                    return false;
                if (typeof (options.limit) != 'undefined' && $(ev.target).closest('.ui-widget-taglist').find('li:not(.input)').length == options.limit)
                    return false;
                if (typeof (text) == 'undefined')
                    text = value;
                $(ev.target).closest('li.input').before($('<li class="tag ui-state-default">' + text + '</li>').append('<span class="ui-icon ui-icon-close" />').data('value', value).hover(function () {
                    $(this).addClass('ui-state-hover').removeClass('ui-state-default');
                }, function () {
                    $(this).removeClass('ui-state-hover').addClass('ui-state-default');
                }));
                var original = $(this).closest('.ui-widget-taglist').find(selector);
                if (!resolving) {
                    if (original.val())
                        original.val(original.val() + options.separator + value);
                    else
                        original.val(value);

                    selector.trigger('tag.add', { value: value, text: text });
                }
                $(this).not(original).val('');
            };
            var remove = function (item) {

                var original = $(item).parent().find(selector);
                if (original.attr('readonly') || original.attr('disabled') || original.hasClass('aspNetDisabled'))
                    return false;
                var value = item.data('value');
                if (original.val() != value)
                    original.val(original.val().replace(new RegExp('^' + value + options.separator + '?'), '').replace(new RegExp(options.separator + value + options.separator), options.separator).replace(new RegExp(options.separator + value + '$'), ''));
                else
                    original.val('');
                item.remove();
                selector.trigger('tag.remove', { value: value, text: item.text() });

            };

            $.extend(options, { _select: select, _remove: remove });

            this.wrap($('<ul class="ui-widget ui-widget-taglist"><li class="input"></li></ul>').click(function () {
                $(this).find('li:not(.normalizer):last input.input[type="text"]').focus();
            })).css({ 'position': 'relative' });
            taglists = this.parents('ul.ui-widget-taglist');
            newInput = $('<input type="text" class="input" />');

            this.css({ 'display': 'none' }).after(newInput);
            this.parent().after('<li class="input normalizer"></li>');
            
            this.each(function () {
                if (this.disabled)
                    $(this).find('~ .input').attr('disabled', 'disabled').addClass(this.className);
                if ($(this).val() != '') {
                    if (typeof (options.resolve) != 'undefined') {
                        var self = this;
                        var singleParentSelector = $(this).closest('.ui-widget-taglist');
                        options.resolve($(this), function (value, text) { select.call(singleParentSelector, { target: self }, value, text, true); });
                    }
                    else
                        throw 'You have not defined any resolver (function able to translate values to tag), but you have at least one value in your list';
                }
            });
            if (typeof (options.autocomplete) != 'undefined') {
                var autocomplete = $.extend({}, options.autocomplete, {
                    select: function (ev, ui) {
                        select.call(this, ev, ui.item.value, ui.item.label);
                        return false;
                    }
                });
                selector.find('~ .input')[options.autocompleteFunction](autocomplete).focus(function (ev) {
                    if (options.autocomplete.minLength === 0 && options.limit > selector.find('~ .input :first').tag('values').length) {
                        $(ev.target)[options.autocompleteFunction]("search");
                    }
                });
            }
            $('input.input', taglists).bindKey('Esc', function (ev) {
                $(ev.target).val('');
            }).bindKey('Enter', function (ev) {
                if (!$(ev.target).val()) return false;
                if (options.autocompleteValidates && options.autocomplete) {
                    //return true;
                }
                select.call(ev.target, ev, $(ev.target).val());
            }).bindKey('backspace', function (ev) {
                if ($(ev.target).val() === '') {
                    remove($(ev.target).parents('ul.ui-widget-taglist:first').find('li:not(.input):last'));
                    return false;
                }
            }).on('keypress', function (ev) {
                if (typeof (options.limit) != 'undefined' && $(ev.target).parents('.ui-widget-taglist:first').find('li:not(.input)').length == options.limit) {
                    ev.preventDefault();
                    return false;
                }
            });
            selector.parents('.ui-widget-taglist').on('click', 'li .ui-icon-close', function (ev) {
                remove($(this).parent('li'));
            });

            if (options.add)
                selector.on('tag.add', options.add);
            if (options.add)
                selector.on('tag.remove', options.add);
        }
    });


    /*********  Tooltip   **************************/
    $.fn.tooltip = function (options) {
        var opt = $.extend({}, $.fn.tooltip.defaults, options);
        if (typeof (opt.tooltipSelector) == 'string')
            opt.tooltipSelector = $(opt.tooltipSelector);
        opt.tooltipSelector
        .live('mousemove', function () { showIfViewable($(this)); })
        .live('mouseout', function () { $.fn.tooltip.hide($(this)); })
        .hide().fadeTo(0, 0);
        this
        .live('mouseover', function () {
            var rssItem = $(this).parents(opt.parentRelativeSelector).get(0);
            showIfViewable($(opt.tooltipSelector.selector, rssItem).css('position', 'absolute'), $(this), opt.tooltipAlignment);
        })
        .live('mouseout', function (e) {
            var rssItem = $(this).parents(opt.parentRelativeSelector).get(0);
            $.fn.tooltip.hide($(opt.tooltipSelector.selector, rssItem));
        });


        function showIfViewable(tooltip, relative, alignments_orig) {
            var defaultalignments = { parent: { horizontal: 'center', vertical: 'bottom' }, child: { horizontal: 'center', vertical: 'top' } };
            var alignments = $.extend({}, defaultalignments, alignments_orig);
            if (relative) {
                tooltip.positionTo({ parentSelector: relative, parentAlignment: [alignments.parent.horizontal, alignments.parent.vertical], childAlignment: [alignments.child.horizontal, alignments.child.vertical] });
            }
            if (!$.fn.tooltip.show(tooltip).visible() && relative) {
                var tooltipBounds = $.bounds(tooltip);
                var relativeBounds = $.bounds(relative);
                if (tooltipBounds.left() < 0) {
                    alignments.parent.horizontal = 'right';
                    alignments.child.horizontal = 'left';
                    alignments.parent.vertical = 'top';
                    alignments.child.vertical = 'top';
                }
                if (tooltipBounds.top() < 0) {
                    alignments.parent.vertical = 'top';
                    alignments.child.vertical = 'top';
                    alignments.parent.horizontal = 'right';
                    alignments.child.horizontal = 'left';
                }
                if (relativeBounds.right() + tooltipBounds.width() >= $.windowSize().width && relativeBounds.bottom() + tooltipBounds.height() >= $.windowSize().height) {
                    alignments.parent.vertical = 'bottom';
                    alignments.child.vertical = 'bottom';
                    alignments.parent.horizontal = 'left';
                    alignments.child.horizontal = 'right';
                }
                else if (relativeBounds.right() + tooltipBounds.width() >= $.windowSize().width) {
                    alignments.parent.horizontal = 'left';
                    alignments.child.horizontal = 'right';
                    alignments.parent.vertical = 'top';
                    alignments.child.vertical = 'top';
                }
                else if (relativeBounds.bottom() + tooltipBounds.height() >= $.windowSize().height) {
                    alignments.parent.vertical = 'bottom';
                    alignments.child.vertical = 'bottom';
                    alignments.parent.horizontal = 'right';
                    alignments.child.horizontal = 'left';
                }

                tooltip.positionTo({ parentSelector: relative, parentAlignment: [alignments.parent.horizontal, alignments.parent.vertical], childAlignment: [alignments.child.horizontal, alignments.child.vertical] });
                var relativeBounds_new = $.bounds(relative);

                //If the scroolbar has disappeared, reapply positionning
                if (relativeBounds.top() != relativeBounds_new.top() || relativeBounds.bottom() != relativeBounds_new.bottom() || relativeBounds.left() != relativeBounds_new.left() || relativeBounds.right() != relativeBounds_new.right())
                    tooltip.positionTo({ parentSelector: relative, parentAlignment: [alignments.parent.horizontal, alignments.parent.vertical], childAlignment: [alignments.child.horizontal, alignments.child.vertical] });
            }
        }
    };
    $.fn.tooltip.show = function (tooltip) {
        return tooltip.stop(true, false).css('display', 'block').fadeTo("normal", 1);
    };
    $.fn.tooltip.hide = function (tooltip) {
        return tooltip.fadeTo("normal", 0, function () { $(this).css('display', 'none'); });
    };
    $.fn.tooltip.defaults = { relativeSelector: true, tooltipSelector: '.tooltip', parentRelativeSelector: 'td' };

    $.extend({
        windowSize: function () {
            var myWidth = 0, myHeight = 0;
            if (typeof (window.innerWidth) == 'number') {
                //Non-IE
                myWidth = window.innerWidth;
                myHeight = window.innerHeight;
            } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                //IE 6+ in 'standards compliant mode'
                myWidth = document.documentElement.clientWidth;
                myHeight = document.documentElement.clientHeight;
            } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                //IE 4 compatible
                myWidth = document.body.clientWidth;
                myHeight = document.body.clientHeight;
            }
            return { height: myHeight, width: myWidth };
        }, bounds: function (position, size) {
            if (position.jquery) {
                return $.bounds(position.position(), { 'height': position.outerHeight(), 'width': position.outerWidth() });
            }
            return {
                position: position,
                size: size,
                height: function () { return size.height; },
                width: function () { return size.width; },
                top: function () { return position.top; },
                left: function () { return position.left; },
                bottom: function () { return this.top() + this.height(); },
                right: function () { return this.left() + this.width(); },
                In: function (bound) {
                    return this.left() > bound.left() &&
                    this.top() > bound.top() &&
                    this.right() < bound.right() &&
                    this.bottom() < bound.bottom();
                }
            };
        }
    });

    $.fn.visible = function (rect) {
        var result = true;
        if (!rect)
            rect = $.fn.visible.defaults;
        this.each(function () {
            if (!result)
                return;
            var size = { height: $(this).height(), width: $(this).width() };
            var position = $(this).position();
            var offset = $(this).offset();
            position.left += offset.left;
            position.top += offset.top;
            var bounds = $.bounds(position, size);
            return result = bounds.In(rect);
        });
        return result;
    };
    $.fn.visible.defaults = $.bounds({ top: 0, left: 0 }, { width: $.windowSize().width, height: $.windowSize().height });

    /*********  Syntaxic colorization (tried to make an equivalent to syntax highlighter)  **************************/
    $.fn.colorizeCode = function (options) {
        var opt = $.extend({}, $.fn.colorizeCode.defaults, options);
        this.addClass(opt.baseClass);
        var mode = opt.mode;
        if (mode == "xml")
            this.each($.fn.colorizeCode.xml);
        if (mode == "cs")
            this.each($.fn.colorizeCode.cs);
        if (mode == "string")
            this.each($.fn.colorizeCode.string);
    };
    $.fn.colorizeCode.findAndColorize = function (content) {
        return $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.languageBlock, content, function (match) {
            var languageBlock = $.fn.colorizeCode.languageBlock.regex().exec(match);
            var language = $.fn.colorizeCode;
            var languageBlockParts = languageBlock[1].split('.');
            for (var i = 0; i < languageBlockParts.length; i++)
                language = language[languageBlockParts[i]];
            return language(languageBlock[2]);
        });
    };
    $.fn.colorizeCode.defaults = { baseClass: "csharpcode", mode: "xml" };

    $.fn.colorizeCode.xml = function (content) {
        //var content = $(this).html().replace(/</gi, "&lt;").replace(/>/gi, "&gt;");
        var contentDefined = typeof (content) != 'undefined' && typeof (content) != 'number';
        if (!contentDefined)
            content = $(this).html();
        content = content.replace("{", "&#123;").replace("}", "&#125;");
        content = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.tagRegex, content, $.fn.colorizeCode.xml.replaceTag, function (match) {
            if (match == null)
                return "xml";
            var tag = $.fn.colorizeCode.tagRegex.regex().exec(match);
            if (tag[2] == "script" && tag[3].indexOf("runat=\"server\"") > 0)
                return "cs";
            return "xml";
        });
        content = $.fn.colorizeCode.findAndColorize(content);
        if (!contentDefined)
            $(this).html(content);
        else
            return content;
    };
    $.fn.colorizeCode.replaceMatch = function (customRegex, code, replacePattern, applyRules) {
        if (code.length <= 1)
            return code;
        var content = code;
        var matches = content.match(customRegex.regex());
        if (matches == null)
            return content;
        if (applyRules != null)
            replacePattern.currentLanguage = applyRules(null);
        for (var i = 0; i < matches.length; i++) {
            if (applyRules != null)
                replacePattern.nextLanguage = applyRules(matches[i]);
            content = content.replace(matches[i], replacePattern);
            replacePattern.currentLanguage = replacePattern.nextLanguage;
        }
        return content;
    };
    $.fn.colorizeCode.xml.replaceTag = function (match) {
        var tag = $.fn.colorizeCode.tagRegex.regex().exec(match);
        var attributes = "";
        if (typeof (tag) != 'undefined')
            attributes = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.attributeRegex, tag[3], $.fn.colorizeCode.xml.replaceAttribute);
        var startTag = "", endTag = "";
        if ($.fn.colorizeCode.xml.replaceTag.nextLanguage != $.fn.colorizeCode.xml.replaceTag.currentLanguage) {
            if ($.fn.colorizeCode.xml.replaceTag.currentLanguage == "xml")
                endTag = "{#" + $.fn.colorizeCode.xml.replaceTag.nextLanguage + "}";
            else {
                startTag = "{!" + $.fn.colorizeCode.xml.replaceTag.currentLanguage + "}";
            }
        }
        return startTag + "<span class='kwrd'>" + tag[1] + "</span>" + "<span class='html'>" + tag[2] + "</span>" + attributes + "<span class='kwrd'>" + tag[10] + "</span>" + endTag;
    };
    $.fn.colorizeCode.xml.replaceAttribute = function (match) {
        var attribute = $.fn.colorizeCode.attributeRegex.regex().exec(match);
        return " <span class='attr'>" + attribute[2] + "</span><span class='kwrd'>=" + attribute[3] + "</span>";
    };
    $.fn.colorizeCode.cs = function (content) {
        var contentDefined = typeof (content) != 'undefined' && typeof (content) != 'number';
        if (!contentDefined) {
            content = $(this).html();
        }
        content = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.cs.statement, content, $.fn.colorizeCode.cs.replaceStatement, function (match) {
            if (match == null)
                return "cs";
            if (match.match($.fn.colorizeCode.string.simpleQuote))
                return "string";
            if (match.match($.fn.colorizeCode.string.doubleQuotes))
                return "string";
            return "cs";
        });
        content = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.cs.method, content, $.fn.colorizeCode.cs.replaceMethod, function (match) {
            return "cs";
        });
        content = $.fn.colorizeCode.findAndColorize(content);
        if (!contentDefined)
            $(this).html(content);
        else
            return content;
    };
    $.fn.colorizeCode.cs.replaceStatement = function (match) {
        var statement = $.fn.colorizeCode.cs.statement.regex().exec(match);
        var startTag = "", endTag = "";
        if ($.fn.colorizeCode.cs.replaceStatement.nextLanguage != $.fn.colorizeCode.cs.replaceStatement.currentLanguage) {
            if ($.fn.colorizeCode.cs.replaceStatement.currentLanguage == "cs")
                endTag = "{#" + $.fn.colorizeCode.cs.replaceStatement.nextLanguage + "}";
            else {
                startTag = "{!" + $.fn.colorizeCode.cs.replaceStatement.currentLanguage + "}";
            }
        }

        return "<span class='kwrd'>" + statement[1] + "</span> " + statement[2] + "<span class='known'>" + statement[4] + "</span> " + startTag + statement[5] + statement[6] + endTag;
    };
    $.fn.colorizeCode.cs.replaceMethod = function (match) {
        var statement = $.fn.colorizeCode.cs.method.regex().exec(match);
        var parameters = statement[7];
        if (parameters != "()")
            parameters = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.cs.variableDeclaration, parameters, $.fn.colorizeCode.cs.replaceVariable);
        return "<span class='kwrd'>" + statement[1] + "</span>" + (typeof (statement[3]) == 'undefined' ? "" : statement[3]) + "<span class='" + $.fn.colorizeCode.cs.cssClassFor(statement[5]) + "'>" + statement[5] + "</span> " + statement[6] + " " + parameters;
    };
    $.fn.colorizeCode.cs.replaceVariable = function (match) {
        var statement = $.fn.colorizeCode.cs.variableDeclaration.regex().exec(match);
        return statement[1] + "<span class='" + $.fn.colorizeCode.cs.cssClassFor(statement[3]) + "'>" + statement[3] + "</span> " + statement[4];
    };
    $.fn.colorizeCode.cs.cssClassFor = function (keyword) {
        if (keyword == "void" || keyword == "object")
            return "kwrd";
        if (keyword == "int" || keyword == "double" || keyword == "string")
            return "kwrd";
        return "known";
    }; //                                                               &lt;_/_  _tag__ _______________attributes___________________________ _/_&gt;
    $.fn.colorizeCode.tagRegex = { regex: function () { return /(&lt;\/?)([^ &]+)(\s?(([^\/&])|(\/[^&])|(\/?&[^g])|(\/?&g[^t])|(\/?&gt[^;]))*)(\/?&gt;)/mgi; }, exec: function () { return this.regex().exec(arguments); } };
    //                                                                       attr_ =  'value_'  "value_"
    $.fn.colorizeCode.attributeRegex = { regex: function () { return /( ([^=]+)=(\'[^']*\'|\"[^"]*\"))/mgi; }, exec: function () { this.regex().exec(arguments); } };

    //                                                                   visib    nmspce   type   name    =     path    [idx]   (params)
    $.fn.colorizeCode.cs.statement = { regex: function () { return /(\w+[\s\b\t\n\r]+)*((\w+)\.)*(\w+)[\s\b\t\n\r]+(\w+)[\s\b\t\n\r]*(=[\s\b\t\n\r]*((\w+)(\[[^]]*\]|\(([^()]*|\([^)]*\)[^)]*\))+\))?(\.\w+(\[[^]]*\]|\(([^()]*|\([^)]*\)[^)]*\))+\))?))*)*;/mgi; } };
    //                                                                   visib  type  name    params
    $.fn.colorizeCode.cs.method = { regex: function () { return /((\w+\s)*)((\w+)\.)*(\w+)\s(\w+)\s?(\([^)]*\))/mgi; } };

    $.fn.colorizeCode.cs.ifStatement = { regex: function () { return /if\s?\([^)]\);/mgi; } };

    $.fn.colorizeCode.cs.variableDeclaration = { regex: function () { return /((\w+)\.)*(\w+)\s(\w+)/gi; } };
    $.fn.colorizeCode.languageBlock = { regex: function () { return /\{#([^}]+)\}([^{]*){![^}]+}/mgi; } };
    $.fn.colorizeCode.string = function (content) {
        var contentDefined = typeof (content) != 'undefined' && typeof (content) != 'number';
        if (!contentDefined)
            var content = $(this).html();
        content = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.string.simpleQuote, content, "<span class='str'>$&</span>");
        content = $.fn.colorizeCode.replaceMatch($.fn.colorizeCode.string.doubleQuote, content, "<span class='str'>$&</span>");
        if (contentDefined)
            return content;
        else
            $(this).html(content);
    };
    $.fn.colorizeCode.string.simpleQuote = { regex: function () { return /'([^\\']*|\\[^\\']*||\\')*'/gi; } };
    $.fn.colorizeCode.string.doubleQuotes = { regex: function () { return /"([^\\"]*|\\[^\\"]*||\\")*"/gi; } }; /*********  Equivalent to the ASPNET Ajax UpdatePanel  **************************/
    $.fn.updatePanel = function (options) {
        this.bind('update', $.fn.updatePanel.update);
        this.attr('isUpdatePanel', true);
        var forms = $(this).parents("form");
        $(":button, :submit, :image", forms).bind('click', function () { $('#__EVENTTARGET').val(this.name); });
        $(document).bind('navigate', function (jquery, newLocation, historyData) { $.historyStorage.put(newLocation, historyData); location.hash = newLocation; });
        $(document).bind('navigated', function (jquery, newLocation, historyData) {
            $(document).trigger('navigate', [newLocation, historyData]);
            $.ajax({ type: this.method, data: historyData, url: this.action, success: $.fn.updatePanel.update });

        });
        forms.bind('submit', $.fn.updatePanel.post);
        $($.historyStorage.init);
        $($.history.init);
    };
    $.fn.updatePanel.post = function () {
        var postData = "";
        $(":input", this).not(":button, :submit, :file, :reset, :image").each(function (i) {
            if (i > 0)
                postData += "&";
            postData += this.name + "=" + encodeURIComponent($(this).val());
        });
        $(document).trigger('navigated', ["#post/" + $('#__EVENTTARGET').val(), postData]);
        return false;
    };
    $.fn.updatePanel.update = function (content) {
        var newContent = $(content);
        $("*[isUpdatePanel=true]").each(function () {
            $(this).html($("#" + this.id, newContent).html());
            $(":button, :submit, :image", this).bind('click', function () { $('#__EVENTTARGET').val(this.name); });
        });
        $("input[type=hidden]").each(function () { $(this).val($("#" + this.id, newContent).val()); });
    };
    $.history = {

        init: function () {
            setInterval($.history.checkLocation, 200);
        },
        currentHash: null,

        checkLocation: function () {
            if ($.history.currentHash != location.hash) {
                $(document).trigger('navigated', [location.hash, $.historyStorage.get(location.hash)]);
                $.history.currentHash = location.hash;
            }
        }
    };

    $.historyStorage = {

        defaultOptions: {
            debugMode: false,
            /*Private - CSS strings utilized by both objects to hide or show behind-the-scenes DOM elements*/
            showStyles: 'border:0;margin:0;padding:0;',
            hideStyles: 'left:-1000px;top:-1000px;width:1px;height:1px;border:0;position:absolute;',

            toJSON: function (object) { return $.json.serialize(object); },
            fromJSON: function (json) { return $.json.deserialize(json); }
        },

        /*Public: Set up our historyStorage object for use by dhtmlHistory or other objects*/
        init: function () {
            var opt = $.extend({}, $.historyStorage.defaultOptions);
            /*
            options - object to store initialization parameters - passed in from dhtmlHistory or directly into historyStorage
            options.debugMode - boolean that causes hidden form fields to be shown for development purposes.
            options.toJSON - function to override default JSON stringifier
            options.fromJSON - function to override default JSON parser
            */
            $.historyStorage.debugMode = opt.debugMode;
            $.historyStorage.toJSON = opt.toJSON;
            $.historyStorage.fromJSON = opt.fromJSON;

            /*write a hidden form and textarea into the page; we'll stow our history stack here*/
            var formID = "rshStorageForm";
            var textareaID = "rshStorageField";
            var formStyles = opt.debugMode ? opt.showStyles : opt.hideStyles;
            var textareaStyles = (opt.debugMode
            ? 'width: 800px;height:80px;border:1px solid black;'
            : opt.hideStyles
        );
            $("body").append('<form id="' + formID + '" style="' + formStyles + '">'
            + '<textarea id="' + textareaID + '" style="' + textareaStyles + '"></textarea>'
        + '</form>');
            $.historyStorage.storageField = $("#" + textareaID);
            if (typeof window.opera !== "undefined") {
                $.historyStorage.storageField.focus(); /*Opera needs to focus this element before persisting values in it*/
            }
        },

        /*Public*/
        put: function (key, value) {

            var encodedKey = encodeURIComponent(key);

            $.historyStorage.assertValidKey(encodedKey);
            /*if we already have a value for this, remove the value before adding the new one*/
            if ($.historyStorage.hasKey(key)) {
                $.historyStorage.remove(key);
            }
            /*store this new key*/
            $.historyStorage.storageHash[encodedKey] = value;
            /*save and serialize the hashtable into the form*/
            $.historyStorage.saveHashTable();
        },

        /*Public*/
        get: function (key) {

            var encodedKey = encodeURIComponent(key);

            $.historyStorage.assertValidKey(encodedKey);
            /*make sure the hash table has been loaded from the form*/
            $.historyStorage.loadHashTable();
            var value = $.historyStorage.storageHash[encodedKey];
            if (value === undefined) {
                value = null;
            }
            return value;
        },

        /*Public*/
        remove: function (key) {

            var encodedKey = encodeURIComponent(key);

            $.historyStorage.assertValidKey(encodedKey);
            /*make sure the hash table has been loaded from the form*/
            $.historyStorage.loadHashTable();
            /*delete the value*/
            delete $.historyStorage.storageHash[encodedKey];
            /*serialize and save the hash table into the form*/
            $.historyStorage.saveHashTable();
        },

        /*Public: Clears out all saved data.*/
        reset: function () {
            $.historyStorage.storageField.value = "";
            $.historyStorage.storageHash = {};
        },

        /*Public*/
        hasKey: function (key) {

            var encodedKey = encodeURIComponent(key);

            $.historyStorage.assertValidKey(encodedKey);
            /*make sure the hash table has been loaded from the form*/
            $.historyStorage.loadHashTable();
            return (typeof $.historyStorage.storageHash[encodedKey] !== "undefined");
        },

        /*Public*/
        isValidKey: function (key) {
            return (typeof key === "string");
            //TODO - should we ban hash signs and other special characters?
        },

        /*Private: Our hash of key name/values.*/
        storageHash: {},

        /*Private: If true, we have loaded our hash table out of the storage form.*/
        hashLoaded: false,

        /*Private: DOM reference to our history field*/
        storageField: null,

        /*Private: Assert that a key is valid; throw an exception if it not.*/
        assertValidKey: function (key) {
            var isValid = $.historyStorage.isValidKey(key);
            if (!isValid && $.historyStorage.debugMode) {
                throw new Error("Please provide a valid key for $.historyStorage. Invalid key = " + key + ".");
            }
        },

        /*Private: Load the hash table up from the form.*/
        loadHashTable: function () {
            if (!$.historyStorage.hashLoaded) {
                var serializedHashTable = $.historyStorage.storageField.val();
                if (serializedHashTable !== "" && serializedHashTable !== null) {
                    $.historyStorage.storageHash = $.historyStorage.fromJSON(serializedHashTable);
                    $.historyStorage.hashLoaded = true;
                }
            }
        },
        /*Private: Save the hash table into the form.*/
        saveHashTable: function () {
            $.historyStorage.loadHashTable();
            var serializedHashTable = $.historyStorage.toJSON($.historyStorage.storageHash);
            $.historyStorage.storageField.val(serializedHashTable);
        }
    }; //$.dHtmlHistory.init();



    $.fn.mask = function (options) {

        if (typeof (options) == 'string')
            options = { mask: options };
        if (!options.regex) {
            options.regexes = [];
            options.regex = "^";
            for (var i = 0; i < options.mask.length; i++) {
                var match = options.mask.charAt(i);
                if (match == 9)
                    options.regex += "[0-9]";
                else if (match == "~")
                    options.regex += '(+|-)';
                else if (match == 'a')
                    options.regex += '[a-zA-Z]';
                else if (match == '*')
                    options.regex += '.';
                else
                    options.regex += match;

                options.regexes.push(options.regex);
            }
            options.regexes.push(options.regex + '$');
        }
        if (typeof (options.regex) == 'string')
            options.regex = new RegExp(options.regex);
        var opt = $.extend({}, $.fn.mask.defaultOptions, options);
        var keepSearching = true;
        var typeKey = function (event) {
            var $this = $(this);
            var c = event.charCode || event.keyCode;
            var val = $this.val();
            var caretPos = $.caret.position(event.target);
            var masked = val;


            masked = val.substr(0, caretPos) + String.fromCharCode(c) + val.substr(caretPos);
            var regex = options.regexes[masked.length - 1];
            if (!masked.match(regex)) {
                if (keepSearching) {
                    keepSearching = false;
                    masked = val.substr(0, caretPos) + opt.mask.charAt(caretPos) + String.fromCharCode(c) + val.substr(caretPos + 1);
                    $.caret.position(this, caretPos + 1);
                    if (typeKey(event))
                        $this.val(masked);
                    return false;
                }
                else
                    return false;
            }
            return true;
        };
        this.live('keypress', typeKey);
    };
    $.fn.mask.defaultOptions = { beacon: "_" };

    $.fn.mask.Regex = /(.)/;
})(jQuery);
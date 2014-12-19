/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define('ace/theme/monaco', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-monaco";
exports.cssText = ".ace-monaco .ace_gutter {\
background: white;\
color: #2B91AF;\
overflow : hidden;\
margin-top:2px;\
}\
.ace-monaco .ace_cursor {\
margin-top:2px;\
}\
.ace-monaco .ace_print-margin {\
width: 1px;\
display: none\
background: #e8e8e8;\
}\
.ace-monaco {\
background-color: #FFFFFF;\
}\
.ace-monaco .ace_cursor {\
color: black;\
}\
.ace-monaco .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-monaco .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-monaco .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-monaco .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-monaco .ace_invalid {\
background-color: rgb(153, 0, 0);\
color: white;\
}\
.ace-monaco .ace_fold {\
}\
.ace-monaco .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-monaco .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-monaco .ace_support.ace_type,\
.ace-monaco .ace_support.ace_class\
.ace-monaco .ace_support.ace_other {\
color: rgb(109, 121, 222);\
}\
.ace-monaco .ace_variable.ace_parameter {\
font-style:italic;\
color:#FD971F;\
}\
.ace-monaco .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-monaco .ace_comment {\
color: #236e24;\
}\
.ace-monaco .ace_comment.ace_doc {\
color: #236e24;\
}\
.ace-monaco .ace_comment.ace_doc.ace_tag {\
color: #236e24;\
}\
.ace-monaco .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-monaco .ace_variable {\
color: rgb(49, 132, 149);\
}\
.ace-monaco .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-monaco .ace_entity.ace_name.ace_function {\
color: #0000A2;\
}\
.ace-monaco .ace_heading {\
color: rgb(12, 7, 255);\
}\
.ace-monaco .ace_list {\
color:rgb(185, 6, 144);\
}\
.ace-monaco .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-monaco .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-monaco .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-monaco .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-monaco .ace_marker-layer .ace_active-line {\
margin-top:0px;\
background-color:#eee;\
}\
.ace-monaco .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-monaco .ace_storage,\
.ace-monaco .ace_keyword {\
color: rgb(147, 15, 128);\
}\
.ace-monaco .ace_meta.ace_tag {\
color: #800000;\
}\
.ace-monaco .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-monaco .ace_string.js,\
.ace-monaco .ace_string.json,\
.ace-monaco .ace_variable.json,\
.ace-monaco .ace_constant.css, \
.ace-monaco .ace_variable.css, \
.ace-monaco .ace_string.css {\
color: #A31515;\
}\
.ace-monaco .ace_string {\
color: blue;\
}\
.ace-monaco .ace_entity.ace_other.ace_attribute-name,\
.ace-monaco .ace_support.ace_type.css {\
color: red;\
}\
.ace-monaco .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});

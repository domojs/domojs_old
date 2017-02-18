process.env.DEBUG='domojs:settings';
var debug=require('debug');
debug.enable('akala:master');
debug.enable('domojs:settings');

require('akala-server/dist/start')
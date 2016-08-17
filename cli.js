process.env.NODE_ENV = 'dev';
if( process.argv.length <= 2 ) {
    console.error( 'At least the module name is required' );
    process.exit();
}
process.env.DEBUG = 'jnode:noble*,domojs:cli,domojs:'+process.argv[2];

require( 'jnode/setup.js' );
$.cli=true;
var debug = $( 'debug' )( 'jnode:cli' );
var config = JSON.parse( $( 'fs' ).readFileSync( './cli.config' ) );
var apiHandler;
var connect = $( 'connect' );
var app = connect();
var router = new ( $( 'router' ) )();
$.extend( $, router );
for( var key in config ) {
    debug( 'initializing ' + key );

    var init;
    if( key == 'jnode' )
        init = exports.init;
    else
        init = $( key ).init;
    if( init )
        init( config[ key ], app );

    debug( 'initialized ' + key );
}

var url = '/api/' + process.argv.slice( 2 ).join( '/' );
debug( url );
app.use( router );
app( $.extend( { url: url, method: 'GET' }, $( 'url' ).parse( url, true ) ), {
    send: function(status,data) {
        if(isNaN(status) || status<100)
        {
            data=status;
            status=null;
        }
        if(status)
            console.log(status);
        console.log( JSON.stringify(data, null, 4 ) );
        process.exit();
    }
}, function() {
    debug( 'nothing matching the parameters could be found' );
});
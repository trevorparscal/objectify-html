var gulp = require( 'gulp' ),
	mocha = require( 'gulp-mocha' );

function handleError( err ) {
	console.log( err.toString() );
	this.emit( 'end' );
}

gulp.task( 'default', function () {
	console.log( 'it works' );
} );

gulp.task( 'test', function () {
	return gulp.src( 'test/test.js', { read: false } )
		.pipe( mocha( { reporter: 'spec' } ) )
		.on( 'error', handleError );
} );

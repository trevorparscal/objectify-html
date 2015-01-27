var assert = require( 'assert' ),
	domino = require( 'domino' ),
	window = domino.createWindow( require( 'fs' ).readFileSync( 'test/cases.html' ) ),
	objectify = require( '../lib/html' );

describe( 'Diff', function () {
	var i, len,
		divs = window.document.querySelectorAll( 'body > div' );

	it( 'can round trip HTML strings', function ( done ) {
		divs.forEach( function ( node ) {
			var html = objectify.toHtml( objectify.fromHtml( node.outerHTML ) );
			assert.equal( html, node.outerHTML, 'Round-tripped strings match' );
		} );
		done();
	} );

	it( 'can round trip DOM nodes', function ( done ) {
		divs.forEach( function ( node, i ) {
			var html = objectify.toNode( objectify.fromNode( node ) ).outerHTML;
			assert.equal( html, node.outerHTML, 'Round-tripped nodes match' );
		} );
		done();
	} );
} );

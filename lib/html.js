var domino = require( 'domino' ),
	xmlns = 'http://www.w3.org/2000/xmlns/',
	svgns = 'http://www.w3.org/2000/svg';

/**
 * Get a plain object representation of an HTML string.
 *
 * If there are multiple root elements in the HTML string the resulting plain object will not
 * represent a node, but instead contain a `childNodes` property containing each of root elements.
 * Otherwise the object will represent the single root node.
 *
 * @param {string} html HTML string to convert
 * @return {Object} Object representation
 */
exports.fromHtml = function ( html ) {
	var i, len, node,
		obj = { childNodes: [] },
		window = domino.createWindow(),
		doc = window.document,
		wrapper = doc.createElement( 'div' );

	wrapper.innerHTML = html;

	for ( i = 0, len = wrapper.childNodes.length; i < len; i++ ) {
		obj.childNodes.push( exports.fromNode( wrapper.childNodes.item( i ) ) );
	}

	if ( obj.childNodes.length === 1 ) {
		obj = obj.childNodes[0];
	}

	return obj;
};

/**
 * Get an object representation of an HTML DOM node.
 *
 * @param {Node} node HTML DOM node to convert
 * @return {Object} Object representation
 */
exports.fromNode = function ( node ) {
	var i, len, name, obj, attr, children,
		props = [ 'nodeType', 'value', 'checked', 'selected' ];

	if ( node.nodeType === 3 || node.nodeType === 8 ) {
		// Text or comment
		return { nodeType: node.nodeType, data: node.data };
	}

	if ( node.nodeType === 1 ) {
		// Element
		obj = {
			nodeName: node.nodeName
		};

		// Properties
		for ( i = 0, len = props.length; i < len; i++ ) {
			name = props[i];
			if ( node.hasOwnProperty( name ) ) {
				obj[name] = node[name];
			}
		}

		// Attributes
		if ( node.attributes && node.attributes.length ) {
			obj.attributes = [];
			for ( i = 0, len = node.attributes.length; i < len; i++ ) {
				obj.attributes.push( [
					node.attributes.item( i ).name,
					node.attributes.item( i ).value
				] );
			}
		}

		// Children
		if ( node.childNodes && node.childNodes.length ) {
			obj.childNodes = [];
			for ( i = 0, len = node.childNodes.length; i < len; i++ ) {
				obj.childNodes.push( exports.fromNode( node.childNodes.item( i ) ) );
			}
		}

		return obj;
	}

	throw new Error( 'Unsupported node type: element, text or comment expected' );
};

exports.toHtml = function ( obj, doc ) {
	return exports.toNode( obj, doc ).outerHTML;
};

/**
 * Get a DOM node representation of a plain object.
 *
 * If object does not have a `nodeType` property but does contain a `childNodes` property the result
 * will be a document fragment containing each of the converted child nodes.
 *
 * @param {Object} obj Object representation
 * @param {Document} [doc] Document to create node for, omit to use a generated a document
 * @param {boolean} [svg] Create node in the SVG namespace, used internally
 * @return {Element|DocumentFragment} Element or document fragment node
 */
exports.toNode = function ( obj, doc, svg ) {
	var node, i, len, name, attr,
		props = [ 'value', 'checked', 'selected' ];

	doc = doc || domino.createWindow().document;

	if ( obj.nodeType === undefined && obj.childNodes ) {
		node = doc.createDocumentFragment();
		for ( i = 0, len = obj.childNodes.length; i < len; i++ ) {
			node.appendChild( exports.toNode( obj.childNodes[i], doc ) );
		}
		return node;
	}

	if ( obj.nodeType === 3 ) {
		// Text
		return doc.createTextNode( obj.data );
	}

	if ( obj.nodeType === 8 ) {
		// Comment
		return doc.createComment( obj.data );
	}

	if ( obj.nodeType === 1 ) {
		// Element
		if ( obj.nodeName === 'svg' ) {
			node = doc.createElementNS( svgns, obj.nodeName );
			svg = true;
		} else {
			node = doc.createElement( obj.nodeName );
		}

		// Properties
		for ( i = 0, len = props.length; i < len; i++ ) {
			name = props[i];
			if ( obj.hasOwnProperty( name ) ) {
				node[name] = obj[name];
			}
		}

		// Attributes
		if ( obj.attributes ) {
			for ( i = 0, len = obj.attributes.length; i < len; i++ ) {
				attr = obj.attributes[i];
				if ( attr[0].indexOf( 'xmlns:' ) === 0 ) {
					node.setAttributeNS( xmlns, attr[0], attr[1] );
				} else {
					node.setAttribute( attr[0], attr[1] );
				}
			}
		}

		// Children
		if ( obj.childNodes ) {
			for ( i = 0, len = obj.childNodes.length; i < len; i++ ) {
				node.appendChild( exports.toNode( obj.childNodes[i], node.ownerDocument, svg ) );
			}
		}

		return node;
	}

	throw new Error( 'Unsupported node type: element, text or comment expected' );
};

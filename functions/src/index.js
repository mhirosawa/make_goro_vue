import escapeHtml from 'escape-html';

import { find_goro, makeStatusObj } from './make_goro.js';

import functions from "firebase-functions";


exports.make_goro_org = async (req, res) => {

	let statusObj = makeStatusObj();

//	let str = await main( 'test' );
//	res.send( str + "\n" + `Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);

	let keyword = req.query.keyword || req.body.keyword;
	let limit = 20;
	if ( req.query.limit || req.body.limit ) {
		limit = parseInt( req.query.limit || req.body.limit );
	}
	await find_goro( statusObj, keyword, limit );
	//console.log( "main : " + str );
	res.set('Cache-Control', 'no-cache');
	res.send( statusObj.PrintHtmlStr );
};

exports.make_goro = functions.https.onRequest( async (request, response) => {
//  functions.logger.info("Hello logs!", {structuredData: true});
//  response.send("Hello from Firebase!");

	let statusObj = makeStatusObj();

//	let str = await main( 'test' );
//	res.send( str + "\n" + `Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);

	let keyword = request.query.keyword || request.body.keyword;
	let limit = 20;
	if ( request.query.limit || request.body.limit ) {
		limit = parseInt( request.query.limit || request.body.limit );
	}
	await find_goro( statusObj, keyword, limit );
	//console.log( "main : " + str );
	response.set('Cache-Control', 'no-cache');
	response.send( statusObj.PrintHtmlStr );

});



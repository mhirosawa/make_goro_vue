import escapeHtml from 'escape-html';

import { find_goro, makeStatusObj } from './make_goro.js';

import functions from "firebase-functions";


exports.make_goro = functions.https.onRequest( async (request, response) => {
//  functions.logger.info("Hello logs!", {structuredData: true});

	let statusObj = makeStatusObj();

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



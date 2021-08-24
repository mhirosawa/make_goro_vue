import escapeHtml from 'escape-html';

import { find_goro, makeStatusObj } from './make_goro.js';

import functions from "firebase-functions";


exports.make_goro = functions.https.onRequest(async (request, response) => {
	//  functions.logger.info("Hello logs!", {structuredData: true});

	let statusObj = makeStatusObj();

	let keyword = request.query.keyword || request.body.keyword;
	let limit = 20;
	if (request.query.limit || request.body.limit) {
		limit = parseInt(request.query.limit || request.body.limit);
	}

	if (request.query.type || request.body.type) {
		if (request.query.type == "json") {
			statusObj.PrintHtml = false;
			statusObj.MakeJson = true;
		}
	}

	await find_goro(statusObj, keyword, limit);

	response.set('Cache-Control', 'no-cache');
	response.set('Access-Control-Allow-Origin', '*');

	if (statusObj.MakeJson) {
		response.send(JSON.stringify(statusObj.ResponseJson));
	} else {
		response.send(statusObj.PrintHtmlStr);
	}

});



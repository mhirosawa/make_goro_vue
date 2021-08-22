import { find_goro, makeStatusObj } from './make_goro.js';



const main = async() => {

	let statusObj = makeStatusObj();

	statusObj.PrintHtml = false;

	let englishword = process.argv[2];

	let limit = 10;
	if ( 5 <= process.argv.length ) {
		if ( process.argv[3] == "-n" ) {
			limit = parseInt( process.argv[4] );
		}
	}

	await find_goro( statusObj, englishword, limit );
	//console.log( statusObj.PrintHtmlStr );
}


main();



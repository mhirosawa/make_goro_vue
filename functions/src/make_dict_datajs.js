//import fetch from 'node-fetch';
//const fetch = require('node-fetch');

//const fs = require("fs");
import fs from "fs";
//const readline = require("readline");
import readline from "readline";
import { exit } from 'process';

//import { JSDOM } from 'jsdom';

/**
 * JUMANから読み込んだ読みひらがな　→　日本語名詞、のテーブル
 */
let GMeishiTable = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語「子音動詞＊行」、のテーブル。
 * 末尾文字のを５つに活用して５つの読みを登録する。
 */
let G動詞Table = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語形容詞、のテーブル
 */
let G形容詞Table = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語副詞、のテーブル
 */
let G副詞Table = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語接続詞、のテーブル
 */
let G接続詞Table = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語感動詞、のテーブル
 */
let G感動詞Table = {};

/**
 * JUMANから読み込んだ読みひらがな　→　日本語連体詞、のテーブル
 */
let G連体詞Table = {};
 
/**
 * ポイントと候補文字列のオブジェクトの配列
 */
 let GPointAndGoroArray = [];


/**
 * 日本語の語尾の活用パターン
 */
 const GJapaneseKatusyoGobiTable = {
	'う' : 'あいうえお',
	'く' : 'かきくけこ',
	'す' : 'さしすせそ',
	'つ' : 'たちつてと',
	'ぬ' : 'なにぬねの',
	'ふ' : 'はひふへほ',
	'む' : 'まみむめも',
	'ゆ' : 'やいゆえよ',
	'る' : 'らりるれろ',
	'わ' : 'わいうえお',
	'ぐ' : 'がぎぐげと',
	'ず' : 'ざじずぜぞ',
	'づ' : 'だぢづでど',
	'ぶ' : 'ばびぶべぼ',
	'ぷ' : 'ぱぴぶぺぽ'
}

/**
 * 日本語の母音動詞の語尾の活用パターン
 */
 const GJapanese母音動詞活用2Char = 'ないまする　ればよう'


 /**
 * JUMANの辞書データを読み込む
 */
const readDictData = async( filename ) => {

	// Streamを準備
	const stream = fs.createReadStream( filename, {
					encoding: "utf8",         // 文字コード
					highWaterMark: 1024       // 一度に取得するbyte数
					});

	// readlineにStreamを渡す
	const reader = readline.createInterface({ input: stream });



	let i = 1;

	for await (const line of reader) {
			// 行番号を作成
		//let num = i.toString().padStart(5, "0");  // 5文字未満は"0"で埋める
		i++;

		//console.log(`${num}: ${line}`);

		if ( i == 2 ) {
			continue;
		}

		/*
		if ( 10 < i ) {
			break;
		}
		*/

		if ( line == undefined ) {
			continue;
		}
		if ( line == "\n" ) {
			continue;
		}
		if ( line.substr(0,1) == ";" ) {
			continue;
		}
		if ( line.length == 0 ) {
			continue;
		}

		let obj = parseObjArrayStr( line.replace(/\r?\n/g,"") );

		//console.log( JSON.stringify(obj) );
		if ( obj == undefined ) {
			console.log( "line : '" + line + "'");
			continue;
		}

		let hinshi = obj[0];
		if ( hinshi == '名詞' ) {
			let reading = obj[1][1][0][1];
			let word = obj[1][1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			//debugger;
			if ( GMeishiTable[reading] == undefined ) {
				GMeishiTable[reading] = [ word ];
			} else {
				GMeishiTable[reading].push( word );
			}
			//console.log( "GMeishiTable[" + reading + "] = '" + word + "'" );
			//console.log( "1:" + GMeishiTable["あいかぎ"] );
		} else if ( hinshi == '動詞' ) {
			let reading = obj[1][0][1];
			if ( reading == 'いる') {
				let j = 1;
			}
			let word = obj[1][1][1];
			let t = typeof word;
			if ( t != 'string' ) {
				word = word[0];
			}
			let katsuyo = obj[1][2][1];
			//console.log( "reading:" + reading + ", " + word + ", 活用：" + katsuyo );

			if ( katsuyo.indexOf('子音動詞') != -1 ) {
				// 子音動詞＊行のパターン
				let 語幹word = word.substr( 0, word.length - 1 );
				let 語幹reading = reading.substr( 0, reading.length - 1 );
				let 語尾 = reading.substr( reading.length - 1 );
				let 活用語尾文字列 = GJapaneseKatusyoGobiTable[語尾];
				for ( let i = 0; i < 活用語尾文字列.length; i++ ) {
					let 活用語尾 = 活用語尾文字列.substr( i, 1 );
					let 活用reading = 語幹reading + 活用語尾;
					let 活用word = 語幹word + 活用語尾;
					if ( G動詞Table[活用reading] == undefined ) {
						G動詞Table[活用reading] = [ 活用word ];
					} else {
						G動詞Table[活用reading].push( 活用word );
					}
				}

				// 語幹が未登録なら登録する
				if ( G動詞Table[語幹reading] == undefined ) {
					G動詞Table[語幹reading] = [ 語幹word + '(' + 語尾 + ')' ];
				} else {
					if ( G動詞Table[語幹reading].includes(語幹word) == false ) {
						G動詞Table[語幹reading].push( 語幹word + '(' + 語尾 + ')' );
					}
				}
			} else if ( katsuyo.indexOf('母音動詞') != -1 ) {
				// 母音動詞のパターン
				let 語幹word = word.substr( 0, word.length - 1 );
				let 語幹reading = reading.substr( 0, reading.length - 1 );
				let 語尾 = reading.substr( reading.length - 1 );
				let 活用語尾文字列 = GJapanese母音動詞活用2Char;
				for ( let i = 0; i < 活用語尾文字列.length; i += 2 ) {
					let 活用語尾 = 活用語尾文字列.substr( i, 2 );
					活用語尾 = 活用語尾.replace( /　/g, "" );
					let 活用reading = 語幹reading + 活用語尾;
					let 活用word = 語幹word + 活用語尾;
					if ( G動詞Table[活用reading] == undefined ) {
						G動詞Table[活用reading] = [ 活用word ];
					} else {
						G動詞Table[活用reading].push( 活用word );
					}
				}

				// 語幹が未登録なら登録する
				if ( G動詞Table[語幹reading] == undefined ) {
					G動詞Table[語幹reading] = [ 語幹word + '(' + 語尾 + ')' ];
				} else {
					if ( G動詞Table[語幹reading].includes(語幹word) == false ) {
						G動詞Table[語幹reading].push( 語幹word + '(' + 語尾 + ')' );
					}
				}
			}
		} else if ( hinshi == '形容詞' ) {
			let reading = obj[1][0][1];
			let word = obj[1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			if ( G形容詞Table[reading] == undefined ) {
				G形容詞Table[reading] = [ word ];
			} else {
				G形容詞Table[reading].push( word );
			}
		} else if ( hinshi == '副詞' ) {
			let reading = obj[1][0][1];
			let word = obj[1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			if ( G副詞Table[reading] == undefined ) {
				G副詞Table[reading] = [ word ];
			} else {
				G副詞Table[reading].push( word );
			}
		} else if ( hinshi == '接続詞' ) {
			let reading = obj[1][0][1];
			let word = obj[1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			if ( G接続詞Table[reading] == undefined ) {
				G接続詞Table[reading] = [ word ];
			} else {
				G接続詞Table[reading].push( word );
			}
		} else if ( hinshi == '感動詞' ) {
			let reading = obj[1][0][1];
			let word = obj[1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			if ( G感動詞Table[reading] == undefined ) {
				G感動詞Table[reading] = [ word ];
			} else {
				G感動詞Table[reading].push( word );
			}
		} else if ( hinshi == '連体詞' ) {
			let reading = obj[1][0][1];
			let word = obj[1][1][1];
			let typeStr = toString.call(word);
			if ( typeStr == '[object Array]') {
				word = word[0];
			}
			if ( G連体詞Table[reading] == undefined ) {
				G連体詞Table[reading] = [ word ];
			} else {
				G連体詞Table[reading].push( word );
			}
		} else {
			let i = 1;
		}
		// 
	}

}



// (名詞 (普通名詞 ((読み あい)(見出し語 藍 (あい 1.6))(意味情報 "代表表記:藍/あい カテゴリ:植物"))))

// (　→　level0配列作成
//   名詞　→　level0にpush
//   (　→　level1配列作成
//     普通名詞　→　level1にpush
//     (　→　level2配列作成
//       (　→　level3配列作成
//         読み　→　level3にpush
//         あい　→　level3にpush
//       )　→　level3の配列をlevel2にpush
//       (　→　level3配列作成
//         見出し語　→　level3にpush
//         藍　→　level3にpush
//         (　→　level4配列作成
//           あい　→　level4にpush
//           1.6　→　level4にpush
//         )　→　level4の配列をlevel3にpush
//       )　→　level3の配列をlevel2にpush
//       (　→　level3配列作成
//         意味情報　→　level3にpush
//         "代表表記:藍/あい カテゴリ:植物"　→　level3にpush
//       )　→　level3の配列をlevel2にpush
//     )　→　level2の配列をlevel1にpush
//   )　→　level1の配列をlevel0にpush
// )　→　全体配列完成

/**
 * JUMANの辞書データの行文字列を解析してオブジェクトとして返す
 * @param targetStr JUMANの辞書データの行文字列
 * @returns 解析オブジェクト
 */
function parseObjArrayStr( targetStr ) {

	let levelArray = [];
	let currentLevel = -1;
	let itemStr = '';

	//debugger;

	for ( let i = 0; i < targetStr.length; i++ ) {
		let targetChar = targetStr.substr(i,1);
		if ( itemStr.length == 0 ) {
			// 1文字目
			if ( targetChar == '(' ) {
				// levelX配列を作成する
				currentLevel++;
				levelArray.push( [] );
			} else if ( targetChar == ')' ) {
				if ( currentLevel != 0 ) {
					// levelXの配列をlevel(X-1)にpush
					levelArray[currentLevel-1].push( levelArray[currentLevel] );
					levelArray.pop(); // levelXの配列を削除
					currentLevel--;
				}
			} else if ( targetChar == ' ' ) {
				// 配列要素が続くようなので何もしない
			} else {
				// 配列ではなくて文字列
				itemStr = targetChar;
			}
		} else {
			// 2文字目以降
			if ( targetChar == ' ' ) {
				// 文字列終わり。levelXにpush
				levelArray[currentLevel].push( itemStr );
				itemStr = '';
			} else if ( targetChar == ')' ) {
				// 文字列終わり。
				if ( itemStr.length != 0 ) {
					// 文字列あり。levelXにpush
					levelArray[currentLevel].push( itemStr );
					itemStr = '';
				}
				// levelXの配列をlevel(X-1)にpush
				levelArray[currentLevel-1].push( levelArray[currentLevel] );
				levelArray.pop(); // levelXの配列を削除
				currentLevel--;
			} else {
				// 文字列継続
				itemStr += targetChar;
			}
		}

	}

	let retArray = levelArray[0];

	return retArray;


}



const main = async() => {

	await readDictData( './dict/juman-7.01/dic/ContentW.dic' );

	// 自作データ
	await readDictData( './dict/my_juman.dic' );

	console.log( 'export const GMeishiTable = ' + JSON.stringify(GMeishiTable,null,'\t') + ';' );
	console.log( 'export const G動詞Table = ' + JSON.stringify(G動詞Table,null,'\t') + ';' );
	console.log( 'export const G形容詞Table = ' + JSON.stringify(G形容詞Table,null,'\t') + ';' );
	console.log( 'export const G副詞Table = ' + JSON.stringify(G副詞Table,null,'\t') + ';' );
	console.log( 'export const G接続詞Table = ' + JSON.stringify(G接続詞Table,null,'\t') + ';' );
	console.log( 'export const G感動詞Table = ' + JSON.stringify(G感動詞Table,null,'\t') + ';' );
	console.log( 'export const G連体詞Table = ' + JSON.stringify(G連体詞Table,null,'\t') + ';' );


}

main();

import fetch from 'node-fetch';
import { GMeishiTable, G動詞Table, G形容詞Table, G副詞Table, G接続詞Table, G感動詞Table, G連体詞Table } from './dict_data.js';


/**
 * ポイントと候補文字列のオブジェクトの配列
 */
// let GPointAndGoroArray = [];


/**
 * Html出力するかどうか
 */
// let GPrintHtml = true;

/**
 * HTML出力する場合の文字列
 */
// let GPrintHtmlStr = '';



/**
 * 状態を保持するオブジェクトを返す
 * @returns 状態を保持するオブジェクト
 */
export const makeStatusObj = function () {

	return {
		/**
		 * ポイントと候補文字列のオブジェクトの配列
		 */
		PointAndGoroArray: [],

		/**
		 * Html出力するかどうか
		 */
		PrintHtml: true,

		/**
		 * HTML出力する場合の文字列
		 */
		PrintHtmlStr: '',

		MakeJson: false,

		ResponseJson: {
			/**
			 * キーワード
			 */
			keyword: '',

			/**
			 * 発音記号
			 */
			pronounce: '',

			/**
			 * 日本語文字の候補配列
			 */
			jCharsCandidates: [],

			candidates: []
		},

	};
}

/**
 * ログ出力。HTMLとconsole.logを振り分ける。
 * @param {StatusObj} statusObj ステータスオブジェクト
 * @param {String} msg 出力する文字列
 * @param {String} tag タグ文字列
 */
function printLog(statusObj, msg, tag) {

	if (statusObj.PrintHtml) {
		statusObj.PrintHtmlStr += msg + "<br/>\n";
	} else if (statusObj.MakeJson) {
		if (tag == 'keyword') {
			statusObj.ResponseJson.keyword = msg;
		} else if (tag == 'pronounce') {
			statusObj.ResponseJson.pronounce = msg;
		} else if (tag == 'jCharsCandidates') {
			statusObj.ResponseJson.jCharsCandidates.push(msg);
		} else {
			statusObj.ResponseJson.candidates.push(msg);
		}
	} else {
		console.log(msg);
	}

}



/**
 * 英語発音の日本語文字列の頭から語呂候補の日本語文字列などのオブジェクト配列を返す
 * @param {String}} word 英語発音の日本語文字列
 * @returns 日本語文字列などのオブジェクト配列
 */
function getGoroFromHead(statusObj, word) {

	let candidateObjArray = [];

	let called = false;

	for (let i = word.length; 0 < i; i--) {
		let subWord = word.substr(0, i);
		let leftWord = word.substr(i, word.length - i);
		let hitWord = [];
		if (GMeishiTable[subWord] != undefined) {
			hitWord.push(GMeishiTable[subWord]);
		}
		if (G動詞Table[subWord] != undefined) {
			hitWord.push(G動詞Table[subWord]);
		}
		if (G形容詞Table[subWord] != undefined) {
			hitWord.push(G形容詞Table[subWord]);
		}
		if (G副詞Table[subWord] != undefined) {
			hitWord.push(G副詞Table[subWord]);
		}
		if (G感動詞Table[subWord] != undefined) {
			hitWord.push(G感動詞Table[subWord]);
		}
		if (G接続詞Table[subWord] != undefined) {
			hitWord.push(G接続詞Table[subWord]);
		}
		if (G連体詞Table[subWord] != undefined) {
			hitWord.push(G連体詞Table[subWord]);
		}
		if (hitWord != undefined && hitWord.length != 0) {
			let forwardedCandidateObjArray = [];
			//hitWord.shift( subWord );
			if (leftWord.length != 0) {
				forwardedCandidateObjArray = getGoroFromHead(statusObj, leftWord);
				called = true;
			} else {
				//printLog( statusObj,  "最終候補：" + allStr );
			}
			//let point = hitWord[0].length; // 文字列長さをポイントとする
			let point = subWord.length; // 文字列長さをポイントとする
			//if ( 3 <= point ) {
			//	point = 10 * point;
			//}
			switch (subWord.length) {
				case 1:
					point = 1;
					break;
				case 2:
					point = 5;
					break;
				case 3:
					point = 15;
					break;
				case 4:
					point = 25;
					break;
				default:
					point = 25 + (subWord.length - 4) * 10;
					break;

			}
			candidateObjArray.push({ yomi: subWord, candidateWords: hitWord, point: point, forwardedCandidateObjArray: forwardedCandidateObjArray });
		}
	}

	if (1 <= word.length && called == false) {
		// 見つからなかったので、見つからなかった最初の文字をそのまま入れる
		let nextChar = word.substr(1, 1);
		if (GKomoji[nextChar]) {
			// 小文字があるので2文字
			let forwardedCandidateObjArray = getGoroFromHead(statusObj, word.substr(2, word.length - 2));
			candidateObjArray.push({ yomi: word.substr(0, 2), candidateWords: [word.substr(0, 2)], point: 0, forwardedCandidateObjArray: forwardedCandidateObjArray });
		} else {
			// 小文字でないので1文字
			let forwardedCandidateObjArray = getGoroFromHead(statusObj, word.substr(1, word.length - 1));
			candidateObjArray.push({ yomi: word.substr(0, 1), candidateWords: [word.substr(0, 1)], point: 0, forwardedCandidateObjArray: forwardedCandidateObjArray });
		}
	}

	return candidateObjArray;

}




/**
 * 英語発音の日本語文字列から語呂候補の日本語文字列を探す
 * @param {String}} word 英語発音の日本語文字列
 */
function findGoro(statusObj, word) {

	// 全角スペースは除く
	word = word.replace(/　/g, '');

	//findGoroFromHead( word, '' );
	//findGoroFromTail( word, '' );

	return getGoroFromHead(statusObj, word);

}


/**
 * 英単語の発音記号文字列を取得する
 * @param {String} englishWord 英単語
 * @returns 発音記号文字列
 */
const getPronounce2 = async (statusObj, englishWord) => {

	let url = 'https://www.ldoceonline.com/jp/dictionary/' + englishWord;

	try {
		let response = await fetch(url, {
			method: "GET"
		});

		if (response.ok) {
			let body = await response.text();
			//printLog( statusObj,  "body : " + body);

			/*
						const dom = new JSDOM(body);
			
						let pronElement = dom.window.document.getElementsByClassName('PRON');
						//printLog( statusObj,  pronElement[0].textContent );
			
						if ( pronElement == null ) {
							// 抽出エラー
							//printLog( statusObj,  body );
							return "";
						}
						let pron = pronElement[0].textContent;
			*/

			let firstSpanStart = body.indexOf('<span class="PRON">');
			if (firstSpanStart == -1) {
				//printLog( statusObj, "Error:can't find pronouce tag.");
				return "";
			}
			let nextSpanStart = body.indexOf('<span', firstSpanStart + 1);
			let nextSpanEnd = body.indexOf('</span', firstSpanStart + 1);
			if (nextSpanStart < nextSpanEnd) {
				// 内部にspanがあるので、その次とする
				nextSpanEnd = body.indexOf('</span', nextSpanEnd + 1);
			}

			let pron = body.substring(firstSpanStart + 19, nextSpanEnd);
			pron = pron.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');


			if (pron.indexOf(',') != -1) {
				pron = pron.substring(0, pron.indexOf(','));
			}
			printLog(statusObj, "発音 : " + pron);

			return pron;
		}

	} catch (e) {
		// エラー処理
		printLog(statusObj, "Error:" + e.message);
		return "";
	}

}


/**
 * 英単語の発音記号文字列を取得する
 * @param {String} englishWord 英単語
 * @returns 発音記号文字列
 */
const getPronounce3 = async (statusObj, englishWord) => {

	let url = 'http://www.speech.cs.cmu.edu/cgi-bin/cmudict?in=' + englishWord + '#lookup';

	try {
		let response = await fetch(url, {
			method: "GET"
		});

		if (response.ok) {
			let body = await response.text();
			//printLog( statusObj,  "body : " + body);

			let firstTTStart = body.indexOf('<tt>');
			if (firstTTStart == -1) {
				//printLog( statusObj, "Error:can't find pronouce tag.");
				return "";
			}
			let nextTTtart = body.indexOf('<tt>', firstTTStart + 1);
			let nextTTEnd = body.indexOf('</tt>', nextTTtart + 1);

			let pron = body.substring(nextTTtart + 4, nextTTEnd - 2).toLowerCase();

			//console.log("発音 : " + pron);

			const ARPABETs = pron.split(' ');
			let ipa_pron = '';
			for (let i = 0; i < ARPABETs.length; i++) {
				let ipa = GARPABETtoIPA[ARPABETs[i].toUpperCase()];
				if (ipa == null) {
					ipa_pron += ARPABETs[i];
				} else {
					ipa_pron += ipa;
				}
			}

			//console.log("IPA発音 : " + ipa_pron);
			//return;

			printLog(statusObj, "発音 : " + ipa_pron, 'pronounce');
			//statusObj.ResponseJson.pronounce = ipa_pron;

			return ipa_pron;
		}

	} catch (e) {
		// エラー処理
		console.log("Error:" + e.message);
		return '';
		printLog(statusObj, "Error:" + e.message);
		return "";
	}

}


/**
 * GARPABETからIPAへの変換テーブル
 */
const GARPABETtoIPA = {
	'AA': 'ɑ',
	'AE': 'æ',
	'AH': 'ʌ',
	'AO': 'ɔ',
	'AW': 'aʊ',
	'AY': 'aɪ',
	'CH': 'tʃ',
	'DH': 'ð',
	'EH': 'e', // 'ɛ'は無い
	'ER': 'ɜ', // 'ɝ'は無い
	'EY': 'eɪ',
	'HH': 'h',
	'IH': 'ɪ',
	'IY': 'i',
	'JH': 'dʒ',
	'NG': 'ŋ',
	'OW': 'oʊ',
	'OY': 'ɔɪ',
	'SH': 'ʃ',
	'TH': 'θ',
	'UH': 'ʊ',
	'UW': 'u',
	'Y': 'j',
	'ZH': 'ʒ'
}

/**
 * 日本語の語尾の活用パターン
 */
const GJapaneseKatusyoGobiTable = {
	'う': 'あいうえお',
	'く': 'かきくけこ',
	'す': 'さしすせそ',
	'つ': 'たちつてと',
	'ぬ': 'なにぬねの',
	'ふ': 'はひふへほ',
	'む': 'まみむめも',
	'ゆ': 'やいゆえよ',
	'る': 'らりるれろ',
	'わ': 'わいうえお',
	'ぐ': 'がぎぐげと',
	'ず': 'ざじずぜぞ',
	'づ': 'だぢづでど',
	'ぶ': 'ばびぶべぼ',
	'ぷ': 'ぱぴぶぺぽ'
}

/**
 * 日本語の母音動詞の語尾の活用パターン
 */
const GJapanese母音動詞活用2Char = 'ないまする　ればよう'

/**
 * 英語1文字子音から1文字日本語行の変換テーブル
 * 末尾は末尾文字になったときの読み
 */
const G1ECharTo1JCharTable = {
	null: 'あいうえお　',
	'k': 'かきくけこく',
	's': 'さしすせそす',
	'ʃ': 'さしすせそしゅ',
	't': 'たちつてとと',
	'n': 'なにぬねのん',
	'h': 'はひふへほ　',
	'm': 'まみむめもんむ',
	'y': 'やいゆえよ　',
	'j': 'やいゆえよじ',
	'r': 'らりるれろる',
	'l': 'らりるれろる',
	'w': 'わいうえをう',
	'g': 'がぎぐげとぐ',
	'ɡ': 'がぎぐげとぐ',
	'z': 'ざじずぜぞず',
	'd': 'だぢづでどど',
	'b': 'ばびぶべぼぶ',
	'p': 'ぱぴぶぺぽぷ',
	'v': 'ばびぶべぼぶ',
	'θ': 'さしすせそす',
	'ð': 'ざじずぜぞず',
	'ŋ': 'ん　　　　ん'
}

/**
 * 英語1文字子音から2文字日本語行の変換テーブル。
 * 末尾は末尾文字になったときの読み
 */
const G1EcharTo2JCharTable = {
	'f': 'ふぁふぃふ　ふぇふぉは　ひ　ふ　へ　ほ　ふ　',
	'ʃ': 'しゃし　しゅせ　しょさ　し　す　せ　そ　しゅ',
	'ʒ': 'じゃじ　じゅぜ　じょざ　じ　ず　ぜ　ぞ　じ　'
}

/**
 * 英語1文字子音から2文字日本語行の変換テーブル。母音無し。
 */
const G1EcharTo2JCharTable2 = {
	'ŋ': 'ん　んぐ',
}

/**
 * 英語2文字子音から2文字日本語行の変換テーブル。
 * 末尾は末尾文字になったときの読み
 */
const G2ECharTo2JCharTable = {
	'gj': 'ぎゃぎ　ぎゅげ　ぎょぐ　',
	'ɡj': 'ぎゃぎ　ぎゅげ　ぎょぐ　',
	'dʒ': 'じゃじ　じゅぜ　じょじ　',
	'bj': 'びゃび　びゅべ　びょぶ　',
	'pj': 'ぴゃぴ　ぴゅぺ　ぴょぷ　',
	'tʃ': 'ちゃち　ちゅちぇちょち　',
	'kw': 'くあくいく　くえくおか　き　く　け　こ　く　',
}

/**
 * 長音、促音記号用テーブル
 */
const GChonSokuonTable = {
	'ː': 'ー　',
	'っ': 'っ　'
}

/**
 * 英語1文字母音から日本語行のインデックス番号の変換テーブル。
 */
const GBoinIndex = {
	'ɪ': [1, 3], // い	え
	'i': [1, 3], // い	え
	'e': [3], // え	
	'a': [0], // あ
	'æ': [0, 3], // あ	え	
	'ɒ': [0, 4], // あ	お
	'ʌ': [0], // あ
	'ɜ': [0], // あ
	'ʊ': [2], // う	
	'u': [2], // う	
	'ə': [0, 1, 2, 3, 4], // あ	い	う	え	お
	'ɔ': [4] // お	
}

/**
 * charLength=2用の英語1文字母音から日本語行のインデックス番号の変換テーブル。
 */
const GBoinIndexFor2Char = {
	'ɪ': [2, 6], // い	え
	'i': [2, 6], // い	え
	'e': [6], // え	
	'a': [0], // あ
	'æ': [0, 6], // あ	え	
	'ɒ': [0, 8], // あ	お
	'ʌ': [0], // あ
	'ɜ': [0], // あ
	'ʊ': [4], // う	
	'u': [4], // う	
	'ə': [0, 2, 4, 6, 8], // あ	い	う	え	お
	'ɔ': [8] // お	
}

/**
 * 'kw' 用の英語1文字母音から日本語行のインデックス番号の変換テーブル。
 */
const GBoinIndexFor2CharKW = {
	'ɪ': [2, 6, 12, 16], // い	え
	'i': [2, 6, 12, 16], // い	え
	'e': [6, 16], // え	
	'a': [0, 10], // あ
	'æ': [0, 6, 10, 16], // あ	え	
	'ɒ': [0, 8, 10, 18], // あ	お
	'ʌ': [0, 10], // あ
	'ɜ': [0, 10], // あ
	'ɑ': [0, 10], // あ
	'ʊ': [4, 14], // う	
	'u': [4, 14], // う	
	'ə': [0, 2, 4, 6, 8, 10, 12, 14, 16, 18], // あ	い	う	え	お
	'ɔ': [8, 18] // お	
}

const GKomoji = {
	'ゃ': true,
	'ゅ': true,
	'ょ': true,
	'っ': true,
	'ぁ': true,
	'ぃ': true,
	'ぅ': true,
	'ぇ': true,
	'ぉ': true
}

/**
 * この直前で促音となりうる子音
 */
const GSokuonSiin = {
	'k': true,
	'ʃ': true,
	't': true,
	'g': true,
	'ɡ': true,
	'd': true,
	'p': true,
	'ʒ': true,
	'dʒ': true,
	'tʃ': true
}



/**
 * 英語発音文字列から語呂候補の日本語文字列を探す
 * @param {String}} pronounce 英語発音文字列
 * @returns 子音、母音配列、テーブル、文字サイズのオブジェクトの配列を返す
 */
function getJapaneseWords(statusObj, pronounce) {

	let siinBoinPairArray = []; // 発音記号の子音・母音ペアの配列
	for (let i = 0; i < pronounce.length; i++) {
		let targetChar = pronounce.substr(i, 1);
		let nextChar = i + 1 < pronounce.length ? pronounce.substr(i + 1, 1) : '';
		let nextNextChar = i + 2 < pronounce.length ? pronounce.substr(i + 2, 1) : '';

		if (targetChar == 'ˈ') {
			// アクセント記号は飛ばす
			continue;
		}

		if (targetChar == 'ː') {
			// 長音記号
			let siin = targetChar;
			let table = GChonSokuonTable;
			let boin = [0, 1]; // 末尾文字のインデックス番号
			siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 1 });
			continue;
		}

		if (targetChar == 'ŋ') {
			// ŋ記号
			let siin = targetChar;
			let table = G1EcharTo2JCharTable2;
			let boin = [0, 2]; // 末尾文字のインデックス番号
			siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
			continue;
		}

		if (G2ECharTo2JCharTable[targetChar + nextChar] != undefined) {
			// 2文字子音
			printLog(statusObj, "2文字子音：" + G2ECharTo2JCharTable[targetChar + nextChar]);
			let siin = targetChar + nextChar;
			let table = G2ECharTo2JCharTable;
			if (nextNextChar == '') {
				// 末尾文字
				let boin = [table[targetChar + nextChar].length - 2]; // 末尾文字のインデックス番号
				siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
				break;
			} else {
				// 子音の次の母音を探す
				let boin = GBoinIndexFor2Char[nextNextChar];
				if (boin != undefined) {
					// 母音あり
					if (siin == 'kw') {
						// kwは特殊扱い
						boin = GBoinIndexFor2CharKW[nextNextChar]
					}
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
					i += 2; // 3文字進める
					continue;
				} else {
					// 母音なし
					let boin = [table[targetChar + nextChar].length - 2]; // 末尾文字のインデックス番号
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
					i++; // 2文字進める
					continue;
				}
			}
		} else if (G1EcharTo2JCharTable[targetChar] != undefined) {
			// 英語1文字子音から2文字日本語行の変換で見つかった
			printLog(statusObj, "1文字子音siin：" + targetChar);
			let siin = targetChar;
			let table = G1EcharTo2JCharTable;
			if (nextChar == '') {
				// 末尾文字
				let boin = [table[targetChar].length - 2]; // 末尾文字のインデックス番号
				siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
				break;
			} else {
				// 子音の次の母音を探す
				let boin = GBoinIndexFor2CharKW[nextChar];
				if (boin != undefined) {
					// 母音あり
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
					i += 1; // 2文字進める
					continue;
				} else {
					// 母音なし
					let boin = [table[targetChar].length - 2]; // 末尾文字のインデックス番号
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
					i++; // 2文字進める
					continue;
				}
			}
		} else if (G1ECharTo1JCharTable[targetChar] != undefined) {
			// 1文字子音
			//printLog( statusObj,  "1文字子音：" + G1ECharTo1JCharTable[targetChar] );
			let siin = targetChar;
			let table = G1ECharTo1JCharTable;
			if (nextChar == '') {
				// 末尾文字
				if (siin == 'ʃ') {
					// 'ʃ'の「しゅ」のパターン
					let boin = [table[targetChar].length - 2]; // 末尾文字のインデックス番号
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 2 });
				} else {
					// それ以外
					let boin = [table[targetChar].length - 1]; // 末尾文字のインデックス番号
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 1 });
				}
				break;
			} else {
				// 子音の次の母音を探す
				let boin = GBoinIndex[nextChar];
				if (boin != undefined) {
					// 母音あり
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 1 });
					i += 1; // 2文字進める
					continue;
				} else {
					// 母音なし
					//let boin = [ table[targetChar].length - 1 ]; // 末尾文字のインデックス番号
					let boin;
					if (table[siin][5] == table[siin][2] || table[siin][5] == table[siin][4]) {
						// 末尾とう段 or お段が同じ
						boin = [0, 1, 2, 3, 4]; // あいうえお、にしてみる
					} else {
						// 末尾とう段 or お段がちがう
						if (siin == 'm') {
							boin = [0, 1, 2, 3, 4, 5, 6]; // あいうえお、む、ん、にしてみる
						} else {
							boin = [0, 1, 2, 3, 4, 5]; // あいうえお、末尾、にしてみる
						}
					}
					siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 1 });
					continue;
				}
			}
		} else if (GBoinIndex[targetChar] != undefined) {
			// 1文字母音
			let siin = null;
			let boin = GBoinIndex[targetChar]; // 末尾文字のインデックス番号
			let table = G1ECharTo1JCharTable;
			siinBoinPairArray.push({ siin: siin, boin: boin, table: table, charLength: 1 });
		}
	} // for i

	// 促音追加
	for (let i = 1; i < siinBoinPairArray.length; i++) {
		let siinBoinPar = siinBoinPairArray[i];
		if (GSokuonSiin[siinBoinPar.siin]) {
			// 促音可能
			let insertSiinBoinPair = { siin: 'っ', boin: [0, 1], table: GChonSokuonTable, charLength: 1 };
			siinBoinPairArray.splice(i, 0, insertSiinBoinPair);
			i++;
			continue;
		}
	}

	return siinBoinPairArray;

}


/**
 * 候補オブジェクト配列の文字列を返す
 * @param {Array} candidateObjArray 候補オブジェクトの配列
 * @param {*} delimitorStr 候補オブジェクトを並べる時の区切り文字列
 * @param pointSum ここまでの合計ポイント
 * @param depth 呼び出しの深さ（＝構成される候補の数）
 */
function getCandidateObjArrayStr(statusObj, prevCandidateObjStr, candidateObjArray, delimitorStr, pointSum, depth) {

	for (let i = 0; i < candidateObjArray.length; i++) {
		let candidateObj = candidateObjArray[i];
		let candidateObjStr = '[（' + candidateObj.yomi + '）';
		for (let j = 0; j < candidateObj.candidateWords.length; j++) {
			let candidate = candidateObj.candidateWords[j];
			if (j != 0) {
				//candidateObjStr += " or ";
				candidateObjStr += ",";
			}
			candidateObjStr += candidate;
		}
		candidateObjStr += '] / ';
		let point = pointSum + candidateObj.point;
		if (candidateObj.forwardedCandidateObjArray != undefined &&
			candidateObj.forwardedCandidateObjArray.length != 0) {
			getCandidateObjArrayStr(statusObj, prevCandidateObjStr + candidateObjStr, candidateObj.forwardedCandidateObjArray, '', point, depth + 1);
		} else {
			let finalPoint = 500 + point - 100 * depth;
			statusObj.PointAndGoroArray.push({ point: finalPoint, goroStr: prevCandidateObjStr + candidateObjStr });
			candidateObjStr += delimitorStr;
			//printLog( statusObj,  "語呂候補[" + point + "]：'" + prevCandidateObjStr + candidateObjStr + "'" );
		}
	}

}


/**
 * すべての読み可能性で語呂を探す
 * @param makingStr 作成中の候補文字列
 * @param {Array} siinBoinTableArray getJapaneseWords()で返ってきたオブジェクト配列
 * @param mainArrayIndex siinBoinTableArrayの候補を探すindex
 * @param subArrayIndex 母音の候補を探すindex
 * @param pointSum ここまでの合計ポイント
 */
function findEachCombinationGoro(statusObj, makingStr, siinBoinTableArray, mainArrayIndex, subArrayIndex, pointSum) {

	//printLog( statusObj,  "findEachCombinationGoro(" + makingStr + ", " + mainArrayIndex + ", " + subArrayIndex );

	if (siinBoinTableArray.length <= mainArrayIndex) {
		// 奥まで行ったので、候補文字列が完成
		//printLog( statusObj,  "読み候補：'" + makingStr.replace( /　/g, '' ) + "'" );
		let candidateArray = findGoro(statusObj, makingStr);
		let pointAndStrArray = [];
		getCandidateObjArrayStr(statusObj, '', candidateArray, "\n", 0, 0);
		return pointAndStrArray;
	}

	let siinBoinPair = siinBoinTableArray[mainArrayIndex];
	let siin = siinBoinPair.siin;
	let boin = siinBoinPair.boin;
	let table = siinBoinPair.table;
	let charLength = siinBoinPair.charLength;
	let currentStr = makingStr;

	let addStr = table[siin].substr(boin[subArrayIndex], charLength);
	if (addStr.substr(1, 1) == '　') {
		addStr = addStr.substr(0, 1);
	}
	currentStr += addStr;
	let currentPointSum = pointSum + siinBoinTableArray[mainArrayIndex].point;
	//printLog( statusObj,  "候補[" + mainArrayIndex + "][" + subArrayIndex + "]：" + currentStr );
	findEachCombinationGoro(statusObj, currentStr, siinBoinTableArray, mainArrayIndex + 1, 0, currentPointSum);

	if (subArrayIndex + 1 < boin.length) {
		// 奥まで行ったので、次の母音配列で探す
		findEachCombinationGoro(statusObj, makingStr, siinBoinTableArray, mainArrayIndex, subArrayIndex + 1, pointSum);
	}

} // end of findEachCombinationGoro



function printSortedPointAndGoro(statusObj, maxNum) {

	statusObj.PointAndGoroArray.sort(function (a, b) {
		if (a.point < b.point) return 1;
		if (a.point > b.point) return -1;
		return 0;
	});

	//printLog( statusObj, statusObj.PointAndGoroArray);

	for (let i = 0; i < statusObj.PointAndGoroArray.length && i < maxNum; i++) {
		let pointAndGoro = statusObj.PointAndGoroArray[i];
		let goroStr = pointAndGoro.goroStr.substr(0, pointAndGoro.goroStr.length - 3); // 末尾の「 /」を除去
		//printLog( statusObj,  "No." + (i+1) + " [" + pointAndGoro.point + "] : " + goroStr );
		printLog(statusObj, "No." + (i + 1) + " [" + pointAndGoro.point + "] : " + goroStr);
	}

	//	return statusObj.PrintHtmlStr;

}



/**
 * 
 * @param {StatusObj} statusObj ステータスを表すオブジェクト
 * @param {String} englishword 検索する英単語
 * @param {int} limit 検索結果の上限数
 * @returns 検索結果文字列
 */
export const find_goro = async (statusObj, englishword, limit) => {

	//await readDictData( '../dict/juman-7.01/dic/ContentW.dic' );

	// 自作データ
	//await readDictData( '../dict/my_juman.dic' );

	//printLog(statusObj, "keyword : " + englishword, 'keyword');
	statusObj.ResponseJson.keyword = englishword;

	let GKeyword = 'あぶらげいと';

	//let englishword = process.argv[2];
	//let pronounce = await getPronounce( "abrogate" );
	//let pronounce = await getPronounce2(statusObj, englishword);
	let pronounce = await getPronounce3(statusObj, englishword);

	//pronounce = 'haida';

	if (pronounce == '') {
		console.error("can't get pronounce of '" + englishword + "'.");
		return "can't get pronounce of '" + englishword + "'.";
	}

	//this.pronounce = "test";

	let siinBoinTableArray = getJapaneseWords(statusObj, pronounce);

	for (let i = 0; i < siinBoinTableArray.length; i++) {
		let siinBoinPair = siinBoinTableArray[i];
		let siin = siinBoinPair.siin;
		let boin = siinBoinPair.boin;
		let table = siinBoinPair.table;
		let charLength = siinBoinPair.charLength;
		let str = '';
		for (let bi = 0; bi < boin.length; bi++) {
			if (str != '') {
				str += "' or '";
			}
			let addStr = table[siin].substr(boin[bi], charLength);
			if (addStr.substr(1, 1) == '　') {
				addStr = addStr.substr(0, 1);
			}
			str += addStr;
		}
		printLog(statusObj, "候補：'" + str + "'", "jCharsCandidates");
	}

	findEachCombinationGoro(statusObj, '', siinBoinTableArray, 0, 0, 0);

	//this.pronounce = statusObj.ResponseJson.pronounce;

	printSortedPointAndGoro(statusObj, limit);

}







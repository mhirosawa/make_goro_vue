# make_goro_vue

## このアプリについて

詳細は[Qiitaの記事](https://qiita.com/nokoribi/items/bcd872ec0feefe7b2c36)をご参照ください。

## 開発環境

node.js, npm, Firebase CLI(Hosting, Functions)

## ビルド

### Vue.jsアプリのローカルPCでの実行用ビルド
```
npm run build-local
```

### Vue.jsアプリのサーバデプロイ用ビルド
```
npm run build-prod
```

## デプロイ

### Google Firebase HostingとFunctionsへのデプロイ
```
firebase deploy --only hosting,functions
```

## 実行

### ローカルPCのFirebase hostingとfunctionsでの実行
```
firebase serve --only hosting,functions
```

### ローカルPCのFirebase functionsとローカルPCのVue.jsの組み合わせの実行
```
npm run serve-local
```

### Google FunctionsとローカルPCのVue.jsの組み合わせの実行
```
npm run serve-prod
```

## 著者

M. HIROSAWA  ( healthcare.lab188@gmail.com )


## ライセンス

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## 謝辞

英単語の発音データとして[The CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)を使わせていただいております。

辞書データとして、[JUMAN Ver.7.01](https://nlp.ist.i.kyoto-u.ac.jp/?JUMAN)を使わせて頂いております。

語呂合わせのパターン解析の元データとして[英単語語呂合わせ](http://aoki2.ninja-web.net/goro.htm)を使わせていただいております。

このようなデータを公開していただき、それぞれの開発者・関係者にお礼申し上げさせていただきます。



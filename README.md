# make_goro_vue

## ビルド

### ローカルPCでの実行用
```
npm run build-local
```

### サーバ用での実行用
```
npm run build-prod
```

## デプロイ

### Google Firebase hostingとfunctionsへのデプロイ
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


## ライセンス

This software includes the work that is distributed in the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

このソフトウェアは、 [Apache 2.0ライセンス](http://www.apache.org/licenses/LICENSE-2.0)で配布されている製作物が含まれています。




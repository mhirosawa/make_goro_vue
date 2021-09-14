# Cloud Functions

## 辞書読み込み、データJS作成

```
cd src
npm install
cd ..
npm run make_dict
```

## Functions用JSファイルの作成

```
cd functions
npm install

npm run webpack

or 

npm run webpack-dev
```

## ローカル開発用のコマンド実行

```
cd src
node make_goro_cmd.js 'test' -n 20
```


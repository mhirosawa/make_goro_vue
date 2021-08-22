■辞書読み込み、データJS作成

cd src
npm install
cd ..

npm run make_dict


■Cloud Functionsへの登録

cd functions

npm install

npm run webpack

or 

npm run webpack-dev


//gcloud functions deploy make_goro --runtime nodejs14 --trigger-http --allow-unauthenticated


■ローカルでのコマンド実行

cd src

node make_goro_cmd.js 'test' -n 20


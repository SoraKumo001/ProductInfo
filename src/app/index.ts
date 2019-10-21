// import * as amf from "active-module-framework";
// import * as path from "path";

// const manager = new amf.Manager({
//   remotePath: "/", //一般コンテンツのリモートパス
//   execPath: "/", //コマンド実行用リモートパス
//   indexPath: path.resolve(__dirname, "../template/index.html"), //index.thmlテンプレート
//   rootPath: path.resolve(__dirname, "../public"), //一般コンテンツのローカルパス
//   cssPath: ["css"], //自動ロード用CSSパス
//   jsPath: ["js"], //一般コンテンツのローカルパス
//   localDBPath: path.resolve(__dirname, "../db/app.db"), //ローカルDBパス
//   modulePath: path.resolve(__dirname, "./modules"), //モジュール配置パス
//   jsPriority: [], //優先JSファイル設定
//   cluster: -1, //クラスター使用時のプロセス数(-1:使用しない 0:CPU数 1～:指定した数)
//   debug: 2, //デバッグ用メッセージ出力,
//   autoReload:true, //ブラウザの自動更新
//   test: true, //テストの実行
//   listen: 8080 //受付ポート/UNIXドメインソケット
//   //listen:'dist/sock/app.sock'
// });

import { Manager } from "@jswf/rfs";
import * as path from "path";
import * as express from "express";
import { HtmlCreater } from "./HtmlCreater";

//管理用マネージャクラスの作成
const manager = new Manager({
  debug: 2,
  modulePath: path.resolve(__dirname, "./modules"), //モジュール置き場
  databaseOption: {
    //TypeORMのDB設定(未指定の場合はsqliteがメモリ上に作成される)
    type: "sqlite",
    database: path.resolve(__dirname, "../db/app.db")
  }
});

const htmlCreater = new HtmlCreater({
  baseUrl: "",
  indexPath: path.resolve(__dirname, "../template/index.html"), //index.thmlテンプレート
  rootPath: path.resolve(__dirname, "../public"), //一般コンテンツのローカルパス
  cssPath: ["css"], //自動ロード用CSSパス
  jsPath: ["js"], //一般コンテンツのローカルパス
  jsPriority: [] //優先JSファイル設定
});

//Expressの作成
const app = express();
//アクセス用リモードアドレスの設定
manager.init(app, "/");

//.jsの自動リロード
const browserSync = require("browser-sync");
const connectBrowserSync = require("connect-browser-sync");
const browserSyncConfigurations = {
  files: path.resolve(__dirname, "../public")
};
app.use(connectBrowserSync(browserSync(browserSyncConfigurations)));
app.get("/", htmlCreater.output.bind(htmlCreater));
//静的ファイルの設定(index.jsからの相対パス)
app.use(express.static(path.resolve(__dirname, "../public")));

//待ち受けポート設定
if (process.platform === "win32") app.listen(8080);
else app.listen("dist/sock/app.sock");

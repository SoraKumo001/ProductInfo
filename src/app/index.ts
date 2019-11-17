import { Manager } from "@jswf/rfs";
import * as path from "path";
import express from "express";
import * as fs from "fs";
import { HtmlCreater } from "./HtmlCreater";
import browserSync from "browser-sync";
import { Server } from "http";
import { Adapter } from "@jswf/adapter";
import { Users } from "./modules/User/UsersModule";
const connectBrowserSync = require("connect-browser-sync");

const options = new Set(process.argv);
const testMode = options.has("--test");

interface AdapterUserMap {
  "Users.request": typeof Users.prototype.request;
  "Users.login": typeof Users.prototype.login;
  "Users.logout": typeof Users.prototype.logout;
  "Users.setUser": typeof Users.prototype.setUser;
  "Users.delUser": typeof Users.prototype.delUser;
  "Users.getUsers": typeof Users.prototype.getUsers;
}
//管理用マネージャクラスの作成
const manager = new Manager();

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
manager
  .init(
    {
      debug: testMode ? 1 : 2,
      modulePath: path.resolve(__dirname, "./modules"), //モジュール置き場
      databaseOption: {
        //TypeORMのDB設定(未指定の場合はsqliteがメモリ上に作成される)
        type: "sqlite",
        database: path.resolve(__dirname, "../db/app.db")
      }
    },
    app,
    "/"
  )
  .then(() => {
    //.jsの自動リロード
    app.use(
      connectBrowserSync(
        browserSync({
          ui: false,
          logLevel: "silent",
          files: path.resolve(__dirname, "../public")
        })
      )
    );
    app.get("/", htmlCreater.output.bind(htmlCreater));
    //静的ファイルの設定(index.jsからの相対パス)
    app.use(express.static(path.resolve(__dirname, "../public")));

    let server: Server;
    const promise = new Promise(resolve => {
      //待ち受けポート設定
      if (process.platform === "win32") {
        server = app.listen(8080, resolve);
        manager.output("listen: http://localhost:8080");
      } else {
        const path = "dist/sock/app.sock";
        server = app.listen(path, resolve);
        fs.chmodSync(path, "666");
        manager.output("listen: dist/sock/app.sock");
      }
    });

    if (testMode) {
      promise.then(async () => {
        const adapter = new Adapter<AdapterUserMap>("http://127.0.0.1:8080/");
        try {
          console.log("\n--- セッション開始テスト ---");
          await adapter
            .exec2("Users.request")
            .then(value => console.log(value));
          console.log("\n--- ユーザ作成テスト ---");
          await adapter
            .exec("Users.setUser", 0, "test-user", "テストユーザ", "test", true)
            .then(value => console.log(value));
          console.log("\n--- ユーザログインテスト ---");
          await adapter
            .exec2("Users.login", "test-user", "test", true, true)
            .then(value => console.log(value));
          console.log("\n--- セッション確認 ---");
          await adapter.exec("Users.request").then(value => console.log(value));
          console.log("\n--- ログアウト ---");
          await adapter
          .exec2("Users.logout").then(value => console.log(value))
        } catch (e) {
          console.error(e);
          server.close(() => process.exit(-1));
        }
        server.close(() => process.exit(0));
      });
    }
  });

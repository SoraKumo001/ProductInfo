/**
 *エントリー部分
 *
 */

//使用するPollyfillの呼び出し
import 'core-js/features/object';
import 'core-js/features/promise'

import {Manager,UserModule,UserEditWindow,UserInfo} from "@jwf/manager";
import { MainView } from "./Main/MainView";
import "./index.scss";

export function getManager():Manager{
  return manager;
}
//全体で使用するアプリケーションマネージャを作成
const manager = new Manager();


const userModule = manager.getModule(UserModule);
userModule.addEventListener("loginUser", (userInfo: UserInfo) => {
  //ユーザが存在しなかった場合の初期化処理
  if (userInfo) {
    //暫定ユーザーならローカル管理者の編集画面へ
    if (userInfo.no === 0 && userInfo.admin) {
      new UserEditWindow(manager, 0, "admin", "ローカル管理者", "", true);
    }
  }
});
//初回認証
userModule.request();

//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", () => {
  //メイン画面の表示
  new MainView(manager);
});

import * as JWF from "javascript-window-framework";
import { TopMenu } from "./TopMenu";
import { RouterModule } from "../Manager/RouterModule";
import { UserModule } from "../User/UserModule";
import "analytics-gtag";
import { AppManager } from "../Manager/FrontManager";
import { RakutenGenreTree } from "./GenreTree";

export class MainView extends JWF.BaseView {
  private routerModule: RouterModule;
  public constructor(manager: AppManager) {
    super({ overlap: true });
    this.setMaximize(true);
    this.setJwfStyle("MainView");

    const splitter = new JWF.Splitter();
    this.addChild(splitter, "client");
    splitter.setSplitterPos(300, "ew");
    splitter.setOverlay(true, 600);

    splitter.addChild(0, new TopMenu(manager), "bottom");
    const routerModule = manager.getModule(RouterModule);
    this.routerModule = routerModule;

    const rakutenGenreTree = new RakutenGenreTree(manager);
    splitter.addChild(0, rakutenGenreTree, "client");
    rakutenGenreTree.load();

    const userModule = manager.getModule(UserModule);
    userModule.addEventListener("loginUser", () => {
      //二回目以降のログインでコンテンツの更新
      if (!first) {
        const params = routerModule.getLocationParams();
        const id = parseInt(params["p"] || "1");
        //コンテンツの強制更新
      } else first = false;
    });
    let first = true;
    routerModule.addEventListener("goLocation", params => {
      //ページの更新や戻る/進むボタンの処理
      const id = parseInt(params["p"] || "1");
    });
    routerModule.goLocation();
  }
  public selectPage(id: number) {
    return "";
  }
}

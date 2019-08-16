import * as JWF from "javascript-window-framework";
import { TopMenu } from "./TopMenu";
import { RouterModule } from "@jwf/manager";
import { UserModule } from "@jwf/manager";
import "analytics-gtag";
import { Manager } from "@jwf/manager";
import { RakutenGenreTree } from "../Rakuten/GenreTree/RakutenGenreTree";
import { RakutenItemWindow } from "../Rakuten/ItemInfoWindow/RakutenItemInfoWindow";
import MainViewVue from "./MainView.vue";
import { VueView } from "../VueView";

export class MainView extends JWF.BaseView {
  public constructor(manager: Manager) {
    super({ overlap: true });
    this.setMaximize(true);
    this.setJwfStyle("MainView");

    const splitter = new JWF.Splitter();
    this.addChild(splitter, "client");
    splitter.setSplitterPos(300, "ew");
    splitter.setOverlay(true, 600);

    splitter.addChild(0, new TopMenu(manager), "bottom");
    const routerModule = manager.getModule(RouterModule);

    const rakutenGenreTree = new RakutenGenreTree(manager);
    splitter.addChild(0, rakutenGenreTree, "client");
    rakutenGenreTree.load();

    const rakutenItemView = new VueView(new MainViewVue());
    splitter.addChild(1, rakutenItemView, "client");


    const userModule = manager.getModule(UserModule);
    userModule.addEventListener("loginUser", () => {
    });
    let first = true;
    routerModule.addEventListener("goLocation", params => {
      //ページの更新や戻る/進むボタンの処理
      const itemCode = params["item"];
      if(itemCode){
        let rakutenItemWindow = RakutenItemWindow.findWindow(RakutenItemWindow.name) as RakutenItemWindow;
        if(!rakutenItemWindow)
            rakutenItemWindow = new RakutenItemWindow(itemCode);

      }
    });
    routerModule.goLocation();
  }
}

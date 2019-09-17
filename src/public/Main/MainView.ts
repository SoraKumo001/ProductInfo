import * as JWF from "@jswf/core";
import { TopMenu } from "./TopMenu";
import { RouterModule, UserModule, Manager } from "@jswf/manager";
import { RakutenGenreTree } from "../Rakuten/GenreTree/RakutenGenreTree";
import { RakutenItemWindow } from "../Rakuten/ItemInfoWindow/RakutenItemInfoWindow";
import { FrameWindow, BaseView } from "@jswf/core";
import React from "react";
import { render } from "react-dom";
import { MainViewCom } from "./MainViewCom";

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

    const rakutenItemView = new BaseView();
    render(React.createElement(MainViewCom, {}), rakutenItemView.getClient());

    splitter.addChild(1, rakutenItemView, "client");

    const userModule = manager.getModule(UserModule);
    userModule.addEventListener("loginUser", () => {});

    routerModule.addEventListener("goLocation", params => {
      //ページの更新や戻る/進むボタンの処理
      const itemCode = params["item"];
      if (itemCode) {
        let rakutenItemWindow = RakutenItemWindow.findWindow(
          RakutenItemWindow.name
        ) as RakutenItemWindow;
        if (!rakutenItemWindow)
          rakutenItemWindow = new RakutenItemWindow(itemCode);
      }
    });
    routerModule.goLocation();
  }
}

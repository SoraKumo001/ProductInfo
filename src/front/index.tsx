import "core-js/features/object";
import "core-js/features/promise";

import React from "react";
import * as ReactDOM from "react-dom";
import logger from "redux-logger";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { SplitView } from "@jswf/react";
import { GenreTree } from "./RakutenGenreTree";
import { Router } from "./Router";
import { Manager } from "./Manager.tsx";
import { RakutenItemList } from "./RakutenItemList/RakutenItemList";
import { MenuBar } from "./MenuBar";
import { AppSettingWindow } from "./Setting";

import { ModuleReducer } from "@jswf/redux-module";
import { UserComponent } from "./User/UserComponent";
import { Login } from "./User/Login";
import { MessageText } from "./Parts/MessageText";
import { RakutenSearch } from "./SearchWindow/RakutenSearch";
import { FlexParent } from "./Parts/FlexParent";
import { StatusMenu } from "./StatusMenu";

const store = createStore(ModuleReducer, applyMiddleware(logger));

function App() {
  return (
    <Manager>
      <UserComponent>
        <Router>
          <SplitView pos={300}>
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%"
              }}
            >
              { <GenreTree /> }
              <MenuBar />
            </div>
            <FlexParent>
              <StatusMenu/>
              <RakutenItemList />
            </FlexParent>
          </SplitView>
          <AppSettingWindow />
          <Login />
        </Router>
      </UserComponent>
      <MessageText>メッセージ</MessageText>
      <RakutenSearch />
    </Manager>
  );
}
addEventListener("DOMContentLoaded", () => {
  const root = document.createElement("div");
  document.querySelector("body")!.appendChild(root);
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  );
});

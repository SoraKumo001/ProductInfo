import "core-js/features/object";
import "core-js/features/promise";

import React, { ReactElement, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import logger from 'redux-logger'
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { SplitView } from "@jswf/react";
import { GenreTree } from "./GenreTree";
import { Router, LocationParams } from "./Router";
import { Manager } from "./Manager.tsx";
import { Adapter } from "@jswf/adapter";
import { RakutenModule } from "./Module/RakutenModule";
import { RakutenItemList } from "./ItemList/RakutenItem";
import { MenuBar } from "./MenuBar";
import { LoadingImage } from "./Parts/LodingImage";
import { SettingValue } from "./Parts/SettingView";
import { AppSettingWindow } from "./Setting";



import {ModuleReducer} from "@jswf/redux-module"
import { UserComponent } from "./User/UserComponent";
import { Login } from "./User/Login";
import { MessageText } from "./Parts/MessageText";
import { UserListView } from "./User/UserListView";
import { UserEditWindow } from "./User/UserEditWindow";


const store = createStore(ModuleReducer,applyMiddleware(logger));

function App() {
  const [location, setLocation] = useState<LocationParams>({});
  return (
    <Manager>
      <UserComponent>
        <Router onLocation={location => setLocation(location)}>
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
              <MenuBar />
              {/* {rakutenModule && (
              <GenreTree rakutenModule={rakutenModule} location={location} />
            )} */}
            </div>
            <>
              <RakutenItemList location={location} />)
            </>
          </SplitView>
          <AppSettingWindow />
          <Login />
        </Router>
        <UserListView/><UserEditWindow/>
      </UserComponent>
      <MessageText>メッセージ</MessageText>
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

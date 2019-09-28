import { ReactNode, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { UserInfo, UserModule } from "./UserModule";
import { ManagerState } from "../Manager.tsx";
import { setStoreState } from "@jswf/redux-module";
import { useInit } from "../Parts/HooksLib";
export interface UserState extends ManagerState {
  User: {
    userModule: UserModule;
    userInfo: UserInfo;
    isWindow: boolean;
    request: boolean;
  };
}



export function UserComponent(props: { children?: ReactNode }) {
  const state = useSelector((state: UserState) => state);
  const dispatch = useDispatch();
  useInit(() => {
    const userModule = new UserModule(state.Manager.adapter);
    setStoreState(dispatch, "User", {
      userModule,
      userInfo: { no: 0, name: "Guest" },
      request: false
    });
    userModule.request().then(userInfo => {
      setStoreState(dispatch, "User", { userInfo });
    });
  });
  return <>{props.children}</>;
}

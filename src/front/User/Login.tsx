import { LoginWindow } from "../Parts/LoginWindow";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "./UserComponent";
import { WindowState } from "@jswf/react";
import { MessageModule } from "../Parts/MessageText";
import { useModule, setStoreState } from "@jswf/redux-module";

export function Login() {
  const message = useModule(MessageModule);
  const user = useSelector((state: UserState) => state.User);
  const dispatch = useDispatch();
  const [windowState, setWindowState] = useState(WindowState.NORMAL);

  if (!user.isWindow) {
    return <></>;
  }
  return (
    <>
      <LoginWindow
        userInfo={{ id: user.userInfo.id }}
        windowState={windowState}
        onUpdate={p => {
          if (p.realWindowState === WindowState.HIDE) {
            setStoreState(dispatch, "User", { isWindow: false });
            setWindowState(WindowState.NORMAL);
          }
          if (p.windowState !== windowState) setWindowState(p.windowState);
        }}
        onLogin={(login, params) => {
          if (login) {
            message.setMessage("ログイン中");
            user.userModule
              .login(params.id!, params.pass!, params.local!, params.keep!)
              .then(userInfo => {
                if (userInfo) {
                  setStoreState(dispatch, "User", {
                    userInfo
                  });
                  setWindowState(WindowState.HIDE);
                  message.setMessage("ログインしました");
                } else message.setMessage("ログイン失敗");
              });
          } else {
            message.setMessage("ログアウト中");
            user.userModule.logout().then(userInfo => {
              if (userInfo) {
                setStoreState(dispatch, "User", {
                  userInfo
                });
                setWindowState(WindowState.HIDE);
                message.setMessage("ログアウトしました");
              } else message.setMessage("ログアウト失敗");
            });
          }
        }}
      />
    </>
  );
}

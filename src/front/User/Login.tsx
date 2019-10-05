import { LoginWindow } from "../Parts/LoginWindow";
import React, { useState } from "react";
import { WindowState } from "@jswf/react";
import { MessageModule } from "../Parts/MessageText";
import { useModule } from "@jswf/redux-module";
import { UserModule } from "./UserModule";

export function Login() {
  const message = useModule(MessageModule);
  const userModule = useModule(UserModule);
  const user = userModule.getState()!;
  const [windowState, setWindowState] = useState(WindowState.NORMAL);

  if (!userModule.getState("isWindow")) {
    return <></>;
  }
  return (
    <>
      <LoginWindow
        userInfo={{ id: user.userInfo.id }}
        windowState={windowState}
        onUpdate={p => {
          if (p.realWindowState === WindowState.HIDE) {
            userModule.setState({ isWindow: false });
            setWindowState(WindowState.NORMAL);
          }
          if (p.windowState !== windowState) setWindowState(p.windowState);
        }}
        onLogin={(login, params) => {
          if (login) {
            message.setMessage("ログイン中");
            userModule
              .login(params.id!, params.pass!, params.local!, params.keep!)
              .then(userInfo => {
                if (userInfo) {
                  setWindowState(WindowState.HIDE);
                  message.setMessage("ログインしました");
                } else message.setMessage("ログイン失敗");
              });
          } else {
            message.setMessage("ログアウト中");
            userModule.logout().then(userInfo => {
              if (userInfo) {
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

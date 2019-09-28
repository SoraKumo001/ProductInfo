import { JSWindow, WindowState } from "@jswf/react";
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ManagerState } from "../Manager.tsx";
import { UserInfo, UserModule } from "./UserModule";
import { CircleButton } from "../Parts/CircleButton";
import styled from "styled-components";
import { MessageModule } from "../Parts/MessageText";
import { useModule } from "@jswf/redux-module";

const Style = styled.form`
  padding: 1em 2em;
  border-radius: 1em;
  background-color: #ffffff;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    margin: 0.1em;
    &:nth-of-type(-n + 3) {
      > div {
        width: 6em;
      }
      > input {
        margin-left: 2em;
        background-color: transparent;
        border: none;
        border-bottom: solid 1px;
        outline: none;
        &:focus {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }
    &:nth-of-type(4) {
      > div {
        width: 4em;
        margin: 0.3em;
      }
    }
    &:nth-of-type(5) {
      min-height: 1.5em;
    }
  }
`;

interface Props {
  user?: {
    no: number;
    pass: string;
    type: number;
    id: string;
    name: string;
  };
  onUpdate: () => void;
}
UserEditWindow.defaultProps = {
  user: {
    no: 0,
    pass: "",
    type: 0,
    id: "",
    name: ""
  }
};
export function UserEditWindow(props?: Props) {
  const adapter = useSelector((state: ManagerState) => state.Manager.adapter);
  const [user, setUser] = useState(props!.user!);
  const [windowState, setWindowState] = useState(WindowState.NORMAL);
  const message = useModule(MessageModule);
  const onEnter = {
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      //  if (e.keyCode === 13) props.onLogin && props.onLogin(true, info);
    }
  };
  useMemo(() => {
    setUser(props!.user!);
    setWindowState(WindowState.NORMAL);
  }, [props]);
  function updateUser() {
    const userModule = new UserModule(adapter);
    userModule
      .setUser(user.no, user.id, user.name, user.pass, user.type === 0)
      .then(user => {
        if (user) {
          message.setMessage("ユーザ設定完了");
          setWindowState(WindowState.HIDE);
        } else {
          message.setMessage("ユーザ設定失敗");
        }
      });
  }
  return (
    <JSWindow
      windowState={windowState}
      title={user.no === 0 ? "ユーザ追加" : `ユーザ設定(No:${user.no})`}
      clientStyle={{
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Style>
        <div>
          <div>ユーザ名</div>
          <input
            {...onEnter}
            autoFocus={true}
            defaultValue={user.id}
            onChange={e => setUser({ ...user, id: user.id })}
          />
        </div>
        <div>
          <div>パスワード</div>
          <input
            {...onEnter}
            type="password"
            defaultValue={user.pass}
            onChange={e => setUser({ ...user, pass: user.pass })}
          />
        </div>
        <div>
          <div>ユーザ名</div>
          <input
            {...onEnter}
            defaultValue={user.name}
            onChange={e => setUser({ ...user, pass: user.name })}
          />
        </div>
        <div>
          <CircleButton
            tabIndex={0}
            {...onEnter}
            onClick={() => {
              updateUser();
            }}
          >
            設定
          </CircleButton>
        </div>
      </Style>
    </JSWindow>
  );
}

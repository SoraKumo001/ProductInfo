import { JSWindow, WindowState } from "@jswf/react";
import React, { useState, useMemo, useEffect } from "react";
import { ManagerModule } from "../Manager.tsx";
import { UserModule, UserInfo } from "./UserModule";
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

export function UserEditWindow() {
  const message = useModule(MessageModule);
  const userModule = useModule(UserModule);
  const [windowState, setWindowState] = useState(WindowState.NORMAL);
  const [user, setUser] = useState<UserInfo>();

  const editInfo = userModule.getState("editInfo");
  useMemo(() => {
    if (editInfo) setUser(editInfo);
  }, [editInfo]);
  const onEnter = {
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.keyCode === 13) updateUser();
    }
  };

  const visible = userModule.getState("isEditWindow");
  if (!visible || !user) return <></>;
  function updateUser() {
    if (user) {
      userModule
        .setUser(user.no, user.id, user.name, user.pass!, user.type === "local")
        .then(result => {
          if (result) {
            message.setMessage("ユーザ設定完了");
            userModule.getUsers(user.type === "local");
            setWindowState(WindowState.HIDE);
          } else {
            message.setMessage("ユーザ設定失敗");
          }
        });
    }
  }
  return (
    <JSWindow
      onUpdate={e => {
        e.realWindowState === WindowState.HIDE &&
          userModule.setState({ isEditWindow: false });
        setWindowState(WindowState.NORMAL);
      }}
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
          <div>ユーザID</div>
          <input
            {...onEnter}
            autoFocus={true}
            defaultValue={user.id}
            onChange={e => setUser({ ...user, id: e.target.value })}
          />
        </div>
        <div>
          <div>パスワード</div>
          <input
            {...onEnter}
            type="password"
            defaultValue={user.pass}
            onChange={e => setUser({ ...user, pass: e.target.value })}
          />
        </div>
        <div>
          <div>ユーザ名</div>
          <input
            {...onEnter}
            defaultValue={user.name}
            onChange={e => setUser({ ...user, name: e.target.value })}
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

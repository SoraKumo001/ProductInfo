import {
  JSWindow,
  ListView,
  ListHeaders,
  ListHeader,
  ListItem,
  ListRow,
  WindowState
} from "@jswf/react";
import React, { useState, useRef } from "react";
import { UserModule } from "./UserModule";
import { CircleButton } from "../Parts/CircleButton";
import styled from "styled-components";
import { useModule } from "@jswf/redux-module";
import { useInit } from "../Parts/HooksLib";
import { UserEditWindow } from "./UserEditWindow";

const Style = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  flex-direction: column;
  > div:nth-of-type(1) {
    padding: 0.3em;
    display: flex;
    align-items: center;
    > * {
      margin-right: 0.5em;
    }
    > select {
    }
  }
`;

export function UserListView() {
  const [userType, setUserType] = useState("local");
  const userModule = useModule(UserModule);
  const listRef = useRef<ListView>(null);
  useInit(() => {
    userModule.getUsers(userType === "local");
  });
  const users = userModule.getState("users") || [];
  return (
    <Style>
      <div>
        <select
          value={userType}
          onChange={e => {
            setUserType(e.target.value);
            userModule.getUsers(e.target.value === "local");
          }}
        >
          <option value={"local"}>ローカル</option>
          <option value={"remote"}>リモート</option>
        </select>
        <CircleButton
          onClick={() =>
            userModule.setState({
              isEditWindow: true,
              editInfo: {
                no: 0,
                pass: "",
                type: userType,
                id: "",
                name: ""
              }
            })
          }
        >
          追加
        </CircleButton>
        <CircleButton
          onClick={() => {
            const listView = listRef.current!;
            const items = listView.getSelectItems();
            const promise: Promise<unknown>[] = [];
            items.forEach(item => {
              const no = parseInt(listView.getItem(item, 0) as string);
              promise.push(userModule.delUser(no, userType === "local"));
            });
            Promise.all(promise).then(() => {
              userModule.getUsers(userType === "local");
            });
          }}
        >
          削除
        </CircleButton>
      </div>
      <ListView
        ref={listRef}
        onItemDoubleClick={item => {
          const listView = listRef.current!;
          const user = listView.getItemValue(item);
          console.log(user);
          userModule.setState({
            isEditWindow: true,
            editInfo: user
          });
        }}
      >
        <ListHeaders>
          <ListHeader type="number">NO</ListHeader>
          <ListHeader width={200}>ID</ListHeader>
          <ListHeader>NAME</ListHeader>
        </ListHeaders>
        {users
          .filter(user => user.type === userType)
          .map((user, index) => (
            <ListRow key={index} value={user}>
              <ListItem>{user.no}</ListItem>
              <ListItem>{user.id}</ListItem>
              <ListItem>{user.name}</ListItem>
            </ListRow>
          ))}
      </ListView>
      <UserEditWindow />
    </Style>
  );
}

import {
  JSWindow,
  ListView,
  ListHeaders,
  ListHeader,
  ListItem,
  ListRow
} from "@jswf/react";
import React, { useMemo, useState } from "react";
import { ManagerState } from "../Manager.tsx";
import { useSelector, useDispatch } from "react-redux";
import { UserModule, UserInfo } from "./UserModule";
import { CircleButton } from "../Parts/CircleButton";
import styled from "styled-components";

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
  const adapter = useSelector((state: ManagerState) => state.Manager.adapter);
  const dispatch = useDispatch();
  const [userType, setUserType] = useState("0");
  const [users, setUsers] = useState<UserInfo[]>([]);
  useMemo(() => {
    const userModule = new UserModule(adapter);

    userModule.getUsers(userType === "0").then(users => {
      if(users)
        setUsers(users);
    });
  }, []);
  return (
    <JSWindow title="ユーザ管理">
      <Style>
        <div>
          <select
            value={userType}
            onChange={e => {
              setUserType(e.target.value);
            }}
          >
            <option value={0}>ローカル</option>
            <option value={1}>リモート</option>
          </select>
          <CircleButton>追加</CircleButton>
          <CircleButton>削除</CircleButton>
        </div>
        <ListView>
          <ListHeaders>
            <ListHeader type="number">NO</ListHeader>
            <ListHeader>ID</ListHeader>
            <ListHeader>NAME</ListHeader>
          </ListHeaders>
          {users.map((user,index)=> (
            <ListRow key={index}>
              <ListItem>{user.no}</ListItem>
              <ListItem>{user.id}</ListItem>
              <ListItem>{user.name}</ListItem>
            </ListRow>
          ))}
        </ListView>
      </Style>
    </JSWindow>
  );
}

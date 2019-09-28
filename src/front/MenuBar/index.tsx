import styled from "styled-components";
import React from "react";
import { CircleButton } from "../Parts/CircleButton";
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "../User/UserComponent";
import { setStoreState } from "@jswf/redux-module";

export const Root = styled.div`
  padding: 0.2em;
  > div {
    background-color: rgb(80, 180, 255);
    display: flex;
    align-items: center;
    margin: 0.3px;
    padding: 0.2em;

    border-radius: 0.8em;
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.5),
      0 2px 2px rgba(0, 0, 0, 0.19);
    > div:nth-of-type(1) {
      cursor: pointer;
      box-sizing: border-box;
      border-radius: 0.5em;
      overflow: hidden;
      padding: 0.3em;
      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
    > div:nth-of-type(1) {
      flex: 1;
      color: white;
      margin-left: 0.5em;
    }
  }
`;
export function MenuBar() {
  const userInfo = useSelector((state: UserState) => state.User.userInfo);
  const dispatch = useDispatch();
  return (
    <Root>
      <div>
        <div
          onClick={() => setStoreState(dispatch, "User", { isWindow: true })}
        >
          {userInfo.name}
        </div>
        <CircleButton onClick={()=>setStoreState(dispatch, "Settings", { isWindow: true })}>menu</CircleButton>
      </div>
    </Root>
  );
}

import { JSWindow, WindowProps } from "@jswf/react";
import React, { useState, useRef, useEffect } from "react";
import { CircleButton } from "./CircleButton";
import styled from "styled-components";

const Style = styled.form`
  padding: 0.5em 2em;
  border-radius: 1em;
  background-color: #ffffff;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    margin: 0.1em;
    &:nth-of-type(-n + 2) {
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
  windowRef?: React.RefObject<JSWindow>;
  userInfo: {
    id?: string;
    pass?: string;
    local?: boolean;
    keep?: boolean;
  };

  onLogin?: (login: boolean, params: Props["userInfo"]) => void;
}
LoginWindow.defaultProps = {
  userInfo: {
    id: "",
    pass: "",
    local: false,
    keep: false
  }
};
export function LoginWindow(props: Props & WindowProps) {
  const [info, setInfo] = useState(props.userInfo);
  const ref = useRef(null);
  useEffect(() => {
    if(props.windowRef)
      (props.windowRef as any).current  = ref.current;
  }, []);
  const onEnter = {
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.keyCode === 13) props.onLogin && props.onLogin(true, info);
    }
  };
  return (
    <JSWindow
      {...props}
      ref={ref}
      title="Login"
      clientStyle={{
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
            defaultValue={info.id}
            onChange={e => {
              setInfo({ ...info, id: e.target.value });
            }}
          />
        </div>
        <div>
          <div>パスワード</div>
          <input
            {...onEnter}
            type="password"
            defaultValue={info.pass}
            onChange={e => setInfo({ ...info, pass: e.target.value })}
          />
        </div>
        <div>
          <div>
            <label>
              <input
                {...onEnter}
                type="checkbox"
                defaultChecked={!!info.local}
                onChange={e => setInfo({ ...info, local: e.target.checked })}
              />
              ローカルユーザ
            </label>
          </div>
          <div>
            <label>
              <input
                {...onEnter}
                type="checkbox"
                defaultChecked={!!info.keep}
                onChange={e => setInfo({ ...info, keep: e.target.checked })}
              />
              ログイン情報の保存
            </label>
          </div>
        </div>
        <div>
          <CircleButton
            tabIndex={0}
            {...onEnter}
            onClick={() => {
              props.onLogin && props.onLogin(true, info);
            }}
          >
            Login
          </CircleButton>
          <CircleButton
            tabIndex={0}
            {...onEnter}
            onClick={() => {
              props.onLogin && props.onLogin(false, info);
            }}
          >
            Logout
          </CircleButton>
        </div>
      </Style>
    </JSWindow>
  );
}

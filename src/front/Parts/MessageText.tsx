import styled from "styled-components";
import { ReactNode, useEffect, useState } from "react";
import React from "react";
import { ReduxModule, useModule } from "@jswf/redux-module";

const Style = styled.div`
  & {
    pointer-events: none;
    position: fixed;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    align-items: center;
    justify-content: flex-end;
  }
  > div {
    font-size: 1.3em;
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    border: 0.5px solid rgba(0, 0, 0, 0.35);
    border-radius: 1em;
    padding: 0.8em;
    animation: fade 5s forwards;
    margin: 3em;
    @keyframes fade {
      0% {
        opacity: 0;
        transform: translate(0, 200%);
      }
      20% {
        opacity: 1;
        transform: translate(0, 0);
      }
      80% {
        opacity: 1;
        transform: translate(0, 0);
      }
      100% {
        opacity: 0;
        transform: translate(0, 200%);
      }
    }
  }
`;
interface Props {
  textStyle?: React.HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
}
export interface MessageState {
  values:{
    msg: ReactNode;
  }
}
export class MessageModule extends ReduxModule<MessageState> {
  static defaultState:MessageState = {values:{msg:""}}
  setMessage(message: ReactNode) {
   // this.setState({ values:{msg: message }});
    this.setState(message,"values","msg");
  }
  getMessage(): ReactNode {
    return this.getState()!.values.msg;
  }
}

export function MessageText(props: Props) {
  const [visible, setVisible] = useState(false);
  const [redraw, setRedraw] = useState(false);
  const messageModule = useModule(MessageModule);
  const message = messageModule.getMessage();
  useEffect(() => {
    if (visible) {
      setVisible(false);
      setRedraw(!redraw);
    } else setVisible(true);
    return () => {
      setVisible(false);
    };
  }, [message, redraw]);

  if (!message) return <></>;

  return (
    <>
      {visible && (
        <Style
          onAnimationEnd={() => {
            setVisible(false);
          }}
        >
          <div style={props.textStyle}>{message}</div>
        </Style>
      )}
    </>
  );
}

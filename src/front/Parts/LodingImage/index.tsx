import styled, { CSSProperties } from "styled-components";
import React, { ReactNode } from "react";
import img from "./loading.svg";

interface Props{
  width?:number,height?:number
}

const Root = styled.div<Props>`
  position: absolute;
  display:flex;
  align-items:center;
  justify-content:center;
  right:0;
  left:0;
  top:0;
  bottom:0;

  z-index:100;
  user-select: none;
  > div {
    background-image: url(${img});
    background-size: 100% 100%;
    width: ${(p)=>p&&p.width?p.width+"px":"48px"};
    height: ${(p)=>p&&p.height?p.height+"px":"48px"};
    animation: rot 0.6s linear infinite;
  }
  @keyframes rot {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export function LoadingImage(props?:Props) {
  return (
    <Root {...props}>
      <div></div>
    </Root>
  );
}

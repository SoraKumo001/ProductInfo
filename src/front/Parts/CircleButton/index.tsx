import styled from "styled-components";

export const CircleButton = styled.div`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.5);
  padding:0.8em 0.6em;
  font-size: 0.8em;
  border-radius: 50%;
  text-align: center;
  overflow: hidden;
  font-weight: bold;
  background-image: linear-gradient(#e8e8e8 0%, #d6d6d6 100%);
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.66);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.5),
    0 2px 2px rgba(0, 0, 0, 0.19);
  border-bottom: solid 2px #b5b5b5;
  &:active {
    padding:0.9em 0.6em 0.7em;
    box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.5),
      0 -2px 2px rgba(0, 0, 0, 0.19);
  }
  &:hover{
    background-image: linear-gradient(#f8f8f8 0%, #e6e6e6 100%);
  }
`;

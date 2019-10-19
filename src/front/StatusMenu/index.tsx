import React from "react";
import { CircleButton } from "../Parts/CircleButton";
import styled from "styled-components";
import { useModule } from "@jswf/redux-module";
import { GlobalModule } from "../Global/GlobalModule";
import { SearchModule } from "../SearchWindow/SearchModule";
const Root = styled.div`
  background-color: #33aaff;
  display: flex;
  padding: 0.3em;
`;
export function StatusMenu() {
  const searchModule = useModule(SearchModule, undefined, true);
  const globalModule = useModule(GlobalModule);
  const genreName = globalModule.getState("GenreName") || "";
  return (
    <Root>
      <CircleButton onClick={() => searchModule.setState({ visible: true })}>
        検索
      </CircleButton>
      <div>{genreName}</div>
    </Root>
  );
}

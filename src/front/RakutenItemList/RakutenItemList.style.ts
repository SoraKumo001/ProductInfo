import styled from "styled-components";

export const Root = styled.div`
  overflow: auto;
  height: 100%;
  > #items {
    flex:1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
`;
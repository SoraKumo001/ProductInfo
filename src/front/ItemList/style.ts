import styled from "styled-components";

export const Root = styled.div`
  overflow: auto;
  height: 100%;

  > #items {
    flex:1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    > div {
      animation-name: fadeIn;
      animation-duration: 0.5s;
      transform-origin: 50% 50%;

      border: solid rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      margin: 0.5em;
      padding: 0.5em;
      width: 250px;
      height: 250px;
      div#img {
        display: flex;
        justify-content: center;
        align-content: center;

        img {
          height: 120px;
        }
      }
      #info {
        height: 4.4em;
        overflow: hidden;
      }
      #price {
        flex: 1;
        color: red;
      }
      #rate,
      #data {
        display: flex;
      }
    }
  }
  // アニメーション
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
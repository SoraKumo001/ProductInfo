import styled from "styled-components";

export const Root = styled.div`
  animation: fadeIn 0.5s forwards;
  transform-origin: 50% 50%;
  box-sizing: border-box;
  > div {
    background-color: rgba(255, 255, 255, 0.9);
    box-sizing: border-box;
    border: solid rgba(0, 0, 0, 0.3);
    border-radius: 0.8em;
    margin: 0.5em;
    padding: 0.5em;
    width: 250px;
    height: 250px;

    display: flex;
    flex-direction: column;
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
  &:hover {
    > div {
      animation: select 0.3s forwards;
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
  @keyframes select {
    0% {
    }
    100% {
      transform: scale(1.05);
      border: solid rgba(255, 0, 0, 0.5);
    }
  }
`;

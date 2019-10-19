import { RakutenItem } from "../Module/RakutenModule";
import React from "react";
import { Router } from "../Router";
import { StarRating } from "@jswf/react-star-rating";
import { Root } from "./RakutenItem.style";

export function RakutenItemView(props: { item: RakutenItem }) {
  const item = props.item;
  return (
    <Root onClick={() => itemClick(item)}>
      <div>
        <div id="img">
          <img src={item.mediumImageUrls[0]} />
        </div>
        <div id="info" title={item.itemName}>
          {item.itemName}
        </div>
        <div id="data">
          <div id="price">{item.itemPrice.toLocaleString()}円</div>
          <div id="rate">
            {item.reviewAverage}
            <StarRating
              max={5}
              value={item.reviewAverage}
              backStyle={{ color: "black" }}
            />
            ({item.reviewCount})
          </div>
        </div>
      </div>
    </Root>
  );
  function itemClick(item: RakutenItem) {
    Router.setLocation({ item: item.itemCode });
  }
}

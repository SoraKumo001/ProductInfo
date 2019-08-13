<style scoped lang="scss">
#style {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  > div {
    border: solid rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    margin: 0.5em;
    padding: 0.5em;
    width: 200px;
    height: 240px;
    div#img {
      flex: 1;
      display: flex;
      justify-content: center;
      align-content: center;
    }
    div#info {
      height: 4.4em;
      overflow: hidden;
    }
    div#price {
      color: red;
    }
    #rate {
      display: flex;
    }
  }
}
</style>
<template>
  <div id="style">
    <div v-for="item in items" :key="item.itemCode" v-on:click="click(item)">
      <div id="img">
        <img :src="item.mediumImageUrls[0]" />
      </div>
      <div id="info" :title="item.itemName">{{item.itemName}}</div>
      <div id="price">{{item.itemPrice | addComma}}円</div>
      <div id="rate">
        <rating
          :rating="item.reviewAverage"
          v-bind:star-size="24"
          :show-rating="false"
          :read-only="true"
        ></rating>
        ({{item.reviewCount}})
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { RakutenItem } from "./RakutenModule";
import { appManager } from "../Manager/FrontManager";
import { RouterModule } from "../Manager/RouterModule";
const StarRating = require("vue-star-rating").default;

@Component({
  filters: {
    addComma: (value: number) => {
      return value.toLocaleString();
    }
  },
  components: { rating: StarRating }
})
export default class Item extends Vue {
  items?: RakutenItem[];
  click(item: RakutenItem) {
    appManager.goLocation("item", item.itemCode);
    // console.log(JSON.stringify(item));
    // window.open(item.itemUrl,'_blank');
  }
}
</script>
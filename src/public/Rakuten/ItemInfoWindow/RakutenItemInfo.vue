<style scoped lang="scss">
#root {
  box-sizing: border-box;
  padding: 0.5em;
  overflow: auto;
  height: 100%;
  #items {
    #name {
      cursor: pointer;
      font-size: 120%;
      font-weight: bold;
      background-color: #5784ff;
      color: white;
      border: solid #c5c5fd 1px;
      border-radius: 1em;
      padding: 0.5em;
    }
    #shop {
      cursor: pointer;
      padding: 0.3em;
      margin-right: 1em;
      border-radius: 0.3em;
      background-color: rgb(210, 213, 255);
    }
    #stat {
      margin: 0.4em;
      display: flex;
      align-items: center;
    }
    #rate {
      display: flex;
    }
    img {
      margin: 1em;
      border: solid rgba(0, 0, 0, 0.3);
    }
    #tags {
      cursor: pointer;
      padding: 0.5em;
      margin: 0.5em;
      border: solid rgba(0, 0, 0, 0.1);
    }
    #genre {
      cursor: pointer;
      text-align: center;
      border-radius: 0.3em;
      padding: 0.2em;
      background-color: rgb(194, 198, 255);
    }
    #info {
      white-space: pre-wrap;
      background-color: #eeeeee;
      padding: 0.5em;
    }
    #price {
      flex: 1;
      display: flex;
      > div {
        padding: 0.1em;
        font-size: 120%;
        color: red;
        background-color: #fdebeb;
      }
    }
    #rate {
      display: flex;
    }
  }
}
</style>
<template>
  <div id="root">
    <div id="items" v-if="item">
      <div id="name" v-on:click="onItem">{{item.itemName}}</div>
      <div id="stat">
        <div id="price">
          <div>{{item.itemPrice | addComma}}円</div>
        </div>
        <div id="shop" v-on:click="onShop">{{item.shopName}}</div>
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
      <div>
        <img v-for="img in item.mediumImageUrls" :key="img" :src="img" />
      </div>
      <div id="genre" v-on:click="onGenre">{{item.genre.name}}</div>
      <div id="tags" v-on:click="onTags">
        <div v-for="tag in item.tags" :key="tag.id">{{tag.name}}</div>
      </div>
      <div id="info" v-html="item.itemCaption"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { RakutenItem, RakutenModule } from "../RakutenModule";
import { getManager } from "../..";
const StarRating = require("vue-star-rating").default;

@Component({
  filters: {
    addComma: (value: number) => {
      return value.toLocaleString();
    }
  },
  components: { rating: StarRating }
})
export default class ItemInfo extends Vue {
  itemCode!: string;
  item: RakutenItem | null = null;
  async created() {
    const rakutenModule = getManager().getModule(RakutenModule);
    const item = await rakutenModule.getItem(this.itemCode);
    if (item) this.item = item;
  }
  onTags() {
    if (this.item) {
      getManager().goLocation({
        genre: this.item.genre.id,
        keyword: null,
        tags: this.item.tags
          .map(tag => tag.id)
          .slice(0, 10)
          .join(",")
      });
    }
  }
  onItem() {
    if (this.item) window.open(this.item.itemUrl, "_blank");
  }
  onShop() {
    if (this.item) window.open(this.item.shopUrl, "_blank");
  }
  onGenre() {
    if (this.item)
      getManager().goLocation({
        genre: this.item.genre.id,
        tags: null,
        keyword: null
      });
  }
}
</script>
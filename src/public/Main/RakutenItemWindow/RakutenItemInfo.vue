<style scoped lang="scss">
#root {
  box-sizing: border-box;
  padding: 0.5em;
  overflow: auto;
  height: 100%;
  #items {
    #name {
      font-size: 120%;
      font-weight: bold;
      background-color: #f5f5ff;
      border-radius: 1em;
      padding: 0.5em;
    }
    #stat {
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
      padding: 0.5em;
      margin: 0.5em;
      border: solid rgba(0, 0, 0, 0.1);
    }
    div#info {
      white-space: pre-wrap;
      background-color: #eeeeee;
      padding: 0.5em;
    }
    div#price {
      flex: 1;
      padding: 0.5em;
      font-size: 120%;
      color: red;
    }
    #rate {
      display: flex;
    }
    #genre {
      text-decoration: underline #888888;
    }
  }
}
</style>
<template>
  <div id="root">
    <div id="items" v-if="item">
      <div id="name">{{item.itemName}}</div>
      <div id="stat">
        <div id="shop">{{item.shopName}}</div>
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
      <div>
        <img v-for="img in item.mediumImageUrls" :key="img" :src="img" />
      </div>
      <div id="tags" v-on:click="onTags">
        <div id="genre">{{item.genre.name}}</div>
        <div v-for="tag in item.tags" :key="tag.id">{{tag.name}}</div>
      </div>
      <div id="info">{{item.itemCaption}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { RakutenItem, RakutenModule } from "../RakutenModule";
import { appManager } from "../../Manager/FrontManager";
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
  search: string = "検索";
  async created() {
    const rakutenModule = appManager.getModule(RakutenModule);
    const item = await rakutenModule.getItem(this.itemCode);
    if (item) this.item = item;
  }
  onTags() {
    if (this.item) {
      console.log(this.item.tags.map(tag => tag.id).slice(0,10).length);
      appManager.goLocation({
        genre: this.item.genre.id,
        tags: this.item.tags.map(tag => tag.id).slice(0,10).join(",")
      });
    }
  }
}
</script>
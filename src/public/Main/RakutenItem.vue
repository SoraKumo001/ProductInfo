<style scoped lang="scss">
#root {
  overflow: auto;
  height: 100%;

  #items {
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
  #search {
    display: flex;
    flex-wrap: wrap;
    #keyword {
      min-height: 1.5em;
      min-width: 20em;
      border: solid rgba(0, 0, 0, 0.4);
    }
  }
  #tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    div {
      border: solid rgba(0, 0, 0, 0.2);
      border-radius: 0.3em;
      padding: 0.2em;
      margin: 0.1em;
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
}
</style>
<template>
  <div id="root" v-on:scroll="next()">
    <div id="search" v-on:click="onSearch">
      <button v-on:click.stop="onClear">検索条件解除</button>
      検索
      <div id="keyword">{{keyword}}</div>
      <div v-if="genre">ジャンル:{{genre.name}}</div>
    </div>
    <div id="tags">
      指定タグ:
      <div v-for="name in tagNames" :key="name">{{name}}</div>
    </div>

    <div id="items">
      <img v-if="loading" :src="imgLoading">
      <div v-for="item in items" :key="item.itemCode" v-on:click="click(item)">
        <div id="img">
          <img :src="item.mediumImageUrls[0]" />
        </div>
        <div id="info" :title="item.itemName">{{item.itemName}}</div>
        <div id="data">
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
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { appManager } from "../Manager/FrontManager";
import { RouterModule } from "../Manager/RouterModule";
import {
  RakutenModule,
  RakutenItem,
  RakutenGenreEntity,
  RakutenTagEntity
} from "./RakutenModule";
import { RakutenSearchWindow } from "./RakutenSearchWindow/RakutenSearchWindow";
const StarRating = require("vue-star-rating").default;
const _imgLoading = require("./loading.gif");
@Component({
  filters: {
    addComma: (value: number) => {
      return value.toLocaleString();
    }
  },
  components: { rating: StarRating }
})
export default class Item extends Vue {
  imgLoading=_imgLoading;
  loading:boolean=false;
  items: RakutenItem[] = [];
  page: number = 0;
  allPage: number = -1;
  keyword: string = "";
  tags: string = "";

  rakutenModule!: RakutenModule;
  routerModule!: RouterModule;
  genre: RakutenGenreEntity | null = null;
  tagNames: string[] = [];

  genreId: number = -1;

  public created() {
    this.rakutenModule = appManager.getModule(RakutenModule);
    this.routerModule = appManager.getModule(RouterModule);
    this.routerModule.addEventListener("goLocation", this.location.bind(this));
  }

  public async next() {
    const itemArea = this.$el as HTMLDivElement;
    const target = this.$el.querySelector("#items") as HTMLDivElement;
    if (this.genreId < 0) return false; //ジャンルが設定されていなければ終了
    //スクロール位置のチェック
    if (
      this.allPage === -1 ||
      target.offsetTop +
        target.offsetHeight -
        itemArea.scrollTop -
        itemArea.offsetHeight <
        itemArea.offsetHeight
    ) {
      //ページカウントのチェック
      if (this.allPage !== -1 && this.page >= this.allPage) return false;
      let itemResult = await this.rakutenModule.getGenreItem({
        keyword: this.keyword ? this.keyword : undefined,
        tags: this.tags ? this.tags : undefined,
        genreId: this.genreId,
        page: ++this.page
      });
      if (!itemResult) {
        --this.page;
        return false;
      }
      this.allPage = itemResult.pageCount;
      if (!this.items) this.items = itemResult.Items;
      else this.items.push(...itemResult.Items);
      this.next();
    }
  }
  public location(p: { [key: string]: string }) {
    const genreId = p.genre != null ? parseInt(p.genre) : 0;
    const keyword = p.keyword || "";
    const tags = p.tags || "";
    if (
      this.genreId !== genreId ||
      this.keyword !== keyword ||
      this.tags !== tags
    ) {
      this.genreId = genreId;
      this.keyword = keyword;
      this.tags = tags;
      this.loadItems();
    }
  }
  public async loadItems() {
    this.allPage = -1;
    this.page = 0;
    this.items = [];
    this.genre = null;
    this.tagNames = [];

    this.loading = true;
    this.next().then(()=>{this.loading=false}).catch(()=>{this.loading=false});

    const tagNames: string[] = [];
    if (this.genreId !== 0) {
      const genre = await this.rakutenModule.getGenre(this.genreId);
      if (genre) {
        this.genre = genre;
        const tagMap: { [key: number]: RakutenTagEntity } = {};
        if (genre.groups) {
          for (const group of genre.groups) {
            if (group.tags) {
              group.tags.forEach(tag => {
                tagMap[tag.id] = tag;
              });
            }
          }
        }

        if (this.tags) {
          const tagIds = this.tags.split(",");

          tagIds.forEach(tag => {
            const t = tagMap[parseInt(tag)];
            if (t) tagNames.push(t.name);
          });
          this.tagNames = tagNames;
        }
      }
    }
    return true;
  }

  click(item: RakutenItem) {
    appManager.goLocation("item", item.itemCode);
    // console.log(JSON.stringify(item));
    // window.open(item.itemUrl,'_blank');
  }
  onSearch() {
    new RakutenSearchWindow(this.genreId);
  }
  onClear() {
    appManager.goLocation({ tags: null, keyword: null });
  }
}
</script>
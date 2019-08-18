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
            <StarRating
              :rating="item.reviewAverage"
              v-bind:star-size="24"
              :show-rating="false"
              :read-only="true"
            ></StarRating>
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
import { RouterModule } from "@jswf/manager";
import {getManager} from "../.."
import {
  RakutenModule,
  RakutenItem,
  RakutenGenreEntity,
  RakutenTagEntity,
  RakutenItemResult
} from "../RakutenModule";
import { RakutenSearchWindow } from "../SearchWindow/RakutenSearchWindow";
const StarRating = require("vue-star-rating").default;
const _imgLoading = require("./loading.gif");
@Component({
  filters: {
    addComma: (value: number) => {
      return value.toLocaleString();
    }
  },
  components: { StarRating }
})
export default class RakutenItemVue extends Vue {
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
    this.rakutenModule = getManager().getModule(RakutenModule);
    this.routerModule = getManager().getModule(RouterModule);
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
      const params = {
        keyword: this.keyword ? this.keyword : undefined,
        tags: this.tags ? this.tags : undefined,
        genreId: this.genreId,
        page: ++this.page
      }
      //アイテムデータの読み込みとキャッシュ
      const paramIndex = JSON.stringify(params);
      const sessionValue = sessionStorage.getItem(paramIndex);
       let itemResult:RakutenItemResult | undefined;
      if(sessionValue)
        itemResult = JSON.parse(sessionValue);
      if(!itemResult){
        itemResult = await this.rakutenModule.getGenreItem(params);
        sessionStorage.setItem(paramIndex,JSON.stringify(itemResult));
      }
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
    getManager().goLocation("item", item.itemCode);
  }
}
</script>
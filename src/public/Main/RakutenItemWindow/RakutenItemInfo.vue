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

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { RakutenItem, RakutenModule } from "../RakutenModule";
import { appManager } from "../../Manager/FrontManager";
const StarRating = require("vue-star-rating").default;


@Component
export default class ItemInfo extends Vue {
  itemCode!: string;
  async created(){
    const rakutenModule = appManager.getModule(RakutenModule);
    const item = await rakutenModule.getItem(this.itemCode);
    console.log(JSON.stringify(item,null,'  '));
  }

}


</script>
import Vue from 'vue'
import Component from 'vue-class-component'
import { RakutenItem } from "./RakutenModule";
// @Component デコレータはクラスが Vue コンポーネントであることを示します
@Component({
  // ここではすべてのコンポーネントオプションが許可されています
  template:
`
<div>
  <div v-for="item in items">
    <img :src='item.mediumImageUrls[0]'>
    <div>{{item.itemName}}</div>
  </div>
</div>
`
})
export default class Item extends Vue {
  items?:RakutenItem[];
  // コンポーネントメソッドはインスタンスメソッドとして宣言できます
}

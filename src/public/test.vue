<template>
  <div>
    <input v-model.number="a" type="number" @change="change()" >
    <input v-model.number="b" type="number" >
    <div>{{message}}</div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch,Emit } from 'vue-property-decorator';

const bus = new Vue();
@Component
export default class Test1 extends Vue{
  message="Test";
  a:number=10;
  b:number=20;
  constructor(){
    super();
    // this.$watch("a",function(){
    //   console.log("AAAA");
    //   this.message = (parseInt(this.a)+parseInt(this.b)).toString();
    // });
    // this.$watch("b",function(){
    //   this.message = (parseInt(this.a)+parseInt(this.b)).toString();
    // });
    bus.$on("event",this.test);
  }

  change(){
    // console.log(this.a);
    // this.message = (this.a+this.b).toString();
    bus.$emit("event",this);
    this.$forceUpdate();
  }

  test(p:Test1){
    if(p===this)
      return;
    this.a = p.a;
    console.log("emit");
  }
  // click(){
  //   bus.$emit("event");
  // }
}
</script>

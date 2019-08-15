import { BaseView, WINDOW_EVENT_MAP, WINDOW_PARAMS } from "javascript-window-framework";
import Vue from "vue";

export interface VIEW_PARAMS extends WINDOW_PARAMS{
  vue:Vue;
}

export class VueView<T extends WINDOW_EVENT_MAP = WINDOW_EVENT_MAP> extends BaseView<T> {
  protected vueArea: HTMLElement;
  public constructor(params?: VIEW_PARAMS) {
    super(params);
    const client = this.getClient();
    const vueArea = document.createElement("div");
    this.vueArea = vueArea;
    client.appendChild(vueArea);
    if (params && params.vue) {
      params.vue.$mount(vueArea);
    }
  }
  public setVue(vue: Vue) {
    vue.$mount(this.vueArea);
  }
}

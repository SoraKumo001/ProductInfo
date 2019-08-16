import {
  BaseView,
  WINDOW_EVENT_MAP,
  WINDOW_PARAMS,
} from "javascript-window-framework";
import Vue from "vue";

export interface VIEW_PARAMS extends WINDOW_PARAMS {
  vue?: Vue;
}

export class VueView<
  T extends WINDOW_EVENT_MAP = WINDOW_EVENT_MAP
> extends BaseView<T> {
  protected vueArea: HTMLElement;
  public constructor(params?: VIEW_PARAMS | Vue) {
    if (params instanceof Vue) super();
    else super(params as VIEW_PARAMS);

    const client = this.getClient();
    const vueArea = document.createElement("div");
    this.vueArea = vueArea;
    client.appendChild(vueArea);
    if (params instanceof Vue) {
      this.setVue(<Vue>params);
    } else if (params && (<VIEW_PARAMS>params).vue) {
      this.setVue(<Vue>(<VIEW_PARAMS>params).vue);
    }
  }
  public setVue(vue: Vue) {
    vue.$mount(this.vueArea);
  }
}

export class VueWindow<
  T extends WINDOW_EVENT_MAP = WINDOW_EVENT_MAP
> extends VueView<T> {
  public constructor(params?: VIEW_PARAMS | Vue) {
    if (params instanceof Vue) super({ vue: <Vue>params, frame: true });
    else {
      (<VIEW_PARAMS>params).frame = true;
      super(params as VIEW_PARAMS);
    }
  }
}

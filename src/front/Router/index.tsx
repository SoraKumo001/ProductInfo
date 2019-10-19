import React, { Component } from "react";
import { ReduxModule, mapConnect, mapModule } from "@jswf/redux-module";

export interface LocationParams {
  [key: string]: string;
}
export interface LocationParamsSrc {
  [key: string]: string | number | boolean | null | undefined;
}
export class LocationModule extends ReduxModule {
  static defaultState = {};
  public getLocation(): { [key: string]: string } {
    return this.getState() || {};
  }
}

class _Router extends Component {
  private static lastParams: string = "";
  private static locationModule?: LocationModule;
  constructor(props: {}) {
    super(props);
    _Router.locationModule = mapModule(props, LocationModule);
    _Router.goLocation();
  }
  render() {
    return <>{this.props.children}</>;
  }
  public static setLocationParam(
    name: string | number,
    value: string | number | null | undefined,
    history?: boolean
  ) {
    const values = this.getLocationParams();
    if (value == null) delete values[name];
    else values[name.toString()] = value.toString();
    this.updateLocation(values, history);
  }

  public static setLocation(params: LocationParamsSrc, history?: boolean) {
    const p = this.getLocationParams();
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === null || value === "") delete p[key];
      else if (typeof value === "number" || typeof value === "boolean")
        p[key] = value.toString();
      else if (value !== undefined) p[key] = value;
    }
    this.updateLocation(p, history);
  }
  private static updateLocation(p: LocationParams, history?: boolean) {
    let search = "";
    for (let key of Object.keys(p)) {
      if (p[key] != null) {
        let value = p[key];
        if (value !== null && value.toString) value = value.toString();
        if (search.length) search += "&";
        search += `${encodeURI(key)}=${encodeURI(value as string)}`;
      }
    }
    if (this.lastParams !== search) {
      if (history === undefined || history)
        window.history.pushState(null, "", "?" + search);
      else window.history.replaceState(null, "", "?" + search);
      this.lastParams = search;

      _Router.goLocation();
    }
  }
  public static getLocationParams() {
    //パラメータの読み出し
    const p: { [key: string]: string } = {};
    window.location.search
      .substring(1)
      .split("&")
      .forEach(function(v) {
        const s = v.split("=");
        if (s[0].length && s[1].length) p[decodeURI(s[0])] = decodeURI(s[1]);
      });
    return p;
  }
  public static getLocationParam(name: string) {
    return this.getLocationParams()[name];
  }
  public static goLocation() {
    const p = _Router.getLocationParams();
    _Router.lastParams = window.location.search.substring(1);
    const locationModule = _Router.locationModule;
    if (locationModule) locationModule.setState({ ...p });
  }
}
addEventListener("popstate", () => _Router.goLocation(), false);

export const Router = mapConnect(_Router, {
  module: LocationModule,
  writeOnly: true
});

import React, { Component } from "react";

export interface LocationParams {
  [key: string]: string | number | boolean | null;
}
interface Props {
  onLocation: (loc: LocationParams) => void;
}

export class Router extends Component<Props> {
  private static routers = new Set<Router>();
  private static lastParams: string = "";
  render() {
    return <>{this.props.children}</>;
  }
  componentDidMount() {
    Router.routers.add(this);
  }
  componentWillUnmount() {
    Router.routers.delete(this);
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

  public static setLocation(params: LocationParams, history?: boolean) {
    const p = this.getLocationParams();
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === null || value === "") delete p[key];
      else if (typeof value === "number" || typeof value === "boolean")
        p[key] = value.toString();
      else p[key] = value;
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
      Router.goLocation()
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
    const p = Router.getLocationParams();
    Router.lastParams = window.location.search.substring(1);
    for (const router of Router.routers) {
      console.log(p)
      if (router.props.onLocation) {
        router.props.onLocation(p);

      }
    }
  }
}
addEventListener("popstate", ()=>Router.goLocation(), false);

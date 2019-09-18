import { Component } from "react";
import * as JWF from "@jswf/core";
import React from "react";

interface Props{
  adapterName?:string,
  adapterPath?:string,
  onAdapter?:(adapter:JWF.Adapter)=>void
}
export class Manager extends Component<Props>{
  defaultProps = {
    adapterPath:"./"
  }
  private adapter: JWF.Adapter;
  constructor(props:Props){
    super(props);
    //通信アダプタの作成
    this.adapter = new JWF.Adapter(props.adapterPath, props.adapterName);
  }
  componentDidMount(){
    this.props.onAdapter && this.props.onAdapter(this.adapter);
  }
  render(){
    return <>{this.props.children}</>;
  }
}
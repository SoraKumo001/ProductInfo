import { Component } from "react";
import { Adapter } from "@jswf/adapter";
import React from "react";
import { RakutenModule } from "../Module/RakutenModule";

interface Props {
  adapterName?: string;
  adapterPath?: string;
  onAdapter?: (adapter: Adapter) => void;
  onRakutenModule?: (adapter: RakutenModule) => void;
}
export class Manager extends Component<Props> {
  static defaultProps = {
    adapterPath: "./"
  };
  private adapter: Adapter;
  private rakutenModule: RakutenModule;
  constructor(props: Props) {
    super(props);
    //通信アダプタの作成
    this.adapter = new Adapter(props.adapterPath, props.adapterName);
    this.rakutenModule = new RakutenModule(this.adapter);
  }
  componentDidMount() {
    this.props.onAdapter && this.props.onAdapter(this.adapter);
    this.props.onRakutenModule &&
      this.props.onRakutenModule(this.rakutenModule);
  }
  render() {
    return <>{this.props.children}</>;
  }
}

import { ReactNode, useMemo } from "react";
import { Adapter } from "@jswf/adapter";
import { RakutenModule } from "../Module/RakutenModule";
import { useDispatch } from "react-redux";
import React from "react";
import { setStoreState, ReduxModule, useModule } from "@jswf/redux-module";
import { useInit } from "../Parts/HooksLib";

export interface ManagerState {
  adapter: Adapter;
  rakutenModule: RakutenModule;
}
export class ManagerModule extends ReduxModule<ManagerState> {
  public getAdapter(){
    return this.getState("adapter");
  }
  public getRakutenModule(){
    return this.getState("rakutenModule");
  }
}

interface Props {
  children?: ReactNode;
  adapterName?: string;
  adapterPath?: string;
}
Manager.defaultProps = {
  adapterPath: "./"
};
export function Manager(props: Props) {
  const managerModule = useModule(ManagerModule);
  useInit(() => {
    const adapter = new Adapter(props.adapterPath, props.adapterName);
    const rakutenModule = new RakutenModule(adapter);
    managerModule.setState({ adapter, rakutenModule });
  });
  return <>{props.children}</>;
}

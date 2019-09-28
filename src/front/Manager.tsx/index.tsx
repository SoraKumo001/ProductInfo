import { ReactNode, useMemo } from "react";
import { Adapter } from "@jswf/adapter";
import { RakutenModule } from "../Module/RakutenModule";
import { useDispatch } from "react-redux";
import React from "react";
import { setStoreState } from "@jswf/redux-module";
import { useInit } from "../Parts/HooksLib";

export interface ManagerState {
  Manager: {
    adapter: Adapter;
    rakutenModule: RakutenModule;
  };
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
  const dispatch = useDispatch();
  useInit(() => {
    const adapter = new Adapter(props.adapterPath, props.adapterName);
    const rakutenModule = new RakutenModule(adapter);
    setStoreState(dispatch, "Manager", { adapter, rakutenModule });
  });
  return <>{props.children}</>;
}

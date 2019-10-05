import {
  JSWindow,
  SplitView,
  TreeView,
  TreeItem,
  WindowState
} from "@jswf/react";
import React, { useState, createElement } from "react";
import { DBSettingView, SettingState } from "./DB/DBSettingView";
import { Adapter } from "@jswf/adapter";
import { CircleButton } from "../Parts/CircleButton";
import { FlexParent } from "../Parts/FlexParent";
import { useDispatch, useSelector } from "react-redux";
import { ManagerState, ManagerModule } from "../Manager.tsx";
import { setStoreState, useModule } from "@jswf/redux-module";
import { UserModule } from "../User/UserModule";
import { UserListView } from "../User/UserListView";

export interface SettingViewProps {
  adapter: Adapter;
  setSave: (proc?: () => void) => void;
}

type SettingFunc = (props: SettingViewProps) => JSX.Element;

const settings: { label: string; view?: SettingFunc }[] = [
  { label: "サイト設定" },
  { label: "DB設定", view: DBSettingView },
  { label: "User管理", view: UserListView }
];

export function AppSettingWindow() {
  const [view, setView] = useState<
    React.FunctionComponentElement<SettingViewProps>
  >();

  const [saveCallback, setSaveCallback] = useState<() => void>();
  const dispatch = useDispatch();
  const userModule = useModule(UserModule);
  const state = useSelector((state: SettingState & ManagerState) => state);
  const managerModule = useModule(ManagerModule);
  if (!state.Settings || !state.Settings.isWindow) return <></>;
  const user = userModule.getState()!;
  const adapter = managerModule.getAdapter();

  return (
    <JSWindow
      title="設定"
      width={600}
      height={400}
      onUpdate={p => {
        p.realWindowState === WindowState.HIDE &&
          setStoreState(dispatch, "Settings", { isWindow: false });
      }}
    >
      <SplitView pos={200}>
        <TreeView>
          <TreeItem label="設定一覧">
            {user.userInfo.admin &&
              settings.map((setting, index) => (
                <TreeItem
                  key={index}
                  label={setting.label}
                  onItemClick={() =>
                    setView(
                      setting.view
                        ? createElement(setting.view, {
                            adapter: adapter,
                            setSave
                          } as SettingViewProps)
                        : undefined
                    )
                  }
                />
              ))}
          </TreeItem>
        </TreeView>
        <FlexParent>
          {view && (
            <>
              <div style={{ flex: 1, overflow: "auto" }}>{view}</div>
              <div style={{ textAlign: "center" }}>
                <CircleButton
                  onClick={() => {
                    if (saveCallback) saveCallback();
                    //view.props.onSave && view.props.onSave();
                  }}
                >
                  設定
                </CircleButton>
              </div>
            </>
          )}
        </FlexParent>
      </SplitView>
    </JSWindow>
  );
  function setSave(proc?: () => void) {
    setSaveCallback(() => proc);
  }
}

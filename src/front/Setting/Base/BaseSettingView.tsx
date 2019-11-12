import React, { useEffect } from "react";
import { SettingValue, SettingView } from "../../Parts/SettingView";
import { SettingViewProps } from "..";
import { useModule } from "@jswf/redux-module";
import { RakutenOptionModule } from "../../Module/RakutenOptionModule";

export function BaseSettingView(props: SettingViewProps) {
  const rakutenOptionModule = useModule(RakutenOptionModule);
  props.setSave(onSave);
  const config: SettingValue[] = [
    {
      type: "string",
      name: "RAKUTEN_API_KEY",
      label: "楽天API-KEY",
      value: rakutenOptionModule.getApiKey() || ""
    }
  ];
  useEffect(() => {
    rakutenOptionModule.loadApiKey();
  }, []);

  return (
    <>
      <SettingView {...{ values: config }} />
    </>
  );
  function onSave(){
    config.forEach(
      setting =>
        setting.name === "RAKUTEN_API_KEY" &&
        rakutenOptionModule.setApiKey(setting.value as string)
    );
  }
}

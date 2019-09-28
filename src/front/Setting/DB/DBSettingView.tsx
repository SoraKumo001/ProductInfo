import React, { useState, useEffect, useMemo } from "react";
import { SettingView, SettingValue } from "../../Parts/SettingView";
import { FlexParent } from "../../Parts/FlexParent";
import {
  ListHeaders,
  ListHeader,
  ListView,
  ListRow,
  ListItem
} from "@jswf/react";
import { SettingViewProps } from "..";
import { DatabaseInfo, DatabaseModule, DATABASE_CONFIG } from "./Module";
import { MessageModule } from "../../Parts/MessageText";
import { useModule } from "@jswf/redux-module";

export interface SettingState {
  Settings: { isWindow: boolean };
}

const settingValues: SettingValue[] = [
  {
    type: "string",
    name: "REMOTEDB_HOST",
    label: "アドレス",
    value: "/var/run/postgresql"
  },
  { type: "number", name: "REMOTEDB_PORT", label: "ポート", value: "5432" },
  {
    type: "string",
    name: "REMOTEDB_DATABASE",
    label: "データベース",
    value: "postgres"
  },
  {
    type: "string",
    name: "REMOTEDB_USER",
    label: "ユーザID",
    value: "postgres"
  },
  {
    type: "password",
    name: "REMOTEDB_PASSWORD",
    label: "パスワード",
    value: ""
  }
];
export function DBSettingView(props: SettingViewProps) {
  const [dbConfig, setDBConfig] = useState(settingValues);
  const [dbInfo, setDBInfo] = useState<DatabaseInfo>();
  const message = useModule(MessageModule);

  useMemo(() => {
    const module = new DatabaseModule(props.adapter);
    module.getInfo().then(info => {
      setDBInfo(info);
    });

    module.getConfig().then(config => {
      const newValues = dbConfig.map(value => {
        return {
          ...value,
          value: config[value.name! as keyof DATABASE_CONFIG] || value.value
        };
      });
      setDBConfig(newValues);
    });
  }, []);
  useEffect(() => {
    props.setSave(onSave);
    return () => {
      props.setSave();
    };
  }, []);
  function onSave() {
    message.setMessage("DBの設定中");
    setDBConfig(dbConfig => {
      const module = new DatabaseModule(props.adapter);
      const config = dbConfig.reduce(
        (dest, src) => {
          dest[src.name!] = src.value;
          return dest;
        },
        {} as { [key: string]: unknown }
      );
      module.setConfig((config as never) as DATABASE_CONFIG).then(value => {
        message.setMessage( value ? "接続成功" : "接続失敗");
        module.getInfo().then(info => {
          setDBInfo(info);
        });
      });
      return dbConfig;
    });
  }
  return (
    <FlexParent>
      <div style={{ flex: 1 }}>
        <SettingView {...{ values: dbConfig, onChange: v => setDBConfig(v) }} />
      </div>
      <div>
        <ListView>
          <ListHeaders>
            <ListHeader width={200}>項目</ListHeader>
            <ListHeader>状態</ListHeader>
          </ListHeaders>
          <ListRow>
            <ListItem>接続状態</ListItem>
            <ListItem>
              {dbInfo && dbInfo.connect ? "connected" : "disconnect"}
            </ListItem>
          </ListRow>
          <ListRow>
            <ListItem>データベース</ListItem>
            <ListItem>{dbInfo && dbInfo.database}</ListItem>
          </ListRow>
          <ListRow>
            <ListItem>物理サイズ</ListItem>
            <ListItem>
              {dbInfo &&
                String(Math.floor(dbInfo.size / 1024)).replace(
                  /(\d)(?=(\d\d\d)+(?!\d))/g,
                  "$1,"
                ) + " KB"}
            </ListItem>
          </ListRow>
          <ListRow>
            <ListItem>サーバ情報</ListItem>
            <ListItem>{dbInfo && dbInfo.server}</ListItem>
          </ListRow>
        </ListView>
      </div>
    </FlexParent>
  );
}

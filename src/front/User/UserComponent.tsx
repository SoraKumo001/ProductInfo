import { ReactNode } from "react";
import React from "react";
import { UserModule } from "./UserModule";
import {  useModule } from "@jswf/redux-module";
import { useInit } from "../Parts/HooksLib";


export function UserComponent(props: { children?: ReactNode }) {
  const userModule = useModule(UserModule);
  useInit(() => {
    userModule.request();
  });
  return <>{props.children}</>;
}

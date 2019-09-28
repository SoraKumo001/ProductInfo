import React, { useRef, useState, useLayoutEffect } from "react";
import {
  ListView,
  ListHeaders,
  ListHeader,
  ListItem,
  ListRow
} from "@jswf/react";

export interface SettingValue {
  name?: string;
  label: string;
  value: string | number | boolean;
  type: string;
  options?: { label?: string; value: string }[];
}

export function InputText(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{
        fontSize: "1em",
        paddingLeft: "0.1em",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
        outline: "none",
        border: "none"
      }}
      {...props}
    />
  );
}
type Props = {
  values: SettingValue[];
  onChange?: (values: SettingValue[]) => void;
};

export function SettingView(props: Props) {
  const [values, setValues] = useState<SettingValue[]>(props.values);
  const flag = props.values.reduce((flag,value,index)=>{
    return flag && value === values[index];
  },true);
  if(!flag)
    setValues(props.values);
  useLayoutEffect(() => {
    if (props.onChange) props.onChange(values);
  });

  function inputType(v: SettingValue) {
    const imageRef = useRef<HTMLImageElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);
    let input = <></>;
    switch (v.type) {
      case "string":
        input = (
          <InputText
            value={v.value as string}
            onChange={e => {
              v.value = e.target.value;
              setValues([...values]);
            }}
          />
        );
        break;
      case "password":
        input = (
          <InputText
            type="password"
            value={v.value as string}
            onChange={e => {
              v.value = e.target.value;
              setValues([...values]);
            }}
          />
        );
        break;
      case "number":
        input = (
          <InputText
            type="tel"
            value={v.value as string}
            onBlur={e => {
              v.value = parseFloat(v.value as string);
              setValues([...values]);
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                v.value = parseFloat(v.value as string);
                setValues([...values]);
              }
            }}
            onChange={e => {
              v.value = e.target.value;
              setValues([...values]);
            }}
          />
        );
        break;
      case "check":
        input = (
          <input
            type="checkbox"
            value={v.value as string}
            onChange={e => {
              v.value = e.target.checked;
              setValues([...values]);
            }}
          />
        );
        break;
      case "select":
        input = (
          <select
            value={v.value as string}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              outline: "none",
              border: "none"
            }}
            onChange={e => {
              v.value = e.target.value;
              setValues([...values]);
            }}
          >
            {v.options!.map(option => (
              <option value={option.value as string}>{option.label}</option>
            ))}
          </select>
        );
        break;
      case "textbox":
        input = (
          <textarea
            value={v.value as string}
            style={{
              overflow: "hidden",
              width: "100%",
              resize: "vertical",
              backgroundColor: "transparent",
              outline: "none",
              border: "none"
            }}
            onChange={e => {
              if (e.target.offsetHeight < e.target.scrollHeight)
                e.target.style.height = e.target.scrollHeight + "px";
              v.value = e.target.value;
              setValues([...values]);
            }}
          />
        );
        break;
      case "image":
        input = (
          <div
            style={{
              textAlign: "center",
              width: "100%",
              height: "100%",
              backgroundColor: drag ? "rgba(0,0,0,0.1)" : ""
            }}
            onClick={e => {
              fileRef.current!.click();
              e.stopPropagation();
            }}
            onDragEnter={() => setDrag(true)}
            onDragLeave={() => setDrag(false)}
            onDrop={function(this: HTMLDivElement, e) {
              onFile(e.dataTransfer.files);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <input
              style={{ display: "none" }}
              ref={fileRef}
              type="file"
              onChange={e => {
                if (e.target) onFile(e.target.files!);
              }}
            />
            {v.value ? (
              <img
                ref={imageRef}
                style={{ maxWidth: "90%" }}
                src={v.value as string}
                onLoad={() => {
                  setValues([...values]);
                }}
              />
            ) : (
              "-"
            )}
          </div>
        );
        break;
    }
    return input;
    function onFile(fileList: FileList) {
      if (fileList && fileList.length) {
        const file = fileList[0];
        if (file.type.indexOf("image") != -1) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function() {
            v.value = reader.result as string;
            setValues([...values]);
          };
        }
      }
    }
  }

  const listViewRef = useRef<ListView>(null);
  return (
    <ListView ref={listViewRef}>
      <ListHeaders>
        <ListHeader width={200}>設定</ListHeader>
        <ListHeader>内容</ListHeader>
      </ListHeaders>
      {values.map((v, index) => (
        <ListRow key={index}>
          <ListItem>{v.label}</ListItem>
          <ListItem>{inputType(v)}</ListItem>
        </ListRow>
      ))}
    </ListView>
  );
}

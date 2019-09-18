import React, { ReactElement, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { SplitView } from "@jswf/react";
import { GenreTree } from "./GenreTree";
import { Router, LocationParams } from "./Router";
import { Manager } from "./Manager.tsx";
import { Adapter } from "@jswf/core";

function App() {
  const [location, setLocation] = useState<LocationParams>({});
  const [adapter, setAdapter] = useState<Adapter>();
  return (
    <Manager onAdapter={adapter=>setAdapter(adapter)}>
      <Router onLocation={loc => setLocation(loc)}>
        <SplitView pos={300}>
          <GenreTree adapter={adapter!} location={location} />
          <div>{JSON.stringify(location)}</div>
        </SplitView>
      </Router>
    </Manager>
  );
}
addEventListener("DOMContentLoaded", () => {
  const root = document.createElement("div");
  document.querySelector("body")!.appendChild(root);
  ReactDOM.render(<App />, root);
});

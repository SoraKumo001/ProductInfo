import React, { ReactElement, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { SplitView } from "@jswf/react";
import { GenreTree } from "./GenreTree";
import { Router, LocationParams } from "./Router";
import { Manager } from "./Manager.tsx";
import { Adapter } from "@jswf/adapter";
import { RakutenModule } from "./Module/RakutenModule";
import { RakutenItemList } from "./ItemList/RakutenItem";

function App() {
  const [location, setLocation] = useState<LocationParams>({});
  const [adapter, setAdapter] = useState<Adapter>();
  const [rakutenModule, setRakutenModule] = useState<RakutenModule>();
  return (
    <Manager
      onAdapter={adapter => setAdapter(adapter)}
      onRakutenModule={module => setRakutenModule(module)}
    >
      <Router onLocation={location => setLocation(location)}>
        <SplitView pos={300}>
          <>
            {rakutenModule && (
              <GenreTree rakutenModule={rakutenModule} location={location} />
            )}
          </>
          <>
            {rakutenModule && (
              <RakutenItemList
                rakutenModule={rakutenModule}
                location={location}
              />
            )}
          </>
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

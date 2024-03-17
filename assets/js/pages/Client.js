import "react-querybuilder/dist/query-builder.scss";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Modals from "../components/Modals";
import IndexPage from "./IndexPage";
import SamplePage from "./SamplePage";

class Client extends Modals {
  constructor(props) {
    super(props);
  }

  render() {
    return this.modalsWrapper(
      <BrowserRouter basename={`${window.basename}`}>
        <div className={"client"}>
          <div className={"app-content"}>
            <Routes>
              <Route path="/" element={<IndexPage that={this} />} />
              <Route path="/sample/:id" element={<SamplePage that={this} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default Client;

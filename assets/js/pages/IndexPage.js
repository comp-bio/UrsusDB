import React from "react";
import Loader from "../components/Loader";
import {
  Button,
  FormControlLabel,
  IconButton,
  InputBase,
  Paper,
  Switch,
} from "@mui/material";
import Enter from "../svg/Enter.svg";
import { QueryBuilder } from "react-querybuilder";
import DataTable from "../components/DataTable";
import FullMapWrapper from "../components/FullMapWrapper";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import CoronavirusOutlinedIcon from "@mui/icons-material/CoronavirusOutlined";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";

const operators = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: "<", label: "<" },
  { name: ">", label: ">" },
  { name: "<=", label: "<=" },
  { name: ">=", label: ">=" },
  { name: "contains", label: "contains" },
  { name: "beginsWith", label: "begins with" },
  { name: "endsWith", label: "ends with" },
  { name: "doesNotContain", label: "does not contain" },
  { name: "doesNotBeginWith", label: "does not begin with" },
  { name: "doesNotEndWith", label: "does not end with" },
  { name: "null", label: "is null" },
  { name: "notNull", label: "is not null" },
];

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
    this.that = props.that;
    this.qref = React.createRef();
    this.state = { query: null, fields: null, useQB: false, fullMap: false };
    this.loader = new Loader(this);
    this.admin = document.querySelector("body").dataset.admin !== "False";
  }

  componentDidMount() {
    this.loader.get("search", {}, (u, data) => {
      const fields = data?.header.map((e) => ({
        name: e.label,
        label: e.label,
      }));
      this.setState({ fields: fields, ...data });
    });
  }

  searchWrapper(q) {
    this.setState({ query: q }, () => this.search());
  }

  search() {
    this.loader.get("search", { req: this.state.query }, (u, data) => {
      this.setState(data);
    });
  }

  searchSimple() {
    this.loader.get(
      "search-simple",
      { value: this.qref.current.value },
      (u, data) => {
        this.setState(data);
      }
    );
  }

  setQB(to) {
    this.setState({ useQB: to }, () => {
      if (to) return this.search();
      this.searchSimple();
    });
  }

  template(name) {
    this.loader.get("custom/template", { name: name }, (u, data) => {
      window.location.href = "/columns";
    });
  }

  render() {
    if (this.state.header && this.state.header.length === 0 && this.admin) {
      return (
        <div className="centred-start">
          <h2>Use a template to create a database:</h2>
          <div className="qs-buttons">
            <div onClick={() => this.template("animal")} className="qs-button">
              <PetsOutlinedIcon />
              <span>Animal Database</span>
            </div>
            <div onClick={() => this.template("plant")} className="qs-button">
              <YardOutlinedIcon />
              <span>Plant Database</span>
            </div>
            <div onClick={() => this.template("virus")} className="qs-button">
              <CoronavirusOutlinedIcon />
              <span>Virus Database</span>
            </div>
            <div onClick={() => this.template("empty")} className="qs-button">
              <CodeOutlinedIcon />
              <span>No template</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={"search-page"}>
        <div className={"search-header"}>
          <div className={"container"}>
            <div className={"main-input"}>
              <Paper
                className={
                  "search-input " + (this.state.useQB ? "disabled" : "")
                }
              >
                <InputBase
                  inputRef={this.qref}
                  disabled={this.state.useQB}
                  onChange={(e) => this.searchSimple()}
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search Samples"
                />
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  aria-label="directions"
                >
                  <Enter />
                </IconButton>
              </Paper>
              <FormControlLabel
                control={<Switch />}
                onChange={(e) => this.setQB(e.target.checked)}
                label="Extended search (use Query Builder)"
              />
            </div>
            {this.state.fields && this.state.useQB ? (
              <QueryBuilder
                operators={operators}
                onQueryChange={(q) => this.searchWrapper(q)}
                query={this.state.query}
                fields={this.state.fields}
              />
            ) : (
              ""
            )}
          </div>
        </div>
        <div className={"container map-switch"}>
          <FormControlLabel
            control={<Switch />}
            onChange={(e) => this.setState({ fullMap: e.target.checked })}
            label="Show map"
          />
        </div>
        <div className={"container"}>
          {this.state.items && this.state.items.length && this.state.fullMap ? (
            <FullMapWrapper items={this.state.items} />
          ) : (
            ""
          )}
          <DataTable that={this} root={this.that} />
        </div>
        {this.admin ? (
          <div className="container admin-link-wrapper">
            <Button
              className={"admin-link"}
              color="success"
              variant="contained"
              href={`/samples`}
            >
              Manage samples
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default IndexPage;

import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Trash from "../svg/Trash.svg";
import Eye from "../svg/Eye.svg";
import Pencil from "../svg/Pencil.svg";
import chroma from "chroma-js";

import { Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import TableImages from "./TableImages";

const js_domain = [20, 1];
const arrayRange = (start, stop, step) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
  );
const xrange = arrayRange(
  js_domain[1],
  js_domain[0],
  (js_domain[0] - js_domain[1]) / 100
);
const colorScale = chroma.scale("Spectral").domain(js_domain);

console.log(xrange);

class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.that = props.that;
    this.root = props.root;
    this.state = { col: [] };
    this.editable = props.editable;
  }

  col2header(e) {
    let h = {
      field: e.label,
      headerName: e.name,
      type: e.type,
      width: Math.max(100, e.name.length * 6.5 + 30 + 26),
      renderCell: (p) => (
        <span className={p.row["_pre_removed"] ? "pre-removed" : ""}>
          {p.row[e.label]}
        </span>
      ),
    };

    if (e.type === "json") {
      h.sortable = false;
      h.width = 26 * 3 + 100;
      h.renderHeader = (p) => {
        //<strong>{p.field}</strong>
        return (
          <div className="js-head">
            <div className="js-range">
              <div className="js-range-v">
                {xrange.map((v, kv) => (
                  <span
                    key={kv}
                    style={{ background: colorScale(v).css() }}
                  ></span>
                ))}
              </div>
              <div className="js-helpers">
                <span>low</span> <span>medium</span> <span>high</span>
              </div>
            </div>
          </div>
        );
      };
      h.renderCell = (p) => {
        let jso = JSON.parse(p.row[e.label]);
        return (
          <div className="js-hist">
            {Object.keys(jso).map((sq, sqk) => (
              <div
                title={jso[sq].toFixed(2)}
                key={sqk}
                className="psq"
                style={{ background: colorScale(jso[sq]).css() }}
              >
                {sq}
              </div>
            ))}
          </div>
        );
        return "";
      };
    }
    if (e.type === "string") {
      h.renderCell = (p) => {
        if (p.row[e.label] && p.row[e.label].indexOf("SRR") === 0) {
          return (
            <a
              target="_blank"
              rel="noopener"
              href={`https://trace.ncbi.nlm.nih.gov/Traces/?view=run_browser&acc=${
                p.row[e.label]
              }&display=metadata`}
            >
              {p.row[e.label]}
            </a>
          );
        }
        return p.row[e.label];
      };
    }
    if (e.type === "images") {
      h.width = 127;
      h.renderCell = (p) =>
        TableImages((p.row[e.label] || []).slice(0, 3), this.root);
    }
    if (e.type === "location") {
      h.renderCell = (p) => {
        if (!p.row[e.label]) return "–";
        return (
          <span className={p.row["_pre_removed"] ? "pre-removed" : ""}>
            {p.row[e.label].lat},{p.row[e.label].lng}
          </span>
        );
      };
    }
    return h;
  }

  actions(p) {
    return (
      <div className={"row-actions"} aria-label="outlined button group">
        {this.editable ? (
          <>
            <Button
              onClick={() => {
                this.that.edit(p.row);
              }}
              color="secondary"
              component="label"
            >
              <Pencil />
            </Button>
            <Button
              onClick={() => {
                this.that.remove([p.row.id]);
              }}
              color="error"
              component="label"
            >
              <Trash />
            </Button>
          </>
        ) : (
          ""
        )}
        <Button
          color="success"
          target="_blank"
          component={Link}
          to={`/sample/${p.row.id}`}
        >
          <Eye />
        </Button>
      </div>
    );
  }

  render() {
    console.log("this.that", this.that);
    if (!this.that || !this.that.state.items || !this.that.state.header) {
      return <CircularProgress />;
    }

    let columns = [
      {
        field: "actions",
        headerName: "Actions",
        width: 70,
        renderCell: (p) => this.actions(p),
      },
    ];

    columns = [
      ...columns,
      ...this.that.state.header
        .filter((e) => e.preview)
        .map((e) => this.col2header(e)),
    ];
    //columns.push()

    const initialState = {
      pagination: {
        paginationModel: { pageSize: 25 },
      },
    };

    return (
      <DataGrid
        className={"data-table-wrapper"}
        columns={columns}
        rows={this.that.state.items}
        initialState={initialState}
        autoHeight={true}
        rowHeight={42}
        onRowSelectionModelChange={(sel) => {
          let items = this.that.state.items
            .filter((obj) => sel.indexOf(obj.id) !== -1)
            .map((e) => e.id);
          this.that.setState({ selected: items });
        }}
        // columnBuffer={2}
        // columnThreshold={2}
        disableColumnMenu
        checkboxSelection={this.editable}
        disableRowSelectionOnClick
      />
    );
  }
}

export default DataTable;

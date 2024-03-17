import React from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import DatabaseAdd from "../svg/DatabaseAdd.svg";
import Trash from "../svg/Trash.svg";

import Loader from "../components/Loader";
import Editor from "../components/Editor";
import DataTable from "../components/DataTable";

import Menu from "@mui/material/Menu";

function ExportButton() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (to) => {
    setAnchorEl(null);
    console.log("to");
  };

  return (
    <div>
      <Button
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {["xlsx", "tsv"].map((f) => (
          <MenuItem
            key={f}
            target="_blank"
            component={Link}
            to={`/api/samples/export/${f}`}
            download
            onClick={handleClose}
          >
            {f}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

class SamplesPage extends React.Component {
  constructor(props) {
    super(props);
    this.that = props.that;
    this.loader = new Loader(this);
    this.checker = React.createRef();
    this.state = {
      items: [],
      header: [],
      selected: [],
      window: { w: 1, h: 1 },
    };
  }

  load() {
    this.loader.get("samples/get", {}, (u, data) => {
      this.setState(data);
    });
  }

  componentDidMount() {
    this.load();
  }

  import(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      this.loader.get("samples/import", { data: reader.result }, (u, data) => {
        this.load();
        // this.setState(data);
      });
    };
    reader.readAsDataURL(file);
  }

  create() {
    this.that.open(
      {
        title: "Create Sample",
        body: (
          <Editor
            close={() => this.that.close("modal")}
            header={this.state.header}
            root={this.that}
          />
        ),
      },
      "modal",
      () => {
        this.load();
      }
    );
  }

  edit(obj) {
    this.loader.get("details", obj, (u, details) => {
      this.that.open(
        {
          title: "Edit Sample",
          body: (
            <Editor
              close={() => this.that.close("modal")}
              header={this.state.header}
              that={this}
              root={this.that}
              target={details["sample"]}
            />
          ),
        },
        "modal"
      );
    });
  }

  remove(sel) {
    let text = `The sample #${sel[0].id} has been removed`;
    if (sel.length > 1) text = `The samples has been removed (${sel.length})`;
    const pre = (value) => {
      this.setState((s) => {
        s.items = s.items.map((one) => {
          if (sel.indexOf(one.id) !== -1) one._pre_removed = value;
          return one;
        });
        return { items: s.items };
      });
    };
    pre(true);
    this.that.snack(
      text,
      () => {
        this.loader.get("samples/remove", { checked: sel }, (u, data) => {
          this.setState(data);
        });
      },
      () => {
        pre(false);
      }
    );
  }

  render() {
    return (
      <>
        <div className={"page page-samples"}>
          <div className={"header"}>
            <h2>Samples</h2>
            <div className={"header-buttons"}>
              {this.state.selected.length ? (
                <Button
                  color="error"
                  onClick={() => this.remove(this.state.selected)}
                >
                  <Trash /> Delete selected ({this.state.selected.length})
                </Button>
              ) : (
                ""
              )}
              <Button
                variant="contained"
                disabled={!this.state.header || this.state.header.length === 0}
                onClick={() => this.create()}
              >
                <DatabaseAdd /> Add Sample
              </Button>

              <ButtonGroup aria-label="outlined button group">
                <Button component="label" role={undefined} tabIndex={-1}>
                  <CloudUploadIcon /> Import (tsv, xlsx, accdb)
                  <VisuallyHiddenInput
                    onChange={(e) => this.import(e)}
                    type="file"
                  />
                </Button>

                <ExportButton />
              </ButtonGroup>
            </div>
          </div>
          {this.state["loading:samples/get"] ? (
            <CircularProgress />
          ) : this.state.header.length > 0 ? (
            <DataTable that={this} root={this.that} editable={true} />
          ) : (
            <Alert severity="info">
              You have not created any <strong>columns</strong> for your
              samples. Please <Link to={"/columns"}>create them!</Link>
            </Alert>
          )}
        </div>
      </>
    );
  }
}

export default SamplesPage;

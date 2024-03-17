import axios from "axios";

class Loader {
  constructor(parent) {
    this.parent = parent;
    this.cancel = {};
  }

  get(path, data, after, isblob = false) {
    console.log("window.basename", window.basename);
    if (this.cancel[path]) {
      this.cancel[path].cancel("Request canceled by user");
    }

    const CancelToken = axios.CancelToken;
    this.cancel[path] = CancelToken.source();

    const l = `loading:${path}`;
    this.parent.setState({ [l]: true });

    const obj = {
      url: `${window.basename}api/${path}`,
      method: "post",
      data: data || {},
      cancelToken: this.cancel[path].token,
    };

    if (isblob) {
      obj.responseType = "blob";
    }

    axios(obj)
      .then((res) => {
        this.parent.setState({ ["data:" + path]: res.data });
        this.parent.setState({ [l]: false });
        if (after) after(path, res.data);
      })
      .catch((thrown) => {
        if (axios.isCancel(thrown)) {
          console.log("[STOP]", thrown.message);
        } else {
          console.log("[ERROR]", thrown.message);
          this.parent.setState({ [l]: false });
        }
      });
  }
}

export default Loader;

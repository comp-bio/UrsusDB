import React from "react";
import FileBrowser from "../components/FileBrowser";
import Loader from "../components/Loader";

class _ImportPage extends React.Component {
    constructor(props) {
        super(props);
        this.loader = new Loader(this);
        this.state = {'active': [], 'log': {}};
        this.interval = undefined;
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            if (this.state['active'].length === 0) return;
            this.loader.get('loader/log', {'active': this.state['active']}, (u, data) => {
                this.setState({'log': data})
            });
        }, 731);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    browserParse(items) {
        this.loader.get('loader/import', {'items': Object.keys(items)}, (url, data) => {
            this.setState(prevState => {
                prevState['active'].push(data);
                return {'active': prevState['active']}
            });
        });
    }

    logParse(txt) {
        if (!txt) return {w: '0%', txt: 'Loading'};
        if (txt.indexOf('Done') !== -1) return {w: '100%', txt: 'Done'};
        let obj = txt.split(':')
        let px = [parseInt(obj[0]), parseInt(obj[1])];
        if (px[1] <= 0) return {w: '0%', txt: 'Not found'};
        return {w: (100 * px[0] / px[1]) + '%', txt: `${obj[0]} of ${obj[1]}, ${obj[2]}`};
    }

    render() {
        return (
            <div className={'page page-import'}>
                <FileBrowser status={'show fade'} parse={(items) => this.browserParse(items)} />
                <div className={'process-list'}>
                    {this.state['active'].map((proc, k) => {
                        let l = this.logParse(this.state['log'][proc['pid']])
                        return (
                            <div key={k} className={'pid'}>
                                <pre>Import PID: {proc['pid']}</pre>
                                <pre>Files list: {proc['cmd'][2]}</pre>
                                <pre>Current: {l.txt}</pre>
                                <div className={'progress-bar'}><span style={({width: l.w})} /></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default _ImportPage;

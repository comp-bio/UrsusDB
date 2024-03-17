import React from 'react';
import Loader from './Loader';

import File   from '../svg/File.svg';
import Folder from '../svg/Folder.svg';
import Arrow  from '../svg/Arrow.svg';

class FileBrowser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'root': '/',
      'active': false,
      'opened': {},
      'selected': {},
      'value': this.props.value || '',
      'default_value': this.props.default || false,
    };
    this.get = this.get.bind(this);
    this.loader = new Loader(this);
    this.ref = props.refData || React.createRef();
  }

  get(item) {
    this.setState(prevState => {
      let opened = prevState.opened;
      opened[item.path] = !opened[item.path];
      return {'opened': opened};
    }, () => {
      if (!this.state.opened[item.path]) return;
      this.loader.get('utils/browser', {'path': item.path}, (p, data) => {
        this.setState({[`ls${item.path}`]: data});
        console.log('this.state', this.state);
      });
    });
  }

  componentDidMount() {
    this.get({'path': this.state.root})
  }

  renderItems(data) {
    const Add = (item) => {
      this.setState(prevState => {
        if (prevState['selected'][item.path]) {
          delete prevState['selected'][item.path];
        } else {
          prevState['selected'][item.path] = item.type;
        }
        return {'selected': prevState['selected']};
      });
    };

    const Select = (item) => {
      this.get(item);
      this.setState({'selected': {[item.path]: item.type}});
    };

    const items = data.map((item, k) => {
      return (
        <div key={k} className={`item type-${item.type} ${this.state.opened[item.path] ? 'opened' : ''}`}>
          <div onClick={(e) => e.ctrlKey || e.metaKey ? Add(item) : Select(item)} className={`meta`}>
            <File />
            <Folder />
            <div className={`name ${this.state.selected[item.path] ? 'selected' : ''}`}>
              {item.name} <Arrow />
            </div>
          </div>
          <div className={'children'}>
            {this.state.opened[item.path] ? this.renderItems(this.state[`ls${item.path}`] || []) : ''}
          </div>
        </div>
      );
    });

    return <div>{items}</div>;
  }

  resetSelected() {
    this.setState({'selected': {}});
  }

  render() {
    return (
      <div className={`browser ${this.props.status}`}>
        <div className={`browser-box`}>
          <div className={`selector ${this.state.active ? 'active' : ''}`}>
            <div className={'head'}>
              <span>Select directory</span>
            </div>
            <div className={'tree'}>
              {this.renderItems(this.state['ls' + this.state.root] || [])}
            </div>
            <div className={'footer'}>
              &nbsp;
              <button onClick={() => {
                this.props.parse(this.state.selected);
                this.resetSelected();
              }} className={'btn btn-primary'}
                 disabled={Object.keys(this.state.selected).length === 0}>Import</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FileBrowser;
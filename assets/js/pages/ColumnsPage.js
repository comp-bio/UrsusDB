import React from "react";
import Loader from "../components/Loader";
import {ReactSortable} from "react-sortablejs";

import ArrowDownUp from "../svg/ArrowDownUp.svg";
import CalendarDate from "../svg/CalendarDate.svg";
import Clock from "../svg/Clock.svg";
import CardImage from "../svg/CardImage.svg";
import GeoAlt from "../svg/GeoAlt.svg";
import BodyText from "../svg/BodyText.svg";
import Number from "../svg/Number.svg";
import UiRadios from "../svg/UiRadios.svg";
import Enter from "../svg/Enter.svg";

import {
    Button, ButtonGroup,
    Checkbox, Chip, Divider,
    FormControlLabel, IconButton, InputBase,
    TextField, Alert, CircularProgress
} from "@mui/material";


const dataTypes = {
    'number': <Number />,
    'date': <CalendarDate />,
    'datetime': <Clock />,
    'location': <GeoAlt />,
    'images': <CardImage />,
    'select': <UiRadios />,
    'string': <BodyText />
};

class ColumnsPage extends React.Component {
    constructor(props) {
        super(props);
        this.that = props.that;
        this.loader = new Loader(this);
        this.state = {'client': [], 'base': []};
        this.timers = {};
    }

    componentDidMount() {
        this.loader.get('custom/get', {}, (u, data) => {
            this.setState(data);
        });
    }

    create(type) {
        this.loader.get('custom/create', {'type': type}, (u, data) => {
            this.setState(data);
        });
    }

    update(T) {
        if (this.timers[T]) clearTimeout(this.timers[T]);
        this.timers[T] = setTimeout(() => {
            this.loader.get('custom/update', {'client': this.state.client});
        }, 400);
    }

    remove(id) {
        this.loader.get('custom/remove', {'id': id}, (u, data) => {
            this.setState(data);
        });
    }

    change(id, attr, e) {
        this.setState(s => {
            s.client.map(col => {
                if (col.id !== id) return;
                col[attr] = e; // e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
            });
            return {'client': s.client};
        }, () => {
            this.update(`${id}-${attr}`);
        })
    }

    addOption(col, value) {
        let result = col.options.constructor === Array ? col.options : [];
        if (result.indexOf(value) !== -1 || value === '') return ;
        this.change(col.id, 'options', result.concat([value]));
    }

    renderColumns() {
        return (
            <ReactSortable handle={'.handle'} animation={150} list={this.state.client}
                           setList={(items) => {
                               this.setState({'client': items}, () => {
                                   if (!this.state.client.length) return
                                   this.update(`Order`);
                                   // this.loader.get('custom/update', {'client': this.state.client});
                               })
                           }}>
                {this.state.client.map((col, k) => {
                    let variants = (col.options && col.options.constructor === Array) ? col.options : [];
                    let ref = React.createRef();
                    return (
                        <div key={col.id} className={'row-wrapper'}>
                            <div className={'row-panel'}>
                                <div className={'handle'}><ArrowDownUp /></div>
                                <div className={'panel panel-' + col.type}>
                                    {dataTypes[col.type]}
                                    <TextField onChange={e => this.change(col.id, 'name', e.target.value)} value={col.name || ''}
                                               className={'input-wrapper'}
                                               label={`Name (${col.type})`} variant="outlined" size="small" />
                                    <FormControlLabel control={
                                        <Checkbox onChange={e => this.change(col.id, 'preview', (e.target.checked ? 1 : 0))} checked={col.preview > 0} />
                                    } label="Preview" className={'preview-wrapper'} />
                                    <Button onClick={() => this.remove(col.id)}
                                            variant="outlined" size="small" color="error">Delete</Button>
                                </div>
                            </div>
                            {col.type === 'select' ? (
                                <div className={'variants'}>
                                    <div className={'current'}>
                                        {variants.map((v, vk) => {
                                            return (
                                                <Chip onDelete={() => {
                                                    this.change(col.id, 'options', variants.filter(t => t !== v));
                                                }} className={'one'} key={vk} label={v} size="small" />
                                            );
                                        })}
                                        {!variants.length ? <span className={'empty'}>No options added</span> : ''}
                                    </div>
                                    <div className={'add-option'}>
                                        <InputBase inputRef={ref} onKeyPress={(e) => {
                                            if (e.key !== 'Enter') return
                                            e.preventDefault();
                                            this.addOption(col, e.target.value);
                                            e.target.value = '';
                                        }} sx={{ ml: 1, flex: 1 }} placeholder="Add option" />

                                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                                        <IconButton onClick={() => {
                                            this.addOption(col, ref.current.value);
                                            ref.current.value = '';
                                        }} color="primary" sx={{ p: '10px' }} aria-label="directions">
                                            <Enter />
                                        </IconButton>
                                    </div>
                                </div>
                            ) : ''}
                        </div>
                    );
                })}
            </ReactSortable>
        );
    }

    render() {
        return (
            <div className={'page'}>
                <div className={'header'}>
                    <h2>Columns</h2>
                    <ButtonGroup className={'header-buttons'} variant="outlined" aria-label="outlined button group">
                        {Object.keys(dataTypes).map(k => (
                            <Button key={k} variant="outlined" onClick={() => this.create(k)}>{dataTypes[k]} {k}</Button>
                        ))}
                    </ButtonGroup>
                </div>

                <div className={'custom-table'}>
                    <div className={'custom-body'}>
                        {this.state['loading:custom/get'] ? (
                            <CircularProgress />
                        ) : (
                            this.state.client.length > 0 ? (
                                this.renderColumns()
                            ) : (
                                <Alert severity="info">
                                    You have not created any <strong>columns</strong> for your samples.
                                    To create columns (fields) of a given type, use the buttons at the top right.
                                </Alert>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }
}


export default ColumnsPage;


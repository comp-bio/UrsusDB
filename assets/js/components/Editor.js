import React from "react";
import Loader from "./Loader";
import ImagesInput from "./ImagesInput";
import dayjs from 'dayjs';
import { Button, DialogActions, DialogContent, InputAdornment, MenuItem, TextField } from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.root = props.root;
        this.that = props.that;
        this.state = {'sample': props.target || {}};
        this.header = props.header || [];
        this.header.map(h => this.state.sample[h.label] = this.state.sample[h.label] || '');
        this.loader = new Loader(this);
    }

    set(label, value) {
        this.setState(s => {
            s.sample[label] = value;
            return {'sample': s.sample};
        });
    }

    render_number(h) {
        return <TextField
            type="number" size="small"
            label={h.name}
            value={this.state.sample[h.label] || ''}
            onChange={(e) => this.set(h.label, e.target.value)}
            variant="outlined"
        />
    }

    render_date(h) {
        return <DatePicker
            label={h.name} rawValue={this.state.sample[h.label] || ''}
            value={this.state.sample[h.label] || ''}
            inputFormat="YYYY/MM/DD"
            onChange={(value) => this.set(h.label, dayjs(value).format('YYYY/MM/DD'))}
            renderInput={(params) => <TextField size="small" variant="outlined" {...params} />}
        />
    }

    render_datetime(h) {
        return <DateTimePicker
            label={h.name} rawValue={this.state.sample[h.label] || ''}
            value={this.state.sample[h.label] || ''}
            inputFormat="YYYY/MM/DD HH:mm"
            onChange={(value) => this.set(h.label, dayjs(value).format('YYYY/MM/DD HH:mm'))}
            renderInput={(params) => <TextField size="small" variant="outlined" {...params} />}
        />
    }

    render_location(h) {
        const validate = {
            'lat': (num) => (isFinite(num) && Math.abs(num) <=  90) ? num : (num %  90),
            'lng': (num) => (isFinite(num) && Math.abs(num) <= 180) ? num : (num % 180)
        }

        const saveLatLng = (n, value) => {
            let reg = value.replace(',', '.').match(/([\-0-9]+\.?[0-9]{0,8})/g);
            if (!reg && value !== '') return ;
            setLatLng(n, validate[n](reg ? reg[0] : value));
        }

        const setLatLng = (n, value) => {
            this.setState(s => {
                if (!s.sample[h.label]) s.sample[h.label] = {};
                s.sample[h.label][n] = value;
                return {'sample': s.sample};
            });
        };

        let w = {'width': '100px'};
        return (
            <>
                <label className={'label'}>{h.name}</label>
                <div className={'locations-wrapper'}>
                    <TextField
                        size="small"
                        className={'lat'}
                        placeholder={"0.0000"}
                        value={this.state.sample[h.label].lat || ''}
                        onChange={(e) => setLatLng('lat', e.target.value)}
                        onBlur={(e) => saveLatLng('lat', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment style={w} position="start">Latitude</InputAdornment>,
                        }}
                    />
                    <TextField
                        size="small"
                        className={'lng'}
                        placeholder={"0.0000"}
                        value={this.state.sample[h.label].lng || ''}
                        onChange={(e) => setLatLng('lng', e.target.value)}
                        onBlur={(e) => saveLatLng('lng', e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment style={w} position="start">Longitude</InputAdornment>,
                        }}
                    />
                </div>
            </>
        )
    }

    render_images(h) {
        let items = (this.state.sample[h.label] || []).map(k => ({data_url: k}));
        return (
            <>
                <label className={'label'}>{h.name}</label>
                <ImagesInput root={this.root} items={items} onChange={(items) => this.set(h.label, items)} />
            </>
        );
    }

    render_select(h) {
        let options = h.options;
        let v = this.state.sample[h.label] || '';
        if (options.indexOf(v) === -1) options.push(v);

        return <TextField select
            label={h.name} size="small"
            value={v}
            defaultValue={v}
            onChange={(e) => this.set(h.label, e.target.value)}
            variant="outlined"
        >{options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
    }

    render_string(h) {
        return <TextField
            label={h.name} size="small"
            value={this.state.sample[h.label] || ''}
            onChange={(e) => this.set(h.label, e.target.value)}
            variant="outlined" />
    }

    render() {
        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DialogContent dividers={true}>
                    <div tabIndex={-1}>
                        <div className={'modal-body object-editor'}>
                            {this.header.map(h => (
                                <div key={h.id} className={'input-block'}>
                                    {this[`render_${h.type}`](h) ? this[`render_${h.type}`](h) : this.render_string(h)}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className={'modal-footer'}>
                    <Button variant="outlined" onClick={() => this.props.close('modal')}>Close</Button>
                    <Button variant="outlined" color='success' onClick={() => {
                        if (this.state['loading:samples/update']) return ;
                        this.loader.get('samples/update', {'sample': this.state.sample}, (url, data) => {
                            this.props.close('modal');
                            this.that.setState(data);
                        })
                    }}>Save Changes{this.state['loading:samples/update'] ? ' ...' : ''}</Button>
                </DialogActions>
            </LocalizationProvider>
        );
    }
}

export default Editor;
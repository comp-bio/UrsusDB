import React from "react";
import Loader from "../components/Loader";
import MapX from "../components/MapWrapper";
import {Breadcrumbs, Card, CardContent, Divider, Link, ListItem, Typography} from "@mui/material";
import TableImages from "../components/TableImages";


class SamplePage extends React.Component {
    constructor(props) {
        super(props);
        this.that = props.that;
        this.state = {'sample': {
            'id': location.pathname.split('/sample/')[1]
        }, 'header': []};
        this.loader = new Loader(this);
    }

    componentDidMount() {
        this.loader.get('details', this.state.sample, (u, data) => {
            this.setState(data);
        });
    }

    render_location(h) {
        const e = this.state.sample[h.label];
        if (!e || !e.lat || !e.lng) return ('');
        return (
            <MapX key={h.id} center={[e.lng, e.lat]} />
        );
    }

    render_images(h) {
        const e = this.state.sample[h.label];
        if (!e || !e.length) return ;
        return (
            <div className={'sample-value'} key={h.id}>
                {TableImages(e, this.that)}
            </div>
        );
    }

    render_string(h) {
        const e = this.state.sample[h.label];
        if (!e) return ;
        return (
            <div className={'sample-value'} key={h.id}>
                <ListItem>
                    <span className={'label'}>{h.name}:</span><span className={'value'}>{e}</span>
                </ListItem>
            </div>
        );
    }


render() {
        return (
            <div className={'container container-sm'}>
                <Card className={'sample-item'}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href={basename}>Index</Link>
                        <Typography color="text.primary">Sample #{this.state.sample.id}</Typography>
                    </Breadcrumbs>
                    {this.state.header.map(h => this[`render_${h.type}`] ? this[`render_${h.type}`](h) : this.render_string(h))}
                </Card>
            </div>
        );
    }
}

export default SamplePage;
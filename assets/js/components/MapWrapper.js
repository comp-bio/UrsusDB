// https://openlayers.org/en/latest/apidoc/

import React, { useState, useEffect, useRef } from 'react';

import { Map, View } from 'ol';
import { transform, fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';

import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

import 'ol/ol.css';
import {Point} from "ol/geom";

const pt = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z\"/></svg>";

function MapX(params) {
    const point = transform(params.center, 'EPSG:4326', 'EPSG:3857')

    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

    const startMarker = new Feature({
        type: 'icon',
        geometry: new Point(point),
    });
    const iconStyle = new Style({
        image: new Icon({
            scale: 2,
            anchor: [0.5, 0.5],
            src: 'data:image/svg+xml;utf8,' + pt,
        }),
    })
    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: [startMarker],
        }),
        style: iconStyle,
    });

    const osmLayer = new TileLayer({
        preload: Infinity,
        source: new OSM({
            // https://wiki.openstreetmap.org/wiki/Raster_tile_providers
            "url" : "https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
        }),
    });

    const initialMap = new Map({
        target: mapElement.current,
        view: new View({
            center: point,
            zoom: 4,
        }),
        layers: [osmLayer, vectorLayer],
        interactions: []
    });

    useEffect(() => {
        setMap(initialMap);
    }, []);

    return (
        <div ref={mapElement} className="map-container" />
    );
}

export default MapX;

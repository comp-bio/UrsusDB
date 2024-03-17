# -*- coding: utf-8 -*-
import os
import json
from flask import Blueprint, request, jsonify
from application import db
from application.models.sample import Sample
from application.models.sample import SampleStructData
from application.models.struct import Struct

custom = Blueprint('custom', __name__, url_prefix='/api/custom')

# 'number': <Number />,
# 'date': <CalendarDate />,
# 'datetime': <Clock />,
# 'location': <GeoAlt />,
# 'images': <CardImage />,
# 'select': <UiRadios />,
# 'string': <BodyText />

db_templates = {
    'animal': [
        ['ID', 'string'],
        ['Images', 'images'],
        ['Native Region', 'location'],
        ['Species', 'string'],
        ['Breed', 'string'],
        ['Name', 'string'],
        ['Sex', 'select', ['male', 'female']],
        ['Date of Birth', 'date'],
        ['Color', 'select', ['RED', 'GREEN', 'WHITE']],
        ['Weight', 'number'],
        ['Date of Arrival', 'date'],
    ],
    'plant': [
        ['Plant ID', 'string'],
        ['Images', 'images'],
        ['Native Region', 'location'],
        ['Scientific Name', 'string'],
        ['Family', 'string'],
        ['Habitat', 'string'],
        ['Growing Conditions', 'string'],
        ['Color', 'select', ['RED', 'GREEN', 'WHITE']],
        ['Date of Arrival', 'date'],
    ],
    'virus': [
        ['Virus ID', 'string'],
        ['Images', 'images'],
        ['Strain/Variant', 'string'],
        ['Native Region', 'location'],
        ['Genome Type', 'string'],
        ['Host Organism', 'string'],
        ['Transmission Mode', 'select', [
            'airborne', 'vector-borne', 'direct contact']],
        ['Pathogenicity', 'string'],
        ['Date of Arrival', 'date'],
    ],
}


@custom.route('/template', methods=['GET', 'POST'])
def template():
    name = request.json.get('name')
    if name not in db_templates:
        return jsonify({})
    for s in db_templates[name]:
        obj = Struct('sample', s[1])
        obj.update({'name': s[0], 'preview': 1})
        if len(s) > 2:
            obj.update({'options': s[2]})
        db.session.add(obj)
    db.session.commit()
    return jsonify({})


@custom.route('/get', methods=['GET', 'POST'])
def get():
    cols = Struct.query.filter_by(table='sample').order_by(Struct.order).all()
    client = [st.as_dict() for st in cols]
    base = [c.name for c in Sample.__table__.columns]
    return jsonify({'base': base, 'client': client})


@custom.route('/create', methods=['GET', 'POST'])
def create():
    obj = Struct('sample', request.json.get('type'))  # TODO валидация типа
    db.session.add(obj)
    db.session.commit()
    return get()


@custom.route('/update', methods=['GET', 'POST'])
def update():
    for order, col in enumerate(request.json.get('client')):
        obj = Struct.query.filter_by(id=col['id']).first()
        obj.update(col)
        obj.order = order
    db.session.commit()
    return get()


@custom.route('/remove', methods=['GET', 'POST'])
def remove():
    id = request.json.get('id')
    obj = Struct.query.filter_by(id=id).first()
    for rel in SampleStructData.query.filter_by(struct_id=obj.id).all():
        db.session.delete(rel.data)
        db.session.delete(rel)
    db.session.delete(obj)
    db.session.commit()
    return get()

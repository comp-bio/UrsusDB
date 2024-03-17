# -*- coding: utf-8 -*-
from application import app, db
from application.functions import image2file, url2table, export_tsv, export_xlsx
from flask import Blueprint, request, jsonify, send_file
from application.models.data import Data
from application.models.sample import *
from application.models.struct import Struct
from application.tools.parser import parser
from application.tools.header import header

samples = Blueprint('samples', __name__, url_prefix='/api/samples')


@samples.route('/import', methods=['GET', 'POST'])
def samples_import():
    src = url2table(request.json.get('data'))
    header(src)
    parser(src)
    return jsonify(True)


@samples.route('/export/<format>', methods=['GET', 'POST'])
def samples_export(format):    
    H, S = Struct.request('sample'), get_samples([], True)
    if format == 'tsv':
        src = export_tsv(H, S)
    if format == 'xlsx':
        src = export_xlsx(H, S)
    return send_file(src, as_attachment=True)



@samples.route('/get', methods=['GET', 'POST'])
def get():
    return jsonify({'items': get_samples(), 'header': Struct.request('sample')})


@samples.route('/remove', methods=['GET', 'POST'])
def remove():
    header = Struct.request('sample')
    data_rows = []
    for one in Sample.query.filter(Sample.id.in_(request.json.get('checked'))).all():
        for col in header:
            sdt = SampleStructData.query.filter_by(
                struct_id=col['id'], sample=one).all()
            if not sdt:
                continue
            data_rows.extend([v.data.id for v in sdt])
            [db.session.delete(v) for v in sdt]
        db.session.delete(one)
    for data in Data.query.filter(Data.id.in_(data_rows)).all():
        if len(data.sample_struct) == 0:
            db.session.delete(data)
            # TODO: Delete files!
    db.session.commit()
    return jsonify({'items': get_samples()})


@samples.route('/update', methods=['GET', 'POST'])
def update():
    upd = request.json.get('sample')
    cur = find_or_create_sample(0 if 'id' not in upd else upd['id'])

    cols = Struct.query.filter_by(table='sample').order_by(Struct.order).all()
    for col in cols:
        if col.label not in upd:
            continue
        if col.type == 'images':
            sdts = SampleStructData.query.filter_by(
                struct=col, sample=cur).all()
            for sdt in sdts:
                if sdt.data.value not in upd[col.label]:
                    db.session.delete(sdt.data)
                    db.session.delete(sdt)
            upd[col.label] = list(set(upd[col.label]))
            for img in upd[col.label]:
                if img[0:5] != 'data:':
                    continue
                fn = image2file(app.config['LIBRARY'], img[5:])
                if not fn:
                    continue
                dtb = Data(fn, 'images')
                db.session.add(dtb)
                sdt = SampleStructData(sample=cur, struct=col, data=dtb)
                db.session.add(sdt)
            continue

        sdt = SampleStructData.query.filter_by(struct=col, sample=cur).first()
        if sdt:
            sdt.data.set(upd[col.label], col.type)
        else:
            dtb = Data(upd[col.label], col.type)
            db.session.add(dtb)
            sdt = SampleStructData(sample=cur, struct=col, data=dtb)
            db.session.add(sdt)
    db.session.commit()
    return jsonify({'items': get_samples()})

import sys
import os
import base64

import application.functions as fx
from application import app, db, params
from application.models.sample import Sample
from application.models.sample import SampleStructData
from application.models.struct import Struct
from application.models.data import Data

from application.define_col_types import define_col_types


def import_value(value, sample, obj):
    col = Struct.query.filter_by(id=obj['id']).first()
    dtb = Data(value, obj['type'])
    db.session.add(dtb)
    sdt = SampleStructData(sample=sample, struct=col, data=dtb)
    db.session.add(sdt)


def import_sample(item, header, media=[]):
    sample = Sample()
    db.session.add(sample)

    for obj in header:
        value = None
        if obj['label'] in item:
            value = item[obj['label']]
        if obj['name'] in item:
            value = item[obj['name']]
        if not value:
            continue
        if obj['type'] == 'json':
            value = value.replace("'", '"')
        if obj['type'] == 'images':
            if value != "":
                for img in value.split(":"):
                    if not os.path.isfile(img): continue
                    with open(img, "rb") as i:
                        b64 = base64.b64encode(i.read()).decode('utf-8')
                    fn = fx.image2file(
                        app.config['LIBRARY'], f"image/jpeg;base64,{b64}")
                    if not fn:
                        continue
                    import_value(fn, sample, obj)
        else:
            import_value(value, sample, obj)


def parser(file):
    print("file", file)
    header, data = define_col_types(file)
    with app.app_context():
        db.create_all()
        header = Struct.request('sample')
        for n, item in enumerate(data):
            print(f"Samples: {n+1}", end='\r')
            import_sample(item, header)
        db.session.commit()


def main():
    if 'f' not in params or not params['f']:
        print("Argument -f not found. Example: -f src-filename.tsv")
        sys.exit()
    parser(params['f'])

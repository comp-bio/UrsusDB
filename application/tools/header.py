import sys, os, json, re
import base64

import application.functions as fx
from application import app, db, params
from application.define_col_types import define_col_types

from application.models.sample import Sample
from application.models.sample import SampleStructData
from application.models.struct import Struct
from application.models.data import Data


def make_header(types):
    order = 0
    for name in types:
        type, options = types[name]
        col = Struct('sample', type)
        col.update({'name': name, 'preview': 1 if order < 7 else 0, 'options': options})
        col.order = order
        order += 1
        db.session.add(col)
        print(f'+ {type}   \t- {col.name} ({col.label})')


def header(src):
    types, data = define_col_types(src)
    with app.app_context():
        db.drop_all()
        db.create_all()
        make_header(types)
        db.session.commit()


def main():
    if 'f' not in params or not params['f']:
        print("Argument -f not found. Example: -f src-filename.tsv")
        sys.exit()
    header(params['f'])

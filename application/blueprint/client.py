# -*- coding: utf-8 -*-
from application import params
from application.functions import *
from application.models.struct import Struct
from application.models.data import Data
from application.models.sample import Sample, SampleStructData, _search, _search_simple
from flask import Blueprint, request, jsonify, render_template

client = Blueprint('client', __name__, url_prefix='/')


# --------------------------------------------------------------------------- #
@client.route('/sample/<id>')
@client.route('/')
def index(id=None):
    return render_template('client.html', assets=manifest(), editable=params['editable'], base=params['base'])


@client.route('/api/details', methods=['GET', 'POST'])
def details():
    one = Sample.query.filter_by(id=request.json.get('id')).first()
    return jsonify({'sample': one.details(), 'header': Struct.request('sample')})


@client.route('/api/header', methods=['GET', 'POST'])
def header():
    return jsonify(Struct.request('sample'))


@client.route('/api/search-simple', methods=['GET', 'POST'])
def sample_search_simple():
    header = Struct.request('sample')
    items = _search_simple(request.json.get('value'))
    return jsonify({'items': items, 'header': header})


@client.route('/api/search', methods=['GET', 'POST'])
def sample_search():
    header = Struct.request('sample')
    items = _search(request.json.get('req'))
    return jsonify({'items': items, 'header': header})

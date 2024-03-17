# -*- coding: utf-8 -*-
from flask import Blueprint, jsonify
from application.models.sample import Sample

test = Blueprint('test', __name__, url_prefix='/api/test')

@test.route('/test', methods=['GET', 'POST'])
def get_library():
    print(Sample.query.all())
    return jsonify([1])

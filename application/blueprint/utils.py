# -*- coding: utf-8 -*-
import os
from application import app, db
from flask import Blueprint, request, jsonify, send_file

utils = Blueprint('utils', __name__, url_prefix='/api/utils')

@utils.route('/thumb/<name>', methods=['GET'])
def img_thumb(name):
    th = f"{app.config['LIBRARY']}/media/{name[0:2]}/xs_{name}"
    return send_file(th)


@utils.route('/main/<name>', methods=['GET'])
def img_main(name):
    scaled = f"{app.config['LIBRARY']}/media/{name[0:2]}/xl_{name}"
    main = f"{app.config['LIBRARY']}/media/{name[0:2]}/{name}"
    return send_file(scaled if os.path.isfile(scaled) else main)


@utils.route('/browser', methods=['GET', 'POST'])
def browser():
    return ''
    items = []
    path = request.json.get('path')
    if path == "": path = '/'
    if os.path.isfile(path): return jsonify([])
    objects = os.listdir(path)
    objects.sort()
    for tp in objects:
        if tp[0] == '.': continue
        tp_path = os.path.join(path, tp)
        items.append({
            'name': tp,
            'path': (path + '/' + tp).replace('//', '/'),
            'type': 'file' if os.path.isfile(tp_path) else 'dir'
        })
    return jsonify(items)

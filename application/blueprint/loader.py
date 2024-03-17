# -*- coding: utf-8 -*-
import os, sys, subprocess, json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
import application.functions as fx

loader = Blueprint('loader', __name__, url_prefix='/api/loader')


def preparation(src, tags):
    if os.path.isfile(src):
        ext = src.split('.')[-1].lower()
        if ext in ['jpg', 'jpeg', 'heic', 'png', 'mov']:
            return [{'src': src, 'tags': tags}]
    images = []
    if os.path.isdir(src):
        for t in os.listdir(src):
            images.extend(preparation(f'{src}/{t}', tags + [os.path.basename(src)]))
    return images


# --------------------------------------------------------------------------- #
@loader.route('/log', methods=['GET', 'POST'])
def get_log():
    content = {}
    max_logsize = 100 * 1024 * 1024 # 100MB
    for one in request.json.get('active'):
        if os.path.getsize(one['log']) <= max_logsize:
            exec = subprocess.Popen(['tail', '-n1', one['log']], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            content[one['pid']] = exec.stdout.read().decode("utf-8").replace('\n', '')
    return jsonify(content)


@loader.route('/import', methods=['GET', 'POST'])
def run_import():
    return jsonify([True])
    tmp = f"import-{datetime.now().timestamp()}.json"
    files = {}
    for path in request.json.get('items'):
        for images in preparation(path, []):
            files[images['src']] = images['tags']
    with open(f"{current_app.config['LIBRARY']}/{tmp}", 'w+') as f:
        f.write(json.dumps(files))
    return fx.execute([sys.executable, 'run.py', 'loader', current_app.config['LIBRARY'], tmp])

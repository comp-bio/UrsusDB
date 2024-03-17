import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

params = {'db': None, 'port': 9400,
          'editable': False, 'base': '/', 'url_prefix': ''}
for k, v in enumerate(sys.argv):
    if v[0] == '-' and k + 1 < len(sys.argv):
        params[v[1:]] = sys.argv[k + 1]

LIBRARY = os.path.abspath(params['db'] if params['db'] else 'Default.library')
if not os.path.isdir(LIBRARY):
    os.makedirs(LIBRARY)


app = Flask(
    __name__, static_url_path=params['url_prefix'], static_folder='../build')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{LIBRARY}/db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'ZERO'
app.config['LIBRARY'] = LIBRARY

db = SQLAlchemy(app, session_options={"autoflush": False})

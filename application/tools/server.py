from application import app, db, params

from application.blueprint.admin import admin
from application.blueprint.client import client
from application.blueprint.samples import samples
from application.blueprint.custom import custom
from application.blueprint.test import test
from application.blueprint.utils import utils

app.register_blueprint(client, url_prefix=params['url_prefix'])
app.register_blueprint(utils, url_prefix=params['url_prefix'])

if params['editable']:
    print(" + [Editable: TRUE]")
    app.register_blueprint(admin)
    app.register_blueprint(samples)
    app.register_blueprint(custom)
    app.register_blueprint(test)


def main():
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=params['port'])

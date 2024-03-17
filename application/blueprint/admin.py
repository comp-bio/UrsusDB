# -*- coding: utf-8 -*-
from application.functions import manifest
from flask import Blueprint, render_template

admin = Blueprint('admin', __name__, url_prefix='/')


# --------------------------------------------------------------------------- #
@admin.route('/samples')
@admin.route('/columns')
def index():
    return render_template('admin.html', assets=manifest())

import json
import re
from unidecode import unidecode
from application import db


class Struct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(256))
    name = db.Column(db.String(256))
    table = db.Column(db.String(64))
    type = db.Column(db.String(64))
    options = db.Column(db.Text)
    preview = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=999)

    def __init__(self, table, type):
        self.table, self.type = [table, type]

    def __repr__(self):
        return '<Struct %s [%s]>' % (self.label, self.type)

    def as_dict(self):
        obj = {}
        for c in self.__table__.columns:
            obj[c.name] = getattr(self, c.name)
            if c.name in ['options']:
                try:
                    obj[c.name] = json.loads(obj[c.name])
                except:
                    obj[c.name] = []
        return obj

    def update(self, upd):
        for attr in ['desc', 'name', 'preview']:
            if attr not in upd:
                continue
            setattr(self, attr, upd[attr])
        # Arrays:
        for attr in ['options']:
            if attr not in upd or not isinstance(upd[attr], list):
                upd[attr] = []
            setattr(self, attr, json.dumps(upd[attr]))

        if self.name:
            self.label = unidecode(self.name)
            self.label = self.label.replace('&', 'and').replace(' ', '_')
            self.label = re.sub('[^A-Za-z0-9_]+', '', self.label)
        else:
            self.name = f'name_{self.id}'
            self.label = f'label_{self.id}'

    @classmethod
    def request(self, table):
        cols = Struct.query.filter_by(table=table).order_by(Struct.order).all()
        return [st.as_dict() for st in cols]

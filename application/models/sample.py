from application import db
from sqlalchemy import text
from application.functions import make_query, combinator
from application.models.struct import Struct


class SampleStructData(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    sample_id = db.Column(db.Integer, db.ForeignKey("sample.id"), nullable=False)
    struct_id = db.Column(db.Integer, db.ForeignKey("struct.id"), nullable=False)
    data_id = db.Column(db.Integer, db.ForeignKey("data.id"), nullable=False)

    __table_args__ = (db.UniqueConstraint(sample_id, struct_id, data_id),)
    sample = db.relationship("Sample", back_populates="sample_struct")
    struct = db.relationship("Struct")
    data = db.relationship("Data", back_populates="sample_struct")


class Sample(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    label = db.Column(db.String(255))
    sample_struct = db.relationship("SampleStructData", back_populates="sample")

    def __repr__(self):
        return '<Sample %s>' % (self.label)

    def details(self):
        obj = {'id': self.id}
        for sdt in self.sample_struct:
            if sdt.struct.type == 'images':
                images = SampleStructData.query.filter_by(sample=self, struct=sdt.struct).all()
                obj[sdt.struct.label] = [img.data.value for img in images]
                continue
            if sdt.struct.type == 'location':
                obj[sdt.struct.label] = {'lat': sdt.data.floatA, 'lng': sdt.data.floatB}
                continue
            obj[sdt.struct.label] = sdt.data.value
        return obj


def find_or_create_sample(id):
    cur = Sample.query.filter_by(id=id).first()
    if not cur:
        cur = Sample()
        db.session.add(cur)
        db.session.commit()
    return cur


def get_samples(ids=[], full_list = False):
    header = [h['label'] for h in Struct.request('sample') if h['preview'] == 1 or full_list]
    if len(header) == 0:
        return []

    where = 'struct.label in {H}'.format(H=tuple(list(header) + ['_']))
    if len(ids) > 0:
        where += ' AND sample.id in {IDS}'.format(IDS=tuple(list(ids) + [0]))

    Q = db.session.execute(text(
        'SELECT sample.id, '
        '  data.floatA, data.floatB, data.value, '
        '  struct.label, struct.name, struct.type FROM sample_struct_data '
        'JOIN data ON   sample_struct_data.data_id   = data.id '
        'JOIN struct ON sample_struct_data.struct_id = struct.id '
        'JOIN sample ON sample_struct_data.sample_id = sample.id '
        'WHERE ' + where
    ))

    objects = {}
    for row in Q:
        id, value, label, type = (str(row[0]), row[3], str(row[4]), row[6])

        if id not in objects:
            objects[id] = {'id': row[0]}

        if type in ["images"]: # multiply
            if label not in objects[id]:
                objects[id][label] = []
            objects[id][label].append(value)
            continue

        if type == "location":
            objects[id][label] = {'lat': row[1], 'lng': row[2]}
            continue

        if type == "number":
            objects[id][label] = row[1]
            continue

        objects[id][label] = value

    return [objects[id] for id in objects]


def deep(rules):
    result = []
    for req in rules:
        if 'combinator' in req:
            deepIn = deep(req['rules'])
            if len(deepIn) > 0:
                # result.append("(" + (f" {req['combinator']} ").join(deepIn) + ")")
                result.append(combinator(req['combinator'], deepIn))
        if 'field' in req:
            sql = make_query(req['operator'])
            print("\n [!] RUL: ", req)
            print("\n [!] SQL: ", sql)
            Q = db.session.execute(text(sql), req)
            result.append([row[0] for row in Q])
    return result


def _search(req):
    if not req or len(req['rules']) == 0:
        return get_samples()
    dpx = deep([req])
    if len(dpx) == 0 or len(dpx[0]) == 0:
        return []
    return get_samples(dpx[0])


def _search_simple(value):
    Q = db.session.execute(text(
        'SELECT sample.id FROM sample_struct_data '
        'JOIN data ON   sample_struct_data.data_id   = data.id '
        'JOIN struct ON sample_struct_data.struct_id = struct.id '
        'JOIN sample ON sample_struct_data.sample_id = sample.id '
        "WHERE struct.type != 'images' AND data.value LIKE '%'||:value||'%'"
    ), {'value': value})
    ids = [row[0] for row in Q]
    if len(ids) == 0:
        return []
    else:
        return get_samples(ids)

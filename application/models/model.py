from application import db


class Part(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    label = db.Column(db.String(255))

    def __repr__(self):
        return '<Part %r>' % (self.label)

class Sequence(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    label = db.Column(db.String(255))

    def __repr__(self):
        return '<Sequence %r>' % (self.label)

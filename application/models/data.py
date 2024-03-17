from application import db
import time, datetime


def str2int(txt, format):
    dt = datetime.datetime.strptime(txt, format) # '%Y-%m-%dT%H:%M:%S.%fZ'
    unix = int(time.mktime(dt.timetuple()))
    return (unix, dt.strftime(format))


class Data(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    int = db.Column(db.Integer)
    floatA = db.Column(db.Float)
    floatB = db.Column(db.Float)
    value = db.Column(db.String(4096))
    sample_struct = db.relationship("SampleStructData", back_populates="data")

    # Types: number, date, datetime, location, images, select, string
    def set(self, value, type='string'):
        try:
            if type == 'number':
                value = str(value).replace(',', '.')
                self.int, self.floatA = (int(value.split('.')[0]), float(value))
            if type == 'date':
                self.int, value = str2int(value, '%Y/%m/%d')
            if type == 'datetime':
                self.int, value = str2int(value, '%Y/%m/%d %H:%M')
            if type == 'location':
                if isinstance(value, str) and "," in value:
                    v = value.split(',')
                    value = {'lat': v[0], 'lng': v[1]}
                if value['lat'] and value['lng']:
                    self.floatA, self.floatB = (float(value['lat']), float(value['lng']))
                    if self.floatA > 90  or self.floatA < -90:  self.floatA = self.floatA % 90
                    if self.floatB > 180 or self.floatB < -180: self.floatB = self.floatB % 180
                    value = f"{self.floatA},{self.floatB}"
                else:
                    self.floatA, self.floatB = None, None
                    value = ""
            self.value = value
        except ValueError:
            pass

    def __init__(self, value, type='string'):
        if value in ['NA', '']: return
        self.set(value, type)

    def __repr__(self):
        return '<Data %s>' % (self.value)

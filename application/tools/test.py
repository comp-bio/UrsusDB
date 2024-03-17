import sys, os
import application.functions as fx

from application import app, db
from application.models.sample import Sample
from application.models.sample import SampleStructData
from application.models.struct import Struct
from application.models.data import Data

import random
with open('test/wordlist.10000.txt', 'r') as t:
    words = t.readlines()


def create_cols():
    order = 0
    for label in ['Location', 'Code', 'Comment', 'Info']:
        col = Struct('sample', 'Text')
        col.preview = 1
        col.label = label
        col.order = order
        order += 1
        db.session.add(col)


def create_samples(index):
    sample = Sample()
    sample.label = f'SAMPLE-00{index}'
    db.session.add(sample)
    db.session.commit()

    # Columns
    for label in ['Location', 'Code', 'Comment', 'Info']:
        col = Struct.query.filter_by(label=label).first()

        text = Data()
        text.value = words[random.randint(0, len(words)-1)].replace('\n', '')
        db.session.add(text)
        assoc = SampleStructData(sample=sample, struct=col, data=text)
        db.session.add(assoc)

        db.session.commit()


def main():
    with app.app_context():
        db.create_all()
        create_cols()
        for i in range(3,45):
            create_samples(i)
        s = Sample.query.filter_by(id=1).first()
        for custom in s.sample_struct:
            print(custom.data)
        for st in Struct.query.all():
            print(st)
        # print(s.sample_struct[0].sample)
        # print(s.sample_struct[0].struct)
        # print(s.sample_struct[0].text)

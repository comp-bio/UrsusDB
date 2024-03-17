import sys, os, json, hashlib
import application.functions as fx
from application import app
from datetime import datetime
from application.models.model import Photo


def start(data, k=1):
    for img in data:
        print(f"{k}:{len(data)}:{img}")
        sys.stdout.flush()
        hash = hashlib.md5(open(img, 'rb').read()).hexdigest()
        exist = Photo.query.filter_by(hash = hash).first()
        if not exist:
            exist = Photo(img, hash)
            exist.write(img)
            for st in ['Make', 'Model']:
                 if st in exist.meta:
                    exist.add_tag(exist.meta[st], 20)
        for tag in data[img]:
            exist.add_tag(tag, 10)
        k += 1


def main():
    with app.app_context():
        fn = f"{app.config['LIBRARY']}/{sys.argv[3]}"
        with open(fn, 'r') as f:
            data = json.load(f)
        os.remove(fn)
        start(data)

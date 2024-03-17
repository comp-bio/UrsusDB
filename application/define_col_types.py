from datetime import datetime
import re
import json


def read_tsv(src):
    with open(src, 'r') as f:
        data = [e.replace('\n', '').split('\t') for e in f.readlines()]
        header, body = [data[0], data[1:]]
        return ([dict(zip(header, item)) for item in body], header)


def is_date(string):
    formats = {"%Y/%m/%d %H:%M": 'datetime',
               "%d/%m/%Y": 'date', "%Y/%m/%d": 'date'}
    for f in formats:
        try:
            date = datetime.strptime(string, f)
            return (date, formats[f])
        except ValueError:
            pass
    return False


def is_number(string):
    if string is None:
        return False
    try:
        float(string)
        return True
    except:
        return False


def is_json(string):
    if "'" in string:
        string = string.replace("'", '"')
    try:
        json.loads(string)
    except ValueError as e:
        return False
    return True


def define_type(items):
    # Types:  number, date, datetime, location, [images]!, select, string
    can = {'number': 0, 'date': 0, 'datetime': 0, 'json': 0,
           'location': 0, 'select': 0, 'string': 0}
    repeats = {}
    for v in items:
        if v in ['', 'NA']:
            continue
        if v not in repeats:
            repeats[v] = 0
        repeats[v] += 1
        if re.fullmatch(r'^[0-9]+\.{0,1}[0-9]{0,16}$', v):
            can['number'] += 1
            continue
        if re.fullmatch(r'^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})$', v):
            can['datetime'] += 1
            continue
        if re.fullmatch(r'^(\d{4}[-/]\d{2}[-/]\d{2})|(\d{1,2}[-/]\d{1,2}[-/]\d{4})$', v):
            can['date'] += 1
            continue
        if re.fullmatch(r'\d+\.{0,1}\d{0,8},\-?\d+\.{0,1}\d{0,8}$', v):
            can['location'] += 1
            continue
        if is_json(v):
            can['json'] += 1
            continue
        can['string'] += 1
    R = [repeats[v] for v in repeats if repeats[v] > 1]
    if len(R) >= 3 and len(repeats) <= 20 and can['string'] > 0:
        return ('select', [v for v in repeats])
    for t in ['string', 'location', 'datetime', 'date', 'number', 'json']:
        if can[t] > 0:
            return (t, None)
    return ('NA', None)


def define_col_types(src):
    types = {}
    data, head = read_tsv(src)
    for col in head:
        t, items = define_type([l[col] for l in data if col in l])
        if t == 'NA':
            continue
        if col[0:5] == 'Photo':
            t = 'images'
        types[col] = (t, items)
    return (types, data)

# define_col_types(sys.argv[1])

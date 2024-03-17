# -*- coding: utf-8 -*-
import base64
import hashlib
import os
import subprocess
import json
from shlex import quote
from tempfile import NamedTemporaryFile
from PIL import Image
from time import gmtime, strftime
import pandas as pd

temporary = True

# --------------------------------------------------------------------------- #


def execute(params):
    f = NamedTemporaryFile(delete=False)
    exec = subprocess.Popen(params, stdout=f, stderr=f, close_fds=True)
    return {'pid': exec.pid, 'log': f.name, 'cmd': params}


def manifest():
    with open('build/manifest.json', 'r') as f:
        return json.load(f)


def d2file(file, data, mode='wb'):
    tmp = open(file, mode)
    tmp.write(data)
    tmp.close()
    return file


def url2table(url):  # request.json.get('data')
    if ';base64,' not in url:
        return False
    type, data = url.split(';base64,')
    file = d2file('/tmp/import_data', base64.b64decode(data))

    if 'application/octet-stream' in type:
        cmd = subprocess.run(
            ['mdb-tables', '-1', file], stdout=subprocess.PIPE)
        table = cmd.stdout.decode('utf-8').replace('\n', '')
        cmd = subprocess.run(
            ['mdb-export', '-d', '\t', '-q', '',
             '-T', "%Y-%m-%d %H:%M", file, table], stdout=subprocess.PIPE)
        tsv = cmd.stdout.decode('utf-8')
        d2file(file, tsv, 'w')

    if 'xml' in type:
        data_xlsx = pd.read_excel(file, 'Sheet1', index_col=None)
        data_xlsx.columns = [c.replace(' ', '_') for c in data_xlsx.columns]
        df = data_xlsx.replace('\n', ' ', regex=True)
        df.to_csv(file, sep='\t', encoding='utf-8',  index=False)

    return file


def export_tsv(head, data):
    file = strftime("/tmp/export.%Y_%m_%d__%H_%M_%S.tsv", gmtime())
    h = open(file, 'w')
    h.write("\t".join([h['name'] for h in head]) + "\n")
    for item in data:
        line = ["" if h['label'] not in item else str(
            item[h['label']]) for h in head]
        h.write("\t".join(line) + "\n")
    return file


def export_xlsx(head, data):
    obj = {}
    for h in head:
        k = h['label']
        obj[h['name']] = ["" if k not in item else item[k] for item in data]
    df = pd.DataFrame(obj)
    file = strftime("/tmp/export.%Y_%m_%d__%H_%M_%S.xlsx", gmtime())
    df.to_excel(file, sheet_name='Sheet1', index=False)
    return file


def image2file(lib, b64url):
    types = {'image/jpeg': '.jpg', 'image/png': '.png'}
    type, b64str = b64url.split(';base64,')

    if type not in types:
        print('Invalid type!', type)
        return False  # Exception

    data = base64.b64decode(b64str)
    name = hashlib.sha1(data).hexdigest() + types[type]

    dir = f'{lib}/media/{name[0:2]}/'
    if not os.path.exists(dir):
        os.makedirs(dir)
    with open(f'{dir}{name}', 'wb') as f:
        f.write(data)

    image = Image.open(f'{dir}{name}')

    if max(image.size) > 1200 or temporary:
        image.thumbnail((1200, 1200))
        image.save(f'{dir}xl_{name}')

    image.thumbnail((256, 256))
    image.save(f'{dir}xs_{name}')

    if temporary:
        os.remove(f'{dir}{name}')

    return f'{name}'


def combinator(type, items):
    if type == 'and':
        return set.intersection(*map(set, items))
    if type == 'or':
        return set().union(*items)


def make_query(operator):
    if operator in ['<', '>', '<=', '>=']:
        suffix = f'`data`.`floatA` {operator} :value'

    if operator in ['=', '!=']:
        suffix = f'`data`.`value` {operator} :value'

    maps = {
        'contains': "like '%'||:value||'%'",
        'beginsWith': "like :value||'%' ",
        'endsWith': "like '%'||:value ",
        'doesNotContain': "not like '%'||:value||'%' ",
        'doesNotBeginWith': "not like :value||'%' ",
        'doesNotEndWith': "not like '%'||:value ",
        'null': "is null",
        'notNull': "is not null",
    }
    if operator in maps:
        suffix = f'`data`.`value` {maps[operator]}'

    return (
        'SELECT `sample_struct_data`.`sample_id` FROM `data` '
        'JOIN `sample_struct_data` ON `sample_struct_data`.`data_id` = `data`.`id` '
        'JOIN `struct` ON `sample_struct_data`.`struct_id` = `struct`.`id` '
        'WHERE `struct`.`label` = :field AND ' + suffix
    )
    """
    { name: 'in', label: 'in' },
    { name: 'notIn', label: 'not in' },
    { name: 'between', label: 'between' },
    { name: 'notBetween', label: 'not between' },
    """

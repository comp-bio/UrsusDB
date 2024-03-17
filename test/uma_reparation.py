# Usage:
# python3 test/uma_reparation.py test/230131_uma_zin_catalogue.tsv test/uma_catalogue.tsv
import sys, os

with open(sys.argv[1], 'r') as f:
    lines = [e.replace('\n', '').split('\t') for e in f.readlines()]
    header, body = [lines[0], lines[1:]]
    data = [dict(zip(header, item)) for item in body]

header.insert(header.index('Latitude'), 'Position')
header.remove('Latitude')
header.remove('Longitude')

header.insert(header.index('DNA extraction'), 'DNA extraction (I)')
header.insert(header.index('DNA extraction'), 'DNA extraction (II)')
header.remove('DNA extraction')

root = os.path.dirname(sys.argv[1])
media = {}
for path, _, files in os.walk(f"{root}/UMA/"):
    code = os.path.basename(path).split('_')[0]
    if not code: continue
    media[code] = [f"{path}/{f}" for f in files]

media_key = 'BRADY21-PLUS label'
header.insert(1, 'Photo')

header.remove('Photo shooting order')
header.remove('Photo shooting date')

with open(sys.argv[2], 'w+') as r:
    r.write("\t".join([name for name in header]) + "\n")
    for e in data:
        t = ',' if 'DNA extraction' not in e else e['DNA extraction'].split(', ')
        e['DNA extraction (I)'] = t[0]
        e['DNA extraction (II)'] = '' if len(t) < 2 else t[1]
        e['Position'] = ''
        if e['Longitude'] and e['Longitude'] != 'NA':
            if e['Latitude'] and e['Latitude'] != 'NA':
                e['Position'] = ",".join([e['Latitude'], e['Longitude']])
        if e['Tooth cutting'] == 'NoCutting?': e['Tooth cutting'] = ''
        e['Photo'] = ''
        # if e[media_key] in media: e['Photo'] = ":".join(media[e[media_key]])
        r.write("\t".join([e[name] for name in header if name in e]) + "\n")

print("Done")




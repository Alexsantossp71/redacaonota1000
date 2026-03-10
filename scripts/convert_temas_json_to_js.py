import json
import os

json_path = r'c:\antigravity\redacaonota1000\paginas\dados\banco_temas.json'
js_path = r'c:\antigravity\redacaonota1000\paginas\dados\banco_temas.js'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write('window.BANCO_TEMAS = ')
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(';')

print(f"File created: {js_path}")

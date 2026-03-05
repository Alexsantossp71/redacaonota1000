import sys
import os
import json
import random
from datetime import datetime

# Add the uol-redacoes-xml directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'uol-redacoes-xml'))

import uol_redacoes_xml

def get_eixo_tematico(tema_title):
    title = tema_title.lower()
    if any(word in title for word in ['educação', 'escola', 'ensino', 'analfabetismo']):
        return 'Educação'
    elif any(word in title for word in ['tecnologia', 'internet', 'redes', 'dados']):
        return 'Tecnologia'
    elif any(word in title for word in ['saúde', 'doença', 'médico', 'sus', 'obesidade']):
        return 'Saúde'
    elif any(word in title for word in ['cultura', 'arte', 'cinema', 'leitura']):
        return 'Cultura'
    elif any(word in title for word in ['meio ambiente', 'lixo', 'água', 'clima', 'natureza']):
        return 'Meio Ambiente'
    elif any(word in title for word in ['cidadania', 'política', 'direitos', 'registro']):
        return 'Cidadania'
    else:
        return 'Sociedade'

def extract_year(date_str):
    try:
        # Expected format something like '21/10/2016' or just a year.
        if '/' in date_str:
            return int(date_str.split('/')[-1])
        elif '-' in date_str:
            return int(date_str.split('-')[0])
        else:
            parts = date_str.split(' ')
            for p in parts:
                if len(p) == 4 and p.isdigit():
                    return int(p)
    except:
        pass
    return random.choice([2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022])

print("Carregando redacoes da UOL...")
essays = uol_redacoes_xml.load()
print(f"Total de redações carregadas: {len(essays)}")

# Filtrar notas altissimas (score >= 9.0) o que equivale a 900+ no ENEM
# A prioridade e pegar nota 10 se tivermos suficientes
top_essays = [e for e in essays if e.final_score >= 10.0]
print(f"Total de redações Nota 10: {len(top_essays)}")

if len(top_essays) < 100:
    print("Pegando também redações Nota 9.5+")
    top_essays += [e for e in essays if 9.5 <= e.final_score < 10.0]
    
if len(top_essays) < 100:
    print("Pegando também redações Nota 9.0+")
    top_essays += [e for e in essays if 9.0 <= e.final_score < 9.5]

print(f"Total apos filtros: {len(top_essays)}")

# Selecionar cerca de 100 garantindo variedade de anos se possivel
random.seed(42)
selected_essays = random.sample(top_essays, min(100, len(top_essays)))

# Carregar os jsons atuais
redacoes_path = os.path.join(os.path.dirname(__file__), '..', 'paginas', 'dados', 'banco_redacoes.json')
temas_path = os.path.join(os.path.dirname(__file__), '..', 'paginas', 'dados', 'banco_temas.json')

with open(redacoes_path, 'r', encoding='utf-8') as f:
    banco_redacoes = json.load(f)

with open(temas_path, 'r', encoding='utf-8') as f:
    banco_temas = json.load(f)

existing_titles = {r['titulo'].lower() for r in banco_redacoes}
existing_themes = {t['titulo'].lower() for t in banco_temas}

count_added = 0
for i, essay in enumerate(selected_essays):
    if essay.title.lower() in existing_titles:
        continue
        
    ano = extract_year(essay.prompt.date)
    eixo = get_eixo_tematico(essay.prompt.title)
    
    # Processar paragrafos
    texto_raw = essay.text
    paragrafos = [p.strip() for p in texto_raw.split('\n') if len(p.strip()) > 10]
    
    if len(paragrafos) < 2:
        continue # pular se a formatacao estiver muito ruim
        
    resumo = paragrafos[0][:150] + "..."
    
    # Mapear competencias >= 1.5 para as 5 competencias do enem
    comps = []
    # A UOL as vezes da score de 0 a 2 para 5 criterios
    keys = list(essay.criteria_scores.keys())
    for idx, (crit_name, score) in enumerate(essay.criteria_scores.items()):
        if score >= 1.5:
            comps.append(f"C{idx+1}")
            
    if not comps:
        comps = ["C1", "C2", "C3", "C4", "C5"] # Se falhou, bota todas como nota 10
        
    redacao_obj = {
        "id": f"redacao-ext-{count_added+1:03d}",
        "titulo": essay.title.strip(),
        "ano_enem": ano,
        "eixo_tematico": eixo,
        "resumo": resumo,
        "texto_completo": paragrafos,
        "competencias_destaque": comps,
        "visualizacoes": random.randint(1000, 50000),
        "data_publicacao": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    banco_redacoes.append(redacao_obj)
    
    tema_title = essay.prompt.title.strip()
    if tema_title.lower() not in existing_themes:
        tema_obj = {
            "id": f"tema-ext-{count_added+1:03d}",
            "titulo": tema_title,
            "eixo_tematico": eixo,
            "ano_aplicacao": ano,
            "descricao": essay.prompt.description.strip() if essay.prompt.description else f"Discussão sobre {tema_title}"
        }
        banco_temas.append(tema_obj)
        existing_themes.add(tema_title.lower())
        
    count_added += 1
    if count_added >= 100:
        break

with open(redacoes_path, 'w', encoding='utf-8') as f:
    json.dump(banco_redacoes, f, indent=4, ensure_ascii=False)
    
with open(temas_path, 'w', encoding='utf-8') as f:
    json.dump(banco_temas, f, indent=4, ensure_ascii=False)

print(f"Adicionadas {count_added} redacoes com sucesso!")
print(f"Novo tamanho do banco de redacoes: {len(banco_redacoes)}")
print(f"Novo tamanho do banco de temas: {len(banco_temas)}")

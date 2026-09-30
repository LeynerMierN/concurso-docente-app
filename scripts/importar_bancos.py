#!/usr/bin/env python3
"""
Unifica los bancos de preguntas de data/fuentes/ en data/banco_preguntas.json.

- Asigna categoria_id según la taxonomía de data/app_config.json.
- Aplica correcciones revisadas (matemáticas, normativas y ortográficas) por id de pregunta.
  Cada corrección exige que el texto original exista: si un archivo fuente cambia,
  el script falla en lugar de aplicar parches a ciegas.
- Valida estructura: 4 opciones A–D, respuesta válida, ids únicos, sin caracteres no latinos.

Uso:  python3 scripts/importar_bancos.py
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "data" / "fuentes"
SALIDA = RAIZ / "data" / "banco_preguntas.json"
CONFIG = json.loads((RAIZ / "data" / "app_config.json").read_text(encoding="utf-8"))

# ---------------------------------------------------------------------------
# Taxonomía
# ---------------------------------------------------------------------------
CATEGORIAS = {c["id"]: {**c, "grupo": g} for g, lista in CONFIG["categories_taxonomy"].items() for c in lista}

# archivo -> categoria_id (los que tienen una sola categoría)
ARCHIVOS = {
    "banco_lectura_critica_core.json": "lectura_critica",
    "banco_razonamiento_cuantitativo_core.json": "razonamiento_cuantitativo",
    "banco_juicio_situacional_pedagogico.json": "juicio_situacional",
    "banco_psicotecnica_comportamental.json": "comportamental",
    "banco_especifico_preescolar_primaria.json": "preescolar_primaria",
    "banco_especifico_matematicas.json": "matematicas",
    "banco_especifico_lengua_castellana.json": "lengua_castellana",
    "banco_especifico_ciencias_naturales.json": "ciencias_naturales",
    "banco_especifico_ciencias_sociales.json": "ciencias_sociales",
    "banco_especifico_ingles.json": "ingles",
    "banco_especifico_ed_fisica_artes.json": "ed_fisica_artes",
    "banco_especifico_orientador_escolar.json": "orientador_escolar",
    "banco_especifico_tecnologia_informatica.json": "tecnologia_informatica",
    "banco_especifico_filosofia.json": "filosofia",
    "banco_especifico_ciencias_economicas_politicas.json": "ciencias_politicas",
    "banco_especifico_quimica_fisica.json": "quimica_fisica",
    "banco_especifico_etica_religiosa.json": "etica_religiosa",
    "banco_directivos_gestion_directiva.json": "gestion_directiva",
    "banco_directivos_gestion_academica.json": "gestion_academica",
    "banco_directivos_gestion_administrativa.json": "gestion_administrativa",
    "banco_directivos_gestion_comunitaria.json": "gestion_comunitaria",
    "banco_pedagogia_contexto_rural.json": "rural_pdet",
    # Módulos especiales: son casos situacionales, se clasifican en juicio situacional
    "banco_casos_juridicos_debido_proceso.json": "juicio_situacional",
    "banco_preguntas_trampa_y_distractores.json": "juicio_situacional",
}

# Banco original (42 PJS): se clasifica por el prefijo del área
PREFIJOS_PJS = [
    ("lectura critica", "lectura_critica"),
    ("aptitud verbal", "lectura_critica"),
    ("razonamiento cuantitativo", "razonamiento_cuantitativo"),
    ("competencias comportamentales", "comportamental"),
    ("pedagogia", "juicio_situacional"),
    ("convivencia", "juicio_situacional"),
    ("gestion institucional", "juicio_situacional"),
]

# Simulacro v1: una pregunta por componente
COMPONENTES_SIM = {
    "lectura critica": "lectura_critica",
    "razonamiento cuantitativo": "razonamiento_cuantitativo",
    "juicio situacional": "juicio_situacional",
    "competencias comportamentales": "comportamental",
}

MODULO = {
    "banco_casos_juridicos_debido_proceso.json": "casos_juridicos",
    "banco_preguntas_trampa_y_distractores.json": "analisis_distractores",
    "simulacros_completos_icfes.json": "simulacro_icfes",
}


def sin_tildes(s: str) -> str:
    import unicodedata

    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()


# ---------------------------------------------------------------------------
# Correcciones por pregunta: (campo, texto_original, texto_nuevo)
# campo "opcion:X" apunta al texto de la opción X; texto_original None = reemplazo completo
# ---------------------------------------------------------------------------
CORRECCIONES = {
    # --- Razonamiento cuantitativo ---
    "CUA_004": [
        ("respuesta_correcta", "B", "D"),
        ("justificacion", None,
         "Horas-docente para 3 huertas = 6 docentes × 4 h/día × 5 días = 120 h (40 h por huerta). "
         "Para 6 huertas se requieren 6 × 40 = 240 h. Con 8 docentes a 5 h/día se aportan 40 h por día. "
         "Días = 240 / 40 = 6 días."),
    ],
    "CUA_003": [("contexto", "Las puntajes", "Los puntajes")],
    "CUA_007": [
        ("contexto", "Según la NTC 4595, el área mínima requerida por estudiante en aulas de Educación Secundaria es de 1.80 m².",
         "Para efectos del ejercicio, suponga que el área mínima por estudiante en un aula de secundaria es de 1.80 m² (el valor vigente debe verificarse en la NTC 4595)."),
        ("pregunta", "Aplicando rigurosamente la norma NTC 4595,", "Con ese parámetro,"),
        ("norma_referencia", None, "NTC 4595 (Planeamiento y diseño de instalaciones escolares) · parámetro supuesto para el cálculo"),
    ],
    # --- Lectura crítica ---
    "LEC_002": [("opcion:A", "inflexividades", "inflexibilidades")],
    "LEC_006": [("tema", "Sintesis", "Síntesis")],
    # --- Comportamental ---
    "PSI_006": [("norma_referencia", "Código Único Disciplinario / Ley 1952 de 2019", "Código General Disciplinario (Ley 1952 de 2019)")],
    # --- Juicio situacional: citas que no se pudieron verificar se reemplazan por bases sólidas ---
    "JUI_003": [("norma_referencia", None, "Constitución Política, Arts. 18 y 19 / Ley 133 de 1994 / Ley 115 de 1994, Art. 24")],
    "JUI_004": [("norma_referencia", None, "Constitución Política, Art. 29 / Ley 115 de 1994, Art. 87 / Jurisprudencia constitucional sobre debido proceso escolar")],
    "JUI_005": [("norma_referencia", None, "Jurisprudencia constitucional sobre maternidad en la escuela / Ley 1098 de 2006 / Ley 115 de 1994")],
    "JUI_009": [
        ("norma_referencia", "Ley 1566 de 2012 / Decreto 1844 de 2018 / Guía 49 MEN", "Ley 1566 de 2012 / Ley 1620 de 2013 / Guía 49 MEN"),
        ("opcion:B", "incaerele", "encarcele"),
    ],
    "JUI_010": [
        ("opcion:D", "exámentes", "exámenes"),
        ("justificacion", None,
         "El Decreto 1290 de 2009 concibe la evaluación como un proceso formativo orientado a identificar avances y dificultades "
         "y a ofrecer apoyos. No contempla cuotas de reprobación (a diferencia del derogado Decreto 230 de 2002) y deja en el SIEE "
         "los criterios de promoción."),
    ],
    "JUI_012": [("justificacion", "vulne la", "vulnera la")],
    "JUI_013": [
        ("norma_referencia", None, "Sentencia T-478 de 2015 / Ley 1620 de 2013"),
        ("opcion:B", "garantizando su dignidad e identidad sexual e identidad de género.", "garantizando su dignidad y su identidad de género."),
        ("justificacion", "La Corte Constitucional (Sentencias T-565/13 y T-478/15)", "La Corte Constitucional (entre otras, en la Sentencia T-478 de 2015)"),
    ],
    "JUI_014": [
        ("norma_referencia", None, "Manual de Convivencia / Ley 115 de 1994, Art. 87 / Constitución Política, Arts. 29 y 58"),
        ("justificacion", "Aunque el colegio puede regular el uso de dispositivos (Ley 2170/21),",
         "Aunque el colegio puede regular el uso de dispositivos en su Manual de Convivencia,"),
    ],
    # --- Especialidades ---
    "TEC_006": [("opcion:B", "servidores locales e escolares", "servidores locales e intranets escolares")],
    "ECO_001": [("opcion:B", None,
                 "Al subir las tasas, los bancos prestan más dinero, aumenta el consumo y la inflación se acelera.")],
    "ECO_006": [("tema", "Trabajo Informa,", "Trabajo Informal,")],
    "ECO_008": [("tema", "HDI", "IDH")],
    "ECO_010": [("norma_referencia", " / Decreto 1421 de 2017", "")],
    "ETI_REL_001": [
        ("norma_referencia", None, "Constitución Política (Art. 19) / Ley 133 de 1994 / Ley 115 de 1994 (Art. 24)"),
        ("justificacion", None,
         "La Ley 115 de 1994 (art. 24) garantiza la educación religiosa, pero dispone que en los establecimientos del Estado "
         "ninguna persona podrá ser obligada a recibirla; la Ley 133 de 1994 protege la libertad de cultos. Por eso la aprobación "
         "no puede condicionarse a prácticas confesionales y deben ofrecerse alternativas respetuosas del pluralismo."),
    ],
    "QUI_FIS_005": [("norma_referencia", "Química Organic", "Química Orgánica")],
    # --- Orientador escolar ---
    "ORI_003": [("justificacion", "La Corte Constitucional y la Ley 1620 prohíben la desescolarización o expulsión punitiva por razones de consumo.",
                 "La jurisprudencia constitucional ha considerado desproporcionada la expulsión automática por consumo, y la Ley 1620 privilegia la ruta pedagógica y de atención.")],
    "ORI_008": [("justificacion", " (Sentencias T-452/92, T-676/02 entre otras)", "")],
    "ORI_009": [
        ("norma_referencia", None, "Ley 1581 de 2012 / Ley 1098 de 2006 / Manual de Funciones MEN (y Ley 1090 de 2006 cuando el orientador es psicólogo)"),
        ("justificacion", "La Ley 1090 de 2006 (Código Deontológico y Bioético de Psicología) y la Ley 1581 de 2012 (Habeas Data) amparan",
         "La Ley 1581 de 2012 (Habeas Data), la protección reforzada de la información de la niñez (Ley 1098 de 2006) y, cuando el orientador es psicólogo, la Ley 1090 de 2006, amparan"),
    ],
    # --- Simulacro v1 ---
    "SIM_009": [("contexto", "El docente de aula presenciar el acontecimiento", "El docente de aula presencia el acontecimiento")],
}

# Erratas que se corrigen en cualquier campo donde aparezcan
ERRATAS = {
    "strictly": "estrictamente",
    "dissociar": "disociar",
    "interinstitutional": "interinstitucionales",
    "constitutionales": "constitucionales",
    "pluriethnicidad": "plurietnicidad",
    "plurarismo": "pluralismo",
    "expiadas": "expiradas",
    "rerevictimicen": "revictimicen",
    "Ubicado al estudiante": "Ubicar al estudiante",
    "Uso de Uso y Arrendamiento": "Uso y Arrendamiento",
    "Diagológica": "Dialógica",
    "confensional": "confesional",
    "se privilegiando": "se privilegia",
    "transcender": "trascender",
    "un incorrección": "una incorrección",
    "la borradores": "los borradores",
    "análisis relacionales complejas": "análisis relacionales complejos",
    "(Gestión Comunitarios)": "(Gestión Comunitaria)",
    "respondido y construido": "construido",
    "Aplica una sanción": "Aplicar una sanción",
    "rituals": "rituales",
    "puntualizados": "puntuales",
    "trasformaciones": "transformaciones",
    "(Epp)": "(EPP)",
}

CAMPOS_TEXTO = ["tema", "norma_referencia", "contexto", "pregunta", "justificacion"]


def aplicar_correcciones(p: dict, usadas: set) -> None:
    for campo, viejo, nuevo in CORRECCIONES.get(p["id"], []):
        if campo.startswith("opcion:"):
            obj = next(o for o in p["opciones"] if o["id"] == campo.split(":")[1])
            clave = "texto"
        else:
            obj, clave = p, campo
        actual = obj[clave]
        if viejo is None:
            obj[clave] = nuevo
        elif viejo in actual:
            obj[clave] = actual.replace(viejo, nuevo)
        else:
            sys.exit(f"✗ {p['id']}.{campo}: no se encontró el texto a corregir «{viejo}». ¿Cambió la fuente?")
        usadas.add(p["id"])


def corregir_erratas(p: dict, conteo: dict) -> None:
    def fix(s: str) -> str:
        for mal, bien in ERRATAS.items():
            if mal in s:
                conteo[mal] = conteo.get(mal, 0) + s.count(mal)
                s = s.replace(mal, bien)
        return s

    for campo in CAMPOS_TEXTO:
        p[campo] = fix(p[campo])
    for o in p["opciones"]:
        o["texto"] = fix(o["texto"])


def cargar() -> list[dict]:
    preguntas = []
    for archivo in sorted(FUENTES.glob("*.json")):
        datos = json.loads(archivo.read_text(encoding="utf-8"))
        nombre = archivo.name
        if nombre == "simulacros_completos_icfes.json":
            for sim in datos:
                for q in sim["preguntas"]:
                    comp = sin_tildes(q["componente"])
                    cat = next(v for k, v in COMPONENTES_SIM.items() if comp.startswith(k))
                    preguntas.append({**q, "tema": q["competencia"], "categoria_id": cat, "_fuente": nombre})
        elif nombre == "banco_preguntas_pjs_concurso_docente.json":
            for q in datos:
                area = sin_tildes(q["area"])
                cat = next(v for k, v in PREFIJOS_PJS if area.startswith(k))
                preguntas.append({**q, "categoria_id": cat, "_fuente": nombre})
        else:
            if nombre not in ARCHIVOS:
                sys.exit(f"✗ {nombre}: no tiene categoría asignada en ARCHIVOS")
            for q in datos:
                preguntas.append({**q, "categoria_id": q.get("categoria_id") or ARCHIVOS[nombre], "_fuente": nombre})
    return preguntas


def normalizar(p: dict) -> dict:
    cat = CATEGORIAS[p["categoria_id"]]
    salida = {
        "id": p["id"],
        "categoria_id": p["categoria_id"],
        "grupo": cat["grupo"],
        "area": cat["name"],
        "tema": p["tema"].strip(),
        "norma_referencia": p["norma_referencia"].strip(),
        "contexto": p["contexto"].strip(),
        "pregunta": p["pregunta"].strip(),
        "opciones": [{"id": o["id"], "texto": o["texto"].strip()} for o in p["opciones"]],
        "respuesta_correcta": p["respuesta_correcta"],
        "justificacion": p["justificacion"].strip(),
    }
    if p["_fuente"] in MODULO:
        salida["modulo"] = MODULO[p["_fuente"]]
    return salida


def validar(preguntas: list[dict]) -> None:
    errores = []
    vistos = set()
    for p in preguntas:
        if p["id"] in vistos:
            errores.append(f"id duplicado {p['id']}")
        vistos.add(p["id"])
        if [o["id"] for o in p["opciones"]] != ["A", "B", "C", "D"]:
            errores.append(f"{p['id']}: opciones distintas de A–D")
        if p["respuesta_correcta"] not in "ABCD" or len(p["respuesta_correcta"]) != 1:
            errores.append(f"{p['id']}: respuesta inválida")
        for campo in CAMPOS_TEXTO:
            if not p[campo]:
                errores.append(f"{p['id']}: campo vacío {campo}")
        if re.search(r"[\u3040-\u30ff\u4e00-\u9fff]", json.dumps(p, ensure_ascii=False)):
            errores.append(f"{p['id']}: contiene caracteres no latinos")
    if errores:
        sys.exit("✗ Validación:\n  " + "\n  ".join(errores))


def main() -> None:
    crudas = cargar()
    usadas: set = set()
    erratas: dict = {}
    for p in crudas:
        aplicar_correcciones(p, usadas)
        corregir_erratas(p, erratas)
    faltantes = set(CORRECCIONES) - usadas
    if faltantes:
        sys.exit(f"✗ Correcciones sin pregunta destino: {sorted(faltantes)}")

    orden_grupos = list(CONFIG["categories_taxonomy"].keys())
    orden_cats = list(CATEGORIAS.keys())
    preguntas = sorted(
        (normalizar(p) for p in crudas),
        key=lambda p: (orden_grupos.index(p["grupo"]), orden_cats.index(p["categoria_id"]), p["id"]),
    )
    validar(preguntas)
    SALIDA.write_text(json.dumps(preguntas, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    from collections import Counter

    print(f"✓ {len(preguntas)} preguntas → {SALIDA.relative_to(RAIZ)}")
    print(f"  Correcciones por id: {len(usadas)} preguntas · erratas corregidas: {sum(erratas.values())} ({', '.join(erratas)})")
    por_cat = Counter(p["categoria_id"] for p in preguntas)
    for grupo in orden_grupos:
        cats = [c for c in orden_cats if CATEGORIAS[c]["grupo"] == grupo]
        print(f"  {grupo}: " + ", ".join(f"{c}={por_cat.get(c, 0)}" for c in cats))
    letras = Counter(p["respuesta_correcta"] for p in preguntas)
    print(f"  Letra correcta: {dict(sorted(letras.items()))} (la app mezcla las opciones en cada sesión)")


if __name__ == "__main__":
    main()

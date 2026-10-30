"""Generate English and Spanish CVs from the original Portuguese DOCX.

Keeps the one-page Black & Crimson layout, editable source and contact links.
The Portuguese resume is the single source of truth for factual content.
"""
from pathlib import Path
import json
from docx import Document
from docx.oxml.ns import qn

MASTER = Path(__file__).resolve().parents[1] / "public/data/curriculos/guilherme-dos-santos-curriculo-pt.docx"
TRANSLATIONS = json.loads(r'''{"ESTUDANTE DE CIÊNCIA DA COMPUTAÇÃO":{"en":"COMPUTER SCIENCE STUDENT","es":"ESTUDIANTE DE CIENCIAS DE LA COMPUTACIÓN"},"Recife e Região Metropolitana, PE":{"en":"Recife Metropolitan Area, Brazil","es":"Recife y área metropolitana, Brasil"},"OBJETIVO PROFISSIONAL":{"en":"PROFESSIONAL OBJECTIVE","es":"OBJETIVO PROFESIONAL"},"Busco estágio em desenvolvimento de software, com interesse em aplicações web (front-end, back-end ou full stack), engenharia de software e inteligência artificial aplicada a produtos digitais.":{"en":"Seeking a software development internship, with interests in web applications (front-end, back-end or full stack), software engineering and applied AI.","es":"Busco prácticas en desarrollo de software, con interés en aplicaciones web (front-end, back-end o full stack), ingeniería de software e IA aplicada."},"FORMAÇÃO ACADÊMICA":{"en":"EDUCATION","es":"FORMACIÓN ACADÉMICA"},"Bacharelado em Ciência da Computação":{"en":"Bachelor of Science in Computer Science","es":"Grado en Ciencias de la Computación"},"6º período em 2026   ·   Conclusão prevista: dezembro de 2027":{"en":"6th semester in 2026   ·   Expected graduation: December 2027","es":"6.º semestre en 2026   ·   Graduación prevista: diciembre de 2027"},"ATIVIDADES PRÁTICAS E ACADÊMICAS":{"en":"PRACTICAL AND ACADEMIC WORK","es":"ACTIVIDADES PRÁCTICAS Y ACADÉMICAS"},"Desenvolvimento web e prototipação":{"en":"Web development and prototyping","es":"Desarrollo web y prototipado"},"   |   Estudos e atividades pessoais · 2026":{"en":"   |   Personal practice and projects · 2026","es":"   |   Estudios y proyectos personales · 2026"},"Criação e refinamento de interfaces responsivas, navegação e fluxos de interação em protótipos web.":{"en":"Built and refined responsive web interfaces, navigation and interaction flows.","es":"Creación y mejora de interfaces web adaptables, navegación y flujos de interacción."},"Prática com HTML, CSS e JavaScript, incluindo leitura, ajustes e depuração de código.":{"en":"Worked with HTML, CSS and JavaScript, reading, editing and debugging code.","es":"Práctica con HTML, CSS y JavaScript, incluyendo lectura, ajustes y depuración de código."},"Organização e validação de soluções":{"en":"Solution organization and validation","es":"Organización y validación de soluciones"},"   |   Estudos e atividades acadêmicas":{"en":"   |   Academic projects and practice","es":"   |   Estudios y actividades académicas"},"Documentação de requisitos, análise de usabilidade e execução de testes funcionais.":{"en":"Documented requirements, reviewed usability and performed functional tests.","es":"Documentación de requisitos, análisis de usabilidad y ejecución de pruebas funcionales."},"Pesquisa e comparação de alternativas técnicas, com ferramentas de IA como apoio ao aprendizado e à implementação.":{"en":"Compared technical alternatives, using AI tools to support learning and implementation.","es":"Investigación de alternativas técnicas, usando IA como apoyo al aprendizaje y la implementación."},"HABILIDADES TÉCNICAS":{"en":"TECHNICAL SKILLS","es":"COMPETENCIAS TÉCNICAS"},"Back-end e dados":{"en":"Back-end and data","es":"Back-end y datos"},"Ferramentas e práticas":{"en":"Tools and practices","es":"Herramientas y prácticas"},"HTML, CSS, JavaScript; contato com TypeScript":{"en":"HTML, CSS, JavaScript; introductory TypeScript","es":"HTML, CSS, JavaScript; conocimientos iniciales de TypeScript"},"Python, FastAPI, SQLite; contato com Django":{"en":"Python, FastAPI, SQLite; introductory Django","es":"Python, FastAPI, SQLite; conocimientos iniciales de Django"},"Git, GitHub, APIs REST, prototipação, testes funcionais e documentação":{"en":"Git, GitHub, REST APIs, prototyping, functional testing and documentation","es":"Git, GitHub, APIs REST, prototipado, pruebas funcionales y documentación"},"IDIOMAS":{"en":"LANGUAGES","es":"IDIOMAS"},"Inglês":{"en":"English","es":"Inglés"},"   ·   Intermediário":{"en":"   ·   Intermediate","es":"   ·   Intermedio"},"Guilherme dos Santos   ·   Currículo profissional":{"en":"Guilherme dos Santos   ·   Professional CV","es":"Guilherme dos Santos   ·   Currículum profesional"}}''')
METADATA = {
    "en": ("Curriculum Vitae | Guilherme dos Santos", "Professional CV"),
    "es": ("Currículum | Guilherme dos Santos", "Currículum profesional"),
}

def translate_run(original, locale):
    if original in TRANSLATIONS:
        return TRANSLATIONS[original][locale], original
    if original.startswith("  ") and original[2:] in TRANSLATIONS:
        return "  " + TRANSLATIONS[original[2:]][locale], original[2:]
    if original.endswith(": ") and original[:-2] in TRANSLATIONS:
        return TRANSLATIONS[original[:-2]][locale] + ": ", original[:-2]
    return None, None

def generate(locale):
    if not MASTER.is_file():
        raise FileNotFoundError(f"Portuguese master not found: {MASTER}")
    doc = Document(MASTER)
    seen = set()
    for node in doc.element.body.iter(qn("w:t")):
        old = node.text or ""
        value, key = translate_run(old, locale)
        if key:
            node.text = value
            seen.add(key)
    for section in doc.sections:
        for node in section.footer._element.iter(qn("w:t")):
            old = node.text or ""
            value, key = translate_run(old, locale)
            if key:
                node.text = value
                seen.add(key)
    missing = set(TRANSLATIONS) - seen
    if missing:
        raise ValueError("Portuguese master changed. Unmatched runs: " + repr(sorted(missing)))
    doc.core_properties.title, doc.core_properties.subject = METADATA[locale]
    dest = MASTER.with_name(f"guilherme-dos-santos-curriculo-{locale}.docx")
    doc.save(dest)
    return dest

if __name__ == "__main__":
    for locale in ("en", "es"):
        print(generate(locale))

# app/extractors.py
from pathlib import Path
import tempfile
import docx
from pdfminer.high_level import extract_text as pdf_extract_text
from typing import Union

def extract_text_from_pdf(path: Path) -> str:
    try:
        return pdf_extract_text(str(path)) or ""
    except Exception as e:
        print(f"[WARN] pdfminer failed on {path.name}: {e}")
        return ""

def extract_text_from_docx(path: Path) -> str:
    try:
        doc = docx.Document(str(path))
        return "\n".join([p.text for p in doc.paragraphs if p.text])
    except Exception as e:
        print(f"[WARN] python-docx failed on {path.name}: {e}")
        return ""

def extract_text_from_txt(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def extract_text(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(path)
    elif ext == ".txt":
        return extract_text_from_txt(path)
    else:
        return extract_text_from_txt(path)

def save_bytes_to_tempfile(name: str, data: bytes) -> Path:
    suffix = Path(name).suffix or ".pdf"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(data)
        tmp.flush()
        tmp.close()
    except Exception:
        tmp.close()
        raise
    return Path(tmp.name)

def extract_text_from_bytes(name: str, data: Union[bytes, memoryview]) -> str:
    bytes_data = data.tobytes() if isinstance(data, memoryview) else bytes(data)
    tmp_path = save_bytes_to_tempfile(name, bytes_data)
    try:
        txt = extract_text(tmp_path)
    finally:
        try:
            tmp_path.unlink()
        except Exception:
            pass
    return txt

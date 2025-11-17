# app/preprocess.py
import re
from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

TOKEN_RE = re.compile(r"\b[a-zA-Z]+\b")

def ensure_nltk():
    resources = ["punkt", "stopwords", "wordnet", "omw-1.4"]
    for r in resources:
        try:
            nltk.data.find(r)
        except LookupError:
            nltk.download(r, quiet=True)

ensure_nltk()
STOPWORDS = set(stopwords.words("english"))
LEMMATIZER = WordNetLemmatizer()

def preprocess_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    tokens = TOKEN_RE.findall(text)
    filtered = [LEMMATIZER.lemmatize(t) for t in tokens if t not in STOPWORDS and len(t) > 1]
    return " ".join(filtered)

def derive_skills_from_jd(job_text: str, top_n: int = 40) -> List[str]:
    pre = preprocess_text(job_text)
    if not pre.strip():
        return []
    vect = TfidfVectorizer(ngram_range=(1,2), max_features=500)
    X = vect.fit_transform([pre])
    feature_names = np.array(vect.get_feature_names_out())
    if feature_names.size == 0:
        return []
    candidates = [t for t in feature_names if len(t) > 1]
    return candidates[:top_n]

def match_skills(skills_required: List[str], text: str) -> List[str]:
    if not skills_required or not text:
        return []
    text_low = " " + preprocess_text(text) + " "
    matched = []
    for skill in skills_required:
        s = skill.lower().strip()
        if not s:
            continue
        s_toks = " " + " ".join(TOKEN_RE.findall(s.lower())) + " "
        if s_toks.strip() and s_toks.strip() in text_low:
            matched.append(skill)
    return sorted(set(matched), key=lambda x: x)

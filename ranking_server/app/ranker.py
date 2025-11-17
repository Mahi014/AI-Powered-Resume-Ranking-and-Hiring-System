# app/ranker.py
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .preprocess import preprocess_text, derive_skills_from_jd, match_skills
from .config import TFIDF_MAX_FEATURES, TFIDF_NGRAM, SKILL_BOOST_WEIGHT

def compute_scores_from_texts(job_text: str,
                              resumes_texts: List[Dict],
                              cfg_skill_weight: float = SKILL_BOOST_WEIGHT) -> List[Dict]:
    jd_pre = preprocess_text(job_text)
    corpus = [jd_pre] + [preprocess_text(r.get("text", "")) for r in resumes_texts]
    vectorizer = TfidfVectorizer(max_features=TFIDF_MAX_FEATURES, ngram_range=TFIDF_NGRAM, min_df=1, max_df=0.85)
    X = vectorizer.fit_transform(corpus)
    jd_vec = X[0]
    res_vecs = X[1:]
    cosine_scores = cosine_similarity(jd_vec, res_vecs).flatten()

    skills = derive_skills_from_jd(job_text, top_n=40)

    results = []
    for i, r in enumerate(resumes_texts):
        cosine_score = float(cosine_scores[i])
        matched = match_skills(skills, r.get("text", "")) if skills else []
        skill_ratio = (len(matched) / len(skills)) if skills else 0.0
        w = cfg_skill_weight
        final_score = (1.0 - w) * cosine_score + w * skill_ratio
        results.append({
            "job_seeker_id": r["job_seeker_id"],
            "resume_name": r.get("resume_name"),
            "text": r.get("text", ""),
            "cosine_score": cosine_score,
            "matched_skills": matched,
            "skill_ratio": skill_ratio,
            "score": float(final_score)
        })

    results_sorted = sorted(results, key=lambda x: (x["score"], x["cosine_score"]), reverse=True)
    return results_sorted

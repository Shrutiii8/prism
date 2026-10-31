import re
import math
from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.core.config import settings

# Enterprise Domain-specific expansion dictionary for Indian Higher/Technical Education
EXPANSION_DICT = {
    "engg": "engineering",
    "tech": "technology",
    "univ": "university",
    "inst": "institute",
    "dept": "department",
    "mgmt": "management",
    "poly": "polytechnic",
    "pharm": "pharmacy",
    "col": "college",
    "coll": "college",
    "gov": "government",
    "govt": "government",
    "pvt": "private",
    "acad": "academic",
    "fac": "faculty",
    "infr": "infrastructure",
    "appr": "approval",
    "unappr": "unapproved",
}

KEY_REGULATORY_KEYWORDS = [
    "approval", "unapproved", "affiliation", "fee", "excess fee", "capitation",
    "faculty", "shortage", "biometric", "ghost faculty", "infrastructure",
    "laboratory", "building", "safety", "degree", "fake", "placement", "refund",
    "harassment", "exam", "syllabus", "attendance", "admissions", "quota"
]

def normalize_text(text: str) -> str:
    """Normalizes complaint and institution text by lowercasing, expanding abbreviations and removing special noise."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = text.split()
    normalized_tokens = [EXPANSION_DICT.get(tok, tok) for tok in tokens if len(tok) > 1]
    return " ".join(normalized_tokens)

def compute_institution_score(
    inst_a_id: str,
    inst_b_id: str,
    inst_a_name: str,
    inst_b_name: str,
    aicte_a: str,
    aicte_b: str
) -> Tuple[float, List[str]]:
    """Calculates institution similarity based on verified IDs and normalized names."""
    reasons = []
    
    # Check verified primary key or AICTE ID
    if inst_a_id == inst_b_id:
        reasons.append("Exact database institution match (identical institution record)")
        return 1.0, reasons
        
    if aicte_a and aicte_b and aicte_a.strip().upper() == aicte_b.strip().upper():
        reasons.append(f"Matching AICTE Permanent ID: {aicte_a.strip().upper()}")
        return 1.0, reasons

    # Normalized Name token comparison
    norm_a = set(normalize_text(inst_a_name).split())
    norm_b = set(normalize_text(inst_b_name).split())
    
    if not norm_a or not norm_b:
        return 0.0, ["Insufficient institution metadata"]

    common = norm_a.intersection(norm_b)
    union = norm_a.union(norm_b)
    jaccard = len(common) / len(union) if union else 0.0

    if jaccard >= 0.8:
        reasons.append(f"Near-identical institution naming (token overlap: {round(jaccard*100, 1)}%)")
        return jaccard, reasons
    elif jaccard >= 0.4:
        reasons.append(f"Partial institution name overlap on key terms: {', '.join(list(common)[:4])}")
        return jaccard, reasons
    elif len(common) >= 2:
        reasons.append(f"Common organizational keywords: {', '.join(list(common)[:3])}")
        return 0.25, reasons
        
    return 0.0, ["Institutions appear distinct"]

def compute_semantic_score(text_a: str, text_b: str) -> Tuple[float, List[str], List[str]]:
    """Calculates semantic similarity using TF-IDF vectorization with n-gram character and word models."""
    norm_a = normalize_text(text_a)
    norm_b = normalize_text(text_b)
    
    if not norm_a or not norm_b:
        return 0.0, [], []

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            stop_words='english',
            min_df=1,
            max_features=2000
        )
        tfidf_matrix = vectorizer.fit_transform([norm_a, norm_b])
        cos_sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    except Exception:
        cos_sim = 0.0

    # Extract common topical keywords
    tokens_a = set(norm_a.split())
    tokens_b = set(norm_b.split())
    common_tokens = sorted(list(tokens_a.intersection(tokens_b)))
    
    matched_regulatory = [kw for kw in KEY_REGULATORY_KEYWORDS if kw in norm_a and kw in norm_b]
    
    reasons = []
    if cos_sim >= 0.70:
        reasons.append(f"Strong semantic overlap in allegation descriptions ({round(cos_sim * 100, 1)}%)")
    elif cos_sim >= 0.40:
        reasons.append(f"Moderate semantic similarity in complaint text ({round(cos_sim * 100, 1)}%)")
    elif cos_sim >= 0.20:
        reasons.append(f"Topical overlap in complaint narrative ({round(cos_sim * 100, 1)}%)")
        
    if matched_regulatory:
        reasons.append(f"Common regulatory grievance subjects: {', '.join(matched_regulatory[:5])}")

    return cos_sim, common_tokens, reasons

def compute_category_score(cat_a_id: str, cat_b_id: str, subcat_a: str, subcat_b: str) -> Tuple[float, List[str]]:
    """Calculates category and subcategory alignment."""
    reasons = []
    if cat_a_id and cat_b_id and cat_a_id == cat_b_id:
        if subcat_a and subcat_b and subcat_a.strip().lower() == subcat_b.strip().lower():
            reasons.append(f"Identical grievance category and subcategory ('{subcat_a}')")
            return 1.0, reasons
        reasons.append("Identical grievance primary category")
        return 0.8, reasons
    return 0.0, ["Different complaint categories"]

def compute_context_score(
    ref_a: str,
    ref_b: str,
    region_a: str,
    region_b: str,
    bureau_a: str,
    bureau_b: str
) -> Tuple[float, List[str]]:
    """Calculates contextual alignment including regional jurisdiction and reference linkage."""
    score = 0.0
    reasons = []
    
    if ref_a and ref_b and normalize_text(ref_a) == normalize_text(ref_b):
        score += 0.6
        reasons.append("Matching external reference or memo number")
        
    if region_a and region_b and region_a == region_b:
        score += 0.2
        reasons.append("Same regional jurisdiction")
        
    if bureau_a and bureau_b:
        if bureau_a != bureau_b:
            # Different bureaus receiving the same issue is an important cross-bureau coordination signal!
            score += 0.2
            reasons.append(f"Cross-bureau distribution between {bureau_a} and {bureau_b}")
        else:
            score += 0.1
            reasons.append("Complaints lodged within same bureau")
            
    return min(1.0, score), reasons

class AIMatchingEngine:
    def __init__(
        self,
        weight_inst: float = settings.WEIGHT_INSTITUTION,
        weight_semantic: float = settings.WEIGHT_SEMANTIC,
        weight_cat: float = settings.WEIGHT_CATEGORY,
        weight_context: float = settings.WEIGHT_CONTEXT
    ):
        self.w_inst = weight_inst
        self.w_semantic = weight_semantic
        self.w_cat = weight_cat
        self.w_context = weight_context
        self.high_thresh = settings.AI_HIGH_SIMILARITY_THRESHOLD
        self.med_thresh = settings.AI_MEDIUM_SIMILARITY_THRESHOLD

    def evaluate_pair(
        self,
        complaint_a: Dict[str, Any],
        complaint_b: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates a pair of complaints and returns confidence score, classification, and explainable breakdown.
        """
        inst_score, inst_reasons = compute_institution_score(
            inst_a_id=complaint_a.get("institution_id", ""),
            inst_b_id=complaint_b.get("institution_id", ""),
            inst_a_name=complaint_a.get("institution_name", ""),
            inst_b_name=complaint_b.get("institution_name", ""),
            aicte_a=complaint_a.get("aicte_id", ""),
            aicte_b=complaint_b.get("aicte_id", "")
        )
        
        sem_score, shared_tokens, sem_reasons = compute_semantic_score(
            text_a=f"{complaint_a.get('subject', '')} {complaint_a.get('description', '')}",
            text_b=f"{complaint_b.get('subject', '')} {complaint_b.get('description', '')}"
        )
        
        cat_score, cat_reasons = compute_category_score(
            cat_a_id=complaint_a.get("category_id", ""),
            cat_b_id=complaint_b.get("category_id", ""),
            subcat_a=complaint_a.get("subcategory", ""),
            subcat_b=complaint_b.get("subcategory", "")
        )
        
        context_score, context_reasons = compute_context_score(
            ref_a=complaint_a.get("reference_number", ""),
            ref_b=complaint_b.get("reference_number", ""),
            region_a=complaint_a.get("regional_office_id", ""),
            region_b=complaint_b.get("regional_office_id", ""),
            bureau_a=complaint_a.get("bureau_code", ""),
            bureau_b=complaint_b.get("bureau_code", "")
        )
        
        overall = (
            (inst_score * self.w_inst) +
            (sem_score * self.w_semantic) +
            (cat_score * self.w_cat) +
            (context_score * self.w_context)
        )
        overall = round(min(1.0, max(0.0, overall)), 4)
        
        if overall >= self.high_thresh:
            classification = "HIGH"
        elif overall >= self.med_thresh:
            classification = "MEDIUM"
        else:
            classification = "LOW"
            
        all_reasons = inst_reasons + sem_reasons + cat_reasons + context_reasons
        
        return {
            "source_case_id": complaint_a.get("case_id"),
            "target_case_id": complaint_b.get("case_id"),
            "source_complaint_id": complaint_a.get("id"),
            "target_complaint_id": complaint_b.get("id"),
            "overall_score": overall,
            "institution_score": round(inst_score, 4),
            "semantic_score": round(sem_score, 4),
            "category_score": round(cat_score, 4),
            "context_score": round(context_score, 4),
            "classification": classification,
            "weights": {
                "institution": self.w_inst,
                "semantic": self.w_semantic,
                "category": self.w_cat,
                "context": self.w_context
            },
            "shared_keywords": shared_tokens[:12],
            "factors": all_reasons,
            "summary_explanation": (
                f"{classification} match ({round(overall*100, 1)}% confidence): "
                f"{'; '.join(all_reasons[:3])}"
            )
        }

matching_engine = AIMatchingEngine()


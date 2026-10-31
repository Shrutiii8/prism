import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_success_and_profile():
    # Successful login with seeded admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prism.gov.in",
        "password": "Prism@2026!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check profile
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@prism.gov.in"
    assert me_res.json()["role"] == "SUPER_ADMIN"

def test_login_invalid_credentials():
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@prism.gov.in",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 401

def test_institutions_directory_and_360():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "central.admin@prism.gov.in",
        "password": "Prism@2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List institutions
    inst_res = client.get("/api/v1/institutions?limit=10", headers=headers)
    assert inst_res.status_code == 200
    data = inst_res.json()
    assert data["total"] >= 50
    assert len(data["items"]) == 10
    inst_id = data["items"][0]["id"]

    # Get 360 profile
    profile_res = client.get(f"/api/v1/institutions/{inst_id}", headers=headers)
    assert profile_res.status_code == 200
    profile = profile_res.json()
    assert "total_complaints" in profile
    assert "severity_breakdown" in profile
    assert "activity_timeline" in profile

def test_complaints_and_workflow():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "head.rb@prism.gov.in",
        "password": "Prism@2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List complaints
    comp_res = client.get("/api/v1/complaints?limit=5", headers=headers)
    assert comp_res.status_code == 200
    complaints = comp_res.json()["items"]
    assert len(complaints) > 0
    complaint_id = complaints[0]["id"]

    # Detail view
    detail_res = client.get(f"/api/v1/complaints/{complaint_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "case_id" in detail
    assert "assignments_history" in detail
    assert "permitted_transitions" in detail

def test_ai_matching_workspace():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "head.rb@prism.gov.in",
        "password": "Prism@2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    matches_res = client.get("/api/v1/ai/matches", headers=headers)
    assert matches_res.status_code == 200
    data = matches_res.json()
    assert data["total"] > 0
    match_item = data["items"][0]
    assert "overall_score" in match_item
    assert "classification" in match_item
    assert "explanation_json" in match_item

def test_executive_dashboard_kpis():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prism.gov.in",
        "password": "Prism@2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    kpis = dash["kpis"]
    assert kpis["total_institutions"] >= 50
    assert kpis["total_complaints"] >= 150
    assert len(dash["complaints_by_bureau"]) > 0
    assert len(dash["severity_distribution"]) > 0

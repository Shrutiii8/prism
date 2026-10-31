import os
import sys
import asyncio
import httpx

async def run_verification():
    print("Starting automated backend verification tests against running API Gateway...")
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=15.0) as client:
        # 1. Health
        h = await client.get("/health")
        assert h.status_code == 200, f"Health check failed: {h.text}"
        print(" [PASS] 1. Health check passed:", h.json())

        # 2. Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "superadmin@prism.gov.in",
            "password": "Prism@2026!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(" [PASS] 2. SuperAdmin login successful. Token acquired.")

        # 3. Profile / Auth ME
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200, f"Profile failed: {me_res.text}"
        user_data = me_res.json()
        assert user_data["role"] == "SUPER_ADMIN"
        print(f" [PASS] 3. Profile verification: {user_data['full_name']} ({user_data['role']})")

        # 4. Institutions List & 360 Profile
        inst_res = await client.get("/api/v1/institutions?limit=5", headers=headers)
        assert inst_res.status_code == 200
        insts = inst_res.json()["items"]
        assert len(insts) > 0
        first_inst_id = insts[0]["id"]
        inst_360 = await client.get(f"/api/v1/institutions/{first_inst_id}", headers=headers)
        assert inst_360.status_code == 200
        print(f" [PASS] 4. Institutions registry: {len(insts)} loaded, 360 profile loaded for '{inst_360.json()['name']}'")

        # 5. Complaints Directory & Detail
        comp_res = await client.get("/api/v1/complaints?limit=5", headers=headers)
        assert comp_res.status_code == 200
        complaints = comp_res.json()["items"]
        assert len(complaints) > 0
        comp_id = complaints[0]["id"]
        comp_detail = await client.get(f"/api/v1/complaints/{comp_id}", headers=headers)
        if comp_detail.status_code != 200:
            print("ERROR IN COMP_DETAIL:", comp_detail.status_code, comp_detail.text)
        assert comp_detail.status_code == 200
        print(f" [PASS] 5. Complaints directory: Case '{comp_detail.json()['case_id']}' verified.")

        # 6. AI Overlap Matches
        matches_res = await client.get("/api/v1/ai/matches?limit=5", headers=headers)
        assert matches_res.status_code == 200
        matches = matches_res.json()["items"]
        assert len(matches) > 0
        print(f" [PASS] 6. AI Matches workspace: {len(matches)} overlapping cases identified. Score: {matches[0]['overall_score']}")

        # 7. Executive Dashboard KPIs & Charts
        dash_res = await client.get("/api/v1/analytics/dashboard", headers=headers)
        assert dash_res.status_code == 200
        kpis = dash_res.json()["kpis"]
        print(f" [PASS] 7. Executive Dashboard: {kpis['total_institutions']} Institutions, {kpis['total_complaints']} Complaints, {kpis['open_complaints']} Open, {kpis['overdue_complaints']} Overdue.")

        # 8. Report Generation & CSV Export
        rep_res = await client.get("/api/v1/analytics/reports/institution_wise", headers=headers)
        if rep_res.status_code != 200:
            print("ERROR IN REPORT:", rep_res.status_code, rep_res.text)
        assert rep_res.status_code == 200
        csv_res = await client.get("/api/v1/analytics/reports/institution_wise/export-csv", headers=headers)
        assert csv_res.status_code == 200
        print(" [PASS] 8. Reports & CSV export: Institution-wise report generated successfully.")

        # 9. Audit Logs
        audit_res = await client.get("/api/v1/audit?limit=10", headers=headers)
        assert audit_res.status_code == 200
        print(f" [PASS] 9. Audit Logging: {audit_res.json()['total']} audit events recorded.")

        # 10. User Management
        users_res = await client.get("/api/v1/users", headers=headers)
        assert users_res.status_code == 200
        print(f" [PASS] 10. User Management: {len(users_res.json())} personnel accounts verified.")

        # 11. System Settings
        settings_res = await client.get("/api/v1/settings", headers=headers)
        assert settings_res.status_code == 200
        print(f" [PASS] 11. System Settings: {len(settings_res.json())} platform parameters loaded.")

    print("\n>>> ALL 11 BACKEND VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    asyncio.run(run_verification())

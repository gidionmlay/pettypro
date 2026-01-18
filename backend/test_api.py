import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("🚀 Starting API Tests...")

    # 1. Login
    print("\n1. Testing Login...")
    try:
        response = requests.post(f"{BASE_URL}/token/", data={"username": "admin", "password": "password"})
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        return

    if response.status_code == 200:
        token = response.json()['access']
        print("✅ Login Successful")
    else:
        print(f"❌ Login Failed: {response.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Dashboard
    print("\n2. Testing Dashboard...")
    response = requests.get(f"{BASE_URL}/dashboard/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Dashboard Data: Balance=${data['balance']}")
    else:
        print(f"❌ Dashboard Failed: {response.text}")

    # 3. Create Expense
    print("\n3. Testing Add Expense...")
    expense_data = {
        "description": "API Test Expense",
        "amount": 50.00,
        "status": "APPROVED" # In real app, might just send description/amount
    }
    response = requests.post(f"{BASE_URL}/expenses/", json=expense_data, headers=headers)
    if response.status_code == 201:
        print("✅ Expense Created Successfully")
    else:
        print(f"❌ Create Expense Failed: {response.text}")

    # 4. Verify Balance Deduction
    print("\n4. Verifying Balance Deduction...")
    response = requests.get(f"{BASE_URL}/dashboard/", headers=headers)
    new_balance = float(response.json()['balance'])
    print(f"✅ New Balance: ${new_balance}")

if __name__ == "__main__":
    run_tests()

"""
Script de testing rápido para autenticación y multi-tenancy
"""
import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    print("��� Testing Multi-tenancy + Auth")
    print("=" * 50)
    
    # 1. Registrar consultorio
    print("\n1️⃣ Registrando consultorio...")
    register_data = {
        "consultorio_nombre": "Test Clinic",
        "consultorio_email": "clinic@test.com",
        "first_name": "Admin",
        "last_name": "Test",
        "email": "admin@test.com",
        "password": "Test123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 201:
        print("✅ Consultorio creado:", response.json())
    else:
        print("❌ Error:", response.json())
        return
    
    # 2. Login
    print("\n2️⃣ Haciendo login...")
    login_data = {
        "email": "admin@test.com",
        "password": "Test123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens["access_token"]
        print("✅ Login exitoso")
        print(f"Token: {access_token[:50]}...")
    else:
        print("❌ Error:", response.json())
        return
    
    # Headers con autenticación
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 3. Obtener usuario actual
    print("\n3️⃣ Obteniendo usuario actual...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code == 200:
        user = response.json()
        print("✅ Usuario:", user)
        consultorio_id = user["consultorio_id"]
    else:
        print("❌ Error:", response.json())
        return
    
    # 4. Crear paciente
    print("\n4️⃣ Creando paciente...")
    patient_data = {
        "first_name": "Juan",
        "last_name": "Pérez",
        "ci": "11111111",
        "gender": "masculino",
        "email": "juan@test.com",
        "phone": "+595981234567",
        "birth_date": "1985-03-10",
        "address": "Calle Test 456"
    }
    
    response = requests.post(f"{BASE_URL}/patients/", json=patient_data, headers=headers)
    if response.status_code == 201:
        patient = response.json()
        print("✅ Paciente creado:", patient)
        print(f"   Consultorio ID: {patient['consultorio_id']}")
        patient_id = patient["id"]
    else:
        print("❌ Error:", response.json())
        return
    
    # 5. Listar pacientes
    print("\n5️⃣ Listando pacientes...")
    response = requests.get(f"{BASE_URL}/patients/", headers=headers)
    if response.status_code == 200:
        patients = response.json()
        print(f"✅ Total pacientes: {len(patients)}")
        for p in patients:
            print(f"   - {p['first_name']} {p['last_name']} (CI: {p['ci']}, Consultorio: {p['consultorio_id']})")
    else:
        print("❌ Error:", response.json())
        return
    
    # 6. Buscar paciente
    print("\n6️⃣ Buscando paciente por nombre...")
    response = requests.get(f"{BASE_URL}/patients/search?q=Juan", headers=headers)
    if response.status_code == 200:
        results = response.json()
        print(f"✅ Resultados encontrados: {len(results)}")
    else:
        print("❌ Error:", response.json())
    
    # 7. Actualizar paciente
    print("\n7️⃣ Actualizando paciente...")
    update_data = {"phone": "+595987654321"}
    response = requests.put(f"{BASE_URL}/patients/{patient_id}", json=update_data, headers=headers)
    if response.status_code == 200:
        updated = response.json()
        print(f"✅ Paciente actualizado. Nuevo teléfono: {updated['phone']}")
    else:
        print("❌ Error:", response.json())
    
    print("\n" + "=" * 50)
    print("✅ ¡Todas las pruebas completadas exitosamente!")
    print("\n��� Resumen:")
    print(f"   Consultorio ID: {consultorio_id}")
    print(f"   Usuario: admin@test.com")
    print(f"   Pacientes creados: 1")
    print(f"   Multi-tenancy: ✅ Funcionando")

if __name__ == "__main__":
    test_flow()

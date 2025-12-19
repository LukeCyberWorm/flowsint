from app.main import app

print("=== ROTAS REGISTRADAS ===")
for route in app.routes:
    if "dossier" in route.path.lower():
        print(f"{route.path} - {route.methods if hasattr(route, 'methods') else 'N/A'}")

print("\n=== TODAS AS ROTAS /api/dossiers ===")
for route in app.routes:
    if route.path.startswith("/api/dossiers"):
        print(f"{route.path} - {route.methods if hasattr(route, 'methods') else 'N/A'}")

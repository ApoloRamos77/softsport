<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Soft Sport - Sistema de Gestión Deportiva

Sistema completo de gestión para academias deportivas con frontend React + TypeScript y backend C# Web API con SQL Server.

## Arquitectura del Proyecto

```
Soft_Sport/
├── api/                        # Web API en C# (.NET 9)
│   ├── Controllers/            # Controladores REST API
│   ├── Data/                   # DbContext y configuración EF Core
│   ├── Models/                 # Modelos de datos
│   └── Program.cs              # Configuración de la API
├── components/                 # Componentes React
├── services/                   # Servicios del frontend
│   ├── api.ts                  # Cliente de la API
│   └── db.ts                   # Adaptador de datos
├── migrations/                 # Migraciones SQL
└── webconfig.json              # Configuración de BD
```

## Requisitos Previos

- **Node.js** v18+ y npm
- **.NET SDK** 9.0+
- **SQL Server** accesible en `192.168.1.160:1433`

## Ejecución Completa

Para ejecutar todo el sistema, abre **dos terminales**:

**Terminal 1 - API:**
```powershell
cd C:\Proyecto_2026\Soft_Sport\api
dotnet run
```
La API estará en: http://localhost:5081 | Swagger: http://localhost:5081/swagger

**Terminal 2 - Frontend:**
```powershell
cd C:\Proyecto_2026\Soft_Sport
npm.cmd run dev
```
El frontend estará en: http://localhost:3000

## Documentación Completa

Ver [DOCUMENTATION.md](DOCUMENTATION.md) para información detallada sobre endpoints, configuración, migraciones y troubleshooting.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

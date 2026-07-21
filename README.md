# 📱 Système de Gestion des Attributions de Numéros de Téléphone
## SOS Villages d'Enfants — Département Informatique

Application web interne pour la gestion et le suivi des attributions de numéros de téléphone aux employés.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm

### 1. Configuration du backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```

Le serveur backend démarre sur **http://localhost:3001**

### 2. Configuration du frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur **http://localhost:5173**

---

## 📁 Structure du projet

```
phone-management/
├── backend/           # API Node.js + Express + Prisma
│   ├── prisma/        # Schéma et migrations de base de données
│   └── src/
│       ├── routes/    # Routes API (employees, phone-numbers, assignments, dashboard)
│       └── index.ts   # Point d'entrée du serveur
└── frontend/          # Application React + TypeScript + Tailwind
    └── src/
        ├── api/       # Client Axios
        ├── components/# Composants réutilisables
        ├── pages/     # Pages de l'application
        └── types/     # Types TypeScript
```

---

## 🔗 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/dashboard | Statistiques du tableau de bord |
| GET | /api/employees | Liste des employés (avec pagination/filtres) |
| POST | /api/employees | Créer un employé |
| PUT | /api/employees/:id | Modifier un employé |
| DELETE | /api/employees/:id | Supprimer un employé (soft delete) |
| GET | /api/phone-numbers | Liste des numéros |
| POST | /api/phone-numbers | Ajouter un numéro |
| PUT | /api/phone-numbers/:id | Modifier un numéro |
| DELETE | /api/phone-numbers/:id | Supprimer un numéro (soft delete) |
| GET | /api/phone-numbers/:id/history | Historique d'un numéro |
| GET | /api/assignments | Liste des attributions |
| POST | /api/assignments | Créer une attribution |
| PUT | /api/assignments/:id/return | Retourner un numéro |

---

## 🛠 Stack technique

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: SQLite (via Prisma ORM)
- **UI Libraries**: Lucide React, React Hot Toast, date-fns

---

## 📊 Modèle de données

### Employés
- id, fullName, department, position, email, status, deletedAt, createdAt, updatedAt

### Numéros de téléphone
- id, phoneNumber (unique), provider, status, notes, deletedAt, createdAt, updatedAt

### Attributions
- id, employeeId, phoneNumberId, assignedAt, returnedAt (nullable), assignedBy, createdAt, updatedAt

---

*Développé dans le cadre du projet de stage — SOS Villages d'Enfants*

# NurseOps API

Backend core for the NurseOps operational healthcare scheduling platform.

NurseOps is an operational workforce management platform designed to help hospitals and healthcare organizations manage:

- nurse scheduling
- operational coverage
- emergency replacements
- fatigue prevention
- overtime control
- vacation and leave management
- real-time operational alerts
- staffing optimization

---

# Tech Stack

## Core

- Node.js
- NestJS
- PostgreSQL
- Redis
- BullMQ
- WebSockets
- Swagger

---

# Architecture

This backend follows a modular and scalable architecture based on operational domains.

Example modules:

- Auth
- Scheduling
- Coverage
- Notifications
- Vacations
- Operational Alerts
- Optimization Engine
- Rules Engine

---

# Main Features

## Scheduling Engine

- Monthly schedule generation
- Dynamic work rules
- Shift validations
- Fatigue prevention
- Fair workload distribution

## Coverage Management

- Emergency coverage workflows
- Cross-department support
- Real-time operational alerts

## Notifications System

- WebSocket real-time notifications
- Priority-based alerts
- Multi-channel notification architecture

## Audit & Traceability

- Audit logs
- Activity tracking
- Operational event history

---

# Project Status

Current phase:
- Product Discovery
- Architecture Design
- Operational Flow Definition

---

# Folder Structure

```bash
src/
  modules/
    auth/
    scheduling/
    coverage/
    notifications/
    vacations/
    alerts/
    optimization/

  common/
  infrastructure/
  config/
````

---

# Environment Variables

```env
PORT=
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

---

# Installation

## Clone repository

```bash
git clone https://github.com/your-user/nurseops-api.git
```

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run start:dev
```

---

# Docker

```bash
docker-compose up -d
```

---

# API Documentation

Swagger documentation:

```bash
/api/docs
```

---

# Long-Term Vision

NurseOps aims to become an intelligent operational platform for healthcare workforce management focused on:

* operational efficiency
* workload balance
* staffing intelligence
* fatigue reduction
* real-time hospital operations

---

# License

Private

````

---

# REPOSITORIOS QUE TE RECOMIENDO DESDE YA

---

# Backend

```text id="repo5"
nurseops-api
````

---

# Frontend Web

```text id="repo6"
nurseops-web
```

---

# Mobile

```text id="repo7"
nurseops-mobile
```

---

# Infrastructure (futuro)

```text id="repo8"
nurseops-infra
```

---

# IA / Optimization future

```text id="repo9"
nurseops-optimizer
```

---

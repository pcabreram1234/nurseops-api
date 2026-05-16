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

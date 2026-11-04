# Barangay Health Center Health Record Management System

An academic front-end prototype for the documented patient registration, appointment, consultation, medical-history, staff, audit, and record-retention workflows.

## Run locally

```sh
npm install
npm run dev
```

The website runs without the API server. It starts with fictional sample records and saves demo changes in this browser's local storage. Use **Restore sample data** in the sidebar to return to the sample workspace.

## Prototype features

- Search and review patient profiles, demographics, emergency contacts, and consultation history.
- Register patients with duplicate checks and schedule appointments with Pending, Confirmed, Completed, or Cancelled states.
- Let a Nurse record vital signs and assign the visit to an active Doctor; the Doctor can complete the diagnosis, ICD-10 example code, notes, and optional prescription.
- Review retention status and legal holds. The interface blocks destruction scheduling when a legal hold applies or the review date has not passed; it never destroys records automatically.
- Preview the seven documented database tables, their keys, relationships, and participation constraints.
- Preview staff roles, account deactivation, and audit events.

The sample ICD-10 choices are illustrative only, not a complete or authoritative code set. Retention schedule examples also require confirmation by the health center.

## Important limitations

This is a user-interface prototype, not a production or certified clinical system. Demo role selection only changes the interface; it does not provide authentication or server-enforced authorization. Data is not encrypted, local storage is not a secure patient-data store, audit history is not tamper-proof, and the sample data should never be replaced with real patient information. Clinical validation, privacy review, security testing, approved ICD-10 and retention references, backups, and required approvals are needed before any real-world deployment.

The MySQL/MariaDB schema described in the project documentation remains a design reference; this front-end demo does not connect to a relational database.

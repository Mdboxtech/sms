Copilot Instructions for SMS Laravel Project
Active Development Phase: Result Compiler Module

Project Overview
This is a Laravel-based School Management System (SMS) with a modular architecture. Key components include:

app/Models/ — Eloquent models (Student, Teacher, Subject, Result, etc.)

app/Http/Controllers/ — HTTP request handling & routing to services

app/Services/ — Core business logic (e.g., ReportCardService.php)

app/Exports/Imports/ — Excel import/export logic

app/Observers/ — Event-driven logic for model lifecycle hooks

routes/ — Route definitions (web.php, auth.php, console.php)

database/ — Migrations, factories, seeders

Active Phase Objective
You have completed analyzing the codebase.
The current goal is to fully implement and optimize the Result Compiler Module before continuing with other features like CBT or attendance.

Phase 1 — Result Compiler Completion Plan
Milestone 1 — Database & Models
Ensure the results table migration is up to date.

Add/verify relationships in models:

Student ↔ Result

Subject ↔ Result

Classroom ↔ Result

Add necessary casts and accessors/mutators for computed fields (e.g., grades).

Milestone 2 — CRUD Functionality
Implement Create, Read, Update, Delete for results.

Use Form Request validation in app/Http/Requests/.

Role-based access control: Only authorized staff can manage results.

Milestone 3 — Grade Calculation & Report Cards
Implement grade calculation rules in a service class (configurable in config/).

Integrate ReportCardService.php for generating PDFs.

Ensure report cards pull correct term, subject, and student data.

Milestone 4 — Search, Filter & Pagination
Teachers should be able to search results by:

Student name

Subject

Class

Term

Implement server-side pagination.

Milestone 5 — Excel Import/Export
Use maatwebsite/excel for bulk result import/export.

Add data validation during import to prevent invalid records.

Milestone 6 — Testing & QA
Write unit tests for services (grade calculation, report generation).

Write feature tests for CRUD and export/import functionality.

Test role-based permissions.

Coding Standards & Architecture
Follow Service Layer pattern — keep business logic out of controllers.

Use Observers where appropriate for auto-updating related data.

Keep frontend integration consistent with Inertia.js + Tailwind.

Maintain code comments for complex logic.

Deliverables for this Phase
 Database & models updated and linked

 CRUD endpoints working with validation & permissions

 Grade calculation service complete

 PDF report card generation functional

 Search, filter, and pagination implemented

 Excel import/export working with validation

 Tests passing for all implemented features

Post-Phase Features (Do NOT Implement Yet)
CBT Module

Attendance Management

Fee Management
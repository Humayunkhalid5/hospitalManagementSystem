# Hospital Management System
NestJS + TypeORM + PostgreSQL API with a Bootstrap / vanilla ES-module frontend.

## Run
1. Create a database: `createdb hospital`
2. Backend: `cd backend && cp .env.example .env && npm install && npm run start:dev` (API at http://localhost:3000/api)
3. Frontend: serve `frontend/` over HTTP (ES modules need it), e.g. `npx serve frontend`.
4. Postman: import `postman/HMS.postman_collection.json`, run Register, then Login (stores the token), then the rest.

## Auth and roles
- The first registered user is `admin`; later users are `staff`.
- Every route needs a Bearer JWT except `/auth/*`. DELETE routes need `admin` (RolesGuard).

## Endpoints
`/auth/register`, `/auth/login`, and CRUD on `/patients`, `/doctors`, `/appointments`.
An appointment links one patient and one doctor; a doctor cannot be double-booked at the same time.

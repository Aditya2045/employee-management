# Employee Management System

Full-stack CRUD project:
- Backend: Java 17+, Spring Boot 3, Spring Web, Spring Data JPA/Hibernate, Validation, PostgreSQL, Maven
- Frontend: React + Vite + Axios
- API testing: Postman

## Prerequisites
Install JDK 17 or 21, PostgreSQL, Node.js LTS, and IntelliJ IDEA.

## 1. Create the database
In pgAdmin Query Tool, run:
```sql
CREATE DATABASE employee_db;
```

## 2. Configure the backend
Edit `backend/src/main/resources/application.properties` and set your PostgreSQL username/password.
Default settings use `postgres` and password placeholder `CHANGE_ME`.

## 3. Run backend
Open the `backend` folder in IntelliJ IDEA and wait for Maven dependencies to load.
Run `EmployeeManagementApplication.java`, or from a terminal:
- Windows: `mvnw.cmd spring-boot:run` (if Maven wrapper is present) or `mvn spring-boot:run`
- macOS/Linux: `./mvnw spring-boot:run` or `mvn spring-boot:run`

Backend: http://localhost:8080
Health check: http://localhost:8080/api/health

## 4. Run frontend
In a terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite, normally http://localhost:5173.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/employees` | List employees |
| GET | `/api/employees/{id}` | Get one employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Sample POST JSON
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "IT",
  "salary": 35000
}
```

## Features
- Employee CRUD
- React form and employee table
- Search by name, email, or department
- Server-side validation and helpful error responses
- Duplicate email handling
- PostgreSQL persistence via Spring Data JPA/Hibernate
- CORS for local Vite frontend

## Notes
- This is a learning project, not production-hardened. Before deployment, add authentication/authorization, migrations, automated tests, secrets management, and production CORS settings.
- Do not commit real database passwords to a public repository.

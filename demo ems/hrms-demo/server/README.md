# HRMS / EMS Backend

Production-grade REST API for the HRMS/EMS React frontend. Built with **Node.js + Express + MongoDB Atlas**.

---

## Setup

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your values:

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs — use a long random string in production |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |

### 3. Seed the database
```bash
npm run seed
```
This inserts all 15 employees from the frontend dummy data (password `password123` for everyone), plus sample attendance, leave, payroll, appraisal, and notification records.

**Seed login credentials:**
| Role | Email | Password |
|---|---|---|
| admin | vikram.nair@ems.com | password123 |
| hr | sneha.patel@ems.com | password123 |
| manager | priya.mehta@ems.com | password123 |
| teamlead | rohit.verma@ems.com | password123 |
| employee | arjun.sharma@ems.com | password123 |

### 4. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

---

## Connecting the React frontend

Replace the dummy-data imports and `AuthContext` in-memory logic with `fetch`/`axios` calls to these endpoints. The token returned by `/api/auth/login` should be stored (localStorage or cookie) and sent as `Authorization: Bearer <token>` on every subsequent request.

---

## Full Endpoint Reference

### Auth — `/api/auth`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/register` | Public | Create pending account |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Public | Clear cookie |
| GET | `/me` | Any | Get current user |
| GET | `/accounts/pending` | admin | List pending registrations |
| PUT | `/accounts/:id/approve` | admin | Approve registration |
| PUT | `/accounts/:id/reject` | admin | Reject registration |

### Employees — `/api/employees`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/` | hr, admin | All employees (paginated, filterable) |
| GET | `/me` | Any | Own profile |
| GET | `/team` | teamlead, manager, hr, admin | Scoped team list |
| GET | `/:id` | hr, admin | Employee by ID |
| POST | `/` | hr, admin | Create employee |
| PUT | `/:id` | hr, admin | Update employee |
| DELETE | `/:id` | hr, admin | Soft-deactivate employee |

### Attendance — `/api/attendance`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/check-in` | Any | Check in today |
| POST | `/check-out` | Any | Check out today |
| GET | `/me?month=YYYY-MM` | Any | Own attendance log |
| GET | `/summary/:employeeId?month=YYYY-MM` | Any | Attendance summary |
| GET | `/today` | teamlead, manager, hr, admin | Team today status |
| GET | `/team?date=YYYY-MM-DD` | teamlead, manager, hr, admin | Team attendance (scoped) |

### Leave — `/api/leave`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/apply` | Any | Apply for leave |
| GET | `/me` | Any | Own leave history |
| GET | `/balance` | Any | Leave balance for current year |
| GET | `/pending-approvals` | teamlead, manager, hr, admin | Pending leave requests (scoped) |
| PUT | `/:id/approve` | teamlead, manager, hr, admin | Approve leave |
| PUT | `/:id/reject` | teamlead, manager, hr, admin | Reject leave |
| GET | `/calendar?month=MM&year=YYYY` | hr, admin | Org-wide leave calendar |

### Payroll — `/api/payroll`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/payslips/me` | Any | Own payslips |
| GET | `/payslips/:id` | Any (own only for employee) | Payslip by ID |
| GET | `/all` | hr, admin | All payroll records |
| POST | `/process` | admin | Generate payroll for a month |
| PUT | `/:id/status` | admin | Update payroll status |

### Appraisal — `/api/appraisal`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/cycle-status` | Any | Current appraisal cycle info |
| GET | `/me` | Any | Own current appraisal |
| GET | `/history` | Any | Own completed appraisal history |
| POST | `/self-assessment` | Any | Submit self-assessment |
| GET | `/team` | teamlead, manager, hr, admin | Team appraisals (scoped) |
| POST | `/:id/manager-review` | teamlead, manager, hr, admin | Submit manager review |

### Notifications — `/api/notifications`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/me` | Any | Own notifications |
| PUT | `/:id/read` | Any | Mark one as read |
| PUT | `/read-all` | Any | Mark all as read |

### Analytics — `/api/analytics`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/headcount-by-dept` | hr, admin | Headcount grouped by department |
| GET | `/attrition-trend?year=YYYY` | hr, admin | Monthly attrition trend |
| GET | `/leave-trend?year=YYYY` | hr, admin | Monthly leave trend (Casual/Sick/Earned) |
| GET | `/org-stats` | hr, admin | High-level org statistics |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |

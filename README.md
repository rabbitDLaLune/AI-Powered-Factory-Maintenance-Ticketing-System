# AI-Powered Factory Maintenance Ticketing System

An AI-powered maintenance management system designed for manufacturing environments. The system helps manage machine breakdown tickets, technician assignments, repair status, downtime tracking, root cause records, and maintenance analytics.

It includes AI-assisted features such as ticket priority suggestion, possible root cause analysis, recommended maintenance actions, and estimated repair time to support faster and more organized maintenance operations.

## Features

### Machine Management

- Register factory machines
- Store machine code, name, location, type, and status
- Track machine condition such as Running, Down, or Maintenance

### Technician Management

- Register maintenance technicians
- Store technician contact details
- Assign technicians based on skill area

### Maintenance Ticket Management

- Create machine breakdown tickets
- Assign or change technician
- Track ticket status:
  - Open
  - In Progress
  - Completed
  - Cancelled
- View ticket details
- Complete tickets with repair findings
- Record final root cause
- Record action taken
- Record spare parts used
- Record downtime start and end time

### AI-Assisted Maintenance Logic

- Suggest ticket priority based on issue description
- Suggest possible root cause
- Recommend maintenance action
- Estimate repair hours

Example:

```text
Issue: Machine overheating with burning smell

AI Suggested Priority: Critical
Possible Root Cause: Motor overload, cooling fan failure, blocked ventilation, or electrical fault
Recommended Action: Stop the machine, inspect motor temperature, check cooling fan, clean ventilation area, and verify electrical load
Estimated Repair Time: 2.5 hours
```

### Dashboard Analytics

- Total machines
- Machines down
- Open tickets
- In-progress tickets
- Critical tickets
- Completed tickets
- Average estimated repair time
- Ticket status breakdown
- Priority distribution
- Machine condition summary
- Recent critical tickets

### Search, Filter, and Pagination

- Search tickets by ticket number, issue title, category, or description
- Filter tickets by status
- Filter tickets by priority
- Reset filters
- Paginated ticket table with selectable rows per page

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- PyMySQL
- Pydantic
- Uvicorn

### Database

- MySQL

### AI Logic

- Rule-based AI maintenance engine
- Priority prediction logic
- Root cause suggestion logic
- Recommended action logic
- Estimated repair time logic

## Project Structure

```text
factory-maintenance-ai-system/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── priority_engine.py
│   │   │   └── root_cause_engine.py
│   │   ├── routes/
│   │   │   ├── dashboard_routes.py
│   │   │   ├── machine_routes.py
│   │   │   ├── technician_routes.py
│   │   │   └── ticket_routes.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts
│   │   ├── components/
│   │   │   ├── Pagination.tsx
│   │   │   └── TicketsTable.tsx
│   │   ├── constants/
│   │   │   └── ticketStyles.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
├── LICENSE
└── .gitignore
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Python 3.10 or above
- Node.js
- MySQL Server
- Git

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=factory_maintenance_ai
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=change_this_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
```

Create the MySQL database:

```sql
CREATE DATABASE factory_maintenance_ai;
```

Run the backend:

```bash
python -m uvicorn app.main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Running the Full System Locally

Open two terminals.

Terminal 1: Backend

```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

## API Endpoints

### Machine Endpoints

```text
GET    /api/machines/
POST   /api/machines/
```

### Technician Endpoints

```text
GET    /api/technicians/
POST   /api/technicians/
```

### Ticket Endpoints

```text
GET    /api/tickets/
GET    /api/tickets/{ticket_id}
POST   /api/tickets/
PATCH  /api/tickets/{ticket_id}/status
PATCH  /api/tickets/{ticket_id}/assign
PATCH  /api/tickets/{ticket_id}/complete
```

### Dashboard Endpoint

```text
GET    /api/dashboard/summary
```

## Sample Workflow

1. Register a machine
2. Register a technician
3. Create a maintenance ticket
4. AI suggests priority, possible root cause, recommended action, and repair time
5. Assign a technician
6. Start the ticket
7. Complete the ticket with final root cause and repair action
8. Dashboard analytics update automatically

## Sample Data

You can manually add sample machines, technicians, and tickets through the frontend or API documentation.

Suggested sample ticket issues:

- Machine overheating
- Abnormal vibration
- Hydraulic oil leakage
- Sensor not detecting product
- Conveyor jammed
- Electrical trip during operation
- Air pressure low
- Machine running slow
- Robot arm position error

## Future Improvements

- User authentication with JWT
- Admin and technician roles
- Edit and delete functions
- Ticket cancellation workflow
- Report export to Excel or PDF
- Real machine learning model using Scikit-learn
- Predictive maintenance risk scoring
- Technician performance report
- Machine downtime report
- Deployment for online portfolio demo

## Portfolio Highlight

This project demonstrates:

- Full-stack development
- REST API development
- MySQL database design
- React and TypeScript frontend development
- FastAPI backend development
- Dashboard analytics
- AI-assisted logic implementation
- Manufacturing digitalisation use case
- Practical software engineering workflow

## Author

Designed and developed by **Khairulnizam**.

## License

This project is licensed under the MIT License.

You are allowed to use, modify, and distribute this project, but the original copyright notice and author credit must be included.

Designed and developed by Khairulnizam.

# **Student Management System**

A comprehensive **Student Management System** built using **Django**, designed to manage student information, including enrollment, attendance, grades, and other administrative functionalities. This application is ideal for schools or educational institutions looking for a streamlined solution to manage student data.

## **Technologies Used**

### Core Stack

### Core Technologies
![React](https://img.shields.io/badge/React-18181B?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-18181B?style=for-the-badge&logo=typescript)
![Django](https://img.shields.io/badge/Django-18181B?style=for-the-badge&logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18181B?style=for-the-badge&logo=postgresql)
![Python](https://img.shields.io/badge/Language-Python-3776AB?style=for-the-badge&logo=python)

### Infrastructure & Deployment

![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-000000?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Nginx](https://img.shields.io/badge/Web_Server-Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Development & API

![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/API-Django_REST_Framework-A30000?style=for-the-badge)
![Git](https://img.shields.io/badge/Version_Control-Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/Repository-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

## **Table of Contents**
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-with-docker-production)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## **Features**
- **Student Enrollment**: Manage student registration and update student details.
- **Attendance Management**: Track and monitor student attendance.
- **Gradebook**: Record, view, and modify students' grades.
- **Role-Based Access Control**: Admin, teachers, and students have different access rights.
- **Class Management**: Create and manage class schedules.
- **Reports**: Generate reports for student progress, attendance, and performance.
- **Responsive UI**: Mobile-friendly design using HTML/CSS or integrated frontend frameworks.


## **Project Structure**
```
student_management_system/
│
├── manage.py               # Django project manager script
├── requirements.txt        # Project dependencies
├── .env                    # Environment variables (add in .gitignore)
├── student_management/     # Main app containing settings, URLs, WSGI
├── students/               # App managing student-related functionalities
├── teachers/               # App managing teacher-related functionalities
├── classes/                # App managing class schedules and attendance
└── templates/              # HTML templates
```

## **Installation**
Follow the steps below to get the project up and running on your local machine:

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/student-management-system.git
cd student-management-system
```

### **2. Create a Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **4. Set Up Database**
Make sure to set up your database (e.g., PostgreSQL) and update the `DATABASES` configuration in `student_management/settings.py`.

### **5. Run Migrations**
```bash
python manage.py migrate
```

### **6. Create Superuser**
```bash
python manage.py createsuperuser
```

### **7. Run the Application**
```bash
python manage.py runserver
```
Visit `http://localhost:8000` to access the app.

## **Configuration**
You'll need a `.env` file for environment-specific configurations. Example:

```bash
DEBUG=True
SECRET_KEY='your_secret_key'
DATABASE_URL=postgres://user:password@localhost:5432/your_db_name
```

Make sure to configure settings like database, static files, and email backend properly for production.

## **Running with Docker (Production)**

```bash
# Build with VITE_API_URL pointing to your domain (or omit for same-origin)
docker compose build --build-arg VITE_API_URL=https://yourdomain.com

# Start all services
docker compose up -d

# Run migrations manually if entrypoint migration is disabled
docker compose exec backend python manage.py migrate --noinput
```

Services: PostgreSQL, Redis, Django (daphne ASGI), frontend (Nginx).
The entrypoint script waits for PostgreSQL, runs migrations, then starts daphne.

## **Screenshots**

The following screenshots show the deployed EduSphere role-based portals. Dashboard information is loaded from the backend database through the production API rather than static frontend records.

### **Director Dashboard**

**Screenshot:** `screenshots/director-dashboard.png`

![EduSphere Director Dashboard](screenshots/director-dashboard.png)

The Director portal provides institution-level oversight, including Admin Management, Staff Management, and Director Profile functionality.

---

### **Administrator Dashboard**

**Screenshot:** `screenshots/admin-dashboard.png`

![EduSphere Administrator Dashboard](screenshots/admin-dashboard.png)

The Administrator portal provides academic and administrative management functionality, including students, teachers, classes, attendance, examinations, results, fees, notifications, events, and audit logs.

---

### **Staff Dashboard**

**Screenshot:** `screenshots/staff-dashboard.png`

![EduSphere Staff Dashboard](screenshots/staff-dashboard.png)

The Staff portal supports operational workflows such as answer-script processing, upload management, student account creation, teacher account creation, and staff profile access.

---

### **Teacher Dashboard**

**Screenshot:** `screenshots/teacher-dashboard.png`

> **Teacher account setup:** Teacher accounts must first be created/provisioned through the authorized **Staff/Admin portal** before the teacher can sign in to the Teacher portal.

![EduSphere Teacher Dashboard](screenshots/teacher-dashboard.png)

The Teacher dashboard displays the teacher's assigned academic data, including assigned subjects, classes, students, assignments, attendance, examinations, timetable, resources, rechecking, and notifications.

> **Database note:** The displayed teacher, class, subject, and student information is fetched directly from the backend database through the deployed API. The screenshot currently shows the provisioned validation records, which is why only one teacher/class/student relationship is visible.

---

### **Student Dashboard**

**Screenshot:** `screenshots/student-dashboard.png`

> **Student account setup:** Student accounts must first be created/provisioned through the authorized **Staff/Admin portal** before the student can sign in to the Student portal.

![EduSphere Student Dashboard](screenshots/student-dashboard.png)

The Student portal provides access to subjects, assignments, attendance, examination schedules, results, rechecking, fees, timetable, and profile information.

> **Database note:** Student academic records shown here are fetched directly from the backend database through the deployed API. The screenshots currently reflect the provisioned validation data, which is why only the currently configured credential/account records are represented.


## **Testing**
You can run the unit tests with Django's built-in testing framework:

```bash
python manage.py test
```

This will run all the tests located in the `tests.py` files of your Django apps.

## **Deferred / Future Work**

| Feature | Status |
|---------|--------|
| OCR auto-extraction (answer scripts) | Models/views exist, not integrated |
| Real-time analytics charts | Placeholder only |
| Salary module | Stub export only |
| Student CSV bulk import | CSV exists, no endpoint |
| Contact export CSV/Excel parity | Untested |
| Public admission submission | Admin-only; needs public endpoint |
| Multi-replica deployment | Entrypoint assumes single replica |

## **Contributing**
If you want to contribute to this project, please follow the steps below:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add a new feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a pull request.

## **License**
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



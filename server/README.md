
School Bus Tracker Server (Options A + B included)

How to run:
1. Install dependencies:
   npm install

2. Create DB and seed default admin:
   npm run migrate

3. Start server:
   npm run dev

Default admin created (if missing): admin / admin123
Swagger UI available at: http://localhost:4000/api/docs

Notes:
- Protected endpoints require Authorization: Bearer <token> from /api/auth/login
- Notifications use nodemailer and environment SMTP settings

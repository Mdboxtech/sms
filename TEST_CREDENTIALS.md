# Test Credentials for SMS Application

## Available Test Users

### Administrator
- **Email:** admin@example.com
- **Password:** password
- **Role:** Admin (Full access to all features)
- **Dashboard:** `/admin/dashboard`

### Teachers
- **Email:** teacher@example.com
- **Password:** password
- **Role:** Teacher (Can manage results for assigned subjects/classes)
- **Dashboard:** `/teacher/dashboard`

Additional Teachers:
- jsmith@example.com (password)
- rwilson@example.com (password)

### Students
- **Email:** student1@example.com
- **Password:** password
- **Role:** Student (Can view own results and report cards)
- **Dashboard:** `/student/dashboard`

Additional Students:
- student2@example.com (password)
- student3@example.com (password)
- student4@example.com (password)
- student5@example.com (password)

## Testing the Login Flow

1. Visit: http://127.0.0.1:8000
2. Click "Log in" 
3. Use any of the credentials above
4. After login, you should be redirected to the appropriate dashboard based on your role
5. Test logout - you should be redirected back to the home page

## Key Features to Test

### Admin Features
- Manage classrooms, subjects, students, teachers
- View all results and analytics
- Generate reports for any student/class
- Bulk operations

### Teacher Features  
- Enter results for assigned subjects and classes
- View results for their students
- Generate report cards for their classes

### Student Features
- View own results by term/subject
- View and download report cards
- View academic progress

## Result Compiler Module

The Result Compiler is fully implemented with:
- CRUD operations for results
- Role-based access control
- Grade calculation and statistics
- Report card generation (PDF)
- Excel import/export functionality
- Search and filtering capabilities

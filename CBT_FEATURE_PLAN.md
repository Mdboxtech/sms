# CBT (Computer-Based Testing) Feature Plan
## School Management System - Comprehensive CBT Module

### 🎯 **Feature Overview**
A complete Computer-Based Testing system where:
- **Teachers** create and manage questions/exams
- **Admins** schedule exams and create timetables
- **Students** take exams online with real-time monitoring
- **System** provides automated grading and analytics

---

## 📋 **Phase 1: Database Design & Models**

### New Tables Required:

#### 1. **Questions Table**
```sql
- id (primary)
- subject_id (foreign key)
- teacher_id (foreign key)
- question_text (text)
- question_type (enum: multiple_choice, true_false, essay, fill_blank)
- difficulty_level (enum: easy, medium, hard)
- marks (integer)
- time_limit (integer - seconds)
- options (json - for multiple choice)
- correct_answer (text)
- explanation (text - optional)
- is_active (boolean)
- created_at, updated_at
```

#### 2. **Exams Table**
```sql
- id (primary)
- title (string)
- subject_id (foreign key)
- teacher_id (foreign key)
- description (text)
- exam_type (enum: quiz, test, exam, assignment)
- total_marks (integer)
- duration (integer - minutes)
- instructions (text)
- is_published (boolean)
- created_at, updated_at
```

#### 3. **Exam Questions Table** (Pivot)
```sql
- id (primary)
- exam_id (foreign key)
- question_id (foreign key)
- question_order (integer)
- marks_allocated (integer)
```

#### 4. **Exam Schedules Table**
```sql
- id (primary)
- exam_id (foreign key)
- classroom_id (foreign key)
- term_id (foreign key)
- scheduled_date (date)
- start_time (time)
- end_time (time)
- status (enum: scheduled, ongoing, completed, cancelled)
- created_by (foreign key - admin user)
- created_at, updated_at
```

#### 5. **Student Exam Attempts Table**
```sql
- id (primary)
- exam_schedule_id (foreign key)
- student_id (foreign key)
- start_time (timestamp)
- end_time (timestamp)
- status (enum: not_started, in_progress, completed, submitted, auto_submitted)
- total_score (decimal)
- percentage (decimal)
- time_taken (integer - seconds)
- ip_address (string)
- user_agent (text)
- created_at, updated_at
```

#### 6. **Student Answers Table**
```sql
- id (primary)
- attempt_id (foreign key)
- question_id (foreign key)
- answer_text (text)
- is_correct (boolean)
- marks_obtained (decimal)
- time_spent (integer - seconds)
- created_at, updated_at
```

#### 7. **Exam Timetable Table**
```sql
- id (primary)
- classroom_id (foreign key)
- term_id (foreign key)
- exam_date (date)
- title (string)
- description (text)
- created_by (foreign key - admin user)
- created_at, updated_at
```

#### 8. **Timetable Exams Table** (Pivot)
```sql
- id (primary)
- timetable_id (foreign key)
- exam_schedule_id (foreign key)
- time_slot (string)
- duration (integer)
```

---

## 🏗️ **Phase 2: Models & Relationships**

### Model Relationships:

#### **Question Model**
- belongsTo: Subject, Teacher (User)
- belongsToMany: Exams (through exam_questions)
- hasMany: StudentAnswers

#### **Exam Model**
- belongsTo: Subject, Teacher (User)
- belongsToMany: Questions (through exam_questions)
- hasMany: ExamSchedules, StudentExamAttempts

#### **ExamSchedule Model**
- belongsTo: Exam, Classroom, Term, CreatedBy (User)
- hasMany: StudentExamAttempts
- belongsToMany: ExamTimetables (through timetable_exams)

#### **StudentExamAttempt Model**
- belongsTo: ExamSchedule, Student
- hasMany: StudentAnswers

#### **ExamTimetable Model**
- belongsTo: Classroom, Term, CreatedBy (User)
- belongsToMany: ExamSchedules (through timetable_exams)

---

## 🎨 **Phase 3: User Interfaces & Controllers**

### **Teacher Dashboard:**
1. **Question Bank Management**
   - Create/Edit/Delete questions
   - Import questions from Excel
   - Question categorization by subject/difficulty
   - Preview questions

2. **Exam Creation**
   - Build exams from question bank
   - Set exam duration and instructions
   - Configure marking scheme
   - Publish/Unpublish exams

3. **Exam Analytics**
   - View student performance
   - Question-wise analysis
   - Export results

### **Admin Dashboard:**
1. **Exam Scheduling**
   - Schedule exams for classes
   - Set date, time, and duration
   - Assign exam centers/rooms

2. **Timetable Management**
   - Create exam timetables
   - Assign multiple exams per day
   - Class-wise scheduling
   - Publish timetables to students

3. **System Monitoring**
   - Real-time exam monitoring
   - Student progress tracking
   - System performance metrics

### **Student Portal:**
1. **Exam Dashboard**
   - View scheduled exams
   - Exam timetable
   - Results and feedback

2. **Exam Interface**
   - Clean, distraction-free interface
   - Question navigation
   - Timer and progress tracking
   - Auto-save functionality

---

## ⚙️ **Phase 4: Core Services**

### **CBTService**
- Exam creation and management
- Question bank operations
- Scheduling logic

### **ExamTakingService**
- Exam session management
- Answer submission
- Time tracking
- Auto-submission

### **GradingService**
- Automatic grading for objective questions
- Manual grading interface for essays
- Grade calculation and analytics

### **TimetableService**
- Timetable creation and management
- Conflict detection
- Notification system

---

## 🔒 **Phase 5: Security & Anti-Cheating**

### **Security Features:**
1. **Browser Restrictions**
   - Fullscreen mode enforcement
   - Disable right-click, copy-paste
   - Tab switching detection

2. **Session Management**
   - Secure exam sessions
   - IP address tracking
   - Device fingerprinting

3. **Time Management**
   - Server-side time validation
   - Auto-submission on timeout
   - Time synchronization

4. **Question Randomization**
   - Random question order
   - Random option order
   - Question pool selection

---

## 📊 **Phase 6: Analytics & Reporting**

### **Reports Available:**
1. **Student Reports**
   - Individual performance
   - Subject-wise analysis
   - Progress tracking

2. **Class Reports**
   - Class performance overview
   - Comparative analysis
   - Improvement areas

3. **Question Analytics**
   - Question difficulty analysis
   - Success rates
   - Time spent per question

---

## 🚀 **Implementation Timeline**

### **Week 1: Database & Models**
- Create migrations
- Build models with relationships
- Set up factories and seeders

### **Week 2: Teacher Features**
- Question bank management
- Exam creation interface
- Basic CRUD operations

### **Week 3: Admin Features**
- Exam scheduling
- Timetable management
- Dashboard analytics

### **Week 4: Student Interface**
- Exam taking interface
- Real-time features
- Security implementations

### **Week 5: Testing & Optimization**
- Comprehensive testing
- Performance optimization
- Security validation

---

## 📱 **Technology Stack**

### **Frontend:**
- React with Inertia.js
- Tailwind CSS for styling
- Real-time updates with WebSockets
- Progressive Web App features

### **Backend:**
- Laravel 11 with robust APIs
- Queue system for heavy operations
- Redis for session management
- WebSocket server for real-time features

### **Security:**
- JWT tokens for exam sessions
- Rate limiting
- CSRF protection
- SQL injection prevention

---

## 🎯 **Success Metrics**

1. **User Experience**
   - Intuitive interface for all user types
   - Fast loading times (< 2 seconds)
   - 99.9% uptime during exams

2. **Security**
   - Zero security breaches
   - Minimal cheating incidents
   - Secure data handling

3. **Performance**
   - Support for 500+ concurrent users
   - Real-time synchronization
   - Automated backup systems

---

This comprehensive CBT system will provide a world-class online examination experience with robust security, detailed analytics, and seamless user experience for all stakeholders.

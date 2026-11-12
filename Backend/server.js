// Import required Node.js modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the Express application
const app = express();
const PORT = 3000;

// Middleware to automatically parse incoming JSON data from frontend requests
app.use(express.json());

// Serve static frontend files (HTML, CSS, client-side JS) from the public folder
app.use(express.static(path.join(__dirname, '../Frontend/public')));

// Connect to the SQLite database file (it will create it automatically if it doesn't exist)
const dbPath = path.resolve(__dirname, 'student_database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Automatically create the Students table if it doesn't exist yet
        db.run(`CREATE TABLE IF NOT EXISTS Students (
            StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName VARCHAR(50) NOT NULL,
            LastName VARCHAR(50) NOT NULL,
            EMAIL VARCHAR(155) UNIQUE NOT NULL
        )`);

        // Automatically create the Instructors table if it doesn't exist yet
        db.run(`CREATE TABLE IF NOT EXISTS Instructors (
            InstructorID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName VARCHAR(50) NOT NULL,
            LastName VARCHAR(50) NOT NULL,
            Email VARCHAR(155) UNIQUE NOT NULL,
            Department VARCHAR(50) NOT NULL
        )`);

        // Automatically create the Courses table if it doesn't exist yet
        db.run(`CREATE TABLE IF NOT EXISTS Courses (
            CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseCode VARCHAR(10) UNIQUE NOT NULL,
            Credits INTEGER NOT NULL
        )`);

        // Automatically create the Enrollments junction table if it doesn't exist yet
        db.run(`CREATE TABLE IF NOT EXISTS Enrollments (
            EnrollmentID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER,
            CourseID INTEGER,
            RegistrationDate TEXT,
            FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
        )`);
    }
});

// Regular expressions and helper function for input validation
const nameRegex = /^[A-Za-z\s'-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePersonInput(firstName, lastName, email) {
    if (!firstName || !lastName || !email) return "First Name, Last Name, and Email are required.";
    if (!nameRegex.test(firstName.trim())) return "First Name must contain letters only.";
    if (!nameRegex.test(lastName.trim())) return "Last Name must contain letters only.";
    if (!emailRegex.test(email.trim())) return "Please provide a valid email address.";
    return null;
}

// ==========================================
//              STUDENTS ROUTES
// ==========================================

// 1. GET ALL Students (Read / Show All)
app.get('/api/students', (req, res) => {
    db.all(`SELECT * FROM Students`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ students: rows });
    });
});

// 2. INSERT a new Student
app.post('/api/students', (req, res) => {
    const { firstName, lastName, email } = req.body;
    const error = validatePersonInput(firstName, lastName, email);
    if (error) return res.status(400).json({ error });

    const query = `INSERT INTO Students (FirstName, LastName, EMAIL) VALUES (?, ?, ?)`;
    db.run(query, [firstName.trim(), lastName.trim(), email.trim()], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Student added successfully!', studentId: this.lastID });
    });
});

// 3. UPDATE an existing Student
app.put('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    const { firstName, lastName, email } = req.body;
    const fields = [];
    const values = [];

    // SQL Queries
    if (firstName && firstName.trim() !== '') {
        if (!nameRegex.test(firstName.trim())) return res.status(400).json({ error: "First Name must contain letters only." });
        fields.push("FirstName = ?");
        values.push(firstName.trim());
    }
    if (lastName && lastName.trim() !== '') {
        if (!nameRegex.test(lastName.trim())) return res.status(400).json({ error: "Last Name must contain letters only." });
        fields.push("LastName = ?");
        values.push(lastName.trim());
    }
    if (email && email.trim() !== '') {
        if (!emailRegex.test(email.trim())) return res.status(400).json({ error: "Please provide a valid email address." });
        fields.push("EMAIL = ?");
        values.push(email.trim());
    }

    if (fields.length === 0) return res.status(400).json({ error: "Please provide at least one field to update." });

    values.push(studentId);
    const query = `UPDATE Students SET ${fields.join(', ')} WHERE StudentID = ?`;

    db.run(query, values, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No student found with ID ${studentId}.` });
        res.json({ message: `Student ID ${studentId} updated successfully!` });
    });
});

// 4. DELETE a Student by ID
app.delete('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    db.run(`DELETE FROM Students WHERE StudentID = ?`, studentId, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No student found with ID ${studentId}.` });
        res.json({ message: `Student ID ${studentId} deleted successfully!` });
    });
});

// ==========================================
//            INSTRUCTORS ROUTES
// ==========================================

// 1. GET ALL Instructors
app.get('/api/instructors', (req, res) => {
    db.all(`SELECT * FROM Instructors`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ instructors: rows });
    });
});

// 2. INSERT a new Instructor
app.post('/api/instructors', (req, res) => {
    const { firstName, lastName, email, department } = req.body;
    const error = validatePersonInput(firstName, lastName, email);
    if (error) return res.status(400).json({ error });

    if (!department || department.trim() === '') {
        return res.status(400).json({ error: "Department is required." });
    }

    const query = `INSERT INTO Instructors (FirstName, LastName, Email, Department) VALUES (?, ?, ?, ?)`;
    db.run(query, [firstName.trim(), lastName.trim(), email.trim(), department.trim()], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Instructor added successfully!', instructorId: this.lastID });
    });
});

// 3. UPDATE an existing Instructor
app.put('/api/instructors/:id', (req, res) => {
    const instructorId = req.params.id;
    const { firstName, lastName, email, department } = req.body;
    const fields = [];
    const values = [];

    if (firstName && firstName.trim() !== '') {
        if (!nameRegex.test(firstName.trim())) return res.status(400).json({ error: "First Name must contain letters only." });
        fields.push("FirstName = ?");
        values.push(firstName.trim());
    }
    if (lastName && lastName.trim() !== '') {
        if (!nameRegex.test(lastName.trim())) return res.status(400).json({ error: "Last Name must contain letters only." });
        fields.push("LastName = ?");
        values.push(lastName.trim());
    }
    if (email && email.trim() !== '') {
        if (!emailRegex.test(email.trim())) return res.status(400).json({ error: "Please provide a valid email address." });
        fields.push("Email = ?");
        values.push(email.trim());
    }
    if (department && department.trim() !== '') {
        fields.push("Department = ?");
        values.push(department.trim());
    }

    if (fields.length === 0) return res.status(400).json({ error: "Please provide at least one field to update." });

    values.push(instructorId);
    const query = `UPDATE Instructors SET ${fields.join(', ')} WHERE InstructorID = ?`;

    db.run(query, values, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No instructor found with ID ${instructorId}.` });
        res.json({ message: `Instructor ID ${instructorId} updated successfully!` });
    });
});

// 4. DELETE an Instructor by ID
app.delete('/api/instructors/:id', (req, res) => {
    const instructorId = req.params.id;
    db.run(`DELETE FROM Instructors WHERE InstructorID = ?`, instructorId, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No instructor found with ID ${instructorId}.` });
        res.json({ message: `Instructor ID ${instructorId} deleted successfully!` });
    });
});

// ==========================================
//              COURSES ROUTES
// ==========================================

// 1. GET ALL Courses
app.get('/api/courses', (req, res) => {
    db.all(`SELECT * FROM Courses`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ courses: rows });
    });
});

// 2. INSERT a new Course
app.post('/api/courses', (req, res) => {
    const { courseCode, credits } = req.body;

    if (!courseCode || !credits) {
        return res.status(400).json({ error: "Course Code and Credits are required." });
    }

    const query = `INSERT INTO Courses (CourseCode, Credits) VALUES (?, ?)`;
    db.run(query, [courseCode.trim().toUpperCase(), parseInt(credits)], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Course added successfully!', courseId: this.lastID });
    });
});

// ==========================================
//             ENROLLMENTS ROUTES
// ==========================================

// 1. GET ALL Enrollments (Joins Students and Courses tables to display the names)
app.get('/api/enrollments', (req, res) => {
    const query = `
        SELECT Enrollments.EnrollmentID, 
               Students.StudentID, Students.FirstName, Students.LastName, 
               Courses.CourseID, Courses.CourseCode, 
               Enrollments.RegistrationDate
        FROM Enrollments
        JOIN Students ON Enrollments.StudentID = Students.StudentID
        JOIN Courses ON Enrollments.CourseID = Courses.CourseID
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ enrollments: rows });
    });
});

// 2. INSERT a new Enrollment (Enroll a Student in a Course)
app.post('/api/enrollments', (req, res) => {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ error: "Student ID and Course ID are required." });
    }

    // Automatically get today's date in YYYY-MM-DD format
    const registrationDate = new Date().toISOString().split('T')[0];

    const query = `INSERT INTO Enrollments (StudentID, CourseID, RegistrationDate) VALUES (?, ?, ?)`;
    db.run(query, [studentId, courseId, registrationDate], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Student enrolled successfully!', enrollmentId: this.lastID });
    });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
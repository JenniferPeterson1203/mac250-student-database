-- 1. SEED PARENT TABLE: Instructors (Adding 3 more to reach 5 total)
INSERT INTO Instructors (FirstName, LastName, Email, Department)
VALUES 
    ('Jennifer', 'Peterson', 'jepeterson@lagcc.cuny.edu', 'Computer Science'),
    ('Aaliyah', 'Stewart', 'aStewart@lagcc.cuny.edu', 'Mathematics'),
    ('Jermany', 'Colon', 'jcolon@lagcc.cuny.edu', 'Electrical Engineering');

-- 2. SEED PARENT TABLE: Students (5 rows minimum)
INSERT INTO Students (FirstName, LastName, EMAIL)
VALUES 
    ('Maya', 'Angelou', 'mangelou@lagcc.cuny.edu'),
    ('Marcus', 'Garvey', 'mgarvey@lagcc.cuny.edu'),
    ('Malcolm', 'Little', 'mlittle@lagcc.cuny.edu'),
    ('Angela', 'Davis', 'adavis@lagcc.cuny.edu'),
    ('Audre', 'Lorde', 'alorde@lagcc.cuny.edu');

-- 3. SEED PARENT TABLE: Courses (5 rows minimum)
INSERT INTO Courses (CourseID, CourseCode, Credits)
VALUES 
    (101, 'MAC101', 3),
    (125, 'MAC125', 3),
    (250, 'MAC250', 3),
    (201, 'MAT201', 4),
    (115, 'MAT115', 3);

-- 4. SEED CHILD / JUNCTION TABLE: Enrollments (15 rows minimum)
INSERT INTO Enrollments (StudentID, CourseID, RegistrationDate)
VALUES 
    (1, 101, '2026-08-25'),
    (1, 125, '2026-08-25'),
    (1, 250, '2026-08-26'),
    (1, 201, '2026-08-26'),
    (2, 101, '2026-08-27'),
    (2, 115, '2026-08-27'),
    (2, 125, '2026-08-28'),
    (3, 201, '2026-08-28'),
    (3, 250, '2026-08-29'),
    (3, 115, '2026-08-29'),
    (4, 101, '2026-08-30'),
    (4, 125, '2026-08-30'),
    (4, 201, '2026-08-30'),
    (5, 250, '2026-08-31'),
    (5, 115, '2026-08-31');
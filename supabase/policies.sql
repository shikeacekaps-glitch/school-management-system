-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;

-- ========== CLASSES POLICIES ==========
-- Teachers can view only their own classes
CREATE POLICY "Teachers can view their own classes" ON classes
  FOR SELECT USING (
    auth.uid() = teacher_id
  );

-- Students can view classes they're enrolled in
CREATE POLICY "Students can view their enrolled classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.class_id = classes.id 
      AND enrollments.student_id = auth.uid()
    )
  );

-- Parents can view classes their children are enrolled in
CREATE POLICY "Parents can view their children's classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.class_id = classes.id 
      AND enrollments.student_id IN (
        SELECT student_id FROM parent_student 
        WHERE parent_id = auth.uid()
      )
    )
  );

-- Admins can view all classes
CREATE POLICY "Admins can view all classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ========== ENROLLMENTS POLICIES ==========
-- Teachers can view enrollments in their classes
CREATE POLICY "Teachers can view their class enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = enrollments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Students can view their own enrollments
CREATE POLICY "Students can view their enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- ========== GRADES POLICIES ==========
-- Teachers can view grades in their classes
CREATE POLICY "Teachers can manage class grades" ON grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = grades.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Students can view their own grades
CREATE POLICY "Students can view their grades" ON grades
  FOR SELECT USING (auth.uid() = student_id);

-- Parents can view their children's grades
CREATE POLICY "Parents can view their children's grades" ON grades
  FOR SELECT USING (
    grades.student_id IN (
      SELECT student_id FROM parent_student 
      WHERE parent_id = auth.uid()
    )
  );
/**
 * Default Domain Data Specification for Student Management & Attendance
 * Default Class: DAIML (Data Science & Artificial Intelligence / Machine Learning)
 */

export const INITIAL_CLASSES = [
  {
    id: 'daiml',
    code: 'DAIML',
    name: 'Data Science & AI / Machine Learning',
    department: 'Computer Science & AI',
    semester: 'Year II • Semester 4',
    isArchived: false,
    subjects: [
      {
        id: 'em-ai',
        code: 'EM for AI',
        name: 'Engineering Mathematics for AI',
        hasTheory: true,
        hasLab: false,
        credits: 4,
        description: 'Linear algebra, multivariate calculus, probabilistic foundations'
      },
      {
        id: 'python',
        code: 'Python',
        name: 'Python for Scientific Computing & ML',
        hasTheory: true,
        hasLab: true,
        credits: 4,
        description: 'NumPy, Pandas, Scikit-Learn, PyTorch tensor fundamentals'
      },
      {
        id: 'cpp',
        code: 'C++',
        name: 'Advanced C++ & Systems Architecture',
        hasTheory: true,
        hasLab: true,
        credits: 4,
        description: 'Memory management, templates, STL, performance optimization'
      },
      {
        id: 'dbms',
        code: 'DBMS',
        name: 'Database Management Systems & Vector Search',
        hasTheory: true,
        hasLab: true,
        credits: 4,
        description: 'Relational algebra, SQL indexing, ACID transactions, PostgreSQL'
      },
      {
        id: 'mc-es',
        code: 'MC & ES',
        name: 'Microcontrollers & Embedded Systems',
        hasTheory: true,
        hasLab: true,
        credits: 4,
        description: 'ARM Cortex-M/A architectures, GPIO, I2C, SPI, edge deployment'
      }
    ]
  },
  {
    id: 'ece-iot',
    code: 'ECE-IOT',
    name: 'Embedded Systems & Internet of Things',
    department: 'Electronics & Communication',
    semester: 'Year II • Semester 4',
    isArchived: false,
    subjects: [
      {
        id: 'iot-proto',
        code: 'IoT Protocols',
        name: 'Wireless Sensor Networks & MQTT',
        hasTheory: true,
        hasLab: true,
        credits: 4
      },
      {
        id: 'dsp',
        code: 'DSP',
        name: 'Digital Signal Processing',
        hasTheory: true,
        hasLab: true,
        credits: 4
      }
    ]
  },
  {
    id: 'cs-algo',
    code: 'CS-ALGO',
    name: 'Theoretical Computer Science & Algorithms',
    department: 'Computer Science',
    semester: 'Year III • Semester 5',
    isArchived: true, // Example archived class
    subjects: [
      {
        id: 'adv-algo',
        code: 'Adv Algo',
        name: 'Advanced Graph Algorithms',
        hasTheory: true,
        hasLab: false,
        credits: 3
      }
    ]
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'stu-01',
    rollNumber: '24DAIML01',
    name: 'Aarav Sharma',
    classId: 'daiml',
    isActive: true,
    email: 'aarav.sharma@institution.edu',
    enrolledAt: '2026-01-10',
    avatarLetter: 'A'
  },
  {
    id: 'stu-02',
    rollNumber: '24DAIML02',
    name: 'Diya Patel',
    classId: 'daiml',
    isActive: true,
    email: 'diya.patel@institution.edu',
    enrolledAt: '2026-01-10',
    avatarLetter: 'D'
  },
  {
    id: 'stu-03',
    rollNumber: '24DAIML03',
    name: 'Rohan Varma',
    classId: 'daiml',
    isActive: true,
    email: 'rohan.varma@institution.edu',
    enrolledAt: '2026-01-11',
    avatarLetter: 'R'
  },
  {
    id: 'stu-04',
    rollNumber: '24DAIML04',
    name: 'Ananya Iyer',
    classId: 'daiml',
    isActive: true,
    email: 'ananya.iyer@institution.edu',
    enrolledAt: '2026-01-11',
    avatarLetter: 'A'
  },
  {
    id: 'stu-05',
    rollNumber: '24DAIML05',
    name: 'Kabir Mehta',
    classId: 'daiml',
    isActive: true,
    email: 'kabir.mehta@institution.edu',
    enrolledAt: '2026-01-12',
    avatarLetter: 'K'
  },
  {
    id: 'stu-06',
    rollNumber: '24DAIML06',
    name: 'Zara Khan',
    classId: 'daiml',
    isActive: true,
    email: 'zara.khan@institution.edu',
    enrolledAt: '2026-01-12',
    avatarLetter: 'Z'
  },
  {
    id: 'stu-07',
    rollNumber: '24DAIML07',
    name: 'Vikramaditya Rao',
    classId: 'daiml',
    isActive: false, // Inactive student
    email: 'vikram.rao@institution.edu',
    enrolledAt: '2026-01-14',
    avatarLetter: 'V'
  },
  {
    id: 'stu-08',
    rollNumber: '24DAIML08',
    name: 'Meera Nambiar',
    classId: 'daiml',
    isActive: true,
    email: 'meera.nambiar@institution.edu',
    enrolledAt: '2026-01-15',
    avatarLetter: 'M'
  },
  {
    id: 'stu-09',
    rollNumber: '24ECE01',
    name: 'Siddharth Nair',
    classId: 'ece-iot',
    isActive: true,
    email: 'siddharth.nair@institution.edu',
    enrolledAt: '2026-01-10',
    avatarLetter: 'S'
  },
  {
    id: 'stu-10',
    rollNumber: '24ECE02',
    name: 'Tara Mukherjee',
    classId: 'ece-iot',
    isActive: true,
    email: 'tara.mukherjee@institution.edu',
    enrolledAt: '2026-01-10',
    avatarLetter: 'T'
  }
];

// Pre-seeded Attendance Logs for Today
const todayStr = new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE_LOGS = {
  // Key format: `${classId}_${subjectId}_${sessionType}_${dateStr}`
  [`daiml_python_Theory_${todayStr}`]: {
    'stu-01': 'Present',
    'stu-02': 'Present',
    'stu-03': 'Late',
    'stu-04': 'Present',
    'stu-05': 'Present',
    'stu-06': 'Absent',
    'stu-07': 'Absent',
    'stu-08': 'Present'
  },
  [`daiml_em-ai_Theory_${todayStr}`]: {
    'stu-01': 'Present',
    'stu-02': 'Present',
    'stu-03': 'Present',
    'stu-04': 'Late',
    'stu-05': 'Present',
    'stu-06': 'Present',
    'stu-07': 'Absent',
    'stu-08': 'Present'
  }
};

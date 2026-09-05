/**
 * GTTC Devanahalli - Diploma in Artificial Intelligence & Machine Learning (DAIML)
 * Semester III Timetable & Course Master (Approved by Karnataka Govt. & AICTE)
 * Centre Code: STU - 35 | Centre: Devanahalli
 */

export const GTTC_METADATA = {
  institution: 'Government Tool Room & Training Centre (GTTC)',
  centre: 'Devanahalli',
  centreCode: 'STU - 35',
  course: 'Diploma in Artificial Intelligence & Machine Learning',
  semester: 'Semester III',
  wefDate: '25/05/2026',
  timezone: 'Asia/Kolkata (IST • UTC+05:30)'
};

export const GTTC_SUBJECTS = [
  {
    slNo: 1,
    courseCode: '24AI31T',
    shortCode: 'EM FOR AI',
    courseName: 'Engineering Mathematics for AI',
    hoursPerWeek: 3,
    type: 'Theory',
    coordinator: 'Mr. Manojkumar N S',
    hasLab: false
  },
  {
    slNo: 2,
    courseCode: '24AI32T',
    shortCode: 'PYTHON',
    courseName: 'Python Programming',
    hoursPerWeek: 3,
    type: 'Theory',
    coordinator: 'Ms. Shreya',
    hasLab: true
  },
  {
    slNo: 3,
    courseCode: '24AI33T',
    shortCode: 'C++',
    courseName: "OOP's with C++",
    hoursPerWeek: 3,
    type: 'Theory',
    coordinator: 'Ms. Priyanka',
    hasLab: true
  },
  {
    slNo: 4,
    courseCode: '24AI34T',
    shortCode: 'MC & ES',
    courseName: 'Introduction to MC & ES',
    hoursPerWeek: 3,
    type: 'Theory',
    coordinator: 'Ms. Umme Taskeen',
    hasLab: true
  },
  {
    slNo: 5,
    courseCode: '24AI35P',
    shortCode: 'C++ LAB',
    courseName: "OOP's with C++ Lab",
    hoursPerWeek: 6,
    type: 'Lab',
    coordinator: 'Ms. Priyanka',
    hasLab: true
  },
  {
    slNo: 6,
    courseCode: '24AI36P',
    shortCode: 'PYTHON LAB',
    courseName: 'Python Programming Lab',
    hoursPerWeek: 6,
    type: 'Lab',
    coordinator: 'Ms. Shreya',
    hasLab: true
  },
  {
    slNo: 7,
    courseCode: '24AI37P',
    shortCode: 'MC & ES LAB',
    courseName: 'Introduction to MC & ES Lab',
    hoursPerWeek: 6,
    type: 'Lab',
    coordinator: 'Ms. Umme Taskeen',
    hasLab: true
  },
  {
    slNo: 8,
    courseCode: '24AI38P',
    shortCode: 'DBMS LAB',
    courseName: 'DBMS Lab',
    hoursPerWeek: 6,
    type: 'Lab',
    coordinator: 'Ramanna / Priyanka',
    hasLab: true
  }
];

/**
 * Filtered Academic Classes Schedule Matrix (Breaks & Assembly stripped out)
 * Days: Monday to Friday
 */
export const WEEKLY_SCHEDULE = {
  Monday: [
    { start: '08:30', end: '10:30', subject: 'EM FOR AI', code: '24AI31T', type: 'Theory', faculty: 'Mr. Manojkumar N S', batch: 'All' },
    { start: '10:45', end: '11:45', subject: 'PYTHON', code: '24AI32T', type: 'Theory', faculty: 'Ms. Shreya', batch: 'All' },
    { start: '11:45', end: '12:45', subject: 'C++', code: '24AI33T', type: 'Theory', faculty: 'Ms. Priyanka', batch: 'All' },
    { start: '13:15', end: '15:15', subject: 'MC & ES LAB (B1) / C++ LAB (B2)', code: '24AI37P / 24AI35P', type: 'Lab', faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '15:30', end: '17:15', subject: 'MC & ES LAB (B1) / C++ LAB (B2)', code: '24AI37P / 24AI35P', type: 'Lab', faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' }
  ],
  Tuesday: [
    { start: '08:30', end: '10:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '10:45', end: '11:45', subject: 'PYTHON', code: '24AI32T', type: 'Theory', faculty: 'Ms. Shreya', batch: 'All' },
    { start: '11:45', end: '12:45', subject: 'PYTHON (R)', code: '24AI32T', type: 'Theory', faculty: 'Ms. Shreya', batch: 'All', note: 'Revision / Remedial' },
    { start: '13:15', end: '15:15', subject: 'MC & ES LAB (B2) / C++ LAB (B1)', code: '24AI37P / 24AI35P', type: 'Lab', faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '15:30', end: '17:15', subject: 'MC & ES LAB (B2) / C++ LAB (B1)', code: '24AI37P / 24AI35P', type: 'Lab', faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' }
  ],
  Wednesday: [
    { start: '08:30', end: '09:30', subject: 'PYTHON', code: '24AI32T', type: 'Theory', faculty: 'Ms. Shreya', batch: 'All' },
    { start: '09:30', end: '10:30', subject: 'LIBRARY', code: 'LIB', type: 'Special', faculty: 'Librarian', batch: 'All' },
    { start: '10:45', end: '12:45', subject: 'EM FOR AI', code: '24AI31T', type: 'Theory', faculty: 'Mr. Manojkumar N S', batch: 'All' },
    { start: '13:15', end: '15:15', subject: 'PYTHON LAB (B2) / DBMS LAB (B1)', code: '24AI36P / 24AI38P', type: 'Lab', faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '15:30', end: '17:15', subject: 'PYTHON LAB (B2) / DBMS LAB (B1)', code: '24AI36P / 24AI38P', type: 'Lab', faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' }
  ],
  Thursday: [
    { start: '08:30', end: '09:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '09:30', end: '10:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '10:45', end: '12:45', subject: 'C++', code: '24AI33T', type: 'Theory', faculty: 'Ms. Priyanka', batch: 'All' },
    { start: '13:15', end: '15:15', subject: 'PYTHON LAB (B1) / DBMS LAB (B2)', code: '24AI36P / 24AI38P', type: 'Lab', faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '15:30', end: '17:15', subject: 'PYTHON LAB (B1) / DBMS LAB (B2)', code: '24AI36P / 24AI38P', type: 'Lab', faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' }
  ],
  Friday: [
    { start: '08:30', end: '10:30', subject: 'EM (R)', code: '24AI31T', type: 'Theory', faculty: 'Mr. Manojkumar N S', batch: 'All', note: 'Remedial' },
    { start: '10:45', end: '12:45', subject: 'MC & ES (R)', code: '24AI34T', type: 'Theory', faculty: 'Ms. Umme Taskeen', batch: 'All', note: 'Remedial' },
    { start: '13:15', end: '14:15', subject: 'C++ (R)', code: '24AI33T', type: 'Theory', faculty: 'Ms. Priyanka', batch: 'All', note: 'Remedial' },
    { start: '14:15', end: '15:15', subject: 'SPORTS', code: 'SPORTS', type: 'Special', faculty: 'Physical Education' },
    { start: '15:30', end: '17:15', subject: 'SPORTS', code: 'SPORTS', type: 'Special', faculty: 'Physical Education' }
  ]
};

/**
 * Parses time string 'HH:MM' into minutes from midnight
 */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Returns the current live slot in Indian Standard Time (IST)
 */
export function getLiveSlotInIST(simulatedDay = null, simulatedTimeStr = null) {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDay = simulatedDay || dayNames[now.getDay()];

  let currentMinutes;
  if (simulatedTimeStr) {
    currentMinutes = timeToMinutes(simulatedTimeStr);
  } else {
    const istOptions = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' };
    const istTimeParts = new Intl.DateTimeFormat([], istOptions).format(now).split(':');
    const h = parseInt(istTimeParts[0], 10);
    const m = parseInt(istTimeParts[1], 10);
    currentMinutes = h * 60 + m;
  }

  const daySchedule = WEEKLY_SCHEDULE[activeDay] || [];
  let activeSlot = null;
  let nextSlot = null;

  for (let i = 0; i < daySchedule.length; i++) {
    const slot = daySchedule[i];
    const sMin = timeToMinutes(slot.start);
    const eMin = timeToMinutes(slot.end);

    if (currentMinutes >= sMin && currentMinutes < eMin) {
      activeSlot = slot;
      nextSlot = daySchedule[i + 1] || null;
      break;
    } else if (currentMinutes < sMin && !nextSlot) {
      nextSlot = slot;
    }
  }

  return {
    activeDay,
    activeSlot,
    nextSlot
  };
}

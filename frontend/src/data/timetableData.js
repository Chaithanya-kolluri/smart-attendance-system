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

// Defined Time Periods in 24-hour minutes for accurate IST live matching
export const TIME_PERIODS = [
  { id: 'p0', label: '8:00 - 8:30 AM', start: '08:00', end: '08:30', startMin: 480, endMin: 510, type: 'prayer' },
  { id: 'p1', label: '8:30 - 9:30 AM', start: '08:30', end: '09:30', startMin: 510, endMin: 570, type: 'academic' },
  { id: 'p2', label: '9:30 - 10:30 AM', start: '09:30', end: '10:30', startMin: 570, endMin: 630, type: 'academic' },
  { id: 'p_tea1', label: '10:30 - 10:45 AM', start: '10:30', end: '10:45', startMin: 630, endMin: 645, type: 'break' },
  { id: 'p3', label: '10:45 - 11:45 AM', start: '10:45', end: '11:45', startMin: 645, endMin: 705, type: 'academic' },
  { id: 'p4', label: '11:45 - 12:45 PM', start: '11:45', end: '12:45', startMin: 705, endMin: 765, type: 'academic' },
  { id: 'p_lunch', label: '12:45 - 1:15 PM', start: '12:45', end: '13:15', startMin: 765, endMin: 795, type: 'break' },
  { id: 'p5', label: '1:15 - 2:15 PM', start: '13:15', end: '14:15', startMin: 795, endMin: 855, type: 'academic' },
  { id: 'p6', label: '2:15 - 3:15 PM', start: '14:15', end: '15:15', startMin: 855, endMin: 915, type: 'academic' },
  { id: 'p_tea2', label: '3:15 - 3:30 PM', start: '15:15', end: '15:30', startMin: 915, endMin: 930, type: 'break' },
  { id: 'p7', label: '3:30 - 4:30 PM', start: '15:30', end: '16:30', startMin: 930, endMin: 990, type: 'academic' },
  { id: 'p8', label: '4:15 - 5:15 PM', start: '16:15', end: '17:15', startMin: 975, endMin: 1035, type: 'academic' },
  { id: 'p_assembly', label: '5:15 - 5:30 PM', start: '17:15', end: '17:30', startMin: 1035, endMin: 1050, type: 'assembly' }
];

/**
 * Exact GTTC DAIML Weekly Schedule Matrix
 * Days: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday
 */
export const WEEKLY_SCHEDULE = {
  Monday: [
    { start: '08:00', end: '08:30', subject: 'PRAYER & YOGA', code: 'GENERAL', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '08:30', end: '10:30', subject: 'EM FOR AI', code: '24AI31T', type: 'Theory', isBreak: false, faculty: 'Mr. Manojkumar N S', batch: 'All' },
    { start: '10:30', end: '10:45', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '10:45', end: '11:45', subject: 'PYTHON', code: '24AI32T', type: 'Theory', isBreak: false, faculty: 'Ms. Shreya', batch: 'All' },
    { start: '11:45', end: '12:45', subject: 'C++', code: '24AI33T', type: 'Theory', isBreak: false, faculty: 'Ms. Priyanka', batch: 'All' },
    { start: '12:45', end: '13:15', subject: 'LUNCH BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '13:15', end: '15:15', subject: 'MC & ES LAB (B1) / C++ LAB (B2)', code: '24AI37P / 24AI35P', type: 'Lab', isBreak: false, faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '15:15', end: '15:30', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '15:30', end: '17:15', subject: 'MC & ES LAB (B1) / C++ LAB (B2)', code: '24AI37P / 24AI35P', type: 'Lab', isBreak: false, faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '17:15', end: '17:30', subject: 'ASSEMBLY', code: 'ASSEMBLY', type: 'Special', isBreak: false, faculty: 'Class Incharge' }
  ],
  Tuesday: [
    { start: '08:00', end: '08:30', subject: 'PRAYER & YOGA', code: 'GENERAL', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '08:30', end: '10:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', isBreak: false, faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '10:30', end: '10:45', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '10:45', end: '11:45', subject: 'PYTHON', code: '24AI32T', type: 'Theory', isBreak: false, faculty: 'Ms. Shreya', batch: 'All' },
    { start: '11:45', end: '12:45', subject: 'PYTHON (R)', code: '24AI32T', type: 'Theory', isBreak: false, faculty: 'Ms. Shreya', batch: 'All', note: 'Revision / Remedial' },
    { start: '12:45', end: '13:15', subject: 'LUNCH BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '13:15', end: '15:15', subject: 'MC & ES LAB (B2) / C++ LAB (B1)', code: '24AI37P / 24AI35P', type: 'Lab', isBreak: false, faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '15:15', end: '15:30', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '15:30', end: '17:15', subject: 'MC & ES LAB (B2) / C++ LAB (B1)', code: '24AI37P / 24AI35P', type: 'Lab', isBreak: false, faculty: 'Ms. Umme Taskeen / Ms. Priyanka', batch: 'B1 & B2' },
    { start: '17:15', end: '17:30', subject: 'ASSEMBLY', code: 'ASSEMBLY', type: 'Special', isBreak: false, faculty: 'Class Incharge' }
  ],
  Wednesday: [
    { start: '08:00', end: '08:30', subject: 'PRAYER & YOGA', code: 'GENERAL', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '08:30', end: '09:30', subject: 'PYTHON', code: '24AI32T', type: 'Theory', isBreak: false, faculty: 'Ms. Shreya', batch: 'All' },
    { start: '09:30', end: '10:30', subject: 'LIBRARY', code: 'LIB', type: 'Special', isBreak: false, faculty: 'Librarian', batch: 'All' },
    { start: '10:30', end: '10:45', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '10:45', end: '12:45', subject: 'EM FOR AI', code: '24AI31T', type: 'Theory', isBreak: false, faculty: 'Mr. Manojkumar N S', batch: 'All' },
    { start: '12:45', end: '13:15', subject: 'LUNCH BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '13:15', end: '15:15', subject: 'PYTHON LAB (B2) / DBMS LAB (B1)', code: '24AI36P / 24AI38P', type: 'Lab', isBreak: false, faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '15:15', end: '15:30', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '15:30', end: '17:15', subject: 'PYTHON LAB (B2) / DBMS LAB (B1)', code: '24AI36P / 24AI38P', type: 'Lab', isBreak: false, faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '17:15', end: '17:30', subject: 'ASSEMBLY', code: 'ASSEMBLY', type: 'Special', isBreak: false, faculty: 'Class Incharge' }
  ],
  Thursday: [
    { start: '08:00', end: '08:30', subject: 'PRAYER & YOGA', code: 'GENERAL', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '08:30', end: '09:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', isBreak: false, faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '09:30', end: '10:30', subject: 'MC & ES', code: '24AI34T', type: 'Theory', isBreak: false, faculty: 'Ms. Umme Taskeen', batch: 'All' },
    { start: '10:30', end: '10:45', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '10:45', end: '12:45', subject: 'C++', code: '24AI33T', type: 'Theory', isBreak: false, faculty: 'Ms. Priyanka', batch: 'All' },
    { start: '12:45', end: '13:15', subject: 'LUNCH BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '13:15', end: '15:15', subject: 'PYTHON LAB (B1) / DBMS LAB (B2)', code: '24AI36P / 24AI38P', type: 'Lab', isBreak: false, faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '15:15', end: '15:30', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '15:30', end: '17:15', subject: 'PYTHON LAB (B1) / DBMS LAB (B2)', code: '24AI36P / 24AI38P', type: 'Lab', isBreak: false, faculty: 'Ms. Shreya / Ramanna', batch: 'B1 & B2' },
    { start: '17:15', end: '17:30', subject: 'ASSEMBLY', code: 'ASSEMBLY', type: 'Special', isBreak: false, faculty: 'Class Incharge' }
  ],
  Friday: [
    { start: '08:00', end: '08:30', subject: 'PRAYER & YOGA', code: 'GENERAL', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '08:30', end: '10:30', subject: 'EM (R)', code: '24AI31T', type: 'Theory', isBreak: false, faculty: 'Mr. Manojkumar N S', batch: 'All', note: 'Remedial' },
    { start: '10:30', end: '10:45', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '10:45', end: '12:45', subject: 'MC & ES (R)', code: '24AI34T', type: 'Theory', isBreak: false, faculty: 'Ms. Umme Taskeen', batch: 'All', note: 'Remedial' },
    { start: '12:45', end: '13:15', subject: 'LUNCH BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '13:15', end: '14:15', subject: 'C++ (R)', code: '24AI33T', type: 'Theory', isBreak: false, faculty: 'Ms. Priyanka', batch: 'All', note: 'Remedial' },
    { start: '14:15', end: '15:15', subject: 'SPORTS', code: 'SPORTS', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '15:15', end: '15:30', subject: 'TEA BREAK', code: 'BREAK', type: 'Break', isBreak: true },
    { start: '15:30', end: '17:15', subject: 'SPORTS', code: 'SPORTS', type: 'Special', isBreak: false, faculty: 'Physical Education' },
    { start: '17:15', end: '17:30', subject: 'ASSEMBLY', code: 'ASSEMBLY', type: 'Special', isBreak: false, faculty: 'Class Incharge' }
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
 * Can be overridden by simulated day/time for testing
 */
export function getLiveSlotInIST(simulatedDay = null, simulatedTimeStr = null) {
  // Current time in IST (UTC+5:30)
  const now = new Date();
  
  // Day of week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDay = simulatedDay || dayNames[now.getDay()];

  // Minutes from midnight
  let currentMinutes;
  let formattedTime;

  if (simulatedTimeStr) {
    currentMinutes = timeToMinutes(simulatedTimeStr);
    formattedTime = simulatedTimeStr;
  } else {
    // Extract IST hours and minutes
    const istOptions = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' };
    const istTimeParts = new Intl.DateTimeFormat([], istOptions).format(now).split(':');
    const h = parseInt(istTimeParts[0], 10);
    const m = parseInt(istTimeParts[1], 10);
    currentMinutes = h * 60 + m;
    formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const daySchedule = WEEKLY_SCHEDULE[activeDay];

  if (!daySchedule) {
    return {
      status: 'WEEKEND',
      message: `${activeDay} is a non-instructional weekend.`,
      activeDay,
      timeIST: formattedTime,
      activeSlot: null,
      nextSlot: WEEKLY_SCHEDULE.Monday[1] // First academic slot Monday
    };
  }

  // Find slot that contains currentMinutes
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
    status: activeSlot ? (activeSlot.isBreak ? 'BREAK' : 'ACTIVE') : 'IDLE',
    activeDay,
    timeIST: formattedTime,
    activeSlot,
    nextSlot: nextSlot || (activeSlot ? null : daySchedule[1])
  };
}

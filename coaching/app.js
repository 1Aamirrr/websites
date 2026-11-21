(() => {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. SETTINGS. Change these for each client.
  // ---------------------------------------------------------------------
  const CONFIG = {
    firm: "Brightpath Classes",
    area: "Dadar West",
    city: "Mumbai",
    // Floor and building. The page adds the area and city after it.
    address: "1st floor, Shanti Kunj",
    // A short line that helps people find the place. Shown under the headline and with the address.
    landmark: "3 minutes from the station",
    since: 2009,
    // How many students one batch can have at most. Shown in the quick facts and the questions.
    maxBatch: 20,
    // Students enrolled this year, for the quick facts.
    studentsThisYear: 640,
    // How many months the school year runs (June to March is 10). Used for "fees from ... a month".
    termMonths: 10,
    // The client's number: country code + number, digits only. Example: "919820012345".
    // Leave empty for a sample: WhatsApp then asks the visitor whom to send to.
    phone: "",
    // Your own name and number come from owner.js (one file for all samples).
    // When the number is set, the top bar shows "Get yours" and opens a chat with you.
    builtBy: (window.OWNER && window.OWNER.name) || "Oxzi",
    builtByWhatsApp: (window.OWNER && window.OWNER.whatsapp) || ""
  };

  // One business's real details: ?id=... loads ../leads/<id>.js (see ../lead.js).
  const LEAD = window.LEAD || {};
  if (LEAD.phone) { CONFIG.phone = LEAD.phone; }


  // ---------------------------------------------------------------------
  // 2. OFFICE HOURS (when parents can visit for admissions). One line per day:
  //    [opens, closes] on the 24-hour clock. "09:00" is 9 am and "20:30" is 8:30 pm.
  //    Closed all day: write null, for example  Sun: null
  //    The "Open now" badge and the hours table both read this.
  // ---------------------------------------------------------------------
  const HOURS = {
    Mon: ["09:00", "20:30"],
    Tue: ["09:00", "20:30"],
    Wed: ["09:00", "20:30"],
    Thu: ["09:00", "20:30"],
    Fri: ["09:00", "20:30"],
    Sat: ["09:00", "20:30"],
    Sun: ["09:00", "13:00"]
  };
  if (LEAD.hours) {
    Object.keys(HOURS).forEach((d) => { const s = LEAD.hours[d]; HOURS[d] = s && s.length ? [s[0][0], s[s.length - 1][1]] : null; });
  }

  // ---------------------------------------------------------------------
  // 3. COURSES, BATCHES AND FEES. One block per course; they show as buttons in this order.
  //    chip: the short name on the button.   name: the full name on the card.
  //    group: "school", "science" or "entrance" (sets the colour dot).
  //    once: the fee for the whole year when paid at admission, in rupees.
  //    parts: the same year paid in 3 parts (see INSTALMENT_DUE). The page works out the saving.
  //    popular: true marks the course most parents pick (use it on one course only).
  //    batches: days, start and end time (24-hour clock), and seats still free (0 = batch full).
  // ---------------------------------------------------------------------
  const COURSES = [
    {
      id: "std8", chip: "Std 8", name: "Std 8 foundation", group: "school", boards: "SSC, CBSE and ICSE",
      line: "Strong basics before the board years start.",
      subjects: ["Maths", "Science", "English"],
      once: 24000, parts: [8500, 8500, 8500],
      includes: ["Maths, Science and English, 3 days a week", "Printed notes and a worksheet for every topic", "Sunday test and a monthly report"],
      batches: [
        { days: "Mon, Wed, Fri", from: "16:00", to: "17:30", left: 7 },
        { days: "Tue, Thu, Sat", from: "17:30", to: "19:00", left: 4 }
      ]
    },
    {
      id: "std9", chip: "Std 9", name: "Std 9", group: "school", boards: "SSC, CBSE and ICSE",
      line: "The full Std 9 syllabus, matched to your school.",
      subjects: ["Maths", "Science", "English", "Social Science"],
      once: 30000, parts: [10500, 10500, 10500],
      includes: ["All 4 subjects, 3 days a week", "Chapter test every Sunday", "Doubt hour every Saturday"],
      batches: [
        { days: "Mon, Wed, Fri", from: "17:30", to: "19:30", left: 9 },
        { days: "Tue, Thu, Sat", from: "16:00", to: "18:00", left: 5 }
      ]
    },
    {
      id: "std10", chip: "Std 10", name: "Std 10 board batch", group: "school", boards: "SSC, CBSE and ICSE", popular: true,
      line: "Board syllabus done by December, then papers and revision.",
      subjects: ["Maths", "Science", "English", "Social Science"],
      once: 42000, parts: [15000, 15000, 15000],
      includes: ["All board subjects, 3 days a week", "Two full mock board exams in January", "Past board papers solved in class"],
      batches: [
        { days: "Mon to Fri", from: "07:00", to: "09:00", left: 3 },
        { days: "Mon, Wed, Fri", from: "16:00", to: "19:00", left: 6 },
        { days: "Tue, Thu, Sat", from: "16:00", to: "19:00", left: 2 }
      ]
    },
    {
      id: "std11", chip: "Std 11 Science", name: "Std 11 Science", group: "science", boards: "HSC and CBSE",
      line: "The base for Std 12 boards, JEE and NEET.",
      subjects: ["Physics", "Chemistry", "Maths", "Biology"],
      once: 48000, parts: [17000, 17000, 17000],
      includes: ["Physics, Chemistry and Maths or Biology", "Help with the practical journal", "Builds the base for JEE and NEET"],
      batches: [
        { days: "Mon, Wed, Fri", from: "18:00", to: "21:00", left: 8 },
        { days: "Tue, Thu, Sat", from: "07:00", to: "10:00", left: 6 }
      ]
    },
    {
      id: "std12", chip: "Std 12 Science", name: "Std 12 Science board batch", group: "science", boards: "HSC and CBSE",
      line: "Full syllabus by December, then three mock board exams.",
      subjects: ["Physics", "Chemistry", "Maths", "Biology"],
      once: 52000, parts: [18500, 18500, 18500],
      includes: ["Full board syllabus by December", "Three mock board exams", "Practical exam practice"],
      batches: [
        { days: "Mon, Wed, Fri", from: "07:00", to: "10:00", left: 5 },
        { days: "Tue, Thu, Sat", from: "17:30", to: "20:30", left: 0 }
      ]
    },
    {
      id: "jee", chip: "JEE", name: "JEE Main and Advanced", group: "entrance", boards: "Along with Std 11 or 12",
      line: "Two-year course for engineering entrance exams.",
      subjects: ["Physics", "Chemistry", "Maths"],
      once: 95000, parts: [34000, 33000, 33000],
      includes: ["Physics, Chemistry and Maths at JEE level", "Weekly JEE pattern test with ranks", "Fee shown is for one year of two"],
      batches: [
        { days: "Tue, Thu, Sat", from: "18:00", to: "21:00", left: 7 },
        { days: "Sat and Sun", from: "10:00", to: "14:00", left: 4 }
      ]
    },
    {
      id: "neet", chip: "NEET", name: "NEET", group: "entrance", boards: "Along with Std 11 or 12",
      line: "Two-year course for the medical entrance exam.",
      subjects: ["Physics", "Chemistry", "Biology"],
      once: 90000, parts: [32000, 31000, 31000],
      includes: ["NCERT line by line, with weekly tests", "Full NEET mock test every month", "Fee shown is for one year of two"],
      batches: [
        { days: "Mon, Tue, Thu", from: "18:00", to: "21:00", left: 6 },
        { days: "Sat and Sun", from: "14:30", to: "18:30", left: 9 }
      ]
    }
  ];
  // The course shown first.
  const START_COURSE = "std10";
  // When each of the 3 parts is due. Keep three lines, one for each part.
  const INSTALMENT_DUE = ["at admission", "by 15 October", "by 15 January"];

  // ---------------------------------------------------------------------
  // 4. FREE DEMO CLASSES each week. time: 24-hour clock.
  //    course: one of the ids above.   subject: the topic of that class.
  //    by: the teacher's subject, written exactly as in the TEACHERS list below.
  //    The page shows the next six as cards, and the very next one on the top photo.
  // ---------------------------------------------------------------------
  const DEMO_CLASSES = {
    Mon: [
      { time: "16:00", course: "std8", subject: "Maths", by: "Maths" },
      { time: "18:00", course: "std11", subject: "Physics", by: "Physics" }
    ],
    Tue: [
      { time: "16:00", course: "std9", subject: "Science", by: "Science" },
      { time: "18:00", course: "neet", subject: "Biology", by: "Biology" }
    ],
    Wed: [
      { time: "07:00", course: "std12", subject: "Chemistry", by: "Chemistry" },
      { time: "16:00", course: "std10", subject: "Algebra", by: "Maths" }
    ],
    Thu: [
      { time: "07:00", course: "std10", subject: "Science 1", by: "Science" },
      { time: "18:00", course: "jee", subject: "Physics", by: "Physics" }
    ],
    Fri: [
      { time: "16:00", course: "std8", subject: "English", by: "English" },
      { time: "18:00", course: "std11", subject: "Chemistry", by: "Chemistry" }
    ],
    Sat: [
      { time: "10:00", course: "jee", subject: "Maths", by: "Maths" },
      { time: "16:00", course: "std10", subject: "Geometry", by: "Maths" }
    ],
    Sun: []
  };

  // ---------------------------------------------------------------------
  // 5. HOW WE TEACH. Four short steps. icon: book, pen, test or chart.
  //    REPORT is the sample report card drawn next to the steps.
  //    marks: the last eight Sunday tests, out of 100.   teacher: a subject from TEACHERS.
  // ---------------------------------------------------------------------
  const STEPS = [
    { icon: "book", title: "Learn in class", text: "Each topic is taught on the board, step by step, in a small batch." },
    { icon: "pen", title: "Practise the same day", text: "A worksheet for every topic. The teacher checks it in the next class." },
    { icon: "test", title: "Test every Sunday", text: "A short test on the week's topics. Marks reach parents on WhatsApp." },
    { icon: "chart", title: "Report every month", text: "Marks, attendance and a note from the teacher. A parents' meeting every term." }
  ];
  const REPORT = {
    student: "Aarav P.",
    class: "Std 10, SSC",
    attendance: 96,
    marks: [58, 64, 61, 69, 73, 72, 79, 84],
    remark: "Algebra is much stronger. Revise the geometry theorems this month.",
    teacher: "Maths"
  };

  // ---------------------------------------------------------------------
  // 6. RESULTS. One line per year, newest first: students who scored 90% and above,
  //    the class average and how many sat the board exam.
  //    TOPPERS: score and unit as printed: "%" for boards, "percentile" for JEE Main,
  //    "/720" for NEET. top: true marks the centre topper of that year.
  //    Use first name and initial only.
  // ---------------------------------------------------------------------
  const RESULT_YEARS = [
    { year: 2025, above90: 48, average: 86.4, students: 212 },
    { year: 2024, above90: 41, average: 84.9, students: 198 },
    { year: 2023, above90: 36, average: 83.2, students: 185 }
  ];
  const TOPPERS = [
    { year: 2025, name: "Ishita K.", exam: "Std 10, SSC board", score: 98.2, unit: "%", note: "100 out of 100 in Maths", top: true },
    { year: 2025, name: "Aryan M.", exam: "JEE Main", score: 99.31, unit: "percentile", note: "Physics: 99.6 percentile" },
    { year: 2025, name: "Sana S.", exam: "NEET", score: 651, unit: "/720", note: "Biology: 340 out of 360" },
    { year: 2025, name: "Vedant P.", exam: "Std 12, HSC Science", score: 94.5, unit: "%", note: "Physics, Chemistry, Maths: 96%" },
    { year: 2025, name: "Riya D.", exam: "Std 10, CBSE", score: 97.4, unit: "%", note: "99 in Science" },
    { year: 2025, name: "Omkar J.", exam: "Std 10, ICSE", score: 96.8, unit: "%", note: "100 in Maths" },
    { year: 2024, name: "Tanvi R.", exam: "Std 10, SSC board", score: 97.6, unit: "%", note: "100 out of 100 in Science", top: true },
    { year: 2024, name: "Kabir N.", exam: "JEE Main", score: 98.87, unit: "percentile", note: "Maths: 99.4 percentile" },
    { year: 2024, name: "Aditi G.", exam: "NEET", score: 628, unit: "/720", note: "Chemistry: 165 out of 180" },
    { year: 2024, name: "Yash T.", exam: "Std 12, HSC Science", score: 93.2, unit: "%", note: "100 in Maths" },
    { year: 2024, name: "Neha B.", exam: "Std 10, CBSE", score: 96.2, unit: "%", note: "98 in Maths" },
    { year: 2024, name: "Rohan S.", exam: "Std 10, SSC board", score: 95.8, unit: "%", note: "From 71% in Std 9" },
    { year: 2023, name: "Mihir A.", exam: "Std 10, SSC board", score: 97.2, unit: "%", note: "100 out of 100 in Maths", top: true },
    { year: 2023, name: "Pooja V.", exam: "NEET", score: 612, unit: "/720", note: "Now studying MBBS" },
    { year: 2023, name: "Siddharth L.", exam: "JEE Main", score: 98.12, unit: "percentile", note: "Chemistry: 98.9 percentile" },
    { year: 2023, name: "Anaya C.", exam: "Std 12, HSC Science", score: 92.8, unit: "%", note: "98 in Biology" },
    { year: 2023, name: "Harsh K.", exam: "Std 10, ICSE", score: 95.4, unit: "%", note: "99 in Physics" },
    { year: 2023, name: "Diya F.", exam: "Std 10, CBSE", score: 95.0, unit: "%", note: "From 68% in Std 9" }
  ];

  // ---------------------------------------------------------------------
  // 7. TEACHERS. called: what students call them.   subject: the subject they lead.
  //    since: the year they started teaching. The page works out "21 years teaching".
  //    look: a number from 1 to 6. It picks one of the six drawn faces
  //    (1, 2 and 3 have short hair, 4 a bun, 5 long hair, 6 a ponytail).
  //    The faces are drawings, so no photo of a real person is needed.
  // ---------------------------------------------------------------------
  const TEACHERS = [
    { name: "Prakash Joshi", called: "Joshi Sir", subject: "Maths", look: 1, degree: "M.Sc. Maths, B.Ed.", since: 2004, text: "Founder. Teaches Maths to Std 10 and the JEE batches." },
    { name: "Anjali Kulkarni", called: "Kulkarni Ma'am", subject: "Science", look: 4, degree: "M.Sc. Chemistry, B.Ed.", since: 2009, text: "Science for Std 8 to 10, with a simple diagram for every chapter." },
    { name: "Rahul Deshmukh", called: "Deshmukh Sir", subject: "Physics", look: 2, degree: "B.Tech, M.Sc. Physics", since: 2012, text: "Physics for Std 11, 12, JEE and NEET. Makes numericals feel easy." },
    { name: "Farhan Shaikh", called: "Shaikh Sir", subject: "Chemistry", look: 3, degree: "M.Sc. Organic Chemistry", since: 2014, text: "Chemistry for Std 11, 12, JEE and NEET. Known for his reaction charts." },
    { name: "Sneha Iyer", called: "Iyer Ma'am", subject: "Biology", look: 5, degree: "M.Sc. Zoology", since: 2013, text: "Biology for NEET and Std 11 and 12. NCERT, line by line." },
    { name: "Meenal Rao", called: "Rao Ma'am", subject: "English", look: 6, degree: "M.A. English, B.Ed.", since: 2011, text: "English and Social Science for Std 8 to 10. Board answer writing." }
  ];

  // ---------------------------------------------------------------------
  // 8. GALLERY. id: the Unsplash photo id.   caption: the line shown on the photo.
  //    On phones the first and last photos are shown wide.
  // ---------------------------------------------------------------------
  const GALLERY = [
    { id: "1509062522246-3755977927d7", caption: "Std 9 Science class" },
    { id: "1635070041078-e363dbe005cb", caption: "Maths on the board" },
    { id: "1532094349884-543bc11b234d", caption: "Chemistry practical corner" },
    { id: "1524178232363-1fb2b075b655", caption: "Saturday doubt-solving hour" },
    { id: "1497633762265-9d179a990aa6", caption: "Reference books for every subject" },
    { id: "1434030216411-0b793f4b4173", caption: "Sunday test in progress" }
  ];

  // ---------------------------------------------------------------------
  // 9. A link like  ?firm=Vidya+Classes&area=Borivali  shows the page
  //    with that class name and area, so one sample works for many coaching classes.
  // ---------------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const clean = (value, max) => String(value || "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  const customFirm = clean(params.get("firm") || LEAD.firm, 60);
  const customArea = clean(params.get("area") || LEAD.area, 40);
  const firm = customFirm || CONFIG.firm;
  const area = customArea || CONFIG.area;
  // ?city=Dubai: for a business outside Mumbai
  const city = clean(params.get("city") || LEAD.city, 30) || CONFIG.city;
  const phone = CONFIG.phone.replace(/\D/g, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Small helpers ----------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const SVG_NS = "http://www.w3.org/2000/svg";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  };

  const icon = (name, filled) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", filled ? "ico ico-fill" : "ico");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  };

  // One drawn shape (used for the report chart and the teachers' faces).
  const shape = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };

  const photoUrl = (id, w, h) =>
    "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=70";

  const waLink = (text, number = phone) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  // Fees are in rupees here; owner.js decides how they are shown (rupees, or dirhams for the UAE).
  const money = (window.OWNER && window.OWNER.money) || { code: "INR", sign: "₹", scale: 1, locale: "en-IN" };
  const amount = (n) => Math.round(n * money.scale).toLocaleString(money.locale);
  const inr = (n) => money.sign + amount(n);

  const prettyPhone = (digits) => {
    const local = digits.slice(-10);
    return local.length === 10 ? local.slice(0, 5) + " " + local.slice(5) : digits;
  };

  const setPressed = (button, on) => {
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", String(on));
  };

  // "18:30" becomes 1110 (minutes after midnight), and 1110 becomes "6:30 pm".
  const toMinutes = (time) => {
    const parts = String(time).split(":");
    return Number(parts[0]) * 60 + Number(parts[1] || 0);
  };
  const clock = (minutes) => {
    const m = ((minutes % 1440) + 1440) % 1440;
    if (m === 0) { return "midnight"; }
    if (m === 720) { return "12 noon"; }
    const hour = Math.floor(m / 60);
    const rest = m % 60;
    return (hour % 12 || 12) + (rest ? ":" + String(rest).padStart(2, "0") : "") + (hour < 12 ? " am" : " pm");
  };

  // The week runs Monday to Sunday on this page.
  const DAYS = [
    { key: "Mon", name: "Monday" }, { key: "Tue", name: "Tuesday" }, { key: "Wed", name: "Wednesday" },
    { key: "Thu", name: "Thursday" }, { key: "Fri", name: "Friday" }, { key: "Sat", name: "Saturday" },
    { key: "Sun", name: "Sunday" }
  ];
  const todayIndex = (date = new Date()) => (date.getDay() + 6) % 7;

  const courseById = (id) => COURSES.find((course) => course.id === id);
  const teacherFor = (subject) => TEACHERS.find((person) => person.subject === subject);
  // Subject icons for the demo cards and course tags.
  const SUBJECT_ICONS = { maths: "calc", science: "flask", physics: "atom", chemistry: "flask", biology: "leaf", english: "book", socialscience: "globe" };
  const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  const subjectIcon = (subject) => SUBJECT_ICONS[slug(subject)] || "book";

  // ---------- Names, phone and links across the page ----------
  document.title = firm + " | Tuition and coaching in " + area + ", " + city;
  $$("[data-firm]").forEach((node) => { node.textContent = firm; });
  $$("[data-area]").forEach((node) => { node.textContent = area; });
  $$("[data-city]").forEach((node) => { node.textContent = city; });
  $$("[data-address]").forEach((node) => { node.textContent = CONFIG.address; });
  $$("[data-landmark]").forEach((node) => { node.textContent = CONFIG.landmark; });
  $$("[data-since]").forEach((node) => { node.textContent = String(CONFIG.since); });
  $("#builtBy").textContent = CONFIG.builtBy;

  $$('[data-wa="general"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to know about your coaching classes in " + area + ".");
  });
  $$('[data-wa="demo"]').forEach((node) => {
    node.href = waLink("Hello " + firm + ", I want to book a free demo class for my child at your " + area + " centre. Please tell me the next date.");
  });
  if (phone) {
    $$("[data-call]").forEach((node) => { node.href = "tel:+" + phone; });
    $$("[data-phone-text]").forEach((node) => { node.textContent = prettyPhone(phone); });
  }

  // ---------- Sample notice at the top ----------
  $("#demoText").textContent = customFirm
    ? "Sample made for " + firm + " by " + CONFIG.builtBy + ". All details and fees are examples."
    : "Sample website by " + CONFIG.builtBy + ". All details, fees and timings are examples.";
  const builderNumber = CONFIG.builtByWhatsApp.replace(/\D/g, "");
  if (builderNumber) {
    const link = $("#demoLink");
    link.href = waLink("Hi " + CONFIG.builtBy.split(" ")[0] + ", I saw the sample website for " + firm + ". I want one.", builderNumber);
    // A tap opens the offer sheet (../fx/fx.js, section 9). The link above is the fallback.
    link.dataset.offerFirm = customFirm;
    link.hidden = false;
  }

  $("#map").src = "https://www.google.com/maps?q=" + encodeURIComponent(area + ", " + city) + "&output=embed";

  // ---------------------------------------------------------------------
  // Timings: the hours table and the live "Open now" badge
  // ---------------------------------------------------------------------
  const DAY = 1440;          // minutes in a day
  const WEEK = 7 * DAY;      // minutes in a week

  // Opening and closing minute for one day, or null when closed all day.
  // A closing time at or before the opening time means "after midnight".
  const hoursOf = (dayIndex) => {
    const pair = HOURS[DAYS[dayIndex].key];
    if (!pair) { return null; }
    const start = toMinutes(pair[0]);
    let end = toMinutes(pair[1]);
    if (end <= start) { end += DAY; }
    return { start: start, end: end };
  };

  // Every open stretch of the week, counted in minutes from Monday 00:00.
  const spans = [];
  DAYS.forEach((day, i) => {
    const hours = hoursOf(i);
    if (hours) { spans.push({ from: i * DAY + hours.start, to: i * DAY + hours.end }); }
  });

  // If the office is open at minute t, the minute it closes. Otherwise null.
  // The second pass (one week back) catches a Sunday night that runs into Monday.
  const closingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    for (const span of spans) {
      for (const shift of [0, -WEEK]) {
        if (inWeek >= span.from + shift && inWeek < span.to + shift) { return t + (span.to + shift - inWeek); }
      }
    }
    return null;
  };

  // The next minute the office opens after minute t. Null when it never opens.
  const openingAfter = (t) => {
    const inWeek = ((t % WEEK) + WEEK) % WEEK;
    let best = null;
    for (const span of spans) {
      for (const shift of [0, WEEK]) {
        const start = span.from + shift;
        if (start > inWeek && (best === null || start < best)) { best = start; }
      }
    }
    return best === null ? null : t + (best - inWeek);
  };

  // Works out the badge text for any moment.
  const openStatus = (date) => {
    const today = todayIndex(date);
    const now = today * DAY + date.getHours() * 60 + date.getMinutes();
    let closes = closingAfter(now);
    if (closes !== null) {
      // Back-to-back hours: keep following to the real closing time.
      let hops = 0;
      while (hops < 8) {
        const later = closingAfter(closes);
        if (later === null) { break; }
        closes = later;
        hops += 1;
      }
      if (hops >= 8) { return { open: true, full: "Open now, 24 hours a day", short: "Open 24 hours" }; }
      return { open: true, full: "Office open now, closes at " + clock(closes), short: "Office open until " + clock(closes) };
    }
    const opens = openingAfter(now);
    if (opens === null) { return { open: false, full: "Office closed now", short: "Office closed now" }; }
    const daysAway = Math.floor(opens / DAY) - today;
    const base = "Office closed now, opens at " + clock(opens);
    if (daysAway === 0) { return { open: false, full: base, short: base }; }
    if (daysAway === 1) { return { open: false, full: base + " tomorrow", short: base }; }
    const onDay = base + " on " + DAYS[Math.floor(opens / DAY) % 7].name;
    return { open: false, full: onDay, short: onDay };
  };

  const hoursText = (dayIndex) => {
    const hours = hoursOf(dayIndex);
    if (hours && hours.end - hours.start >= DAY) { return "Open 24 hours"; }
    return hours ? clock(hours.start) + " to " + clock(hours.end) : "Closed";
  };

  const hoursList = $("#hoursList");
  DAYS.forEach((day, i) => {
    const li = el("li");
    const name = el("span", "hours-day", day.name + " ");
    const tag = el("span", "today-tag", "Today");
    tag.hidden = true;
    name.appendChild(tag);
    li.appendChild(name);
    li.appendChild(el("span", "hours-time", hoursText(i)));
    hoursList.appendChild(li);
  });

  // "Mon to Sat: 9 am to 8:30 pm" and "Sun: 9 am to 1 pm" for the contact card.
  const groups = [];
  DAYS.forEach((day, i) => {
    const text = hoursText(i);
    const last = groups[groups.length - 1];
    if (last && last.text === text) { last.to = i; } else { groups.push({ from: i, to: i, text: text }); }
  });
  $("#contactHours").replaceChildren(...groups.map((group) => {
    const days = groups.length === 1 ? "Every day" : group.from === group.to ? DAYS[group.from].key : DAYS[group.from].key + " to " + DAYS[group.to].key;
    return el("span", "hours-line", days + ": " + group.text);
  }));

  // The hours most days share, for the tick under the headline.
  let usual = null;
  const tally = {};
  DAYS.forEach((day, i) => {
    const hours = hoursOf(i);
    if (!hours) { return; }
    const key = hours.start + "-" + hours.end;
    tally[key] = (tally[key] || 0) + 1;
    if (!usual || tally[key] > tally[usual.key]) { usual = { key: key, start: hours.start, end: hours.end }; }
  });
  if (usual) { $("#trustHours").textContent = usual.end - usual.start >= DAY ? "Office open 24 hours, 7 days" : "Office open " + clock(usual.start) + " to " + clock(usual.end); }

  const paintOpen = () => {
    const now = new Date();
    const status = openStatus(now);
    $$("[data-open-badge]").forEach((node) => {
      node.hidden = false;
      node.classList.toggle("is-open", status.open);
      node.classList.toggle("is-closed", !status.open);
      const text = node.dataset.openBadge === "full" ? status.full : status.short;
      const label = $("[data-open-text]", node);
      if (label.textContent !== text) { label.textContent = text; }
    });
    const today = todayIndex(now);
    Array.from(hoursList.children).forEach((li, i) => {
      li.classList.toggle("is-today", i === today);
      $(".today-tag", li).hidden = i !== today;
    });
  };

  // ---------------------------------------------------------------------
  // Courses: the class buttons, the fee card with its "pay once / in 3 parts" switch,
  // and the batches with timings and seats left.
  // ---------------------------------------------------------------------
  const courseChips = $("#courseChips");
  const courseCard = $("#courseCard");
  const batchList = $("#batchList");
  const state = { course: courseById(START_COURSE) ? START_COURSE : COURSES[0].id, pay: "once" };

  const sum = (list) => list.reduce((total, n) => total + n, 0);
  const feeSums = (course) => {
    const partsTotal = sum(course.parts);
    return { once: course.once, parts: partsTotal, saving: Math.max(0, partsTotal - course.once) };
  };

  // "Morning batch", "Afternoon batch" or "Evening batch", from the start time.
  const batchKind = (batch) => {
    const start = toMinutes(batch.from);
    return start < 720 ? "Morning batch" : start < 900 ? "Afternoon batch" : "Evening batch";
  };
  const batchWhen = (batch) => clock(toMinutes(batch.from)) + " to " + clock(toMinutes(batch.to));

  const buildCourseCard = (course) => {
    const sums = feeSums(course);
    const nodes = [];
    if (course.popular) { nodes.push(el("span", "course-flag", "Most joined")); }

    const head = el("div", "course-head");
    const dotLine = el("p", "type-line");
    const dot = el("i", "type-dot group-" + course.group);
    dot.setAttribute("aria-hidden", "true");
    dotLine.appendChild(dot);
    dotLine.appendChild(el("span", "", course.boards));
    head.appendChild(dotLine);
    head.appendChild(el("h3", "course-name", course.name));
    head.appendChild(el("p", "course-line", course.line));
    nodes.push(head);

    const subjects = el("ul", "subjects");
    subjects.setAttribute("aria-label", "Subjects");
    course.subjects.forEach((subject) => {
      const li = el("li", "subject");
      li.appendChild(icon(subjectIcon(subject)));
      li.appendChild(el("span", "", subject));
      subjects.appendChild(li);
    });
    nodes.push(subjects);

    // The switch between paying once and paying in 3 parts.
    const seg = el("div", "seg pay-seg");
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", "How to pay");
    [["once", "Pay once"], ["parts", "In 3 parts"]].forEach(([value, label]) => {
      const button = el("button", "seg-btn", label);
      button.type = "button";
      setPressed(button, state.pay === value);
      button.addEventListener("click", () => {
        if (state.pay === value) { return; }
        state.pay = value;
        paintCourse(true);
      });
      seg.appendChild(button);
    });
    nodes.push(seg);

    const price = el("p", "course-price");
    const total = state.pay === "once" ? sums.once : sums.parts;
    price.appendChild(el("strong", "", inr(total)));
    price.appendChild(document.createTextNode(" "));
    price.appendChild(el("span", "", state.pay === "once" ? "for the year" : "for the year, in 3 parts"));
    nodes.push(price);

    const sub = el("p", "course-sub");
    if (state.pay === "once") {
      sub.appendChild(el("span", "", "About " + inr(course.once / CONFIG.termMonths) + " a month"));
      if (sums.saving > 0) {
        sub.appendChild(document.createTextNode(" "));
        sub.appendChild(el("span", "save", "Save " + inr(sums.saving)));
      }
    } else {
      sub.appendChild(el("span", "", course.parts.map((part, i) => inr(part) + " " + (INSTALMENT_DUE[i] || "")).join(", ")));
    }
    nodes.push(sub);

    const list = el("ul", "plan-list");
    course.includes.forEach((line) => {
      const li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", line));
      list.appendChild(li);
    });
    nodes.push(list);

    const join = el("a", "btn btn-brand btn-3d btn-block");
    join.dataset.ripple = "";
    join.target = "_blank";
    join.rel = "noopener";
    const payWords = state.pay === "once" ? "paid once, " + inr(sums.once) : "in 3 parts, " + inr(sums.parts);
    join.href = waLink("Hello " + firm + ", I want admission for " + course.name + " (" + payWords + "). Please tell me the next steps.");
    join.setAttribute("aria-label", "Ask for admission on WhatsApp: " + course.name + ", " + payWords);
    join.appendChild(icon("wa", true));
    join.appendChild(el("span", "", "Ask for admission"));
    nodes.push(join);
    return nodes;
  };

  const buildBatch = (course, batch, index) => {
    const full = batch.left <= 0;
    const li = el("li", full ? "batch is-full" : "batch");
    li.style.setProperty("--i", String(index));

    const time = el("div", "slot-time");
    const parts = clock(toMinutes(batch.from)).split(" ");
    time.appendChild(el("strong", "", parts[0]));
    if (parts[1]) {
      time.appendChild(document.createTextNode(" "));
      time.appendChild(el("span", "", parts[1]));
    }
    li.appendChild(time);

    const main = el("div", "slot-main");
    const kind = el("p", "type-line");
    const dot = el("i", "type-dot group-" + course.group);
    dot.setAttribute("aria-hidden", "true");
    kind.appendChild(dot);
    kind.appendChild(el("span", "", batchKind(batch)));
    kind.appendChild(document.createTextNode(" "));
    const seats = full
      ? el("span", "tag tag-full", "Batch full")
      : el("span", batch.left <= 5 ? "tag tag-few" : "tag", (batch.left <= 5 ? "Only " : "") + batch.left + (batch.left === 1 ? " seat left" : " seats left"));
    kind.appendChild(seats);
    main.appendChild(kind);
    main.appendChild(el("h4", "batch-days", batch.days));
    main.appendChild(el("p", "slot-meta", batchWhen(batch)));
    li.appendChild(main);

    // On a phone the button just says "Demo"; wider screens have room for the full words.
    const book = el("a", "btn btn-ghost btn-sm slot-book");
    book.dataset.ripple = "";
    book.target = "_blank";
    book.rel = "noopener";
    const when = batch.days + " at " + clock(toMinutes(batch.from));
    if (full) {
      book.href = waLink("Hello " + firm + ", the " + course.name + " batch on " + when + " is full. Please add my child to the waiting list.");
      book.setAttribute("aria-label", "Join the waiting list on WhatsApp: " + course.name + ", " + when);
      book.appendChild(icon("wa", true));
      book.appendChild(el("span", "label-short", "Waitlist"));
      book.appendChild(el("span", "label-long", "Join waitlist"));
    } else {
      book.href = waLink("Hello " + firm + ", I want a free demo class in the " + course.name + " batch on " + when + ". Please confirm a date.");
      book.setAttribute("aria-label", "Book a free demo class on WhatsApp: " + course.name + ", " + when);
      book.appendChild(icon("wa", true));
      book.appendChild(el("span", "label-short", "Demo"));
      book.appendChild(el("span", "label-long", "Book a demo"));
    }
    li.appendChild(book);
    return li;
  };

  // Paint the card and the batches for the chosen course.
  // keepFocus: after the pay switch, the same switch button keeps the keyboard focus.
  const paintCourse = (keepFocus) => {
    const course = courseById(state.course);
    const focusedPay = keepFocus && courseCard.contains(document.activeElement);
    courseCard.className = course.popular ? "course-card is-popular" : "course-card";
    courseCard.replaceChildren(...buildCourseCard(course));
    if (focusedPay) {
      const target = $$(".pay-seg .seg-btn", courseCard)[state.pay === "once" ? 0 : 1];
      if (target) { target.focus({ preventScroll: true }); }
    }
    batchList.replaceChildren(...course.batches.map((batch, i) => buildBatch(course, batch, i)));
    $("#batchesTitle").textContent = "Batches for " + course.chip;
    const open = course.batches.filter((batch) => batch.left > 0).length;
    $("#batchesNote").textContent = course.batches.length + (course.batches.length === 1 ? " batch" : " batches") +
      (open < course.batches.length ? ", " + (course.batches.length - open) + " full" : "") + ". Seats left are updated every evening.";
  };

  // Keep the picked course in view when the row of buttons is wider than the phone.
  const showChip = (button) => {
    const row = button.parentElement;
    row.scrollLeft += button.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - button.offsetWidth) / 2;
  };

  const setCourse = (id) => {
    state.course = id;
    $$(".chip", courseChips).forEach((button) => setPressed(button, button.dataset.course === id));
    paintCourse(false);
    const picked = $$(".chip", courseChips).find((button) => button.dataset.course === id);
    if (picked) { showChip(picked); }
  };

  COURSES.forEach((course) => {
    const button = el("button", "chip", course.chip);
    button.type = "button";
    button.dataset.course = course.id;
    button.addEventListener("click", () => setCourse(course.id));
    courseChips.appendChild(button);
  });

  // The lowest monthly fee on the page, for the link under the headline.
  const lowest = Math.min(...COURSES.map((course) => course.once / CONFIG.termMonths));
  $("#heroFrom").textContent = inr(lowest);
  $("#trustBatch").textContent = CONFIG.maxBatch + " students at most in a batch";

  // ---------------------------------------------------------------------
  // Free demo classes: the 3D carousel of the next six, and the small card on the top photo.
  // The turning is done by ../fx/fx.js.
  // ---------------------------------------------------------------------
  const demosOn = (dayIndex) =>
    (DEMO_CLASSES[DAYS[dayIndex].key] || []).slice().sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  // The next demo classes from this minute onward: the rest of today, then tomorrow, and so on.
  // ahead: 0 for today, 1 for tomorrow, 2 and more for later in the week.
  const upcoming = (limit) => {
    const now = new Date();
    const today = todayIndex(now);
    const minute = now.getHours() * 60 + now.getMinutes();
    const list = [];
    for (let ahead = 0; ahead <= 7 && list.length < limit; ahead += 1) {
      const dayIndex = (today + ahead) % 7;
      demosOn(dayIndex).forEach((item) => {
        const start = toMinutes(item.time);
        if ((ahead === 0 && start <= minute) || (ahead === 7 && start > minute) || list.length >= limit) { return; }
        list.push({ item: item, day: DAYS[dayIndex], ahead: ahead });
      });
    }
    return list;
  };
  const dayWord = (entry) => (entry.ahead === 0 ? "Today" : entry.ahead === 1 ? "Tomorrow" : entry.day.name);
  const demoTitle = (item) => (courseById(item.course) || { chip: "" }).chip + " " + item.subject;
  const withTeacher = (item) => {
    const person = teacherFor(item.by);
    return person ? "with " + person.called : item.by;
  };
  const demoLink = (item, day) =>
    waLink("Hello " + firm + ", I want to book the free demo class " + demoTitle(item) + " on " + day.name + " at " + clock(toMinutes(item.time)) + " for my child. Please confirm.");

  const ringTrack = $("#ringTrack");
  const comingUp = upcoming(6);
  if (ringTrack && comingUp.length >= 3) {
    comingUp.forEach((entry) => {
      const item = entry.item;
      const course = courseById(item.course) || COURSES[0];
      const when = clock(toMinutes(item.time));
      const card = el("article", "ring-card");

      const top = el("div", "ring-top group-" + course.group);
      const big = icon(subjectIcon(item.by));
      big.classList.add("ring-ico");
      top.appendChild(big);
      top.appendChild(el("span", "ring-day", dayWord(entry)));
      top.appendChild(el("strong", "ring-time", when));
      card.appendChild(top);

      const body = el("div", "ring-body");
      const line = el("p", "type-line");
      const dot = el("i", "type-dot group-" + course.group);
      dot.setAttribute("aria-hidden", "true");
      line.appendChild(dot);
      line.appendChild(el("span", "", course.name));
      body.appendChild(line);
      body.appendChild(el("h3", "", item.subject + " demo"));
      body.appendChild(el("p", "ring-meta", "Free, " + withTeacher(item)));
      const book = el("a", "btn btn-brand btn-sm btn-3d");
      book.dataset.ripple = "";
      book.target = "_blank";
      book.rel = "noopener";
      book.draggable = false;
      book.href = demoLink(item, entry.day);
      book.setAttribute("aria-label", "Book this free demo on WhatsApp: " + demoTitle(item) + ", " + entry.day.name + " at " + when);
      book.appendChild(icon("wa", true));
      book.appendChild(el("span", "", "Book this demo"));
      body.appendChild(book);
      card.appendChild(body);
      ringTrack.appendChild(card);
    });
  } else if (ringTrack) {
    $("#next").hidden = true;   // fewer than three demo classes in the whole week: no carousel
  }

  const paintHeroNext = () => {
    const entry = upcoming(1)[0];
    const card = $("#heroNext");
    card.hidden = !entry;
    if (!entry) { return; }
    const label = "Next free demo " + (entry.ahead > 1 ? "on " + entry.day.name : dayWord(entry).toLowerCase());
    if ($("#heroNextWhen").textContent !== label) { $("#heroNextWhen").textContent = label; }
    $("#heroNextName").textContent = demoTitle(entry.item);
    $("#heroNextTime").textContent = clock(toMinutes(entry.item.time)) + ", " + withTeacher(entry.item);
  };

  // ---------------------------------------------------------------------
  // How we teach: the four steps and the drawn report card with its marks chart
  // ---------------------------------------------------------------------
  $("#steps").replaceChildren(...STEPS.map((step, i) => {
    const li = el("li", "step");
    const badge = el("span", "step-ico");
    badge.appendChild(icon(step.icon));
    li.appendChild(badge);
    const words = el("div");
    words.appendChild(el("p", "step-n", "Step " + (i + 1)));
    words.appendChild(el("h3", "", step.title));
    words.appendChild(el("p", "step-text", step.text));
    li.appendChild(words);
    return li;
  }));

  const reportTeacher = teacherFor(REPORT.teacher);
  $("#reportStudent").textContent = REPORT.student;
  $("#reportClass").textContent = REPORT.class;
  $("#reportAttend").textContent = REPORT.attendance + "%";
  $("#reportRemark").textContent = REPORT.remark;
  $("#reportSign").textContent = reportTeacher ? reportTeacher.called : REPORT.teacher + " teacher";

  // The chart: the eight Sunday test marks as a rising line, drawn once.
  const chart = $("#reportChart");
  const marks = REPORT.marks.slice(-8);
  if (marks.length >= 2) {
    const box = { left: 26, right: 290, top: 14, bottom: 100 };
    const low = Math.max(0, Math.floor((Math.min(...marks) - 10) / 10) * 10);
    const high = 100;
    const xAt = (i) => box.left + (i / (marks.length - 1)) * (box.right - box.left);
    const yAt = (mark) => box.bottom - ((mark - low) / (high - low)) * (box.bottom - box.top);
    [low, Math.round((low + high) / 2), high].forEach((mark) => {
      chart.appendChild(shape("line", { x1: box.left, x2: box.right, y1: yAt(mark), y2: yAt(mark), class: "chart-grid" }));
      const label = shape("text", { x: box.left - 6, y: yAt(mark) + 3.5, "text-anchor": "end", class: "chart-label" });
      label.textContent = String(mark);
      chart.appendChild(label);
    });
    const points = marks.map((mark, i) => xAt(i).toFixed(1) + " " + yAt(mark).toFixed(1));
    chart.appendChild(shape("path", { d: "M" + points.join("L") + "L" + box.right + " " + box.bottom + "L" + box.left + " " + box.bottom + "z", class: "chart-area" }));
    chart.appendChild(shape("path", { d: "M" + points.join("L"), class: "chart-line", pathLength: "1" }));
    marks.forEach((mark, i) => {
      const last = i === marks.length - 1;
      chart.appendChild(shape("circle", { cx: xAt(i).toFixed(1), cy: yAt(mark).toFixed(1), r: last ? 5 : 3, class: last ? "chart-dot is-last" : "chart-dot" }));
    });
    const tip = shape("text", { x: (xAt(marks.length - 1) - 9).toFixed(1), y: (yAt(marks[marks.length - 1]) - 9).toFixed(1), "text-anchor": "end", class: "chart-tip" });
    tip.textContent = String(marks[marks.length - 1]);
    chart.appendChild(tip);
    $("#reportLive").textContent = REPORT.student.split(" ")[0] + " went from " + marks[0] + " to " + marks[marks.length - 1] +
      " out of 100 in " + marks.length + " Sunday tests.";
    $("#reportStage").setAttribute("aria-label",
      "Sample monthly report card from " + firm + " for " + REPORT.student + ", " + REPORT.class + ". Attendance " + REPORT.attendance +
      "%. Sunday test marks rose from " + marks[0] + " to " + marks[marks.length - 1] + ". Teacher's note: " + REPORT.remark);
  }

  // ---------------------------------------------------------------------
  // Results wall: a year switch and the toppers of that year
  // ---------------------------------------------------------------------
  const yearSeg = $("#yearSeg");
  const toppersBox = $("#toppers");
  const latest = RESULT_YEARS[0];

  const initials = (name) => String(name).split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase();
  const decimalsOf = (n) => (String(n).split(".")[1] || "").length;
  const scoreText = (n, decimals) => n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const examKind = (exam) => (/jee/i.test(exam) ? "jee" : /neet/i.test(exam) ? "neet" : /12/.test(exam) ? "twelve" : "ten");

  const buildTopper = (person, index) => {
    const li = el("li", person.top ? "topper is-top" : "topper");
    li.style.setProperty("--i", String(index));
    if (person.top) {
      // A drawn rosette with ribbons, like the ones pinned on a school notice board.
      const rosette = shape("svg", { viewBox: "0 0 80 104", class: "rosette", "aria-hidden": "true", focusable: "false" });
      rosette.appendChild(shape("path", { d: "M25 54L13 100l15-8 9 12 6-44z", fill: "#c3302a" }));
      rosette.appendChild(shape("path", { d: "M55 54l12 46-15-8-9 12-6-44z", fill: "#9f231c" }));
      rosette.appendChild(shape("circle", { cx: 40, cy: 38, r: 35, fill: "#ffc93c" }));
      rosette.appendChild(shape("circle", { cx: 40, cy: 38, r: 27.5, fill: "none", stroke: "#111a3a", "stroke-opacity": ".28", "stroke-width": "1.6", "stroke-dasharray": "3 3" }));
      const rank = shape("text", { x: 40, y: 46, "text-anchor": "middle", class: "rosette-text" });
      rank.textContent = "1st";
      rosette.appendChild(rank);
      li.appendChild(rosette);
    }
    const medal = el("span", "medal medal-" + examKind(person.exam), initials(person.name));
    medal.setAttribute("aria-hidden", "true");
    li.appendChild(medal);

    const words = el("div", "topper-words");
    if (person.top) {
      const flag = el("p", "topper-flag");
      flag.appendChild(icon("star", true));
      flag.appendChild(el("span", "", "Centre topper"));
      words.appendChild(flag);
    }
    const score = el("p", "topper-score");
    const decimals = decimalsOf(person.score);
    const num = el("strong", "score-num", scoreText(person.score, decimals));
    num.dataset.score = String(person.score);
    num.dataset.decimals = String(decimals);
    score.appendChild(num);
    score.appendChild(el("span", "score-unit", person.unit));
    words.appendChild(score);
    words.appendChild(el("h3", "", person.name));
    words.appendChild(el("p", "topper-exam", person.exam));
    if (person.note) { words.appendChild(el("p", "topper-note", person.note)); }
    li.appendChild(words);
    return li;
  };

  // Scores count up from a little lower when a year is shown.
  const countScore = (node) => {
    const target = Number(node.dataset.score);
    const decimals = Number(node.dataset.decimals) || 0;
    if (!Number.isFinite(target) || reduceMotion) { return; }
    const from = target * 0.82;
    const started = performance.now();
    const duration = 800;
    let done = false;
    const step = (now) => {
      if (done) { return; }
      const t = Math.min(1, (now - started) / duration);
      node.textContent = scoreText(from + (target - from) * (1 - Math.pow(1 - t, 3)), decimals);
      if (t < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
    // Safety net: always land on the real number, even if the browser pauses the animation.
    window.setTimeout(() => { done = true; node.textContent = scoreText(target, decimals); }, duration + 150);
  };

  let resultsSeen = false;
  const setYear = (year, animate) => {
    const row = RESULT_YEARS.find((item) => item.year === year) || latest;
    $$(".seg-btn", yearSeg).forEach((button) => setPressed(button, Number(button.dataset.year) === row.year));
    const people = TOPPERS.filter((person) => person.year === row.year)
      .sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0));
    toppersBox.replaceChildren(...people.map(buildTopper));
    $("#resultsSum").textContent = row.year + ": " + row.above90 + " of our " + row.students +
      " board students scored 90% and above. The class average was " + row.average + "%.";
    if (animate) { $$(".score-num", toppersBox).forEach(countScore); }
  };
  RESULT_YEARS.forEach((row) => {
    const button = el("button", "seg-btn", String(row.year));
    button.type = "button";
    button.dataset.year = String(row.year);
    button.addEventListener("click", () => setYear(row.year, true));
    yearSeg.appendChild(button);
  });

  // ---------------------------------------------------------------------
  // Teachers: drawn faces, so no photo of a real person is needed
  // ---------------------------------------------------------------------
  // The six drawn faces. hair: "short", "bun", "long" or "tail".   extra: "glasses" or "beard".
  const FACES = [
    { back: "#e3e9fc", skin: "#c98d5e", hair: "#5b5650", top: "#111a3a", style: "short", extra: "glasses" },
    { back: "#fff0c2", skin: "#b0764a", hair: "#17130f", top: "#2446d8", style: "short", extra: "" },
    { back: "#e3e9fc", skin: "#a86f45", hair: "#1f1712", top: "#1a33a8", style: "short", extra: "beard" },
    { back: "#fff0c2", skin: "#c98d5e", hair: "#1f1712", top: "#2446d8", style: "bun", extra: "glasses" },
    { back: "#e3e9fc", skin: "#dba878", hair: "#2a1d14", top: "#111a3a", style: "long", extra: "" },
    { back: "#fff0c2", skin: "#b0764a", hair: "#17130f", top: "#1a33a8", style: "tail", extra: "" }
  ];

  const drawFace = (look) => {
    const face = FACES[(Math.max(1, Number(look) || 1) - 1) % FACES.length];
    const svg = shape("svg", { viewBox: "0 0 64 64", class: "member-face", "aria-hidden": "true" });
    svg.appendChild(shape("rect", { width: 64, height: 64, fill: face.back }));
    // Hair that falls behind the head is drawn first.
    if (face.style === "long") { svg.appendChild(shape("path", { d: "M18 30c0-11 5.5-18 14-18s14 7 14 18v18H18z", fill: face.hair })); }
    if (face.style === "tail") { svg.appendChild(shape("path", { d: "M40 16c8 1 11 8 9 17-1 5-3 8-6 10 1-5 1-9-1-13z", fill: face.hair })); }
    if (face.style === "bun") { svg.appendChild(shape("circle", { cx: 32, cy: 11, r: 5.5, fill: face.hair })); }
    svg.appendChild(shape("path", { d: "M9 64c0-12 9.5-19 23-19s23 7 23 19z", fill: face.top }));
    // A shirt collar, since teachers dress for class.
    svg.appendChild(shape("path", { d: "M25.5 46.5l6.5 7 6.5-7-2.2-1.8L32 49.4l-4.3-4.7z", fill: "#fff", opacity: ".92" }));
    svg.appendChild(shape("path", { d: "M27 38h10v7.5a5 5 0 0 1-10 0z", fill: face.skin }));
    svg.appendChild(shape("path", { d: "M27 41.5c3 2 7 2 10 0V38H27z", fill: "#000", opacity: ".14" }));
    svg.appendChild(shape("ellipse", { cx: 32, cy: 28, rx: 10.5, ry: 12.5, fill: face.skin }));
    svg.appendChild(shape("path", { d: "M21 28c-1-9 3.5-15 11-15s12 6 11 15c-1.5-4.5-5-7-11-7s-9.5 2.5-11 7z", fill: face.hair }));
    if (face.extra === "beard") {
      svg.appendChild(shape("path", { d: "M21.6 30c0 7 4.4 11 10.4 11s10.4-4 10.4-11c-2 4.5-5.8 6.5-10.4 6.5s-8.4-2-10.4-6.5z", fill: face.hair }));
    }
    if (face.extra === "glasses") {
      const frame = { fill: "rgba(255,255,255,.18)", stroke: "#111a3a", "stroke-width": "1.5" };
      svg.appendChild(shape("circle", Object.assign({ cx: 27.6, cy: 29, r: 3.7 }, frame)));
      svg.appendChild(shape("circle", Object.assign({ cx: 36.4, cy: 29, r: 3.7 }, frame)));
      svg.appendChild(shape("path", { d: "M31.3 28.6h1.4", stroke: "#111a3a", "stroke-width": "1.5", "stroke-linecap": "round" }));
    }
    return svg;
  };

  const yearsTeaching = (since) => Math.max(1, new Date().getFullYear() - since);
  $("#team").replaceChildren(...TEACHERS.map((person) => {
    const li = el("li", "member");
    li.appendChild(drawFace(person.look));
    const words = el("div");
    const name = el("h3", "", person.name);
    words.appendChild(name);
    words.appendChild(el("p", "member-role", person.subject + " · " + person.called));
    words.appendChild(el("p", "member-degree", person.degree + ", " + yearsTeaching(person.since) + " years teaching"));
    words.appendChild(el("p", "member-text", person.text));
    li.appendChild(words);
    return li;
  }));

  // ---------------------------------------------------------------------
  // Gallery and the larger photo window
  // ---------------------------------------------------------------------
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbStage = $("#lbStage");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  let lbIndex = 0;
  let lbOpener = null;

  const lbShow = (index) => {
    lbIndex = (index + GALLERY.length) % GALLERY.length;
    const shot = GALLERY[lbIndex];
    lbImg.style.visibility = "";
    lbImg.alt = shot.caption;
    lbImg.src = photoUrl(shot.id, 1200, 800);
    $("#lbCaption").textContent = shot.caption;
    $("#lbCount").textContent = (lbIndex + 1) + " of " + GALLERY.length;
    // Fetch the following photo early so the arrow feels instant.
    if (GALLERY.length > 1) { new Image().src = photoUrl(GALLERY[(lbIndex + 1) % GALLERY.length].id, 1200, 800); }
  };
  lbImg.addEventListener("error", () => { lbImg.style.visibility = "hidden"; });

  const openLightbox = (index, opener) => {
    lbOpener = opener;
    lbShow(index);
    if (!lightbox.open) {
      if (typeof lightbox.showModal === "function") { lightbox.showModal(); } else { lightbox.setAttribute("open", ""); }
    }
    document.documentElement.classList.add("is-locked");
  };
  // Tidy up straight away when the window closes. The browser's own "close" message can
  // arrive a little late, so the close button and the Escape key do not wait for it.
  const unlockPage = () => document.documentElement.classList.remove("is-locked");
  const onLightboxClosed = () => {
    unlockPage();
    if (lbOpener) { lbOpener.focus(); }
    lbOpener = null;
  };
  const closeLightbox = () => {
    if (typeof lightbox.close === "function" && lightbox.open) { lightbox.close(); } else { lightbox.removeAttribute("open"); }
    onLightboxClosed();
  };
  lightbox.addEventListener("cancel", unlockPage);
  lightbox.addEventListener("close", onLightboxClosed);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) { closeLightbox(); } });
  $("#lbClose").addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () => lbShow(lbIndex - 1));
  lbNext.addEventListener("click", () => lbShow(lbIndex + 1));
  lbPrev.hidden = GALLERY.length < 2;
  lbNext.hidden = GALLERY.length < 2;
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); lbShow(lbIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); lbShow(lbIndex - 1); }
  });
  // A finger swipe left or right also moves between photos.
  let swipeFrom = null;
  lbStage.addEventListener("touchstart", (event) => { swipeFrom = event.changedTouches[0].clientX; }, { passive: true });
  lbStage.addEventListener("touchend", (event) => {
    if (swipeFrom === null) { return; }
    const moved = event.changedTouches[0].clientX - swipeFrom;
    swipeFrom = null;
    if (Math.abs(moved) > 40) { lbShow(lbIndex + (moved < 0 ? 1 : -1)); }
  }, { passive: true });

  $("#shots").replaceChildren(...GALLERY.map((shot, i) => {
    const li = el("li", "reveal");
    const button = el("button", "shot");
    button.type = "button";
    button.setAttribute("aria-label", "See larger photo: " + shot.caption);
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.width = 800;
    img.height = 600;
    img.addEventListener("error", () => img.remove());
    img.src = photoUrl(shot.id, 800, 600);
    button.appendChild(img);
    button.appendChild(el("span", "shot-cap", shot.caption));
    button.addEventListener("click", () => openLightbox(i, button));
    li.appendChild(button);
    return li;
  }));

  // ---------------------------------------------------------------------
  // Quick facts, worked out from the lists above
  // ---------------------------------------------------------------------
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");
  const setStat = (id, value) => {
    const node = $(id);
    node.textContent = grouped(value);
    node.dataset.count = String(value);
  };
  setStat("#statYears", Math.max(1, new Date().getFullYear() - CONFIG.since));
  setStat("#statStudents", CONFIG.studentsThisYear);
  setStat("#statToppers", latest.above90);
  setStat("#statBatch", CONFIG.maxBatch);
  $("#statToppersLabel").textContent = "scored 90% and above in " + latest.year;
  $("#heroScore").textContent = String(latest.above90);
  $("#heroScoreText").textContent = "students scored 90% and above in " + latest.year;

  // ---------------------------------------------------------------------
  // Movement: gentle entrance, counting numbers, header shadow, menu marker
  // ---------------------------------------------------------------------
  const countUp = (node) => {
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) { return; }
    const started = performance.now();
    const duration = 900;
    let done = false;
    const step = (now) => {
      if (done) { return; }
      const t = Math.min(1, (now - started) / duration);
      node.textContent = grouped(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
    // Safety net: always land on the real number, even if the browser pauses the animation.
    window.setTimeout(() => { done = true; node.textContent = grouped(target); }, duration + 150);
  };

  const reveals = $$(".reveal");
  reveals.forEach((node) => {
    const group = Array.from(node.parentElement.children).filter((child) => child.classList.contains("reveal"));
    node.style.setProperty("--d", String(Math.min(group.indexOf(node), 6)));
  });
  const showNode = (node) => {
    node.classList.add("is-in");
    $$(".stat-num", node).forEach(countUp);
  };
  // The report chart draws its line, and the toppers count up, the first time they come into view.
  const reportStage = $("#reportStage");
  const resultsSection = $("#results");
  const drawReport = () => reportStage.classList.add("is-drawn");
  const showResults = () => {
    if (resultsSeen) { return; }
    resultsSeen = true;
    $$(".score-num", toppersBox).forEach(countScore);
  };

  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { showNode(entry.target); revealer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((node) => revealer.observe(node));

    const once = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) { return; }
        if (entry.target === reportStage) { drawReport(); }
        if (entry.target === resultsSection) { showResults(); }
        once.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    once.observe(reportStage);
    once.observe(resultsSection);

    // Safety net: if the browser is slow to report what is on screen, show it anyway.
    window.setTimeout(() => {
      reveals.forEach((node) => {
        if (!node.classList.contains("is-in") && node.getBoundingClientRect().top < window.innerHeight) {
          showNode(node);
          revealer.unobserve(node);
        }
      });
      if (reportStage.getBoundingClientRect().top < window.innerHeight) { drawReport(); }
    }, 1200);

    const navLinks = $$(".nav a");
    const marker = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) { link.setAttribute("aria-current", "true"); }
          else { link.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.forEach((link) => {
      const section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) { marker.observe(section); }
    });
  } else {
    reveals.forEach((node) => node.classList.add("is-in"));
    drawReport();
  }

  const header = $("#top");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------------------
  // Enquiry form: opens WhatsApp with the message ready. Nothing is stored.
  // ---------------------------------------------------------------------
  const form = $("#enquiry");
  const formError = $("#formError");
  const courseSelect = $("#courseSelect");
  COURSES.map((course) => course.name).concat(["Not decided yet"]).forEach((label) => {
    courseSelect.appendChild(el("option", "", label));
  });
  courseSelect.value = courseById(state.course).name;
  // The name box says it has a problem only while the message is showing.
  const showNameError = (on) => {
    formError.hidden = !on;
    if (on) {
      form.elements.name.setAttribute("aria-invalid", "true");
      form.elements.name.setAttribute("aria-describedby", "formError");
    } else {
      form.elements.name.removeAttribute("aria-invalid");
      form.elements.name.removeAttribute("aria-describedby");
    }
  };
  form.elements.name.addEventListener("input", () => showNameError(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = clean(data.get("name"), 60);
    if (!name) {
      showNameError(true);
      form.elements.name.focus();
      return;
    }
    showNameError(false);
    const board = clean(data.get("board"), 30);
    const lines = [
      "Hello " + firm + ", my name is " + name + ".",
      "My child is in: " + data.get("course") + (board ? ", " + board : "") + ".",
      "I want to: " + data.get("need") + ", at your " + area + " centre."
    ];
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // ---------- First paint, then keep the live parts fresh ----------
  setCourse(state.course);
  setYear(latest.year, false);
  paintOpen();
  paintHeroNext();

  // Every half minute (and when the visitor comes back to the tab) check the clock again.
  const refresh = () => {
    paintOpen();
    paintHeroNext();
  };
  window.setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", refresh);
})();

// The four sample businesses for the WhatsApp assistant demo.
// Change names, hours, prices and answers here. app.js reads this file and does the rest.
//
//   hours     one line per day: a list of [opens, closes] on the 24-hour clock. [] means closed all day.
//   services  what the business sells. words: what customers type for it (English or Hinglish).
//             A word ending in * also matches longer words: "clean*" matches "cleaning".
//             price is in rupees. from: true shows "from 4,500".
//             {rs:500} inside an answer shows 500 rupees in the page's money (see owner.js).
//   faqs      common questions. en and hi are the answers in English and in Hinglish.
//             handoff: true also sends the chat to the owner. over: true answers instead of the address.
//             {ownerShort}, {area} and {firm} are filled in.
//   seed      what the owner view shows before the demo chat starts (earlier today).
//   script    the "Play the demo" conversation. "@book:Name" finishes a booking with that name,
//             "@chip:Label" taps a button, "@pay" taps the pay link, "@takeover" is the owner stepping in.
window.AGENT_BUSINESSES = [
  {
    kind: "clinic",
    label: "Dental clinic",
    word: "clinic",
    icon: "tooth",
    color: "#0e7490",
    firm: "White Arc Dental",
    area: "Bandra West",
    city: "Mumbai",
    address: "Shop 12, first floor, Sunrise Arcade",
    landmark: "Lift in the building. Parking on the lane outside.",
    owner: "Dr. Riya Mehta",
    ownerShort: "Dr. Riya",
    pronoun: "She",
    hours: {
      Mon: [["10:00", "13:30"], ["17:00", "21:00"]],
      Tue: [["10:00", "13:30"], ["17:00", "21:00"]],
      Wed: [["10:00", "13:30"], ["17:00", "21:00"]],
      Thu: [],
      Fri: [["10:00", "13:30"], ["17:00", "21:00"]],
      Sat: [["10:00", "13:30"], ["17:00", "21:00"]],
      Sun: [["10:00", "13:00"]]
    },
    booking: { noun: "appointment", nounPlural: "appointments", action: "Book appointment", askService: true, slotMins: 30, reminderHours: 2 },
    priceChip: "Price list",
    services: [
      { id: "consult", name: "Check-up", price: 500, mins: 20, words: ["check up", "checkup", "check-up", "consult*", "dikhana", "checking", "doctor ko dikhana"] },
      { id: "clean", name: "Teeth cleaning", price: 1500, mins: 45, words: ["clean*", "scaling", "safai", "polish*"] },
      { id: "filling", name: "Filling", price: 1200, from: true, mins: 40, words: ["filling*", "cavity", "cavities", "keeda", "kida"] },
      { id: "rct", name: "Root canal", price: 4500, from: true, mins: 60, words: ["root canal", "rct", "rootcanal"] },
      { id: "whitening", name: "Teeth whitening", price: 6000, mins: 60, words: ["whiten*", "white teeth", "safed", "yellow teeth", "peele"] },
      { id: "braces", name: "Braces or aligners", price: 35000, from: true, mins: 30, words: ["brace*", "aligner*", "teedhe", "tedhe", "crooked"] },
      { id: "implant", name: "Implant", price: 30000, from: true, mins: 30, words: ["implant*", "missing tooth", "new tooth"] },
      { id: "kids", name: "Child check-up", price: 400, mins: 20, words: ["kid", "kids", "child*", "bachch*", "baccha", "bacche", "my son", "my daughter", "beta", "beti"] }
    ],
    faqs: [
      { words: ["pain", "dard", "emergency", "urgent", "swelling", "sujan", "bleeding", "khoon", "toothache", "ache"], urgent: true,
        en: "Sorry you are in pain. I will get you the earliest free slot, and I have told {ownerShort} that you are coming.",
        hi: "Dard ke liye sorry. Main aapko sabse pehla free slot deta hoon, aur {ownerShort} ko bata diya hai ki aap aa rahe hain." },
      { words: ["insurance", "mediclaim", "claim", "tpa", "cashless"],
        en: "We give you a full bill and treatment notes for your insurance claim. We do not do cashless.",
        hi: "Insurance claim ke liye full bill aur treatment notes milenge. Cashless nahi hota." },
      { words: ["emi", "installment*", "instalment*", "kisht*", "part payment"],
        en: "Yes. Braces and implants can be paid in parts, month by month. {ownerShort} explains the plan at the check-up.",
        hi: "Haan. Braces aur implant ka payment mahine-mahine mein kar sakte hain. {ownerShort} check-up pe plan samjha dengi." },
      { words: ["x ray", "xray", "x-ray", "opg"],
        en: "Yes, we take digital X-rays in the clinic. You hear the cost before we take one.",
        hi: "Haan, clinic mein digital X-ray hota hai. X-ray se pehle cost bata dete hain." },
      { words: ["painless", "hurt", "darr", "dar lagta", "scared", "afraid"],
        en: "Most treatments are done with a numbing gel and local anaesthetic, so you feel very little. Tell {ownerShort} if you are nervous and she will go slowly.",
        hi: "Zyada tar treatment numbing gel aur injection ke saath hota hai, toh dard bahut kam hota hai. Darr lagta ho toh {ownerShort} ko bata dijiye, woh dheere karengi." }
    ],
    seed: {
      chatCount: 17,
      bookings: [
        { time: "10:30", name: "Aman K.", what: "Check-up", price: 500 },
        { time: "12:00", name: "Farah S.", what: "Teeth cleaning", price: 1500 },
        { time: "18:30", name: "Vikram P.", what: "Root canal, 2nd visit", price: 4500 }
      ],
      handoffs: [{ name: "Mrs. Shah", text: "Wants last week's X-ray report sent on WhatsApp", ago: 48 }],
      chats: [
        { name: "Farah S.", text: "Booked teeth cleaning", tag: "Booked", ago: 95 },
        { name: "+91 98XXX XX231", text: "Asked: open on Sunday?", tag: "Answered", ago: 70 },
        { name: "Mrs. Shah", text: "Wants last week's X-ray report", tag: "Needs you", ago: 48 },
        { name: "Vikram P.", text: "Confirmed the 6:30 pm visit", tag: "Answered", ago: 22 }
      ],
      topics: { "timings": 5, "price of cleaning": 4, "braces cost": 2 }
    },
    script: ["Hi", "timing kya hai?", "cleaning ka price kitna hai", "kal shaam 5 baje appointment chahiye", "@book:Sana", "Do you sell electric toothbrushes?", "@takeover"]
  },

  {
    kind: "gym",
    label: "Gym",
    word: "gym",
    icon: "dumbbell",
    color: "#c2410c",
    firm: "Ironleaf Fitness",
    area: "Andheri West",
    city: "Mumbai",
    address: "2nd floor, Sunrise Arcade",
    landmark: "2 minutes from the station.",
    owner: "Rohan Desai",
    ownerShort: "Rohan",
    pronoun: "He",
    hours: {
      Mon: [["06:00", "23:00"]], Tue: [["06:00", "23:00"]], Wed: [["06:00", "23:00"]],
      Thu: [["06:00", "23:00"]], Fri: [["06:00", "23:00"]], Sat: [["06:00", "23:00"]],
      Sun: [["07:00", "14:00"]]
    },
    booking: { noun: "free trial", nounPlural: "free trials", action: "Book free trial", askService: false, service: "Free trial session", slotMins: 60, reminderHours: 2 },
    priceChip: "Membership price",
    services: [
      { id: "gym", name: "Gym only", price: 2500, unit: "a month", note: "{rs:6600} for 3 months", mins: 60, words: ["gym only", "only gym", "basic"] },
      { id: "classes", name: "Gym + classes", price: 3500, unit: "a month", note: "Zumba, yoga and HIIT included", mins: 60, words: ["class", "classes", "zumba", "yoga", "hiit", "group class*"] },
      { id: "pt", name: "Personal training", price: 9000, unit: "a month", note: "12 sessions with your own trainer", mins: 60, words: ["personal train*", "pt", "own trainer", "personal coach"] },
      { id: "trial", name: "Free trial session", price: 0, mins: 60, words: ["trial", "free session", "demo class", "free class", "try"] }
    ],
    faqs: [
      { words: ["women", "ladies", "lady", "girls", "female", "mahila"],
        en: "Yes. The 11 am batch, Monday to Friday, is only for women, with a woman trainer on the floor.",
        hi: "Haan. Monday se Friday 11 am wala batch sirf ladies ke liye hai, lady trainer ke saath." },
      { words: ["parking", "park", "bike", "car"],
        en: "Yes, free parking for bikes in the building. Cars can park on the lane outside.",
        hi: "Haan, building mein bike parking free hai. Car bahar lane mein park ho jaati hai." },
      { words: ["joining fee", "admission", "registration"],
        en: "There is no joining fee. You pay only the plan price.",
        hi: "Koi joining fee nahi hai. Sirf plan ka price." },
      { words: ["steam", "shower", "locker*", "changing"],
        en: "Yes. Lockers, showers and a steam room are free for members.",
        hi: "Haan. Locker, shower aur steam room members ke liye free hai." },
      { words: ["diet", "weight loss", "fat loss", "vazan", "wazan", "motapa"],
        en: "Every plan comes with a starter workout plan. Personal training also includes a diet chart made for you.",
        hi: "Har plan ke saath workout plan milta hai. Personal training mein aapke liye diet chart bhi banta hai." },
      { words: ["beginner", "first time", "never", "pehli baar"],
        en: "Most members start as beginners. A trainer plans your first month and checks your form.",
        hi: "Zyada tar members beginner hi hote hain. Trainer pehla mahina plan karta hai aur form check karta hai." }
    ],
    seed: {
      chatCount: 21,
      bookings: [
        { time: "07:00", name: "Karan J.", what: "Free trial", price: 0 },
        { time: "18:00", name: "Neha R.", what: "Free trial", price: 0 },
        { time: "19:00", name: "Aditya M.", what: "Joined: Gym + classes, 3 months", price: 9300 }
      ],
      handoffs: [{ name: "Siddharth", text: "Wants to pause his membership for 3 weeks", ago: 35 }],
      chats: [
        { name: "Aditya M.", text: "Asked about classes, joined today", tag: "Booked", ago: 120 },
        { name: "+91 99XXX XX508", text: "Asked: women's batch timing", tag: "Answered", ago: 64 },
        { name: "Siddharth", text: "Wants to pause membership", tag: "Needs you", ago: 35 },
        { name: "Neha R.", text: "Booked a free trial, 6 pm", tag: "Booked", ago: 18 }
      ],
      topics: { "membership price": 7, "timings": 4, "women's batch": 3 }
    },
    script: ["Hello", "membership ka price kya hai?", "kal subah 7 baje free trial chahiye", "@book:Arjun", "parking hai kya?", "Do you have a swimming pool?", "@takeover"]
  },

  {
    kind: "salon",
    label: "Salon",
    word: "salon",
    icon: "scissors",
    color: "#9d174d",
    firm: "Plum & Ivy Salon",
    area: "Powai",
    city: "Mumbai",
    address: "Shop 5, first floor, Sunrise Arcade",
    landmark: "Above the chemist, with a lift.",
    owner: "Neha Kapoor",
    ownerShort: "Neha",
    pronoun: "She",
    hours: {
      Mon: [["10:00", "21:00"]], Tue: [["10:00", "21:00"]], Wed: [["10:00", "21:00"]],
      Thu: [["10:00", "21:00"]], Fri: [["10:00", "21:00"]], Sat: [["09:00", "21:30"]],
      Sun: [["09:00", "20:00"]]
    },
    booking: { noun: "appointment", nounPlural: "appointments", action: "Book appointment", askService: true, slotMins: 30, reminderHours: 2 },
    priceChip: "Price list",
    services: [
      { id: "cut-w", name: "Haircut and blow-dry", price: 700, mins: 45, words: ["haircut", "hair cut", "cut", "baal", "bal", "trim", "katwana"], men: "cut-m" },
      { id: "cut-m", name: "Men's haircut", price: 350, mins: 30, words: ["men* haircut", "gents", "mens cut", "boys cut", "haircut for men"] },
      { id: "beard", name: "Beard trim", price: 200, mins: 20, words: ["beard", "dadhi", "daadhi", "shave"] },
      { id: "spa", name: "Hair spa", price: 900, mins: 45, words: ["hair spa", "spa"] },
      { id: "colour", name: "Hair colour", price: 3500, from: true, mins: 120, words: ["colour", "color", "highlight*", "global", "mehendi colour"] },
      { id: "keratin", name: "Keratin smoothing", price: 5500, from: true, mins: 180, words: ["keratin", "smoothing", "straight*", "rebond*", "frizz*"] },
      { id: "facial", name: "Glow facial", price: 1500, mins: 60, words: ["facial", "glow", "cleanup", "clean up", "clean-up"] },
      { id: "thread", name: "Threading", price: 80, mins: 10, words: ["thread*", "eyebrow*", "upper lip"] },
      { id: "wax", name: "Waxing, full arms", price: 350, mins: 20, words: ["wax*"] },
      { id: "mani", name: "Manicure", price: 500, mins: 30, words: ["manicure", "mani", "nails", "nail"] },
      { id: "pedi", name: "Pedicure", price: 700, mins: 40, words: ["pedicure", "pedi"] },
      { id: "party", name: "Party make-up", price: 2500, mins: 60, words: ["makeup", "make up", "make-up", "party"] },
      { id: "bridal", name: "Bridal make-up and hair", price: 15000, from: true, mins: 180, words: ["bridal", "bride", "wedding", "shaadi", "dulhan"] }
    ],
    faqs: [
      { words: ["home service", "home visit", "ghar pe", "ghar par", "at home", "come home"],
        en: "Home visits are only for bridal make-up. Everything else is done at the salon.",
        hi: "Ghar pe service sirf bridal make-up ke liye hai. Baaki sab salon mein hota hai." },
      { words: ["unisex", "men allowed", "gents allowed", "ladies only", "only ladies", "only for women", "do you do men", "for men too", "boys allowed"],
        en: "Yes, we are unisex. Farhan, our barber, does men's cuts, beard styling and champi.",
        hi: "Haan, unisex salon hai. Farhan, hamare barber, men's cut, beard aur champi karte hain." },
      { words: ["products", "brand", "chemical", "ammonia"],
        en: "We use ammonia-free colour and salon-grade products. Ask your stylist to show you the pack.",
        hi: "Ammonia-free colour aur salon-grade products use karte hain. Stylist pack dikha dengi." },
      { words: ["parking", "park"],
        en: "There is paid parking in the building basement and free bike parking outside.",
        hi: "Building basement mein paid parking hai, bike parking bahar free hai." }
    ],
    seed: {
      chatCount: 19,
      bookings: [
        { time: "11:00", name: "Pooja", what: "Hair spa", price: 900 },
        { time: "16:30", name: "Ritu", what: "Glow facial", price: 1500 },
        { time: "18:00", name: "Kabir", what: "Men's haircut, beard trim", price: 550 }
      ],
      handoffs: [{ name: "Aisha", text: "Bridal package for 12 December, wants a call", ago: 52 }],
      chats: [
        { name: "Ritu", text: "Booked a glow facial", tag: "Booked", ago: 110 },
        { name: "+91 97XXX XX774", text: "Asked: keratin price", tag: "Answered", ago: 80 },
        { name: "Aisha", text: "Bridal package, wants a call", tag: "Needs you", ago: 52 },
        { name: "Kabir", text: "Booked haircut and beard", tag: "Booked", ago: 26 }
      ],
      topics: { "haircut price": 6, "bridal": 3, "timings": 3 }
    },
    script: ["Hi", "haircut aur hair spa ka rate?", "kal 4 baje haircut book karna hai", "@book:Sneha", "Is there a student discount?", "@takeover"]
  },

  {
    kind: "restaurant",
    label: "Restaurant",
    word: "restaurant",
    icon: "bowl",
    color: "#b45309",
    firm: "Saffron Tawa Kitchen",
    area: "Mira Road",
    city: "Mumbai",
    address: "Shop 3, Sunrise Arcade",
    landmark: "2 minutes from the station.",
    owner: "Imran Shaikh",
    ownerShort: "Imran",
    pronoun: "He",
    hours: {
      Mon: [["11:00", "15:30"], ["19:00", "23:00"]], Tue: [["11:00", "15:30"], ["19:00", "23:00"]],
      Wed: [["11:00", "15:30"], ["19:00", "23:00"]], Thu: [["11:00", "15:30"], ["19:00", "23:00"]],
      Fri: [["11:00", "15:30"], ["19:00", "23:30"]], Sat: [["11:00", "15:30"], ["19:00", "23:30"]],
      Sun: [["11:00", "15:30"], ["19:00", "23:30"]]
    },
    booking: { noun: "table", nounPlural: "tables", action: "Book a table", askService: false, people: true, slotMins: 30, reminderHours: 2 },
    priceChip: "Menu",
    // Delivery: free above this amount, otherwise the fee. Minutes from order to the door.
    delivery: { fee: 30, freeAbove: 500, minutes: 35, km: 3 },
    menu: [
      { section: "Starters", items: [
        { id: "paneer-tikka", name: "Paneer Tikka", price: 260, veg: true, words: ["paneer tikka"] },
        { id: "chicken-tikka", name: "Chicken Tikka", price: 290, words: ["chicken tikka"] },
        { id: "samosa", name: "Punjabi Samosa (2)", price: 50, veg: true, words: ["samosa*"] }
      ] },
      { section: "Main course", items: [
        { id: "butter-chicken", name: "Butter Chicken", price: 320, words: ["butter chicken", "murgh makhani"] },
        { id: "paneer-butter", name: "Paneer Butter Masala", price: 270, veg: true, words: ["paneer butter masala", "paneer butter", "paneer masala", "pbm"] },
        { id: "dal", name: "Dal Tadka", price: 190, veg: true, words: ["dal tadka", "dal", "daal"] },
        { id: "thali", name: "Veg Thali", price: 220, veg: true, words: ["thali", "veg thali"] }
      ] },
      { section: "Breads and rice", items: [
        { id: "naan", name: "Butter Naan", price: 50, veg: true, words: ["butter naan", "naan", "nan"] },
        { id: "roti", name: "Tandoori Roti", price: 30, veg: true, words: ["roti", "rotis", "tandoori roti", "chapati"] },
        { id: "chicken-biryani", name: "Chicken Biryani", price: 300, words: ["chicken biryani", "biryani", "biriyani"] },
        { id: "veg-biryani", name: "Veg Biryani", price: 240, veg: true, words: ["veg biryani", "veg biriyani"] }
      ] },
      { section: "Desserts and drinks", items: [
        { id: "jamun", name: "Gulab Jamun (2)", price: 80, veg: true, words: ["gulab jamun", "jamun", "gulab"] },
        { id: "lassi", name: "Sweet Lassi", price: 80, veg: true, words: ["lassi"] },
        { id: "chai", name: "Masala Chai", price: 30, veg: true, words: ["chai", "tea"] }
      ] }
    ],
    faqs: [
      { words: ["jain", "no onion", "without onion", "no garlic", "pyaaz", "lehsun"],
        en: "Yes. Most veg dishes can be made Jain or without onion and garlic. Just add it to your order.",
        hi: "Haan. Zyada tar veg dishes Jain ya bina pyaaz-lehsun ban jaati hain. Order ke saath likh dijiye." },
      { words: ["spicy", "teekha", "tikha", "mirchi", "less spicy", "mild"],
        en: "The kitchen can make any dish less spicy or extra spicy. Add it to your order.",
        hi: "Kitchen kisi bhi dish ko kam ya zyada teekha bana dega. Order ke saath bata dijiye." },
      { words: ["deliver where", "delivery area", "which area", "how far", "km", "kitna door", "deliver to", "delivery kahan", "kahan tak", "kahaan tak", "deliver karte", "do you deliver", "delivery hoti", "delivery milegi"], over: true,
        en: "We deliver within 3 km of {area} station. Delivery is free above {rs:500}.",
        hi: "{area} station ke 3 km tak delivery hoti hai. {rs:500} se upar delivery free." },
      { words: ["cater*", "party order", "bulk", "50 people", "100 people", "function", "event"], handoff: true,
        en: "Party orders are planned by {ownerShort} personally, so the food and price are right. I have sent him your request and he will call you today.",
        hi: "Party order {ownerShort} khud plan karte hain, taaki khana aur price sahi rahe. Maine unhe bhej diya hai, woh aaj call karenge." }
    ],
    seed: {
      chatCount: 26,
      bookings: [
        { time: "13:10", name: "Imtiaz", what: "Order #1041: Chicken Biryani x2, Lassi", price: 680, order: true },
        { time: "14:05", name: "Shruti", what: "Order #1042: Veg Thali x3", price: 660, order: true },
        { time: "20:30", name: "Mehta family", what: "Table for 6", price: 0 }
      ],
      handoffs: [{ name: "Joseph", text: "Asked for a birthday cake with the dinner order", ago: 40 }],
      chats: [
        { name: "Shruti", text: "Ordered 3 Veg Thali, paid by UPI", tag: "Ordered", ago: 130 },
        { name: "Mehta family", text: "Booked a table for 6", tag: "Booked", ago: 75 },
        { name: "Joseph", text: "Birthday cake with dinner?", tag: "Needs you", ago: 40 },
        { name: "+91 90XXX XX112", text: "Asked: do you deliver to Kashimira?", tag: "Answered", ago: 15 }
      ],
      topics: { "menu": 8, "delivery area": 4, "timings": 3 }
    },
    script: ["Hi", "menu bhejo", "2 butter chicken aur 4 butter naan", "ek gulab jamun bhi", "@chip:Checkout", "@chip:Delivery", "Flat 302, Shanti Nagar, near {area} station", "@pay", "Can you cater for 50 people on Sunday?", "@takeover"]
  }
];

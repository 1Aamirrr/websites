// Sample data for the shop software demo. Every name, number and bill here is made up.
// window.ERP_SEED(now) builds about two months of bills, udhaar, stock-in entries and staff
// attendance that end at "now", so the dashboard always shows today. A fixed random seed means
// the same shop comes back after every "Reset demo data".
(function () {
  "use strict";

  // Items: name, category, unit, buy price, sell price (both include GST), GST %, stock now,
  // reorder level, how often it sells (1 = rarely, 9 = in most bills), usual supplier.
  // GST rates follow the September 2025 slabs, so no sample item is at 12%.
  var S_GRAIN = "Sharma Traders, Masjid Bunder";
  var S_FMCG = "Mahalaxmi Distributors";
  var S_DAIRY = "Shree Dairy Agency";
  var S_CLEAN = "Patel Wholesale, Dana Bunder";
  var ITEMS = [
    ["Aashirvaad Atta 5 kg", "Atta, rice, dal", "pack", 262, 285, 5, 18, 6, 5, S_GRAIN],
    ["Kolam Rice (loose) 1 kg", "Atta, rice, dal", "kg", 62, 72, 0, 46, 15, 6, S_GRAIN],
    ["India Gate Basmati 1 kg", "Atta, rice, dal", "pack", 128, 145, 5, 22, 8, 3, S_GRAIN],
    ["Toor Dal (loose) 1 kg", "Atta, rice, dal", "kg", 138, 160, 0, 34, 10, 5, S_GRAIN],
    ["Moong Dal (loose) 1 kg", "Atta, rice, dal", "kg", 112, 130, 0, 4, 8, 3, S_GRAIN],
    ["Chana Dal (loose) 1 kg", "Atta, rice, dal", "kg", 82, 95, 0, 21, 8, 3, S_GRAIN],
    ["Sugar 1 kg", "Atta, rice, dal", "kg", 43, 48, 5, 60, 20, 7, S_GRAIN],
    ["Tata Salt 1 kg", "Atta, rice, dal", "pack", 24, 28, 0, 38, 12, 6, S_FMCG],
    ["Poha 500 g", "Atta, rice, dal", "pack", 32, 38, 5, 26, 8, 3, S_GRAIN],
    ["Sooji Rava 500 g", "Atta, rice, dal", "pack", 28, 34, 5, 19, 6, 2, S_GRAIN],
    ["Besan 500 g", "Atta, rice, dal", "pack", 48, 56, 5, 14, 6, 2, S_GRAIN],
    ["Fortune Sunflower Oil 1 L", "Oil and ghee", "pack", 148, 165, 5, 30, 10, 5, S_FMCG],
    ["Amul Ghee 500 ml", "Oil and ghee", "pack", 298, 325, 5, 9, 4, 2, S_DAIRY],
    ["Amul Gold Milk 500 ml", "Dairy and bread", "pack", 33, 35, 0, 6, 20, 9, S_DAIRY],
    ["Amul Butter 100 g", "Dairy and bread", "pc", 56, 62, 5, 16, 6, 3, S_DAIRY],
    ["Amul Masti Dahi 400 g", "Dairy and bread", "pc", 30, 35, 5, 12, 6, 3, S_DAIRY],
    ["Amul Paneer 200 g", "Dairy and bread", "pc", 82, 90, 0, 7, 5, 2, S_DAIRY],
    ["Britannia Bread 400 g", "Dairy and bread", "pc", 40, 45, 0, 3, 8, 4, S_FMCG],
    ["Eggs, tray of 6", "Dairy and bread", "tray", 39, 45, 0, 15, 6, 4, S_DAIRY],
    ["Tata Tea Gold 250 g", "Tea, coffee, masala", "pack", 148, 165, 5, 20, 6, 3, S_FMCG],
    ["Red Label Tea 250 g", "Tea, coffee, masala", "pack", 132, 150, 5, 0, 5, 2, S_FMCG],
    ["Nescafe Classic 45 g", "Tea, coffee, masala", "pc", 162, 180, 5, 11, 4, 2, S_FMCG],
    ["Everest Chilli Powder 100 g", "Tea, coffee, masala", "pack", 36, 42, 5, 22, 8, 2, S_FMCG],
    ["Turmeric Powder 100 g", "Tea, coffee, masala", "pack", 26, 32, 5, 25, 8, 2, S_FMCG],
    ["MDH Garam Masala 100 g", "Tea, coffee, masala", "pack", 78, 90, 5, 10, 4, 1, S_FMCG],
    ["Parle-G 250 g", "Snacks and biscuits", "pack", 22, 25, 5, 48, 15, 6, S_FMCG],
    ["Good Day Cashew 200 g", "Snacks and biscuits", "pack", 34, 40, 5, 30, 10, 3, S_FMCG],
    ["Maggi Noodles, pack of 4", "Snacks and biscuits", "pack", 50, 56, 5, 36, 12, 5, S_FMCG],
    ["Haldiram's Aloo Bhujia 200 g", "Snacks and biscuits", "pack", 52, 60, 5, 18, 6, 3, S_FMCG],
    ["Lay's Classic Salted 50 g", "Snacks and biscuits", "pack", 17, 20, 5, 40, 15, 5, S_FMCG],
    ["Dairy Milk Silk 60 g", "Snacks and biscuits", "pc", 80, 90, 5, 14, 6, 2, S_FMCG],
    ["Bisleri Water 1 L", "Snacks and biscuits", "bottle", 15, 20, 5, 48, 24, 5, S_FMCG],
    ["Colgate Strong Teeth 200 g", "Soap and personal care", "pc", 98, 110, 5, 16, 6, 2, S_FMCG],
    ["Lifebuoy Soap, pack of 4", "Soap and personal care", "pack", 132, 150, 5, 2, 6, 2, S_FMCG],
    ["Clinic Plus Shampoo 175 ml", "Soap and personal care", "pc", 98, 110, 5, 12, 4, 1, S_FMCG],
    ["Dettol Handwash 200 ml", "Soap and personal care", "pc", 88, 99, 5, 10, 4, 1, S_FMCG],
    ["Surf Excel Easy Wash 1 kg", "Cleaning", "pack", 118, 135, 18, 20, 6, 3, S_CLEAN],
    ["Rin Bar 250 g", "Cleaning", "pc", 25, 30, 18, 34, 10, 3, S_CLEAN],
    ["Vim Bar 300 g", "Cleaning", "pc", 26, 30, 18, 28, 10, 3, S_CLEAN],
    ["Harpic 500 ml", "Cleaning", "pc", 96, 110, 18, 12, 4, 2, S_CLEAN],
    ["Good Knight Refill", "Cleaning", "pc", 72, 85, 18, 8, 4, 1, S_CLEAN],
    ["Garbage Bags, 30 pcs", "Cleaning", "pack", 72, 90, 18, 3, 4, 1, S_CLEAN],
    ["Agarbatti 100 g", "Pooja and home", "pack", 34, 40, 5, 20, 6, 1, S_CLEAN],
    ["Matchbox, pack of 10", "Pooja and home", "pack", 16, 20, 5, 30, 10, 2, S_CLEAN]
  ];

  // Customers. Phone numbers are masked on purpose, so a demo never messages a real person:
  // WhatsApp then opens with the message ready and lets you pick the chat.
  // credit = how often they buy on udhaar, pays = chance they pay something on a given day,
  // opening = udhaar from before the sample starts.
  var CUSTOMERS = [
    ["Ramesh Patil", "98XXX XX214", 0.55, 0.13, 1850],
    ["Sunita Sharma", "99XXX XX308", 0, 0, 0],
    ["Mohammed Shaikh", "97XXX XX552", 0.6, 0.07, 2400],
    ["Priya Nair", "98XXX XX719", 0, 0, 0],
    ["Anil Gupta", "90XXX XX143", 0.4, 0.12, 0],
    ["Kavita Joshi", "98XXX XX865", 0.15, 0.2, 0],
    ["Farhan Khan", "86XXX XX027", 0.5, 0.06, 1200],
    ["Meena Iyer", "99XXX XX436", 0, 0, 0],
    ["Rajesh Yadav", "70XXX XX691", 0.45, 0.1, 650],
    ["Neha Kulkarni", "98XXX XX380", 0, 0, 0],
    ["Deepak Mehta", "93XXX XX572", 0.3, 0.16, 0],
    ["Shabana Ansari", "88XXX XX914", 0.4, 0.08, 900]
  ];

  // Staff: name, work, monthly salary in rupees, chance of a half day, chance of being absent.
  var STAFF = [
    ["Suresh Pawar", "Counter and billing", 18000, 0.03, 0.03],
    ["Pooja Shinde", "Billing", 14000, 0.05, 0.05],
    ["Imran Sayyed", "Home delivery", 13000, 0.04, 0.07],
    ["Ganesh More", "Stock and loading", 12000, 0.05, 0.05],
    ["Lata Jadhav", "Cleaning and packing", 8000, 0.22, 0.06]
  ];

  // Small fixed-seed random numbers (mulberry32): the same data after every reset.
  var makeRandom = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var keyOf = function (date) { return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()); };

  window.ERP_SEED = function (nowMs) {
    var rnd = makeRandom(20261121);
    var now = new Date(nowMs);
    var nowMinute = now.getHours() * 60 + now.getMinutes();

    var items = ITEMS.map(function (row, i) {
      return { id: "i" + (i + 1), name: row[0], cat: row[1], unit: row[2], buy: row[3], sell: row[4],
        gst: row[5], stock: row[6], low: row[7], supplier: row[9] };
    });
    var weights = ITEMS.map(function (row) { return row[8]; });
    var customers = CUSTOMERS.map(function (row, i) {
      return { id: "c" + (i + 1), name: row[0], phone: row[1] };
    });
    var staff = STAFF.map(function (row, i) {
      return { id: "s" + (i + 1), name: row[0], role: row[1], salary: row[2] };
    });

    var pickWeighted = function (list, weightOf) {
      var total = 0;
      list.forEach(function (x) { total += weightOf(x); });
      var r = rnd() * total;
      for (var i = 0; i < list.length; i += 1) {
        r -= weightOf(list[i]);
        if (r <= 0) { return list[i]; }
      }
      return list[list.length - 1];
    };

    // A bill time on a normal day: busy in the morning and the evening.
    var sampleMinute = function (lo, hi) {
      for (var tries = 0; tries < 12; tries += 1) {
        var r = rnd();
        var m;
        if (r < 0.38) { m = 570 + (rnd() + rnd() + rnd() - 1.5) * 110; }
        else if (r < 0.85) { m = 1170 + (rnd() + rnd() + rnd() - 1.5) * 140; }
        else { m = 450 + rnd() * 900; }
        if (m >= lo && m <= hi) { return Math.floor(m); }
      }
      return Math.floor(lo + rnd() * (hi - lo));
    };

    var start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var creditCustomers = customers.filter(function (c, i) { return CUSTOMERS[i][2] > 0; });
    var balance = {};
    var ledger = [];
    var bills = [];
    var billNo = 0;
    var idNo = 0;
    var nextId = function (prefix) { idNo += 1; return prefix + idNo.toString(36); };

    customers.forEach(function (c, i) {
      balance[c.id] = CUSTOMERS[i][4];
      if (CUSTOMERS[i][4]) {
        ledger.push({ id: nextId("l"), c: c.id, t: start.getTime() + 9 * 3600000, type: "credit",
          amt: CUSTOMERS[i][4], note: "Old udhaar, from the paper khata", opening: true });
      }
    });

    var attendance = {};
    var day = new Date(start);
    while (day.getTime() <= nowMs) {
      var isToday = keyOf(day) === keyOf(now);
      var weekDay = day.getDay();
      var dayOfMonth = day.getDate();
      var target = weekDay === 0 ? 54 : weekDay === 6 ? 48 : 40;
      if (dayOfMonth <= 7) { target *= 1.15; } // salary week
      target = Math.round(target * (0.85 + rnd() * 0.3));

      var lo = 450;
      var hi = 1350;
      if (isToday) {
        // The shop opens at 7:30 am: before that there are no bills yet today; from 8:30 am at least a few.
        hi = Math.min(hi, nowMinute - 1);
        var share = Math.max(0, Math.min(1, (nowMinute - 450) / 900));
        target = hi <= lo ? 0 : Math.max(hi - lo >= 60 ? 6 : 1, Math.round(target * share));
      }

      var minutes = [];
      for (var b = 0; b < target; b += 1) { minutes.push(sampleMinute(lo, hi)); }
      minutes.sort(function (x, y) { return x - y; });

      minutes.forEach(function (minute) {
        var t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minute / 60), minute % 60,
          Math.floor(rnd() * 60)).getTime();
        var modeRoll = rnd();
        var mode = modeRoll < 0.43 ? "cash" : modeRoll < 0.86 ? "upi" : modeRoll < 0.93 ? "card" : "udhaar";
        var customer = null;
        if (mode === "udhaar") {
          customer = pickWeighted(creditCustomers, function (c) { return CUSTOMERS[Number(c.id.slice(1)) - 1][2]; });
        } else if (rnd() < 0.2) {
          customer = customers[Math.floor(rnd() * customers.length)];
        }

        var lineRoll = rnd();
        var count = lineRoll < 0.3 ? 1 : lineRoll < 0.58 ? 2 : lineRoll < 0.78 ? 3 : lineRoll < 0.9 ? 4 : lineRoll < 0.97 ? 5 : 6;
        if (mode === "udhaar") { count += 2; }
        var pool = items.slice();
        var lines = [];
        for (var k = 0; k < count && pool.length; k += 1) {
          var item = pickWeighted(pool, function (x) { return weights[Number(x.id.slice(1)) - 1]; });
          pool.splice(pool.indexOf(item), 1);
          var qty = 1;
          if (item.sell < 60) { qty += (rnd() < 0.35 ? 1 : 0) + (rnd() < 0.1 ? 1 : 0); }
          else if (rnd() < 0.08) { qty = 2; }
          lines.push({ id: item.id, n: item.name, q: qty, p: item.sell, b: item.buy, g: item.gst });
        }
        var sub = lines.reduce(function (sum, l) { return sum + l.q * l.p; }, 0);
        var discount = sub > 300 && rnd() < 0.18 ? sub % 10 : 0;
        if (mode === "card" && sub < 300) { mode = "upi"; }

        billNo += 1;
        var bill = { id: "b" + billNo, no: billNo, t: t, c: customer ? customer.id : null, cn: customer ? customer.name : "",
          m: mode, d: discount, lines: lines };
        bills.push(bill);
        if (mode === "udhaar") {
          balance[customer.id] += sub - discount;
          ledger.push({ id: nextId("l"), c: customer.id, t: t, type: "credit", amt: sub - discount, bill: billNo });
        }
      });

      // Udhaar customers pay back now and then, mostly in round amounts.
      if (!isToday || nowMinute > 720) {
        creditCustomers.forEach(function (c) {
          var habit = CUSTOMERS[Number(c.id.slice(1)) - 1][3];
          var due = balance[c.id];
          if (due > 200 && rnd() < habit) {
            var amount = due >= 1500 ? Math.round((due * (0.4 + rnd() * 0.6)) / 100) * 100 : due;
            amount = Math.min(amount, due);
            balance[c.id] -= amount;
            var payMinute = isToday ? 600 + Math.floor(rnd() * Math.max(1, Math.min(nowMinute, 1260) - 600)) : 600 + Math.floor(rnd() * 660);
            ledger.push({ id: nextId("l"), c: c.id, t: new Date(day.getFullYear(), day.getMonth(), day.getDate(),
              Math.floor(payMinute / 60), payMinute % 60).getTime(), type: "payment", amt: amount, mode: rnd() < 0.6 ? "upi" : "cash" });
          }
        });
      }

      // Attendance: every past day is marked. Today, three people are marked so far.
      var marks = {};
      staff.forEach(function (s, i) {
        if (isToday) {
          if (i === 0 || i === 1 || i === 3) { marks[s.id] = "P"; }
          return;
        }
        var r = rnd();
        marks[s.id] = r < STAFF[i][4] ? "A" : r < STAFF[i][4] + STAFF[i][3] ? "H" : "P";
      });
      attendance[keyOf(day)] = marks;

      day.setDate(day.getDate() + 1);
    }
    ledger.sort(function (x, y) { return x.t - y.t; });

    // Stock that came in over the last two weeks.
    var stockIns = [];
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    [12, 11, 9, 8, 6, 5, 3, 2, 1].forEach(function (daysAgo) {
      var item = pickWeighted(items, function (x) { return weights[Number(x.id.slice(1)) - 1]; });
      var when = new Date(todayStart - daysAgo * 86400000 + 12 * 3600000);
      when.setHours(10 + Math.floor(rnd() * 6), Math.floor(rnd() * 60));
      var qty = item.sell < 60 ? 24 : item.sell < 200 ? 12 : 6;
      stockIns.push({ id: nextId("s"), t: when.getTime(), item: item.id, name: item.name, q: qty, buy: item.buy, from: item.supplier });
    });

    return {
      shop: { name: window.ERP_SEED.shopName, area: "Dadar West", city: "Mumbai",
        address: "Shop 4, Laxmi Niwas, Ranade Road", phone: "98XXX XXXXX", gstin: "27ABCDE1234F1Z5" },
      items: items,
      customers: customers,
      staff: staff,
      bills: bills,
      ledger: ledger,
      stockIns: stockIns,
      attendance: attendance,
      seq: { bill: billNo, id: idNo },
      draft: null
    };
  };
  // The sample shop's name. A link with ?firm=Name replaces it.
  window.ERP_SEED.shopName = "Annapurna General Store";
})();

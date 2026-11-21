// One business's real details for a demo.
// A link like  gym/?id=for-life-fitness  loads  leads/for-life-fitness.js, which sets window.LEAD:
//   { firm, area, city, phone, rating, reviews, address, hours: { Mon: [["10:00", "21:30"]], ... } }
// Each page's app.js reads LEAD for the name, area, phone and hours; ../fx/fx.js reads the rating.
// This file then puts in the real address, the map and a note that the details are real.
(function () {
  "use strict";
  var id = new URLSearchParams(window.location.search).get("id") || "";
  if (!/^[a-z0-9-]{2,60}$/.test(id)) { return; }
  document.write('<script src="../leads/' + id + '.js"><\/script>');
  document.addEventListener("DOMContentLoaded", function () {
    var lead = window.LEAD;
    if (!lead || !lead.firm) { return; }
    if (lead.address) {
      document.querySelectorAll("[data-address-line]").forEach(function (node) { node.textContent = lead.address; });
      var map = document.getElementById("map");
      if (map) { map.src = "https://www.google.com/maps?q=" + encodeURIComponent(lead.firm + ", " + lead.address) + "&output=embed"; }
    }
    var note = document.getElementById("demoText");
    if (note) { note.textContent = "Sample made for " + lead.firm + " by Oxzi. Name, address and rating are from Google. The rest is an example of the design."; }
  });
})();

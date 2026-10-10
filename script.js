// CampusPulse prototype - all events are SAMPLE data for the demo

function daysFromNow(n) {
  var d = new Date(); d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function E(id, name, div, cat, org, venue, dateIn, lastIn, dept, fee) {
  return { id: id, name: name, div: div, cat: cat, org: org, venue: venue, date: daysFromNow(dateIn), last: daysFromNow(lastIn), dept: dept, fee: fee, link: "https://example.com", ok: true };
}
var events = [
  E(1, "24 Hour Code Sprint", "inter", "Coding", "Sample Institute of Technology", "Chennai", 12, 2, "All", "Rs 300 per team"),
  E(2, "Cloud Security Workshop", "inter", "Coding", "Sample Engineering College", "Online", 8, 5, "CSE", "Free"),
  E(3, "Paper Presentation Symposium", "inter", "Research", "Sample Arts and Science College", "Coimbatore", 6, 0, "All", "Rs 100"),
  E(4, "UI/UX Design Sprint", "inter", "Design", "Sample Design School", "Bengaluru", 14, 8, "All", "Rs 150"),
  E(5, "Project Expo", "open", "Design", "Our College - Dean Office", "Main Auditorium", 15, 9, "All", "Free"),
  E(6, "Inter-Department Hackathon", "open", "Coding", "CSE Association", "CS Lab", 9, 3, "All", "Free"),
  E(7, "Mechanical Design Contest", "open", "Design", "Mechanical Association", "Block C, Hall 2", 10, 4, "Mechanical", "Rs 50"),
  E(8, "Cultural Fest Talent Hunt", "open", "Cultural", "Student Council", "Open Air Theatre", 18, 12, "All", "Free"),
  E(9, "Zonal Basketball Trials", "sports", "Sports", "Physical Education Dept", "College Court", 7, 1, "All", "Free"),
  E(10, "Open Football Tournament", "sports", "Sports", "Sample Sports Club", "City Stadium", 13, 6, "All", "Rs 500 per team"),
  E(11, "Alumni Cricket Cup", "sports", "Sports", "Alumni Association", "College Ground", 16, 10, "All", "Rs 200 per team")
];
var divNames = { inter: "Inter-College", open: "Open College", sports: "Sports" };
var interests = ["Coding"];
var currentDiv = "all", saved = [];
try { saved = JSON.parse(localStorage.getItem("cpSaved")) || []; } catch (err) { saved = []; }
var $ = function (id) { return document.getElementById(id); };

// ---------- helpers ----------
function daysLeft(s) { var t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((new Date(s + "T00:00:00") - t) / 86400000); }
function niceDate(s) { return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function safe(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function canJoin(ev) { return ev.dept == "All" || ev.dept == $("myDept").value; }
function showNote(t) { var n = $("note"); n.textContent = t; n.style.display = "block"; setTimeout(function () { n.style.display = "none"; }, 2200); }
function findEv(id) { return events.filter(function (e) { return e.id == id; })[0]; }
function leftText(n) { return n < 0 ? "closed" : n == 0 ? "closes today" : n == 1 ? "closes tomorrow" : "closes in " + n + " days"; }

// ---------- ticket ----------
function makeTicket(ev) {
  var n = daysLeft(ev.last), cls = "ticket " + ev.div, big, small;
  if (n < 0) { cls += " closed"; big = "-"; small = "closed"; }
  else if (n == 0) { cls += " urgent"; big = "0"; small = "last day"; }
  else { big = n; small = n == 1 ? "day left" : "days left"; if (n <= 3) cls += " urgent"; }
  var s = saved.indexOf(ev.id) != -1;
  return "<div class='" + cls + "'><div class='main'><span class='tag'>" + divNames[ev.div] + "</span>" +
    "<h3 onclick='openModal(" + ev.id + ")'>" + safe(ev.name) + "</h3><p>" + safe(ev.org) + "</p>" +
    "<p>" + niceDate(ev.date) + " at " + safe(ev.venue) + "</p><p>Fee: " + safe(ev.fee) + " | Open to: " + safe(ev.dept) + "</p>" +
    (canJoin(ev) ? "" : "<p class='cant'>Not listed for " + $("myDept").value + " - check with organizer</p>") +
    "<div class='btns'><a href='" + safe(ev.link) + "' target='_blank' rel='noopener'>Register</a>" +
    "<button onclick='openModal(" + ev.id + ")'>Details</button>" +
    "<button class='" + (s ? "saved" : "") + "' onclick='toggleSave(" + ev.id + ")'>" + (s ? "Saved" : "Save") + "</button></div></div>" +
    "<div class='stub'><span class='num'>" + big + "</span><span class='lbl'>" + small + "</span></div></div>";
}

// ---------- hero: radar, stats, countdown ----------
function drawRadar() {
  var h = "";
  events.forEach(function (ev) {
    var n = daysLeft(ev.last);
    if (!ev.ok || n < 0 || n > 14) return;
    var r = 10 + (n / 14) * 86;                       // closer deadline = nearer the centre
    var a = (ev.id * 137.5) * Math.PI / 180;          // spread the dots around
    var x = (r * Math.cos(a)).toFixed(1), y = (r * Math.sin(a)).toFixed(1);
    h += "<circle class='dot " + ev.div + (n <= 3 ? " hot" : "") + "' cx='" + x + "' cy='" + y + "' r='" + (n <= 3 ? 6 : 5) + "' onclick='openModal(" + ev.id + ")'><title>" + safe(ev.name) + " - " + leftText(n) + "</title></circle>";
  });
  $("dots").innerHTML = h;
}
function countUp(id, to) {
  var el = $(id), cur = 0;
  clearInterval(el.timer);
  el.timer = setInterval(function () { cur++; el.textContent = cur; if (cur >= to) clearInterval(el.timer); }, 60);
  if (to == 0) el.textContent = 0;
}
function showStats() {
  var live = events.filter(function (e) { return e.ok && daysLeft(e.last) >= 0; });
  var soon = live.filter(function (e) { return daysLeft(e.last) <= 7; });
  var orgs = {}; live.forEach(function (e) { orgs[e.org] = 1; });
  countUp("sLive", live.length); countUp("sSoon", soon.length); countUp("sOrg", Object.keys(orgs).length);
}
function tickCountdown() {
  var live = events.filter(function (e) { return e.ok && daysLeft(e.last) >= 0; }).sort(function (a, b) { return a.last < b.last ? -1 : 1; });
  if (!live.length) { $("countBox").textContent = "No registrations closing soon."; return; }
  var ev = live[0], end = new Date(ev.last + "T23:59:59"), ms = end - new Date();
  if (ms < 0) ms = 0;
  var h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
  var p = function (x) { return String(x).padStart(2, "0"); };
  $("countBox").innerHTML = "Next deadline: <b>" + safe(ev.name) + "</b><div class='time'>" + p(h) + ":" + p(m) + ":" + p(s) + "</div>";
}

// ---------- picked for you (simple rules, no AI yet) ----------
function showChips() {
  var all = ["Coding", "Design", "Research", "Cultural", "Sports"], h = "";
  all.forEach(function (c) { h += "<button class='chip" + (interests.indexOf(c) != -1 ? " on" : "") + "' onclick='toggleInterest(\"" + c + "\")'>" + c + "</button>"; });
  $("chips").innerHTML = h;
}
function toggleInterest(c) { var i = interests.indexOf(c); if (i == -1) interests.push(c); else interests.splice(i, 1); showChips(); showPicks(); }
function showPicks() {
  var dept = $("myDept").value, list = [];
  events.forEach(function (ev) {
    var n = daysLeft(ev.last); if (!ev.ok || n < 0) return;
    var score = 0, why = [];
    if (ev.dept == dept) { score += 3; why.push("for " + dept); } else if (ev.dept != "All") return;   // not eligible
    if (interests.indexOf(ev.cat) != -1) { score += 3; why.push("matches " + ev.cat); }
    if (n <= 3) score += 2; else if (n <= 7) score += 1;
    list.push({ ev: ev, score: score, why: why });
  });
  list.sort(function (a, b) { return b.score - a.score || (a.ev.last < b.ev.last ? -1 : 1); });
  var h = "";
  list.slice(0, 3).forEach(function (x) {
    h += "<div class='pick' onclick='openModal(" + x.ev.id + ")'><b>" + safe(x.ev.name) + "</b><span>" + divNames[x.ev.div] + " - " + safe(x.ev.org) + "</span>" +
      "<em>" + leftText(daysLeft(x.ev.last)) + (x.why.length ? " | " + x.why.join(", ") : "") + "</em></div>";
  });
  $("pickList").innerHTML = h || "<div class='empty'>Pick an interest to see suggestions.</div>";
}

// ---------- listing ----------
function showTickets() {
  var text = $("search").value.toLowerCase(), sortBy = $("sortBy").value, mine = $("onlyMine").checked;
  var list = events.filter(function (ev) {
    if (!ev.ok) return false;
    if (currentDiv != "all" && ev.div != currentDiv) return false;
    if (mine && !canJoin(ev)) return false;
    return !text || (ev.name + ev.org + ev.venue + ev.cat).toLowerCase().indexOf(text) != -1;
  });
  list.sort(function (a, b) {
    var ac = daysLeft(a.last) < 0, bc = daysLeft(b.last) < 0;
    if (ac != bc) return ac ? 1 : -1;
    var x = sortBy == "date" ? a.date : a.last, y = sortBy == "date" ? b.date : b.last;
    return x < y ? -1 : x > y ? 1 : 0;
  });
  var h = ""; list.forEach(function (ev) { h += makeTicket(ev); });
  $("tickets").innerHTML = h || "<div class='empty'>No events match. Try clearing the search or filters.</div>";
}
function showCounts() {
  var c = { all: 0, inter: 0, open: 0, sports: 0 };
  events.forEach(function (e) { if (e.ok) { c.all++; c[e.div]++; } });
  for (var k in c) $("c-" + k).textContent = c[k];
}
function showSaved() {
  var h = ""; events.forEach(function (e) { if (saved.indexOf(e.id) != -1) h += makeTicket(e); });
  $("savedTickets").innerHTML = h || "<div class='empty'>No saved events yet. Press Save on any ticket.</div>";
  $("savedCount").textContent = saved.length;
}
function toggleSave(id) {
  var i = saved.indexOf(id);
  if (i == -1) { saved.push(id); showNote("Saved to My tickets"); } else { saved.splice(i, 1); showNote("Removed from My tickets"); }
  try { localStorage.setItem("cpSaved", JSON.stringify(saved)); } catch (err) {}
  refresh();
}

// ---------- details popup: the event is shown as a POSTER IMAGE ----------
// if the organizer uploaded a poster we show that, otherwise we draw one on a canvas

function wrapText(g, text, x, y, maxW, lineH) {
  var words = text.split(" "), line = "";
  for (var i = 0; i < words.length; i++) {
    var test = line + words[i] + " ";
    if (g.measureText(test).width > maxW && line != "") { g.fillText(line, x, y); line = words[i] + " "; y += lineH; }
    else line = test;
  }
  g.fillText(line, x, y);
  return y + lineH;
}

function makePoster(ev) {
  var c = document.createElement("canvas"); c.width = 600; c.height = 800;
  var g = c.getContext("2d"), n = daysLeft(ev.last);
  var color = ev.div == "open" ? "#14B8A6" : ev.div == "sports" ? "#FBBF24" : "#60A5FA";

  // background + light grid
  g.fillStyle = "#0F172A"; g.fillRect(0, 0, 600, 800);
  g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 1;
  for (var i = 0; i <= 600; i += 30) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 800); g.stroke(); }
  for (var j = 0; j <= 800; j += 30) { g.beginPath(); g.moveTo(0, j); g.lineTo(600, j); g.stroke(); }
  g.fillStyle = color; g.fillRect(0, 0, 600, 14);

  // heartbeat line + brand
  g.strokeStyle = "#14B8A6"; g.lineWidth = 4; g.lineJoin = "round"; g.beginPath();
  g.moveTo(40, 78); g.lineTo(80, 78); g.lineTo(93, 52); g.lineTo(110, 102); g.lineTo(125, 66); g.lineTo(136, 78); g.lineTo(170, 78); g.stroke();
  g.fillStyle = "#ffffff"; g.font = "bold 30px Georgia"; g.fillText("CampusPulse", 185, 89);

  // division pill
  g.fillStyle = color; g.fillRect(40, 130, 220, 34);
  g.fillStyle = "#0F172A"; g.font = "bold 18px 'Trebuchet MS'"; g.fillText(divNames[ev.div].toUpperCase(), 54, 153);

  // title
  g.fillStyle = "#ffffff"; g.font = (ev.name.length > 34 ? "bold 38px" : "bold 46px") + " Georgia";
  wrapText(g, ev.name, 40, 215, 520, ev.name.length > 34 ? 46 : 56);

  // details
  var rows = [["ORGANIZER", ev.org], ["EVENT DATE", niceDate(ev.date)], ["VENUE", ev.venue], ["FEE", ev.fee], ["OPEN TO", ev.dept == "All" ? "All departments" : ev.dept]];
  for (var k = 0; k < rows.length; k++) {
    var y = 395 + k * 56;
    g.fillStyle = "#94a3b8"; g.font = "14px 'Trebuchet MS'"; g.fillText(rows[k][0], 40, y);
    g.fillStyle = "#ffffff"; g.font = "22px 'Trebuchet MS'"; g.fillText(rows[k][1].length > 38 ? rows[k][1].substring(0, 36) + "..." : rows[k][1], 40, y + 26);
  }

  // deadline box at the bottom
  g.fillStyle = n < 0 ? "#64748b" : n <= 3 ? "#E4572E" : "#14B8A6";
  g.fillRect(40, 690, 520, 80);
  g.fillStyle = "#0F172A"; g.font = "bold 16px 'Trebuchet MS'"; g.fillText("REGISTER BY " + niceDate(ev.last).toUpperCase(), 58, 722);
  g.fillStyle = "#ffffff"; g.font = "bold 28px Georgia"; g.fillText(leftText(n).charAt(0).toUpperCase() + leftText(n).slice(1), 58, 756);

  return c.toDataURL("image/png");
}

function openModal(id) {
  var ev = findEv(id), n = daysLeft(ev.last), ok = canJoin(ev), dept = $("myDept").value;
  var img = ev.poster ? ev.poster : makePoster(ev);
  var ext = img.split(";")[0].split("/")[1] || "png";
  var fileName = ev.name.replace(/[^a-z0-9]+/gi, "-") + "." + ext;
  $("modal").innerHTML = "<div class='mbox'>" +
    "<img class='poster' src='" + img + "' alt='Poster of " + safe(ev.name) + "'>" +
    "<p class='elig'>" + (ok ? "<span class='yes'>You (" + dept + ") can join this event.</span>" : "<span class='no'>Not listed for " + dept + ". Ask the organizer.</span>") +
    " Register by " + niceDate(ev.last) + " (" + leftText(n) + ").</p>" +
    "<div class='btns'><a href='" + safe(ev.link) + "' target='_blank' rel='noopener'>Register on official page</a>" +
    "<button onclick='toggleSave(" + ev.id + ");openModal(" + ev.id + ")'>" + (saved.indexOf(ev.id) != -1 ? "Saved" : "Save") + "</button>" +
    "<a class='plain' href='" + img + "' download='" + fileName + "'>Download poster</a>" +
    "<button onclick='$(\"modal\").close()'>Close</button></div></div>";
  $("modal").showModal();
}

// ---------- post page ----------
function showPending() {
  var h = "";
  events.forEach(function (e) { if (!e.ok) h += "<div class='pending-row'><span>" + safe(e.name) + " - " + safe(e.org) + "</span><button onclick='verify(" + e.id + ")'>Verify</button></div>"; });
  $("pendingBox").innerHTML = h || "<div class='empty'>Nothing waiting.</div>";
}
function verify(id) { findEv(id).ok = true; showNote("Verified. Students can see it now."); refresh(); }
$("postForm").onsubmit = function (e) {
  e.preventDefault();
  var name = $("fName").value.trim(), org = $("fOrg").value.trim(), venue = $("fVenue").value.trim(), date = $("fDate").value, last = $("fLast").value, link = $("fLink").value.trim();
  if (!name || !org || !venue || !date || !last || !link) { $("msg").textContent = "Please fill every box."; return; }
  if (link.indexOf("http://") != 0 && link.indexOf("https://") != 0) { $("msg").textContent = "The link must start with http:// or https://"; return; }
  if (last > date) { $("msg").textContent = "Last date to register can not be after the event date."; return; }
  for (var i = 0; i < events.length; i++) if (events[i].name.toLowerCase() == name.toLowerCase() && events[i].date == date) { $("msg").textContent = "Already listed (same name and date)."; return; }
  var item = { id: Date.now(), name: name, div: $("fDiv").value, cat: $("fCat").value, org: org, venue: venue, date: date, last: last, dept: $("fDept").value, fee: $("fFee").value.trim() || "Free", link: link, ok: false, poster: "" };
  function done() { events.push(item); $("msg").textContent = ""; $("postForm").reset(); showNote("Sent for verification"); refresh(); }

  var file = $("fPoster").files[0];
  if (!file) { done(); return; }                       // no poster uploaded, we draw one automatically
  if (file.type.indexOf("image/") != 0) { $("msg").textContent = "Poster must be an image file."; return; }
  if (file.size > 2000000) { $("msg").textContent = "Poster must be smaller than 2 MB."; return; }
  var reader = new FileReader();
  reader.onload = function () { item.poster = reader.result; done(); };
  reader.readAsDataURL(file);
};

// ---------- pages and events ----------
function goTo(page) {
  var pages = { find: "pageFind", saved: "pageSaved", post: "pagePost" }, btns = { find: "goFind", saved: "goSaved", post: "goPost" };
  for (var p in pages) { $(pages[p]).classList.add("hidden"); $(btns[p]).classList.remove("on"); }
  $(pages[page]).classList.remove("hidden"); $(btns[page]).classList.add("on");
}
$("goFind").onclick = function () { goTo("find"); };
$("goSaved").onclick = function () { goTo("saved"); };
$("goPost").onclick = function () { goTo("post"); };
var divBtns = document.querySelectorAll(".div-btn");
for (var i = 0; i < divBtns.length; i++) divBtns[i].onclick = function () {
  for (var j = 0; j < divBtns.length; j++) divBtns[j].classList.remove("on");
  this.classList.add("on"); currentDiv = this.getAttribute("data-div"); showTickets();
};
$("search").oninput = showTickets; $("sortBy").onchange = showTickets; $("onlyMine").onchange = refresh; $("myDept").onchange = refresh;

// people who prefer reduced motion get a still radar
if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var anim = document.querySelector("#sweep animateTransform"); if (anim) anim.remove();
}

function refresh() { showCounts(); drawRadar(); showPicks(); showTickets(); showSaved(); showPending(); }
showChips(); refresh(); showStats(); tickCountdown(); setInterval(tickCountdown, 1000);

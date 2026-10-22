(function () {
  const $ = (s) => document.querySelector(s),
    app = $("#app");
  let token = localStorage.getItem("saathiToken"),
    user = JSON.parse(localStorage.getItem("saathiUser") || "null");
  const api = async (url, opts = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    };
    if (token) headers.Authorization = "Bearer " + token;
    const r = await fetch("/api" + url, { ...opts, headers });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401 && token) {
      localStorage.removeItem("saathiToken");
      localStorage.removeItem("saathiUser");
      token = null;
      user = null;
    }
    if (!r.ok) throw Error(d.error || "Request failed");
    return d;
  };
  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };
  const num = (n) => Number(n || 0).toLocaleString("en-IN");
  const oppMeta = (o) =>
    [
      o.organization_name,
      o.location || (o.is_remote ? "Remote" : "Location flexible"),
      o.opportunity_type,
    ]
      .filter(Boolean)
      .map(esc)
      .join(" · ");
  const oppTags = (o) =>
    `<div class="row tags"><span class="tag">${esc(o.category)}</span>${o.is_remote ? '<span class="tag remote">Remote friendly</span>' : ""}${o.is_sample ? '<span class="tag sample">Sample</span>' : ""}</div>`;
  const statusPill = (s) =>
    `<span class="status ${esc(s)}">${s === "accepted" ? "Accepted" : s === "rejected" ? "Not selected" : "Pending review"}</span>`;
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const say = (el, t, err = false) => {
    el.innerHTML =
      '<div class="notice' + (err ? " error" : "") + '">' + esc(t) + "</div>";
  };
  const NGOS = [
    {
      n: "The Akshaya Patra Foundation",
      c: "Food & nutrition",
      w: "https://www.akshayapatra.org",
      d: "Works with government and state partners to serve school mid-day meals so hunger does not keep children out of class.",
      l: "Bengaluru",
    },
    {
      n: "Magic Bus India Foundation",
      c: "Education & livelihood",
      w: "https://magicbus.org",
      d: "Founded in Mumbai in 1999. Uses life-skills and sport-based programmes to help young people finish school and move into work.",
      l: "Mumbai",
    },
    {
      n: "Goonj",
      c: "Disaster relief & dignity",
      w: "https://goonj.org",
      d: "Turns urban surplus such as clothing and household material into resources for rural development and disaster relief.",
      l: "New Delhi",
    },
    {
      n: "Smile Foundation",
      c: "Education & health",
      w: "https://www.smilefoundationindia.org",
      d: "Runs education, healthcare, livelihood and women empowerment programmes for children and families.",
      l: "New Delhi",
    },
    {
      n: "Pratham",
      c: "Education",
      w: "https://www.pratham.org",
      d: "Works on foundational learning, reading and maths for children, and on youth skilling.",
      l: "Mumbai & across India",
    },
    {
      n: "CRY – Child Rights and You",
      c: "Child rights",
      w: "https://www.cry.org",
      d: "Works with communities to protect children's rights to education, health and protection.",
      l: "Mumbai & across India",
    },
    {
      n: "HelpAge India",
      c: "Elder care",
      w: "https://www.helpageindia.org",
      d: "Supports older people with healthcare, livelihood help and advocacy for their rights.",
      l: "New Delhi & across India",
    },
    {
      n: "Teach For India",
      c: "Education",
      w: "https://www.teachforindia.org",
      d: "Places fellows in under-resourced classrooms and builds a network working toward equal educational opportunity.",
      l: "Mumbai & across India",
    },
  ];
  const ngoCard = (o) =>
    `<article class="card ngo"><span class="tag">${esc(o.c)}</span><h3>${esc(o.n)}</h3><p>${esc(o.d)}</p><p class="small">${esc(o.l)}</p><a class="btn secondary" href="${esc(o.w)}" target="_blank" rel="noopener noreferrer">Visit website ↗</a></article>`;
  const BIZ_SAMPLE = [
    {
      organization_name: "Neighbourhood Bakery",
      category: "Food & drink",
      location: "Mumbai",
      bio: "A sample listing showing how a local bakery or café will appear.",
    },
    {
      organization_name: "Repair & Tailoring Studio",
      category: "Repair & services",
      location: "Mumbai",
      bio: "A sample listing showing how a service provider will appear.",
    },
    {
      organization_name: "Green Grocer",
      category: "Groceries",
      location: "Mumbai",
      bio: "A sample listing showing how a fresh-produce shop will appear.",
    },
    {
      organization_name: "Book Nook",
      category: "Retail",
      location: "Mumbai",
      bio: "A sample listing showing how an independent shop will appear.",
    },
  ].map((o) => ({ ...o, sample: true, role: "business" }));
  const bizCard = (o) =>
    `<article class="card biz"><div class="row"><span class="tag">${esc(o.category || "Local business")}</span>${o.sample ? '<span class="tag sample">Example only</span>' : ""}</div><h3>${esc(o.organization_name)}</h3><p>${esc((o.bio || "").slice(0, 140) || "A local business on Saathi.")}</p><p class="small">${o.location ? "" + esc(o.location) : ""}</p>${/^https?:\/\//i.test(o.website || "") ? `<a class="btn secondary" href="${esc(o.website)}" target="_blank" rel="noopener noreferrer">Visit website ↗</a>` : ""}</article>`;
  (function () {
    const h = document.querySelector(".header .nav");
    if (!h) return;
    const p = location.pathname,
      a = (k) => (p.includes(k) ? ' class="on"' : "");
    h.innerHTML =
      '<a class="brand" href="/"><span class="brand-mark">s</span>saathi</a><nav class="links"><a href="/"' +
      (p === "/" || p === "/index.html" ? ' class="on"' : "") +
      '>Home</a><a href="/opportunities.html"' +
      a("opportunities") +
      '>Opportunities</a><a href="/businesses.html"' +
      a("businesses") +
      '>Businesses</a><a href="/ngos.html"' +
      a("ngos") +
      '>NGOs</a><a href="/dashboard.html"' +
      a("dashboard") +
      '>Dashboard</a><a href="/about.html"' +
      a("about") +
      '>About</a></nav><div class="actions" id="auth-actions"></div>';
  })();
  const actions = $("#auth-actions");
  if (actions)
    actions.innerHTML = user
      ? '<a class="btn secondary" href="/dashboard.html">Dashboard</a><button class="btn plain" id="logout">Log out</button>'
      : '<a class="btn plain" href="/login.html">Log in</a><a class="btn primary" href="/register.html">Join Saathi</a>';
  document.addEventListener("click", async (e) => {
    if (e.target.id === "logout") {
      localStorage.removeItem("saathiToken");
      localStorage.removeItem("saathiUser");
      location.href = "/";
    }
  });
  const path = location.pathname;
  if (path === "/" || path === "/index.html") {
    const chips = [
      "Volunteer",
      "Event",
      "Environment",
      "Education",
      "Community Support",
    ]
      .map(
        (c) =>
          `<a href="/opportunities.html?type=${encodeURIComponent(c)}">${c}</a>`,
      )
      .join("");
    app.innerHTML = `<div class="announce"><span class="dot"></span> Small actions. Stronger communities. <a href="#how">See how it works ↗</a></div>
<section class="hero"><div><span class="eyebrow">Better things happen together</span><h1>Your community,<br>your opportunities.</h1><p>Discover local businesses, connect with organisations making a difference, and find opportunities to learn, work and grow.</p>
<form class="hero-search" action="/opportunities.html" method="get"><span aria-hidden="true">⌕</span><input name="q" placeholder="Search volunteering, events, causes…" aria-label="Search opportunities"><button class="btn primary" type="submit">Search</button></form>
<div class="chips">${chips}</div>
<div class="row hero-cta"><a class="btn primary" href="/opportunities.html">Explore your community</a><a class="btn plain" href="/register.html">Join Saathi</a></div></div>
<div class="hero-art"><div class="art-card"><span class="tag">Community in action</span><strong>Good grows when we grow together.</strong><p class="muted">Discover local volunteering and collaboration opportunities.</p></div>
<div class="art-links"><a class="float" href="/opportunities.html"><b>Discover local services</b></a><a class="float" href="/businesses.html"><b>Support local businesses</b></a><a class="float" href="/opportunities.html"><b>Find community opportunities</b></a></div></div></section>
<section class="trust"><div>A place to belong</div><div>A way to give back</div><div>↗ A reason to shop local</div></section>
<section class="section"><div class="section-head"><div><span class="eyebrow">A good place to start</span><h2>What brings you here?</h2><p class="muted">However you want to make a difference, there's a place for you.</p></div></div><div class="grid grid-4">
<a class="card path" href="/opportunities.html"><h3>Local services &amp; opportunities</h3><p>Volunteering, events and ways to contribute near you.</p><span class="link">Find opportunities →</span></a>
<a class="card path" href="/businesses.html"><h3>Local businesses</h3><p>Meet the shops and services in your neighbourhood.</p><span class="link">Browse businesses →</span></a>
<a class="card path" href="/ngos.html"><h3>NGOs &amp; causes</h3><p>Learn about organisations and how to get involved.</p><span class="link">Browse NGOs →</span></a>
<a class="card path" href="/register.html"><h3>Join as an organisation</h3><p>Businesses and NGOs can share opportunities with the community.</p><span class="link">Create a profile →</span></a></div></section>
<section class="section" id="latest"><div class="section-head"><div><span class="eyebrow">Happening now</span><h2>Latest opportunities</h2></div><a class="btn plain" href="/opportunities.html">View all →</a></div><div id="home-opps" class="grid muted">Loading…</div></section>
<section class="section" id="ngos"><div class="section-head"><div><span class="eyebrow">NGOs &amp; causes</span><h2>Organisations doing meaningful work</h2><p class="muted">Established NGOs working across India. Links go to their own websites.</p></div><a class="btn plain" href="/ngos.html">View all NGOs →</a></div><div class="grid">${NGOS.slice(0, 3).map(ngoCard).join("")}</div></section>
<section class="stats" id="stats"><div><b data-s="opps">–</b><span>Open opportunities</span></div><div><b data-s="orgs">–</b><span>Businesses &amp; NGOs listed</span></div><div><b data-s="cats">–</b><span>Categories to explore</span></div><div><b data-s="members">–</b><span>Community members</span></div></section>
<section class="section" id="organisations"><div class="section-head"><div><span class="eyebrow">Businesses &amp; NGOs</span><h2>Organisations on Saathi</h2></div><a class="btn plain" href="/businesses.html">View all businesses →</a></div><div id="home-orgs" class="grid muted">Loading…</div></section>
<section class="section" id="how"><div class="section-head center"><div><span class="eyebrow">Simple by design</span><h2>Community starts with a hello.</h2><p class="muted">Three little steps. A whole lot of possibility.</p></div></div><div class="grid"><div class="card step"><span class="num">01</span><h3>Find what feels right</h3><p>Explore opportunities and organisations that matter to you.</p></div><div class="card step"><span class="num">02</span><h3>Make a connection</h3><p>Apply or save an opportunity and reach the people behind it.</p></div><div class="card step"><span class="num">03</span><h3>Pass the good along</h3><p>Volunteer, shop local, share a cause or invite someone to join.</p></div></div></section>
<section class="section"><div class="section-head"><div><span class="eyebrow">Browse by interest</span><h2>Find something close to your heart</h2></div></div><div class="cause-grid"><a href="/opportunities.html?type=Environment">Environment</a><a href="/opportunities.html?type=Education">Education</a><a href="/opportunities.html?type=Community%20Support">Community support</a><a href="/opportunities.html?type=Volunteer">Volunteering</a><a href="/opportunities.html?type=Event">Events</a><a href="/opportunities.html">See everything</a></div></section>
<section class="section"><div class="section-head"><div><span class="eyebrow">Why Saathi</span><h2>Built for your neighbourhood</h2><p class="muted">Saathi means companion. Here is how we try to be one.</p></div></div><div class="grid"><div class="card"><h3>Easy to discover</h3><p>Opportunities, businesses and NGOs in one place instead of scattered across pages.</p></div><div class="card"><h3>Visibility for local business</h3><p>Small shops and service providers can reach neighbours without building a website.</p></div><div class="card"><h3>Support for NGOs</h3><p>Organisations can share their work and the ways people can help.</p></div><div class="card"><h3>Your details stay yours</h3><p>Passwords are hashed and we only use your details to make Saathi work.</p></div><div class="card"><h3>Works on any device</h3><p>A simple layout that is easy to use on a phone or a laptop.</p></div><div class="card"><h3>Community first</h3><p>Practical features that connect people, not just a directory.</p></div></div></section>
<section class="section"><div class="section-head"><div><span class="eyebrow">Who it's for</span><h2>A place for everyone</h2></div></div><div class="grid"><div class="card who"><span class="tag">Individuals</span><h3>Explore and contribute</h3><ul><li>Search opportunities and causes</li><li>Apply or save for later</li><li>Track activity on your dashboard</li></ul><a class="btn secondary" href="/register.html">Join as an individual</a></div><div class="card who"><span class="tag">Businesses</span><h3>Be seen locally</h3><ul><li>Create an organisation profile</li><li>Share offers and opportunities</li><li>Reach people nearby</li></ul><a class="btn secondary" href="/register.html">List your business</a></div><div class="card who"><span class="tag">NGOs</span><h3>Connect with supporters</h3><ul><li>Describe your cause and work</li><li>Post volunteering openings</li><li>Find people who care</li></ul><a class="btn secondary" href="/register.html">Register your NGO</a></div></div></section>
<section class="tipbox"><div><span class="eyebrow">Ways to help</span><p id="tip">Tap the button for a small idea you can try today.</p></div><button class="btn primary" id="tipBtn" type="button">Give me an idea</button></section>
<section class="section"><div class="section-head"><div><span class="eyebrow">Questions</span><h2>Good to know</h2></div></div><div class="faq"><details><summary>Is Saathi free to join?</summary><p>You can create an account and browse opportunities without any payment here.</p></details><details><summary>How do I list my business or NGO?</summary><p>Create an account, then choose Business or NGO on the Join Saathi page and save your profile.</p></details><details><summary>How do I apply for an opportunity?</summary><p>Log in, open Opportunities and press Apply. Your applications appear on your dashboard.</p></details><details><summary>Are organisations verified?</summary><p>Not yet. Verification is planned for a later version, so please check details before you contribute.</p></details></div></section>
<section class="join"><div><span class="eyebrow">There's room for you here</span><h2>Let's make good things happen.</h2><p>Join a community that believes the little things add up.</p></div><a class="btn primary" href="/register.html">Find your place on Saathi →</a></section>`;
    const oppCard = (o) =>
      `<article class="card opp">${oppTags(o)}<h3>${esc(o.title)}</h3><p>${esc((o.description || "").slice(0, 110))}${(o.description || "").length > 110 ? "…" : ""}</p><p class="small">${oppMeta(o)}</p><div class="row">${o.applied ? '<span class="status pending">Applied ✓</span>' : ""}${o.saved ? '<span class="status saved">Saved</span>' : ""}<a class="btn secondary" href="/opportunities.html#opp-${esc(o.id)}">View details →</a></div></article>`;
    const orgCard = (o) =>
      `<article class="card"><span class="tag">${o.role === "ngo" ? "NGO" : "Business"}</span><h3>${esc(o.organization_name)}</h3><p>${esc((o.bio || "").slice(0, 110) || o.category || "Community organisation")}</p><p class="small">${o.location ? "" + esc(o.location) : ""}${o.category ? " · " + esc(o.category) : ""}</p>${/^https?:\/\//i.test(o.website || "") ? `<a class="btn secondary" href="${esc(o.website)}" target="_blank" rel="noopener noreferrer">Visit website ↗</a>` : ""}</article>`;
    const tips = [
      "Visit a neighbourhood shop you have never tried.",
      "Share an opportunity with a friend who might like it.",
      "Offer one hour of a skill you already have.",
      "Ask a local NGO what they need most right now.",
      "Introduce a neighbour to Saathi.",
    ];
    let ti = 0;
    const tb = $("#tipBtn");
    if (tb)
      tb.onclick = () => {
        $("#tip").textContent = tips[ti++ % tips.length];
      };
    const sample =
      [
        [
          "Business",
          "Neighbourhood Bakery",
          "A sample listing showing how a local business will appear.",
        ],
        [
          "NGO",
          "Green Mumbai Trust",
          "A sample listing showing how an NGO will appear.",
        ],
        [
          "Business",
          "Repair & Tailoring Studio",
          "A sample listing showing how a service provider will appear.",
        ],
      ]
        .map(
          (x) =>
            `<article class="card sampleCard"><span class="tag">${x[0]}</span> <span class="tag sample">Example only</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`,
        )
        .join("") +
      '<p class="small muted span-all">These are examples, not real organisations. <a href="/register.html"><b>Create a profile</b></a> to appear here.</p>';
    const setStat = (k, v) => {
      const el = document.querySelector('[data-s="' + k + '"]');
      if (el) el.textContent = v;
    };
    api("/opportunities")
      .then((d) => {
        const l = d.opportunities || [];
        $("#home-opps").classList.remove("muted");
        $("#home-opps").innerHTML =
          l.slice(0, 3).map(oppCard).join("") ||
          '<div class="card empty">No opportunities yet. Check back soon.</div>';
      })
      .catch((e) => {
        $("#home-opps").innerHTML =
          '<div class="card empty span-all">Could not load opportunities right now. ' +
          esc(e.message) +
          "</div>";
      });
    api("/stats")
      .then((s) => {
        setStat("opps", num(s.opportunities));
        setStat("orgs", num(s.organizations));
        setStat("cats", num(s.categories));
        setStat("members", num(s.members));
      })
      .catch(() => {
        ["opps", "orgs", "cats", "members"].forEach((k) => setStat(k, "–"));
      });
    api("/organizations")
      .then((d) => {
        const l = d.organizations || [];
        $("#home-orgs").classList.remove("muted");
        $("#home-orgs").innerHTML =
          l.slice(0, 3).map(orgCard).join("") || sample;
      })
      .catch(() => {
        $("#home-orgs").innerHTML =
          '<div class="card empty span-all">Could not load organisations right now.</div>';
      });
  } else if (path.includes("login")) {
    app.innerHTML = `<section class="form-shell"><span class="eyebrow">Welcome to Saathi</span><h1>Log in</h1><p class="muted">Use your email and password.</p><form id="login-form"><div class="field"><label>Name (only needed when creating an account)</label><input id="name" placeholder="Your name"></div><div class="field"><label>Email address</label><input id="email" type="email" required></div><div class="field"><label>Password (at least 8 characters)</label><input id="password" type="password" required minlength="8"></div><div class="row"><button class="btn primary" id="login" type="submit">Log in</button><button class="btn secondary" id="register" type="button">Create account</button></div><div id="message"></div></form></section>`;
    const f = $("#login-form");
    f.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const d = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: $("#email").value,
            password: $("#password").value,
          }),
        });
        localStorage.setItem("saathiToken", d.token);
        localStorage.setItem("saathiUser", JSON.stringify(d.user));
        location.href =
          new URLSearchParams(location.search).get("next") || "/dashboard.html";
      } catch (e) {
        say($("#message"), e.message, true);
      }
    };
    $("#register").onclick = async () => {
      try {
        const d = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: $("#name").value,
            email: $("#email").value,
            password: $("#password").value,
          }),
        });
        localStorage.setItem("saathiToken", d.token);
        localStorage.setItem("saathiUser", JSON.stringify(d.user));
        location.href = "/register.html";
      } catch (e) {
        say($("#message"), e.message, true);
      }
    };
  } else if (path.includes("register")) {
    app.innerHTML = `<section class="form-shell"><span class="eyebrow">Your community journey starts here</span><h1>Create your profile</h1>${!user ? '<div class="notice">Create an account or log in before saving your profile.</div><a class="btn primary" href="/login.html?next=/register.html">Log in / Create account →</a>' : '<form id="profile-form"><div class="field"><label>Joining as</label><select id="role" name="role"><option value="individual">Individual</option><option value="business">Business</option><option value="ngo">NGO</option></select></div><div class="field"><label>Full name / contact person</label><input name="full_name" required maxlength="120" value="' + esc(user.name) + '"></div><div id="org-fields" class="hidden"><div class="field"><label>Organization name</label><input name="organization_name" maxlength="160"></div><div class="field"><label>Category or cause</label><input name="category" maxlength="120"></div><div class="field"><label>Website</label><input name="website" type="url" placeholder="https://"></div></div><div class="field"><label>About you / organization</label><textarea name="bio" maxlength="2000"></textarea></div><div class="field"><label>Location</label><input name="location" maxlength="160" placeholder="City or area"></div><div class="field"><label>Phone (optional)</label><input name="phone" maxlength="50"></div><div id="message"></div><button class="btn primary" type="submit">Save profile</button></form>'}</section>`;
    const role = $("#role"),
      org = $("#org-fields");
    if (role)
      role.onchange = () =>
        org.classList.toggle("hidden", role.value === "individual");
    const f = $("#profile-form");
    if (f)
      f.onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api("/profile", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(new FormData(f))),
          });
          say($("#message"), "Profile saved!");
          setTimeout(() => (location.href = "/dashboard.html"), 500);
        } catch (e) {
          say($("#message"), e.message, true);
        }
      };
  } else if (path.includes("opportunities")) {
    const qs = new URLSearchParams(location.search);
    let q = (qs.get("q") || "").toLowerCase().trim(),
      ty = (qs.get("type") || "").trim(),
      all = [];
    app.innerHTML =
      '<section class="page"><span class="eyebrow">Make a difference</span><h1>Community opportunities</h1><p class="muted">Explore volunteering, events, internships and local jobs. Apply or save anything that catches your eye, and track it on your dashboard.</p><form class="hero-search" id="opp-search" action="/opportunities.html" method="get"><span aria-hidden="true">⌕</span><input name="q" id="opp-q" value="' +
      esc(qs.get("q") || "") +
      '" placeholder="Search opportunities…" aria-label="Search"><button class="btn primary" type="submit">Search</button></form><div class="chips" id="opp-chips"></div><p class="muted small" id="opp-count"></p>' +
      (!user
        ? '<div class="notice small"><a href="/login.html?next=/opportunities.html"><b>Log in</b></a> to apply or save opportunities.</div>'
        : "") +
      '<div id="listing" class="grid">Loading opportunities…</div></section>';
    const listing = $("#listing"),
      chipsEl = $("#opp-chips");
    const match = (o) => {
      const hay = [
        o.title,
        o.description,
        o.category,
        o.opportunity_type,
        o.location,
        o.organization_name,
      ]
        .join(" ")
        .toLowerCase();
      const t = ty.toLowerCase().replace(/ing$/, "");
      return (
        (!q || hay.includes(q)) &&
        (!t ||
          [o.category, o.opportunity_type]
            .join(" ")
            .toLowerCase()
            .includes(t) ||
          hay.includes(t))
      );
    };
    const card = (o) =>
      `<article class="card opp" id="opp-${esc(o.id)}">${oppTags(o)}<h3>${esc(o.title)}</h3><p class="small org">${oppMeta(o)}</p><p>${esc(o.description)}</p>${o.commitment ? `<p class="small"><b>Time:</b> ${esc(o.commitment)}</p>` : ""}${o.requirements ? `<p class="small"><b>You'll need:</b> ${esc(o.requirements)}</p>` : ""}<div class="row">${o.applied ? `<button class="btn applied apply" data-id="${esc(o.id)}" data-on="1" title="Withdraw application">Applied ✓</button>` : `<button class="btn primary apply" data-id="${esc(o.id)}">Apply</button>`}<button class="btn ${o.saved ? "secondary" : "plain"} save" data-id="${esc(o.id)}" ${o.saved ? 'data-on="1"' : ""}>${o.saved ? "Saved ★" : "Save"}</button>${o.applied && o.application_status ? statusPill(o.application_status) : ""}</div></article>`;
    const draw = () => {
      const types = [
        ...new Set(
          all.flatMap((o) => [o.opportunity_type, o.category]).filter(Boolean),
        ),
      ];
      chipsEl.innerHTML =
        '<a href="#" data-c=""' +
        (ty ? "" : ' class="on"') +
        ">All</a>" +
        types
          .map(
            (c) =>
              '<a href="#" data-c="' +
              esc(c) +
              '"' +
              (c.toLowerCase() === ty.toLowerCase() ? ' class="on"' : "") +
              ">" +
              esc(c) +
              "</a>",
          )
          .join("");
      const r = all.filter(match);
      $("#opp-count").innerHTML =
        r.length +
        " of " +
        all.length +
        " opportunities" +
        (q || ty
          ? ' · <a href="/opportunities.html"><b>Clear filters</b></a>'
          : "");
      listing.innerHTML =
        r.map(card).join("") ||
        '<div class="card empty span-all">No opportunities match' +
          (q || ty
            ? ' this filter. <a href="/opportunities.html"><b>Show all opportunities</b></a>'
            : " yet.") +
          "</div>";
    };
    chipsEl.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-c]");
      if (!a) return;
      e.preventDefault();
      ty = a.dataset.c;
      draw();
    });
    $("#opp-search").addEventListener("submit", (e) => {
      e.preventDefault();
      q = $("#opp-q").value.toLowerCase().trim();
      draw();
    });
    listing.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-id]");
      if (!b) return;
      if (!user) {
        location.href =
          "/login.html?next=" +
          encodeURIComponent("/opportunities.html#opp-" + b.dataset.id);
        return;
      }
      const o = all.find((x) => x.id === b.dataset.id);
      if (!o) return;
      const isApply = b.classList.contains("apply"),
        on = b.dataset.on === "1";
      if (
        isApply &&
        on &&
        !confirm('Withdraw your application for "' + o.title + '"?')
      )
        return;
      b.disabled = true;
      try {
        await api("/opportunities/" + o.id + (isApply ? "/apply" : "/save"), {
          method: on ? "DELETE" : "POST",
          body: on ? undefined : "{}",
        });
        if (isApply) {
          o.applied = !on;
          o.application_status = on ? null : "pending";
        } else o.saved = !on;
        const el = document.getElementById("opp-" + o.id);
        if (el) el.outerHTML = card(o);
      } catch (err) {
        b.disabled = false;
        alert(err.message);
      }
    });
    api("/opportunities")
      .then((d) => {
        all = d.opportunities || [];
        draw();
        if (location.hash) {
          const el = document.querySelector(location.hash);
          if (el) {
            el.classList.add("focus");
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      })
      .catch((e) => say(listing, e.message, true));
  } else if (path.includes("dashboard")) {
    if (!user)
      app.innerHTML =
        '<section class="form-shell"><h1>Your dashboard</h1><p>Log in to see the opportunities you applied for and saved.</p><a class="btn primary" href="/login.html?next=/dashboard.html">Log in</a></section>';
    else {
      app.innerHTML =
        '<section class="page"><span class="eyebrow">Your Saathi</span><h1>Hi, ' +
        esc(user.name.split(" ")[0]) +
        '</h1><p class="muted">Everything you have applied for and saved, in one place.</p><div id="dash">Loading…</div></section>';
      const D = $("#dash");
      let P = null,
        data = null;
      const item = (o, right, when) =>
        `<li class="dash-item" id="d-${esc(o.id)}"><div><a href="/opportunities.html#opp-${esc(o.id)}"><b>${esc(o.title)}</b></a><div class="small muted">${oppMeta(o)}</div>${when ? `<div class="small muted">${when}</div>` : ""}</div><div class="row">${right}</div></li>`;
      const section = (title, count, body, empty) =>
        `<section class="card dash-block"><div class="section-head"><h2>${title} <span class="count">${count}</span></h2></div>${count ? `<ul class="dash-list">${body}</ul>` : `<div class="empty">${empty}</div>`}</section>`;
      const render = () => {
        const p = P.profile,
          a = data.applications,
          s = data.saved,
          mine = data.opportunities,
          isOrg = p && ["business", "ngo"].includes(p.role);
        const pend = a.filter((x) => x.status === "pending").length,
          acc = a.filter((x) => x.status === "accepted").length;
        D.innerHTML = `<div class="dash-stats"><div><b>${a.length}</b><span>Applied</span></div><div><b>${s.length}</b><span>Saved</span></div><div><b>${pend}</b><span>Pending review</span></div><div><b>${isOrg ? mine.length : acc}</b><span>${isOrg ? "Posted by you" : "Accepted"}</span></div></div>
<div class="dash-grid"><div>
${section("Applied opportunities", a.length, a.map((x) => item(x.opportunity, statusPill(x.status) + (x.status === "pending" ? `<button class="btn plain small-btn" data-act="withdraw" data-id="${esc(x.opportunity.id)}">Withdraw</button>` : ""), "Applied on " + fmtDate(x.applied_at))).join(""), 'You have not applied to anything yet. <a href="/opportunities.html"><b>Browse opportunities →</b></a>')}
${section("Saved for later", s.length, s.map((x) => item(x.opportunity, (x.opportunity.applied ? '<span class="status pending">Applied ✓</span>' : `<button class="btn primary small-btn" data-act="apply" data-id="${esc(x.opportunity.id)}">Apply</button>`) + `<button class="btn plain small-btn" data-act="unsave" data-id="${esc(x.opportunity.id)}">Remove</button>`, "Saved on " + fmtDate(x.saved_at))).join(""), "Nothing saved yet. Tap <b>Save</b> on any opportunity to keep it here.")}
${isOrg ? section("Your posted opportunities", mine.length, mine.map((o) => item(o, `<span class="status saved">${o.applicants} applicant${o.applicants === 1 ? "" : "s"}</span>`, "Posted on " + fmtDate(o.created_at))).join(""), "You have not posted anything yet. Use the form to share your first opportunity.") : ""}
</div><aside>
<article class="card"><span class="tag">Profile</span><h3>${esc(p?.full_name || "Profile not completed")}</h3><p class="small">${esc(p ? (p.role === "ngo" ? "NGO" : p.role[0].toUpperCase() + p.role.slice(1)) : "Choose a role")}${p?.organization_name ? " · " + esc(p.organization_name) : ""} · ${esc(p?.location || "Add location")}</p><p>${esc(p?.bio || "Tell the community about yourself.")}</p><div class="row"><a class="btn secondary" href="/register.html">Edit profile</a><a class="btn plain" href="/opportunities.html">Browse</a></div></article>
${isOrg ? `<article class="card"><span class="tag">For ${p.role === "ngo" ? "NGOs" : "businesses"}</span><h3>Post an opportunity</h3><form id="post-form"><div class="field"><label>Title</label><input name="title" required maxlength="180"></div><div class="field"><label>Type</label><select name="opportunity_type"><option>Volunteer</option><option>Event</option><option>Internship</option><option>Part-time Job</option><option>Full-time Job</option></select></div><div class="field"><label>Category</label><input name="category" placeholder="e.g. Education" maxlength="120"></div><div class="field"><label>Location</label><input name="location" placeholder="City or area" maxlength="160"></div><div class="field"><label>Time commitment</label><input name="commitment" placeholder="e.g. 2 hours a week" maxlength="160"></div><div class="field"><label>Description</label><textarea name="description" maxlength="4000"></textarea></div><div class="field"><label>Requirements</label><input name="requirements" maxlength="2000"></div><label class="small row"><input type="checkbox" name="is_remote" value="true"> Can be done remotely</label><div id="post-msg"></div><button class="btn primary" type="submit">Publish</button></form></article>` : ""}
</aside></div>`;
        const pf = $("#post-form");
        if (pf)
          pf.onsubmit = async (e) => {
            e.preventDefault();
            const body = Object.fromEntries(new FormData(pf));
            try {
              await api("/opportunities", {
                method: "POST",
                body: JSON.stringify(body),
              });
              await load();
              say(
                $("#post-msg") || D,
                "Published! It now appears on the Opportunities page.",
              );
            } catch (err) {
              say($("#post-msg"), err.message, true);
            }
          };
      };
      const load = () =>
        Promise.all([api("/profile"), api("/dashboard")]).then(([p, d]) => {
          P = p;
          data = d;
          render();
        });
      D.addEventListener("click", async (e) => {
        const b = e.target.closest("button[data-act]");
        if (!b) return;
        const id = b.dataset.id,
          act = b.dataset.act;
        if (act === "withdraw" && !confirm("Withdraw this application?"))
          return;
        b.disabled = true;
        try {
          await api(
            "/opportunities/" + id + (act === "unsave" ? "/save" : "/apply"),
            {
              method: act === "apply" ? "POST" : "DELETE",
              body: act === "apply" ? "{}" : undefined,
            },
          );
          await load();
        } catch (err) {
          b.disabled = false;
          alert(err.message);
        }
      });
      load().catch((e) => {
        if (!token) {
          location.href = "/login.html?next=/dashboard.html";
          return;
        }
        say(D, e.message, true);
      });
    }
  } else if (path.includes("businesses")) {
    app.innerHTML = `<section class="page"><span class="eyebrow">Shop local</span><h1>Local businesses</h1><p class="muted lead">Meet the shops and service providers in your neighbourhood, and find ways to support them.</p>
<div class="hero-search"><span aria-hidden="true">⌕</span><input id="biz-q" placeholder="Search by name, category or area…" aria-label="Search businesses"></div><div class="chips" id="biz-chips"></div><div id="biz-list" class="grid muted">Loading businesses…</div><div id="biz-note"></div>
<div class="spacer"></div><div class="section-head"><div><span class="eyebrow">For business owners</span><h2>Be easier to find</h2></div></div><div class="grid"><div class="card"><h3>Create a profile</h3><p>Tell neighbours who you are, what you offer and where to find you.</p></div><div class="card"><h3>Share what you do</h3><p>Add your website and a short description so people can learn more.</p></div><div class="card"><h3>Join the community</h3><p>Connect with NGOs and neighbours who want to shop and work locally.</p></div></div>
<div class="spacer"></div><section class="join"><div><span class="eyebrow">Own a local business?</span><h2>Get listed on Saathi.</h2><p>Create an account, choose Business and save your profile.</p></div><a class="btn primary" href="/register.html">List your business →</a></section>
<div class="notice small">Saathi does not verify businesses yet. Please check details with the business directly.</div></section>`;
    let all = [],
      cat = "",
      q = "";
    const list = $("#biz-list"),
      chips = $("#biz-chips");
    const draw = () => {
      const cats = [...new Set(all.map((o) => o.category).filter(Boolean))];
      chips.innerHTML =
        '<a href="#" data-c=""' +
        (cat ? "" : ' class="on"') +
        ">All</a>" +
        cats
          .map(
            (c) =>
              '<a href="#" data-c="' +
              esc(c) +
              '"' +
              (c === cat ? ' class="on"' : "") +
              ">" +
              esc(c) +
              "</a>",
          )
          .join("");
      const r = all.filter(
        (o) =>
          (!cat || o.category === cat) &&
          (!q ||
            [o.organization_name, o.category, o.location, o.bio]
              .join(" ")
              .toLowerCase()
              .includes(q)),
      );
      list.classList.remove("muted");
      list.innerHTML =
        r.map(bizCard).join("") ||
        '<div class="card empty span-all">No businesses match your search.</div>';
    };
    chips.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-c]");
      if (!a) return;
      e.preventDefault();
      cat = a.dataset.c;
      draw();
    });
    $("#biz-q").addEventListener("input", (e) => {
      q = e.target.value.toLowerCase().trim();
      draw();
    });
    api("/organizations")
      .then((d) => {
        all = (d.organizations || []).filter((o) => o.role === "business");
        if (!all.length) {
          all = BIZ_SAMPLE;
          $("#biz-note").innerHTML =
            '<p class="small muted">These are examples, not real businesses. <a href="/register.html"><b>Create a profile</b></a> to appear here.</p>';
        }
        draw();
      })
      .catch(() => {
        list.classList.remove("muted");
        list.innerHTML =
          '<div class="card empty span-all">Could not load businesses right now.</div>';
      });
  } else if (path.includes("ngos")) {
    app.innerHTML =
      '<section class="page"><span class="eyebrow">Make a difference</span><h1>NGOs &amp; causes</h1><p class="muted">Established organisations working on education, food, health, child rights and relief. Visit their websites to learn more, donate or volunteer.</p><div class="chips" id="ngo-chips"></div><div id="ngo-list" class="grid muted">Loading…</div><div class="notice small">Saathi lists these organisations for discovery only and is not affiliated with them. Please check an organisation\'s own website and registration details before donating.</div></section>';
    let list = NGOS;
    const draw = (c) => {
      const cats = [...new Set(list.map((o) => o.c))];
      $("#ngo-chips").innerHTML =
        '<a href="#" data-c=""' +
        (c ? "" : ' class="on"') +
        ">All</a>" +
        cats
          .map(
            (x) =>
              '<a href="#" data-c="' +
              esc(x) +
              '"' +
              (x === c ? ' class="on"' : "") +
              ">" +
              esc(x) +
              "</a>",
          )
          .join("");
      $("#ngo-list").classList.remove("muted");
      $("#ngo-list").innerHTML = list
        .filter((o) => !c || o.c === c)
        .map(ngoCard)
        .join("");
    };
    $("#ngo-chips").addEventListener("click", (e) => {
      const a = e.target.closest("a[data-c]");
      if (!a) return;
      e.preventDefault();
      draw(a.dataset.c);
    });
    api("/ngos")
      .then((d) => {
        const l = (d.ngos || []).map((x) => ({
          n: x.name,
          c: x.category,
          w: x.website,
          d: x.description,
          l: x.location,
        }));
        if (l.length) list = l;
      })
      .catch(() => {})
      .finally(() => draw(""));
  } else if (path.includes("about")) {
    app.innerHTML = `<section class="page"><span class="eyebrow">About Saathi</span><h1>Community is built together.</h1><p class="muted lead">Saathi means companion. We are building a welcoming place where people can discover local businesses, NGOs and opportunities that help communities grow.</p>
<div class="spacer"></div><div class="grid"><div class="card"><h3>The problem</h3><p>Useful community resources are scattered across social pages, word of mouth and separate websites, so people miss what is around them and small organisations struggle to be seen.</p></div><div class="card"><h3>Our mission</h3><p>Make community resources easier to discover, give local businesses and NGOs more visibility, and encourage real connections between people and the organisations near them.</p></div><div class="card"><h3>Our vision</h3><p>A connected community where people can find local resources, support neighbourhood businesses and access opportunities that improve their lives.</p></div></div>
<div class="spacer"></div><h2>Who Saathi is for</h2><div class="grid"><div class="card"><span class="tag">Individuals</span><h3>Discover and contribute</h3><p>Search opportunities, find causes, apply or save for later, and keep track on your dashboard.</p></div><div class="card"><span class="tag">Local businesses</span><h3>Be easier to find</h3><p>Create a profile and share opportunities so neighbours can discover you without a website.</p></div><div class="card"><span class="tag">NGOs</span><h3>Reach supporters</h3><p>Describe your work and post volunteering openings for people who want to help.</p></div></div>
<div class="spacer"></div><h2>What we believe</h2><div class="grid"><div class="card"><h3>Community first</h3><p>Usefulness, accessibility and local relevance come before everything else.</p></div><div class="card"><h3>Inclusive</h3><p>Easy to use whatever your level of digital comfort.</p></div><div class="card"><h3>Honest</h3><p>We do not invent numbers or claim verification we have not done.</p></div></div>
<div class="spacer"></div><div class="notice"><b>Where we are today.</b> Saathi is an early version. Organisation verification, business dashboards, maps and events are ideas for the future, not features that exist yet.</div>
<div class="spacer"></div><div class="row"><a class="btn primary" href="/opportunities.html">Explore opportunities</a><a class="btn plain" href="/ngos.html">Browse NGOs</a><a class="btn plain" href="/register.html">Join Saathi</a></div></section>`;
  }
})();

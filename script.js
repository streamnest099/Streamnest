const whatsappNumber = "918921945009";

window.addEventListener("load", () => {
  const splash = document.getElementById("splash-screen");
  setTimeout(() => {
    splash.classList.add("hide");
    document.body.classList.remove("splash-active");
  }, 1800);
});

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    const duration = button.dataset.durationSelect
      ? ` - ${document.getElementById(button.dataset.durationSelect).value}`
      : "";
    const message = encodeURIComponent(
      `Hi StreamNest!\n\nI want to buy: ${button.dataset.plan}${duration}\n\nPlease share the payment details.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  });
});

const jioDuration = document.getElementById("jio-duration");
const jioPrice = document.getElementById("jio-price");
if (jioDuration && jioPrice) {
  jioDuration.addEventListener("change", () => {
    const [amount, period] = jioDuration.value.split(" / ");
    jioPrice.innerHTML = `${amount} <span>/ ${period}</span>`;
  });
}

const pricingPlans = {
  "Netflix Premium": [["₹199", "1 MONTH"], ["₹330", "3 MONTHS"], ["₹649", "6 MONTHS"], ["₹1050", "YEARLY"]],
  "Amazon Prime Video": [["₹120", "1 MONTH"], ["₹350", "6 MONTHS"], ["₹549", "YEARLY"]],
  "JioHotstar Premium": [["₹169", "1 MONTH"], ["₹349", "3 MONTHS"], ["₹659", "6 MONTHS"], ["₹1050", "YEARLY"]],
  "Canva Pro": [["₹75", "1 MONTH"], ["₹249", "YEARLY"]],
  "ZEE5 Premium": [["₹75", "1 MONTH"], ["₹169", "3 MONTHS"], ["₹269", "6 MONTHS"], ["₹359", "YEARLY"]],
  "SonyLIV Premium": [["₹99", "1 MONTH"], ["₹189", "3 MONTHS"], ["₹359", "6 MONTHS"], ["₹469", "YEARLY"]],
  "Spotify Premium": [["₹159", "3 MONTHS"], ["₹259", "6 MONTHS"], ["₹449", "YEARLY"]],
  "Crunchyroll Premium": [["₹99", "1 MONTH"], ["₹199", "3 MONTHS"], ["₹320", "YEARLY"]]
};

document.querySelectorAll(".plan-card").forEach((card) => {
  const title = card.querySelector("h3")?.textContent.trim();
  const options = pricingPlans[title];
  const price = card.querySelector(".price");
  const button = card.querySelector("button[data-plan]");
  if (!title || !price || !button) return;

  if (title === "Apple Music") {
    price.innerHTML = "₹530 <span>/ 6 MONTHS</span>";
    button.dataset.plan = "Apple Music - ₹530 / 6 MONTHS (ON YOUR EMAIL)";
    return;
  }
  if (!options) return;

  card.querySelector(".plan-duration")?.remove();
  const select = document.createElement("select");
  select.className = "plan-duration";
  select.id = `duration-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  select.setAttribute("aria-label", `Choose ${title} duration`);
  options.forEach(([amount, duration]) => {
    const option = new Option(`${duration} — ${amount}`, `${amount} / ${duration}`);
    select.add(option);
  });
  price.after(select);
  button.dataset.plan = title;
  button.dataset.durationSelect = select.id;

  const updatePrice = () => {
    const [amount, duration] = select.value.split(" / ");
    price.innerHTML = `${amount} <span>/ ${duration}</span>`;
  };
  select.addEventListener("change", updatePrice);
  updatePrice();
});

const categoryMap = {
  "Netflix Premium": "ott",
  "Amazon Prime Video": "ott",
  "JioHotstar Premium": "ott",
  "Canva Pro": "ott",
  "ZEE5 Premium": "ott",
  "SonyLIV Premium": "ott",
  "Crunchyroll Premium": "ott",
  "Netflix + Prime": "combo",
  "Netflix + JioHotstar": "combo",
  "Ultimate Combo": "combo",
  "Spotify Premium": "music",
  "Apple Music": "music"
};

const planContainer = document.querySelector(".plan-container");
if (planContainer) {
  const categoryBar = document.createElement("div");
  categoryBar.className = "category-bar";
  categoryBar.innerHTML = `
    <button class="category-btn active" data-category="all">ALL PLANS</button>
    <button class="category-btn" data-category="ott">OTT PLATFORMS</button>
    <button class="category-btn" data-category="combo">COMBO OFFERS</button>
    <button class="category-btn" data-category="music">MUSIC</button>`;
  planContainer.before(categoryBar);

  const cards = [...planContainer.querySelectorAll(".plan-card")];
  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    card.dataset.category = categoryMap[title] || "ott";
  });
  categoryBar.addEventListener("click", (event) => {
    const button = event.target.closest(".category-btn");
    if (!button) return;
    categoryBar.querySelectorAll(".category-btn").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.category;
    cards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
  });
}

if (window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".plan-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) translateY(-10px) scale(1.012) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

// Reveal each main section gently as it enters the screen.
const revealSections = document.querySelectorAll(".plans, .about, .reviews, .faq, .contact, footer");
const sectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("section-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealSections.forEach((section) => {
  section.classList.add("section-reveal");
  sectionObserver.observe(section);
});

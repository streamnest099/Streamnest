/* StreamNest StreamCredits — browser-persistent loyalty rewards */
(() => {
  const plans = {
    "Netflix Premium": 20, "Amazon Prime Video": 12, "JioHotstar Premium": 17,
    "SonyLIV Premium": 10, "Spotify Premium": 16
  };
  const rewards = [
    ["Netflix Premium", 180], ["Amazon Prime Video", 120], ["JioHotstar Premium", 170],
    ["SonyLIV Premium", 100], ["Spotify Premium", 160]
  ];
  const member = () => {
    try { return JSON.parse(localStorage.getItem("streamnest:member")) || null; } catch { return null; }
  };
  const key = () => `streamnest:credits:${member()?.contact || "guest"}`;
  const state = () => {
    try { return JSON.parse(localStorage.getItem(key())) || { balance: 0, transactions: [] }; }
    catch { return { balance: 0, transactions: [] }; }
  };
  const save = (data) => localStorage.setItem(key(), JSON.stringify(data));
  const date = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  const creditFor = (name, amount) => plans[name] ?? Math.max(1, Math.round(Number(amount || 0) / 10));

  const css = `
    .stream-credits{max-width:1280px;margin:0 auto;padding:70px 38px;background:linear-gradient(135deg,rgba(30,2,6,.72),rgba(5,5,6,.4))}.credits-heading{margin-bottom:25px}.credits-heading h2{margin:7px 0;color:#fff;font-size:clamp(34px,4vw,52px)}.credits-heading h2:before{content:'◆ ';color:#ef1020;font-size:.62em;vertical-align:middle}.credits-heading>p:last-child{color:#b3b3b6;font-size:17px}.credits-dashboard{display:grid;grid-template-columns:minmax(260px,.78fr) minmax(0,1.6fr);gap:18px}.credits-balance-card,.credits-earn-card,.credits-rewards,.credits-history{border:1px solid rgba(239,16,32,.32);border-radius:16px;background:linear-gradient(145deg,rgba(27,9,12,.98),rgba(7,7,8,.98));box-shadow:0 16px 32px rgba(0,0,0,.22)}.credits-balance-card{min-height:210px;padding:28px;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 85% 15%,rgba(239,16,32,.28),transparent 42%),linear-gradient(145deg,#21070d,#070707)}.credits-coin{color:#ff3945;font-size:26px;text-shadow:0 0 16px rgba(239,16,32,.7)}.credits-balance-card p{color:#a9a9ad;margin:14px 0 3px}.credits-balance-card strong{color:#fff;font-size:38px}.credits-balance-card em{color:#ff2735;font-size:16px;font-style:normal}.credits-balance-card small{color:#9c9ca0;margin-top:13px;line-height:1.5}.credits-earn-card{padding:24px}.credits-earn-card h3,.credits-rewards h3,.credits-history h3{margin:0;color:#f7f7f8;font-size:20px}.credits-earn-card>p,.credits-rewards>div>p,.credits-history>div>p{color:#999ba0;margin:8px 0 18px;font-size:13px;line-height:1.55}.credits-earn-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.credits-earn-list span{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.045);color:#c8c8ca;font-size:12px}.credits-earn-list b{color:#ff2936;white-space:nowrap}.credits-rewards,.credits-history{margin-top:18px;padding:25px}.credits-reward-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.credits-reward{padding:16px 13px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:#090909}.credits-reward.eligible{border-color:rgba(239,16,32,.7);box-shadow:inset 0 0 20px rgba(239,16,32,.08)}.credits-reward h4{margin:0;color:#f5f5f5;font-size:14px}.credits-reward p{margin:8px 0 14px;color:#ff2936;font-weight:700;font-size:13px}.credits-reward button{width:100%;padding:9px 7px;border:1px solid #f01a28;border-radius:7px;background:linear-gradient(135deg,#ee1725,#a90410);color:#fff;font-weight:700;font-size:11px;cursor:pointer}.credits-reward button:disabled{border-color:#343438;background:#151517;color:#77777c;cursor:not-allowed}.credits-history{display:grid;grid-template-columns:280px 1fr;gap:30px}.credits-history ul{margin:0;padding:0;list-style:none}.credits-history li{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.08)}.credits-history li:last-child{border-bottom:0}.credits-history li span{display:grid;gap:3px}.credits-history li b{color:#eaeaec;font-size:13px}.credits-history li small{color:#88888e;font-size:11px}.credits-history li strong{font-size:13px}.earned{color:#22d875}.redeemed{color:#ff4853}.credits-empty{color:#8d8d93;font-size:13px}@media(max-width:800px){.stream-credits{padding:48px 20px}.credits-dashboard,.credits-history{grid-template-columns:1fr}.credits-reward-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.credits-history{gap:8px}}@media(max-width:460px){.credits-earn-list{grid-template-columns:1fr}.credits-balance-card strong{font-size:31px}.credits-rewards,.credits-history,.credits-earn-card{padding:19px 16px}.credits-reward-grid{gap:9px}.credits-reward{padding:13px 10px}.credits-reward h4{font-size:12px}}`;

  const inject = () => {
    document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
    const section = document.createElement("section");
    section.className = "stream-credits";
    section.id = "stream-credits";
    section.innerHTML = `<div class="credits-heading"><p class="small-title">LOYALTY REWARDS</p><h2>StreamCredits</h2><p>Earn Credits. Redeem OTT.</p></div><div class="credits-dashboard"><div class="credits-balance-card"><span class="credits-coin">◆</span><p>Your balance</p><strong><span id="credits-balance">0</span> <em>StreamCredits</em></strong><small id="credits-member"></small></div><div class="credits-earn-card"><h3>Earn with every OTT purchase</h3><p>Credits are added after a completed payment. Approximately ₹10 spent = 1 credit.</p><div class="credits-earn-list" id="credits-earn-list"></div></div></div><div class="credits-rewards"><div><h3>Available OTT rewards</h3><p>Use earned credits for a future plan. No credit packages, ever.</p></div><div class="credits-reward-grid" id="credits-reward-grid"></div></div><div class="credits-history"><div><h3>Credit history</h3><p>Every earned and redeemed credit is recorded here.</p></div><ul id="credits-history-list" aria-live="polite"></ul></div>`;
    (document.querySelector(".plans") || document.querySelector("main"))?.after(section);
  };

  const render = () => {
    const data = state(); const account = member();
    document.querySelector("#credits-balance").textContent = data.balance;
    document.querySelector("#credits-member").textContent = account ? `Rewards saved for ${account.name || account.contact}.` : "Guest balance is saved on this device. Sign in to link it to your account.";
    const purchaseRows = [...document.querySelectorAll(".plan-card")].map((card) => {
      const name = card.querySelector("h3")?.textContent.trim();
      const amount = Number(card.querySelector(".price")?.textContent.match(/\d+/)?.[0] || 0);
      return name ? `<span>${name}<b>+${creditFor(name, amount)}</b></span>` : "";
    }).filter(Boolean).slice(0, 8).join("");
    document.querySelector("#credits-earn-list").innerHTML = purchaseRows;
    document.querySelector("#credits-reward-grid").innerHTML = rewards.map(([name, credits]) => {
      const ready = data.balance >= credits;
      return `<article class="credits-reward ${ready ? "eligible" : ""}"><h4>${name}</h4><p>${credits} Credits</p><button type="button" data-reward="${name}" ${ready ? "" : "disabled"}>${ready ? "Redeem Now" : `${credits - data.balance} more needed`}</button></article>`;
    }).join("");
    document.querySelector("#credits-history-list").innerHTML = data.transactions.length ? data.transactions.slice(0, 8).map((item) => `<li><span><b>${item.title}</b><small>${date(item.at)}</small></span><strong class="${item.amount > 0 ? "earned" : "redeemed"}">${item.amount > 0 ? "+" : ""}${item.amount} Credits</strong></li>`).join("") : `<li class="credits-empty">No credits yet. Complete an OTT purchase to start earning.</li>`;
  };

  let checkoutToken = 0; let creditedToken = -1;
  const award = () => {
    if (creditedToken === checkoutToken) return;
    const planText = document.querySelector("#checkout-plan")?.textContent || "OTT plan";
    const name = planText.split("·")[0].trim();
    const amount = Number((document.querySelector("#checkout-amount")?.textContent || "0").match(/\d+/)?.[0] || 0);
    const credits = creditFor(name, amount); const data = state();
    data.balance += credits;
    data.transactions.unshift({ title: `${name} purchase`, amount: credits, at: new Date().toISOString() });
    save(data); creditedToken = checkoutToken; render();
  };
  const redeem = (name) => {
    const reward = rewards.find(([rewardName]) => rewardName === name); const data = state();
    if (!reward || data.balance < reward[1]) return;
    data.balance -= reward[1]; data.transactions.unshift({ title: `${name} redeemed`, amount: -reward[1], at: new Date().toISOString() }); save(data); render();
    window.alert(`Success! ${name} has been redeemed for ${reward[1]} StreamCredits.`);
  };

  inject(); render();
  document.querySelector("#credits-reward-grid").addEventListener("click", (event) => { const button = event.target.closest("[data-reward]"); if (button) redeem(button.dataset.reward); });
  new MutationObserver(() => { if (document.querySelector("#checkout-modal")?.classList.contains("open")) checkoutToken += 1; }).observe(document.querySelector("#checkout-modal") || document.body, { attributes: true, attributeFilter: ["class"] });
  document.querySelector("#auth-form")?.addEventListener("submit", () => setTimeout(() => { const contact = document.querySelector("#auth-contact")?.value.trim().toLowerCase(); const name = document.querySelector("#auth-name")?.value.trim(); if (contact) { localStorage.setItem("streamnest:member", JSON.stringify({ contact, name })); render(); } }, 0));
})();

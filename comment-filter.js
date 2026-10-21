/* Spiderflow – Webflow Comments Filter & Sorter
 * Paste into DevTools console (Webflow Designer tab) OR load as a Chrome extension content script.
 * Adds a filter button next to the "…" (Settings) button in the Comments panel.
 * Filters: search text, author, page, breakpoint, age, unread only, plus Webflow's own page/locale/resolved options.  Sort: newest / oldest / most replies.
 * Uses CSS classes + flex `order` only (no DOM re-ordering) so Webflow's React UI is not disturbed.
 */
(() => {
  if (window.__sfCommentFilter) window.__sfCommentFilter.destroy();

  const A = (id) => `[data-automation-id="${id}"]`;
  const $ = (s, r = document) => r.querySelector(s);
  // Webflow's "…" button: its id gains a "-filtered" suffix while any of its own filters is on
  const SETTINGS = `${A('annotations-filter-dropdown')},${A('annotations-filter-dropdown-filtered')}`;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const BRAND_URL = 'https://www.spiderflow.io/';
  const BRAND_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAJoElEQVR4nJ1XaWxU1xX+zn1vZmxiG2ywMTbGTUIKddjMezPea5OyhGwiae1KlVoprdJNRKqqEDVNqhfTZmkbklZK0yRNS6X+ikehJBBQIGFsPOOlnrGBDjVZWOxZ7PHYxgHvM++e/hiPGTBBaY/0frzlfOec73z3vnOBWxhzvQIAh/0l+e6g9rzBEMygL/4eZDCEO6TtbeosyU/F+J+tac7xUM/Gwp4xxzl3UD89F0TcIgEBAO6Qfqb7sqP3oK+0IBXrZnZTMGaIBnKaH328aePKr9i8QtBKmHL3rapP8SVBeFwoKC6+w9J1vFdb30BO84sSX/CQ2RAAuDWwuXzZCusJEGbDgemy6uLuVgBEBPlFwefeUWWBt2U4HCtnIplXqLpaA5vLAfAc9q0TaEazIAITYZfVKnIig+aOnXefPvuGV7OkBmcGpV6pSXi9mmXr2p4zo0MzO2w2sZQIu4jAzWhemMAcwEImiGYmJkzOzhZjBkOENZ+ZfGcYSCY5f6UmcUjzmcwQS5Yol8fH48xMMzfiJwWdBFpAKwEkBBErpDZeX7lobIQ0DKjtA3pTe1h/G0gklFoIEeRUDBYhiAgLtdNIkERgcbC3MtMd0LYkaZ0HEGAAiM1Y5kGbuF4hgvzHkdVZD+62H8lcotZnZqsNXVH74SZXSQYRZKriBVkpFSs1hjto32QYECI/Z/YECI8CQHNz7bwzSxZSsowvUq8wQ9Q114oGcpqHO+35XyvLaVmUoWy7PDTz0Gg09nBmlrrzjo0ZrnfPrFveQE6zDrWCGSJzkXKFmU0peR43GYOIf3b/bse7IjvXqhNobKFCxdSyHKuwTFzdRQRZV5fH7qC9onAN+VQVayKDsS01xT2Hvr7KdzAcmN6qCNpQVLSoq32grKwOeUwEeXV8+uGl2VaFICZTkZua6hWWPJ69TH1AmHFGLGYKokaZmxsVdWgxDQNCmOrr0ejsewWF6fvdIe1JIqdJgldbLHQlEpWOLbf7mpOA96zu+Wg0MuOwWIRpmvFSIqfpCWm/WFFo+2skOnuAM9P+bBgQdWgxc3OjoqHBaZqSZTzGQEfEfr57zDHeckHbDgAuV62a7JNh1KqdEftb/VzNHRH9pbl483Se6NustVzSNifvjf3FaQDQGbG/3M/V3B6xv97UlNAEM8jFtSoANF/Ud/aMOSY6B/VPcayvtMA7Yu/8OFbBJwP6dwHAxbVq6h7eMaDv7edq9gT1gy6uTQOAE5+VfqNr2MGdQ3b+8NOEiD/he22ekPZeH1dzW1g3rgmvXkkGbw1o3/skXsFdw3bPh+fLlgMAPji14TbvsP39C1zJnqD+RNKxfVD7nTuk7QWA1qD+hCek7wOA1n7tO73TFdwe0U90DNqbe6cruKWv9NsA4Alqr7iD2s8BwBPS97UP2p9P4rUNaE9e5CruijoO7Hcl2Er9uYh/Den7g1zNrf3ac56w9kqYa9gT1N70smZJgpzs1x6/wJXsG3EcMAyIN7yaxTvieO8zruSWS9rueaH5S6zugPb3MNewJ6Tvcwf1FwNzbbnGzFzs1P54gvpvz8Uq+FysgltD+lMA4GXN4uJa1RPS913iKm4b0F9LUptc956w/peLXMXuoP6iy1WrzuOFtWeu4WmN11qc0JkAACfqxRZqiTd5tcW2dFobm5HxkUjs+zWF3hfq66Ho5Itl+saJiE9fGY9P2Ky07rDfnk/kNBvIaR7rLS1ISxNrr47Hx1nyGdQBW6glXmvUqlUFvt8MD8V/GJuRMj1NWdfk1RZvoZa4E/UCQKLyLdQSP3J6/crlRelHrFaxfmx09pGaVd3/bAvpL9nSRc3oIN+3raRrBABOXNDKcpYqLgJFxy5znRQxJSfL2iKJs4YHZu/ZtvZUFwAc+WRT7oo829GpCemqLOzac/KS9q2cPItzZlqeGho079tZ4htwuWpVAgDXZ/q67GXKMQZnDkdj27fd1dPOXK+4Q+e/uXix5e3JCdk9O2MeUVRRRaZ6/5XJWHFennp8NiYzCSwsFnF5eHR2a86dSmgmjCPSJLfVigds6cqG8StmfXjl7QcbyGm6zmvV2UuVYwwa+Twyu71uTU+vaOnTti9eJtpAHItGYo5td/W0J/tXs7K7qb9vulS1oKR4VfozAI1n2WzKvWt95yKDcQcYA5IRCAQnHdtXn/r06tCUIND4qiLb00KlrwYuTm2oLvK+k9s8lGD6Tp87MjztIDBlLbe0t/bpW9E1bI97R+y9R/+jrUgKC0jZiKL2P5ydLOfOQfvvAeBA59qlSRW7e9dkunvXZCbvD/vt+QDQEdH3+SfKuTNif7m+aX7jIpcrUdihno2FXcOOj7uG7TH4p8rNlkub9wGA319iZQYZBkRbf3lO15D93YtcxW1zq8Ed0rb/+2rZxMmg/mhy9STV3Nqv/cA/Xj7rGdDuB4D2sPb0Ja7iziH7O61j1dmGkfj/+/0lVgA4eUl7yT9VzsJqE0JRKYMZFI3mymbUKo2NkJLiP87NtT7U3z/1aGWh9wUvaxbEpX9mVh4vKrT9rWNA35McRtpC+i9XFqW9NTlpvh+fQbeXNUtFge+5vsD0Y8tzrY/Q1emfNDZCNqNWiUZzpWFAKCotIUFQo5HYXoByEgNFHjdjKDETCJk+PDors7IyDzJDOOGTDcUIA9jVMai/Vpif9rv2sD1bQqqrVqTtCUSm/lSR79sNAE0MhRnC/Xn6OyOXZ15nyEXJNkWjedzYCLntMUTHhmI/ElUrugwp4nsBgMg5P3aRICkEifHJeBYR5FmADQPCYIjyfO9P+wen9i7NV5/KXW7d0zcw9auKfN9uZkMwg84iMWWJSTOLiBQhaB63oSERQ0h1b1WR902VGYLoVBQ3GMtEby222Pw41tgIyc+C7uZ6pYqchiekjxLYrCr0vZoQb6MkAhtzupA8y4Ayj5Vqlas6ppghVCJIZhDRtbEJABhgKZnJRJwZ4tkkMwQGEnM+kfePc2IUqewln/miiEnJzLgeOylgIkhxDfR6IybbotsUGh/lxUSQBT7tutNNcv5Lzomp7x70aQoRZDQaz8nIUImIbQvwbxJzLrNEH1sDm8tPX3GM9Iw5+o73rl+frOqmTjdUDgAfnivd0DNWFjj9eVm0NbC5PLFkFx5MbnrUSlAK+YF/46a8QttRoVDW1cuxe6tWdbtxi9PRXHBuG7DXZGSIo9LksaGB6R07Ss74k5g3+ty0oiS9O9adPtV3IaaZJgegile/kLbrfZklv2qa3N93IWbfUXLGf7M2fSn7v4/nAf3XX/Z4/l+4yTUKE2uoEAAAAABJRU5ErkJggg==';

  // Webflow breakpoint id -> friendly name (largest first). Unknown ids fall back to their raw name.
  const X_ICON = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>';

  const BP = [
    { ids: ['xxlarge', 'xxxl'], label: 'Desktop XXXL', px: '1920px+' },
    { ids: ['xlarge', 'xxl'], label: 'Desktop XXL', px: '1440px+' },
    { ids: ['large', 'xl'], label: 'Desktop XL', px: '1280px+' },
    { ids: ['main', 'desktop'], label: 'Desktop', px: 'Base' },
    { ids: ['medium', 'tablet'], label: 'Tablet', px: '991px and below' },
    { ids: ['small'], label: 'Mobile landscape', px: '767px and below' },
    { ids: ['tiny'], label: 'Mobile portrait', px: '478px and below' },
  ];
  const bpInfo = (id) => {
    const k = (id || '').toLowerCase();
    const i = BP.findIndex((b) => b.ids.includes(k));
    return i < 0
      ? { rank: BP.length, label: k.charAt(0).toUpperCase() + k.slice(1), px: '' }
      : { rank: i, label: BP[i].label, px: BP[i].px };
  };

  const S = { q: '', sort: 'default', age: 'any', people: new Set(), pages: new Set(), bps: new Set(), unread: false };
  // Webflow's own filter settings (live in the "…" menu); undefined = not available on this site
  const NATIVE = [['currentPage', 'Only on this page'], ['currentLocale', 'Only for this locale'], ['resolved', 'Show resolved']];
  const nativeState = {};
  let probing = false, queue = Promise.resolve();
  const touched = new Set();
  let popover = null, els = {}, menuBg = '', timer = null;

  /* ---------- styles ---------- */
  const style = document.createElement('style');
  style.id = 'sf-style';
  style.textContent = `
    /* Spiderflow brand tokens (lime from the spider mark: #C5E534) */
    #sf-btn,.sf-pop{
      --sf-brand:#C5E534; --sf-brand-hover:#D4F05A; --sf-brand-ink:#1B1F08;
      --sf-brand-soft:rgba(197,229,52,.12); --sf-brand-ring:rgba(197,229,52,.35);
      --sf-bg:var(--colors-background-3,#383838); --sf-bg-2:var(--colors-background-2,#2e2e2e);
      --sf-border:var(--colors-border-1,#4a4a4a); --sf-border-hover:#6e6e6e;
      /* theme-dependent: accent is the brand colour as text/outline, readable on the surface */
      --sf-accent:var(--sf-brand); --sf-text:#e6e6e6; --sf-hover:rgba(255,255,255,.05);
      --sf-thumb:rgba(255,255,255,.18); --sf-thumb-hover:rgba(255,255,255,.3);
      --sf-well:rgba(0,0,0,.05); --sf-cb-bg:rgba(0,0,0,.2);
    }
    /* Webflow light theme */
    #sf-btn.sf-light,.sf-pop.sf-light{
      --sf-accent:#566b00; --sf-text:#1e1e1e; --sf-hover:rgba(0,0,0,.05);
      --sf-brand-soft:rgba(110,135,0,.14); --sf-border-hover:#9a9a9a;
      --sf-thumb:rgba(0,0,0,.2); --sf-thumb-hover:rgba(0,0,0,.32);
      --sf-well:rgba(0,0,0,.05); --sf-cb-bg:rgba(0,0,0,.04);
    }
    .sf-hide{display:none!important}

    /* toolbar button + active indicator */
    #sf-btn{position:relative}
    #sf-btn svg path{transition:stroke .15s}
    #sf-btn.sf-active svg path{stroke:var(--sf-accent)}
    #sf-btn.sf-open{box-shadow:inset 0 0 0 1px var(--sf-accent);border-radius:4px}
    #sf-btn .sf-dot{position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;
      background:var(--sf-brand);box-shadow:0 0 0 2px var(--sf-bg);display:none;pointer-events:none}
    #sf-btn.sf-active .sf-dot{display:block}

    /* panel */
    .sf-pop{position:absolute;top:36px;right:4px;width:200px;z-index:30;display:none;box-sizing:border-box;
      background:var(--sf-bg);border:1px solid var(--sf-border);border-radius:6px;padding:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.35);height:auto;max-height:80vh;overflow-y:auto;overscroll-behavior:contain;
      font-size:12px;scrollbar-width:thin;scrollbar-color:var(--sf-thumb) transparent}
    .sf-pop::-webkit-scrollbar{width:8px}
    .sf-pop::-webkit-scrollbar-thumb{background:var(--sf-thumb);border-radius:8px;border:2px solid var(--sf-bg)}
    .sf-pop::-webkit-scrollbar-thumb:hover{background:var(--sf-thumb-hover)}
    .sf-pop.sf-open{display:block}
    .sf-pop *{box-sizing:border-box}
    .sf-lab{font-weight:600;margin:14px 0 6px;opacity:.75;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
    .sf-pop > .sf-lab:first-child{margin-top:0}

    /* inputs + selects */
    .sf-in{width:100%;background:var(--sf-well);color:inherit;border:1px solid var(--sf-border);
      border-radius:4px;padding:5px 6px;font:inherit;transition:border-color .12s,box-shadow .12s,background-color .12s}
    .sf-in:hover{border-color:var(--sf-border-hover)}
    .sf-in:focus,.sf-in:focus-visible{outline:none}
    select.sf-in{cursor:pointer}
    select.sf-in:hover{border-color:var(--sf-accent);background:var(--sf-brand-soft)}
    select.sf-in option{background:var(--sf-bg);color:var(--sf-text)}

    /* header row + icon buttons (close popup, clear search) */
    .sf-head{display:flex;justify-content:space-between;align-items:center;margin:-2px -4px 6px 0}
    .sf-head .sf-lab{margin:0}
    .sf-ico{display:grid;place-items:center;flex:none;width:20px;height:20px;padding:0;border:0;border-radius:4px;
      background:transparent;color:inherit;opacity:.65;cursor:pointer;transition:color .12s,background-color .12s,opacity .12s}
    .sf-ico svg{width:10px;height:10px;display:block}
    .sf-ico:hover{opacity:1;color:var(--sf-accent);background:var(--sf-brand-soft)}
    .sf-ico:focus-visible{outline:2px solid var(--sf-accent);outline-offset:1px;opacity:1}
    .sf-search{position:relative}
    .sf-search .sf-in{padding-right:26px}
    .sf-search .sf-ico{position:absolute;top:50%;right:3px;transform:translateY(-50%)}
    .sf-search .sf-ico[hidden]{display:none}
    .sf-in[type=search]::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none;display:none}

    /* customizable dropdown list (Chrome 135+); older Chrome falls back to the native list */
    @supports (appearance:base-select){
      select.sf-in,select.sf-in::picker(select){appearance:base-select}
      select.sf-in{display:flex;align-items:center;justify-content:space-between}
      select.sf-in::picker-icon{color:currentColor;opacity:.6;transition:rotate .15s,color .12s,opacity .12s}
      select.sf-in:hover::picker-icon,select.sf-in:open::picker-icon{color:var(--sf-accent);opacity:1}
      select.sf-in:open::picker-icon{rotate:180deg}
      select.sf-in::picker(select){margin-top:4px;padding:4px;background:var(--sf-bg);color:var(--sf-text);
        border:1px solid var(--sf-border);border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
      select.sf-in option{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:4px;
        background:transparent;cursor:pointer;font-size:12px}
      select.sf-in option:hover,select.sf-in option:focus-visible{background:var(--sf-brand-soft);color:var(--sf-accent);outline:none}
      select.sf-in option:checked{color:var(--sf-accent);font-weight:600}
      select.sf-in option::checkmark{color:var(--sf-accent)}
    }

    /* checkbox lists */
    .sf-list{--sf-row:24px;max-height:calc(var(--sf-row) * 3 + 10px);overflow-y:auto;background:var(--sf-well);border:1px solid var(--sf-border);border-radius:4px;padding:4px;
      scrollbar-width:thin;scrollbar-color:var(--sf-thumb) transparent}
    .sf-list:empty::before{content:attr(data-empty);display:block;padding:4px;font-size:11px;opacity:.6}
    .sf-list.sf-fixed{max-height:none;overflow:visible}
    .sf-chk{display:flex;align-items:center;gap:8px;height:var(--sf-row,24px);padding:0 4px;border-radius:3px;cursor:pointer;transition:background-color .12s}
    .sf-chk:hover{background:var(--sf-hover)}
    .sf-cb{appearance:none;-webkit-appearance:none;margin:0;flex:none;width:14px;height:14px;cursor:pointer;
      border:1px solid var(--colors-border-2,#6b6b6b);border-radius:3px;background:var(--sf-cb-bg);
      display:grid;place-content:center;transition:background-color .12s,border-color .12s}
    .sf-cb::after{content:"";width:8px;height:8px;background:var(--sf-brand-ink);transform:scale(0);transition:transform .12s ease-out;
      clip-path:polygon(14% 44%,0 65%,50% 100%,100% 16%,80% 0%,43% 62%)}
    .sf-chk:hover .sf-cb,.sf-cb:hover{border-color:var(--sf-accent)}
    .sf-cb:checked{background:var(--sf-brand);border-color:var(--sf-brand)}
    .sf-chk:hover .sf-cb:checked{background:var(--sf-brand-hover);border-color:var(--sf-brand-hover)}
    .sf-cb:checked::after{transform:scale(1)}
    .sf-cb:focus,.sf-cb:focus-visible{outline:none}
    .sf-chk[hidden]{display:none}
    .sf-cb:disabled{opacity:.5;cursor:progress}
    .sf-chk.sf-busy{cursor:progress}
    .sf-note{margin:6px 4px 0;font-size:11px;opacity:.6}
    html.sf-probing [data-floating-ui-portal]{opacity:0!important}
    .sf-chk span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sf-chk em{opacity:.6;font-style:normal}

    /* footer */
    .sf-foot{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
    .sf-foot button{cursor:pointer;background:var(--sf-well);color:inherit;border:1px solid var(--sf-border);
      border-radius:4px;padding:3px 10px;font:inherit;transition:color .12s,border-color .12s,background-color .12s}
    .sf-foot button:hover{color:var(--sf-accent);border-color:var(--sf-accent);background:var(--sf-brand-soft)}
    .sf-foot button:active{color:var(--sf-brand-ink);background:var(--sf-brand);border-color:var(--sf-brand)}
    .sf-foot button:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px}
    .sf-brand{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding-top:10px;
      border-top:1px solid var(--sf-border);color:inherit;text-decoration:none;opacity:.6;font-size:11px;
      transition:opacity .12s,color .12s}
    .sf-brand:hover{opacity:1;color:var(--sf-accent)}
    .sf-brand:focus-visible{outline:2px solid var(--sf-accent);outline-offset:2px;opacity:1}
    .sf-brand img{width:14px;height:14px;display:block}

    @media (prefers-reduced-motion:reduce){
      #sf-btn *,.sf-pop,.sf-pop *,.sf-pop *::after,.sf-in::picker-icon{transition:none!important}
    }
  `;
  document.head.appendChild(style);

  /* ---------- helpers ---------- */
  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') el.className = v;
      else if (k === 'checked' || k === 'value') el[k] = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    kids.flat().forEach((c) => el.append(c));
    return el;
  }

  // "18 days ago", "a month ago", "5 hours ago" -> minutes
  function toMinutes(t) {
    t = (t || '').toLowerCase().trim();
    if (/just now|^now/.test(t)) return 0;
    const m = t.match(/(an?|\d+)\s+(second|minute|hour|day|week|month|year)s?/);
    if (!m) return Infinity;
    const n = /^an?$/.test(m[1]) ? 1 : +m[1];
    const mult = { second: 1 / 60, minute: 1, hour: 60, day: 1440, week: 10080, month: 43200, year: 525600 }[m[2]];
    return n * mult;
  }
  const num = (x, y) => (x === y ? 0 : x - y);

  function ageOk(min) {
    const d = min / 1440;
    switch (S.age) {
      case '1': return d <= 1;
      case '7': return d <= 7;
      case '14': return d <= 14;
      case '30': return d <= 30;
      case 'older': return d > 30;
      default: return true;
    }
  }

  function readItems() {
    return $$(A('annotation-container')).map((btn, i) => {
      const txt = (id) => ($(A(id), btn)?.textContent || '').trim();
      const group = btn.closest(A('annotations-grouped-by-page'));
      return {
        i,
        li: btn.closest('li'),
        group,
        name: txt('annotation-user-name'),
        page: group ? ($(A('page-name'), group)?.textContent || '').trim() : '',
        text: ($(A('annotation-content'), btn)?.textContent || '').toLowerCase(),
        minutes: toMinutes(txt('annotation-lastupdated')),
        replies: parseInt(txt('annotation-replies-count'), 10) || 0,
        bp: ($(A('annotation-breakpoint-icon'), btn)?.getAttribute('aria-label') || '').split(' ')[0],
        unread: !!$(A('annotation-unread-notification'), btn),
      };
    });
  }

  function flex(el, on) {
    touched.add(el);
    el.style.display = on ? 'flex' : '';
    el.style.flexDirection = on ? 'column' : '';
  }

  /* ---------- core ---------- */
  function apply() {
    if (!popover) return;
    const items = readItems();

    const q = S.q.trim().toLowerCase();
    let shown = 0;
    items.forEach((it) => {
      it.base = !(q && !`${it.name} ${it.page} ${it.text}`.toLowerCase().includes(q))
        && !(S.unread && !it.unread) && ageOk(it.minutes);
      it.okPerson = !S.people.size || S.people.has(it.name);
      it.okPage = !S.pages.size || S.pages.has(it.page);
      it.okBp = !S.bps.size || S.bps.has(it.bp);
      const ok = it.base && it.okPerson && it.okPage && it.okBp;
      it.ok = ok;
      touched.add(it.li);
      it.li.classList.toggle('sf-hide', !ok);
      if (ok) shown++;
    });
    syncLists(items);

    const sorting = S.sort !== 'default';
    const cmp = (a, b) => {
      let d = 0;
      if (S.sort === 'new') d = num(a.minutes, b.minutes);
      else if (S.sort === 'old') d = num(b.minutes, a.minutes);
      else if (S.sort === 'replies') d = b.replies - a.replies;
      return d || a.i - b.i;
    };

    // group by page
    const groups = new Map();
    items.forEach((it) => {
      const g = it.group?.parentElement;
      if (!g) return;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(it);
    });

    const gl = [...groups.entries()].map(([g, list], gi) => {
      const vis = list.filter((i) => i.ok);
      touched.add(g);
      g.classList.toggle('sf-hide', vis.length === 0);
      flex(list[0].li.parentElement, sorting);
      [...list].sort(cmp).forEach((it, idx) => { it.li.style.order = sorting ? idx : ''; });
      const src = vis.length ? vis : list;
      let key = 0;
      if (S.sort === 'new') key = Math.min(...src.map((i) => i.minutes));
      else if (S.sort === 'old') key = -Math.max(...src.map((i) => i.minutes));
      else if (S.sort === 'replies') key = -Math.max(...src.map((i) => i.replies));
      return { g, key, gi };
    });
    gl.sort((a, b) => num(a.key, b.key) || a.gi - b.gi).forEach((x, idx) => { x.g.style.order = sorting ? idx : ''; });
    if (gl.length) flex(gl[0].g.parentElement, sorting);

    els.count.textContent = !items.length ? 'No comments' : shown ? `Showing ${shown} of ${items.length}` : `No matches (0 of ${items.length})`;
    const active = S.q || sorting || S.age !== 'any' || S.people.size || S.pages.size || S.bps.size || S.unread;
    $('#sf-btn')?.classList.toggle('sf-active', !!active);
  }

  // Each list counts the comments matching every *other* active filter, so picking a page narrows
  // the authors (and vice versa). Checked entries stay listed even at 0 so they can be unchecked.
  function syncLists(items) {
    const pc = new Map(), gc = new Map(), bc = new Map();
    const add = (m, k) => m.set(k, (m.get(k) || 0) + 1);
    items.forEach((it) => {
      if (!it.base) return;
      if (it.okPage && it.okBp) add(pc, it.name);
      if (it.page && it.okPerson && it.okBp) add(gc, it.page);
      if (it.bp && it.okPerson && it.okPage) add(bc, it.bp);
    });
    [[pc, S.people], [gc, S.pages], [bc, S.bps]].forEach(([m, set]) => set.forEach((k) => { if (!m.has(k)) m.set(k, 0); }));
    fill(els.people, pc, S.people);
    fill(els.pages, gc, S.pages);
    fill(els.bps, bc, S.bps, {
      label: (id) => bpInfo(id).label,
      title: (id) => bpInfo(id).px,
      sort: (a, b) => bpInfo(a).rank - bpInfo(b).rank || a.localeCompare(b),
    });
  }

  function fill(box, map, set, o = {}) {
    const label = o.label || ((k) => k);
    const sort = o.sort || ((a, b) => a.localeCompare(b));
    const sig = JSON.stringify([...map].sort());
    if (box._sig === sig) return;
    box._sig = sig;
    box.replaceChildren(
      ...[...map.entries()].sort((a, b) => sort(a[0], b[0])).map(([key, n]) => {
        const cb = h('input', { type: 'checkbox', class: 'sf-cb', checked: set.has(key) });
        cb.addEventListener('change', () => { cb.checked ? set.add(key) : set.delete(key); apply(); });
        const row = h('label', { class: 'sf-chk' }, cb, h('span', {}, label(key)), h('em', {}, String(n)));
        const tip = o.title?.(key);
        if (tip) row.title = tip;
        return row;
      })
    );
  }

  function reset() {
    Object.assign(S, { q: '', sort: 'default', age: 'any', unread: false });
    S.people.clear(); S.pages.clear(); S.bps.clear();
    els.q.value = ''; els.qClear.hidden = true; els.sort.value = 'default'; els.age.value = 'any'; els.unread.checked = false;
    [els.people, els.pages, els.bps].forEach((box) => { box._sig = ''; });
    apply();
    // also switch off Webflow's own filters (queued, one menu round-trip each)
    NATIVE.forEach(([key]) => {
      const { cb } = els.native[key];
      if (nativeState[key] === undefined || (!nativeState[key] && !cb.checked)) return;
      cb.checked = false;
      toggleNative(key, cb);
    });
  }

  /* ---------- UI ---------- */
  function iconBtn(label, onclick) {
    const b = h('button', { type: 'button', class: 'sf-ico', 'aria-label': label, title: label, onclick });
    b.innerHTML = X_ICON;
    return b;
  }

  function buildPopover() {
    const lab = (t) => h('div', { class: 'sf-lab' }, t);
    const opts = (arr) => arr.map(([v, t]) => h('option', { value: v }, t));

    els.q = h('input', { type: 'search', class: 'sf-in', placeholder: 'Search name, page or text…', value: S.q,
      oninput: (e) => { S.q = e.target.value; els.qClear.hidden = !S.q; apply(); } });
    els.qClear = iconBtn('Clear search', () => { S.q = ''; els.q.value = ''; els.qClear.hidden = true; apply(); els.q.focus(); });
    els.qClear.hidden = !S.q;
    const closeBtn = iconBtn('Close filters', () => { setOpen(false); $('#sf-btn')?.focus(); });
    els.sort = h('select', { class: 'sf-in', onchange: (e) => { S.sort = e.target.value; apply(); } },
      opts([['default', 'Default order'], ['new', 'Date: Newest first'], ['old', 'Date: Oldest first'], ['replies', 'Most replies']]));
    els.sort.value = S.sort;
    els.age = h('select', { class: 'sf-in', onchange: (e) => { S.age = e.target.value; apply(); } },
      opts([['any', 'Any time'], ['1', 'Last 24 hours'], ['7', 'Last 7 days'], ['14', 'Last 14 days'], ['30', 'Last 30 days'], ['older', 'Older than 30 days']]));
    els.age.value = S.age;
    els.people = h('div', { class: 'sf-list', 'data-empty': 'No authors match these filters' });
    els.pages = h('div', { class: 'sf-list', 'data-empty': 'No pages match these filters' });
    els.bps = h('div', { class: 'sf-list', 'data-empty': 'No breakpoints match these filters' });
    els.unread = h('input', { type: 'checkbox', class: 'sf-cb', checked: S.unread, onchange: (e) => { S.unread = e.target.checked; apply(); } });
    els.count = h('span', {});

    els.native = {};
    const nativeRows = NATIVE.map(([key, text]) => {
      const cb = h('input', { type: 'checkbox', class: 'sf-cb', onchange: () => toggleNative(key, cb) });
      const row = h('label', { class: 'sf-chk', hidden: '' }, cb, h('span', {}, text));
      els.native[key] = { cb, row };
      return row;
    });
    els.nativeNote = h('div', { class: 'sf-note', hidden: '' }, "Couldn't reach Webflow's comment settings.");

    const pop = h('div', { class: 'sf-pop' },
      h('div', { class: 'sf-head' }, lab('Search'), closeBtn),
      h('div', { class: 'sf-search' }, els.q, els.qClear),
      lab('Default filters'),
      h('div', { class: 'sf-list sf-fixed' },
        h('label', { class: 'sf-chk' }, els.unread, h('span', {}, 'Unread only')),
        ...nativeRows),
      els.nativeNote,
      lab('Sort'), els.sort,
      lab('Posted'), els.age,
      lab('Author'), els.people,
      lab('Page'), els.pages,
      lab('Breakpoint'), els.bps,
      h('div', { class: 'sf-foot' }, els.count, h('button', { type: 'button', onclick: reset }, 'Reset')),
      h('a', { class: 'sf-brand', href: BRAND_URL, target: '_blank', rel: 'noopener noreferrer' },
        h('img', { src: BRAND_ICON, alt: '' }), 'By Spiderflow')
    );

    // When an inner list hits its top/bottom, keep the same wheel gesture scrolling the popup.
    pop.addEventListener('wheel', (e) => {
      const list = e.target.closest?.('.sf-list');
      if (!list || !e.deltaY || e.ctrlKey) return;
      const atEnd = e.deltaY > 0
        ? list.scrollTop + list.clientHeight >= list.scrollHeight - 1
        : list.scrollTop <= 0;
      if (!atEnd) return;
      e.preventDefault();
      pop.scrollTop += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? pop.clientHeight : 1);
    }, { passive: false });
    return pop;
  }

  function insertButton(settings) {
    const b = settings.cloneNode(true);
    b.id = 'sf-btn';
    b.setAttribute('aria-label', 'Filter & sort comments');
    b.setAttribute('data-automation-id', 'sf-filter-btn');
    b.removeAttribute('aria-expanded');
    b.removeAttribute('aria-haspopup');
    const svg = $('svg', b);
    if (svg) {
      svg.setAttribute('data-wf-icon', 'SfFilter');
      svg.innerHTML = '<path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
    }
    b.append(h('span', { class: 'sf-dot', 'aria-hidden': 'true' }));
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!popover?.classList.contains('sf-open'));
    });
    settings.parentElement.insertBefore(b, settings);
  }

  /* ---------- Webflow's own filters (proxied through the "…" menu) ---------- */
  const optSel = (k) => A(`annotations-filter-option-${k}`);
  const menuItem = () => NATIVE.map(([k]) => $(optSel(k))).find(Boolean);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function waitFor(fn, ms = 800) {
    const t = Date.now(); let v;
    while (!(v = fn()) && Date.now() - t < ms) await sleep(16);
    return v;
  }
  function press(el) {
    const o = { bubbles: true, cancelable: true, composed: true, view: window, button: 0 };
    const p = { ...o, pointerId: 1, pointerType: 'mouse', isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', p));
    el.dispatchEvent(new MouseEvent('mousedown', o));
    el.dispatchEvent(new PointerEvent('pointerup', p));
    el.dispatchEvent(new MouseEvent('mouseup', o));
    el.dispatchEvent(new MouseEvent('click', o));
  }
  const readNative = () => {
    const out = {};
    NATIVE.forEach(([k]) => { const el = $(optSel(k)); out[k] = el ? el.getAttribute('aria-checked') === 'true' : undefined; });
    return out;
  };

  const mergeNative = (res) => {
    if (res) Object.entries(res).forEach(([k, v]) => { if (v !== undefined) nativeState[k] = v; });
  };
  // Match the popup to Webflow's own "…" menu surface
  function copyMenuBg() {
    const menu = $(A('annotations-filter-dropdown-menu'));
    const bg = menu && [menu, menu.firstElementChild].filter(Boolean)
      .map((el) => getComputedStyle(el).backgroundColor).find((c) => c && !/^rgba\(0, 0, 0, 0\)$|^transparent$/.test(c));
    if (!bg) return;
    menuBg = bg;
    popover?.style.setProperty('--sf-bg', bg);
  }

  // Opens Webflow's settings menu invisibly, runs fn, then closes it again. Calls are queued.
  function withMenu(fn) {
    const run = async () => {
      const btn = $(SETTINGS);
      if (!btn) return null;
      probing = true;
      document.documentElement.classList.add('sf-probing');
      try {
        const wasOpen = !!menuItem();
        if (!wasOpen) { press(btn); if (!(await waitFor(menuItem))) return null; }
        copyMenuBg();
        const out = await fn();
        if (!wasOpen && menuItem()) {
          press(btn);
          if (!(await waitFor(() => !menuItem(), 400))) {
            menuItem()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await waitFor(() => !menuItem(), 300);
          }
        }
        return out;
      } catch (err) {
        console.warn('[Spiderflow] Webflow settings menu:', err);
        return null;
      } finally {
        await sleep(50);
        document.documentElement.classList.remove('sf-probing');
        probing = false;
      }
    };
    return (queue = queue.then(run, run));
  }

  function renderNative(ok = true) {
    if (!els.native) return;
    NATIVE.forEach(([k]) => {
      const { cb, row } = els.native[k];
      const v = nativeState[k];
      row.hidden = v === undefined;
      if (v !== undefined) cb.checked = v;
    });
    els.nativeNote.hidden = ok;
  }

  async function refreshNative() {
    const res = await withMenu(async () => readNative());
    mergeNative(res);
    renderNative(!!res);
  }

  async function toggleNative(key, cb) {
    const want = cb.checked, row = els.native[key].row;
    cb.disabled = true; row.classList.add('sf-busy');
    const res = await withMenu(async () => {
      const item = $(optSel(key));
      if (!item) return null;
      const before = item.getAttribute('aria-checked') === 'true';
      if (before === want) return readNative();
      press(item);
      await waitFor(() => { const el = $(optSel(key)); return !el || (el.getAttribute('aria-checked') === 'true') !== before; }, 600);
      const now = readNative();
      if (now[key] === undefined) now[key] = !before; // menu closed itself after the click
      return now;
    });
    mergeNative(res);
    cb.disabled = false; row.classList.remove('sf-busy');
    renderNative(!!res);
  }

  function setOpen(open) {
    popover?.classList.toggle('sf-open', open);
    const btn = $('#sf-btn');
    btn?.classList.toggle('sf-open', open);
    btn?.setAttribute('aria-expanded', String(open));
    if (open) { syncTheme(); refreshNative(); }
  }

  function ensureUI() {
    const panel = $('#annotations-panel');
    if (!panel) { popover = null; return; }
    const settings = $(SETTINGS, panel);
    if (settings && !$('#sf-btn', panel)) insertButton(settings);
    if (!popover || !panel.contains(popover)) {
      popover = buildPopover();
      panel.appendChild(popover);
      if (menuBg) popover.style.setProperty('--sf-bg', menuBg);
    }
  }

  // Light text on the panel means Webflow's dark theme; anything else is the light theme
  function syncTheme() {
    const panel = $('#annotations-panel');
    const m = panel && getComputedStyle(panel).color.match(/[\d.]+/g);
    if (!m) return;
    const light = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 128;
    [popover, $('#sf-btn')].forEach((el) => el?.classList.toggle('sf-light', light));
  }

  function tick() { ensureUI(); syncTheme(); apply(); }

  /* ---------- lifecycle ---------- */
  const mo = new MutationObserver((muts) => {
    if (popover && muts.every((m) => popover.contains(m.target))) return;
    clearTimeout(timer);
    timer = setTimeout(tick, 150);
  });
  mo.observe(document.body, { childList: true, subtree: true });

  const onDoc = (e) => {
    if (probing) return;
    if (popover?.classList.contains('sf-open') && !popover.contains(e.target) && !e.target.closest('#sf-btn'))
      setOpen(false);
  };
  const onKey = (e) => { if (probing) return; if (e.key === 'Escape' && popover?.classList.contains('sf-open')) setOpen(false); };
  document.addEventListener('click', onDoc, true);
  document.addEventListener('keydown', onKey, true);

  window.__sfCommentFilter = {
    destroy() {
      mo.disconnect();
      clearTimeout(timer);
      document.removeEventListener('click', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
      touched.forEach((el) => {
        el.classList?.remove('sf-hide');
        el.style.order = ''; el.style.display = ''; el.style.flexDirection = '';
      });
      $('#sf-btn')?.remove();
      popover?.remove();
      style.remove();
      delete window.__sfCommentFilter;
    },
    refresh: tick,
  };

  tick();
  console.log('[Spiderflow] Comment filter loaded. Open the Comments panel and use the new button next to "…".');
})();
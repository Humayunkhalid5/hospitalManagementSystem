// DOM helpers, callback-based debounce, Promise-based delay
export const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') n.className = v;
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  n.append(...kids.filter((k) => k != null));
  return n;
};

export const debounce = (callback, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => callback(...args), ms); };
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function toast(message, type = 'success') {
  const t = el('div', { class: `alert alert-${type} shadow-sm py-2` }, message);
  document.getElementById('toasts').append(t);
  delay(3500).then(() => t.remove());
}

export const fmtDateTime = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
export const toLocalInput = (iso) => {
  const d = new Date(iso);
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

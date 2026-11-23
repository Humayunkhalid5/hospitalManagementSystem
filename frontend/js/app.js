import * as api from './api.js';
import { validateField } from './validators.js';
import { el, debounce, toast, fmtDateTime, toLocalInput } from './ui.js';

const name = (p) => (p ? `${p.firstName} ${p.lastName}` : '');
const person = [
  { name: 'firstName', label: 'First name', rules: ['required', 'min2'] },
  { name: 'lastName', label: 'Last name', rules: ['required', 'min2'] },
];

// One config object per resource drives its form, table and validation
const resources = {
  patients: {
    title: 'Patient',
    fields: [...person,
      { name: 'dateOfBirth', label: 'Date of birth', type: 'date', rules: ['required', 'past'] },
      { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'], rules: ['required'] },
      { name: 'phone', label: 'Phone', rules: ['required', 'phone'] },
      { name: 'email', label: 'Email (optional)', type: 'email', rules: ['email'] },
      { name: 'address', label: 'Address (optional)', rules: [] }],
    columns: [['Name', name], ['Born', (r) => r.dateOfBirth], ['Gender', (r) => r.gender], ['Phone', (r) => r.phone], ['Email', (r) => r.email ?? '']],
  },
  doctors: {
    title: 'Doctor',
    fields: [...person,
      { name: 'specialization', label: 'Specialization', rules: ['required', 'min2'] },
      { name: 'phone', label: 'Phone', rules: ['required', 'phone'] },
      { name: 'email', label: 'Email', type: 'email', rules: ['required', 'email'] }],
    columns: [['Name', name], ['Specialization', (r) => r.specialization], ['Phone', (r) => r.phone], ['Email', (r) => r.email]],
  },
  appointments: {
    title: 'Appointment',
    fields: [
      { name: 'patientId', label: 'Patient', type: 'select', from: 'patients', numeric: true, rules: ['required'] },
      { name: 'doctorId', label: 'Doctor', type: 'select', from: 'doctors', numeric: true, rules: ['required'] },
      { name: 'appointmentDate', label: 'Date and time', type: 'datetime-local', iso: true, rules: ['required', 'future'] },
      { name: 'reason', label: 'Reason', rules: ['required', 'min3'] },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'], rules: ['required'], default: 'scheduled' }],
    columns: [['Patient', (r) => name(r.patient)], ['Doctor', (r) => name(r.doctor)], ['When', (r) => fmtDateTime(r.appointmentDate)], ['Reason', (r) => r.reason], ['Status', (r) => r.status]],
  },
};

const state = { resource: 'patients', rows: [], lookups: { patients: [], doctors: [] }, editId: null, filter: '' };
const $ = (s) => document.querySelector(s);

const role = () => {
  try { return JSON.parse(atob(api.getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role; } catch { return null; }
};

function showApp(loggedIn) {
  $('#login-view').classList.toggle('d-none', loggedIn);
  $('#app-view').classList.toggle('d-none', !loggedIn);
  if (loggedIn) { $('#role-badge').textContent = role(); switchTab('patients'); }
}

async function switchTab(r) {
  state.resource = r; state.editId = null; state.filter = ''; $('#search').value = '';
  document.querySelectorAll('#tabs .nav-link').forEach((b) => b.classList.toggle('active', b.dataset.r === r));
  await load();
  renderForm();
}

async function load() {
  try {
    // Promise.all fetches the table rows and dropdown lookups in parallel
    const [rows, patients, doctors] = await Promise.all([api.list(state.resource), api.list('patients'), api.list('doctors')]);
    Object.assign(state, { rows, lookups: { patients, doctors } });
    renderTable();
  } catch (e) { handleError(e); }
}

function handleError(e) {
  if (/token|Unauthorized/i.test(e.message)) { api.setToken(null); showApp(false); }
  toast(e.message, 'danger');
}

function renderTable() {
  const cfg = resources[state.resource];
  const q = state.filter.toLowerCase();
  const rows = state.rows.filter((r) => cfg.columns.some(([, get]) => String(get(r)).toLowerCase().includes(q)));
  $('#thead').replaceChildren(el('tr', {}, ...cfg.columns.map(([h]) => el('th', {}, h)), el('th', {}, '')));
  $('#tbody').replaceChildren(...(rows.length
    ? rows.map((r) => el('tr', {},
        ...cfg.columns.map(([, get]) => el('td', {}, String(get(r)))),
        el('td', { class: 'text-nowrap text-end' },
          el('button', { class: 'btn btn-sm btn-outline-primary me-1', onclick: () => startEdit(r) }, 'Edit'),
          role() === 'admin' ? el('button', { class: 'btn btn-sm btn-outline-danger', onclick: () => del(r) }, 'Delete') : null)))
    : [el('tr', {}, el('td', { colspan: cfg.columns.length + 1, class: 'text-center text-muted py-4' }, `No ${state.resource} yet. Add one using the form.`))]));
}

function renderForm(row = null) {
  const cfg = resources[state.resource];
  $('#form-title').textContent = `${row ? 'Edit' : 'New'} ${cfg.title.toLowerCase()}`;
  $('#form-fields').replaceChildren(...cfg.fields.map((f) => {
    const val = row ? (f.iso ? toLocalInput(row[f.name]) : row[f.name] ?? '') : f.default ?? '';
    const opts = f.from ? state.lookups[f.from].map((o) => [o.id, name(o)]) : (f.options ?? []).map((o) => [o, o]);
    const input = f.type === 'select'
      ? el('select', { class: 'form-select', name: f.name }, el('option', { value: '' }, 'Select…'),
          ...opts.map(([v, t]) => el('option', { value: v, selected: String(v) === String(val) }, t)))
      : el('input', { class: 'form-control', name: f.name, type: f.type ?? 'text', value: val });
    // events: validate on blur, and re-check live once a field is flagged
    input.addEventListener('blur', () => validateInput(f, input));
    input.addEventListener('input', () => input.classList.contains('is-invalid') && validateInput(f, input));
    return el('div', { class: 'mb-2' }, el('label', { class: 'form-label' }, f.label), input, el('div', { class: 'invalid-feedback' }));
  }));
}

function validateInput(f, input) {
  const msg = validateField(input.value.trim(), f.rules);
  input.classList.toggle('is-invalid', !!msg);
  input.nextElementSibling.textContent = msg;
  return !msg;
}

function startEdit(row) { state.editId = row.id; renderForm(row); window.scrollTo({ top: 0, behavior: 'smooth' }); }

async function del(row) {
  if (!confirm(`Delete this ${resources[state.resource].title.toLowerCase()}?`)) return;
  try { await api.remove(state.resource, row.id); toast('Deleted'); await load(); } catch (e) { handleError(e); }
}

$('#entity-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cfg = resources[state.resource];
  const inputs = [...e.target.elements].filter((i) => i.name);
  const find = (f) => inputs.find((i) => i.name === f.name);
  const ok = cfg.fields.map((f) => validateInput(f, find(f))).every(Boolean); // map, not some(): show every error
  if (!ok) return toast('Fix the highlighted fields', 'warning');
  const body = {};
  for (const f of cfg.fields) {
    const v = find(f).value.trim();
    if (v === '' && !f.rules.includes('required')) continue; // omit empty optional fields
    body[f.name] = f.numeric ? Number(v) : f.iso ? new Date(v).toISOString() : v;
  }
  try {
    state.editId ? await api.update(state.resource, state.editId, body) : await api.create(state.resource, body);
    toast(state.editId ? 'Changes saved' : `${cfg.title} added`);
    state.editId = null; await load(); renderForm();
  } catch (err) { handleError(err); }
});

$('#cancel-btn').addEventListener('click', () => { state.editId = null; renderForm(); });
$('#tabs').addEventListener('click', (e) => e.target.dataset.r && switchTab(e.target.dataset.r));
$('#search').addEventListener('input', debounce((e) => { state.filter = e.target.value; renderTable(); }, 250));
$('#logout').addEventListener('click', () => { api.setToken(null); showApp(false); });

async function auth(action) {
  const email = $('#email').value.trim(), password = $('#password').value;
  if (validateField(email, ['required', 'email']) || password.length < 6) return toast('Enter a valid email and a password of 6+ characters', 'warning');
  try {
    if (action === 'register') { await api.register(email, password); toast('Account created. Signing in…'); }
    const { access_token } = await api.login(email, password);
    api.setToken(access_token); showApp(true);
  } catch (err) { toast(err.message, 'danger'); }
}
$('#login-form').addEventListener('submit', (e) => { e.preventDefault(); auth('login'); });
$('#register-btn').addEventListener('click', () => auth('register'));

showApp(!!api.getToken());

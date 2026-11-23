// Each rule returns true or an error message
export const rules = {
  required: (v) => (v !== '' && v != null) || 'This field is required',
  min2: (v) => v.length >= 2 || 'Enter at least 2 characters',
  min3: (v) => v.length >= 3 || 'Enter at least 3 characters',
  email: (v) => /^\S+@\S+\.\S+$/.test(v) || 'Enter a valid email address',
  phone: (v) => /^\+?[0-9\s-]{7,15}$/.test(v) || 'Enter a valid phone number',
  past: (v) => new Date(v) < new Date() || 'Date must be in the past',
  future: (v) => new Date(v) > new Date() || 'Choose a future date and time',
};

export const validateField = (value, names = []) => {
  if (value === '' && !names.includes('required')) return ''; // optional and empty
  for (const n of names) {
    const r = rules[n](value);
    if (r !== true) return r;
  }
  return '';
};

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const when = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_URL = `${API_BASE}/api`;
const ENV = import.meta.env.VITE_ENV;

export async function getPosition({ dateFrom, dateTo } = {}) {
  let today = new Date();

  if (ENV === 'development') {
    today = new Date('2026-02-15T00:00:00Z');
  }

  //console.log(today.getHours());
  if (today.getHours() < 4) {
    today.setDate(today.getDate() - 1);
    today.setHours(21);
  }
  else {
    today.setHours(0, 0, 0, 0);
  }
  //today.setTime(0); //1970

  if (!dateFrom) {dateFrom = today;}
  if (!dateTo) {dateTo = new Date();}

  const params = new URLSearchParams();
  params.append('dateFrom', dateFrom);
  params.append('dateTo', dateTo);
  // params.append('invalid', 0);

  const res = await fetch(`${API_URL}/position?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Error consultando backend');
  }
  return res.json();
}

export async function getCow(cowId) {
  const res = await fetch(`${API_URL}/cow/${cowId}`);
  if (!res.ok) {
    throw new Error('Error consultando backend');
  }
  return res.json();
}

export async function getAllCows() {
  const res = await fetch(`${API_URL}/cow`);
  if (!res.ok) {
    throw new Error('Error consultando backend');
  }
  return res.json();
}



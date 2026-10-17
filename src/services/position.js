import apiClient from './apiClient';

const endpoint = '/positions';

export async function getPosition({ dateFrom, dateTo } = {}) {
  const today = new Date();

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

  return apiClient(`${endpoint}?${params.toString()}`);
}



// Latest position of each active collar (backend default: last 72 h)
export function getLatestPositions({ maxAgeHours } = {}) {
  const params = new URLSearchParams();
  if (maxAgeHours) {
    params.append('maxAgeHours', maxAgeHours);
  }

  const query = params.toString();
  return apiClient(`${endpoint}/latest${query ? `?${query}` : ''}`);
}

// Position with collar, cow, battery, sleep state and signal
export function getPositionDetails(positionId) {
  return apiClient(`${endpoint}/${positionId}`);
}

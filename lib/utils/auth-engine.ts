export const SESSION_USER_KEY = 'fairway_giving_user';

export function getSessionUser() {
  if (typeof window === 'undefined') return null;
  const json = localStorage.getItem(SESSION_USER_KEY);
  return json ? JSON.parse(json) as unknown : null;
}

export function setSessionUser(user: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_USER_KEY);
}

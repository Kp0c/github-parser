import { writable } from 'svelte/store';

const KEY = 'github_access_token';

const storedAccessToken = localStorage.getItem(KEY) ?? '';
export const accessToken = writable<string>(storedAccessToken);

accessToken.subscribe((newToken) => {
  localStorage.setItem(KEY, newToken);
});
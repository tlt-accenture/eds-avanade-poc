import { loadBlock } from '../ak.js';

// Localized homepage only (/en-us, or /content/en-us in the local preview);
// on every other page this check is all that runs.
const HOME = /^(\/content)?\/[a-z]{2}-[a-z]{2}\/?$/;
export const DISMISSED = 'office-hours-dismissed';

export default function loadOfficeHours() {
  if (!HOME.test(window.location.pathname) || sessionStorage.getItem(DISMISSED)) return;
  const banner = document.createElement('aside');
  banner.className = 'office-hours';
  banner.hidden = true;
  document.body.append(banner);
  loadBlock(banner);
}

import { initLiquio } from './liquio/1.0.0/liquio.js';
let instance;
function mount() {
  const host = document.querySelector('#contato > [data-liquio]');
  if (host) instance = initLiquio(host);
}
mount();
window.addEventListener('pagehide', () => { instance?.destroy(); instance = undefined; });
window.addEventListener('pageshow', event => { if (event.persisted) mount(); });

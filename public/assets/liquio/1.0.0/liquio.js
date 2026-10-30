import { createCycle } from './liquio-cycle.js';

const mounted = new WeakMap();
/** Mount one decorative Liquio. Repeated initialization returns the same handle. */
export function initLiquio(host) {
  if (!host || host.nodeType !== 1) throw new TypeError('Liquio requires a host element');
  if (mounted.has(host)) return mounted.get(host);
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const cycle = createCycle();
  const root = doc.createElement('span');
  const sprite = doc.createElement('span');
  root.className = 'liquio';
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('role', 'presentation');
  sprite.className = 'liquio__sprite';
  sprite.dataset.liquioPose = 'idle';
  root.append(sprite);
  host.append(root);
  let timer = null, destroyed = false;
  const now = () => win.performance.now();
  const stop = () => { if (timer !== null) win.clearTimeout(timer); timer = null; };
  function draw(state) {
    sprite.dataset.liquioPose = state.pose;
    root.dataset.liquioState = state.active || 'idle';
  }
  function schedule() {
    if (destroyed || doc.hidden || motion.matches) return;
    const time = now();
    const state = cycle.tick(time);
    draw(state);
    timer = win.setTimeout(schedule, Math.max(16, state.nextAt - time));
  }
  function sync() {
    stop();
    cycle.reset(now());
    draw(cycle.snapshot());
    root.dataset.liquioPaused = String(doc.hidden || motion.matches);
    schedule();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true; stop();
    doc.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    root.remove(); mounted.delete(host);
  }
  doc.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  const handle = Object.freeze({ destroy });
  mounted.set(host, handle);
  sync();
  return handle;
}

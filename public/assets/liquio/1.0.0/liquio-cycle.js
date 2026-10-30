/** Pure clock-driven state machine. No browser, timer or user interaction. */
export const SPECIALS = Object.freeze(['look', 'tilt', 'ear', 'scarf', 'sleep']);
const sequence = (pose, duration) => [[pose, duration], ['idle', 120]];
export function framesFor(name, random = Math.random) {
  switch (name) {
    case 'blink': return sequence('blink', 140);
    case 'look': return sequence(random() < 0.5 ? 'look-left' : 'look-right', 900);
    case 'tilt': return sequence('tilt', 850);
    case 'ear': return [['ear', 180], ['idle', 130], ['ear', 160], ['idle', 120]];
    case 'scarf': return sequence('scarf', 650);
    case 'sleep': return [['blink', 240], ['sleep', 1450], ['blink', 180], ['idle', 180]];
    default: throw new RangeError('Unknown Liquio animation');
  }
}

export function createCycle(random = Math.random) {
  let blinkAt, specialAt, frameAt, frames = [], index = 0, last = null;
  let pose = 'idle', active = null;
  const between = (a, b) => a + random() * (b - a);
  function reset(now) {
    pose = 'idle'; active = null; frames = []; index = 0;
    blinkAt = now + between(2700, 3300);
    specialAt = now + between(10000, 15000);
    frameAt = Infinity;
  }
  function tick(now) {
    if (active) {
      if (now >= frameAt) {
        index++;
        if (index < frames.length) {
          pose = frames[index][0]; frameAt = now + frames[index][1];
        } else {
          active = null; pose = 'idle'; frameAt = Infinity;
          blinkAt = now + between(2700, 3300);
        }
      }
    } else if (now >= specialAt || now >= blinkAt) {
      if (now >= specialAt) {
        const choices = SPECIALS.filter(name => name !== last);
        active = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
        last = active;
        specialAt = now + between(10000, 15000);
      } else {
        // Do not begin a blink that would postpone an imminent special.
        if (specialAt - now < 260) { blinkAt = specialAt; return snapshot(); }
        active = 'blink';
      }
      frames = framesFor(active, random); index = 0;
      pose = frames[0][0]; frameAt = now + frames[0][1];
    }
    return snapshot();
  }
  function snapshot() {
    return { pose, active, nextAt: active ? frameAt : Math.min(blinkAt, specialAt), blinkAt, specialAt };
  }
  reset(0);
  return Object.freeze({ reset, tick, snapshot });
}

// Umbrales editables. Los tiempos evitan que un parpadeo bilateral dispare fuego.
export const GESTURES = { browEnter: .40, browExit: .25, browHold: 110,
  winkClosed: .65, winkOpen: .30, winkHold: 115, winkCooldown: 650, releaseHold: 90 };
export class FireGestures {
  constructor(config = GESTURES) { this.config = config; this.reset(); }
  reset() { this.smoke = false; this.browSince = null; this.candidate = null;
    this.since = 0; this.armed = false; this.releaseSince = null; this.lastFire = -Infinity; }
  update(scores, now) {
    if (!scores) { this.reset(); return {smoke:false, wink:null}; }
    const c = this.config, l = scores.eyeBlinkLeft || 0, r = scores.eyeBlinkRight || 0;
    const brow = ((scores.browDownLeft || 0) + (scores.browDownRight || 0))/2;
    if (brow >= c.browEnter) {
      this.browSince ??= now; if (now-this.browSince >= c.browHold) this.smoke = true;
    } else if (brow <= c.browExit) { this.smoke = false; this.browSince = null; }
    else if (!this.smoke) this.browSince = null;
    let wink = null;
    if (l < c.winkOpen && r < c.winkOpen) {
      this.releaseSince ??= now; if (now-this.releaseSince >= c.releaseHold) this.armed = true;
    } else this.releaseSince = null;
    const side = l >= c.winkClosed && r <= c.winkOpen ? 'left' : r >= c.winkClosed && l <= c.winkOpen ? 'right' : null;
    if (side !== this.candidate) { this.candidate = side; this.since = now; }
    if (side && this.armed && now-this.since >= c.winkHold && now-this.lastFire >= c.winkCooldown) {
      wink = side; this.armed = false; this.lastFire = now;
    }
    return {smoke:this.smoke,wink};
  }
}

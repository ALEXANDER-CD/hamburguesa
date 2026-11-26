import { FireGestures } from './fire_gestures.js';
const rand=(a,b)=>a+Math.random()*(b-a);
// Audio sintetizado: ráfaga y pequeños crepitares, sin archivos MP3 obligatorios.
export class FireAudio {
  constructor(){ this.ctx=null; this.enabled=true; this.buffer=null; this.sources=new Set(); }
  async unlock(){ try { const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return; this.ctx ||= new AC(); await this.ctx.resume(); } catch(e){ console.warn('Audio:',e); } }
  play(){ const c=this.ctx; if(!this.enabled||!c||c.state!=='running')return;
    if(!this.buffer){ const b=c.createBuffer(1,Math.ceil(c.sampleRate*.65),c.sampleRate), a=b.getChannelData(0); let low=0;
      for(let i=0;i<a.length;i++){ const n=Math.random()*2-1; low=.86*low+.14*n; a[i]=low*.8+n*.12+(Math.random()<.003?n*.8:0); } this.buffer=b; }
    const src=c.createBufferSource(), filter=c.createBiquadFilter(), gain=c.createGain(), t=c.currentTime;
    src.buffer=this.buffer; filter.type='lowpass'; filter.frequency.setValueAtTime(2100,t); filter.frequency.exponentialRampToValueAtTime(350,t+.6);
    gain.gain.setValueAtTime(.001,t); gain.gain.linearRampToValueAtTime(.48,t+.045); gain.gain.exponentialRampToValueAtTime(.001,t+.63);
    src.connect(filter).connect(gain).connect(c.destination); this.sources.add(src); src.onended=()=>{ this.sources.delete(src); src.disconnect(); filter.disconnect(); gain.disconnect(); }; src.start(); }
  stop(){ for(const s of this.sources){try{s.stop();}catch{}} this.sources.clear(); }
}
// Complemento: no solicita cámara, no crea otro rastreador, no modifica la máscara.
export function createFireEffects(container, video, {audio, onStatus=()=>{}}={}) {
  const canvas=document.createElement('canvas');
  canvas.className='fire-effects'; canvas.setAttribute('aria-hidden','true');
  container.appendChild(canvas);
  const ctx=canvas.getContext('2d'), gestures=new FireGestures();
  let last=0,w=0,h=0,dpr=1,emission=0,status='',particles=[];
  const setStatus=s=>{if(s!==status){status=s;onStatus(s);}};
  const resize=()=>{const r=container.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2); if(r.width!==w||r.height!==h||d!==dpr){w=r.width;h=r.height;dpr=d;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);particles=[];}};
  // Coordenadas de cámara espejada y recorte object-fit:cover idéntico al vídeo.
  function project(p){const scale=Math.max(w/video.videoWidth,h/video.videoHeight), vw=video.videoWidth*scale,vh=video.videoHeight*scale;
    return {x:w-(p.x*vw+(w-vw)/2),y:p.y*vh+(h-vh)/2};}
  function anchors(l){const a=project(l[234]),b=project(l[454]), nose=project(l[1]), width=Math.max(25,Math.hypot(a.x-b.x,a.y-b.y));
    const ear=p=>{const dx=p.x-nose.x,dy=p.y-nose.y,len=Math.hypot(dx,dy)||1;return {x:p.x+dx/len*width*.10,y:p.y+dy/len*width*.10,dir:Math.sign(dx)||1};};
    const eye=(i,j)=>{const p=project(l[i]),q=project(l[j]);return {x:(p.x+q.x)/2,y:(p.y+q.y)/2,dir:Math.sign((p.x+q.x)/2-nose.x)||1};};
    return {ears:[ear(a),ear(b)],left:eye(362,263),right:eye(33,133),width}; }
  function addSmoke(a,size){particles.push({kind:'smoke',x:a.x,y:a.y,vx:a.dir*rand(.2,.52)*size,vy:-rand(.23,.58)*size,r:rand(.045,.083)*size,age:0,life:rand(.85,1.5),spin:rand(-2,2)});}
  function fire(a,size){ for(let i=0;i<9;i++){const angle=rand(-Math.PI*.95,-Math.PI*.05), speed=rand(.27,.8)*size;
      particles.push({kind:'fire',x:a.x,y:a.y,vx:Math.cos(angle)*speed+a.dir*size*.16,vy:Math.sin(angle)*speed,r:rand(.07,.14)*size,age:0,life:rand(.48,.92),spin:rand(-2.5,2.5),rot:rand(-.3,.3)}); }
    for(let i=0;i<12;i++)particles.push({kind:'spark',x:a.x,y:a.y,vx:rand(-.7,.7)*size,vy:-rand(.2,.9)*size,r:rand(.008,.018)*size,age:0,life:rand(.25,.65)}); audio?.play(); }
  function render(dt){ctx.clearRect(0,0,w,h);particles=particles.filter(p=>p.age<p.life); for(const p of particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const t=Math.min(1,p.age/p.life),fade=Math.min(1,t*8)*(1-t);ctx.save();ctx.translate(p.x,p.y);
      if(p.kind==='smoke'){const r=p.r*(1+2.1*t);ctx.globalAlpha=fade*.65; const g=ctx.createRadialGradient(-r*.18,-r*.2,r*.05,0,0,r);g.addColorStop(0,'#e5e0db');g.addColorStop(.35,'#aca7a4');g.addColorStop(.7,'rgba(110,107,105,.45)');g.addColorStop(1,'rgba(90,90,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();p.vx*=Math.pow(.63,dt);p.vy-=12*dt;}
      else if(p.kind==='fire'){ctx.globalAlpha=fade;ctx.rotate(p.rot+p.spin*p.age);ctx.font=`${p.r*(1+.25*Math.sin(t*6))}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔥',0,0);}
      else {ctx.globalAlpha=fade;ctx.fillStyle='#ffce69';ctx.shadowColor='#ff721c';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}ctx.restore();}}
  function update(face, now=performance.now()) {
    if (!video.videoWidth || !video.videoHeight) return;
    resize();
    const dt=Math.min(.05,(now-(last||now))/1000); last=now;
    const detected=face.detected && face.landmarks?.length>=468;
    const event=gestures.update(detected?face.blendshapes:null,now);
    if (!detected) { particles=[]; emission=0; setStatus('Coloca tu rostro dentro de la cámara'); render(dt); return; }
    const a=anchors(face.landmarks);
    if(event.wink) fire(a[event.wink],a.width);
    if(event.smoke){ emission+=dt*20; while(emission>=1){for(const e of a.ears)addSmoke(e,a.width);emission--;} }else emission=0;
    setStatus(event.smoke?'¡Estás que ardes!':'Frunce el ceño o guiña un ojo');
    if(particles.length>180) particles.splice(0,particles.length-180);
    render(dt);
  }
  function stop(){audio?.stop();canvas.remove();particles=[];}
  return {update,stop};
}

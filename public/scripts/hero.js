/* Plain JS, no bundler. Hero copy stays ordinary HTML for easy editing.
   ?static=1 skips motion and keeps the original SVG for Figma import.
   The loader is an intentional intro sequence, not fake network progress. */
(() => {
// Add approved URLs here when the destination pages are ready.
const CTA_LINKS = { call: '', case: '' };
// Fix the ripple origin where the pointer enters each CTA.
document.querySelectorAll('.cta').forEach(button=>{
 button.addEventListener('pointerenter',event=>{
  const box=button.getBoundingClientRect();
  const x=event.clientX-box.left,y=event.clientY-box.top;
  const radius=Math.hypot(Math.max(x,box.width-x),Math.max(y,box.height-y));
  button.style.setProperty('--cta-x',x+'px');
  button.style.setProperty('--cta-y',y+'px');
  button.style.setProperty('--cta-diameter',(radius*2+4)+'px');
 });
 button.addEventListener('focus',()=>{
  if(button.matches(':focus-visible')){
   button.style.setProperty('--cta-x','50%');
   button.style.setProperty('--cta-y','50%');
   button.style.setProperty('--cta-diameter',Math.hypot(button.offsetWidth,button.offsetHeight)+4+'px');
  }
 });
});

const dialog = document.querySelector('#cta-dialog');
document.querySelectorAll('[data-cta]').forEach(button => button.addEventListener('click', () => {
 const kind = button.dataset.cta;
 if(CTA_LINKS[kind]) { location.href = CTA_LINKS[kind]; return; }
 document.querySelector('#cta-title').textContent = kind === 'call' ? 'Book a Call' : 'View Case Study';
 document.querySelector('#cta-description').textContent = kind === 'call'
  ? 'Schedule a 1:1 strategy session with our automation experts. The booking destination has not been connected to this design preview.'
  : 'See how we achieved 90% autonomous dispatching. The case-study destination has not been connected to this design preview.';
 dialog.showModal();
}));
const menuButton = document.querySelector('#menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelector('a[href]').addEventListener('click',closeMenu);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.header'))closeMenu();});
const staticMode = new URLSearchParams(location.search).has('static');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#logo-canvas'), ctx = canvas.getContext('2d');
const stage = document.querySelector('#logo-stage'), hero = document.querySelector('#hero');
hero.appendChild(canvas);
const loader = document.querySelector('#loader');
let loaderTilesRenderer=null;
const motion = { formation: 0, opacity: 1 };
let points = [], frame = 0, timeline, active = true;
const mouse = { x: -9999, y: -9999 }, view = { width: 0, height: 0 };
const paletteStyle=getComputedStyle(document.documentElement);
const palette={
 accent: (paletteStyle.getPropertyValue('--accent-primary') || '').trim() || '#E64749',
 muted: (paletteStyle.getPropertyValue('--color-2') || '').trim() || '#606372',
 secondary: (paletteStyle.getPropertyValue('--color-4') || '').trim() || '#8A909F',
 light: (paletteStyle.getPropertyValue('--color-5') || '').trim() || '#A8AEBC',
 white: (paletteStyle.getPropertyValue('--color-6') || '').trim() || '#FFFFFF'
};
const lightRgb=(palette.light.match(/\w\w/g)||['A8','AE','BC']).map(channel=>parseInt(channel,16));
const accentRgb=(palette.accent.match(/\w\w/g)||['E6','47','49']).map(channel=>parseInt(channel,16));
const droplets=[];
let lastDroplet=null;
function addDroplet(x,y){
 const now=performance.now();
 if(lastDroplet && Math.hypot(x-lastDroplet.x,y-lastDroplet.y)<9 && now-lastDroplet.time<45)return;
 lastDroplet={x,y,time:now};droplets.push(lastDroplet);
 if(droplets.length>24)droplets.shift();
}
function dropletStrength(x,y,now){
 let strength=0;
 for(const drop of droplets){
  const age=(now-drop.time)/950;
  if(age<0||age>1)continue;
  const distance=Math.hypot(x-drop.x,y-drop.y),radius=age*155;
  // The front starts at the pointer and carries the color outwards.
  const band=Math.exp(-Math.pow((distance-radius)/18,2));
  const core=Math.exp(-Math.pow(distance/24,2))*Math.exp(-age*9);
  strength=Math.max(strength,Math.max(band,core)*Math.pow(1-age,1.5));
 }
 return strength;
}
const path = new Path2D(document.querySelector('.logo-vector path').getAttribute('d'));
function buildLogo() {
 const box=stage.getBoundingClientRect(),bounds=hero.getBoundingClientRect();
 if(box.width === 0 || bounds.width === 0) {
  requestAnimationFrame(buildLogo);
  return;
 }
 const dpr=Math.min(devicePixelRatio||1,2);
 view.width=bounds.width;view.height=bounds.height;
 canvas.width=Math.round(view.width*dpr);canvas.height=Math.round(view.height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const mask=document.createElement('canvas');mask.width=310;mask.height=292;
 const m=mask.getContext('2d');m.translate(-2,-26);m.fill(path);
 const pixels=m.getImageData(0,0,310,292).data;points=[];
 const sample=(x,y)=>x<0||y<0||x>=310||y>=292?0:pixels[(y*310+x)*4+3];
 const depthMin = parseFloat(paletteStyle.getPropertyValue('--logo-depth-min')) || 7;
 const depthMax = parseFloat(paletteStyle.getPropertyValue('--logo-depth-max')) || 15;
 const depthRatio = parseFloat(paletteStyle.getPropertyValue('--logo-depth-ratio')) || 0.022;
 view.depth=Math.max(depthMin,Math.min(depthMax,box.width*depthRatio));
 const step=innerWidth<600?3:2,W=view.width,H=view.height;
 for(let y=0;y<292;y+=step)for(let x=0;x<310;x+=step){
  if(pixels[(y*310+x)*4+3]<=100)continue;
  const bx=box.left-bounds.left+x/310*box.width,by=box.top-bounds.top+y/292*box.height;
  // Uneven entry bands spread across all four screen edges, with a prevailing left-to-right wind.
  const edge=Math.random(),padding=12+Math.random()*80;
  let sx,sy;
  if(edge<.55){sx=-padding;sy=Math.random()*H;}
  else if(edge<.73){sx=Math.random()*W;sy=-padding;}
  else if(edge<.9){sx=Math.random()*W;sy=H+padding;}
  else{sx=W+padding;sy=Math.random()*H;}
  const direction=sx>W?-1:1,phase=Math.random()*Math.PI*2;
  const bend=Math.sin((sy/H)*Math.PI*2)*H*.13;
  points.push({bx,by,sx,sy,x:motion.formation===1?bx:sx,y:motion.formation===1?by:sy,vx:0,vy:0,
   c1x:sx+direction*W*(.24+Math.random()*.12),c1y:sy+bend+(Math.random()-.5)*H*.12,
   c2x:bx+(Math.random()-.5)*W*.035,c2y:by+bend*.25+(Math.random()-.5)*H*.06,
   delay:Math.random()*.24,phase,flutter:8+Math.random()*22,
   highlight:sample(x-3,y)<100||sample(x,y-3)<100,
   shadow:sample(x+3,y)<100||sample(x,y+3)<100,
   color:[palette.white,palette.light,palette.accent,palette.secondary][Math.floor(Math.random()*4)],alpha:.35+Math.random()*.55});
 }
 document.documentElement.classList.add('canvas-ready');
}
let lastWindTime=0;
function draw(time=performance.now()) {
 if(!active)return;
 const dt=Math.min((time-lastWindTime)/16.667||1,2);lastWindTime=time;
 ctx.clearRect(0,0,view.width,view.height);
 const depthProgress=Math.max(0,Math.min(1,(motion.formation-.55)/.45));
 const depth=(view.depth||10)*depthProgress;
 // Draw the thickness behind the entire front face, so it reads as one raised mark.
 if(depthProgress>0){
  const sideOpacity=parseFloat(paletteStyle.getPropertyValue('--logo-side-opacity')) || 0.4;
  for(let layer=3;layer>=1;layer--){
   const offset=depth*layer/3;
   for(const p of points){
    ctx.globalAlpha=p.alpha*motion.opacity*sideOpacity*depthProgress;
    ctx.fillStyle=layer===1?palette.secondary:palette.muted;
    ctx.fillRect(p.x+offset*.65,p.y+offset,1.6,1.6);
   }
  }
 }
 const rect=hero.getBoundingClientRect(),mx=mouse.x-rect.left,my=mouse.y-rect.top;
 for(const p of points){
  const previousX=p.x,previousY=p.y;
  if(motion.formation<1){
   const t=Math.max(0,Math.min(1,(motion.formation-p.delay)/(1-p.delay)));
   const u=1-t,envelope=Math.sin(Math.PI*t)*u;
   // Curved advection and small eddies fade as each particle finds its place.
   p.x=u*u*u*p.sx+3*u*u*t*p.c1x+3*u*t*t*p.c2x+t*t*t*p.bx
    +Math.sin(time*.0018+p.phase+t*9)*p.flutter*envelope;
   p.y=u*u*u*p.sy+3*u*u*t*p.c1y+3*u*t*t*p.c2y+t*t*t*p.by
    +Math.sin(time*.0024+p.phase+t*12)*p.flutter*envelope;
   p.vx=p.vy=0;
  }else{
   // Distort locally around the pointer, then spring back to fixed logo coordinates.
   const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy),radius=Math.min(125,view.width*.16);
   if(dist<radius){
    const force=Math.pow(1-dist/radius,2)*3.8*dt;
    p.vx+=(dx/(dist||1))*force;p.vy+=(dy/(dist||1))*force;
   }
   p.vx+=(p.bx-p.x)*.025*dt;p.vy+=(p.by-p.y)*.025*dt;
   p.vx*=Math.pow(.83,dt);p.vy*=Math.pow(.83,dt);
   p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  const speed=Math.hypot(p.x-previousX,p.y-previousY);
  if(motion.formation>0&&motion.formation<.94&&speed>.4){
   const length=Math.min(speed,9),ratio=length/(speed||1);
   ctx.globalAlpha=p.alpha*motion.opacity*.24;ctx.strokeStyle=p.color;ctx.lineWidth=.65;
   ctx.beginPath();ctx.moveTo(p.x-(p.x-previousX)*ratio,p.y-(p.y-previousY)*ratio);ctx.lineTo(p.x,p.y);ctx.stroke();
  }
  ctx.globalAlpha=p.alpha*motion.opacity;ctx.fillStyle=p.color;
  const size=innerWidth<600?1.25:1.45;ctx.fillRect(p.x,p.y,size,size);
  if(depthProgress>0&&(p.highlight||p.shadow)){
   ctx.globalAlpha=p.alpha*motion.opacity*depthProgress*(p.highlight?.55:.28);
   ctx.fillStyle=p.highlight?palette.white:palette.muted;
   ctx.fillRect(p.x-.25,p.y-.35,size+.25,size+.25);
  }
 }
 ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
}
function finalState(){
 if(timeline)timeline.kill();
 if(window.gsap){gsap.set(['.word','.header','.meta','.hero-bottom'],{autoAlpha:1,y:0,yPercent:0});}
 else document.querySelectorAll('.word,.header,.meta,.hero-bottom').forEach(el=>{el.style.visibility='visible';el.style.opacity=1;el.style.transform='none';});
 if(!points.length) buildLogo();
 motion.formation=1;motion.opacity=.7;for(const p of points){p.x=p.bx;p.y=p.by;p.vx=p.vy=0;}
 if(!frame) frame=requestAnimationFrame(draw);
 loader.style.display='none';
}
function intro(){
 if(staticMode||reduced||!window.gsap){finalState();return;}
 if(timeline)timeline.kill();
 loader.style.display='flex';
 startLoaderTiles();
 gsap.set(loader,{autoAlpha:1});gsap.set(['.word','.header','.meta','.hero-bottom'],{autoAlpha:0});
 gsap.set('.word',{yPercent:110});gsap.set('.loading-bar',{width:'0%'});
 // Reset every particle so replay also assembles the mark from a scattered cloud.
 for(const p of points){p.x=p.sx;p.y=p.sy;p.vx=0;p.vy=0;}
 motion.formation=0;motion.opacity=1;
 document.querySelector('#loading-label').textContent='PLEASE STAND BY';
 const count={n:0};
 timeline=gsap.timeline().timeScale(1.35);
 timeline.to(count,{n:100,duration:2.2,ease:'power1.inOut',onUpdate:()=>document.querySelector('#count').textContent=String(Math.round(count.n)).padStart(2,'0')},0)
 .to('.loading-bar',{width:'100%',duration:2.2,ease:'power1.inOut'},0)
 .call(()=>document.querySelector('#loading-label').textContent='CREATING THE SCENE',[],.85)
 .call(()=>document.querySelector('#loading-label').textContent='SYSTEM READY',[],1.85)
 .to(loader,{autoAlpha:0,duration:.65,ease:'power2.inOut'},2.35)
 .set(loader,{display:'none'})
 .to(motion,{formation:1,duration:3.2,ease:'none'},2.95)
 .to(['.header','.meta'],{autoAlpha:1,duration:.6,stagger:.15},3.8)
 .to('.word',{autoAlpha:1,yPercent:0,duration:1.15,stagger:.16,ease:'power4.out'},4.15)
 .to(motion,{opacity:.7,duration:.8},5.45)
 .to('.hero-bottom',{autoAlpha:1,duration:.8},4.95);
}
// Loading-only tiles; no changes to the hero's dots or particle logo.
function startLoaderTiles(){
 if(!loaderTilesRenderer){
  const surface=document.createElement('canvas');
  surface.setAttribute('aria-hidden','true');
  document.querySelector('.loader-grid').appendChild(surface);
  const brush=surface.getContext('2d');
  const token=name=>parseFloat(paletteStyle.getPropertyValue(name)) || 18;
  const tw=token('--loader-tile-width'),th=token('--loader-tile-height');
  const strideX=tw+(parseFloat(paletteStyle.getPropertyValue('--loader-tile-gap-x')) || 6);
  const strideY=th+(parseFloat(paletteStyle.getPropertyValue('--loader-tile-gap-y')) || 6);
  const hoverRadius=parseFloat(paletteStyle.getPropertyValue('--loader-hover-radius')) || 110;
  const rgb=hex=>hex.match(/\w\w/g).map(part=>parseInt(part,16));
  const grey=rgb(palette.muted),coral=rgb(palette.accent),white=rgb(palette.white);
  const mix=(a,b,t)=>'rgb('+a.map((value,i)=>Math.round(value+(b[i]-value)*t)).join(',')+')';
  let width=0,height=0,tiles=[],animation=0,start=0,last=0;
  const cursor={x:-9999,y:-9999};
  function resize(){
   const bounds=loader.getBoundingClientRect();width=bounds.width;height=bounds.height;
   const dpr=Math.min(devicePixelRatio||1,2);
   surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);
   brush.setTransform(dpr,0,0,dpr,0,0);
   tiles=[];
   const cols=Math.ceil(width/strideX)+1,rows=Math.ceil(height/strideY)+1;
   for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
     tiles.push({x:c*strideX,y:r*strideY,pulseStart:0,pulseDuration:1,pulseStrength:0,nextChange:Math.random()*1.5,shine:0});
    }
   }
  }
  function paint(now){
   if(loader.style.display==='none'||document.hidden)return;
   const elapsed=(now-start)/1000,dt=Math.min(now-last||16,50);last=now;
   brush.clearRect(0,0,width,height);
   for(const tile of tiles){
    // Each loading dot flashes independently, with a smooth color fade.
    if(elapsed>=tile.nextChange){
     tile.pulseStart=elapsed;tile.pulseDuration=.45+Math.random()*.75;
     tile.pulseStrength=.35+Math.random()*.65;
     tile.nextChange=elapsed+tile.pulseDuration+.15+Math.random()*1.8;
    }
    const pulseProgress=Math.max(0,Math.min(1,(elapsed-tile.pulseStart)/tile.pulseDuration));
    const colorChange=Math.pow(Math.sin(Math.PI*pulseProgress),2)*tile.pulseStrength;
    const distance=Math.hypot(tile.x+tw/2-cursor.x,tile.y+th/2-cursor.y);
    const near=Math.pow(Math.max(0,1-distance/hoverRadius),2);
    tile.shine+=(near-tile.shine)*(1-Math.exp(-dt/80));
    brush.shadowBlur=tile.shine> .02?tile.shine*13:0;brush.shadowColor=palette.light;
    brush.fillStyle=tile.shine>.02?mix(grey,white,tile.shine*.85):mix(grey,coral,colorChange);
    brush.globalAlpha=.3+colorChange*.25+tile.shine*.4;
    brush.beginPath();
    brush.arc(tile.x+tw/2,tile.y+th/2,1+tile.shine*.65,0,Math.PI*2);
    brush.fill();
   }
   brush.shadowBlur=0;brush.globalAlpha=1;animation=requestAnimationFrame(paint);
  }
  const observer=new ResizeObserver(()=>{if(loader.style.display!=='none')resize();});observer.observe(loader);
  loaderTilesRenderer={start(){cancelAnimationFrame(animation);resize();cursor.x=cursor.y=-9999;start=performance.now();last=start;animation=requestAnimationFrame(paint);}};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&loader.style.display!=='none')loaderTilesRenderer.start();});
 }
 loaderTilesRenderer.start();
}
hero.addEventListener('pointermove',e=>{
 mouse.x=e.clientX;mouse.y=e.clientY;
 const bounds=hero.getBoundingClientRect();
 if(e.pointerType!=='touch')addDroplet(e.clientX-bounds.left,e.clientY-bounds.top);
 hero.style.setProperty('--cursor-x',(e.clientX-bounds.left)+'px');
 hero.style.setProperty('--cursor-y',(e.clientY-bounds.top)+'px');
 hero.style.setProperty('--cursor-glow','1');
});
hero.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-9999;lastDroplet=null;hero.style.setProperty('--cursor-glow','0');});
document.querySelector('#skip').addEventListener('click',finalState);
document.querySelector('#replay').addEventListener('click',intro);

buildLogo();
if(!frame) frame=requestAnimationFrame(draw);
let resizeTimer;
addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(buildLogo,150);});
document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}else cancelAnimationFrame(frame);});

intro();

// Ambient dots have their own canvas; the mark keeps its existing animation.
const ambient=document.createElement('canvas');
ambient.style.cssText='display:block;width:100%;height:100%';
document.querySelector('#particles').appendChild(ambient);
const pen=ambient.getContext('2d');
let width=0,height=0,ambientFrame=0,lastTime=0;
const dots=Array.from({length:65},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.000012,vy:(Math.random()-.5)*.000012,r:.5+Math.random()*.9,alpha:.08+Math.random()*.27,glow:0}));
function sizeAmbient(){
 const bounds=hero.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
 width=bounds.width;height=bounds.height;
 ambient.width=Math.round(width*dpr);ambient.height=Math.round(height*dpr);
 pen.setTransform(dpr,0,0,dpr,0,0);
}
function paintAmbient(time){
 const dt=Math.min(time-lastTime||16,40);lastTime=time;
 const bounds=hero.getBoundingClientRect(),mx=mouse.x-bounds.left,my=mouse.y-bounds.top;
 pen.clearRect(0,0,width,height);
 while(droplets.length && time-droplets[0].time>950)droplets.shift();
 // Light the existing 22px grid only where a droplet reaches it.
 if(droplets.length){
  let minX=width,minY=height,maxX=0,maxY=0;
  for(const drop of droplets){
   const radius=((time-drop.time)/950)*155;
   minX=Math.min(minX,drop.x-radius-24);minY=Math.min(minY,drop.y-radius-24);
   maxX=Math.max(maxX,drop.x+radius+24);maxY=Math.max(maxY,drop.y+radius+24);
  }
  minX=Math.max(0,Math.floor(minX/22)*22);minY=Math.max(0,Math.floor(minY/22)*22);
  maxX=Math.min(width,Math.ceil(maxX/22)*22);maxY=Math.min(height,Math.ceil(maxY/22)*22);
  for(let x=minX;x<=maxX;x+=22){
   for(let y=minY;y<=maxY;y+=22){
    const strength=dropletStrength(x,y,time);
    if(strength<.015)continue;
    pen.globalAlpha=strength*.85;pen.shadowBlur=4+strength*9;
    pen.shadowColor=palette.accent;pen.fillStyle=palette.accent;
    pen.beginPath();pen.arc(x,y,.65+strength*.65,0,Math.PI*2);pen.fill();
   }
  }
 }
 for(const dot of dots){
  dot.x=(dot.x+dot.vx*dt+1)%1;dot.y=(dot.y+dot.vy*dt+1)%1;
  const x=dot.x*width,y=dot.y*height;
  const near=dropletStrength(x,y,time);
  dot.glow+=(near-dot.glow)*(1-Math.exp(-dt/35));
  pen.shadowBlur=dot.glow*14;pen.shadowColor=palette.accent;
  pen.globalAlpha=Math.min(1,dot.alpha+dot.glow*.8);
  pen.fillStyle='rgb('+lightRgb.map((channel,index)=>Math.round(channel+(accentRgb[index]-channel)*dot.glow)).join(',')+')';pen.beginPath();pen.arc(x,y,dot.r+dot.glow*.65,0,Math.PI*2);pen.fill();
 }
 pen.shadowBlur=0;pen.globalAlpha=1;
 ambientFrame=requestAnimationFrame(paintAmbient);
}
sizeAmbient();ambientFrame=requestAnimationFrame(paintAmbient);
const observer=new ResizeObserver(sizeAmbient);observer.observe(hero);
document.addEventListener('visibilitychange',()=>{
 cancelAnimationFrame(ambientFrame);
 if(!document.hidden){lastTime=0;ambientFrame=requestAnimationFrame(paintAmbient);}
});

})();
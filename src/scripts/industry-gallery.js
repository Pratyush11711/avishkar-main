(() => {
 const section=document.querySelector('.industry-gallery'),orbit=section.querySelector('.industry-orbit'),cards=Array.from(orbit.querySelectorAll('button')),categories=Array.from(section.querySelectorAll('.industry-category'));
 const content=[{"title":"ATM Network Dispatch","text":"15,000 ATMs live in production across multiple paid ATM network providers in India. When an alert fires, AI triages it, identifies the right engineer, dispatches automatically, tracks resolution, and closes the ticket."},{"title":"Telecom Tower Dispatch","text":"68,000 Telecom towers live with a top-tier Indian tower company. Downtime is invisible until it's catastrophic. Stop relying on human agents doing reactive, repetitive, low-value work."},{"title":"HVAC Monitoring","text":"HVAC fails and no one knows until it's too late. FSM Dispatch is an AI-native dispatch platform for critical infrastructure built to automatically assign the right engineer."},{"title":"Medical Equipment","text":"Medical equipment stops and no one knows until it's too late. Guarantee performance with an outcome-based per-asset per-month subscription."}];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const state={angle:0,assemble:reduced.matches?1:0,opacity:reduced.matches?1:0};
 const step=Math.PI*2/cards.length;
 let width=0,frame=0,last=0,visible=false,hover=false,cardFocused=false,playing=!reduced.matches,drag=null,settling=false,active=-1,started=false;
 const playButton=section.querySelector('.industry-play');
 function wrap(value,n){return((value%n)+n)%n;}
 function detail(index){
  index=wrap(index,4);if(active===index)return;active=index;
  section.querySelector('.industry-detail h3').textContent=content[index].title;
  section.querySelector('.industry-detail p').textContent=content[index].text;
  categories.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 }
 function render(){
  const radius=Math.min(width*.36,500),depth=radius*.53;
  const expansion=1+(1-state.assemble)*.9;
  cards.forEach((card,i)=>{
   const angle=i*step+state.angle,front=Math.cos(angle);
   const x=Math.sin(angle)*radius*expansion,z=front*depth,y=z*Math.sin(16*Math.PI/180);
   card.style.transform='translate(-50%,-50%) translate3d('+x+'px,'+y+'px,'+z+'px)';
   card.style.opacity=String((.5+(front+1)*.25)*state.opacity);
   card.style.zIndex=String(Math.round((front+1)*100));
  });
  detail(wrap(Math.round(-state.angle/step),cards.length)%4);
 }
 function loop(time){
  frame=0;if(!visible||document.hidden)return;
  const dt=Math.min((time-last)/1000||0,0.05);last=time;
  if(playing&&!reduced.matches&&!hover&&!cardFocused&&!drag&&!settling)state.angle-=dt*.12;
  render();frame=requestAnimationFrame(loop);
 }
 function resize(){width=orbit.clientWidth;render();}
 function focusIndex(index){
  const current=-state.angle/step,nearest=index+Math.round((current-index)/cards.length)*cards.length;
  settling=true;
  if(window.gsap&&!reduced.matches)gsap.to(state,{angle:-nearest*step,duration:1.15,ease:'power3.out',overwrite:'auto',onUpdate:render,onComplete:()=>{settling=false;}});
  else{state.angle=-nearest*step;settling=false;render();}
 }
 categories.forEach((button,index)=>button.addEventListener('click',()=>{
  const current=-state.angle/step;focusIndex(index+Math.round((current-index)/4)*4);
 }));
 section.querySelector('.industry-prev').addEventListener('click',()=>focusIndex(Math.round(-state.angle/step)-1));
 section.querySelector('.industry-next').addEventListener('click',()=>focusIndex(Math.round(-state.angle/step)+1));
 playButton.addEventListener('click',()=>{playing=!playing;playButton.textContent=playing?'Ⅱ':'▶';playButton.setAttribute('aria-label',playing?'Pause carousel':'Play carousel');playButton.setAttribute('aria-pressed',String(!playing));});
 cards.forEach(card=>{
  card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')hover=true;});
  card.addEventListener('pointerleave',()=>{hover=false;});
 });
 orbit.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const card=event.target.closest('.industry-orbit-card');
  if(!card||!orbit.contains(card))return;
  if(window.gsap)gsap.killTweensOf(state,'angle');settling=false;
  drag={x:event.clientX,angle:state.angle,moved:false,index:Number(card.dataset.industry)};
  orbit.classList.add('is-dragging');
  orbit.setPointerCapture(event.pointerId);
 });
 orbit.addEventListener('pointermove',event=>{if(!drag)return;const distance=event.clientX-drag.x;if(Math.abs(distance)>5)drag.moved=true;state.angle=drag.angle+distance*.005;render();});
 function release(){if(!drag)return;const saved=drag;drag=null;orbit.classList.remove('is-dragging');if(!saved.moved&&saved.index>=0)focusIndex(saved.index);else focusIndex(Math.round(-state.angle/step));}
 orbit.addEventListener('pointerup',release);orbit.addEventListener('pointercancel',release);orbit.addEventListener('lostpointercapture',release);
 cards.forEach((card,index)=>card.addEventListener('click',event=>{if(event.detail===0)focusIndex(index);}));
 section.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();focusIndex(Math.round(-state.angle/step)+(event.key==='ArrowRight'?1:-1));}});
 orbit.addEventListener('focusin',event=>{cardFocused=!!event.target.closest('.industry-orbit-card')&&event.target.matches(':focus-visible');});
 orbit.addEventListener('focusout',event=>{cardFocused=!!event.relatedTarget?.closest('.industry-orbit-card')&&event.relatedTarget.matches(':focus-visible');});
 new ResizeObserver(resize).observe(orbit);resize();
 new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(visible&&!started){started=true;if(window.gsap&&!reduced.matches)gsap.to(state,{assemble:1,opacity:1,duration:1.7,ease:'power3.out',onUpdate:render});else{state.assemble=1;state.opacity=1;}}
  cancelAnimationFrame(frame);last=0;if(visible)frame=requestAnimationFrame(loop);
 },{threshold:.12}).observe(section);
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=0;if(!document.hidden&&visible)frame=requestAnimationFrame(loop);});
 reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;state.assemble=1;state.opacity=1;playButton.textContent='▶';playButton.setAttribute('aria-label','Play carousel');playButton.setAttribute('aria-pressed','true');render();}});
 if(reduced.matches){playButton.textContent='▶';playButton.setAttribute('aria-label','Play carousel');playButton.setAttribute('aria-pressed','true');}
})();
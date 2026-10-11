(() => {
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const section=document.querySelector('.uptime-scroll'),stage=section.querySelector('.uptime-stage'),windowEl=section.querySelector('.uptime-window'),track=section.querySelector('.uptime-track');
 const fill=section.querySelector('.uptime-progress-fill'),dot=section.querySelector('.uptime-progress-dot');
 const media=gsap.matchMedia();
 media.add('(min-width:900px) and (min-height:650px) and (prefers-reduced-motion:no-preference)',()=>{
  section.classList.add('is-horizontal');
  const distance=()=>Math.max(0,track.scrollWidth-windowEl.clientWidth);
  gsap.set(track,{x:0});
  const tl=gsap.timeline({scrollTrigger:{trigger:stage,start:'top top',end:()=>'+='+Math.max(innerHeight,distance()*1.3),pin:true,scrub:1.05,anticipatePin:1,invalidateOnRefresh:true},defaults:{ease:'none'}});
  tl.to(track,{x:()=>-distance(),duration:1},0).to(fill,{scaleX:1,duration:1},0).to(dot,{left:'100%',duration:1},0);
  return ()=>section.classList.remove('is-horizontal');
 });
 if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
(() => {
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const section=document.querySelector('.native-deployment');
 if(!section)return;
 const stage=section.querySelector('.native-stage'),track=section.querySelector('.native-track'),cards=[...track.children],progress=section.querySelector('.native-progress i');
 const mm=gsap.matchMedia();
 mm.add('(min-width:900px) and (min-height:600px) and (prefers-reduced-motion:no-preference)',()=>{
  section.classList.add('is-scrolling');
  const motion={progress:0};
  function render(){
   const w=stage.clientWidth,h=stage.clientHeight;
   cards.forEach((card,i)=>{
    // A bent ribbon: flat in the middle, turning forward at either edge.
    const travel=i*.53-motion.progress*(cards.length-1)*.53;
    const bend=Math.max(-1.25,Math.min(1.25,travel));
    const edge=Math.abs(travel);
    const x=w*.5+travel*w*.62;
    const y=Math.min(h*.64,h-70-card.offsetHeight*.5)-Math.pow(bend,2)*h*.12;
    const z=Math.pow(bend,2)*125;
    const fade=Math.max(0,Math.min(1,(1.18-edge)/.28));
    gsap.set(card,{x,y,z,scale:1-Math.min(edge,1)*.08,rotationY:-bend*42,rotationX:5,rotationZ:-bend*3,xPercent:-50,yPercent:-50,opacity:fade,zIndex:Math.round(100+edge*30)});
    card.style.visibility=fade<=.01?'hidden':'visible';
   });
  }
  gsap.set(track,{clearProps:'transform'});
  render();
  const tween=gsap.to(motion,{progress:1,ease:'none',onUpdate:render,scrollTrigger:{trigger:stage,start:'top top',end:()=>'+='+Math.round(innerHeight*2.6),pin:true,scrub:1.15,anticipatePin:1,invalidateOnRefresh:true,onRefresh:render,onUpdate:self=>{progress.style.transform='scaleX('+self.progress+')';}}});
  const resize=new ResizeObserver(render);resize.observe(stage);
  if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
  return()=>{resize.disconnect();section.classList.remove('is-scrolling');gsap.set(cards,{clearProps:'transform,opacity,zIndex,visibility'});progress.style.removeProperty('transform');};
 });
})();

(() => {
 const section=document.querySelector('.agents-timeline-layout'),list=section.querySelector('.agent-timeline-list');
 const cards=[...list.querySelectorAll('.agent-card')],count=section.querySelector('.agent-timeline-count'),fill=section.querySelector('.agent-timeline-fill'),dot=section.querySelector('.agent-timeline-dot');
 let scheduled=false,active=-1;
 function update(){
  scheduled=false;
  const anchor=innerHeight*.38,bounds=list.getBoundingClientRect();
  const distance=Math.max(0,Math.min(bounds.height,anchor-bounds.top));
  fill.style.transform='scaleY('+(bounds.height?distance/bounds.height:0)+')';
  dot.style.transform='translateY('+distance+'px)';
  let index=0;cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<=anchor)index=i;});
  if(index!==active){active=index;cards.forEach((card,i)=>card.classList.toggle('is-current',i===index));count.textContent=String(index+1).padStart(2,'0');}
 }
 function queue(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);
 new ResizeObserver(queue).observe(list);if(document.fonts)document.fonts.ready.then(queue);update();
})();
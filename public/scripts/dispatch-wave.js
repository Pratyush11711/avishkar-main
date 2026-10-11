(() => {
 document.querySelectorAll('.dispatch-feature').forEach(card=>{
  let over=false;
  function origin(x,y){const box=card.getBoundingClientRect();card.style.setProperty('--wave-x',x+'px');card.style.setProperty('--wave-y',y+'px');card.style.setProperty('--wave-size',(2*Math.hypot(Math.max(x,box.width-x),Math.max(y,box.height-y))+4)+'px');}
  card.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;over=true;const box=card.getBoundingClientRect();origin(event.clientX-box.left,event.clientY-box.top);card.classList.add('is-lit');});
  card.addEventListener('pointerleave',()=>{over=false;if(!card.matches(':focus-visible'))card.classList.remove('is-lit');});
  card.addEventListener('focus',()=>{if(card.matches(':focus-visible')){origin(card.clientWidth/2,card.clientHeight/2);card.classList.add('is-lit');}});
  card.addEventListener('blur',()=>{if(!over)card.classList.remove('is-lit');});
 });
})();
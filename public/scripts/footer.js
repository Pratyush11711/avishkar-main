(() => {
 const footer=document.querySelector('.site-footer'),word=footer.querySelector('.footer-wordmark'),letters=[...word.children],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 footer.querySelector('.footer-year').textContent=String(new Date().getFullYear());
 footer.querySelector('.footer-back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'}));
 let pointer=null,frame=0;
 function paint(){frame=0;if(!pointer)return;const bounds=footer.getBoundingClientRect();footer.style.setProperty('--footer-shift-x',((pointer.x-bounds.left)/bounds.width-.5)*24+'px');footer.style.setProperty('--footer-shift-y',((pointer.y-bounds.top)/bounds.height-.5)*20+'px');letters.forEach(letter=>{const box=letter.getBoundingClientRect();letter.classList.toggle('is-near',pointer.y>=box.top-20&&pointer.y<=box.bottom+20&&Math.abs(pointer.x-box.left-box.width/2)<80);});}
 footer.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||reduced.matches)return;pointer={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(paint);});
 footer.addEventListener('pointerleave',()=>{pointer=null;cancelAnimationFrame(frame);frame=0;footer.style.setProperty('--footer-shift-x','0px');footer.style.setProperty('--footer-shift-y','0px');letters.forEach(letter=>letter.classList.remove('is-near'));});
})();
(() => {
 const surfaces=Array.from(document.querySelectorAll('.organizations,.production-image-layout,.agents-viewport,.protocols,.uptime-stage,.industry-gallery,.dispatch-features,.native-stage,.faq-section,.closing-cta'));
 let pending=0,pointer=null;
 function paint(){
  pending=0;if(!pointer)return;
  surfaces.forEach(surface=>{
   const bounds=surface.getBoundingClientRect();
   const inside=pointer.x>=bounds.left&&pointer.x<=bounds.right&&pointer.y>=bounds.top&&pointer.y<=bounds.bottom;
   surface.style.setProperty('--dot-visible',inside?'1':'0');
   if(inside){surface.style.setProperty('--dot-x',(pointer.x-bounds.left)+'px');surface.style.setProperty('--dot-y',(pointer.y-bounds.top)+'px');}
  });
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(paint);}
 document.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;pointer={x:event.clientX,y:event.clientY};schedule();},{passive:true});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 document.documentElement.addEventListener('pointerleave',()=>{pointer=null;surfaces.forEach(surface=>surface.style.setProperty('--dot-visible','0'));});
})();
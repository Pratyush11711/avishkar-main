(() => {
 const header=document.querySelector('.header'),hero=document.querySelector('#hero');
 if(!header||!hero)return;
 const placeholder=document.createElement('div');
 placeholder.className='header-placeholder';
 placeholder.setAttribute('aria-hidden','true');
 header.before(placeholder);
 let previousY=Math.max(0,window.scrollY),direction=0,travel=0,scheduled=false;
 function show(visible){
  header.classList.toggle('is-hidden',!visible);
  header.inert=!visible;
 }
 function update(){
  scheduled=false;
  const y=Math.max(0,window.scrollY),delta=y-previousY;
  const pastHero=y>=hero.offsetTop+hero.offsetHeight;
  if(!pastHero){
   if(header.classList.contains('is-floating')){
    header.classList.remove('is-floating');
    placeholder.after(header);
    placeholder.style.height='';
   }
   show(true);travel=0;direction=0;
  }else{
   if(!header.classList.contains('is-floating')){
    placeholder.style.height=header.offsetHeight+'px';
    // Keep the fixed bar outside the hero's clipped stacking context.
    document.body.append(header);
    header.classList.add('is-floating');
    show(delta<=0);
   }
   const nextDirection=Math.sign(delta);
   if(nextDirection&&nextDirection!==direction){travel=0;direction=nextDirection;}
   travel+=Math.abs(delta);
   if(header.querySelector('.nav-links.open')||header.querySelector(':focus-visible'))show(true);
   else if(travel>=10){show(direction<0);travel=0;}
  }
  previousY=y;
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 header.addEventListener('focusin',()=>show(true));
 update();
})();

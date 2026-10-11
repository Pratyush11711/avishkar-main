(() => {
 if(!window.gsap)return;
 const cards=[...document.querySelectorAll('.uptime-step')],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const demos=[];
 cards.forEach((card,index)=>{
  const visual=card.querySelector('.uptime-step-visual');
  const tools=document.createElement('div');tools.className='uptime-demo-tools';
  tools.innerHTML='<span>WORKFLOW PREVIEW</span><button type="button" aria-label="Replay '+card.querySelector('h3').textContent+' preview">Replay <span aria-hidden="true">↻</span></button>';
  visual.prepend(tools);
  const replay=tools.querySelector('button');
  const tl=gsap.timeline({paused:true});
  function status(row,text){row.querySelector('i').textContent=text;}
  let reset,finish;
  if(index===0){
   const rows=[...card.querySelectorAll('.uptime-flow>div')];
   reset=()=>{rows.forEach(row=>{row.classList.remove('is-processing','is-complete');status(row,'—');});};
   finish=()=>{rows.forEach(row=>{row.classList.remove('is-processing');row.classList.add('is-complete');status(row,'✓');});};
   rows.forEach((row,i)=>{
    tl.call(()=>{row.classList.add('is-processing');status(row,['Triaging','Matching','Sending'][i]);},[],i*1.2)
      .call(()=>{row.classList.remove('is-processing');row.classList.add('is-complete');status(row,'✓');},[],i*1.2+1);
   });
   tl.to({}, {duration:.35});
  }else if(index===1){
   const bars=[...card.querySelectorAll('.uptime-sla-row i')],ring=card.querySelector('.uptime-sla-ring'),rows=[...card.querySelectorAll('.uptime-sla-row')];
   reset=()=>{gsap.set(bars,{scaleX:0});ring.style.setProperty('--sla-progress','0%');ring.textContent='0/3';rows.forEach(row=>row.classList.remove('is-complete'));};
   finish=()=>{gsap.set(bars,{scaleX:1});ring.style.setProperty('--sla-progress','100%');ring.textContent='3/3';rows.forEach(row=>row.classList.add('is-complete'));};
   const meter={value:0};
   bars.forEach((bar,i)=>{
    tl.to(bar,{scaleX:1,duration:1.15,ease:'power1.inOut'},i*1.25)
      .call(()=>{rows[i].classList.add('is-complete');ring.textContent=(i+1)+'/3';},[],i*1.25+1.15);
   });
   tl.fromTo(meter,{value:0},{value:100,duration:3.65,ease:'none',onUpdate:()=>ring.style.setProperty('--sla-progress',meter.value+'%')},0);
   tl.to({}, {duration:.35});
  }else{
   const nodes=[...card.querySelectorAll('.uptime-network-nodes circle')],lines=[...card.querySelectorAll('.uptime-network-lines path')],signals=[...card.querySelectorAll('.uptime-network-signals circle')],check=card.querySelector('.uptime-network-check'),label=card.querySelector('.uptime-asset-count');
   const origins=nodes.map(node=>({x:node.getAttribute('cx'),y:node.getAttribute('cy')}));
   reset=()=>{nodes.forEach(node=>node.classList.remove('is-connected'));lines.forEach(line=>line.classList.remove('is-connected'));gsap.set(signals,{opacity:0});signals.forEach((signal,i)=>gsap.set(signal,{attr:{cx:origins[i].x,cy:origins[i].y}}));gsap.set(check,{opacity:0});label.textContent='Connecting assets';};
   finish=()=>{nodes.forEach(node=>node.classList.add('is-connected'));lines.forEach(line=>line.classList.add('is-connected'));gsap.set(signals,{opacity:0});gsap.set(check,{opacity:1});label.textContent='6 assets connected';};
   nodes.forEach((node,i)=>{
    const at=Math.floor(i/2)*1.15;
    tl.set(signals[i],{opacity:1},at)
      .to(signals[i],{attr:{cx:230,cy:85},duration:.85,ease:'power1.inOut'},at)
      .set(signals[i],{opacity:0},at+.85)
      .call(()=>{node.classList.add('is-connected');lines[i].classList.add('is-connected');label.textContent=(i+1)+' assets connected';},[],at+.85);
   });
   tl.to(check,{opacity:1,duration:.25},3.2).to({}, {duration:.45});
  }
  const demo={card,tl,visible:false,started:false,reset,finish,replay};demos.push(demo);
  reset();if(reduced.matches){finish();replay.hidden=true;}
  tl.eventCallback('onComplete',()=>{replay.disabled=false;});
  replay.addEventListener('click',()=>{if(reduced.matches)return;reset();replay.disabled=true;demo.started=true;tl.restart();});
 });
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const demo=demos.find(item=>item.card===entry.target);demo.visible=entry.isIntersecting;
  if(reduced.matches)return;
  if(demo.visible&&!document.hidden){if(!demo.started){demo.started=true;demo.reset();demo.replay.disabled=true;demo.tl.restart();}else if(demo.tl.progress()<1)demo.tl.play();}else demo.tl.pause();
 }),{threshold:.45});
 demos.forEach(demo=>observer.observe(demo.card));
 document.addEventListener('visibilitychange',()=>demos.forEach(demo=>{if(!reduced.matches&&demo.visible&&!document.hidden&&demo.started&&demo.tl.progress()<1)demo.tl.play();else demo.tl.pause();}));
 reduced.addEventListener('change',()=>demos.forEach(demo=>{demo.tl.pause();demo.reset();demo.replay.hidden=reduced.matches;if(reduced.matches)demo.finish();else{demo.started=false;demo.replay.disabled=false;if(demo.visible&&!document.hidden){demo.started=true;demo.replay.disabled=true;demo.tl.restart();}}}));
})();
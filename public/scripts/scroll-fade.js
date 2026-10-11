(() => {
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();

 media.add('(min-width: 651px) and (prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll('.protocol-row').forEach(row => {
   const copy = row.querySelector('.protocol-copy');
   const visual = row.querySelector('.protocol-visual');
   const heading = row.querySelector('h3');

   if (heading) {
    // The type grows wider and slightly shorter as its row crosses the viewport.
    gsap.fromTo(heading,
     { scaleX: 0.86, scaleY: 1.12 },
     { scaleX: 1.035, scaleY: 0.96, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'bottom 20%', scrub: 0.65, invalidateOnRefresh: true } }
    );
   }

   if (copy && visual) {
    // Left text moves to left and changes geometry from tilted (rotateY: 28deg) to normal (rotateY: 0deg)
    gsap.fromTo(copy,
     {
      x: 80,
      rotateY: 28,
      transformPerspective: 900,
      transformOrigin: 'left center'
     },
     {
      x: 0,
      rotateY: 0,
      ease: 'none',
      scrollTrigger: {
       trigger: row,
       start: 'top 88%',
       end: 'center 48%',
       scrub: 0.65,
       invalidateOnRefresh: true
      }
     }
    );

    // Right visual/image moves to right and changes geometry from tilted (rotateY: -26deg) to normal (rotateY: 0deg), creating space
    gsap.fromTo(visual,
     {
      x: -80,
      rotateY: -26,
      rotateX: 4,
      transformPerspective: 900,
      transformOrigin: 'right center'
     },
     {
      x: 0,
      rotateY: 0,
      rotateX: 0,
      ease: 'none',
      scrollTrigger: {
       trigger: row,
       start: 'top 88%',
       end: 'center 48%',
       scrub: 0.65,
       invalidateOnRefresh: true
      }
     }
    );
   }
  });
 });

 media.add('(max-width: 650px) and (prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll('.protocol-row').forEach(row => {
   const copy = row.querySelector('.protocol-copy');
   const visual = row.querySelector('.protocol-visual');
   const heading = row.querySelector('h3');

   if (heading) {
    gsap.fromTo(heading,
     { scaleX: 0.9, scaleY: 1.08 },
     { scaleX: 1.02, scaleY: 0.98, ease: 'none', scrollTrigger: { trigger: row, start: 'top 92%', end: 'bottom 15%', scrub: 0.65, invalidateOnRefresh: true } }
    );
   }

   if (copy && visual) {
    gsap.fromTo(copy,
     { x: 25, rotateY: 16, transformPerspective: 700, transformOrigin: 'left center' },
     { x: 0, rotateY: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'center 52%', scrub: 0.65, invalidateOnRefresh: true } }
    );
    gsap.fromTo(visual,
     { x: -25, rotateY: -16, transformPerspective: 700, transformOrigin: 'right center' },
     { x: 0, rotateY: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'center 52%', scrub: 0.65, invalidateOnRefresh: true } }
    );
   }
  });
 });

 if(document.fonts)document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
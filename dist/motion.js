(() => {
  const {gsap, ScrollTrigger, Lenis} = window;
  if (!gsap || !ScrollTrigger || !Lenis) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    document.documentElement.classList.add('motion-ready');
    const lenis = new Lenis({duration: 1, smoothWheel: true, syncTouch: false, anchors: true,
      prevent: node => Boolean(node.closest('dialog, #gameplay-track, .release-jump'))});
    lenis.on('scroll', ScrollTrigger.update);
    const tick = time => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const updateLock = () => {
      const locked = document.documentElement.classList.contains('menu-open') || document.documentElement.classList.contains('survey-open');
      if (locked) lenis.stop(); else lenis.start();
    };
    const observer = new MutationObserver(updateLock);
    observer.observe(document.documentElement, {attributes: true, attributeFilter:['class']});
    updateLock();
    if (document.querySelector('.welcome-page')) {
      gsap.from('.welcome-kicker, .welcome-line, .welcome-description, .welcome-bottom', {y:22,opacity:0,stagger:.09,duration:.9,ease:'power2.out'});
      const timeline = gsap.timeline({scrollTrigger:{trigger:'.welcome-main',start:'top top',end:'bottom bottom',scrub:.6}});
      timeline.to('.welcome-art',{scale:1.12,yPercent:-3,ease:'none'},0)
        .to('.welcome-copy',{y:-60,opacity:0,ease:'none'},.3)
        .to('.welcome-bottom',{opacity:0,ease:'none'},.1);
    } else {
      if (document.querySelector('.home-content')) {
        gsap.from('.home-content>*',{y:20,opacity:0,stagger:.09,duration:.8,ease:'power2.out'});
        gsap.to('.home-content',{y:35,opacity:.25,ease:'none',scrollTrigger:{trigger:'.home-hero',start:'top top',end:'bottom top',scrub:.5}});
      }
      const targets = document.querySelectorAll('.gameplay-heading, .gameplay-gallery, .section-heading, .updates-heading, .release-entry, .community-overview, .team-heading, .team-empty, .faq-intro, .faq-list, .guide-intro, .compatibility-intro');
      targets.forEach(target => gsap.from(target,{y:22,opacity:0,duration:.65,ease:'power2.out',scrollTrigger:{trigger:target,start:'top 94%',once:true}}));
    }
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, {once:true});
    if (document.fonts) document.fonts.ready.then(refresh);
    document.addEventListener('toggle', refresh, true);
    const onPageShow = () => {updateLock();refresh();};
    window.addEventListener('pageshow', onPageShow);
    return () => {
      observer.disconnect();gsap.ticker.remove(tick);lenis.destroy();
      document.removeEventListener('toggle',refresh,true);window.removeEventListener('load',refresh);window.removeEventListener('pageshow',onPageShow);
      document.documentElement.classList.remove('motion-ready');
    };
  });
})();

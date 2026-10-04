(() => {
  // BelArosa reference: scroll-linked media in clipped frames, with native scrolling.
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMotion=matchMedia('(min-width: 1050px)');
  const parallax=[...document.querySelectorAll('[data-parallax]')].map(media=>({media,frame:media.parentElement,y:0,scale:1,travel:.12,hero:media.id==='review-cover-film'}));
  const anchoredCopy=[...document.querySelectorAll('.ownership-media,.oriente-cinema-content,.city-cinema .story-film-copy')];
  const visibleFrames=new Set();
  let parallaxTick=0,layoutTick=0,lastFrame=0,headerHeight=0;
  const motionAllowed=()=>!motionPreference.matches&&!document.hidden&&!document.body.classList.contains('is-paused')&&!document.body.classList.contains('is-presenting');
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function refreshMotionLayout(){
    layoutTick=0;
    headerHeight=document.querySelector('body>.header')?.getBoundingClientRect().height||0;
    // Measure first, then write; longer Spanish copy and browser zoom can disable sticky.
    const measurements=anchoredCopy.map(copy=>({copy,height:copy.getBoundingClientRect().height}));
    const mediaMeasurements=parallax.map(item=>({item,height:item.frame.clientHeight,travel:parseFloat(getComputedStyle(item.frame).getPropertyValue('--parallax-travel'))||.12}));
    mediaMeasurements.forEach(({item,height,travel})=>{
      item.travel=travel;
      // A resized offscreen frame must not retain an offset from a taller viewport.
      item.y=clamp(item.y,-height*travel,height*travel);
      item.media.style.setProperty('--parallax-y',`${item.y.toFixed(2)}px`);
    });
    measurements.forEach(({copy,height})=>{
      const enabled=desktopMotion.matches&&motionAllowed()&&height>0&&height<=innerHeight-headerHeight-56;
      copy.classList.toggle('motion-sticky',enabled);
      if(enabled)copy.style.setProperty('--story-sticky-top',`${Math.min(Math.max(headerHeight+24,innerHeight*.24),innerHeight-height-32)}px`);
      else copy.style.removeProperty('--story-sticky-top');
    });
    scheduleParallax();
  }
  function scheduleMotionLayout(){if(!layoutTick)layoutTick=requestAnimationFrame(refreshMotionLayout);}
  function renderParallax(time){
    parallaxTick=0;
    if(!motionAllowed()){
      parallax.forEach(item=>{item.y=0;item.scale=1;item.media.style.removeProperty('--parallax-y');item.media.style.removeProperty('--parallax-scale');});
      lastFrame=0;return;
    }
    // Time-based smoothing keeps the same feel on 60Hz and high-refresh screens.
    const blend=1-Math.exp(-(lastFrame?Math.min(64,time-lastFrame):16.67)/95);
    lastFrame=time;
    const height=innerHeight;
    const positions=parallax.filter(item=>visibleFrames.has(item.frame)).map(item=>{
      const rect=item.frame.getBoundingClientRect();
      if(item.hero){
        const progress=clamp((headerHeight-rect.top)/Math.max(1,rect.height),0,1);
        return {item,target:progress*rect.height*item.travel,scale:1+progress*(desktopMotion.matches ? .08 : .04)};
      }
      const progress=clamp((height/2-rect.top-rect.height/2)/((height+rect.height)/2),-1,1);
      return {item,target:progress*rect.height*item.travel,scale:1};
    });
    let settling=false;
    positions.forEach(({item,target,scale})=>{
      item.y+=(target-item.y)*blend;
      item.scale+=(scale-item.scale)*blend;
      if(Math.abs(target-item.y)>.1||Math.abs(scale-item.scale)>.0001)settling=true;
      item.media.style.setProperty('--parallax-y',`${item.y.toFixed(2)}px`);
      item.media.style.setProperty('--parallax-scale',item.scale.toFixed(4));
    });
    if(settling)parallaxTick=requestAnimationFrame(renderParallax);
    else lastFrame=0;
  }
  function scheduleParallax(){if(!parallaxTick)parallaxTick=requestAnimationFrame(renderParallax);}
  if(parallax.length){
    const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{
      entry.isIntersecting?visibleFrames.add(entry.target):visibleFrames.delete(entry.target);
      entry.target.classList.toggle('motion-in-view',entry.isIntersecting);
    });scheduleParallax();},{rootMargin:'80px'});
    parallax.forEach(item=>visibility.observe(item.frame));
    addEventListener('scroll',scheduleParallax,{passive:true});addEventListener('resize',scheduleMotionLayout,{passive:true});
    document.addEventListener('visibilitychange',scheduleMotionLayout);motionPreference.addEventListener('change',scheduleMotionLayout);
    desktopMotion.addEventListener('change',scheduleMotionLayout);
    new MutationObserver(scheduleMotionLayout).observe(document.body,{attributes:true,attributeFilter:['class']});
    new MutationObserver(scheduleMotionLayout).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    const resize=new ResizeObserver(scheduleMotionLayout);
    [...anchoredCopy,...parallax.map(item=>item.frame),document.querySelector('body>.header')].filter(Boolean).forEach(element=>resize.observe(element));
    scheduleMotionLayout();
  }
  const buttons=[...document.querySelectorAll('[data-property-filter]')];
  const previews=[...document.querySelectorAll('#home-films [data-preview-home]')];
  let filter='all';
  const indices=()=>filter==='country'?[3,4]:filter==='city'?[0,1,2]:[3,4,0,1,2];
  function applyFilter(value,select=false){
    filter=value;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.propertyFilter===filter)));
    const available=indices();
    previews.forEach(link=>link.hidden=!available.includes(Number(link.dataset.previewHome)));
    if(select&&!available.includes(window.DulcineaProperties?.index))window.DulcineaProperties?.select(available[0],{writeRoute:true});
  }
  buttons.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.propertyFilter,true)));
  for(const [id,direction] of [['prev-home',-1],['next-home',1]]){
    document.getElementById(id)?.addEventListener('click',event=>{
      if(filter==='all'||document.body.classList.contains('is-presenting'))return;
      event.stopImmediatePropagation();const available=indices();
      const current=available.indexOf(window.DulcineaProperties.index);
      window.DulcineaProperties.select(available[(current+direction+available.length)%available.length],{writeRoute:true});
    },true);
  }
  // A destination link always reveals its property, even after another filter.
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-preview-home]');
    if(link&&!indices().includes(Number(link.dataset.previewHome)))applyFilter('all');
  },true);
  window.addEventListener('hashchange',()=>{
    if(location.hash.startsWith('#property-')&&!indices().includes(window.DulcineaProperties?.index))applyFilter('all');
  });
  window.addEventListener('dulcinea:presentation-slide',()=>applyFilter('all'));

  // Contact actions are deliberately inert in the comparison version.
  const dialog=document.createElement('dialog');dialog.className='preview-contact-dialog';
  dialog.setAttribute('aria-labelledby','review-contact-heading');
  dialog.innerHTML='<h2 id="review-contact-heading"></h2><p></p><button type="button"></button>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-preview-contact]'))return;event.preventDefault();
    const es=document.documentElement.lang==='es';
    dialog.querySelector('h2').textContent=es?'Hable con nosotros':'Talk to us';
    dialog.querySelector('p').textContent=es?'El contacto está desactivado en esta versión de comparación. No se envía ningún mensaje. Use el sitio actual para contactar al equipo.':'Contact is disabled in this comparison version. No message is sent. Use the current website to contact the team.';
    dialog.querySelector('button').textContent=es?'Cerrar':'Close';dialog.showModal();
  });
})();

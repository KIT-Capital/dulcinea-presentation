(() => {
  const cover=document.getElementById('review-cover-film');
  document.querySelectorAll('[data-cover-film]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-cover-film]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
    cover.src=button.dataset.coverSource;cover.poster=button.dataset.coverPoster;cover.load();
    document.getElementById('review-cover-caption').hidden=button.dataset.coverFilm!=='homes';
    if(!document.body.classList.contains('is-paused'))cover.play().catch(()=>{});
  }));
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
  const exit=document.createElement('form');exit.method='post';exit.action='/preview-logout';exit.className='review-exit-form';
  const exitButton=document.createElement('button');exitButton.type='submit';exitButton.className='review-exit';exit.append(exitButton);
  (document.querySelector('.contact footer')||document.querySelector('footer')||document.body).append(exit);
  const update=()=>exitButton.textContent=document.documentElement.lang==='es'?'Salir de la revisión':'Sign out of review';
  document.addEventListener('dulcinea:language',update);update();
})();

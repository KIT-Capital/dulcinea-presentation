// One source for the website section, presentation slide and specialists page.
const specialists = [
  { role:['Architecture · Design and works','Arquitectura · Diseño y obras'], name:'Marcela Vélez & María Antonia Uribe' },
  { role:['Works oversight','Interventoría'], name:'John Mario Piedrahita' },
  { role:['Legal · Title and closing','Legal · Títulos y cierre'], name:'Juan Carlos Pérez' },
  { role:['Accounting and tax','Contabilidad e impuestos'], name:'Jorge Valiente' },
];
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function renderSpecialists(locale = 'en') {
  return `<dl class="specialists">${specialists.map(({role,name}) => `<div><dt data-en="${escape(role[0])}" data-es="${escape(role[1])}">${escape(role[locale === 'es' ? 1 : 0])}</dt><dd>${escape(name)}</dd></div>`).join('')}</dl>`;
}

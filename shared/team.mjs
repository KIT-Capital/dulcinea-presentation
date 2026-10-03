// One source for the website section, presentation slide and specialists page.
const specialists = [
  { role:['Architecture · Design and works','Arquitectura · Diseño y obras'], name:'Marcela Vélez & María Antonia Uribe' },
  { role:['Works oversight','Interventoría'], name:'John Mario Piedrahita' },
  { role:['Legal · Title and closing','Legal · Títulos y cierre'], name:'Juan Carlos Pérez' },
  { role:['Accounting and tax','Contabilidad e impuestos'], name:'Jorge Valiente', bio:[
    'Certified Public Accountant and a 2020 graduate of Universidad Simón Bolívar in Barranquilla. His experience covers accounting, finance, taxation and auditing across real estate, hospitality, tourism and other commercial sectors.',
    'Contador público, egresado de la Universidad Simón Bolívar de Barranquilla en 2020. Tiene experiencia en contabilidad, finanzas, impuestos y auditoría en los sectores inmobiliario, hotelero, turístico y comercial.',
  ] },
];
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function renderSpecialists(locale = 'en') {
  return `<dl class="specialists">${specialists.map(({role,name,bio}) => `<div><dt data-en="${escape(role[0])}" data-es="${escape(role[1])}">${escape(role[locale === 'es' ? 1 : 0])}</dt><dd>${escape(name)}${bio ? `<p class="specialist-bio" data-en="${escape(bio[0])}" data-es="${escape(bio[1])}">${escape(bio[locale === 'es' ? 1 : 0])}</p>` : ''}</dd></div>`).join('')}</dl>`;
}

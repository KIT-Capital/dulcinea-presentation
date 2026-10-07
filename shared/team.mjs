// One source for the website section, presentation slide and specialists page.
const specialists = [
  { role:['Architecture · Design and works','Arquitectura · Diseño y obras'], people:[
    { name:'Marcela Vélez', url:'https://marcelavelez.com/home/', bio:[
      'Medellín-based architect and interior designer with 10+ years of experience across hospitality, commercial, educational and residential projects. Her work includes coordinating interior design execution, furniture and décor for Nattivo Collection Hotel in San Andrés.',
      'Arquitecta y diseñadora de interiores radicada en Medellín, con más de 10 años de experiencia en proyectos hoteleros, comerciales, educativos y residenciales. Su trabajo incluye la coordinación de la ejecución del diseño interior, el mobiliario y la decoración del Nattivo Collection Hotel en San Andrés.',
    ], shortBio:[
      'Architect and interior designer with 10+ years across hotels, homes, retail and education.',
      'Arquitecta e interiorista con más de 10 años en hoteles, vivienda, comercio y educación.',
    ] },
    { name:'María Antonia Uribe', url:'https://www.instagram.com/maar.arquitectura/', bio:[
      'Her Medellín practice, MAAR, focuses on architecture, interior design and renovations.',
      'Su estudio MAAR, en Medellín, trabaja en arquitectura, interiorismo y reformas.',
    ], shortBio:[
      'MAAR · Architecture, interiors and renovations in Medellín.',
      'MAAR · Arquitectura, interiorismo y reformas en Medellín.',
    ] },
  ] },
  { role:['Works oversight','Interventoría'], name:'John Mario Piedrahita' },
  { role:['Legal · Title and closing','Legal · Títulos y cierre'], name:'Juan Carlos Pérez Sarmiento', bio:[
    'Cartagena attorney with more than 20 years advising businesses and investors on real estate and corporate matters. He holds a law degree from Universidad de Cartagena and a business-law specialization from Universidad Autónoma de Bucaramanga, and serves as general counsel to Obra Pía in Colombia.',
    'Abogado cartagenero con más de 20 años de experiencia asesorando a empresas e inversionistas en asuntos inmobiliarios y corporativos. Es egresado de la Universidad de Cartagena y especialista en Derecho Empresarial de la Universidad Autónoma de Bucaramanga. Se desempeña como asesor jurídico general de Obra Pía en Colombia.',
  ], shortBio:[
    'More than 20 years in real estate and corporate law. Universidad de Cartagena law graduate; business-law specialist from Universidad Autónoma de Bucaramanga.',
    'Abogado de la Universidad de Cartagena, con más de 20 años en asuntos inmobiliarios y corporativos. Especialista en Derecho Empresarial, Universidad Autónoma de Bucaramanga.',
  ] },
  { role:['Accounting and tax','Contabilidad e impuestos'], name:'Jorge Valiente', bio:[
    'Certified Public Accountant and a 2020 graduate of Universidad Simón Bolívar in Barranquilla. His experience covers accounting, finance, taxation and auditing across real estate, hospitality, tourism and other commercial sectors.',
    'Contador público, egresado de la Universidad Simón Bolívar de Barranquilla en 2020. Tiene experiencia en contabilidad, finanzas, impuestos y auditoría en los sectores inmobiliario, hotelero, turístico y comercial.',
  ], shortBio:[
    'Certified Public Accountant, Universidad Simón Bolívar (2020), with experience in accounting, tax and auditing across real estate, hospitality and tourism.',
    'Contador público, Universidad Simón Bolívar (2020), con experiencia en contabilidad, impuestos y auditoría en los sectores inmobiliario, hotelero y turístico.',
  ] },
];
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function renderSpecialists(locale = 'en', { presentationVariants = false } = {}) {
  const languageIndex = locale === 'es' ? 1 : 0;
  const renderBio = (bio, variant = '') => `<p class="specialist-bio${variant ? ` ${variant}` : ''}" data-en="${escape(bio[0])}" data-es="${escape(bio[1])}">${escape(bio[languageIndex])}</p>`;
  const renderPerson = ({name,url,bio,shortBio}) => {
    const bioContent = !bio ? '' : presentationVariants && shortBio
      ? renderBio(bio, 'website-only') + renderBio(shortBio, 'presentation-only')
      : renderBio(bio);
    const personName = url ? `<a class="specialist-profile" href="${escape(url)}" target="_blank" rel="noopener">${escape(name)}</a>` : escape(name);
    return personName + bioContent;
  };
  return `<dl class="specialists">${specialists.map(({role,people,...person}) => {
    const content = people ? people.map(person => `<article class="specialist-person">${renderPerson(person)}</article>`).join('') : renderPerson(person);
    return `<div><dt data-en="${escape(role[0])}" data-es="${escape(role[1])}">${escape(role[languageIndex])}</dt><dd>${content}</dd></div>`;
  }).join('')}</dl>`;
}

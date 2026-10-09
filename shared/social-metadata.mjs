import {frenchText} from './locales.mjs';
// Canonical production metadata; review builds select their origin explicitly.
export const SOCIAL_ORIGIN = 'https://invest.dulcineainvestments.org';
export const REVIEW_ORIGIN = 'https://dulcinea-design-review.norfolk-ai.workers.dev';
export const SOCIAL_IMAGE_PATH = '/assets/social/dulcinea-one-medellin-v2.jpg';
export const SOCIAL_IMAGE_ES_PATH = '/assets/social/dulcinea-one-medellin-es-v2.jpg';
export const SOCIAL_VIDEO_PATH = '/assets/video/stock/AdobeStock_693150796.mp4';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function socialMetadata(language = 'en', { origin = SOCIAL_ORIGIN, page = 'index' } = {}) {
  const es = language === 'es';
  const resources = {
    'investment-criteria': {
      title: es ? 'Dulcinea One | Criterios de adquisición' : 'Dulcinea One | Acquisition criteria',
      description: es ? 'Los diez criterios que guían la selección de propiedades para Dulcinea One en Medellín y el Oriente.' : 'The ten criteria guiding property selection for Dulcinea One in Medellín and El Oriente.',
    },
    specialists: {
      title: es ? 'Dulcinea One | Especialistas locales' : 'Dulcinea One | Local specialists',
      description: es ? 'Conozca a los especialistas locales de Dulcinea One en arquitectura, interventoría, asuntos legales, contabilidad e impuestos.' : 'Meet Dulcinea One’s local specialists in architecture, works oversight, legal matters, accounting and tax.',
    },
    disclaimer: {
      title: es ? 'Dulcinea One | Información legal' : 'Dulcinea One | Investment disclosures',
      description: es ? 'Información sobre riesgos, elegibilidad y condiciones de la inversión en Dulcinea One. Solo para inversionistas acreditados.' : 'Risks, investor eligibility and investment disclosures for Dulcinea One. Accredited investors only.',
    },
    'financial-statements': {
      title: es ? 'Dulcinea One | Estados financieros privados' : 'Dulcinea One | Private financial statements',
      description: es ? 'Acceso con contraseña a los estados financieros pro forma de Dulcinea One.' : 'Password-protected access to Dulcinea One’s pro forma financial statements.',
    },
  };
  if (page !== 'index' && !Object.hasOwn(resources, page)) throw new Error(`Unknown social metadata page: ${page}`);
  const card = {
    title: es ? 'Dulcinea One | Propiedades en Medellín y el Oriente' : 'Dulcinea One | Homes in Medellín and El Oriente',
    description: es
      ? 'Dulcinea One: un programa inmobiliario con inversión en cinco propiedades y estadías para miembros, familiares y amigos en Medellín y el Oriente.'
      : 'Dulcinea One: a real estate program with investment in five homes and member stays with family and friends in Medellín and El Oriente.',
    imageAlt: es
      ? 'Dulcinea One: cinco propiedades, un portafolio, con Medellín y sus montañas de fondo.'
      : 'Dulcinea One: five homes, one portfolio, with Medellín and its mountains in the background.',
    ...resources[page],
    url: `${origin}${language === 'en' ? '/' : `/${language}/`}${page === 'index' ? '' : `${page}.html`}`,
    locale: language === 'fr' ? 'fr_FR' : es ? 'es_CO' : 'en_US',
    alternateLocales: ['en_US','es_CO','fr_FR'].filter(value => value !== (language === 'fr' ? 'fr_FR' : es ? 'es_CO' : 'en_US')),
    alternateLocale: es ? 'en_US' : 'es_CO',
    imagePath: es ? SOCIAL_IMAGE_ES_PATH : SOCIAL_IMAGE_PATH,
  };
  if(language === 'fr')for(const key of ['title','description','imageAlt'])card[key]=frenchText(card[key]);
  return card;
}

export function renderSocialMetadata(language = 'en', { includeDocumentMetadata = false, origin = SOCIAL_ORIGIN, page = 'index' } = {}) {
  const card = socialMetadata(language, { origin, page });
  const property = (name, value) => `<meta property="${name}" content="${escapeHtml(value)}">`;
  const named = (name, value) => `<meta name="${name}" content="${escapeHtml(value)}">`;
  const image = `${origin}${card.imagePath}`;
  const video = `${origin}${SOCIAL_VIDEO_PATH}`;
  return [
    ...(includeDocumentMetadata ? [`<title>${escapeHtml(card.title)}</title>`, named('description', card.description)] : []),
    `<link rel="canonical" href="${card.url}">`,
    property('og:type', 'website'),
    property('og:site_name', 'Dulcinea'),
    property('og:url', card.url),
    property('og:locale', card.locale),
    ...card.alternateLocales.map(value => property('og:locale:alternate', value)),
    property('og:title', card.title),
    property('og:description', card.description),
    property('og:image', image),
    property('og:image:secure_url', image),
    property('og:image:type', 'image/jpeg'),
    property('og:image:width', '1200'),
    property('og:image:height', '630'),
    property('og:image:alt', card.imageAlt),
    ...(page === 'index' ? [
      property('og:video', video),
      property('og:video:secure_url', video),
      property('og:video:type', 'video/mp4'),
      property('og:video:width', '1280'),
      property('og:video:height', '720'),
    ] : []),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', card.title),
    named('twitter:description', card.description),
    named('twitter:image', image),
    named('twitter:image:alt', card.imageAlt),
  ].join('\n');
}

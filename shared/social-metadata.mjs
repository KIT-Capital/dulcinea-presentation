// One share card for the public access gate and the authenticated investor site.
export const SOCIAL_ORIGIN = 'https://dulcinea-design-review.norfolk-ai.workers.dev';
export const SOCIAL_IMAGE_PATH = '/assets/social/dulcinea-one-medellin-v2.jpg';
export const SOCIAL_IMAGE_ES_PATH = '/assets/social/dulcinea-one-medellin-es-v2.jpg';
export const SOCIAL_VIDEO_PATH = '/assets/video/stock/AdobeStock_693150796.mp4';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function socialMetadata(language = 'en') {
  const es = language === 'es';
  return {
    title: es ? 'Dulcinea One | Propiedades en Medellín y el Oriente' : 'Dulcinea One | Homes in Medellín and El Oriente',
    description: es
      ? 'El primer fondo inmobiliario de Dulcinea en Medellín, Colombia. Cinco propiedades en El Poblado y el Oriente, con estadías para miembros y la marca compartida de Lola & Ber.'
      : 'Dulcinea’s first real estate fund in Medellín, Colombia. Five homes in El Poblado and El Oriente, with member stays and co-branding by Lola & Ber.',
    imageAlt: es
      ? 'Dulcinea One: cinco propiedades, un portafolio, con Medellín y sus montañas de fondo.'
      : 'Dulcinea One: five homes, one portfolio, with Medellín and its mountains in the background.',
    url: `${SOCIAL_ORIGIN}${es ? '/es/' : '/'}`,
    locale: es ? 'es_CO' : 'en_US',
    alternateLocale: es ? 'en_US' : 'es_CO',
    imagePath: es ? SOCIAL_IMAGE_ES_PATH : SOCIAL_IMAGE_PATH,
  };
}

export function renderSocialMetadata(language = 'en', { includeDocumentMetadata = false } = {}) {
  const card = socialMetadata(language);
  const property = (name, value) => `<meta property="${name}" content="${escapeHtml(value)}">`;
  const named = (name, value) => `<meta name="${name}" content="${escapeHtml(value)}">`;
  const image = `${SOCIAL_ORIGIN}${card.imagePath}`;
  const video = `${SOCIAL_ORIGIN}${SOCIAL_VIDEO_PATH}`;
  return [
    ...(includeDocumentMetadata ? [`<title>${escapeHtml(card.title)}</title>`, named('description', card.description)] : []),
    `<link rel="canonical" href="${card.url}">`,
    property('og:type', 'website'),
    property('og:site_name', 'Dulcinea'),
    property('og:url', card.url),
    property('og:locale', card.locale),
    property('og:locale:alternate', card.alternateLocale),
    property('og:title', card.title),
    property('og:description', card.description),
    property('og:image', image),
    property('og:image:secure_url', image),
    property('og:image:type', 'image/jpeg'),
    property('og:image:width', '1200'),
    property('og:image:height', '630'),
    property('og:image:alt', card.imageAlt),
    property('og:video', video),
    property('og:video:secure_url', video),
    property('og:video:type', 'video/mp4'),
    property('og:video:width', '1280'),
    property('og:video:height', '720'),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', card.title),
    named('twitter:description', card.description),
    named('twitter:image', image),
    named('twitter:image:alt', card.imageAlt),
  ].join('\n');
}

// Investor-facing disclosures shared by the homepage and full notice.
// Entity wording must match formation evidence; never infer it from a similar name.
export const disclosures = {
  title: ['Disclaimer', 'Aviso legal'],
  entity: [
    'Dulcinea Investments, LLC is a Delaware limited liability company and the issuer of the investment presented as Dulcinea One. Dulcinea is a real estate investment firm; it oversees its own investments and does not offer real estate brokerage or third-party property-management services.',
    'Dulcinea Investments, LLC es una sociedad de responsabilidad limitada constituida en Delaware y la emisora de la inversión presentada como Dulcinea One. Dulcinea es una firma de inversión inmobiliaria; supervisa sus propias inversiones y no ofrece servicios de corretaje ni de administración de inmuebles para terceros.',
  ],
  summary: [
    'For information only. Any investment is subject to definitive offering and membership documents and investor eligibility. Pro forma financial statements and return targets are unaudited estimates; actual results may differ materially. Investments are illiquid and may lose all their value. Returns are not guaranteed.',
    'Esta presentación es informativa. Toda inversión está sujeta a los documentos definitivos de oferta y membresía y a los requisitos de elegibilidad. Los estados financieros pro forma y los retornos objetivo son estimaciones no auditadas; los resultados reales pueden diferir sustancialmente. Las inversiones son ilíquidas y pueden perder todo su valor. Los rendimientos no están garantizados.',
  ],
  offeringTitle: ['The investment', 'La inversión'],
  offering: [
    'This presentation is informational and does not replace the definitive offering and membership documents, which govern eligibility, fees, carry, distributions and investor rights. It is not personalized investment, legal or tax advice. Consult your own advisers before investing.',
    'Esta presentación es informativa y no sustituye los documentos definitivos de oferta y membresía, que rigen la elegibilidad, las comisiones, el carry, las distribuciones y los derechos del inversionista. No constituye asesoría personalizada de inversión, legal ni tributaria. Consulte a sus propios asesores antes de invertir.',
  ],
  riskTitle: ['Capital at risk', 'Capital en riesgo'],
  risk: [
    'An investment in Dulcinea One is illiquid and involves the risk of partial or total loss. Property values, rental demand, renovation costs, exchange rates and the timing of sales may affect results. Returns, distributions and exit dates are not guaranteed.',
    'Una inversión en Dulcinea One es ilíquida e implica el riesgo de pérdida parcial o total. El valor de las propiedades, la demanda de alquiler, los costos de remodelación, los tipos de cambio y los plazos de venta pueden afectar los resultados. Los rendimientos, las distribuciones y las fechas de salida no están garantizados.',
  ],
  estimatesTitle: ['Projections and criteria', 'Proyecciones y criterios'],
  estimates: [
    'Pro forma financial statements and return targets are unaudited projections based on assumptions, not historical results. Criteria marked as met reflect estimates of anticipated results for each property and the portfolio as a whole, subject to underwriting and due diligence. They do not certify achieved results or guarantee future performance. Actual results may differ materially.',
    'Los estados financieros pro forma y los retornos objetivo son proyecciones no auditadas basadas en supuestos, no resultados históricos. Los criterios marcados como cumplidos reflejan estimaciones de resultados previstos para cada propiedad y para el portafolio en su conjunto, sujetas a evaluación y debida diligencia. No certifican resultados alcanzados ni garantizan resultados futuros. Los resultados reales pueden diferir sustancialmente.',
  ],
  benefitsTitle: ['Ownership and benefits', 'Participación y beneficios'],
  benefits: [
    'Fund membership does not convey direct title to a specific home. Property access, lifestyle benefits and equity kickers are subject to the definitive documents and their conditions. Illustrative or AI-generated property imagery does not establish current condition or promised improvements.',
    'La participación en el fondo no otorga propiedad directa sobre un inmueble específico. El acceso a las propiedades, los beneficios de estilo de vida y las participaciones adicionales están sujetos a los documentos definitivos y sus condiciones. Las imágenes ilustrativas o generadas con IA no acreditan el estado actual ni mejoras prometidas.',
  ],
  readMore: ['Read the full disclaimer ↗', 'Leer el aviso legal completo ↗'],
};
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function text(tag, key, locale, attributes = '') {
  const [en, es] = disclosures[key];
  return `<${tag}${attributes} data-en="${escape(en)}" data-es="${escape(es)}">${escape(locale === 'es' ? es : en)}</${tag}>`;
}
export function homeDisclosure(locale) {
  return `<section class="legal-notice" aria-labelledby="disclaimer-title">${text('h2', 'title', locale, ' id="disclaimer-title"')}<div>${text('p', 'entity', locale)}${text('p', 'summary', locale)}${text('a', 'readMore', locale, ' class="resource" data-path="disclaimer.html" href="disclaimer.html"')}</div></section>`;
}
export function fullDisclosure(locale) {
  return text('p', 'entity', locale, ' class="entity"') + ['offering', 'risk', 'estimates', 'benefits'].map(key => `<section>${text('h2', key + 'Title', locale)}${text('p', key, locale)}</section>`).join('\n');
}

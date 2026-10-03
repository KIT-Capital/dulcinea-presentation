import {renderLanguageSwitch, languageSwitchCss} from './language-switch.mjs';

const pages = [
  ['financial-statements', 'Financials', 'Finanzas'],
  ['investment-criteria', 'Criteria', 'Criterios'],
  ['specialists', 'Specialists', 'Especialistas'],
  ['disclaimer', 'Disclaimer', 'Aviso legal'],
];
const presentationSubjects = {
  'financial-statements': 'returns',
  'investment-criteria': 'idea',
  specialists: 'specialists',
  disclaimer: 'disclaimer',
};
const websiteDestinations = {
  'financial-statements': ['fund','Back to the fund','Volver al fondo'],
  'investment-criteria': ['homes','View the homes','Ver las propiedades'],
  specialists: ['specialists','Specialists on the website','Especialistas en el sitio web'],
  disclaimer: ['disclaimer-title','Disclaimer on the website','Aviso legal en el sitio web'],
};

export function renderInvestorReturn({name,locale='en',web=false}) {
  const spanish=locale==='es';
  const home=web?(spanish?'/es/':'/'):'index.html';
  const [anchor,en,es]=websiteDestinations[name];
  return `<a class="resource-context-return" href="${home}#${anchor}">${spanish?es:en} ↗</a>`;
}

export function renderInvestorNavigation({name, locale='en', web=false, logo}) {
  const spanish = locale === 'es';
  const home = web ? (spanish ? '/es/' : '/') : 'index.html';
  const resourcePrefix = web ? (spanish ? '/es/' : '/') : '';
  const englishPath = web ? `/${name}.html` : `${spanish ? '../' : ''}${name}.html`;
  const spanishPath = web ? `/es/${name}.html` : `${spanish ? '' : 'es/'}${name}.html`;
  const links = pages.map(([id,en,es]) => `<a href="${resourcePrefix}${id}.html"${id===name?' aria-current="page"':''}>${spanish?es:en}</a>`).join('');
  return `<div class="resource-navigation"><div class="resource-navigation-inner"><a class="resource-brand" href="${home}#home" aria-label="Dulcinea One — ${spanish?'Inicio':'Home'}"><img src="${logo}" alt="Dulcinea One" width="148" height="45"></a><nav class="resource-links" aria-label="${spanish?'Navegación principal':'Main navigation'}"><a class="resource-home" href="${home}#home">${spanish?'Inicio':'Home'}</a>${links}</nav><a class="resource-present" href="${home}#present-${presentationSubjects[name]}" aria-label="${spanish?'Abrir presentación':'Open presentation'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 4h18v12H3zM12 16v5M8 21h8"/><path d="m10 7 5 3-5 3z"/></svg><span>${spanish?'Presentar':'Present'}</span></a>${renderLanguageSwitch({englishPath,spanishPath,locale})}</div></div>`;
}

export const investorNavigationCss = `${languageSwitchCss}
  header.resource-header{padding:0 0 24px}
  .resource-navigation{background:#17282d;color:#fff;padding:0 clamp(22px,4vw,58px);font-family:Arial,Helvetica,sans-serif}
  .resource-navigation-inner{max-width:1320px;min-height:76px;margin:auto;display:flex;align-items:center;gap:24px}
  .resource-brand{display:block;flex-shrink:0;line-height:0;text-decoration:none}
  .resource-brand img{display:block;width:148px;height:45px;object-fit:contain}
  .resource-links{display:flex;align-items:center;justify-content:flex-end;gap:24px;flex:1;min-width:0}
  .resource-links a{font-size:12px;line-height:1.3;white-space:nowrap;padding:10px 0;text-decoration:none;border-bottom:1px solid transparent;color:#e2e8e5}
  .resource-links a[aria-current="page"]{color:#fff;border-color:#d4b342}
  .resource-links a:hover{color:#fff;border-color:#78bdd4}
  .resource-present{display:inline-flex;align-items:center;gap:7px;border:1px solid #ffffff45;padding:9px 11px;color:#fff;font-size:12px;line-height:1.3;text-decoration:none;white-space:nowrap}
  .resource-present svg{width:18px;height:18px;flex-shrink:0}
  .resource-present:hover{background:#ffffff0d;border-color:#78bdd4}
  .resource-navigation a:focus-visible{outline:2px solid #78bdd4;outline-offset:4px}
  .resource-navigation .locale-switch{margin-left:0!important}
  .resource-context-return{font-size:12px;line-height:1.5;align-self:center;white-space:nowrap}
  header.resource-header>.hero{max-width:1436px;margin:22px auto 0;padding-inline:clamp(22px,4vw,58px)}
  header.resource-header .eyebrow{font:500 10px/1.2 Arial,Helvetica,sans-serif;letter-spacing:.13em;margin:0 0 7px;text-transform:uppercase}
  header.resource-header h1{font:400 clamp(30px,3.2vw,44px)/1.12 Arial,Helvetica,sans-serif;letter-spacing:-.045em;margin:0}
  header.resource-header .hero p:last-child:not(.eyebrow){font-size:14px;line-height:1.5;margin-top:10px;max-width:760px}
  .resource-financials header.resource-header{padding-bottom:24px}
  .resource-financials main>section:first-child{padding-top:30px}
  .resource-financials .section-nav a{padding-block:16px}
  .resource-specialists header.resource-header{padding-bottom:18px}
  .resource-disclaimer header.resource-header h1{font-size:clamp(30px,3vw,40px)}
  @media(min-width:961px){
    .resource-criteria header.resource-header{padding-bottom:14px}
    .resource-criteria header.resource-header>.hero{margin-top:14px}
    .resource-criteria header.resource-header h1{font-size:34px}
    .resource-criteria header.resource-header .eyebrow{margin-bottom:4px}
    .resource-criteria header.resource-header .hero p:last-child{font-size:12px;line-height:1.4;margin:0 0 2px;max-width:480px}
  }
  @media(max-width:1000px){.resource-navigation-inner{gap:18px}.resource-links{gap:16px}.resource-brand img{width:132px;height:40px}.resource-present{gap:5px;padding:8px}.resource-present svg{width:16px}}
  @media(max-width:800px){
    .resource-navigation-inner{min-height:0;padding-block:12px;flex-wrap:wrap;gap:8px 18px}
    .resource-links{order:4;flex:1 0 100%;justify-content:flex-start;gap:24px;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:1px}
    .resource-links a{font-size:12px;padding:8px 0}
    .resource-present{margin-left:auto}
    .resource-brand img{width:124px;height:38px}
    header.resource-header>.hero{margin-top:20px}
    header.resource-header .hero p:last-child:not(.eyebrow){font-size:13px;margin-top:10px}
  }
  @media(max-width:420px){.resource-navigation-inner{gap:8px 12px}.resource-navigation{padding-inline:20px}.resource-links{gap:21px}.resource-present span{display:none}.resource-present svg{width:18px;height:18px}.resource-present{padding:8px}.resource-navigation .locale-switch{gap:1px}.resource-navigation .locale-switch a{padding-inline:5px}}
  @media print{.resource-navigation{display:none}header.resource-header{padding:0 0 18px}header.resource-header>.hero{margin:0;padding:0}header.resource-header h1{font-size:30px}}
`;

export const investorNavigationScript = `document.querySelectorAll('.locale-switch a').forEach(link=>link.addEventListener('click',()=>{const next=new URL(link.href);next.hash=location.hash;link.href=next.href;}));`;

// One locally hosted family for the independently deployed review site.
export function investorFontCss(url) {
 return `@font-face{font-family:Manrope;src:url("${url}") format("woff2");font-style:normal;font-weight:200 800;font-display:swap}:root{--font-investor:Manrope,Arial,Helvetica,sans-serif}html,body{font-family:var(--font-investor)}:is(h1,h2,h3,h4,p,dt,dd,a,button,input,select,textarea,.micro,.primary,.line-link,.present-launch){font-family:var(--font-investor)}button,input,select,textarea{font-size:inherit}h1,h2,h3{text-wrap:balance}p{text-wrap:pretty}`;
}

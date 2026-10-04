import investor from './worker.mjs';
const encoder=new TextEncoder();
const TTL=8*60*60;
const cookieName='__Host-dulcinea_review';
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const un64=value=>Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function secured(body,status=200,extra={}){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; form-action 'self'; base-uri 'none'",...extra}});}
function nextPath(value){try{const url=new URL(value,'https://preview.invalid');return value?.startsWith('/')&&!value.startsWith('//')&&!/[\\\r\n]/.test(value)&&url.origin==='https://preview.invalid'&&!url.pathname.startsWith('/preview-')?url.pathname+url.search:'/';}catch{return '/';}}
async function key(env){return crypto.subtle.importKey('raw',encoder.encode('review-only:'+env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function token(env){const p=b64(encoder.encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+TTL,nonce:crypto.randomUUID()})));return p+'.'+b64(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(p)));}
async function valid(req,env){try{const cookie=(req.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1)||'';if(cookie.length>1024)return false;const [p,s,...rest]=cookie.split('.');if(!p||!s||rest.length||!/^[A-Za-z0-9_-]+$/.test(p+s))return false;if(!await crypto.subtle.verify('HMAC',await key(env),un64(s),encoder.encode(p)))return false;const exp=JSON.parse(new TextDecoder().decode(un64(p))).exp;const now=Math.floor(Date.now()/1000);return Number.isInteger(exp)&&exp>now&&exp<=now+TTL;}catch{return false;}}
async function samePassword(a,b){const [x,y]=await Promise.all([a,b].map(s=>crypto.subtle.digest('SHA-256',encoder.encode(s))));const u=new Uint8Array(x),v=new Uint8Array(y);let delta=0;for(let i=0;i<u.length;i++)delta|=u[i]^v[i];return delta===0;}
function gate(next='/',es=false,error=''){
 const label=es?'Versión para revisión':'Design review';
 return `<!doctype html><html lang="${es?'es':'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Dulcinea | ${label}</title><style>*{box-sizing:border-box}body{margin:0;background:#78bdd4;color:#17282d;font:18px/1.5 Arial,sans-serif;min-height:100svh;display:grid;place-items:center;padding:24px}main{width:min(100%,480px);background:#f4f5ef;padding:clamp(28px,5vw,52px)}img{width:190px;height:70px;object-fit:contain;background:transparent;padding:0}nav{display:flex;justify-content:flex-end;gap:14px;font-size:14px;margin-bottom:28px}a{color:inherit}h1{font-size:36px;line-height:1.1;letter-spacing:-.04em;font-weight:500;margin:28px 0 14px}p{font-size:18px;margin:0 0 26px}label{display:block;font-weight:600}input{font:inherit;width:100%;padding:14px;margin:8px 0 20px;border:1px solid #788983;background:#fff}button{background:#d4af37;color:#17282d;font:600 18px Arial;width:100%;padding:16px;border:0;cursor:pointer;transition:background .2s,transform .2s}button:hover{background:#cfb53b;transform:translateY(-2px)}button:active{transform:translateY(1px)}:focus-visible{outline:3px solid #009b74;outline-offset:4px}.error{color:#8b2035;font-size:16px}.original{display:block;margin-top:24px;font-size:16px}</style><main><nav aria-label="Language"><a href="/preview-login?next=${encodeURIComponent(next)}&lang=en" lang="en">🇺🇸 EN</a><a href="/preview-login?next=${encodeURIComponent(next)}&lang=es" lang="es">🇨🇴 ES</a></nav><img src="/gate-assets/logo.svg" alt="Dulcinea"><h1>${label}</h1><p>${es?'Una segunda versión independiente. El sitio actual sigue disponible.':'A separate version for comparison. The current website remains available.'}</p>${error?`<p class="error" role="alert">${escape(error)}</p>`:''}<form method="post" action="/preview-login"><input type="hidden" name="next" value="${escape(next)}"><input type="hidden" name="lang" value="${es?'es':'en'}"><label for="password">${es?'Contraseña de revisión':'Review password'}</label><input id="password" name="password" type="password" required autocomplete="current-password"><button type="submit">${es?'Abrir la versión':'Open preview'}</button></form><a class="original" href="https://invest.dulcineainvestments.org/">${es?'Ver el sitio actual':'View current website'} ↗</a></main></html>`;
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);const es=url.searchParams.get('lang')==='es'||url.pathname.startsWith('/es/');
 const publicReview=env.REVIEW_PUBLIC==='true';
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))return secured('HTTPS required',400);
 if(url.pathname==='/robots.txt')return secured(request.method==='HEAD'?null:'User-agent: *\nDisallow: /\n',200,{'Content-Type':'text/plain'});
 if(!publicReview&&(!env.REVIEW_PASSWORD||env.REVIEW_PASSWORD.length<16||!env.SESSION_SECRET||env.SESSION_SECRET.length<32))return secured('Preview access is unavailable.',503);
 if(url.pathname==='/gate-assets/logo.svg'&&['GET','HEAD'].includes(request.method))return investor.fetch(request,env,ctx);
 if(url.pathname==='/preview-login'){
   const next=nextPath(url.searchParams.get('next')||'/');
   if(publicReview)return secured(null,303,{Location:next});
   if(request.method==='GET')return secured(gate(next,es));
   if(request.method!=='POST')return secured('Method not allowed',405,{Allow:'GET, POST'});
   if(request.headers.get('Origin')!==url.origin)return secured('Use the preview sign-in form.',403);
   if(!env.REVIEW_LIMITER)return secured('Preview access unavailable.',503);
   const allowed=await env.REVIEW_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
   if(!allowed.success)return secured('Please wait before trying again.',429,{'Retry-After':'60'});
   if(Number(request.headers.get('Content-Length')||0)>4096||!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return secured('Invalid form',400);
   const reader=request.body?.getReader();let length=0;const pieces=[];if(!reader)return secured('Invalid form',400);
   for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>4096){await reader.cancel();return secured('Invalid form',413);}pieces.push(value);}
   const data=new Uint8Array(length);let offset=0;for(const piece of pieces){data.set(piece,offset);offset+=piece.length;}
   const form=new URLSearchParams(new TextDecoder().decode(data));const spanish=form.get('lang')==='es';const target=nextPath(form.get('next')||'/');
   if(!await samePassword(form.get('password')||'',env.REVIEW_PASSWORD))return secured(gate(target,spanish,spanish?'Contraseña incorrecta.':'Incorrect password.'),401);
   return secured(null,303,{Location:target,'Set-Cookie':`${cookieName}=${await token(env)}; Path=/; HttpOnly; Secure; SameSite=Strict`});
 }
 if(url.pathname==='/preview-logout'){
   if(request.method!=='POST'||request.headers.get('Origin')!==url.origin)return secured('Use the preview sign-out form.',403);
   const response=secured(null,303,{Location:publicReview?'/':'/preview-login','Set-Cookie':`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
   response.headers.append('Set-Cookie','__Host-dulcinea_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
   return response;
 }
 if(!publicReview&&!await valid(request,env))return secured(null,302,{Location:'/preview-login?next='+encodeURIComponent(url.pathname+url.search)});
 // Inner financial gate retains its own isolated secrets and checks. No fetch,
 // database, production service binding or contact automation is added here.
 const response=await investor.fetch(request,env,ctx);
 const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow, noarchive');headers.set('Cache-Control','private, no-store');headers.set('Referrer-Policy','same-origin');
 if(url.pathname==='/login'&&headers.get('Content-Type')?.includes('text/html')){
   const body=(await response.text()).replace(/href="(?:mailto:|tel:|https:\/\/wa\.me\/)[^"]*"/g,'href="#" aria-disabled="true" title="Contact is disabled in this review"');
   headers.delete('Content-Length');headers.delete('ETag');
   return new Response(body,{status:response.status,headers});
 }
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}};

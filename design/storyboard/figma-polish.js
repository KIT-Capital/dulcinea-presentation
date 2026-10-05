const state={"createdNodeIds":["0:1","4:27","4:28","4:29","4:30","4:31","4:32"],"variables":{"ink":"VariableID:4:3","paper":"VariableID:4:4","white":"VariableID:4:5","blue":"VariableID:4:6","pink":"VariableID:4:7","violet":"VariableID:4:8","green":"VariableID:4:9","gold":"VariableID:4:10","mint":"VariableID:4:11"},"spaces":{"8":"VariableID:4:12","16":"VariableID:4:13","24":"VariableID:4:14","32":"VariableID:4:15","40":"VariableID:4:16","48":"VariableID:4:17","64":"VariableID:4:18","96":"VariableID:4:19","128":"VariableID:4:20"},"styles":{"display":"S:d15d4d64112ada435fefac4f30d5c14126e8b700,","heading":"S:5951405a7af044327d780716cb33f23a70420e65,","subtitle":"S:b98a9605324a676c22347daa8f29dce9617a518b,","body":"S:cc873097e8a1a959ed8457b1ac7c1a564df854bc,","small":"S:9923a6e15232c96679589f84a1a5beaf6e973454,","label":"S:1dc235213748da34eccc7ab4e5ddbe3f27210290,"},"collectionId":"VariableCollectionId:4:2","roots":{"overview":"4:27","homepage":"4:28","slides":"4:29","components":"4:30"},"cta":{"id":"4:31","labelProp":"Label#4:0"},"bounds":[{"id":"4:27","name":"01 · Seven-chapter story / START HERE","x":1450,"y":100,"width":2280,"height":100},{"id":"4:28","name":"02 · Homepage storyboard / Read down","x":1450,"y":1850,"width":1840,"height":100},{"id":"4:29","name":"03 · Presentation / 18-slide contact sheet","x":3490,"y":1850,"width":2136,"height":100},{"id":"4:30","name":"04 · Reusable elements","x":5860,"y":100,"width":560,"height":57}]};
const H={"medellin.jpg":"b635bc0a9eef4c4ff5b7b49f9eb7bff64f544708","reservoir.jpg":"9d3e1354185b5a38ec88d7b524ce9745908bc5e6","oriente-country.jpg":"39f26ce15c1657f4c388335f02dfad3c45965318","el-retiro.jpg":"493d01f96e603bea1326ad62653e046151c7d1ac","location.jpg":"931d2ab14d0656fa5425794f39a62584a4fd1a10","city-driving.jpg":"a3d8f423fcfeff783cb0bb91d6f176ba40a80d01","nightlife.jpg":"9bc013f8f4199c7fb5987b2968535c39809e84af","hospitality.jpg":"64732df1a011a78f3e5c192eb96f59a3d64eab1e","lifestyle.jpg":"b387258b0e21079204b90bcec0dd6aab95b48010","closing.jpg":"3e7c4953bda9079bd6dbd7f9fc126c261993aa76","guatape-couple.jpg":"b2f611bd3bc56b0b2a01180fa2d723015f1abc66","monte-sereno-original.png":"a0f82fd606f5d10fb56277916660fc023e98e7ad","montana-original.png":"791d5a16a62936192c7a310c2ee379673465a14a","fontanar-original.jpeg":"369461653f964845770d0a6d307ebb2ff9af6347","san-lucas-original.png":"6c810c029a8fcad96a4dbd9b28ed1113c5fa9455","aires-original.png":"090ffb1e862058451a35e7d389f305802261f91f","dov.png":"c70232470ce1e44a6d4464d84fcee7fec0381628","ricardo.jpg":"af96b148ce0754ba998527bc24a97f639a0d22ac","adriana.jpg":"9e437fb781308dd9ad2d4b63a87a947a9a7be660","natalia.png":"def29b65cfa417148ad2ed0a7b6af325df126555","lola.png":"db4d4831a93e64ccfbd087ca3c6dc9d987ad5957","kit.png":"3e5743dd0c4e4ca9361ccfa7f00a419830af3a88"};
const ids=[], pending=[];
await Promise.all(['Regular','Medium','SemiBold'].map(style=>figma.loadFontAsync({family:'Manrope',style})));
const page=await figma.getNodeByIdAsync('0:1');await figma.setCurrentPageAsync(page);
const entries=await Promise.all(Object.entries({...state.variables,...Object.fromEntries(Object.entries(state.spaces).map(([n,v])=>['s'+n,v]))}).map(async([k,v])=>[k,await figma.variables.getVariableByIdAsync(v)]));
const V=Object.fromEntries(entries);
const mark=n=>(ids.push(n.id),n);
function paint(key,opacity=1){const p=figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',V[key]);p.opacity=opacity;return p;}
function al(parent,name,w,{direction='VERTICAL',gap=24,pad=0,bg=null}={}){
const n=mark(figma.createAutoLayout(direction));n.name=name;parent.appendChild(n);n.resize(w,100);n.layoutSizingHorizontal='FIXED';n.layoutSizingVertical='HUG';n.primaryAxisAlignItems='MIN';n.counterAxisAlignItems='MIN';n.itemSpacing=gap;if(V['s'+gap])n.setBoundVariable('itemSpacing',V['s'+gap]);for(const p of ['paddingLeft','paddingRight','paddingTop','paddingBottom']){n[p]=pad;if(V['s'+pad])n.setBoundVariable(p,V['s'+pad]);}n.fills=bg?[paint(bg)]:[];return n;
}
const typography={display:[72,'Medium',78],heading:[48,'Medium',54],subtitle:[28,'SemiBold',36],body:[22,'Regular',32],small:[16,'Regular',23],label:[14,'SemiBold',20]};
function tx(parent,text,w,style='body',color='ink'){const n=mark(figma.createText());n.name=text.slice(0,70);n.fontName={family:'Manrope',style:typography[style][1]};n.fontSize=typography[style][0];n.lineHeight={unit:'PIXELS',value:typography[style][2]};n.characters=text;n.fills=[paint(color)];parent.appendChild(n);n.resize(w,10);n.textAutoResize='HEIGHT';pending.push(n.setTextStyleIdAsync(state.styles[style]));return n;}
function im(parent,key,w,h,mode='FILL'){if(!H[key])throw Error('Missing asset '+key);const n=mark(figma.createRectangle());n.name='Asset / '+key;parent.appendChild(n);n.resize(w,h);n.fills=[{type:'IMAGE',imageHash:H[key],scaleMode:mode}];return n;}
function line(parent,w,color='ink'){const n=mark(figma.createRectangle());parent.appendChild(n);n.resize(w,1);n.fills=[paint(color,.2)];return n;}
async function cta(parent,label){const main=await figma.getNodeByIdAsync(state.cta.id);const n=mark(main.createInstance());parent.appendChild(n);n.setProperties({[state.cta.labelProp]:label+' →'});return n;}
function report(root){const all=root.findAll(()=>true);const types={};for(const n of all)types[n.type]=(types[n.type]||0)+1;return {id:root.id,name:root.name,width:root.width,height:root.height,descendants:all.length,types};}

const palette={ink:'#17282d',paper:'#f4f5ef',white:'#ffffff',blue:'#78bdd4',pink:'#fb90a2',violet:'#b085b7',green:'#009b74',gold:'#cfb53b',mint:'#d9eee4'};
const byId=Object.fromEntries(Object.entries(state.variables).map(([k,id])=>[id,palette[k]]));
const roots=await Promise.all(Object.values(state.roots).map(id=>figma.getNodeByIdAsync(id)));
for(const root of roots)for(const n of [root,...root.findAll(()=>true)]){
if(!Array.isArray(n.fills))continue;
let changed=false;
const fills=n.fills.map(p=>{
 if(p.type==='SOLID'&&p.boundVariables?.color&&byId[p.boundVariables.color.id]){const h=byId[p.boundVariables.color.id];changed=true;return {...p,color:{r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255}};}
 if(p.type==='IMAGE'&&['dov.png','ricardo.jpg','adriana.jpg','natalia.png'].some(k=>p.imageHash===H[k])){changed=true;return {...p,scaleMode:'FIT',filters:{...p.filters,saturation:-1,contrast:.04}};}
 return p;});
if(changed){n.fills=fills;ids.push(n.id);}
}
for(const id of ['6:48','6:250']){const n=await figma.getNodeByIdAsync(id);n.fills=[...n.fills].reverse();ids.push(n.id);}
const cityImage=await figma.getNodeByIdAsync('6:92');cityImage.fills=[{type:'IMAGE',imageHash:H['lifestyle.jpg'],scaleMode:'FILL'}];cityImage.name='Asset / lifestyle.jpg';ids.push(cityImage.id);
const cityLabel=await figma.getNodeByIdAsync('6:93');cityLabel.characters='MEDELLÍN / Time with friends';ids.push(cityLabel.id);
const slideRoot=roots.find(r=>r.id===state.roots.slides);
const slideNodes=slideRoot.findAllWithCriteria({types:['INSTANCE']}).filter(n=>/^\d{2} ·/.test(n.name));
for(const n of slideNodes){const title=n.findAllWithCriteria({types:['TEXT']}).find(t=>t.name==='Slide title');if(n.name.startsWith('01')&&title){const at=title.characters.indexOf('One');title.setRangeFills(at,at+3,[paint('gold')]);ids.push(title.id);}}
const boardIds=['6:48','6:69','6:99','6:123','6:165','6:209','6:250'];
const overview=roots.find(r=>r.id===state.roots.overview);
const cards=overview.findAllWithCriteria({types:['INSTANCE']});
cards.forEach((n,i)=>{const text=n.findAllWithCriteria({types:['TEXT']}).find(t=>t.componentPropertyReferences?.characters&&t.characters.includes('→'));if(text){text.setRangeHyperlink(0,text.characters.length,{type:'URL',value:'https://www.figma.com/design/TSa7o009bLZpjJI6d7GBym?node-id='+boardIds[i].replace(':','-')});ids.push(text.id);}});
const capture=await figma.getNodeByIdAsync('2:2');const removedId=capture.id;capture.remove();
figma.viewport.scrollAndZoomIntoView([overview]);
return {mutatedNodeIds:ids,removedNodeIds:[removedId],roots:roots.map(report),font:'Manrope',changes:['Correct token paint fallback colors','Image scrims above cover films','Consistent monochrome portrait styling and uncropped heads','People image in urban scene','Gold One title','Chapter links to detailed boards','Removed temporary asset capture']};

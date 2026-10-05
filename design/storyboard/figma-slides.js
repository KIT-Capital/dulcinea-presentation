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

const root=await figma.getNodeByIdAsync(state.roots.slides);root.fills=[paint('paper')];root.itemSpacing=32;for(const p of ['paddingLeft','paddingTop','paddingRight','paddingBottom'])root[p]=64;
tx(root,'PRESENTATION / THE SAME STORY IN 18 SLIDES',2008,'label');
tx(root,'One narrative.\nTwo ways to explore it.',1980,'display');
tx(root,'The website lets the reader explore. Presentation mode makes the same case in a controlled sequence. All five properties receive their own slide.',1910,'body');
const host=await figma.getNodeByIdAsync(state.roots.components);
const c=mark(figma.createComponent());host.appendChild(c);c.name='Storyboard / Slide';c.layoutMode='VERTICAL';c.resize(648,365);c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.itemSpacing=0;c.clipsContent=true;c.fills=[paint('paper')];c.description='16:9 contact-sheet slide. Editable title, short copy, slide number and discrete original image.';
im(c,'medellin.jpg',648,176);
const cp=al(c,'Slide copy',648,{pad:24,gap:8});
const props={};for(const [key,value,sty]of [['Sequence','01 / DULCINEA ONE','label'],['Title','Slide title','subtitle'],['Copy','Slide copy','small']]){const t=tx(cp,value,600,sty);const prop=c.addComponentProperty(key,'TEXT',value);t.componentPropertyReferences={characters:prop};props[key]=prop;}
const slides=[["01","Dulcinea One","Invest in homes you can also use.\\nFive selected homes in Medellín and El Oriente.","medellin.jpg","ink"],["02","Make time for life here","Time with friends, days in the country and evenings in the city.","lifestyle.jpg","mint"],["03","El Oriente","Gardens, terraces and room outdoors.\\nTwo country homes in El Retiro.","reservoir.jpg","mint"],["04","Medellín and El Poblado","Modern city life, restaurants, music and clubs.\\nThree selected properties in El Poblado.","city-driving.jpg","blue"],["05","Lola & Ber","A sex-positive brand for open-minded adults.\\nConsent, respect and privacy come first.","hospitality.jpg","pink"],["06","Membership","Up to 365 shared nights annually when all homes operate.\\n3% collective Lola & Ber stake at full subscription.","lifestyle.jpg","pink"],["07","Casa Monte Sereno","El Retiro · 420 m² · 2,940 m² lot\\nNegotiated · Finalizing modifications","monte-sereno-original.png","paper"],["08","Casa Montana","El Retiro · 591 m²\\nNegotiated · Works being budgeted","montana-original.png","paper"],["09","Fontanar 201","El Poblado · 389 m² · Two-level penthouse\\nClosed · 3Q26","fontanar-original.jpeg","paper"],["10","San Lucas 101","El Poblado · 325 m²\\nNegotiated · Compraventa drafted","san-lucas-original.png","paper"],["11","Aires de Campestre","El Poblado · 489 m² · Two-level penthouse\\nClosed · 3Q26","aires-original.png","paper"],["12","How Dulcinea operates","Acquire → Improve → Rent → Sell\\nYou invest in the portfolio.","fontanar-original.jpeg","violet"],["13","The core team","Dov Tuzman · Ricardo Cidale\\nAdriana Suárez · Natalia Carvajal",null,"violet"],["14","Local specialists","Architecture and works · Works oversight\\nLegal · Accounting and tax",null,"violet"],["15","Projected returns","14.6% investor IRR · 1.40× capital multiple · 4 years\\nAfter tax and carry; projected on called capital.",null,"blue"],["16","The offer","$7M total · $2.1M committed · $4.9M open\\nMinimum $100,000; Year 1 installments.",null,"blue"],["17","Disclosures","Private investment. Capital at risk. Projections and member benefits are subject to definitive documents.",null,"paper"],["18","Talk to us","Dov Tuzman\\nFounder and Managing Partner, KIT Capital","closing.jpg","ink"]];
const nodes=[];
for(let rowIndex=0;rowIndex<6;rowIndex++){const row=al(root,'Slides '+(rowIndex*3+1)+'–'+(rowIndex*3+3),2008,{direction:'HORIZONTAL',gap:32});
for(const data of slides.slice(rowIndex*3,rowIndex*3+3)){
 let n;
 if(data[3]){
 n=mark(c.createInstance());row.appendChild(n);n.name=data[0]+' · '+data[1];n.fills=[paint(data[4])];
 n.setProperties({[props.Sequence]:data[0]+' / DULCINEA ONE',[props.Title]:data[1],[props.Copy]:data[2].replace(/\\n/g,'\n')});
 const img=n.findAllWithCriteria({types:['RECTANGLE']})[0];img.fills=[{type:'IMAGE',imageHash:H[data[3]],scaleMode:'FILL'}];ids.push(img.id);
 for(const t of n.findAllWithCriteria({types:['TEXT']})){t.fills=[paint(data[4]==='ink'?'white':'ink')];ids.push(t.id);}
 }else{
 n=al(row,data[0]+' · '+data[1],648,{pad:32,gap:16,bg:data[4]});n.resize(648,365);n.layoutSizingVertical='FIXED';n.clipsContent=true;
 tx(n,data[0]+' / DULCINEA ONE',584,'label');tx(n,data[1],584,'subtitle');
 if(data[0]==='13'){
 const tr=al(n,'Four core portraits',584,{direction:'HORIZONTAL',gap:16});
 for(const key of ['dov.png','ricardo.jpg','adriana.jpg','natalia.png'])im(tr,key,134,122);
 tx(n,data[2].replace(/\\n/g,'\n'),584,'small');
 }else if(data[0]==='14'){
 tx(n,'Marcela Vélez & María Antonia Uribe\nJohn Mario Piedrahita\nJuan Carlos Pérez · Jorge Valiente',584,'body');
 tx(n,data[2].replace(/\\n/g,'\n'),584,'small');
 }else if(data[0]==='15'){
 tx(n,'14.6%    1.40×    4',584,'heading');
 tx(n,'Investor IRR          Capital multiple          Years',584,'small');
 tx(n,'Projected on called capital, after tax and carry. Returns are not guaranteed. Proposed 20% carry follows capital return.',584,'small');
 }else if(data[0]==='16'){
 tx(n,'$7M / $2.1M / $4.9M',584,'heading');
 tx(n,'Total           Committed           Open',584,'small');
 tx(n,'Minimum $100,000 · 10 units at $10,000\nCapital installments during Year 1. Accredited investors only.',584,'small');
 }else{
 tx(n,data[2],584,'body');tx(n,'The finished slide retains the complete approved disclosure. This contact-sheet wording is a summary only.',584,'small');
 }
 }
 nodes.push({id:n.id,number:data[0],name:n.name,width:n.width,height:n.height});
}}
line(root,2008);
tx(root,'OPTIONAL EXPLORATION  /  Booking detail and Guatapé remain outside the main slide count, returning to the originating chapter. Every property keeps gallery and plan access. Every slide keeps a route back to the website.',1970,'small');
tx(root,'STORYBOARD STATUS  /  Copy, imagery and chapter composition for review. Motion is specified in the homepage notes; video frames shown here are stills. Website implementation and deployment follow separately.',1970,'small');
await Promise.all(pending);
return {createdNodeIds:ids,mutatedNodeIds:[root.id],slideComponent:{id:c.id,props},slides:nodes,report:report(root)};

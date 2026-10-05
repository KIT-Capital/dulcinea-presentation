await figma.loadFontAsync({family:'Manrope',style:'Regular'});
await figma.loadFontAsync({family:'Manrope',style:'Medium'});
await figma.loadFontAsync({family:'Manrope',style:'SemiBold'});
const page=await figma.getNodeByIdAsync('0:1');
await figma.setCurrentPageAsync(page);
page.name='Dulcinea One · Storyboard';
const ids=[page.id];
const collection=figma.variables.createVariableCollection('Dulcinea / Storyboard');
collection.renameMode(collection.defaultModeId,'Brand');
const palette={ink:'#17282d',paper:'#f4f5ef',white:'#ffffff',blue:'#78bdd4',pink:'#fb90a2',violet:'#b085b7',green:'#009b74',gold:'#cfb53b',mint:'#d9eee4'};
const vars={};
for(const [name,hex]of Object.entries(palette)){
const v=figma.variables.createVariable('color/'+name,collection,'COLOR');
v.setValueForMode(collection.defaultModeId,{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255,a:1});
v.scopes=['ALL_FILLS','STROKE_COLOR'];v.setVariableCodeSyntax('WEB','var(--'+name+')');vars[name]=v.id;
}
const spaces={};
for(const n of [8,16,24,32,40,48,64,96,128]){
const v=figma.variables.createVariable('space/'+n,collection,'FLOAT');v.setValueForMode(collection.defaultModeId,n);v.scopes=['GAP'];v.setVariableCodeSyntax('WEB','var(--space-'+n+')');spaces[n]=v.id;
}
const styles={};
for(const [n,size,weight,line]of [['display',72,'Medium',78],['heading',48,'Medium',54],['subtitle',28,'SemiBold',36],['body',22,'Regular',32],['small',16,'Regular',23],['label',14,'SemiBold',20]]){
const s=figma.createTextStyle();s.name='Dulcinea/'+n;s.fontName={family:'Manrope',style:weight};s.fontSize=size;s.lineHeight={unit:'PIXELS',value:line};styles[n]=s.id;
}
function wrapper(name,x,y,w){const f=figma.createAutoLayout('VERTICAL');f.name=name;f.resize(w,100);f.layoutSizingHorizontal='FIXED';f.layoutSizingVertical='HUG';f.x=x;f.y=y;f.fills=[];f.itemSpacing=48;ids.push(f.id);return f;}
const overview=wrapper('01 · Seven-chapter story / START HERE',1450,100,2280);
const homepage=wrapper('02 · Homepage storyboard / Read down',1450,1850,1840);
const slides=wrapper('03 · Presentation / 18-slide contact sheet',3490,1850,2136);
const components=wrapper('04 · Reusable elements',5860,100,560);
const c=figma.createComponent();c.name='Dulcinea / Continue';c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='AUTO';c.paddingTop=16;c.paddingBottom=16;c.paddingLeft=24;c.paddingRight=24;c.fills=[{type:'SOLID',color:{r:23/255,g:40/255,b:45/255}}];components.appendChild(c);ids.push(c.id);
const t=figma.createText();t.fontName={family:'Manrope',style:'SemiBold'};t.fontSize=18;t.characters='Continue →';t.fills=[{type:'SOLID',color:{r:1,g:1,b:1}}];c.appendChild(t);ids.push(t.id);
const prop=c.addComponentProperty('Label','TEXT','Continue →');t.componentPropertyReferences={characters:prop};c.description='Primary chapter continuation. One per chapter; maps to existing website anchors.';
return {createdNodeIds:ids,variables:vars,spaces,styles,collectionId:collection.id,roots:{overview:overview.id,homepage:homepage.id,slides:slides.id,components:components.id},cta:{id:c.id,labelProp:prop},bounds:[overview,homepage,slides,components].map(n=>({id:n.id,name:n.name,x:n.x,y:n.y,width:n.width,height:n.height}))};

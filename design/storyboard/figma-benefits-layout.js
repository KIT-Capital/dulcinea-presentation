// Figma Plugin API layout repair after figma-benefits-revision.js.
// Historical execution record; inspect current nodes before reuse.
{
const old=await figma.getNodeByIdAsync('7:92');
const slide=old.detachInstance();slide.name='06 · Membership terms';
const im=slide.children[0];im.resize(648,96);
const cp=slide.children[1];cp.paddingTop=20;cp.paddingBottom=20;
}
// Result: slide 20:116; image 20:117; copy 20:118.
// Final polish ran separately after inspecting the rendered contact sheet:
await Promise.all(['Regular','Medium','SemiBold'].map(style=>figma.loadFontAsync({family:'Manrope',style})));const one=await figma.getNodeByIdAsync('7:61');one.setProperties({'Copy#7:2':'You can invest in homes and stay with family and friends in Medellín and El Oriente. Stays begin as each home opens.'});const slide=await figma.getNodeByIdAsync('20:116');const image=await figma.getNodeByIdAsync('20:117');image.visible=false;const cp=await figma.getNodeByIdAsync('20:118');cp.paddingTop=32;cp.paddingBottom=32;cp.paddingLeft=32;cp.paddingRight=32;for(const t of cp.children.filter(n=>n.type==='TEXT')){t.resize(584,t.height);t.textAutoResize='HEIGHT';}const body=cp.children.find(n=>n.type==='TEXT'&&n.characters.startsWith('The shared pool'));body.fontSize=18;body.lineHeight={unit:'PIXELS',value:27};body.paragraphSpacing=12;return {changedNodeIds:[one.id,image.id,cp.id,...cp.children.map(n=>n.id)],bounds:[{id:one.id,height:one.height,children:one.children.map(n=>({id:n.id,y:n.y,h:n.height}))},{id:slide.id,height:slide.height,copyHeight:cp.height}]};

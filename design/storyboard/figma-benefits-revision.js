// Focused Figma Plugin API revision, 4 October 2026.
// Apply to TSa7o009bLZpjJI6d7GBym after inspecting existing nodes. Not a rebuild command.
await Promise.all(['Regular','Medium','SemiBold'].map(style=>figma.loadFontAsync({family:'Manrope',style})));
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('0:1'));
const changed=[], created=[];
const node=id=>figma.getNodeByIdAsync(id);
async function text(id,copy){const n=await node(id);n.characters=copy;changed.push(id);return n;}
async function props(id,values){const n=await node(id);n.setProperties(values);changed.push(id);return n;}
const color=(r,g,b)=>[{type:'SOLID',color:{r:r/255,g:g/255,b:b/255}}];
function frame(parent,name,w,gap=16,direction='VERTICAL'){
  const n=figma.createFrame();parent.appendChild(n);n.name=name;n.layoutMode=direction;n.resize(w,100);
  n.layoutSizingHorizontal='FIXED';n.layoutSizingVertical='HUG';n.itemSpacing=gap;n.fills=[];created.push(n.id);return n;
}
function label(parent,copy,w,size=22,style='Regular',light=false){
  const n=figma.createText();parent.appendChild(n);n.fontName={family:'Manrope',style};n.fontSize=size;
  n.lineHeight={unit:'PIXELS',value:size===16?23:size===18?27:size===28?36:32};n.characters=copy;
  n.resize(w,10);n.textAutoResize='HEIGHT';n.fills=light?color(244,245,239):color(23,40,45);n.name=copy.slice(0,60);created.push(n.id);return n;
}
await text('5:4','Dulcinea One Storyboard');
await text('5:5','Lead with life for members, family and friends. Show home use, Lola & Ber equity and future-fund carry early; explain projected returns after the homes and team.');
const chapters=[
 ['5:14','Stay in Medellín\nand El Oriente.','Show what membership adds to life with family and friends. Introduce home use, brand equity and future-fund carry before returns.'],
 ['5:21','Medellín and\nEl Oriente','Show how members can spend time with family and friends in the country and city, with homes as their base.'],
 ['5:28','Member benefits','Explain home use first, Lola & Ber equity at no additional capital contribution second, and conditional pro-rata future-fund carry third.'],
 ['5:35','The homes','Show two country homes and three city properties. Let readers explore status, original photos, films and supplied plans.'],
 ['5:43','How Dulcinea works','Dulcinea handles acquisition, renovation, rentals and resale. Show the core team and specialists responsible for execution.'],
 ['5:50','Projected returns','Show 14.6% / 1.40× / 4 years as one projected return group. Follow with the US$7M / US$2.1M / US$4.9M offer.'],
 ['5:57','Talk to us','Invite a conversation with Dov about the homes, member benefits and investment. Keep financials, criteria and disclosures accessible.']
];
for(const [id,headline,purpose] of chapters)await props(id,{'Headline#5:1':headline,'Purpose#5:2':purpose});
await text('5:66','Let each chapter\nanswer one question.');
await text('6:45','Homepage sequence');
await text('6:46','Begin with life and member benefits. Destination scenes lead to the homes and team; projections and the offer follow.');
await text('6:63','Stay in Medellín\nand El Oriente.');
await text('6:64','Spend time with family and friends as each home opens. Dulcinea One combines a real estate investment with homes members can use.');
(await node('6:64')).resize(800,96);
(await node('6:64')).textAutoResize='HEIGHT';
await text('6:67','Home use starts as properties open and follows booking availability. All benefits are subject to membership terms.');
const hero=await node('6:48');
if(hero.children.some(n=>n.name==='Opening / Three member benefits'))throw Error('Benefit row already exists; inspect before rerunning.');
const benefits=frame(hero,'Opening / Three member benefits',1312,32,'HORIZONTAL');
hero.insertChild(hero.children.indexOf(await node('6:65')),benefits);
for(const [title,copy] of [
 ['Home use','You can stay with family and friends during membership, with nights allocated pro rata to your commitment.'],
 ['Lola & Ber equity','Members receive a collective stake in the brand without an additional capital contribution.'],
 ['Future-fund carry','You receive pro-rata economic participation in carry from future Dulcinea funds, subject to membership terms.']
]){
 const box=frame(benefits,title,416,8);const rule=figma.createRectangle();box.appendChild(rule);rule.resize(416,2);rule.fills=color(207,181,59);created.push(rule.id);
 label(box,title,416,22,'SemiBold',true);label(box,copy,416,18,'Regular',true);
}
await text('6:51','READER QUESTION\nWhat will membership add to my life?\n\nOPEN\nShow time with family and friends in Medellín and El Oriente. Introduce three benefits here: home use, brand equity without another capital contribution, and conditional pro-rata future-fund carry.\n\nTIMING\nHome use begins as each property opens, not only at investment exit. Do not imply all homes are available today.\n\nMOTION\nThe city film keeps playing. Do not freeze or scrub it.\n\nNEXT\nExplore life here. Projected returns come after the homes and team.');
await text('6:74','Medellín and El Oriente');
await text('6:75','Spend time with family and friends in El Oriente and El Poblado, with a home as your base.');
await text('6:81','Country stays');
await text('6:82','Spend weekends with family and friends in El Oriente, with gardens, terraces and space outdoors.');
await text('6:94','City stays');
await text('6:95','Meet friends, explore Medellín and enjoy evenings in El Poblado, then return to a home in the city.');
await text('6:104','Member benefits');
await text('6:105','You can use the homes during membership and participate in Lola & Ber and future-fund carry under the membership terms.');
await text('6:110','Lola & Ber is a sex-positive brand for open-minded adults, grounded in consent, respect and privacy. Hospitality is its property division.');
await text('6:114','Members can book as each home opens. The annual pool reaches 365 nights with five operating homes; allocation is pro rata to commitment.');
await text('6:117','Members collectively receive 3% of Lola & Ber at full subscription. No additional capital call or dilution, subject to membership terms.');
const detail=await node('6:111');
label(detail,'Future-fund carry',550,28,'SemiBold');
label(detail,'You receive pro-rata economic participation in carry from future Dulcinea funds, subject to membership terms. Future funds are not guaranteed.',550,18);
await text('6:118','Booking rules +     Participation terms +');
await text('6:119','Membership does not convey title to an individual home. Stays are subject to booking availability and membership terms.');
await text('6:102','READER QUESTION\nWhat does my membership include?\n\nBENEFITS\nExplain home use first, the collective 3% Lola & Ber stake second, and conditional pro-rata future-fund carry third. Keep all three visible.\n\nBRAND\nGive Lola & Ber its own adult brand scene. Keep family experiences in the destination and home-use scenes.\n\nDETAIL\nBooking rules and participation terms expand in place. Do not hide the carry benefit inside an accordion.\n\nNEXT\nExplore the actual homes.');
await text('6:128','The homes');
await text('6:129','Explore two country homes and three city properties, with current status, original imagery and supplied floorplans.');
await text('6:170','How Dulcinea works');
await text('6:171','Dulcinea handles acquisition, renovation, rentals and resale so members do not have to manage these activities themselves.');
await text('6:214','Projected returns');
await text('6:215','Rental income and property sales support the projected return. Home-use costs are included; brand equity and future-fund participation have no modeled value.');
await text('7:52','Presentation sequence');
await text('7:53','Introduce life with family and friends and all three member benefits at the opening. Show destinations, homes and team before projected returns.');
await props('7:61',{'Copy#7:2':'You can spend time with family and friends in Medellín and El Oriente as the homes open.','Title#7:1':'Dulcinea One'});
await props('7:67',{'Title#7:1':'Member benefits','Copy#7:2':'You can use the homes as they open.\nLola & Ber equity requires no additional capital contribution.\nYou receive pro-rata future-fund carry, subject to terms.'});
(await node('I7:67;7:55')).resize(648,144);
(await node('I7:67;7:55')).fills=[{type:'IMAGE',imageHash:'b387258b0e21079204b90bcec0dd6aab95b48010',scaleMode:'FILL'}];
await props('7:92',{'Title#7:1':'Membership terms','Copy#7:2':'The shared pool reaches 365 nights as five homes open; allocation is pro rata to commitment.\nMembers collectively receive 3% of Lola & Ber at full subscription.\nPro-rata future-fund carry follows membership terms; future funds are not guaranteed.'});
(await node('I7:92;7:55')).resize(648,96);
await props('7:130',{'Copy#7:2':'Dulcinea handles acquisition, renovation, rentals and resale.\nThe team manages the work while you hold your investment.'});
const one=await node('I7:61;7:58');one.setRangeFills(9,12,color(207,181,59));
// Restore the semantic chapter links after property updates.
for(const [instance,target] of [['5:14','6:48'],['5:21','6:69'],['5:28','6:99'],['5:35','6:123'],['5:43','6:165'],['5:50','6:209'],['5:57','6:250']]){
 const t=await node('I'+instance+';5:12');t.setRangeHyperlink(0,t.characters.length,{type:'NODE',value:target});
}
(await node('11:116')).resize(hero.width,hero.height);
const report=[];
for(const id of ['4:27','4:28','4:29','6:48','6:99','7:67','7:92']){const n=await node(id);report.push({id,width:n.width,height:n.height,children:n.children?.length});}
return {changedNodeIds:changed,createdNodeIds:created,chapters,benefitRowId:benefits.id,bounds:report};

(()=>{'use strict';
const NOW=Math.max(2026,new Date().getFullYear());
const MIN=-3200,MAX=NOW,MIN_SPAN=4;
const STATE_KEY='timelayers-ui-v4',IMPORT_KEY='timelayers-custom-v1',IMAGE_KEY='timelayers-images-v1';
const DATASET=typeof DATA!=='undefined'?DATA:{people:[],works:[],events:[],periods:[]};
const normalize=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const number=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const titleOf=x=>x.name||x.title||'Bez názvu';
const startOf=x=>number(x.start??x.year);
const endOf=x=>number(x.end??x.year??x.start,startOf(x));
const importance=x=>clamp(number(x.importance,3),1,5);
const categories=x=>(x.categories||[]).map(normalize);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatYear=y=>Math.round(y)<0?`${Math.abs(Math.round(y)).toLocaleString('cs-CZ')} př. n. l.`:Math.round(y).toLocaleString('cs-CZ');
const formatRange=x=>(x.living||endOf(x)>=MAX)&&x.kind==='person'?`${formatYear(startOf(x))}–dnes`:Math.round(startOf(x))===Math.round(endOf(x))?formatYear(startOf(x)):`${formatYear(startOf(x))}–${formatYear(endOf(x))}`;
const hash=s=>{let h=0;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))|0;return Math.abs(h)};
const slug=s=>normalize(s).replace(/\s+/g,'-')||`item-${Date.now()}`;

let imported=[];
try{imported=JSON.parse(localStorage.getItem(IMPORT_KEY)||'[]');if(!Array.isArray(imported))imported=[]}catch{imported=[]}
const basePeople=(DATASET.people||[]).map(x=>({...x,kind:'person',source:'catalog'}));
const baseWorks=(DATASET.works||[]).map(x=>({...x,kind:'work',start:number(x.year,x.start),end:number(x.year,x.start),source:'catalog'}));
const baseEvents=(DATASET.events||[]).map(x=>({...x,kind:'event',source:'catalog'}));
const basePeriods=(DATASET.periods||[]).map(x=>({...x,kind:'period',source:'catalog'}));
const customPeople=()=>imported.filter(x=>x.target==='authors').map(x=>({...x,kind:'person'}));
const customWorks=()=>imported.filter(x=>x.target==='works').map(x=>({...x,kind:'custom'}));
const customHistory=()=>imported.filter(x=>x.target==='history').map(x=>({...x,kind:'custom'}));
const allPeople=()=>[...basePeople,...customPeople()];
const allWorks=()=>[...baseWorks,...customWorks()];
const allEvents=()=>[...baseEvents,...customHistory()];
const allPeriods=()=>basePeriods;
const byPerson=()=>new Map(allPeople().map(x=>[x.id,x]));

const isRuler=x=>x.scope==='ruler'||categories(x).includes('ruler');
const isMonument=x=>categories(x).some(c=>['monument','castle','stavba'].includes(c))||/(hrad|zámek|katedrál|pyramid|kolose|stonehenge|chrám|most|věž|palác)/i.test(titleOf(x));
const isTech=x=>x.scope==='tech'||categories(x).some(c=>['science','invention','vynalez'].includes(c));
const isCzech=x=>x.scope==='czech'||categories(x).includes('czech-history');
const isWar=x=>categories(x).includes('war')||/(válk|bitv|invaz|okupac|atentát|povstání)/i.test(titleOf(x));
const isFilm=x=>normalize(x.customType||'').includes('film');

let saved={};
try{saved=JSON.parse(localStorage.getItem(STATE_KEY)||'{}')}catch{}
const state={
  a:clamp(number(saved.a,1780),MIN,MAX-MIN_SPAN),
  b:clamp(number(saved.b,MAX),MIN+MIN_SPAN,MAX),
  on:new Set(saved.on||['authors','works','history','rulers','tech','custom']),
  theme:saved.theme==='dark'?'dark':'light',
  level:['basic','balanced','detailed'].includes(saved.level)?saved.level:'balanced',
  query:'',selected:null,drag:null,cursor:null
};
if(state.b-state.a<MIN_SPAN)state.b=state.a+MIN_SPAN;
const persist=()=>{try{localStorage.setItem(STATE_KEY,JSON.stringify({a:state.a,b:state.b,on:[...state.on],theme:state.theme,level:state.level}))}catch{}};
const persistImported=()=>{try{localStorage.setItem(IMPORT_KEY,JSON.stringify(imported))}catch{}};

document.documentElement.dataset.modernTheme=state.theme;
document.title='Časovrstvy — souvislosti v čase';
document.body.innerHTML=`<div class="cv">
<header>
  <button class="brand" data-action="layers" aria-label="Otevřít vrstvy"><b>◫</b><span><strong>Časovrstvy</strong><small>souvislosti v čase</small></span></button>
  <div class="range-inputs" aria-label="Přesný rozsah let"><label><small>OD</small><input id="headerFrom" type="number"></label><span>—</span><label><small>DO</small><input id="headerTo" type="number"></label><button data-action="applyHeader">Použít</button></div>
  <label class="search"><i>⌕</i><input id="search" placeholder="Hledat autora, dílo nebo událost…"><kbd>⌘ K</kbd></label>
  <div id="results" class="results" hidden></div>
  <div class="cursor-readout"><small>ROK POD KURZOREM</small><b id="cursorReadout">—</b></div>
  <select id="level" aria-label="Množství informací"><option value="basic">Základy</option><option value="balanced">Vyváženě</option><option value="detailed">Podrobně</option></select>
  <button class="round" data-action="theme" aria-label="Přepnout motiv">${state.theme==='dark'?'☀':'☾'}</button>
  <button class="round" data-action="full" aria-label="Celá obrazovka">⛶</button>
</header>
<nav class="rail" aria-label="Ovládání časové osy"><button data-action="layers">◫<span>Vrstvy</span></button><button data-action="zoomIn">＋<span>Přiblížit</span></button><button data-action="zoomOut">−<span>Oddálit</span></button><button data-action="fit">⌗<span>Celá osa</span></button></nav>
<aside class="layers" id="layers" aria-label="Vrstvy a import">
  <div class="layers-head"><div><small>OBSAH</small><h2>Nastavení osy</h2></div><button data-action="closeLayers" aria-label="Zavřít">×</button></div>
  <div class="presets"><button data-preset="all">Vše</button><button data-preset="history">Historie</button><button data-preset="literature">Literatura</button><button data-preset="context">Literatura + kontext</button></div>
  <div id="layerList"></div>
  <hr><small class="eyebrow">RYCHLÝ PŘESUN</small>
  <div class="eras"><button data-era="ancient">Starověk</button><button data-era="medieval">Středověk</button><button data-era="renaissance">Renesance</button><button data-era="19">19. století</button><button data-era="20">20. století</button><button data-era="now">Současnost</button></div>
  <hr><small class="eyebrow">VLASTNÍ DATA</small>
  <p class="import-help">Nahraj TXT, CSV, TSV, Markdown nebo JSON. Řádek může mít tvar <b>Název | Rok | Konec | Typ | Popis</b>.</p>
  <input class="file-input" id="fileInput" type="file" accept=".txt,.csv,.tsv,.md,.json,text/plain,application/json">
  <textarea id="importText" rows="4" placeholder="Např. Interstellar | 2014 | 2014 | film | Oblíbený film"></textarea>
  <div class="import-actions"><button data-action="import">Přidat na osu</button><button data-action="clearImport">Smazat vlastní</button></div>
  <p class="import-status" id="importStatus"></p>
</aside><button class="scrim" data-action="closeLayers" aria-label="Zavřít panel"></button>
<main>
  <section class="timeline" id="timeline">
    <div class="period-strip" id="periodStrip"></div>
    <div class="ruler" id="ruler"></div>
    <div class="cursor-line" id="cursorLine"><span id="cursorYear"></span></div>
    <div class="tracks" id="tracks"></div>
  </section>
  <footer><div><small>CELÁ HISTORIE</small><b>${formatYear(MIN)} — ${formatYear(MAX)}</b></div><div class="map" id="map"><div id="density"></div><i id="window"></i></div><div class="zoom"><button data-action="zoomOut">−</button><input id="zoom" type="range" min="0" max="100"><button data-action="zoomIn">＋</button></div></footer>
</main>
<aside class="detail" id="detail"><div class="detail-hero"><div class="detail-image" id="detailImage"></div><button data-action="closeDetail" aria-label="Zavřít">×</button><small id="detailType"></small></div><div class="detail-body"><time id="detailDate"></time><h1 id="detailTitle"></h1><p id="detailText"></p><div id="detailMeta"></div><div id="related"></div><a id="source" target="_blank" rel="noopener">Otevřít ověřený zdroj ↗</a></div></aside><button class="detail-scrim" data-action="closeDetail" aria-label="Zavřít detail"></button>
</div>`;

const $=s=>document.querySelector(s);
const app=$('.cv'),timeline=$('#timeline'),tracks=$('#tracks'),ruler=$('#ruler'),periodStrip=$('#periodStrip'),layers=$('#layers'),results=$('#results'),search=$('#search'),detail=$('#detail'),level=$('#level');
level.value=state.level;

const layerDefs=[
  {id:'authors',label:'Autoři',icon:'♙',color:'#7357e8',count:()=>allPeople().length},
  {id:'works',label:'Knihy a další díla',icon:'▤',color:'#a14ee2',count:()=>allWorks().length},
  {id:'history',label:'Dějiny',icon:'◎',color:'#287fc4',count:()=>allEvents().filter(x=>!isTech(x)&&!isMonument(x)&&!isRuler(x)).length},
  {id:'rulers',label:'Vládci v dějinách',icon:'♛',color:'#b9822c',count:()=>allEvents().filter(isRuler).length},
  {id:'tech',label:'Vynálezy',icon:'✦',color:'#df9227',count:()=>allEvents().filter(isTech).length},
  {id:'custom',label:'Vlastní položky',icon:'＋',color:'#2c9a78',count:()=>imported.length}
];
const kinds={person:'Autor',work:'Literární dílo',period:'Historické období',custom:'Vlastní položka'};
const kindOf=x=>x.customType?kinds.custom:x.kind==='person'?kinds.person:x.kind==='work'?kinds.work:x.kind==='period'?kinds.period:isRuler(x)?'Vládce nebo prezident':isTech(x)?'Vynález nebo objev':isCzech(x)?'České dějiny':isWar(x)?'Válka a světové dějiny':'Světové dějiny';
const description=x=>x.summary||x.description||(x.kind==='person'?(allWorks().filter(w=>w.authorId===x.id).length?`Autor spojený s díly ${allWorks().filter(w=>w.authorId===x.id).slice(0,4).map(titleOf).join(', ')}.`:'Významná osobnost literárních dějin.'):x.kind==='work'&&byPerson().get(x.authorId)?`Literární dílo autora ${byPerson().get(x.authorId).name}.`:'Významná položka společné historické a kulturní časové osy.');
const allItems=()=>[...allPeople(),...allWorks(),...allEvents(),...allPeriods()];
const findItem=(kind,id)=>{
  const source=kind==='person'?allPeople():kind==='work'?allWorks():kind==='period'?allPeriods():kind==='custom'?imported:allEvents();
  return source.find(x=>String(x.id)===String(id));
};

const imageMemory=new Map();
let imageDisk={};
try{imageDisk=JSON.parse(localStorage.getItem(IMAGE_KEY)||'{}')}catch{imageDisk={}}
const imageKey=x=>x.wikiTitle||titleOf(x);
const wikiImage=async x=>{
  const key=imageKey(x);
  if(x.image)return x.image;
  if(imageMemory.has(key))return imageMemory.get(key);
  if(imageDisk[key]){imageMemory.set(key,imageDisk[key]);return imageDisk[key]}
  const query=async(lang,searchMode)=>{
    try{
      const url=new URL(`https://${lang}.wikipedia.org/w/api.php`);
      const params=searchMode?{action:'query',generator:'search',gsrsearch:key,gsrnamespace:'0',gsrlimit:'5',prop:'pageimages',piprop:'thumbnail|original',pithumbsize:'700',format:'json',formatversion:'2',origin:'*'}:{action:'query',titles:key,redirects:'1',prop:'pageimages',piprop:'thumbnail|original',pithumbsize:'700',format:'json',formatversion:'2',origin:'*'};
      Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
      const response=await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
      if(!response.ok)return null;
      const pages=(await response.json()).query?.pages||[];
      const page=pages.find(p=>p.thumbnail?.source||p.original?.source);
      return page?.thumbnail?.source||page?.original?.source||null;
    }catch{return null}
  };
  let source=null;
  for(const lang of ['cs','en']){source=await query(lang,false)||await query(lang,true);if(source)break}
  if(source){imageMemory.set(key,source);imageDisk[key]=source;try{localStorage.setItem(IMAGE_KEY,JSON.stringify(imageDisk))}catch{}}
  return source;
};
const fallbackGlyph=x=>x.kind==='person'?'♙':x.kind==='work'||isFilm(x)?'▤':isTech(x)?'✦':isRuler(x)?'♛':'◎';
const hydrateImages=()=>{
  document.querySelectorAll('[data-image-kind][data-image-id]').forEach(host=>{
    if(host.dataset.loaded==='1')return;
    const item=findItem(host.dataset.imageKind,host.dataset.imageId);
    if(!item)return;
    host.dataset.loaded='1';host.innerHTML=`<span>${fallbackGlyph(item)}</span>`;
    wikiImage(item).then(src=>{if(!src||!host.isConnected)return;const img=new Image();img.alt=titleOf(item);img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onload=()=>{if(host.isConnected)host.replaceChildren(img)};img.src=src});
  });
};

const setRange=(a,b)=>{
  let span=clamp(b-a,MIN_SPAN,MAX-MIN),center=(a+b)/2;
  a=center-span/2;b=center+span/2;
  if(a<MIN){b+=MIN-a;a=MIN}if(b>MAX){a-=b-MAX;b=MAX}
  state.a=a;state.b=b;persist();render();
};
const zoomAt=(factor,ratio=.5)=>{
  const span=state.b-state.a,next=clamp(span*factor,MIN_SPAN,MAX-MIN),anchor=state.a+span*ratio;
  setRange(anchor-next*ratio,anchor+next*(1-ratio));
};
const xFor=(year,width)=>(year-state.a)/(state.b-state.a)*width;
const tickStep=span=>[1,2,5,10,20,25,50,100,200,250,500,1000,2000].find(v=>span/v<=12)||5000;
const levelConfig=()=>state.level==='basic'?{min:5,cap:18}:state.level==='balanced'?{min:3,cap:58}:{min:1,cap:190};
const visibleItems=(items,width)=>{
  let list=items.filter(x=>endOf(x)>=state.a&&startOf(x)<=state.b);
  if(state.query)list=list.filter(x=>normalize(`${titleOf(x)} ${description(x)} ${(x.keywords||[]).join(' ')}`).includes(state.query));
  const {min,cap}=levelConfig(),span=state.b-state.a;
  let threshold=min;
  if(span>1700)threshold=Math.max(threshold,state.level==='detailed'?3:5);
  else if(span>600)threshold=Math.max(threshold,state.level==='basic'?5:state.level==='balanced'?4:2);
  list=list.filter(x=>importance(x)>=threshold||x.source==='custom');
  let zoomCap=cap;
  if(span>1800)zoomCap=Math.min(zoomCap,state.level==='detailed'?32:state.level==='balanced'?18:10);
  else if(span>600)zoomCap=Math.min(zoomCap,state.level==='detailed'?70:state.level==='balanced'?35:15);
  else if(span<80)zoomCap=Math.max(zoomCap,state.level==='detailed'?260:state.level==='balanced'?100:36);
  return list.sort((a,b)=>startOf(a)-startOf(b)||importance(b)-importance(a)||titleOf(a).localeCompare(titleOf(b),'cs')).slice(0,Math.max(zoomCap,Math.floor(width/34)));
};

const laneFor=x=>hash(`${x.kind}:${x.id||titleOf(x)}`)%3;
const imageCard=(x,color,width,trackType)=>{
  const a=clamp(startOf(x),state.a,state.b),b=clamp(endOf(x),state.a,state.b),center=xFor((a+b)/2,width),lane=laneFor(x),top=[18,50,82][lane];
  const duration=Math.max(0,b-a),durationWidth=Math.max(3,xFor(b,width)-xFor(a,width));
  const kind=x.kind==='person'?'person':x.kind==='work'||x.kind==='custom'?'work':isTech(x)?'tech':isRuler(x)?'ruler':'history';
  if(kind==='person'){
    return `<button class="visual-item person-card" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="--c:${color};left:${center}px;top:${top}px"><i class="life" style="width:${durationWidth}px;left:${-durationWidth/2}px"></i><span class="thumb portrait" data-image-kind="${x.kind}" data-image-id="${escapeHtml(x.id)}"></span><b>${escapeHtml(titleOf(x))}</b></button>`;
  }
  if(kind==='work'){
    return `<button class="visual-item work-card" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="--c:${color};left:${center}px;top:${top}px"><span class="thumb cover" data-image-kind="${x.kind}" data-image-id="${escapeHtml(x.id)}"></span><b>${escapeHtml(titleOf(x))}</b></button>`;
  }
  if(kind==='tech'){
    return `<button class="visual-item tech-card" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="--c:${color};left:${center}px;top:${top+4}px"><span class="thumb invention" data-image-kind="${x.kind}" data-image-id="${escapeHtml(x.id)}"></span><b>${escapeHtml(titleOf(x))}</b></button>`;
  }
  return '';
};
const historyCard=(x,width)=>{
  const a=clamp(startOf(x),state.a,state.b),b=clamp(endOf(x),state.a,state.b),center=xFor((a+b)/2,width),lane=laneFor(x),top=[24,53,82][lane];
  const duration=endOf(x)-startOf(x)>.15,durationWidth=Math.max(4,xFor(b,width)-xFor(a,width));
  const color=isRuler(x)?'#b9822c':isWar(x)?'#df4d56':isCzech(x)?'#2d8bcc':'#5269b7';
  if(duration)return `<button class="history-item duration" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="--c:${color};left:${xFor(a,width)}px;top:${top}px;width:${durationWidth}px"><i></i><span>${escapeHtml(titleOf(x))}</span></button>`;
  return `<button class="history-item point" data-kind="${x.kind}" data-id="${escapeHtml(x.id)}" style="--c:${color};left:${center}px;top:${top}px"><i></i><span>${escapeHtml(titleOf(x))}</span></button>`;
};
const trackMarkup=(id,label,icon,color,items,width)=>{
  const visible=visibleItems(items,width);
  const content=id==='history'?visible.map(x=>historyCard(x,width)).join(''):visible.map(x=>imageCard(x,color,width,id)).join('');
  return `<section class="track ${id}" style="--c:${color}"><div class="track-name"><i>${icon}</i><span><b>${label}</b><small>${visible.length} ve výřezu</small></span></div><div class="track-canvas">${content}</div></section>`;
};
const periodMarkup=(width)=>{
  const span=state.b-state.a;
  const periods=allPeriods().filter(x=>endOf(x)>=state.a&&startOf(x)<=state.b).sort((a,b)=>importance(b)-importance(a)||startOf(a)-startOf(b)).slice(0,span>1600?8:span>500?12:20);
  return periods.map((x,index)=>{
    const a=clamp(startOf(x),state.a,state.b),b=clamp(endOf(x),state.a,state.b),left=xFor(a,width),w=Math.max(8,xFor(b,width)-left),lane=index%2;
    return `<button class="period-segment" data-kind="period" data-id="${escapeHtml(x.id)}" style="left:${left}px;width:${w}px;top:${5+lane*23}px;--c:${x.color||'#2c9a78'}"><b>${escapeHtml(titleOf(x))}</b></button>`;
  }).join('');
};
const renderLayers=()=>{
  $('#layerList').innerHTML=layerDefs.map(l=>`<button class="layer ${state.on.has(l.id)?'on':''}" data-layer="${l.id}" style="--c:${l.color}"><i>${l.icon}</i><span><b>${l.label}</b><small>${l.count().toLocaleString('cs-CZ')} položek</small></span><em></em></button>`).join('');
  $('#importStatus').textContent=imported.length?`Na ose je ${imported.length} vlastních položek.`:'Zatím nejsou přidaná žádná vlastní data.';
};
const render=()=>{
  const width=Math.max(620,tracks.clientWidth||timeline.clientWidth||1200),span=state.b-state.a,step=tickStep(span),first=Math.ceil(state.a/step)*step;
  let ticks='';for(let year=first;year<=state.b+step*.05;year+=step)ticks+=`<i style="left:${xFor(year,width)}px"><span>${formatYear(year)}</span></i>`;
  ruler.innerHTML=ticks;
  periodStrip.innerHTML=periodMarkup(width);
  $('#headerFrom').value=Math.round(state.a);$('#headerTo').value=Math.round(state.b);
  const tracksToRender=[];
  if(state.on.has('authors'))tracksToRender.push(trackMarkup('authors','Autoři','♙','#7357e8',allPeople(),width));
  if(state.on.has('works'))tracksToRender.push(trackMarkup('works','Knihy a další díla','▤','#a14ee2',allWorks(),width));
  if(state.on.has('history')||state.on.has('rulers')){
    let history=allEvents().filter(x=>!isTech(x)&&!isMonument(x)&&((!isRuler(x)&&state.on.has('history'))||(isRuler(x)&&state.on.has('rulers'))));
    if(state.on.has('custom'))history=[...history,...customHistory()];
    tracksToRender.push(trackMarkup('history','Dějiny','◎','#287fc4',history,width));
  }
  if(state.on.has('tech'))tracksToRender.push(trackMarkup('tech','Vynálezy','✦','#df9227',allEvents().filter(isTech),width));
  tracks.style.setProperty('--rows',String(Math.max(1,tracksToRender.length)));
  tracks.innerHTML=tracksToRender.join('')||'<div class="empty">Zapni alespoň jednu vrstvu.</div>';
  const full=MAX-MIN;$('#window').style.left=`${(state.a-MIN)/full*100}%`;$('#window').style.width=`${Math.max(.8,(state.b-state.a)/full*100)}%`;
  $('#zoom').value=String(clamp(100*Math.log(full/(state.b-state.a))/Math.log(full/MIN_SPAN),0,100));
  renderLayers();requestAnimationFrame(hydrateImages);
};

const relatedTo=x=>{
  if(x.kind==='person')return allWorks().filter(w=>w.authorId===x.id).slice(0,8);
  if(x.kind==='work'&&byPerson().get(x.authorId))return [byPerson().get(x.authorId),...allEvents().filter(e=>startOf(e)<=startOf(x)&&endOf(e)>=startOf(x)&&!isMonument(e)).sort((a,b)=>importance(b)-importance(a)).slice(0,5)];
  if(x.kind==='period')return allItems().filter(o=>o.id!==x.id&&startOf(o)<=endOf(x)&&endOf(o)>=startOf(x)&&(o.kind==='person'||o.kind==='work'||isTech(o)||isMonument(o))).sort((a,b)=>importance(b)-importance(a)).slice(0,10);
  return allItems().filter(o=>o.id!==x.id&&Math.abs((startOf(o)+endOf(o)-startOf(x)-endOf(x))/2)<=Math.max(6,(state.b-state.a)*.025)).sort((a,b)=>importance(b)-importance(a)).slice(0,7);
};
const openDetail=x=>{
  if(!x)return;state.selected=x;
  $('#detailType').textContent=kindOf(x);$('#detailDate').textContent=formatRange(x);$('#detailTitle').textContent=titleOf(x);$('#detailText').textContent=description(x);
  const meta=[];if(x.kind==='work'&&byPerson().get(x.authorId))meta.push(['Autor',byPerson().get(x.authorId).name]);if(x.customType)meta.push(['Typ',x.customType]);if(x.region)meta.push(['Území',x.region]);if(x.role)meta.push(['Role',x.role]);if(x.keywords?.length)meta.push(['Klíčová slova',x.keywords.slice(0,7).join(' · ')]);
  $('#detailMeta').innerHTML=meta.length?`<dl>${meta.map(([a,b])=>`<div><dt>${escapeHtml(a)}</dt><dd>${escapeHtml(b)}</dd></div>`).join('')}</dl>`:'';
  const rel=relatedTo(x);$('#related').innerHTML=rel.length?`<h3>SOUVISEJÍCÍ POLOŽKY</h3>${rel.map(o=>`<button data-related-kind="${o.kind}" data-related-id="${escapeHtml(o.id)}"><small>${kindOf(o)}</small><b>${escapeHtml(titleOf(o))}</b></button>`).join('')}`:'';
  $('#source').href=x.wiki||`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(titleOf(x))}`;
  const image=$('#detailImage');image.innerHTML=`<span>${fallbackGlyph(x)}</span>`;wikiImage(x).then(src=>{if(!src||state.selected!==x)return;const img=new Image();img.alt=titleOf(x);img.onload=()=>image.replaceChildren(img);img.src=src});
  detail.classList.add('open');$('.detail-scrim').classList.add('open');render();
};
const closeDetail=()=>{state.selected=null;detail.classList.remove('open');$('.detail-scrim').classList.remove('open');render()};
const goTo=x=>{const center=(startOf(x)+endOf(x))/2,span=clamp(Math.max(14,(endOf(x)-startOf(x))*3.2),MIN_SPAN,350);state.query='';search.value='';results.hidden=true;setRange(center-span/2,center+span/2);openDetail(x)};

const searchNow=()=>{
  state.query=normalize(search.value.trim());
  if(!state.query){results.hidden=true;render();return}
  const found=allItems().filter(x=>normalize(`${titleOf(x)} ${description(x)} ${(x.keywords||[]).join(' ')}`).includes(state.query)).sort((a,b)=>importance(b)-importance(a)||startOf(a)-startOf(b)).slice(0,10);
  results.innerHTML=found.length?found.map(x=>`<button data-search-kind="${x.kind}" data-search-id="${escapeHtml(x.id)}"><small>${kindOf(x)} · ${formatRange(x)}</small><b>${escapeHtml(titleOf(x))}</b><i>›</i></button>`).join(''):'<p>Žádná odpovídající položka.</p>';
  results.hidden=false;render();
};
const presets={all:['authors','works','history','rulers','tech','custom'],history:['history','rulers','tech','custom'],literature:['authors','works','custom'],context:['authors','works','history','rulers','custom']};
const eras={ancient:[-800,500],medieval:[500,1500],renaissance:[1350,1650],'19':[1800,1900],'20':[1900,2000],now:[1945,MAX]};

const parseRows=text=>{
  const trimmed=text.trim();if(!trimmed)return [];
  if(trimmed.startsWith('[')||trimmed.startsWith('{')){
    try{const raw=JSON.parse(trimmed),arr=Array.isArray(raw)?raw:(raw.items||[]);return arr.map(x=>({name:x.title||x.name,start:x.start??x.year,end:x.end??x.year??x.start,type:x.type||x.category||'událost',description:x.description||x.summary||''}))}catch{}
  }
  return trimmed.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).filter(line=>!/^název|^title/i.test(line)).map(line=>{
    const sep=line.includes('|')?'|':line.includes('\t')?'\t':line.includes(';')?';':',';
    const parts=line.split(sep).map(x=>x.trim());
    return {name:parts[0],start:parts[1],end:parts[2]||parts[1],type:parts[3]||'událost',description:parts.slice(4).join(' ')};
  });
};
const importRows=rows=>{
  const valid=rows.filter(x=>x.name&&Number.isFinite(Number(x.start)));
  valid.forEach((x,index)=>{
    const type=normalize(x.type),target=/(autor|osobnost|person)/.test(type)?'authors':/(kniha|dilo|dílo|film|serial|seriál|work)/.test(type)?'works':'history';
    imported.push({id:`custom-${slug(x.name)}-${Date.now()}-${index}`,title:x.name,name:target==='authors'?x.name:undefined,start:Number(x.start),end:Number.isFinite(Number(x.end))?Number(x.end):Number(x.start),importance:5,description:x.description||'Vlastní položka uživatele.',summary:x.description||'Vlastní položka uživatele.',customType:x.type||'vlastní položka',target,source:'custom',wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(x.name)}`});
  });
  persistImported();state.on.add('custom');render();return valid.length;
};

app.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]');
  if(action){
    const name=action.dataset.action;
    if(name==='layers'){layers.classList.add('open');$('.scrim').classList.add('open')}
    if(name==='closeLayers'){layers.classList.remove('open');$('.scrim').classList.remove('open')}
    if(name==='zoomIn')zoomAt(.68);
    if(name==='zoomOut')zoomAt(1.47);
    if(name==='fit')setRange(MIN,MAX);
    if(name==='theme'){state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.modernTheme=state.theme;document.querySelectorAll('[data-action="theme"]').forEach(b=>b.textContent=state.theme==='dark'?'☀':'☾');persist()}
    if(name==='full')document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();
    if(name==='closeDetail')closeDetail();
    if(name==='applyHeader'){const a=number($('#headerFrom').value,state.a),b=number($('#headerTo').value,state.b);if(b>a)setRange(a,b)}
    if(name==='import'){const count=importRows(parseRows($('#importText').value));$('#importStatus').textContent=count?`Přidáno ${count} položek.`:'Nenašla jsem platné řádky. Zkontroluj název a rok.';$('#importText').value=''}
    if(name==='clearImport'){imported=[];persistImported();render()}
    return;
  }
  const layer=event.target.closest('[data-layer]');if(layer){state.on.has(layer.dataset.layer)?state.on.delete(layer.dataset.layer):state.on.add(layer.dataset.layer);persist();render();return}
  const preset=event.target.closest('[data-preset]');if(preset){state.on=new Set(presets[preset.dataset.preset]||[]);persist();render();return}
  const era=event.target.closest('[data-era]');if(era){setRange(...eras[era.dataset.era]);layers.classList.remove('open');$('.scrim').classList.remove('open');return}
  const item=event.target.closest('[data-kind][data-id]');if(item){openDetail(findItem(item.dataset.kind,item.dataset.id));return}
  const searchResult=event.target.closest('[data-search-kind]');if(searchResult){goTo(findItem(searchResult.dataset.searchKind,searchResult.dataset.searchId));return}
  const related=event.target.closest('[data-related-kind]');if(related)goTo(findItem(related.dataset.relatedKind,related.dataset.relatedId));
});

search.addEventListener('input',searchNow);
level.addEventListener('change',()=>{state.level=level.value;persist();render()});
$('#zoom').addEventListener('input',()=>{const full=MAX-MIN,span=full*Math.pow(MIN_SPAN/full,Number($('#zoom').value)/100),center=(state.a+state.b)/2;setRange(center-span/2,center+span/2)});
$('#fileInput').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{const text=await file.text();$('#importText').value=text;const count=importRows(parseRows(text));$('#importStatus').textContent=count?`Ze souboru přidáno ${count} položek.`:'Soubor neobsahoval rozpoznatelné položky.'}catch{$('#importStatus').textContent='Soubor se nepodařilo načíst.'}event.target.value=''});

timeline.addEventListener('wheel',event=>{
  if(event.target.closest('button,input,select,a'))return;
  event.preventDefault();const rect=timeline.getBoundingClientRect(),ratio=clamp((event.clientX-rect.left)/rect.width,0,1);
  if(event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)*.7){const delta=(event.deltaX+(event.shiftKey?event.deltaY:0))/rect.width*(state.b-state.a);setRange(state.a+delta,state.b+delta)}else zoomAt(Math.exp(event.deltaY*.00115),ratio);
},{passive:false});
timeline.addEventListener('pointerdown',event=>{if(event.button||event.target.closest('button,input,a'))return;state.drag={x:event.clientX,a:state.a,b:state.b,id:event.pointerId};timeline.setPointerCapture(event.pointerId);timeline.classList.add('dragging')});
timeline.addEventListener('pointermove',event=>{
  const rect=timeline.getBoundingClientRect(),ratio=clamp((event.clientX-rect.left)/rect.width,0,1),year=state.a+(state.b-state.a)*ratio;
  state.cursor=year;$('#cursorReadout').textContent=formatYear(year);$('#cursorYear').textContent=formatYear(year);$('#cursorLine').style.left=`${ratio*100}%`;$('#cursorLine').classList.add('show');
  if(!state.drag)return;
  let years=-(event.clientX-state.drag.x)/timeline.clientWidth*(state.drag.b-state.drag.a),a=state.drag.a+years,b=state.drag.b+years,span=b-a;if(a<MIN){a=MIN;b=a+span}if(b>MAX){b=MAX;a=b-span}state.a=a;state.b=b;requestAnimationFrame(render);
});
timeline.addEventListener('pointerleave',()=>{$('#cursorLine').classList.remove('show');$('#cursorReadout').textContent='—'});
const endDrag=()=>{if(!state.drag)return;state.drag=null;timeline.classList.remove('dragging');persist()};timeline.addEventListener('pointerup',endDrag);timeline.addEventListener('pointercancel',endDrag);
timeline.addEventListener('dblclick',event=>{if(event.target.closest('button'))return;const rect=timeline.getBoundingClientRect();zoomAt(.5,clamp((event.clientX-rect.left)/rect.width,0,1))});
$('#map').addEventListener('pointerdown',event=>{const rect=$('#map').getBoundingClientRect(),year=MIN+clamp((event.clientX-rect.left)/rect.width,0,1)*(MAX-MIN),span=state.b-state.a;setRange(year-span/2,year+span/2)});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();search.focus()}if(event.key==='Escape'){if(detail.classList.contains('open'))closeDetail();else{layers.classList.remove('open');$('.scrim').classList.remove('open');results.hidden=true}}});
window.addEventListener('resize',render);

const buckets=Array(100).fill(0);allItems().forEach(x=>{const index=clamp(Math.floor(((startOf(x)+endOf(x))/2-MIN)/(MAX-MIN)*100),0,99);buckets[index]+=importance(x)});const maxBucket=Math.max(...buckets,1);$('#density').innerHTML=buckets.map((value,index)=>`<i style="left:${index}%;height:${Math.max(4,value/maxBucket*100)}%"></i>`).join('');
render();
})();
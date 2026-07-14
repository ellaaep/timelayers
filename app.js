(() => {
  'use strict';

  const START = 1350;
  const END = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const MIN_SPAN = 8;
  const MAX_SPAN = END - START;
  const appRoot = document.getElementById('app') || document.querySelector('.app');
  const timeline = document.getElementById('timeline');
  const shell = document.querySelector('.timeline-shell');

  document.title = 'Časovrstvy';
  const heading = document.querySelector('.heading h1');
  if (heading) heading.textContent = 'Časovrstvy';

  const icons = {
    person: '<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 13 2h-3.5v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>',
    czech: '<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world: '<svg viewBox="0 0 24 24"><path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/></svg>',
    tech: '<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>',
    sidebar: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14M14 9l-3 3 3 3"/></svg>',
    axes: '<svg viewBox="0 0 24 24"><path d="M4 4v16h16M8 15l3-4 3 2 4-6"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M19 15.5A8 8 0 0 1 8.5 5 8 8 0 1 0 19 15.5Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };

  ['maturity','authors','works','events','czech','world','wars','war','politics','culture','tech','periods','czech-periods','world-periods'].forEach(id => active.add(id));
  active.delete('other-authors');
  active.delete('movements');
  updateVisibilityClasses();
  document.querySelectorAll('.filter').forEach(row => row.classList.toggle('active', active.has(row.dataset.id)));

  const normalized = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const importantEvents = [
    ['Upálení mistra Jana Husa',1415,'czech',['czech-history','religion'],5,'Upálení mistra Jana Husa'],
    ['Začátek husitských válek',1419,'czech',['czech-history','war'],5,'Husitské války'],
    ['Vynález knihtisku',1450,'tech',['invention','culture'],5,'Knihtisk'],
    ['Objevení Ameriky Kryštofem Kolumbem',1492,'world',['world-history'],4,'Objevení Ameriky'],
    ['Pražská defenestrace a stavovské povstání',1618,'czech',['czech-history','war'],5,'Pražská defenestrace (1618)'],
    ['Bitva na Bílé hoře',1620,'czech',['czech-history','war'],5,'Bitva na Bílé hoře'],
    ['Zdokonalení parního stroje',1769,'tech',['invention','science'],5,'Parní stroj'],
    ['Toleranční patent a zrušení nevolnictví',1781,'czech',['czech-history','politics'],5,'Toleranční patent'],
    ['Francouzská revoluce',1789,'world',['world-history','politics'],5,'Velká francouzská revoluce'],
    ['Vídeňský kongres',1815,'world',['world-history','politics'],4,'Vídeňský kongres'],
    ['Revoluční rok 1848',1848,'czech',['czech-history','politics'],5,'Revoluce v Rakouském císařství 1848–1849'],
    ['Vynález telefonu',1876,'tech',['invention'],4,'Telefon'],
    ['Praktická elektrická žárovka',1879,'tech',['invention','science'],5,'Žárovka'],
    ['První motorový let',1903,'tech',['invention'],5,'Wright Flyer'],
    ['Začátek první světové války',1914,'world',['world-history','war'],5,'První světová válka'],
    ['Vznik Československa',1918,'czech',['czech-history','politics'],5,'Vznik Československa'],
    ['První veřejný přenos televize',1926,'tech',['invention'],4,'Televize'],
    ['Mnichovská dohoda',1938,'czech',['czech-history','war','politics'],5,'Mnichovská dohoda'],
    ['Začátek druhé světové války',1939,'world',['world-history','war'],5,'Druhá světová válka'],
    ['Konec druhé světové války',1945,'world',['world-history','war'],5,'Konec druhé světové války v Evropě'],
    ['Vynález tranzistoru',1947,'tech',['invention','science'],4,'Tranzistor'],
    ['Komunistický převrat v Československu',1948,'czech',['czech-history','politics'],5,'Únor 1948'],
    ['První člověk na Měsíci',1969,'world',['world-history','science'],5,'Apollo 11'],
    ['Vznik sítě ARPANET',1969,'tech',['invention','science'],5,'ARPANET'],
    ['Pražské jaro a invaze vojsk Varšavské smlouvy',1968,'czech',['czech-history','war','politics'],5,'Invaze vojsk Varšavské smlouvy do Československa'],
    ['Vznik World Wide Webu',1989,'tech',['invention'],5,'World Wide Web'],
    ['Sametová revoluce',1989,'czech',['czech-history','politics'],5,'Sametová revoluce'],
    ['Pád Berlínské zdi',1989,'world',['world-history','politics'],5,'Pád Berlínské zdi'],
    ['Vznik České republiky',1993,'czech',['czech-history','politics'],5,'Vznik České republiky'],
    ['Vstup České republiky do Evropské unie',2004,'czech',['czech-history','politics'],4,'Vstup Česka do Evropské unie'],
    ['Představení prvního iPhonu',2007,'tech',['invention'],4,'iPhone (1. generace)'],
    ['Pandemie covidu-19',2020,'world',['world-history','science'],5,'Pandemie covidu-19'],
    ['Ruská invaze na Ukrajinu',2022,'world',['world-history','war','politics'],5,'Ruská invaze na Ukrajinu']
  ];
  importantEvents.forEach(([title,year,scope,categories,importance,wikiTitle],index) => {
    const key = normalized(title).slice(0,14);
    const exists = DATA.events.some(event => Math.abs(event.start-year) <= 1 && (normalized(event.title).includes(key) || key.includes(normalized(event.title).slice(0,10))));
    if (!exists) DATA.events.push({id:`essential-${index}`,title,start:year,end:year,display:String(year),scope,categories,importance,summary:'Významná událost českých nebo světových dějin.',wikiTitle,wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle)}`,image:null});
  });

  const currentYear = END;
  const curatedPeriods = [
    {id:'period-habsburg',title:'Habsburská monarchie',start:1526,end:1804,color:'#6c96d8',scope:'czech',row:0,wikiTitle:'Habsburská monarchie'},
    {id:'period-revival',title:'Národní obrození',start:1775,end:1850,color:'#55b89b',scope:'czech',row:1,wikiTitle:'České národní obrození'},
    {id:'period-austrian',title:'Rakouské císařství',start:1804,end:1867,color:'#8a72c9',scope:'czech',row:0,wikiTitle:'Rakouské císařství'},
    {id:'period-1848',title:'Revoluce 1848',start:1848,end:1849,color:'#e98272',scope:'czech',row:1,wikiTitle:'Revoluce v Rakouském císařství 1848–1849'},
    {id:'period-bach',title:'Bachův absolutismus',start:1849,end:1859,color:'#a89572',scope:'czech',row:1,wikiTitle:'Bachův absolutismus'},
    {id:'period-austria-hungary',title:'Rakousko-Uhersko',start:1867,end:1918,color:'#e8c44f',scope:'czech',row:0,wikiTitle:'Rakousko-Uhersko'},
    {id:'period-first-republic',title:'První republika',start:1918,end:1938,color:'#8fc1ee',scope:'czech',row:0,wikiTitle:'První republika'},
    {id:'period-protectorate',title:'Protektorát Čechy a Morava',start:1939,end:1945,color:'#c6a5df',scope:'czech',row:0,wikiTitle:'Protektorát Čechy a Morava'},
    {id:'period-communism',title:'Komunistické Československo',start:1948,end:1989,color:'#e79ab0',scope:'czech',row:0,wikiTitle:'Komunistický režim v Československu'},
    {id:'period-normalization',title:'Pražské jaro a normalizace',start:1968,end:1989,color:'#ad96cf',scope:'czech',row:1,wikiTitle:'Normalizace'},
    {id:'period-czech-republic',title:'Česká republika',start:1993,end:currentYear,color:'#9bd3ae',scope:'czech',row:0,wikiTitle:'Česko'},
    {id:'period-renaissance',title:'Renesance',start:1400,end:1600,color:'#e8b76a',scope:'world',row:2,wikiTitle:'Renesance'},
    {id:'period-enlightenment',title:'Osvícenství',start:1685,end:1815,color:'#e5d06d',scope:'world',row:2,wikiTitle:'Osvícenství'},
    {id:'period-industrial',title:'Průmyslová revoluce',start:1760,end:1840,color:'#91b9c7',scope:'world',row:2,wikiTitle:'Průmyslová revoluce'},
    {id:'period-ww1',title:'První světová válka',start:1914,end:1918,color:'#e58c86',scope:'world',row:2,wikiTitle:'První světová válka'},
    {id:'period-ww2',title:'Druhá světová válka',start:1939,end:1945,color:'#d16d6d',scope:'world',row:2,wikiTitle:'Druhá světová válka'},
    {id:'period-cold-war',title:'Studená válka',start:1947,end:1991,color:'#8fa6d8',scope:'world',row:2,wikiTitle:'Studená válka'},
    {id:'period-digital',title:'Digitální věk',start:1970,end:currentYear,color:'#72c2b0',scope:'world',row:2,wikiTitle:'Informační věk'}
  ].map(period => ({...period,wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(period.wikiTitle)}`,image:null}));
  curatedPeriods.forEach(period => { if (!DATA.periods.some(existing => existing.id === period.id)) DATA.periods.push(period); });

  const memoryImages = new Map();
  const pendingImages = new Map();
  const persistentKey = 'casovrstvy-image-cache-v1';
  let persistentImages = {};
  try { persistentImages = JSON.parse(localStorage.getItem(persistentKey) || '{}'); } catch (_) { persistentImages = {}; }
  const imageKey = item => item.wikiTitle || item.title || item.name || item.id;
  const imageQueue = [];
  let runningImages = 0;
  const pumpImages = () => {
    while (runningImages < 5 && imageQueue.length) {
      const job = imageQueue.shift();
      runningImages += 1;
      job.task().then(job.resolve,job.reject).finally(() => { runningImages -= 1; pumpImages(); });
    }
  };
  const enqueueImage = task => new Promise((resolve,reject) => { imageQueue.push({task,resolve,reject}); pumpImages(); });
  const wikiSummary = async (title,lang) => {
    try {
      const slug = encodeURIComponent(String(title).trim().replace(/\s+/g,'_'));
      const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`,{mode:'cors',credentials:'omit',cache:'force-cache'});
      if (!response.ok) return null;
      const data = await response.json();
      return data.thumbnail?.source || data.originalimage?.source || null;
    } catch (_) { return null; }
  };
  const wikiSearch = async (title,lang) => {
    try {
      const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
      const params = {action:'query',generator:'search',gsrsearch:title,gsrnamespace:'0',gsrlimit:'5',prop:'pageimages',piprop:'thumbnail|original',pithumbsize:'640',format:'json',formatversion:'2',origin:'*'};
      Object.entries(params).forEach(([key,value]) => url.searchParams.set(key,value));
      const response = await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
      if (!response.ok) return null;
      const data = await response.json();
      const pages = data.query?.pages || [];
      const page = pages.find(item => item.thumbnail?.source || item.original?.source);
      return page?.thumbnail?.source || page?.original?.source || null;
    } catch (_) { return null; }
  };
  const resolveImage = item => {
    const key = imageKey(item);
    if (item.image) return Promise.resolve(item.image);
    if (memoryImages.has(key)) return Promise.resolve(memoryImages.get(key));
    if (persistentImages[key]) { memoryImages.set(key,persistentImages[key]); return Promise.resolve(persistentImages[key]); }
    if (pendingImages.has(key)) return pendingImages.get(key);
    const promise = enqueueImage(async () => {
      let source = await wikiSummary(key,'cs');
      if (!source) source = await wikiSearch(key,'cs');
      if (!source) source = await wikiSummary(key,'en');
      if (!source) source = await wikiSearch(key,'en');
      memoryImages.set(key,source || null);
      if (source) {
        persistentImages[key] = source;
        try { localStorage.setItem(persistentKey,JSON.stringify(persistentImages)); } catch (_) { }
      }
      return source || null;
    }).finally(() => pendingImages.delete(key));
    pendingImages.set(key,promise);
    return promise;
  };
  const mountImage = (item,host,alt) => {
    if (!host) return;
    const key = imageKey(item);
    host.replaceChildren();
    host.classList.remove('image-loaded','image-failed');
    const fallback = document.createElement('span');
    fallback.textContent = (item.title || item.name || '?').trim().slice(0,1);
    host.appendChild(fallback);
    const cached = memoryImages.get(key) || persistentImages[key];
    if (cached) {
      const image = new Image(); image.alt = alt || ''; image.decoding = 'async'; image.referrerPolicy = 'no-referrer';
      image.onload = () => { if (host.isConnected) { host.replaceChildren(image); host.classList.add('image-loaded'); } };
      image.src = cached;
      return;
    }
    host.classList.add('image-loading');
    resolveImage(item).then(source => {
      if (!host.isConnected) return;
      host.classList.remove('image-loading');
      if (!source) { host.classList.add('image-failed'); return; }
      const image = new Image(); image.alt = alt || ''; image.decoding = 'async'; image.referrerPolicy = 'no-referrer';
      image.onload = () => { if (host.isConnected) { host.replaceChildren(image); host.classList.add('image-loaded'); } };
      image.onerror = () => host.classList.add('image-failed');
      image.src = source;
    });
  };
  window.wikiImage = mountImage;

  const addLabel = (host,top,text,icon,color,className='section-label') => {
    const label = document.createElement('div');
    label.className = className;
    label.style.cssText = `top:${top}px;--lane:${color}`;
    label.innerHTML = icon + `<span>${text}</span>`;
    host.appendChild(label);
  };
  const overlap = (first,second,gap=7) => !(first.right+gap <= second.left || second.right+gap <= first.left);
  const packRows = (items,rowCount,gap=7) => {
    const rows = Array.from({length:Math.max(1,rowCount)},() => []);
    items.forEach(item => {
      let row = rows.findIndex(list => list.every(other => !overlap(item,other,gap)));
      if (row < 0) row = rows.reduce((best,list,index) => list.length < rows[best].length ? index : best,0);
      item.row = row; rows[row].push(item);
    });
    return items;
  };

  let relationTimer = null;
  const clearRelations = (authorHost,workHost) => {
    authorHost.querySelectorAll('.author-card-live').forEach(card => card.classList.remove('is-selected','is-dimmed'));
    workHost.querySelectorAll('.work-card-live').forEach(card => card.classList.remove('is-related','is-dimmed'));
    workHost.querySelector('.relation-lines')?.remove();
  };
  const showRelations = (authorId,authorHost,workHost) => {
    clearTimeout(relationTimer); clearRelations(authorHost,workHost);
    const source = authorHost.querySelector(`.author-card-live[data-author-id="${CSS.escape(authorId)}"]`);
    const targets = [...workHost.querySelectorAll(`.work-card-live[data-author-id="${CSS.escape(authorId)}"]`)];
    if (!source) return;
    authorHost.querySelectorAll('.author-card-live').forEach(card => card.classList.toggle('is-dimmed',card !== source));
    source.classList.add('is-selected');
    workHost.querySelectorAll('.work-card-live').forEach(card => { const yes = card.dataset.authorId === authorId; card.classList.toggle('is-related',yes); card.classList.toggle('is-dimmed',!yes); });
    if (!targets.length) return;
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace,'svg'); svg.classList.add('relation-lines');
    const sourceX = source.offsetLeft + source.offsetWidth/2; const sourceY = source.offsetTop + source.offsetHeight;
    targets.forEach(target => {
      const targetX = target.offsetLeft + target.offsetWidth/2; const targetY = target.offsetTop; const bend = sourceY + (targetY-sourceY)*.52;
      const path = document.createElementNS(namespace,'path'); path.setAttribute('d',`M ${sourceX} ${sourceY} C ${sourceX} ${bend}, ${targetX} ${bend}, ${targetX} ${targetY}`); svg.appendChild(path);
      const dot = document.createElementNS(namespace,'circle'); dot.setAttribute('cx',targetX); dot.setAttribute('cy',targetY); dot.setAttribute('r','2.4'); svg.appendChild(dot);
    });
    workHost.prepend(svg);
  };
  const scheduleClearRelations = (authorHost,workHost) => { clearTimeout(relationTimer); relationTimer = setTimeout(() => clearRelations(authorHost,workHost),180); };

  renderLiterature = function renderLiteratureProduction(width) {
    const authorHost = document.getElementById('authorLayer');
    const workHost = document.getElementById('workLayer');
    const literature = document.getElementById('literature');
    authorHost.innerHTML = ''; workHost.innerHTML = '';
    const height = literature.clientHeight; const currentSpan = span(); const overview = currentSpan > 360;
    const authorsTop = 46; const worksTop = Math.round(height*(overview ? .65 : .61));
    const authorsHeight = Math.max(126,worksTop-authorsTop-10); const worksHeight = Math.max(90,height-worksTop-6);
    addLabel(authorHost,10,'Autoři',icons.person,'#6f54f6'); addLabel(workHost,worksTop+4,'Díla',icons.book,'#6f54f6');
    const people = DATA.people.filter(person => (person.group || 'maturity') === 'maturity' && person.end >= viewStart && person.start <= viewEnd && active.has('authors')).filter(person => !searchTerm || `${person.name} ${(person.keywords || []).join(' ')}`.toLowerCase().includes(searchTerm)).sort((a,b) => a.start-b.start || a.end-b.end);
    const authorItems = people.map(person => {
      const lifeLeft = xFor(Math.max(person.start,viewStart),width); const lifeRight = xFor(Math.min(person.end,viewEnd),width);
      const nameWidth = Math.min(overview ? 215 : 285,Math.max(150,76+person.name.length*5.8));
      const cardWidth = overview ? nameWidth : Math.min(320,Math.max(nameWidth,lifeRight-lifeLeft));
      const left = clamp(lifeLeft,46,width-cardWidth-18); return {person,left,right:left+cardWidth,width:cardWidth};
    });
    const authorRows = Math.max(5,Math.min(8,Math.floor(authorsHeight/(overview ? 31 : 35)))); packRows(authorItems,authorRows,6);
    const authorGap = Math.max(30,authorsHeight/authorRows); const authorFragment = document.createDocumentFragment();
    authorItems.forEach(item => {
      const person = item.person; const top = authorsTop + item.row*authorGap; const card = document.createElement('a');
      card.className = 'author-card-live'; card.href = person.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'person'; card.dataset.id = person.id; card.dataset.authorId = person.id; card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="avatar"></span><b>${person.name}</b><small>${person.start}–${person.end}</small>`; mountImage(person,card.querySelector('.avatar'),person.name);
      const works = DATA.works.filter(work => work.authorId === person.id).map(work => work.title).join(' · '); const keywords = (person.keywords || []).join(' · ');
      card.onmouseenter = event => { showTip(event,person,`${person.start}–${person.end}`,[keywords,works && `Díla: ${works}`].filter(Boolean).join('\n')); showRelations(person.id,authorHost,workHost); };
      card.onmousemove = moveTip; card.onmouseleave = () => { hideTip(); scheduleClearRelations(authorHost,workHost); };
      authorFragment.appendChild(card);
    });
    authorHost.appendChild(authorFragment);
    const authorMap = new Map(DATA.people.map(person => [person.id,person]));
    const works = DATA.works.filter(work => active.has('works') && work.year >= viewStart && work.year <= viewEnd && (authorMap.get(work.authorId)?.group || 'maturity') === 'maturity').filter(work => !searchTerm || `${work.title} ${work.year} ${authorMap.get(work.authorId)?.name || ''}`.toLowerCase().includes(searchTerm)).sort((a,b) => a.year-b.year || a.title.localeCompare(b.title));
    const workItems = works.map(work => { const cardWidth = Math.min(overview ? 180 : 245,Math.max(96,68+work.title.length*5.5)); const point = xFor(work.year,width); const left = clamp(point-cardWidth/2,46,width-cardWidth-18); return {work,left,right:left+cardWidth,width:cardWidth}; });
    const workRows = Math.max(2,Math.min(5,Math.floor((worksHeight-38)/35))); packRows(workItems,workRows,7);
    const workBase = worksTop+39; const workGap = Math.max(34,(worksHeight-39)/Math.max(1,workRows)); const workFragment = document.createDocumentFragment();
    workItems.forEach(item => {
      const work = item.work; const top = workBase + item.row*workGap; const card = document.createElement('a');
      card.className = 'work-card-live'; card.href = work.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'work'; card.dataset.id = work.id; card.dataset.authorId = work.authorId; card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="work-thumb"></span><b>${work.title}</b><time>${work.year}</time>`; mountImage(work,card.querySelector('.work-thumb'),work.title);
      const author = authorMap.get(work.authorId); card.onmouseenter = event => { showTip(event,work,String(work.year),`${author?.name || ''}${(work.keywords || []).length ? ' · '+work.keywords.join(' · ') : ''}`); showRelations(work.authorId,authorHost,workHost); };
      card.onmousemove = moveTip; card.onmouseleave = () => { hideTip(); scheduleClearRelations(authorHost,workHost); }; workFragment.appendChild(card);
    });
    workHost.appendChild(workFragment);
  };

  const eventVisible = event => {
    if (event.end < viewStart || event.start > viewEnd || !active.has('events')) return false;
    if (searchTerm && !`${event.title} ${event.display || ''} ${event.summary || ''}`.toLowerCase().includes(searchTerm)) return false;
    const scope = eventScope(event); const categories = event.categories || [];
    if (scope === 'czech') return active.has('czech');
    if (scope === 'tech') return active.has('tech');
    if (categories.includes('war')) return active.has('wars') || active.has('war') || active.has('world');
    return active.has('world') || active.has('politics') || active.has('culture');
  };

  renderHistory = function renderHistoryProduction(width) {
    const host = document.getElementById('eventLayer'); host.innerHTML = '';
    const height = host.clientHeight; const events = DATA.events.filter(eventVisible).sort((a,b) => a.start-b.start || b.importance-a.importance);
    const empty = document.getElementById('empty'); empty.style.display = events.length ? 'none' : 'grid'; if (!events.length) return;
    const third = height/3; const currentSpan = span();
    const configs = {
      czech:{top:0,height:third,color:'#159ee5',label:'České dějiny',icon:icons.czech},
      world:{top:third,height:third,color:'#ef4545',label:'Svět & války',icon:icons.world},
      tech:{top:third*2,height:third,color:'#f39a18',label:'Vynálezy',icon:icons.tech}
    };
    Object.values(configs).forEach(config => { config.axis = config.top + config.height/2; });
    Object.values(configs).forEach(config => {
      const lane = document.createElement('div'); lane.className = 'history-lane'; lane.style.cssText = `top:${config.top}px;height:${config.height}px;--lane:${config.color}`;
      const axis = document.createElement('i'); axis.className = 'history-axis'; axis.style.top = `${config.axis-config.top}px`; lane.appendChild(axis); host.appendChild(lane);
      addLabel(host,config.top+5,config.label,config.icon,config.color,'lane-label');
    });

    Object.entries(configs).forEach(([scope,config]) => {
      const scoped = events.filter(event => eventScope(event) === scope);
      const pinOffsets = [0,-27,27,-51,51]; const pinEnds = Array(pinOffsets.length).fill(-Infinity); const pinFragment = document.createDocumentFragment();
      scoped.forEach(event => {
        const point = xFor((event.start+event.end)/2,width); const pinSize = event.importance >= 5 ? 29 : 23;
        let row = pinEnds.findIndex(end => point-end >= pinSize+4); if (row < 0) row = pinEnds.indexOf(Math.min(...pinEnds)); pinEnds[row] = point;
        const pin = document.createElement('a'); pin.className = `event-pin-live${event.importance >= 5 ? ' major' : ''}`; pin.href = event.wiki; pin.target = '_blank'; pin.rel = 'noopener noreferrer'; pin.dataset.kind = 'event'; pin.dataset.id = event.id; pin.style.cssText = `left:${point}px;top:${config.axis+pinOffsets[row]}px;--event:${config.color}`;
        mountImage(event,pin,event.title); pin.onmouseenter = mouseEvent => showTip(mouseEvent,event,event.display,event.summary); pin.onmousemove = moveTip; pin.onmouseleave = hideTip; pinFragment.appendChild(pin);
      });
      host.appendChild(pinFragment);

      const threshold = currentSpan > 450 ? 5 : currentSpan > 260 ? 4 : currentSpan > 130 ? 3 : 1;
      const candidates = scoped.filter(event => event.importance >= threshold).sort((a,b) => b.importance-a.importance || a.start-b.start).sort((a,b) => a.start-b.start);
      const rowTops = [config.top+4,config.top+43,config.axis+32]; const occupied = rowTops.map(() => []); const cardFragment = document.createDocumentFragment();
      candidates.forEach(event => {
        const point = xFor((event.start+event.end)/2,width); const overview = currentSpan > 450;
        const cardWidth = Math.min(overview ? 170 : 230,Math.max(overview ? 116 : 126,76+event.title.length*(overview ? 3.8 : 4.6)));
        let desired = clamp(point-cardWidth/2,112,width-cardWidth-16); const interval = {left:desired,right:desired+cardWidth};
        let row = occupied.findIndex(list => list.every(other => !overlap(interval,other,overview ? 4 : 7)));
        if (row < 0) {
          row = occupied.reduce((best,list,index) => list.length < occupied[best].length ? index : best,0);
          const last = occupied[row][occupied[row].length-1];
          if (last) desired = clamp(Math.max(desired,last.right+4),112,width-cardWidth-16);
        }
        const finalInterval = {left:desired,right:desired+cardWidth}; occupied[row].push(finalInterval);
        const top = rowTops[row]; const cardHeight = 39; if (top+cardHeight > config.top+config.height-3) return;
        const card = document.createElement('a'); card.className = 'event-card-live'; card.href = event.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'event'; card.dataset.id = event.id; card.style.cssText = `left:${desired}px;top:${top}px;width:${cardWidth}px;--event:${config.color}`;
        card.innerHTML = '<span class="event-image"></span><span class="event-text"><b></b><time></time></span>'; card.querySelector('b').textContent = event.title; card.querySelector('time').textContent = event.display; mountImage(event,card.querySelector('.event-image'),event.title);
        card.onmouseenter = mouseEvent => showTip(mouseEvent,event,event.display,event.summary); card.onmousemove = moveTip; card.onmouseleave = hideTip; cardFragment.appendChild(card);
        const stem = document.createElement('i'); stem.className = 'event-stem-live'; stem.style.cssText = `left:${point}px;--event:${config.color}`;
        if (top < config.axis) { stem.style.top = `${top+cardHeight}px`; stem.style.height = `${Math.max(1,config.axis-top-cardHeight-15)}px`; }
        else { stem.style.top = `${config.axis+15}px`; stem.style.height = `${Math.max(1,top-config.axis-15)}px`; }
        cardFragment.appendChild(stem);
      });
      host.appendChild(cardFragment);
    });
  };

  renderPeriods = function renderPeriodsProduction(width) {
    const host = document.getElementById('periodLayer'); host.innerHTML = '';
    const periods = curatedPeriods.filter(period => period.end >= viewStart && period.start <= viewEnd && (period.scope === 'world' ? active.has('world-periods') : active.has('czech-periods'))).sort((a,b) => a.start-b.start);
    const height = host.clientHeight || 92; const fragment = document.createDocumentFragment();
    periods.forEach(period => {
      const startX = clamp(xFor(Math.max(period.start,viewStart),width),2,width-2); const endX = clamp(xFor(Math.min(period.end,viewEnd),width),2,width-2); const periodWidth = endX-startX; if (periodWidth < 28) return;
      const top = 5 + period.row*29; if (top+27 > height) return; const card = document.createElement('a'); card.className = `period-card-live${periodWidth < 112 ? ' compact' : ''}`; card.href = period.wiki; card.target = '_blank'; card.rel = 'noopener noreferrer'; card.dataset.kind = 'period'; card.dataset.id = period.id; card.style.cssText = `left:${startX+2}px;top:${top}px;width:${Math.max(26,periodWidth-4)}px;--era:${period.color}`; card.innerHTML = `<b>${period.title}</b><time>${period.start}–${period.end}</time>`;
      card.onmouseenter = event => showTip(event,period,`${period.start}–${period.end}`,'Historické období'); card.onmousemove = moveTip; card.onmouseleave = hideTip; fragment.appendChild(card);
    });
    host.appendChild(fragment);
  };

  const crosshairBand = document.createElement('div'); crosshairBand.className = 'crosshair-band';
  const crosshairLine = document.createElement('div'); crosshairLine.className = 'crosshair-line';
  const crosshairYear = document.createElement('div'); crosshairYear.className = 'crosshair-year';
  const crosshairContext = document.createElement('div'); crosshairContext.className = 'crosshair-context';
  timeline.append(crosshairBand,crosshairLine,crosshairYear,crosshairContext);
  let crosshairRatio = .5;
  const updateCrosshair = ratio => {
    crosshairRatio = Math.max(0,Math.min(1,ratio)); const point = crosshairRatio*timeline.clientWidth; const year = Math.round(viewStart+span()*crosshairRatio);
    [crosshairBand,crosshairLine,crosshairYear,crosshairContext].forEach(element => element.style.left = `${point}px`); crosshairYear.textContent = year;
    const periods = curatedPeriods.filter(period => period.start <= year && period.end >= year).sort((a,b) => a.row-b.row); crosshairContext.textContent = periods.length ? periods.slice(0,2).map(period => period.title).join(' · ') : `Rok ${year}`;
  };
  timeline.addEventListener('pointermove',event => { if (event.target.closest('a,button,input,.info-panel,.range-popover')) return; const rect = timeline.getBoundingClientRect(); updateCrosshair((event.clientX-rect.left)/rect.width); });

  const zoomPanel = document.createElement('div'); zoomPanel.className = 'zoom-panel'; zoomPanel.innerHTML = '<button type="button" data-zoom="out" aria-label="Oddálit">−</button><input type="range" min="0" max="100" step="1" aria-label="Přiblížení časové osy"><button type="button" data-zoom="in" aria-label="Přiblížit">+</button><span></span>';
  const zoomPresets = document.createElement('div'); zoomPresets.className = 'zoom-presets'; zoomPresets.innerHTML = '<button data-range="all">Celá osa</button><button data-range="19">19. století</button><button data-range="20">20. století</button><button data-range="modern">1945–dnes</button>';
  const zoomHelp = document.createElement('div'); zoomHelp.className = 'zoom-help'; zoomHelp.textContent = 'Kolečko / trackpad = zoom · tažením posuneš osu · dvojklik přiblíží';
  timeline.append(zoomPanel,zoomPresets,zoomHelp);
  const zoomSlider = zoomPanel.querySelector('input'); const zoomValue = zoomPanel.querySelector('span');
  const spanToSlider = current => Math.round(100*Math.log(MAX_SPAN/Math.max(MIN_SPAN,Math.min(MAX_SPAN,current)))/Math.log(MAX_SPAN/MIN_SPAN));
  const sliderToSpan = value => MAX_SPAN*Math.pow(MIN_SPAN/MAX_SPAN,Number(value)/100);
  const updateZoomUI = () => { const current = span(); zoomSlider.value = String(spanToSlider(current)); zoomValue.textContent = current < 25 ? `${current.toFixed(1)} roku` : `${Math.round(current)} let`; updateCrosshair(crosshairRatio); const range = document.getElementById('rangeButtonLabel'); if (range) range.textContent = `${Math.round(viewStart)}–${Math.round(viewEnd)}`; };

  let pendingRange = null; let rangeTimer = null;
  const commitRange = () => { rangeTimer = null; if (!pendingRange) return; viewStart = pendingRange.start; viewEnd = pendingRange.end; pendingRange = null; render(); };
  const scheduleRange = (start,end) => {
    let nextSpan = Math.max(MIN_SPAN,Math.min(MAX_SPAN,end-start)); let center = (start+end)/2; start = center-nextSpan/2; end = center+nextSpan/2;
    if (start < START) { end += START-start; start = START; } if (end > END) { start -= end-END; end = END; }
    pendingRange = {start,end}; if (!rangeTimer) rangeTimer = setTimeout(commitRange,45);
  };
  const zoomAt = (factor,ratio=.5) => { const current = span(); const next = Math.max(MIN_SPAN,Math.min(MAX_SPAN,current*factor)); const anchor = viewStart+current*ratio; const start = anchor-next*ratio; scheduleRange(start,start+next); };
  zoomSlider.addEventListener('input',() => { const center = (viewStart+viewEnd)/2; const next = sliderToSpan(zoomSlider.value); scheduleRange(center-next/2,center+next/2); });
  zoomPanel.querySelector('[data-zoom="in"]').onclick = () => zoomAt(.7,.5); zoomPanel.querySelector('[data-zoom="out"]').onclick = () => zoomAt(1.43,.5);
  const zoomInButton = document.getElementById('zoomIn'); if (zoomInButton) zoomInButton.onclick = () => zoomAt(.7,.5);
  const zoomOutButton = document.getElementById('zoomOut'); if (zoomOutButton) zoomOutButton.onclick = () => zoomAt(1.43,.5);
  const fitButton = document.getElementById('fit'); if (fitButton) fitButton.onclick = () => scheduleRange(START,END);
  zoomPresets.querySelectorAll('button').forEach(button => button.onclick = () => { const range = button.dataset.range; if (range === 'all') scheduleRange(START,END); if (range === '19') scheduleRange(1801,1900); if (range === '20') scheduleRange(1901,2000); if (range === 'modern') scheduleRange(1945,END); });
  timeline.addEventListener('wheel',event => {
    if (event.target.closest('input,button,.info-panel,.range-popover')) return; event.preventDefault(); const rect = timeline.getBoundingClientRect(); const ratio = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)*.7) { const delta = (event.deltaX+(event.shiftKey ? event.deltaY : 0))/Math.max(1,rect.width)*span(); scheduleRange(viewStart+delta,viewEnd+delta); }
    else zoomAt(Math.exp(event.deltaY*.0013),ratio);
  },{passive:false});
  timeline.addEventListener('dblclick',event => { if (event.target.closest('a,button,input')) return; const rect = timeline.getBoundingClientRect(); zoomAt(.5,(event.clientX-rect.left)/rect.width); });
  let drag = null;
  timeline.addEventListener('pointerdown',event => { if (event.button !== 0 || event.target.closest('a,button,input,.info-panel,.range-popover')) return; drag = {x:event.clientX,start:viewStart,end:viewEnd}; timeline.setPointerCapture(event.pointerId); shell.classList.add('is-panning'); });
  timeline.addEventListener('pointermove',event => { if (!drag) return; const years = -(event.clientX-drag.x)/Math.max(1,timeline.clientWidth)*(drag.end-drag.start); scheduleRange(drag.start+years,drag.end+years); });
  const endDrag = event => { if (!drag) return; drag = null; shell.classList.remove('is-panning'); try { timeline.releasePointerCapture(event.pointerId); } catch (_) { } };
  timeline.addEventListener('pointerup',endDrag); timeline.addEventListener('pointercancel',endDrag);

  const toolbar = document.createElement('div'); toolbar.className = 'app-toolbar';
  toolbar.innerHTML = `<button data-action="theme" title="Světlý / tmavý režim">${icons.moon}</button><button data-action="axes" title="Pouze časové osy">${icons.axes}</button><button data-action="fullscreen" title="Celá obrazovka">${icons.full}</button>`;
  document.querySelector('.topbar')?.appendChild(toolbar);
  const floating = document.createElement('div'); floating.className = 'floating-ui'; floating.innerHTML = `<button data-action="exit-axes" title="Vrátit celé rozhraní">${icons.close}</button><button data-action="theme" title="Světlý / tmavý režim">${icons.moon}</button><button data-action="fullscreen" title="Celá obrazovka">${icons.full}</button>`; document.body.appendChild(floating);
  const savedTheme = localStorage.getItem('casovrstvy-theme') || 'light'; document.documentElement.dataset.theme = savedTheme;
  const updateThemeIcons = () => document.querySelectorAll('[data-action="theme"]').forEach(button => button.innerHTML = document.documentElement.dataset.theme === 'dark' ? icons.sun : icons.moon);
  const toggleTheme = () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; localStorage.setItem('casovrstvy-theme',next); updateThemeIcons(); };
  const toggleAxes = force => { const next = typeof force === 'boolean' ? force : !document.body.classList.contains('axes-only'); document.body.classList.toggle('axes-only',next); toolbar.querySelector('[data-action="axes"]')?.classList.toggle('is-active',next); setTimeout(render,20); };
  const toggleFullscreen = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch (_) { } };
  toolbar.querySelector('[data-action="theme"]').onclick = toggleTheme; toolbar.querySelector('[data-action="axes"]').onclick = () => toggleAxes(); toolbar.querySelector('[data-action="fullscreen"]').onclick = toggleFullscreen;
  floating.querySelector('[data-action="exit-axes"]').onclick = () => toggleAxes(false); floating.querySelector('[data-action="theme"]').onclick = toggleTheme; floating.querySelector('[data-action="fullscreen"]').onclick = toggleFullscreen; updateThemeIcons();
  const oldCollapse = document.getElementById('collapse');
  if (oldCollapse) {
    const collapse = oldCollapse.cloneNode(true); oldCollapse.replaceWith(collapse); collapse.title = 'Skrýt nebo zobrazit boční menu'; collapse.innerHTML = icons.sidebar;
    collapse.onclick = () => { if (innerWidth <= 820) appRoot.classList.toggle('mobile-open'); else appRoot.classList.toggle('sidebar-collapsed'); setTimeout(render,25); };
  }
  document.addEventListener('keydown',event => { if (event.key.toLowerCase() === 'f' && !event.target.closest('input,textarea')) toggleAxes(); if (event.key === 'Escape' && document.body.classList.contains('axes-only') && !document.fullscreenElement) toggleAxes(false); });

  const originalRender = render;
  render = function renderProduction() { originalRender(); requestAnimationFrame(updateZoomUI); };
  window.addEventListener('resize',() => requestAnimationFrame(render));
  viewStart = START; viewEnd = END;
  importantEvents.filter(event => event[4] >= 5).forEach((event,index) => setTimeout(() => { const item = DATA.events.find(candidate => candidate.start === event[1] && normalized(candidate.title).includes(normalized(event[0]).slice(0,10))); if (item) resolveImage(item); },index*35));
  requestAnimationFrame(() => { render(); updateCrosshair(.5); });
})();

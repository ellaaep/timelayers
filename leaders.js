(() => {
  'use strict';

  const CURRENT = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const crownIcon = '<svg viewBox="0 0 24 24"><path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Zm3 14h12"/></svg>';
  const laneIcons = {
    ruler: crownIcon,
    czech: '<svg viewBox="0 0 24 24"><path d="M3 9h18M5 9v9m4-9v9m6-9v9m4-9v9M3 20h18M12 3l9 5H3l9-5Z"/></svg>',
    world: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4.5 6 4.5 9S15 18 12 21M12 3c-3 3-4.5 6-4.5 9S9 18 12 21"/></svg>',
    tech: '<svg viewBox="0 0 24 24"><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-10 0c0 2 1.1 3.2 2.2 4.2.6.6.8 1.1.8 1.8h4c0-.7.2-1.2.8-1.8C15.9 13.2 17 12 17 10Z"/></svg>'
  };

  const leaderRows = [
    ['Karel IV.',1346,1378,'Země Koruny české','český král a římský císař',5,'Karel IV.'],
    ['Václav IV.',1378,1419,'České království','český král',4,'Václav IV.'],
    ['Zikmund Lucemburský',1419,1437,'České království','český král a římský císař',5,'Zikmund Lucemburský'],
    ['Albrecht II. Habsburský',1437,1439,'České království','český král',3,'Albrecht II. Habsburský'],
    ['Fridrich III. Habsburský',1440,1452,'střední Evropa','římský král a poručník Ladislava Pohrobka',4,'Fridrich III. Habsburský',true],
    ['Jiří z Poděbrad',1452,1471,'České země','zemský správce, poté český král',5,'Jiří z Poděbrad'],
    ['Ladislav Pohrobek',1453,1457,'České království','český král',3,'Ladislav Pohrobek'],
    ['Matyáš Korvín',1469,1490,'Morava, Slezsko a Lužice','protikrál a uherský král',4,'Matyáš Korvín'],
    ['Vladislav II. Jagellonský',1471,1516,'České království','český a uherský král',4,'Vladislav Jagellonský'],
    ['Ludvík Jagellonský',1516,1526,'České království','český a uherský král',3,'Ludvík Jagellonský'],
    ['Ferdinand I. Habsburský',1526,1564,'České země','český král',4,'Ferdinand I. Habsburský'],
    ['Maxmilián II.',1564,1576,'České země','český král a římský císař',3,'Maxmilián II. Habsburský'],
    ['Rudolf II.',1576,1611,'České země','český král a římský císař',5,'Rudolf II.'],
    ['Matyáš Habsburský',1611,1619,'České země','český král a římský císař',3,'Matyáš Habsburský'],
    ['Ferdinand II.',1617,1637,'České země','český král a římský císař',4,'Ferdinand II. Štýrský'],
    ['Fridrich Falcký',1619,1620,'České království','zvolený český král',4,'Fridrich Falcký'],
    ['Ferdinand III.',1637,1657,'České země','český král a římský císař',3,'Ferdinand III. Habsburský'],
    ['Ferdinand IV.',1646,1654,'České země','korunovaný spolukrál',2,'Ferdinand IV. Habsburský'],
    ['Leopold I.',1657,1705,'České země','český král a římský císař',4,'Leopold I.'],
    ['Josef I.',1705,1711,'České země','český král a římský císař',3,'Josef I. Habsburský'],
    ['Karel VI.',1711,1740,'České země','český král a římský císař',4,'Karel VI.'],
    ['Marie Terezie',1740,1780,'České země','česká a uherská královna',5,'Marie Terezie'],
    ['Karel Albrecht',1741,1743,'České země','protikrál během války o rakouské dědictví',3,'Karel VII. Bavorský'],
    ['Josef II.',1780,1790,'České země','český král a reformátor',5,'Josef II.'],
    ['Leopold II.',1790,1792,'České země','český král a římský císař',3,'Leopold II.'],
    ['František I.',1792,1835,'České země','český král a rakouský císař',4,'František I. Rakouský'],
    ['Ferdinand V.',1835,1848,'České země','český král a rakouský císař',3,'Ferdinand I. Dobrotivý'],
    ['František Josef I.',1848,1916,'Rakousko-Uhersko','rakouský císař a český král',5,'František Josef I.'],
    ['Karel I.',1916,1918,'Rakousko-Uhersko','rakouský císař a český král',4,'Karel I. Rakouský'],
    ['Tomáš Garrigue Masaryk',1918,1935,'Československo','prezident republiky',5,'Tomáš Garrigue Masaryk'],
    ['Edvard Beneš',1935,1938,'Československo','prezident republiky',5,'Edvard Beneš'],
    ['Emil Hácha',1938,1945,'Česko-Slovensko a Protektorát','prezident a státní prezident',4,'Emil Hácha'],
    ['Edvard Beneš',1940,1948,'exil a Československo','prezident v exilu, poté prezident republiky',5,'Edvard Beneš'],
    ['Klement Gottwald',1948,1953,'Československo','prezident republiky',5,'Klement Gottwald'],
    ['Antonín Zápotocký',1953,1957,'Československo','prezident republiky',3,'Antonín Zápotocký'],
    ['Antonín Novotný',1957,1968,'Československo','prezident republiky',4,'Antonín Novotný'],
    ['Ludvík Svoboda',1968,1975,'Československo','prezident republiky',4,'Ludvík Svoboda'],
    ['Gustáv Husák',1975,1989,'Československo','prezident republiky',5,'Gustáv Husák'],
    ['Václav Havel',1989,1992,'Československo','prezident republiky',5,'Václav Havel'],
    ['Jan Stráský',1992.55,1992.99,'ČSFR','předseda vlády vykonávající část prezidentských pravomocí',2,'Jan Stráský',true],
    ['Václav Havel',1993,2003,'Česká republika','prezident republiky',5,'Václav Havel'],
    ['Václav Klaus',2003,2013,'Česká republika','prezident republiky',4,'Václav Klaus'],
    ['Miloš Zeman',2013,2023,'Česká republika','prezident republiky',4,'Miloš Zeman'],
    ['Petr Pavel',2023,CURRENT,'Česká republika','současný prezident republiky',5,'Petr Pavel']
  ];

  const leaders = leaderRows.map(([title,start,end,region,role,importance,wikiTitle,fallback],index) => ({
    id:`cz-leader-${index}`, title, start, end, display:title === 'Petr Pavel' ? '2023–dnes' : `${Math.floor(start)}–${Math.floor(end)}`,
    scope:'ruler', categories:['ruler'], region, role, importance, wikiTitle, fallback:Boolean(fallback),
    summary:`${title}: ${role}, ${region}.`, wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle)}`
  }));

  const durationRules = [
    {id:'duration-ww1',match:title => /prvni svetov.*valk/.test(title),title:'První světová válka',start:1914,end:1918,scope:'world',categories:['world-history','war'],importance:5,wikiTitle:'První světová válka',summary:'Celosvětový válečný konflikt v letech 1914–1918.'},
    {id:'duration-spanish-flu',match:title => /spanelsk.*chrip/.test(title),title:'Pandemie španělské chřipky',start:1918,end:1920,scope:'world',categories:['world-history','science'],importance:4,wikiTitle:'Španělská chřipka',summary:'Celosvětová pandemie chřipky v letech 1918–1920.'},
    {id:'duration-depression',match:title => /(svetov|velk).*hospodarsk.*kriz|globalni financni krize 1929/.test(title),title:'Velká hospodářská krize',start:1929,end:1939,scope:'world',categories:['world-history','politics'],importance:5,wikiTitle:'Velká hospodářská krize',summary:'Hluboká světová hospodářská krize začínající roku 1929.'},
    {id:'duration-ww2',match:title => /druh.*svetov.*valk/.test(title),title:'Druhá světová válka',start:1939,end:1945,scope:'world',categories:['world-history','war'],importance:5,wikiTitle:'Druhá světová válka',summary:'Celosvětový válečný konflikt v letech 1939–1945.'},
    {id:'duration-cold-war',match:title => /^studena valka$/.test(title),title:'Studená válka',start:1947,end:1991,scope:'world',categories:['world-history','war','politics'],importance:5,wikiTitle:'Studená válka',summary:'Globální politické a vojenské soupeření v letech 1947–1991.'},
    {id:'duration-berlin-wall',match:title => /stavba berlinske zdi|^berlinska zed$/.test(title),title:'Berlínská zeď',start:1961,end:1989,scope:'world',categories:['world-history','politics'],importance:4,wikiTitle:'Berlínská zeď',summary:'Berlínská zeď oddělovala Západní Berlín od okolního území v letech 1961–1989.'},
    {id:'duration-prague-spring',match:title => /prazske jaro a invaze/.test(title),title:'Pražské jaro',start:1968,end:1968.65,scope:'czech',categories:['czech-history','politics'],importance:5,wikiTitle:'Pražské jaro',summary:'Reformní proces v Československu v roce 1968.'},
    {id:'duration-financial-crisis',match:title => /globalni financni krize|svetova financni krize 2008/.test(title),title:'Globální finanční krize',start:2007,end:2009,scope:'world',categories:['world-history','politics'],importance:4,wikiTitle:'Světová finanční krize 2008',summary:'Globální finanční a hospodářská krize v letech 2007–2009.'},
    {id:'duration-covid',match:title => /^pandemie covidu 19$/.test(title),title:'Pandemie covidu-19',start:2020,end:2023,scope:'world',categories:['world-history','science'],importance:5,wikiTitle:'Pandemie covidu-19',summary:'Celosvětová pandemie covidu-19.'},
    {id:'point-eu',match:title => /cesk.*republik.*vstup.*evrop|vstup cesk.*evrop/.test(title),title:'Vstup Česka do Evropské unie',start:2004,end:2004,scope:'czech',categories:['czech-history','politics'],importance:4,wikiTitle:'Vstup Česka do Evropské unie',summary:'Česká republika vstoupila do Evropské unie 1. května 2004.'}
  ];

  const applyDurationRules = () => {
    const original = DATA.events.filter(event => !(event.categories || []).includes('ruler'));
    const consumed = new Set();
    const corrected = [];

    durationRules.forEach(rule => {
      const matches = original.filter(event => !consumed.has(event) && rule.match(normalize(event.title)));
      if (!matches.length) return;
      const base = matches.sort((a,b) => b.importance-a.importance || a.start-b.start)[0];
      matches.forEach(event => consumed.add(event));
      corrected.push({
        ...base,
        id:rule.id,
        title:rule.title,
        start:rule.start,
        end:rule.end,
        display:rule.start === rule.end ? String(Math.floor(rule.start)) : `${Math.floor(rule.start)}–${Math.floor(rule.end)}`,
        scope:rule.scope,
        categories:rule.categories,
        importance:rule.importance,
        wikiTitle:rule.wikiTitle,
        wiki:`https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(rule.wikiTitle)}`,
        summary:rule.summary
      });
    });

    const seen = new Set();
    original.forEach(event => {
      if (consumed.has(event)) return;
      const start = Number.isFinite(Number(event.start)) ? Number(event.start) : Number(event.year);
      const end = Number.isFinite(Number(event.end)) ? Math.max(start,Number(event.end)) : start;
      const key = `${normalize(event.title)}|${Math.round(start*100)/100}|${eventScope(event)}`;
      if (seen.has(key)) return;
      seen.add(key);
      corrected.push({...event,start,end,display:event.display || (end > start ? `${Math.floor(start)}–${Math.floor(end)}` : String(Math.floor(start))) });
    });

    DATA.events = corrected.concat(leaders);
  };

  active.add('rulers');
  applyDurationRules();

  const style = document.createElement('style');
  style.textContent = `
    .ruler-filter{margin-top:7px!important;padding-top:8px!important;border-top:1px solid var(--line)!important;border-radius:0!important}
    .leader-card-live{position:absolute;z-index:30;height:34px;padding:3px 9px 3px 4px;border:1px solid color-mix(in srgb,var(--leader) 55%,var(--line));border-left:3px solid var(--leader);border-radius:999px;background:color-mix(in srgb,var(--leader) 10%,var(--panel));display:flex;align-items:center;gap:7px;color:var(--ink);box-shadow:0 4px 13px rgba(75,53,20,.08);overflow:hidden;transition:.14s ease}
    .leader-card-live:hover{z-index:70;transform:translateY(-1px);background:var(--panel);border-color:var(--leader);box-shadow:0 10px 24px color-mix(in srgb,var(--leader) 22%,transparent)}
    .leader-card-live.fallback{border-style:dashed;opacity:.82}
    .leader-card-live.compact{padding-right:4px}
    .leader-card-live.compact .leader-copy{display:none}
    .leader-image{width:26px;height:26px;flex:0 0 26px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--leader) 15%,var(--panel-soft))}
    .leader-image img{width:100%;height:100%;display:block;object-fit:cover}
    .leader-copy{min-width:0;display:flex;flex-direction:column;line-height:1.02}
    .leader-copy b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9.5px;font-weight:770}
    .leader-copy small{margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7.4px;color:var(--muted)}

    .timeline-event-card{position:absolute;z-index:24;height:45px;border:2px solid var(--event);border-radius:10px;overflow:hidden;background:color-mix(in srgb,var(--event) 18%,var(--panel));box-shadow:0 5px 15px rgba(26,31,47,.13);transition:transform .14s ease,box-shadow .14s ease;isolation:isolate}
    .timeline-event-card:hover{z-index:75;transform:translateY(-2px);box-shadow:0 12px 28px rgba(21,26,42,.25)}
    .timeline-event-card .timeline-event-media{position:absolute;inset:0;z-index:0;background:color-mix(in srgb,var(--event) 22%,var(--panel-soft))}
    .timeline-event-card .timeline-event-media img{width:100%;height:100%;display:block;object-fit:cover;object-position:center}
    .timeline-event-card::after{content:"";position:absolute;z-index:1;inset:0;background:linear-gradient(90deg,rgba(10,14,24,.82),rgba(10,14,24,.45) 62%,rgba(10,14,24,.12));pointer-events:none}
    .timeline-event-card.duration::after{background:linear-gradient(90deg,rgba(10,14,24,.86),rgba(10,14,24,.46) 54%,rgba(10,14,24,.18))}
    .timeline-event-card.war{--event:#e53935!important;border-color:#e53935!important;background:#b71c1c!important;box-shadow:0 5px 16px rgba(211,47,47,.25)}
    .timeline-event-card.war::before{content:"";position:absolute;z-index:1;inset:0;background:rgba(183,28,28,.42);mix-blend-mode:multiply;pointer-events:none}
    .timeline-event-copy{position:absolute;z-index:3;left:7px;right:6px;bottom:5px;display:flex;flex-direction:column;line-height:1.03;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);pointer-events:none}
    .timeline-event-copy b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;font-weight:800}
    .timeline-event-copy time{margin-top:3px;font-size:7.5px;font-weight:750;color:rgba(255,255,255,.86);font-variant-numeric:tabular-nums}
    .timeline-event-card.compact{height:38px;border-radius:9px}
    .timeline-event-card.compact .timeline-event-copy b{font-size:7.7px}
    .timeline-event-card.compact .timeline-event-copy time{font-size:6.8px}
    .timeline-event-card.icon-only{width:38px!important}
    .timeline-event-card.icon-only .timeline-event-copy{display:none}
    .timeline-event-card.icon-only::after{background:linear-gradient(180deg,transparent,rgba(10,14,24,.22))}
    .timeline-event-card.war.icon-only::before{background:rgba(183,28,28,.28)}
    html[data-theme="dark"] .leader-card-live{background:color-mix(in srgb,var(--leader) 14%,var(--panel))}
    @media(max-width:1180px){
      .leader-copy small{display:none}
      .leader-card-live{height:31px}
      .leader-image{width:23px;height:23px;flex-basis:23px}
      .timeline-event-card{height:41px}
      .timeline-event-copy b{font-size:8.2px}
    }
  `;
  document.head.appendChild(style);

  const filterList = document.querySelector('.filter-list');
  if (filterList) {
    filterList.querySelector('[data-id="rulers"]')?.remove();
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'filter active ruler-filter';
    row.dataset.id = 'rulers';
    row.style.setProperty('--c','#b8872f');
    row.innerHTML = `<span class="filter-icon">${crownIcon}</span><span class="filter-label">Vládci a prezidenti</span><span class="switch"><i></i></span>`;
    row.onclick = () => { active.has('rulers') ? active.delete('rulers') : active.add('rulers'); row.classList.toggle('active',active.has('rulers')); render(); };
    filterList.appendChild(row);
  }

  const aliases = new Map(Object.entries({
    'prvni prima volba prezidenta cr':'Prezidentské volby v Česku 2013',
    'ceska republika vstupuje do evropske unie':'Vstup Česka do Evropské unie',
    'vstup ceske republiky do evropske unie':'Vstup Česka do Evropské unie',
    'globalni financni krize':'Světová finanční krize 2008',
    'genove editovani crispr cas9':'CRISPR',
    'nastup modernich smartphonu':'Smartphone',
    'prvni nouzovy stav kvuli covidu 19':'Pandemie covidu-19 v Česku',
    'pandemie covidu 19':'Pandemie covidu-19',
    'teroristicke utoky 11 zari':'Teroristické útoky 11. září 2001',
    'predstaveni prvniho iphonu':'iPhone (1. generace)',
    'hana':'Hana (román)',
    'alchymista':'Alchymista (román)',
    'berlinska zed':'Berlínská zeď',
    'prvni svetova valka':'První světová válka',
    'druha svetova valka':'Druhá světová válka'
  }));
  const cacheKey = 'casovrstvy-smart-images-v3';
  let disk = {};
  try { disk = JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch (_) { disk = {}; }
  const memory = new Map(Object.entries(disk));
  const pending = new Map();
  const keyFor = item => aliases.get(normalize(item.title || item.name || item.wikiTitle)) || item.wikiTitle || item.title || item.name || item.id;

  const queryImage = async (title,lang,searchMode) => {
    try {
      const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
      const params = searchMode
        ? {action:'query',generator:'search',gsrsearch:title,gsrnamespace:'0',gsrlimit:'7',prop:'pageimages|pageprops',piprop:'thumbnail|original',pithumbsize:'900',format:'json',formatversion:'2',origin:'*'}
        : {action:'query',titles:title,redirects:'1',prop:'pageimages|pageprops',piprop:'thumbnail|original',pithumbsize:'900',format:'json',formatversion:'2',origin:'*'};
      Object.entries(params).forEach(([key,value]) => url.searchParams.set(key,value));
      const response = await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
      if (!response.ok) return null;
      const pages = (await response.json()).query?.pages || [];
      const page = pages.find(item => item.thumbnail?.source || item.original?.source) || pages[0];
      return page && !page.missing ? page.thumbnail?.source || page.original?.source || null : null;
    } catch (_) { return null; }
  };

  const fallbackImage = item => {
    const isLeader = (item.categories || []).includes('ruler');
    const isWar = (item.categories || []).includes('war');
    const color = isLeader ? '#b8872f' : isWar ? '#d32f2f' : item.scope === 'tech' ? '#f39a18' : item.scope === 'czech' ? '#159ee5' : item.scope === 'world' ? '#ef4545' : '#6f54f6';
    const glyph = isLeader ? '♛' : isWar ? '⚔' : item.scope === 'tech' ? '✦' : item.scope === 'czech' ? '⌂' : item.scope === 'world' ? '◎' : '▤';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><defs><linearGradient id="g"><stop stop-color="${color}"/><stop offset="1" stop-color="#252b3c"/></linearGradient></defs><rect width="160" height="100" rx="14" fill="url(#g)"/><text x="80" y="65" text-anchor="middle" font-size="42" fill="white">${glyph}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const resolveImage = item => {
    const key = keyFor(item);
    if (memory.has(key)) return Promise.resolve(memory.get(key));
    if (pending.has(key)) return pending.get(key);
    const promise = (async () => {
      let source = item.image || null;
      const candidates = [...new Set([key,item.wikiTitle,item.title,item.name].filter(Boolean))];
      for (const candidate of candidates) {
        for (const lang of ['cs','en']) {
          source ||= await queryImage(candidate,lang,false);
          source ||= await queryImage(candidate,lang,true);
          if (source) break;
        }
        if (source) break;
      }
      source ||= fallbackImage(item);
      memory.set(key,source); disk[key] = source;
      try { localStorage.setItem(cacheKey,JSON.stringify(disk)); } catch (_) { }
      return source;
    })().finally(() => pending.delete(key));
    pending.set(key,promise);
    return promise;
  };

  const smartImage = (item,host,alt='') => {
    if (!item || !host) return;
    const key = keyFor(item);
    if (host.dataset.smartKey === key && host.querySelector('img')) return;
    host.dataset.smartKey = key;
    host.classList.add('image-loading');
    resolveImage(item).then(source => {
      if (!host.isConnected || host.dataset.smartKey !== key) return;
      const image = new Image();
      image.alt = alt;
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.onload = () => {
        if (!host.isConnected) return;
        host.replaceChildren(image);
        host.classList.remove('image-loading');
        host.classList.add('image-loaded');
      };
      image.src = source;
    });
  };

  const findItem = host => {
    const card = host.closest('[data-kind][data-id]');
    if (!card) return null;
    if (card.dataset.kind === 'person') return DATA.people.find(item => item.id === card.dataset.id);
    if (card.dataset.kind === 'work') return DATA.works.find(item => item.id === card.dataset.id);
    if (card.dataset.kind === 'event') return DATA.events.find(item => item.id === card.dataset.id);
    return null;
  };

  const hydrate = () => document.querySelectorAll('.author-card-live .avatar,.work-card-live .work-thumb,.timeline-event-media,.leader-image').forEach(host => {
    const item = findItem(host);
    if (item) smartImage(item,host,item.title || item.name || '');
  });

  const overlaps = (a,b,gap=5) => !(a.right+gap <= b.left || b.right+gap <= a.left);
  const addLabel = (host,top,text,icon,color) => {
    const label = document.createElement('div');
    label.className = 'lane-label';
    label.style.cssText = `top:${top}px;--lane:${color}`;
    label.innerHTML = icon + `<span>${text}</span>`;
    host.appendChild(label);
  };

  const visibleEvent = event => {
    if ((event.categories || []).includes('ruler')) return false;
    if (event.end < viewStart || event.start > viewEnd || !active.has('events')) return false;
    if (searchTerm && !`${event.title} ${event.display || ''} ${event.summary || ''}`.toLowerCase().includes(searchTerm)) return false;
    const scope = eventScope(event);
    const categories = event.categories || [];
    if (scope === 'czech') return active.has('czech');
    if (scope === 'tech') return active.has('tech');
    if (categories.includes('war')) return active.has('wars') || active.has('world');
    return active.has('world') || active.has('politics') || active.has('culture');
  };

  const isWarEvent = event => {
    const title = normalize(event.title);
    return (event.categories || []).includes('war') || /(valka|invaze|bitva|okupace|utok|atentat|povstani)/.test(title);
  };

  const chooseRow = (rows,interval) => {
    const free = rows.findIndex(items => items.every(other => !overlaps(interval,other,4)));
    if (free >= 0) return free;
    let best = 0;
    let bestScore = Infinity;
    rows.forEach((items,index) => {
      const score = items.reduce((total,other) => total + Math.max(0,Math.min(interval.right,other.right)-Math.max(interval.left,other.left)),0);
      if (score < bestScore) { bestScore = score; best = index; }
    });
    return best;
  };

  const makeEventCard = (event,config,width,currentSpan) => {
    const duration = Math.max(0,event.end-event.start);
    const startX = xFor(Math.max(event.start,viewStart),width);
    const endX = xFor(Math.min(event.end,viewEnd),width);
    const pointX = xFor((event.start+event.end)/2,width);
    const isDuration = duration > 0.2;
    const exactWidth = Math.max(0,endX-startX);
    const showText = currentSpan <= 360 || event.importance >= 5 || (isDuration && exactWidth >= 70);
    let cardWidth;
    let left;
    if (isDuration) {
      cardWidth = Math.max(showText ? 74 : 42,exactWidth);
      left = exactWidth < cardWidth ? pointX-cardWidth/2 : startX;
    } else {
      cardWidth = showText ? Math.min(164,Math.max(82,70+event.title.length*3.4)) : 38;
      left = pointX-cardWidth/2;
    }
    left = clamp(left,112,width-cardWidth-14);
    const war = isWarEvent(event);
    const color = war ? '#e53935' : config.color;
    const card = document.createElement('a');
    card.className = `timeline-event-card${isDuration ? ' duration' : ' point'}${showText ? '' : ' icon-only compact'}${war ? ' war' : ''}`;
    card.href = event.wiki;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.dataset.kind = 'event';
    card.dataset.id = event.id;
    card.style.cssText = `left:${left}px;width:${cardWidth}px;--event:${color}`;
    card.innerHTML = '<span class="timeline-event-media"></span><span class="timeline-event-copy"><b></b><time></time></span>';
    card.querySelector('b').textContent = event.title;
    card.querySelector('time').textContent = event.display || (isDuration ? `${Math.floor(event.start)}–${Math.floor(event.end)}` : String(Math.floor(event.start)));
    smartImage(event,card.querySelector('.timeline-event-media'),event.title);
    card.onmouseenter = mouseEvent => showTip(mouseEvent,event,event.display,event.summary);
    card.onmousemove = moveTip;
    card.onmouseleave = hideTip;
    return {card,left,right:left+cardWidth,isDuration,duration};
  };

  renderHistory = function renderHistoryChronologically(width) {
    const host = document.getElementById('eventLayer');
    host.innerHTML = '';
    const height = host.clientHeight;
    const events = DATA.events.filter(visibleEvent).sort((a,b) => a.start-b.start || (b.end-b.start)-(a.end-a.start) || b.importance-a.importance);
    document.getElementById('empty').style.display = events.length || active.has('rulers') ? 'none' : 'grid';

    const laneCount = active.has('rulers') ? 4 : 3;
    const laneHeight = height / laneCount;
    const configs = {};
    let laneIndex = 0;
    if (active.has('rulers')) configs.ruler = {top:laneHeight*laneIndex++,height:laneHeight,color:'#b8872f',label:'Vládci a prezidenti',icon:laneIcons.ruler};
    configs.czech = {top:laneHeight*laneIndex++,height:laneHeight,color:'#159ee5',label:'České dějiny',icon:laneIcons.czech};
    configs.world = {top:laneHeight*laneIndex++,height:laneHeight,color:'#ef4545',label:'Svět & války',icon:laneIcons.world};
    configs.tech = {top:laneHeight*laneIndex,height:laneHeight,color:'#f39a18',label:'Vynálezy',icon:laneIcons.tech};

    Object.values(configs).forEach(config => {
      const lane = document.createElement('div');
      lane.className = 'history-lane';
      lane.style.cssText = `top:${config.top}px;height:${config.height}px;--lane:${config.color}`;
      const axis = document.createElement('i');
      axis.className = 'history-axis';
      axis.style.top = `${config.height-1}px`;
      lane.appendChild(axis);
      host.appendChild(lane);
      addLabel(host,config.top+4,config.label,config.icon,config.color);
    });

    if (configs.ruler) {
      const config = configs.ruler;
      const scoped = leaders.filter(leader => leader.end >= viewStart && leader.start <= viewEnd).sort((a,b) => a.start-b.start || b.importance-a.importance);
      const rowCount = Math.max(1,Math.floor((config.height-30)/37));
      const rows = Array.from({length:rowCount},() => []);
      scoped.forEach(leader => {
        const startX = xFor(Math.max(leader.start,viewStart),width);
        const endX = xFor(Math.min(leader.end,viewEnd),width);
        const exactWidth = Math.max(0,endX-startX);
        const point = (startX+endX)/2;
        const currentSpan = span();
        const showText = currentSpan <= 380 || leader.importance >= 5 || exactWidth >= 110;
        const cardWidth = Math.max(showText ? 104 : 34,exactWidth);
        const left = clamp(exactWidth < cardWidth ? point-cardWidth/2 : startX,112,width-cardWidth-14);
        const interval = {left,right:left+cardWidth};
        const row = chooseRow(rows,interval);
        rows[row].push(interval);
        const top = config.top+29+row*37;
        if (top+34 > config.top+config.height-2) return;

        const card = document.createElement('a');
        card.className = `leader-card-live${leader.fallback ? ' fallback' : ''}${showText ? '' : ' compact'}`;
        card.href = leader.wiki;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.dataset.kind = 'event';
        card.dataset.id = leader.id;
        card.style.cssText = `left:${left}px;top:${top}px;width:${cardWidth}px;--leader:${leader.fallback ? '#7f8ca5' : '#b8872f'}`;
        card.innerHTML = `<span class="leader-image"></span><span class="leader-copy"><b>${leader.title}</b><small>${leader.display} · ${leader.region}</small></span>`;
        smartImage(leader,card.querySelector('.leader-image'),leader.title);
        card.onmouseenter = mouseEvent => showTip(mouseEvent,leader,leader.display,`${leader.role} · ${leader.region}`);
        card.onmousemove = moveTip;
        card.onmouseleave = hideTip;
        host.appendChild(card);
      });
    }

    ['czech','world','tech'].forEach(scope => {
      const config = configs[scope];
      const currentSpan = span();
      const scoped = events.filter(event => eventScope(event) === scope);
      const rowCount = Math.max(1,Math.floor((config.height-29)/48));
      const rows = Array.from({length:rowCount},() => []);
      const prepared = scoped.map(event => ({event,...makeEventCard(event,config,width,currentSpan)}))
        .sort((a,b) => Number(b.isDuration)-Number(a.isDuration) || b.duration-a.duration || b.event.importance-a.event.importance || a.event.start-b.event.start);

      prepared.forEach(item => {
        const interval = {left:item.left,right:item.right};
        const row = chooseRow(rows,interval);
        rows[row].push(interval);
        const top = config.top+29+row*48;
        if (top+45 > config.top+config.height-2) return;
        item.card.style.top = `${top}px`;
        host.appendChild(item.card);
      });
    });
  };

  const previousRender = render;
  render = function renderWithChronologicalBlocks() {
    previousRender();
    requestAnimationFrame(hydrate);
    setTimeout(hydrate,650);
  };

  requestAnimationFrame(() => {
    render();
    hydrate();
  });
})();
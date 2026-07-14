(() => {
  'use strict';

  const CURRENT = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const STORAGE_KEY = 'casovrstvy-selected-authors-v1';
  const IMPORTED_KEY = 'casovrstvy-imported-authors-v1';
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const slug = value => normalize(value).replace(/\s+/g,'-') || `author-${Date.now()}`;
  const wikiUrl = title => `https://cs.wikipedia.org/wiki/${encodeURIComponent(String(title).replace(/ /g,'_'))}`;
  const originalMaturityNames = new Set(DATA.people.filter(person => (person.group || 'maturity') === 'maturity').map(person => person.name));

  const catalog = [
    ['William Shakespeare',1564,1616,false,'William Shakespeare',[['Romeo a Julie',1597,'Romeo a Julie'],['Hamlet',1603,'Hamlet'],['Macbeth',1606,'Macbeth']]],
    ['Miguel de Cervantes',1547,1616,false,'Miguel de Cervantes',[['Důmyslný rytíř Don Quijote de la Mancha',1605,'Důmyslný rytíř Don Quijote de la Mancha']]],
    ['Molière',1622,1673,false,'Molière',[['Tartuffe',1664,'Tartuffe'],['Misantrop',1666,'Misantrop']]],
    ['Daniel Defoe',1660,1731,false,'Daniel Defoe',[['Robinson Crusoe',1719,'Robinson Crusoe']]],
    ['Jonathan Swift',1667,1745,false,'Jonathan Swift',[['Gulliverovy cesty',1726,'Gulliverovy cesty']]],
    ['Johann Wolfgang von Goethe',1749,1832,false,'Johann Wolfgang von Goethe',[['Utrpení mladého Werthera',1774,'Utrpení mladého Werthera'],['Faust',1808,'Faust (Goethe)']]],
    ['Jane Austenová',1775,1817,false,'Jane Austenová',[['Pýcha a předsudek',1813,'Pýcha a předsudek'],['Emma',1815,'Emma (román)']]],
    ['Victor Hugo',1802,1885,false,'Victor Hugo',[['Chrám Matky Boží v Paříži',1831,'Chrám Matky Boží v Paříži'],['Bídníci',1862,'Bídníci']]],
    ['Edgar Allan Poe',1809,1849,false,'Edgar Allan Poe',[['Jáma a kyvadlo',1842,'Jáma a kyvadlo'],['Havran',1845,'Havran (báseň)']]],
    ['Charles Dickens',1812,1870,false,'Charles Dickens',[['Oliver Twist',1838,'Oliver Twist'],['Nadějné vyhlídky',1861,'Nadějné vyhlídky']]],
    ['Fjodor Michajlovič Dostojevskij',1821,1881,false,'Fjodor Michajlovič Dostojevskij',[['Zločin a trest',1866,'Zločin a trest'],['Idiot',1869,'Idiot (román)'],['Bratři Karamazovi',1880,'Bratři Karamazovi']]],
    ['Lev Nikolajevič Tolstoj',1828,1910,false,'Lev Nikolajevič Tolstoj',[['Vojna a mír',1869,'Vojna a mír'],['Anna Kareninová',1878,'Anna Kareninová']]],
    ['Jules Verne',1828,1905,false,'Jules Verne',[['Dvacet tisíc mil pod mořem',1870,'Dvacet tisíc mil pod mořem'],['Cesta kolem světa za osmdesát dní',1872,'Cesta kolem světa za osmdesát dní']]],
    ['Mark Twain',1835,1910,false,'Mark Twain',[['Dobrodružství Toma Sawyera',1876,'Dobrodružství Toma Sawyera'],['Dobrodružství Huckleberryho Finna',1884,'Dobrodružství Huckleberryho Finna']]],
    ['Oscar Wilde',1854,1900,false,'Oscar Wilde',[['Obraz Doriana Graye',1890,'Obraz Doriana Graye']]],
    ['Franz Kafka',1883,1924,false,'Franz Kafka',[['Proměna',1915,'Proměna (povídka)'],['Proces',1925,'Proces (román)'],['Zámek',1926,'Zámek (román)']]],
    ['Virginia Woolfová',1882,1941,false,'Virginia Woolfová',[['Paní Dallowayová',1925,'Paní Dallowayová'],['K majáku',1927,'K majáku']]],
    ['J. R. R. Tolkien',1892,1973,false,'J. R. R. Tolkien',[['Hobit',1937,'Hobit'],['Pán prstenů',1954,'Pán prstenů']]],
    ['Antoine de Saint-Exupéry',1900,1944,false,'Antoine de Saint-Exupéry',[['Malý princ',1943,'Malý princ']]],
    ['Ernest Hemingway',1899,1961,false,'Ernest Hemingway',[['Stařec a moře',1952,'Stařec a moře']]],
    ['George Orwell',1903,1950,false,'George Orwell',[['Farma zvířat',1945,'Farma zvířat'],['1984',1949,'1984 (román)']]],
    ['Albert Camus',1913,1960,false,'Albert Camus',[['Cizinec',1942,'Cizinec (román)'],['Mor',1947,'Mor (román)']]],
    ['J. D. Salinger',1919,2010,false,'J. D. Salinger',[['Kdo chytá v žitě',1951,'Kdo chytá v žitě']]],
    ['Ray Bradbury',1920,2012,false,'Ray Bradbury',[['451 stupňů Fahrenheita',1953,'451 stupňů Fahrenheita']]],
    ['Gabriel García Márquez',1927,2014,false,'Gabriel García Márquez',[['Sto roků samoty',1967,'Sto roků samoty']]],
    ['Umberto Eco',1932,2016,false,'Umberto Eco',[['Jméno růže',1980,'Jméno růže']]],
    ['Margaret Atwoodová',1939,CURRENT,true,'Margaret Atwoodová',[['Příběh služebnice',1985,'Příběh služebnice']]],
    ['Haruki Murakami',1949,CURRENT,true,'Haruki Murakami',[['Norské dřevo',1987,'Norské dřevo'],['Kafka na pobřeží',2002,'Kafka na pobřeží']]],
    ['Stephen King',1947,CURRENT,true,'Stephen King',[['Carrie',1974,'Carrie (román)'],['Osvícení',1977,'Osvícení (román)'],['To',1986,'To (román)']]],
    ['Paulo Coelho',1947,CURRENT,true,'Paulo Coelho',[['Alchymista',1988,'Alchymista (román)']]],
    ['Kazuo Ishiguro',1954,CURRENT,true,'Kazuo Ishiguro',[['Soumrak dne',1989,'Soumrak dne'],['Neopouštěj mě',2005,'Neopouštěj mě']]],
    ['Neil Gaiman',1960,CURRENT,true,'Neil Gaiman',[['Američtí bohové',2001,'Američtí bohové'],['Koralina',2002,'Koralina']]],
    ['J. K. Rowlingová',1965,CURRENT,true,'J. K. Rowlingová',[['Harry Potter a Kámen mudrců',1997,'Harry Potter a Kámen mudrců']]],
    ['Alena Mornštajnová',1963,CURRENT,true,'Alena Mornštajnová',[['Hana',2017,'Hana (román)'],['Tiché roky',2019,'Tiché roky'],['Listopád',2021,'Listopád (román)']]]
  ];

  const ensureCatalog = () => {
    catalog.forEach(([name,start,end,living,wikiTitle,works]) => {
      let person = DATA.people.find(item => normalize(item.name) === normalize(name));
      if (!person) {
        person = {id:`catalog-${slug(name)}`,name,start,end,living,group:'catalog',wikiTitle,wiki:wikiUrl(wikiTitle),image:null,keywords:['známý autor']};
        DATA.people.push(person);
      } else {
        person.start = start;
        person.end = living ? CURRENT : end;
        person.living = living;
        person.wikiTitle = wikiTitle;
        person.wiki = wikiUrl(wikiTitle);
      }
      works.forEach(([title,year,workWikiTitle]) => {
        const exists = DATA.works.some(work => work.authorId === person.id && normalize(work.title) === normalize(title));
        if (!exists) DATA.works.push({id:`catalog-work-${slug(name)}-${slug(title)}`,title,year,authorId:person.id,wikiTitle:workWikiTitle,wiki:wikiUrl(workWikiTitle),image:null,keywords:[]});
      });
    });

    DATA.people.forEach(person => {
      if (person.end >= CURRENT || ['Alena Mornštajnová','Paulo Coelho','Margaret Atwoodová','Haruki Murakami','Stephen King','Kazuo Ishiguro','Neil Gaiman','J. K. Rowlingová'].some(name => normalize(name) === normalize(person.name))) {
        person.end = CURRENT;
        person.living = true;
      }
    });

    DATA.works.forEach(work => {
      if (normalize(work.title) === 'alchymista') {
        work.wikiTitle = 'Alchymista (román)';
        work.wiki = wikiUrl('Alchymista (román)');
      }
    });
  };
  ensureCatalog();

  const importedFromDisk = (() => {
    try { return JSON.parse(localStorage.getItem(IMPORTED_KEY) || '[]'); } catch (_) { return []; }
  })();
  importedFromDisk.forEach(entry => {
    if (!DATA.people.some(person => person.id === entry.person.id)) DATA.people.push(entry.person);
    (entry.works || []).forEach(work => { if (!DATA.works.some(item => item.id === work.id)) DATA.works.push(work); });
  });

  const defaultNames = ['William Shakespeare','Jane Austenová','Fjodor Michajlovič Dostojevskij','Franz Kafka','George Orwell','J. R. R. Tolkien','Paulo Coelho','Alena Mornštajnová'];
  const selected = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved)) saved.forEach(id => selected.add(id));
  } catch (_) { }
  if (!selected.size) defaultNames.forEach(name => { const person = DATA.people.find(item => normalize(item.name) === normalize(name)); if (person) selected.add(person.id); });

  const syncGroups = () => {
    DATA.people.forEach(person => { person.group = selected.has(person.id) ? 'maturity' : 'catalog'; });
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify([...selected])); } catch (_) { }
  };
  syncGroups();

  const style = document.createElement('style');
  style.textContent = `
    .range-tool{display:none!important}
    .author-builder{margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}
    .author-builder h3{margin:0 5px 10px;font-size:10px;letter-spacing:.14em;color:var(--faint);text-transform:uppercase}
    .author-search-row{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:6px}
    .author-search-row input{width:100%;height:36px;padding:0 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel-soft);color:var(--ink);font-size:11px;outline:none}
    .author-search-row input:focus{border-color:var(--purple);box-shadow:0 0 0 3px color-mix(in srgb,var(--purple) 13%,transparent)}
    .author-search-row button{height:36px;border:0;border-radius:9px;background:var(--purple);color:#fff;font-size:19px;cursor:pointer}
    .author-suggestions{display:flex;flex-direction:column;gap:4px;margin-top:7px;max-height:150px;overflow:auto}
    .author-suggestion{min-height:34px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);display:flex;align-items:center;justify-content:space-between;gap:7px;text-align:left;font-size:10px;cursor:pointer}
    .author-suggestion:hover{border-color:var(--purple);background:color-mix(in srgb,var(--purple) 6%,var(--panel))}
    .author-suggestion small{color:var(--muted);font-size:8px}
    .author-selected{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
    .author-chip{max-width:100%;height:27px;padding:0 7px 0 9px;border:1px solid color-mix(in srgb,var(--purple) 36%,var(--line));border-radius:999px;background:color-mix(in srgb,var(--purple) 7%,var(--panel));color:var(--ink);display:flex;align-items:center;gap:5px;font-size:9px}
    .author-chip span{max-width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .author-chip button{width:17px;height:17px;border:0;border-radius:50%;background:color-mix(in srgb,var(--purple) 13%,transparent);color:var(--muted);cursor:pointer;line-height:1}
    .author-presets{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:9px}
    .author-presets button{height:29px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--muted);font-size:8.5px;font-weight:700;cursor:pointer}
    .author-presets button:hover{color:var(--ink);border-color:var(--line-strong)}
    .author-import-status{min-height:16px;margin:7px 3px 0;font-size:8.5px;line-height:1.35;color:var(--muted)}
    .author-card-live.living,.author-card-live.continues-right{border-right-color:transparent!important;border-radius:999px 7px 7px 999px!important}
    .author-card-live.living::after,.author-card-live.continues-right::after{content:"";position:absolute;right:0;top:0;bottom:0;width:23px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--purple) 14%,var(--panel)));clip-path:polygon(0 0,70% 0,100% 50%,70% 100%,0 100%);pointer-events:none}
    .author-card-live.starts-before{border-left-color:transparent!important}
    .author-menu-reopen{position:fixed;z-index:260;left:10px;top:12px;width:41px;height:41px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--panel) 94%,transparent);color:var(--muted);display:none;place-items:center;box-shadow:0 8px 24px rgba(20,24,38,.15);backdrop-filter:blur(12px);cursor:pointer}
    .author-menu-reopen svg,.author-menu-toggle svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}
    .app.sidebar-collapsed + .author-menu-reopen,.app.sidebar-collapsed ~ .author-menu-reopen{display:grid}
    .author-menu-toggle{order:1!important}
    @media(max-width:820px){.author-builder{padding-bottom:80px}.author-menu-reopen{left:8px;top:8px}}
  `;
  document.head.appendChild(style);

  const sidebarIcon = '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14M14 9l-3 3 3 3"/></svg>';
  const toolbar = document.querySelector('.app-toolbar');
  let menuToggle = document.getElementById('authorMenuToggle');
  if (toolbar && !menuToggle) {
    menuToggle = document.createElement('button');
    menuToggle.id = 'authorMenuToggle';
    menuToggle.className = 'author-menu-toggle';
    menuToggle.title = 'Skrýt boční menu';
    menuToggle.innerHTML = sidebarIcon;
    toolbar.prepend(menuToggle);
  }
  let reopen = document.getElementById('authorMenuReopen');
  if (!reopen) {
    reopen = document.createElement('button');
    reopen.id = 'authorMenuReopen';
    reopen.className = 'author-menu-reopen';
    reopen.title = 'Zobrazit boční menu';
    reopen.innerHTML = sidebarIcon;
    document.body.appendChild(reopen);
  }
  const toggleSidebar = () => {
    appRoot.classList.toggle('sidebar-collapsed');
    const collapsed = appRoot.classList.contains('sidebar-collapsed');
    reopen.style.display = collapsed ? 'grid' : 'none';
    if (menuToggle) menuToggle.title = collapsed ? 'Zobrazit boční menu' : 'Skrýt boční menu';
    setTimeout(() => render(),250);
  };
  menuToggle?.addEventListener('click',toggleSidebar);
  reopen.addEventListener('click',toggleSidebar);

  const sideScroll = document.querySelector('.side-scroll');
  const builder = document.createElement('section');
  builder.className = 'author-builder';
  builder.innerHTML = `
    <h3>Výběr autorů</h3>
    <div class="author-search-row"><input id="publicAuthorSearch" type="search" autocomplete="off" placeholder="Napiš autora, třeba Dostojevskij"><button id="publicAuthorAdd" title="Přidat autora">+</button></div>
    <div id="publicAuthorSuggestions" class="author-suggestions"></div>
    <div id="publicAuthorSelected" class="author-selected"></div>
    <div class="author-presets"><button data-preset="popular">Populární výběr</button><button data-preset="maturity">Maturitní výběr</button><button data-preset="all">Všichni v katalogu</button><button data-preset="clear">Vymazat</button></div>
    <p id="publicAuthorStatus" class="author-import-status">Vyber autora z katalogu nebo napiš nového. Neznámého autora zkusím načíst z Wikipedie a Wikidat.</p>`;
  sideScroll?.appendChild(builder);

  const input = builder.querySelector('#publicAuthorSearch');
  const suggestions = builder.querySelector('#publicAuthorSuggestions');
  const selectedHost = builder.querySelector('#publicAuthorSelected');
  const status = builder.querySelector('#publicAuthorStatus');

  const renderSelected = () => {
    selectedHost.innerHTML = '';
    [...selected].map(id => DATA.people.find(person => person.id === id)).filter(Boolean).sort((a,b) => a.start-b.start).forEach(person => {
      const chip = document.createElement('div');
      chip.className = 'author-chip';
      chip.innerHTML = `<span>${person.name}</span><button aria-label="Odebrat ${person.name}">×</button>`;
      chip.querySelector('button').onclick = () => { selected.delete(person.id); syncGroups(); renderSelected(); renderSuggestions(input.value); render(); };
      selectedHost.appendChild(chip);
    });
  };

  const choosePerson = person => {
    selected.add(person.id);
    syncGroups();
    input.value = '';
    status.textContent = `${person.name} je přidaný na osu.`;
    renderSelected();
    renderSuggestions('');
    render();
  };

  const renderSuggestions = query => {
    const value = normalize(query);
    suggestions.innerHTML = '';
    if (!value) return;
    DATA.people.filter(person => normalize(person.name).includes(value)).sort((a,b) => a.name.localeCompare(b.name,'cs')).slice(0,7).forEach(person => {
      const button = document.createElement('button');
      button.className = 'author-suggestion';
      button.innerHTML = `<span>${person.name}</span><small>${person.start}–${person.living ? 'dnes' : person.end}</small>`;
      button.onclick = () => choosePerson(person);
      suggestions.appendChild(button);
    });
  };
  input.addEventListener('input',() => renderSuggestions(input.value));

  const wikiSearch = async query => {
    const url = new URL('https://cs.wikipedia.org/w/api.php');
    Object.entries({action:'query',generator:'search',gsrsearch:`${query} spisovatel`,gsrnamespace:'0',gsrlimit:'6',prop:'pageimages|pageprops|info',inprop:'url',piprop:'thumbnail|original',pithumbsize:'700',format:'json',formatversion:'2',origin:'*'}).forEach(([key,value]) => url.searchParams.set(key,value));
    const response = await fetch(url,{mode:'cors',credentials:'omit'});
    if (!response.ok) throw new Error('Wikipedia neodpověděla.');
    const pages = (await response.json()).query?.pages || [];
    return pages.find(page => page.pageprops?.wikibase_item) || pages[0] || null;
  };

  const wikidataEntity = async ids => {
    const url = new URL('https://www.wikidata.org/w/api.php');
    Object.entries({action:'wbgetentities',ids:Array.isArray(ids) ? ids.join('|') : ids,props:'claims|labels|sitelinks',languages:'cs|en',languagefallback:'1',format:'json',origin:'*'}).forEach(([key,value]) => url.searchParams.set(key,value));
    const response = await fetch(url,{mode:'cors',credentials:'omit'});
    if (!response.ok) throw new Error('Wikidata neodpověděla.');
    return (await response.json()).entities || {};
  };

  const claimYear = claim => {
    const time = claim?.mainsnak?.datavalue?.value?.time;
    const match = String(time || '').match(/[+-](\d{4,})-/);
    return match ? Number(match[1]) : null;
  };

  const fetchWorks = async qid => {
    const sparql = `SELECT ?work ?workLabel ?date ?article ?sitelinks WHERE { ?work wdt:P50 wd:${qid}. OPTIONAL { ?work wdt:P577 ?date. } OPTIONAL { ?article schema:about ?work; schema:isPartOf <https://cs.wikipedia.org/>. } ?work wikibase:sitelinks ?sitelinks. SERVICE wikibase:label { bd:serviceParam wikibase:language "cs,en". } } ORDER BY DESC(?sitelinks) LIMIT 8`;
    try {
      const endpoint = new URL('https://query.wikidata.org/sparql');
      endpoint.searchParams.set('query',sparql);
      endpoint.searchParams.set('format','json');
      const response = await fetch(endpoint,{headers:{Accept:'application/sparql-results+json'},mode:'cors'});
      if (!response.ok) throw new Error('SPARQL unavailable');
      const rows = (await response.json()).results?.bindings || [];
      const unique = new Map();
      rows.forEach(row => {
        const id = row.work?.value?.split('/').pop();
        const title = row.workLabel?.value;
        const year = row.date?.value ? Number(row.date.value.slice(0,4)) : null;
        if (id && title && year && !unique.has(id)) unique.set(id,{id,title,year,wiki:row.article?.value || wikiUrl(title)});
      });
      if (unique.size) return [...unique.values()].slice(0,5);
    } catch (_) { }

    const entities = await wikidataEntity(qid);
    const notableIds = (entities[qid]?.claims?.P800 || []).map(claim => claim.mainsnak?.datavalue?.value?.id).filter(Boolean).slice(0,6);
    if (!notableIds.length) return [];
    const works = await wikidataEntity(notableIds);
    return notableIds.map(id => {
      const entity = works[id];
      const title = entity?.labels?.cs?.value || entity?.labels?.en?.value;
      const year = claimYear(entity?.claims?.P577?.[0]);
      const csTitle = entity?.sitelinks?.cswiki?.title;
      return title && year ? {id,title,year,wiki:csTitle ? wikiUrl(csTitle) : wikiUrl(title)} : null;
    }).filter(Boolean).slice(0,5);
  };

  const importAuthor = async rawQuery => {
    const query = rawQuery.trim();
    if (!query) return;
    const existing = DATA.people.find(person => normalize(person.name).includes(normalize(query)) || normalize(query).includes(normalize(person.name)));
    if (existing) { choosePerson(existing); return; }

    status.textContent = `Načítám autora „${query}“…`;
    const page = await wikiSearch(query);
    if (!page?.pageprops?.wikibase_item) throw new Error('Autora se nepodařilo jednoznačně najít.');
    const qid = page.pageprops.wikibase_item;
    const entities = await wikidataEntity(qid);
    const entity = entities[qid];
    const birth = claimYear(entity?.claims?.P569?.[0]);
    const death = claimYear(entity?.claims?.P570?.[0]);
    if (!birth) throw new Error('U autora se nepodařilo zjistit rok narození.');
    const name = entity?.labels?.cs?.value || page.title || entity?.labels?.en?.value || query;
    const personId = `import-${qid.toLowerCase()}`;
    const person = {
      id:personId,
      name,
      start:birth,
      end:death || CURRENT,
      living:!death,
      group:'maturity',
      wikiTitle:page.title || name,
      wiki:page.fullurl || wikiUrl(page.title || name),
      image:page.thumbnail?.source || page.original?.source || null,
      keywords:['přidáno z Wikipedie']
    };
    const fetchedWorks = await fetchWorks(qid);
    const works = fetchedWorks.map((work,index) => ({
      id:`import-work-${qid.toLowerCase()}-${index}`,
      title:work.title,
      year:work.year,
      authorId:personId,
      wikiTitle:work.title,
      wiki:work.wiki,
      image:null,
      keywords:['načteno z Wikidat']
    }));
    DATA.people.push(person);
    works.forEach(work => DATA.works.push(work));
    importedFromDisk.push({person,works});
    try { localStorage.setItem(IMPORTED_KEY,JSON.stringify(importedFromDisk)); } catch (_) { }
    choosePerson(person);
    status.textContent = works.length ? `${name} byl přidán spolu s ${works.length} nejznámějšími datovanými díly.` : `${name} byl přidán. Wikidata ale neposkytla dost datovaných děl.`;
  };

  builder.querySelector('#publicAuthorAdd').onclick = () => importAuthor(input.value).catch(error => { status.textContent = error.message || 'Autora se nepodařilo přidat.'; });
  input.addEventListener('keydown',event => { if (event.key === 'Enter') { event.preventDefault(); importAuthor(input.value).catch(error => { status.textContent = error.message || 'Autora se nepodařilo přidat.'; }); } });

  builder.querySelectorAll('[data-preset]').forEach(button => button.onclick = () => {
    const preset = button.dataset.preset;
    selected.clear();
    if (preset === 'popular') defaultNames.forEach(name => { const person = DATA.people.find(item => normalize(item.name) === normalize(name)); if (person) selected.add(person.id); });
    if (preset === 'maturity') DATA.people.filter(person => originalMaturityNames.has(person.name)).forEach(person => selected.add(person.id));
    if (preset === 'all') DATA.people.forEach(person => selected.add(person.id));
    syncGroups();
    renderSelected();
    render();
  });

  const overlaps = (a,b,gap=7) => !(a.right+gap <= b.left || b.right+gap <= a.left);
  const pack = (items,rows,gap=7) => {
    const lanes = Array.from({length:Math.max(1,rows)},() => []);
    items.forEach(item => {
      let row = lanes.findIndex(lane => lane.every(other => !overlaps(item,other,gap)));
      if (row < 0) row = lanes.reduce((best,lane,index) => lane.length < lanes[best].length ? index : best,0);
      item.row = row;
      lanes[row].push(item);
    });
  };
  const addSectionLabel = (host,top,text,icon,color) => {
    const label = document.createElement('div');
    label.className = 'section-label';
    label.style.cssText = `top:${top}px;--lane:${color}`;
    label.innerHTML = icon + `<span>${text}</span>`;
    host.appendChild(label);
  };
  const personIcon = '<svg viewBox="0 0 24 24"><path d="M4 20c0-3.3 3.1-5.5 8-5.5s8 2.2 8 5.5M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>';
  const bookIcon = '<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Zm16 0A3.5 3.5 0 0 0 13 2h-3.5v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></svg>';
  let relationTimer = null;
  const clearRelations = (authorHost,workHost) => {
    authorHost.querySelectorAll('.author-card-live').forEach(card => card.classList.remove('is-selected','is-dimmed'));
    workHost.querySelectorAll('.work-card-live').forEach(card => card.classList.remove('is-related','is-dimmed'));
    workHost.querySelector('.relation-lines')?.remove();
  };
  const showRelations = (authorId,authorHost,workHost) => {
    clearTimeout(relationTimer);
    clearRelations(authorHost,workHost);
    const source = authorHost.querySelector(`.author-card-live[data-author-id="${CSS.escape(authorId)}"]`);
    const targets = [...workHost.querySelectorAll(`.work-card-live[data-author-id="${CSS.escape(authorId)}"]`)];
    if (!source) return;
    authorHost.querySelectorAll('.author-card-live').forEach(card => card.classList.toggle('is-dimmed',card !== source));
    source.classList.add('is-selected');
    workHost.querySelectorAll('.work-card-live').forEach(card => { const related = card.dataset.authorId === authorId; card.classList.toggle('is-related',related); card.classList.toggle('is-dimmed',!related); });
    if (!targets.length) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns,'svg');
    svg.classList.add('relation-lines');
    const sourceX = source.offsetLeft + source.offsetWidth/2;
    const sourceY = source.offsetTop + source.offsetHeight;
    targets.forEach(target => {
      const targetX = target.offsetLeft + target.offsetWidth/2;
      const targetY = target.offsetTop;
      const bend = sourceY + (targetY-sourceY)*.52;
      const path = document.createElementNS(ns,'path');
      path.setAttribute('d',`M ${sourceX} ${sourceY} C ${sourceX} ${bend}, ${targetX} ${bend}, ${targetX} ${targetY}`);
      svg.appendChild(path);
    });
    workHost.prepend(svg);
  };

  renderLiterature = function renderSelectableAuthors(width) {
    const authorHost = document.getElementById('authorLayer');
    const workHost = document.getElementById('workLayer');
    const literature = document.getElementById('literature');
    authorHost.innerHTML = '';
    workHost.innerHTML = '';
    const height = literature.clientHeight;
    const overview = span() > 360;
    const authorsTop = 46;
    const worksTop = Math.round(height*(overview ? .64 : .60));
    const authorsHeight = Math.max(126,worksTop-authorsTop-8);
    const worksHeight = Math.max(88,height-worksTop-5);
    addSectionLabel(authorHost,10,'Autoři',personIcon,'#6f54f6');
    addSectionLabel(workHost,worksTop+4,'Díla',bookIcon,'#6f54f6');

    const people = DATA.people.filter(person => selected.has(person.id) && person.end >= viewStart && person.start <= viewEnd && active.has('authors')).filter(person => !searchTerm || `${person.name} ${(person.keywords || []).join(' ')}`.toLowerCase().includes(searchTerm)).sort((a,b) => a.start-b.start || a.end-b.end);
    const authorItems = people.map(person => {
      const lifeLeft = xFor(Math.max(person.start,viewStart),width);
      const lifeRight = xFor(Math.min(person.end,viewEnd),width);
      const minimum = Math.min(overview ? 205 : 285,Math.max(148,78+person.name.length*5.8));
      const cardWidth = Math.min(330,Math.max(minimum,lifeRight-lifeLeft));
      const left = clamp(lifeLeft,46,width-cardWidth-18);
      return {person,left,right:left+cardWidth,width:cardWidth};
    });
    const authorRows = Math.max(5,Math.min(9,Math.floor(authorsHeight/(overview ? 31 : 35))));
    pack(authorItems,authorRows,6);
    const authorGap = Math.max(30,authorsHeight/authorRows);
    const authorFragment = document.createDocumentFragment();
    authorItems.forEach(item => {
      const person = item.person;
      const top = authorsTop+item.row*authorGap;
      const card = document.createElement('a');
      const continuesRight = person.end > viewEnd;
      const startsBefore = person.start < viewStart;
      card.className = `author-card-live${person.living ? ' living' : ''}${continuesRight ? ' continues-right' : ''}${startsBefore ? ' starts-before' : ''}`;
      card.href = person.wiki;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.dataset.kind = 'person';
      card.dataset.id = person.id;
      card.dataset.authorId = person.id;
      card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="avatar"></span><b>${person.name}</b><small>${person.start}–${person.living ? 'dnes' : person.end}</small>`;
      window.wikiImage?.(person,card.querySelector('.avatar'),person.name);
      const works = DATA.works.filter(work => work.authorId === person.id).map(work => work.title).join(' · ');
      card.onmouseenter = event => { showTip(event,person,`${person.start}–${person.living ? 'dnes' : person.end}`,works ? `Díla: ${works}` : 'Autor'); showRelations(person.id,authorHost,workHost); };
      card.onmousemove = moveTip;
      card.onmouseleave = () => { hideTip(); clearTimeout(relationTimer); relationTimer = setTimeout(() => clearRelations(authorHost,workHost),180); };
      authorFragment.appendChild(card);
    });
    authorHost.appendChild(authorFragment);

    const works = DATA.works.filter(work => selected.has(work.authorId) && active.has('works') && work.year >= viewStart && work.year <= viewEnd).filter(work => !searchTerm || `${work.title} ${work.year}`.toLowerCase().includes(searchTerm)).sort((a,b) => a.year-b.year || a.title.localeCompare(b.title,'cs'));
    const workItems = works.map(work => {
      const cardWidth = Math.min(overview ? 180 : 245,Math.max(96,68+work.title.length*5.5));
      const point = xFor(work.year,width);
      const left = clamp(point-cardWidth/2,46,width-cardWidth-18);
      return {work,left,right:left+cardWidth,width:cardWidth};
    });
    const workRows = Math.max(2,Math.min(5,Math.floor((worksHeight-38)/35)));
    pack(workItems,workRows,7);
    const workBase = worksTop+39;
    const workGap = Math.max(34,(worksHeight-39)/Math.max(1,workRows));
    const workFragment = document.createDocumentFragment();
    workItems.forEach(item => {
      const work = item.work;
      const top = workBase+item.row*workGap;
      const card = document.createElement('a');
      card.className = 'work-card-live';
      card.href = work.wiki;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.dataset.kind = 'work';
      card.dataset.id = work.id;
      card.dataset.authorId = work.authorId;
      card.style.cssText = `left:${item.left}px;top:${top}px;width:${item.width}px`;
      card.innerHTML = `<span class="work-thumb"></span><b>${work.title}</b><time>${work.year}</time>`;
      window.wikiImage?.(work,card.querySelector('.work-thumb'),work.title);
      const author = DATA.people.find(person => person.id === work.authorId);
      card.onmouseenter = event => { showTip(event,work,String(work.year),author?.name || 'Literární dílo'); showRelations(work.authorId,authorHost,workHost); };
      card.onmousemove = moveTip;
      card.onmouseleave = () => { hideTip(); clearTimeout(relationTimer); relationTimer = setTimeout(() => clearRelations(authorHost,workHost),180); };
      workFragment.appendChild(card);
    });
    workHost.appendChild(workFragment);
  };

  const previousRender = render;
  render = function renderWithPublicAuthorPicker() {
    syncGroups();
    previousRender();
  };

  renderSelected();
  requestAnimationFrame(() => render());
})();
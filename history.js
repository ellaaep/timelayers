(() => {
  'use strict';

  const HISTORY_MIN = -12000;
  const HISTORY_FIT_START = -3200;
  const HISTORY_END = Math.max(2026, typeof ALL_END === 'number' ? ALL_END : 2026);
  const MIN_SPAN = 8;
  const timeline = document.getElementById('timeline');
  const appRoot = document.getElementById('app') || document.querySelector('.app');
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const wiki = title => `https://cs.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`;
  const formatYear = year => {
    const rounded = Math.round(Number(year));
    if (rounded < 0) return `${Math.abs(rounded).toLocaleString('cs-CZ')} př. n. l.`;
    return String(rounded);
  };
  const formatRange = (start,end,approx=false) => `${approx ? 'cca ' : ''}${formatYear(start)}${Math.round(start) === Math.round(end) ? '' : `–${formatYear(end)}`}`;

  const event = (id,title,start,end,scope,categories,importance,wikiTitle,summary,approx=false) => ({
    id:`history-${id}`, title, start, end, display:formatRange(start,end,approx), scope, categories, importance,
    wikiTitle, wiki:wiki(wikiTitle), summary, image:null, approx
  });

  const coreEvents = [
    event('last-ice-age','Poslední doba ledová',-115000,-9700,'world',['world-history','prehistory'],5,'Poslední doba ledová','Poslední glaciální období, po němž se klima výrazně oteplilo.',true),
    event('neolithic','Neolitická revoluce',-10000,-3000,'world',['world-history','prehistory'],5,'Neolitická revoluce','Postupný přechod k zemědělství, usedlému způsobu života a prvním větším sídlům.',true),
    event('first-cities','Vznik prvních měst v Mezopotámii',-4000,-3000,'world',['world-history','ancient'],4,'Mezopotámie','Rozvoj prvních městských civilizací v Mezopotámii.',true),
    event('writing','Vznik klínového písma',-3400,-3200,'tech',['invention','ancient'],5,'Klínové písmo','Jeden z nejstarších známých systémů písma vznikl v Mezopotámii.',true),
    event('egypt-unification','Sjednocení starověkého Egypta',-3100,-3100,'world',['world-history','ancient'],5,'Starověký Egypt','Tradiční počátek dynastického Egypta.',true),
    event('hammurabi-code','Chammurapiho zákoník',-1754,-1754,'world',['world-history','law','ancient'],4,'Chammurapiho zákoník','Jeden z nejznámějších starověkých zákoníků.',true),
    event('olympics','První doložené olympijské hry',-776,-776,'world',['world-history','culture','ancient'],4,'Antické olympijské hry','Tradičně uváděný rok prvních doložených antických olympijských her.'),
    event('rome-founded','Tradiční založení Říma',-753,-753,'world',['world-history','ancient'],4,'Založení Říma','Tradiční datum založení Říma.'),
    event('roman-republic','Římská republika',-509,-27,'world',['world-history','politics','ancient'],5,'Římská republika','Období římské republiky před vznikem císařství.',true),
    event('athenian-democracy','Vznik athénské demokracie',-508,-508,'world',['world-history','politics','ancient'],4,'Athénská demokracie','Kleisthenovy reformy položily základy athénské demokracie.',true),
    event('persian-wars','Řecko-perské války',-499,-449,'world',['world-history','war','ancient'],4,'Řecko-perské války','Války mezi řeckými městskými státy a Perskou říší.'),
    event('alexander','Tažení Alexandra Velikého',-336,-323,'world',['world-history','war','ancient'],5,'Alexandr Veliký','Vznik rozsáhlé makedonské říše a šíření helénistické kultury.'),
    event('roman-empire','Římské císařství',-27,476,'world',['world-history','politics','ancient'],5,'Římské císařství','Období římského císařství na západě do roku 476.'),
    event('pompeii','Výbuch Vesuvu a zánik Pompejí',79,79,'world',['world-history','disaster','ancient'],4,'Erupce Vesuvu roku 79','Erupce Vesuvu pohřbila Pompeje a Herculaneum.'),
    event('edict-milan','Milánský edikt',313,313,'world',['world-history','religion','ancient'],4,'Edikt milánský','Legalizace křesťanství v Římské říši.'),
    event('fall-rome','Pád Západořímské říše',476,476,'world',['world-history','politics'],5,'Zánik Západořímské říše','Rok 476 se tradičně používá jako mezník mezi starověkem a středověkem.'),
    event('hijra','Hidžra a počátek islámského letopočtu',622,622,'world',['world-history','religion'],4,'Hidžra','Muhammadův odchod z Mekky do Medíny.'),
    event('charlemagne','Korunovace Karla Velikého císařem',800,800,'world',['world-history','politics'],5,'Karel Veliký','Karel Veliký byl v Římě korunován císařem.'),
    event('great-moravia','Velká Morava',833,907,'czech',['czech-history','politics'],5,'Velkomoravská říše','První významný státní útvar západních Slovanů ve střední Evropě.',true),
    event('cyril-methodius','Příchod Cyrila a Metoděje na Velkou Moravu',863,863,'czech',['czech-history','religion','culture'],5,'Cyril a Metoděj','Byzantská misie přinesla staroslověnštinu a slovanské písemnictví.'),
    event('st-wenceslas','Zavraždění knížete Václava',935,935,'czech',['czech-history','politics'],4,'Svatý Václav','Smrt knížete Václava se stala důležitou součástí české státní tradice.',true),
    event('prague-bishopric','Založení pražského biskupství',973,973,'czech',['czech-history','religion'],4,'Arcidiecéze pražská','Vznik samostatné církevní správy v českých zemích.'),
    event('norman-conquest','Normanské dobytí Anglie',1066,1066,'world',['world-history','war'],4,'Normanské dobytí Anglie','Bitva u Hastingsu a nástup Viléma Dobyvatele.'),
    event('first-crusade','První křížová výprava',1096,1099,'world',['world-history','war','religion'],4,'První křížová výprava','První z velkých křížových výprav do Levanty.'),
    event('golden-bull','Zlatá bula sicilská',1212,1212,'czech',['czech-history','politics'],5,'Zlatá bula sicilská','Listina potvrzující dědičný královský titul českých panovníků.'),
    event('magna-carta','Magna charta libertatum',1215,1215,'world',['world-history','law','politics'],4,'Magna charta libertatum','Anglická listina omezující moc panovníka.'),
    event('mongol-empire','Mongolská říše',1206,1368,'world',['world-history','war','politics'],5,'Mongolská říše','Největší souvislá pozemní říše v dějinách.'),
    event('black-death','Černá smrt v Evropě',1347,1351,'world',['world-history','science','disaster'],5,'Černá smrt','Morová pandemie zásadně proměnila evropskou společnost.'),
    event('constantinople','Pád Konstantinopole',1453,1453,'world',['world-history','war','politics'],5,'Pád Konstantinopole','Osmanská říše dobyla hlavní město Byzantské říše.'),
    event('reformation','Začátek reformace',1517,1517,'world',['world-history','religion','culture'],5,'Reformace','Vystoupení Martina Luthera odstartovalo evropskou reformaci.'),
    event('scientific-revolution','Vědecká revoluce',1543,1687,'tech',['science','world-history'],5,'Vědecká revoluce','Proměna evropského poznání od Koperníka po Newtona.',true),
    event('thirty-years-war','Třicetiletá válka',1618,1648,'world',['world-history','war'],5,'Třicetiletá válka','Rozsáhlý evropský konflikt zahájený českým stavovským povstáním.'),
    event('american-revolution','Americká revoluce',1775,1783,'world',['world-history','war','politics'],5,'Americká revoluce','Vznik Spojených států amerických.'),
    event('napoleonic-wars','Napoleonské války',1803,1815,'world',['world-history','war','politics'],5,'Napoleonské války','Série evropských konfliktů spojených s Napoleonem Bonapartem.'),
    event('dna','Objev struktury DNA',1953,1953,'tech',['science','invention'],5,'DNA','Popsání dvojšroubovicové struktury DNA.'),
    event('human-genome','Dokončení projektu lidského genomu',2003,2003,'tech',['science','invention'],4,'Projekt lidského genomu','Dokončení základní sekvence lidského genomu.')
  ];

  const monumentEvents = [
    event('gobekli','Göbekli Tepe',-9600,-8200,'world',['monument','world-history','prehistory'],5,'Göbekli Tepe','Monumentální pravěký areál v dnešním Turecku.',true),
    event('stonehenge','Výstavba Stonehenge',-3000,-2000,'world',['monument','world-history','ancient'],5,'Stonehenge','Monumentální pravěký komplex v Anglii.',true),
    event('great-pyramid','Velká pyramida v Gíze',-2580,-2560,'world',['monument','world-history','ancient'],5,'Velká pyramida v Gíze','Pyramida faraona Chufua, jediný dochovaný div antického světa.',true),
    event('parthenon','Výstavba Parthenónu',-447,-432,'world',['monument','world-history','ancient'],4,'Parthenón','Chrám bohyně Athény na athénské Akropoli.'),
    event('colosseum','Výstavba Kolosea',72,80,'world',['monument','world-history','ancient'],4,'Koloseum','Velký římský amfiteátr.'),
    event('hagia-sophia','Výstavba chrámu Hagia Sofia',532,537,'world',['monument','world-history'],4,'Hagia Sofia','Byzantský chrám v Konstantinopoli.'),
    event('prague-castle','Založení Pražského hradu',880,920,'czech',['monument','castle','czech-history'],5,'Pražský hrad','Počátky Pražského hradu sahají do konce 9. století.',true),
    event('vysehrad','Vznik Vyšehradu',950,1000,'czech',['monument','castle','czech-history'],4,'Vyšehrad','Raně středověké hradiště a pozdější královský areál.',true),
    event('primda','Výstavba hradu Přimda',1121,1121,'czech',['monument','castle','czech-history'],4,'Přimda (hrad)','Jeden z nejstarších dochovaných kamenných hradů v Česku.'),
    event('notre-dame','Výstavba pařížské Notre-Dame',1163,1345,'world',['monument','world-history'],4,'Notre-Dame (Paříž)','Výstavba gotické katedrály v Paříži.',true),
    event('zvikov','Výstavba hradu Zvíkov',1230,1270,'czech',['monument','castle','czech-history'],4,'Zvíkov (hrad)','Královský hrad nad soutokem Vltavy a Otavy.',true),
    event('krumlov','Výstavba hradu Český Krumlov',1240,1274,'czech',['monument','castle','czech-history'],4,'Státní hrad a zámek Český Krumlov','Počátky hradního areálu ve 13. století.',true),
    event('krivoklat','Rozvoj hradu Křivoklát',1230,1270,'czech',['monument','castle','czech-history'],4,'Křivoklát (hrad)','Významný český královský hrad.',true),
    event('loket','Výstavba hradu Loket',1230,1250,'czech',['monument','castle','czech-history'],3,'Loket (hrad)','Kamenný hrad na strategickém místě nad Ohří.',true),
    event('bezdez','Výstavba hradu Bezděz',1264,1278,'czech',['monument','castle','czech-history'],5,'Bezděz (hrad)','Raně gotický královský hrad Přemysla Otakara II.'),
    event('pernstejn','Počátky hradu Pernštejn',1270,1285,'czech',['monument','castle','czech-history'],4,'Pernštejn (hrad)','Jeden z nejlépe dochovaných moravských hradů.',true),
    event('konopiste','Výstavba hradu Konopiště',1294,1300,'czech',['monument','castle','czech-history'],4,'Konopiště','Původně gotická pevnost inspirovaná francouzskými kastely.',true),
    event('st-vitus','Výstavba katedrály svatého Víta',1344,1929,'czech',['monument','czech-history'],5,'Katedrála svatého Víta, Václava a Vojtěcha','Výstavba katedrály probíhala v několika etapách téměř šest století.'),
    event('karlstejn','Výstavba hradu Karlštejn',1348,1365,'czech',['monument','castle','czech-history'],5,'Karlštejn','Hrad založený Karlem IV. pro uložení korunovačních klenotů.'),
    event('kost','Výstavba hradu Kost',1349,1360,'czech',['monument','castle','czech-history'],4,'Kost (hrad)','Významný gotický hrad v Českém ráji.',true),
    event('kasperk','Výstavba hradu Kašperk',1356,1361,'czech',['monument','castle','czech-history'],4,'Kašperk','Královský hrad založený Karlem IV.'),
    event('charles-bridge','Výstavba Karlova mostu',1357,1402,'czech',['monument','czech-history'],5,'Karlův most','Kamenný most spojující Staré Město a Malou Stranu.'),
    event('trosky','Výstavba hradu Trosky',1380,1390,'czech',['monument','castle','czech-history'],4,'Trosky (hrad)','Ikonická dvojvěžová zřícenina v Českém ráji.',true),
    event('orloj','Zprovoznění pražského orloje',1410,1410,'tech',['monument','invention','czech-history'],5,'Staroměstský orloj','Jeden z nejstarších dosud fungujících astronomických orlojů.'),
    event('great-wall','Výstavba mingské Velké čínské zdi',1368,1644,'world',['monument','world-history'],5,'Velká čínská zeď','Nejznámější dochované úseky vznikaly za dynastie Ming.',true),
    event('machu-picchu','Výstavba Machu Picchu',1450,1470,'world',['monument','world-history'],4,'Machu Picchu','Incké město v Andách.',true),
    event('taj-mahal','Výstavba Tádž Mahalu',1632,1653,'world',['monument','world-history'],5,'Tádž Mahal','Mauzoleum vybudované v Ágře za vlády Šáhdžahána.'),
    event('hluboka','Novogotická přestavba Hluboké',1840,1871,'czech',['monument','castle','czech-history'],4,'Hluboká (zámek)','Romantická novogotická přestavba zámku Hluboká.'),
    event('lednice','Novogotická přestavba Lednice',1846,1858,'czech',['monument','castle','czech-history'],4,'Lednice (zámek)','Novogotická přestavba lednického zámku.'),
    event('national-theatre','Výstavba Národního divadla',1868,1883,'czech',['monument','culture','czech-history'],5,'Národní divadlo','Budování a znovuotevření Národního divadla.'),
    event('eiffel','Výstavba Eiffelovy věže',1887,1889,'world',['monument','invention','world-history'],4,'Eiffelova věž','Věž postavená pro světovou výstavu v Paříži.'),
    event('panama','Výstavba Panamského průplavu',1904,1914,'tech',['monument','invention','world-history'],5,'Panamský průplav','Průplav propojující Atlantský a Tichý oceán.'),
    event('sydney-opera','Výstavba Opery v Sydney',1959,1973,'world',['monument','culture','world-history'],4,'Opera v Sydney','Ikonická stavba moderní architektury.')
  ];

  const figureEvents = [
    event('hammurabi','Chammurapi',-1810,-1750,'world',['figure','ancient'],4,'Chammurapi','Babylonský král spojený se slavným zákoníkem.',true),
    event('socrates','Sókratés',-470,-399,'world',['figure','philosophy','ancient'],5,'Sókratés','Řecký filozof a jedna z klíčových osobností antického myšlení.',true),
    event('aristotle','Aristotelés',-384,-322,'world',['figure','philosophy','science','ancient'],5,'Aristotelés','Filozof a učenec s mimořádným vlivem na evropské myšlení.'),
    event('alexander-person','Alexandr Veliký',-356,-323,'world',['figure','politics','ancient'],5,'Alexandr Veliký','Makedonský vojevůdce a panovník.',true),
    event('caesar','Julius Caesar',-100,-44,'world',['figure','politics','ancient'],5,'Julius Caesar','Římský vojevůdce, politik a diktátor.'),
    event('cleopatra','Kleopatra VII.',-69,-30,'world',['figure','politics','ancient'],4,'Kleopatra VII.','Poslední panovnice ptolemaiovského Egypta.'),
    event('charlemagne-person','Karel Veliký',748,814,'world',['figure','politics'],5,'Karel Veliký','Franský král a císař.'),
    event('leonardo','Leonardo da Vinci',1452,1519,'world',['figure','science','culture'],5,'Leonardo da Vinci','Renesanční umělec, konstruktér a učenec.'),
    event('columbus','Kryštof Kolumbus',1451,1506,'world',['figure','exploration'],5,'Kryštof Kolumbus','Mořeplavec spojený s evropským objevením Ameriky roku 1492.'),
    event('copernicus','Mikuláš Koperník',1473,1543,'world',['figure','science'],5,'Mikuláš Koperník','Astronom, který formuloval heliocentrický model.'),
    event('michelangelo','Michelangelo Buonarroti',1475,1564,'world',['figure','culture'],4,'Michelangelo Buonarroti','Renesanční sochař, malíř a architekt.'),
    event('galileo','Galileo Galilei',1564,1642,'world',['figure','science'],5,'Galileo Galilei','Astronom a fyzik spojený s počátky moderní vědy.'),
    event('comenius','Jan Amos Komenský',1592,1670,'czech',['figure','culture','science'],5,'Jan Amos Komenský','Český pedagog, filozof, teolog a spisovatel.'),
    event('newton','Isaac Newton',1643,1727,'world',['figure','science'],5,'Isaac Newton','Fyzik a matematik, autor zákonů pohybu a gravitační teorie.'),
    event('darwin','Charles Darwin',1809,1882,'world',['figure','science'],5,'Charles Darwin','Přírodovědec spojený s evoluční teorií.'),
    event('curie','Marie Curie-Skłodowská',1867,1934,'world',['figure','science'],5,'Marie Curie-Skłodowská','Průkopnice výzkumu radioaktivity.'),
    event('tesla','Nikola Tesla',1856,1943,'world',['figure','science','invention'],5,'Nikola Tesla','Vynálezce a elektrotechnik.'),
    event('einstein','Albert Einstein',1879,1955,'world',['figure','science'],5,'Albert Einstein','Fyzik, autor speciální a obecné teorie relativity.'),
    event('turing','Alan Turing',1912,1954,'world',['figure','science','invention'],5,'Alan Turing','Matematik a průkopník informatiky.')
  ];

  const allExtraIds = new Set([...coreEvents,...monumentEvents,...figureEvents].map(item => item.id));
  active.add('monuments');
  active.add('figures');

  const isDuplicate = candidate => DATA.events.some(existing => !allExtraIds.has(existing.id) && normalize(existing.title) === normalize(candidate.title) && Math.abs(Number(existing.start)-Number(candidate.start)) < 2);
  const syncExtraEvents = () => {
    DATA.events = DATA.events.filter(item => !allExtraIds.has(item.id));
    coreEvents.forEach(item => { if (!isDuplicate(item)) DATA.events.push(item); });
    if (active.has('monuments')) monumentEvents.forEach(item => { if (!isDuplicate(item)) DATA.events.push(item); });
    if (active.has('figures')) figureEvents.forEach(item => { if (!isDuplicate(item)) DATA.events.push(item); });
  };
  syncExtraEvents();

  const addKomenskyToCatalog = () => {
    let person = DATA.people.find(item => normalize(item.name) === normalize('Jan Amos Komenský'));
    if (!person) {
      person = {id:'history-author-komensky',name:'Jan Amos Komenský',start:1592,end:1670,living:false,group:'catalog',wikiTitle:'Jan Amos Komenský',wiki:wiki('Jan Amos Komenský'),image:null,keywords:['pedagogika','baroko','humanismus']};
      DATA.people.push(person);
    }
    [
      ['Labyrint světa a ráj srdce',1631,'Labyrint světa a ráj srdce'],
      ['Velká didaktika',1657,'Didactica magna'],
      ['Orbis pictus',1658,'Orbis pictus']
    ].forEach(([title,year,wikiTitle]) => {
      if (!DATA.works.some(work => work.authorId === person.id && normalize(work.title) === normalize(title))) {
        DATA.works.push({id:`history-komensky-${normalize(title).replace(/ /g,'-')}`,title,year,authorId:person.id,wikiTitle,wiki:wiki(wikiTitle),image:null,keywords:['Jan Amos Komenský']});
      }
    });
  };
  addKomenskyToCatalog();

  const style = document.createElement('style');
  style.textContent = `
    .history-filter{margin-top:4px!important}
    .history-filter .filter-icon svg{stroke-width:1.7!important}
    .zoom-presets{max-width:min(820px,calc(100vw - 240px));display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:5px!important}
    .zoom-presets button{white-space:nowrap!important}
    .year-label.history-bce{font-size:9px!important}
    .period-card-live time{font-variant-numeric:tabular-nums}
    .history-era-world{--era:#d8b56d}.history-era-czech{--era:#7eb7df}
    @media(max-width:820px){.zoom-presets{max-width:calc(100vw - 16px);justify-content:center!important}.zoom-presets button:nth-child(n+6){display:none}}
  `;
  document.head.appendChild(style);

  const buildingIcon = '<svg viewBox="0 0 24 24"><path d="M4 21V9l4-4 4 4 4-4 4 4v12M2 21h20M8 21v-6h3v6m5 0v-7h3v7"/></svg>';
  const figureIcon = '<svg viewBox="0 0 24 24"><path d="M5 21c0-4 2.8-6 7-6s7 2 7 6M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM18 5h4m-2-2v4"/></svg>';
  const filterList = document.querySelector('.filter-list');
  const addFilter = (id,label,color,icon) => {
    if (!filterList || filterList.querySelector(`[data-id="${id}"]`)) return;
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'filter active history-filter';
    row.dataset.id = id;
    row.style.setProperty('--c',color);
    row.innerHTML = `<span class="filter-icon">${icon}</span><span class="filter-label">${label}</span><span class="switch"><i></i></span>`;
    row.onclick = () => {
      active.has(id) ? active.delete(id) : active.add(id);
      row.classList.toggle('active',active.has(id));
      syncExtraEvents();
      render();
    };
    filterList.appendChild(row);
  };
  addFilter('monuments','Stavby a hrady','#8d6e47',buildingIcon);
  addFilter('figures','Významné osobnosti','#2f8f86',figureIcon);

  const historicalPeriods = [
    {id:'era-stone',title:'Pozdní doba kamenná',start:-12000,end:-3000,row:0,scope:'world',color:'#b9a27a',wikiTitle:'Doba kamenná'},
    {id:'era-ancient',title:'Starověk',start:-3000,end:476,row:0,scope:'world',color:'#d8b56d',wikiTitle:'Starověk'},
    {id:'era-middle',title:'Středověk',start:476,end:1492,row:0,scope:'world',color:'#b4a2cb',wikiTitle:'Středověk'},
    {id:'era-early-modern',title:'Raný novověk',start:1492,end:1789,row:0,scope:'world',color:'#e6b27d',wikiTitle:'Raný novověk'},
    {id:'era-modern',title:'Moderní dějiny',start:1789,end:1914,row:0,scope:'world',color:'#91b9c7',wikiTitle:'Moderní dějiny'},
    {id:'era-contemporary',title:'Soudobé dějiny',start:1914,end:HISTORY_END,row:0,scope:'world',color:'#8fa6d8',wikiTitle:'Soudobé dějiny'},
    {id:'era-renaissance',title:'Renesance',start:1400,end:1600,row:1,scope:'world',color:'#e8b76a',wikiTitle:'Renesance'},
    {id:'era-baroque',title:'Baroko',start:1600,end:1750,row:1,scope:'world',color:'#c98dac',wikiTitle:'Baroko'},
    {id:'era-enlightenment',title:'Osvícenství',start:1685,end:1815,row:1,scope:'world',color:'#e5d06d',wikiTitle:'Osvícenství'},
    {id:'era-industrial',title:'Průmyslová revoluce',start:1760,end:1840,row:1,scope:'world',color:'#91b9c7',wikiTitle:'Průmyslová revoluce'},
    {id:'era-ww1',title:'První světová válka',start:1914,end:1918,row:1,scope:'world',color:'#e06464',wikiTitle:'První světová válka'},
    {id:'era-ww2',title:'Druhá světová válka',start:1939,end:1945,row:1,scope:'world',color:'#c64242',wikiTitle:'Druhá světová válka'},
    {id:'era-cold-war',title:'Studená válka',start:1947,end:1991,row:1,scope:'world',color:'#7e95ca',wikiTitle:'Studená válka'},
    {id:'era-great-moravia',title:'Velká Morava',start:833,end:907,row:2,scope:'czech',color:'#63a98b',wikiTitle:'Velkomoravská říše'},
    {id:'era-premyslid',title:'Přemyslovský stát',start:895,end:1306,row:2,scope:'czech',color:'#7da6cc',wikiTitle:'Přemyslovci'},
    {id:'era-luxembourg',title:'Lucemburkové',start:1310,end:1437,row:2,scope:'czech',color:'#8d78b8',wikiTitle:'Lucemburkové'},
    {id:'era-hussite',title:'Husitské období',start:1419,end:1434,row:2,scope:'czech',color:'#cc776d',wikiTitle:'Husitské války'},
    {id:'era-habsburg',title:'Habsburská monarchie',start:1526,end:1804,row:2,scope:'czech',color:'#6c96d8',wikiTitle:'Habsburská monarchie'},
    {id:'era-revival',title:'Národní obrození',start:1775,end:1850,row:2,scope:'czech',color:'#55b89b',wikiTitle:'České národní obrození'},
    {id:'era-austria-hungary',title:'Rakousko-Uhersko',start:1867,end:1918,row:2,scope:'czech',color:'#e8c44f',wikiTitle:'Rakousko-Uhersko'},
    {id:'era-first-republic',title:'První republika',start:1918,end:1938,row:2,scope:'czech',color:'#8fc1ee',wikiTitle:'První republika'},
    {id:'era-protectorate',title:'Protektorát Čechy a Morava',start:1939,end:1945,row:2,scope:'czech',color:'#c6a5df',wikiTitle:'Protektorát Čechy a Morava'},
    {id:'era-communism',title:'Komunistické Československo',start:1948,end:1989,row:2,scope:'czech',color:'#e79ab0',wikiTitle:'Komunistický režim v Československu'},
    {id:'era-czech',title:'Česká republika',start:1993,end:HISTORY_END,row:2,scope:'czech',color:'#9bd3ae',wikiTitle:'Česko'}
  ].map(item => ({...item,wiki:wiki(item.wikiTitle)}));

  renderPeriods = function renderCompletePeriods(width) {
    const host = document.getElementById('periodLayer');
    host.innerHTML = '';
    const height = host.clientHeight || 94;
    const fragment = document.createDocumentFragment();
    historicalPeriods.filter(period => period.end >= viewStart && period.start <= viewEnd && (period.scope === 'world' ? active.has('world-periods') : active.has('czech-periods'))).sort((a,b) => a.row-b.row || a.start-b.start).forEach(period => {
      const startX = clamp(xFor(Math.max(period.start,viewStart),width),2,width-2);
      const endX = clamp(xFor(Math.min(period.end,viewEnd),width),2,width-2);
      const periodWidth = endX-startX;
      if (periodWidth < 26) return;
      const top = 4+period.row*29;
      if (top+27 > height) return;
      const card = document.createElement('a');
      card.className = `period-card-live${periodWidth < 108 ? ' compact' : ''}`;
      card.href = period.wiki;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.cssText = `left:${startX+2}px;top:${top}px;width:${Math.max(24,periodWidth-4)}px;--era:${period.color}`;
      card.innerHTML = `<b>${period.title}</b><time>${formatRange(period.start,period.end)}</time>`;
      card.onmouseenter = event => showTip(event,period,formatRange(period.start,period.end),'Historické období');
      card.onmousemove = moveTip;
      card.onmouseleave = hideTip;
      fragment.appendChild(card);
    });
    host.appendChild(fragment);
  };

  let pendingRange = null;
  let rangeFrame = 0;
  const applyRange = () => {
    rangeFrame = 0;
    if (!pendingRange) return;
    viewStart = pendingRange.start;
    viewEnd = pendingRange.end;
    pendingRange = null;
    render();
  };
  const setRange = (start,end) => {
    let nextSpan = Math.max(MIN_SPAN,Math.min(HISTORY_END-HISTORY_MIN,end-start));
    let center = (start+end)/2;
    start = center-nextSpan/2;
    end = center+nextSpan/2;
    if (start < HISTORY_MIN) { end += HISTORY_MIN-start; start = HISTORY_MIN; }
    if (end > HISTORY_END) { start -= end-HISTORY_END; end = HISTORY_END; }
    pendingRange = {start,end};
    if (!rangeFrame) rangeFrame = requestAnimationFrame(applyRange);
  };
  const zoomAt = (factor,ratio=.5) => {
    const current = viewEnd-viewStart;
    const next = Math.max(MIN_SPAN,Math.min(HISTORY_END-HISTORY_MIN,current*factor));
    const anchor = viewStart+current*ratio;
    setRange(anchor-next*ratio,anchor+next*(1-ratio));
  };

  const oldZoomPanel = document.querySelector('.zoom-panel');
  let zoomPanel = oldZoomPanel;
  if (oldZoomPanel) {
    zoomPanel = oldZoomPanel.cloneNode(true);
    oldZoomPanel.replaceWith(zoomPanel);
    const slider = zoomPanel.querySelector('input');
    const label = zoomPanel.querySelector('span');
    const maxSpan = HISTORY_END-HISTORY_MIN;
    const spanToSlider = current => Math.round(100*Math.log(maxSpan/Math.max(MIN_SPAN,Math.min(maxSpan,current)))/Math.log(maxSpan/MIN_SPAN));
    const sliderToSpan = value => maxSpan*Math.pow(MIN_SPAN/maxSpan,Number(value)/100);
    slider.oninput = () => { const center = (viewStart+viewEnd)/2; const next = sliderToSpan(slider.value); setRange(center-next/2,center+next/2); };
    zoomPanel.querySelector('[data-zoom="in"]').onclick = () => zoomAt(.7,.5);
    zoomPanel.querySelector('[data-zoom="out"]').onclick = () => zoomAt(1.43,.5);
    zoomPanel.dataset.historyPanel = '1';
    zoomPanel.updateHistoryUI = () => {
      const current = viewEnd-viewStart;
      slider.value = String(spanToSlider(current));
      label.textContent = current < 25 ? `${current.toFixed(1)} roku` : `${Math.round(current).toLocaleString('cs-CZ')} let`;
    };
  }

  const presets = document.querySelector('.zoom-presets');
  if (presets) {
    presets.innerHTML = '<button data-history-range="ice">Doba ledová</button><button data-history-range="ancient">Starověk</button><button data-history-range="medieval">Středověk</button><button data-history-range="all">Celá historie</button><button data-history-range="19">19. století</button><button data-history-range="20">20. století</button><button data-history-range="modern">1945–dnes</button>';
    presets.querySelectorAll('button').forEach(button => button.onclick = () => {
      const range = button.dataset.historyRange;
      if (range === 'ice') setRange(-12000,-3000);
      if (range === 'ancient') setRange(-3200,500);
      if (range === 'medieval') setRange(500,1500);
      if (range === 'all') setRange(HISTORY_FIT_START,HISTORY_END);
      if (range === '19') setRange(1801,1900);
      if (range === '20') setRange(1901,2000);
      if (range === 'modern') setRange(1945,HISTORY_END);
    });
  }

  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');
  const fitButton = document.getElementById('fit');
  if (zoomInButton) zoomInButton.onclick = () => zoomAt(.7,.5);
  if (zoomOutButton) zoomOutButton.onclick = () => zoomAt(1.43,.5);
  if (fitButton) fitButton.onclick = () => setRange(HISTORY_FIT_START,HISTORY_END);

  timeline?.addEventListener('wheel',event => {
    if (event.target.closest('input,button,.info-panel,.range-popover')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect = timeline.getBoundingClientRect();
    const ratio = Math.max(0,Math.min(1,(event.clientX-rect.left)/Math.max(1,rect.width)));
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)*.7) {
      const delta = (event.deltaX+(event.shiftKey ? event.deltaY : 0))/Math.max(1,rect.width)*(viewEnd-viewStart);
      setRange(viewStart+delta,viewEnd+delta);
    } else zoomAt(Math.exp(event.deltaY*.0013),ratio);
  },{capture:true,passive:false});

  let drag = null;
  timeline?.addEventListener('pointerdown',event => {
    if (event.button !== 0 || event.target.closest('a,button,input,.info-panel,.range-popover')) return;
    event.stopImmediatePropagation();
    drag = {x:event.clientX,start:viewStart,end:viewEnd,pointerId:event.pointerId};
    timeline.setPointerCapture(event.pointerId);
    timeline.classList.add('is-panning');
  },true);
  timeline?.addEventListener('pointermove',event => {
    if (!drag) return;
    event.stopImmediatePropagation();
    const years = -(event.clientX-drag.x)/Math.max(1,timeline.clientWidth)*(drag.end-drag.start);
    setRange(drag.start+years,drag.end+years);
  },true);
  const endDrag = event => {
    if (!drag) return;
    event.stopImmediatePropagation();
    try { timeline.releasePointerCapture(drag.pointerId); } catch (_) { }
    drag = null;
    timeline.classList.remove('is-panning');
  };
  timeline?.addEventListener('pointerup',endDrag,true);
  timeline?.addEventListener('pointercancel',endDrag,true);
  timeline?.addEventListener('dblclick',event => {
    if (event.target.closest('a,button,input')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect = timeline.getBoundingClientRect();
    zoomAt(.5,(event.clientX-rect.left)/Math.max(1,rect.width));
  },true);

  const periodAt = year => historicalPeriods.filter(period => period.start <= year && period.end >= year).sort((a,b) => a.row-b.row);
  const formatAxis = () => {
    document.querySelectorAll('.year-label').forEach(label => {
      const raw = Number(String(label.textContent).replace(/\s/g,''));
      if (!Number.isFinite(raw)) return;
      label.textContent = formatYear(raw);
      label.classList.toggle('history-bce',raw < 0);
    });
    const crosshairYear = document.querySelector('.crosshair-year');
    if (crosshairYear) {
      const raw = Number(String(crosshairYear.textContent).replace(/[^0-9-]/g,''));
      if (Number.isFinite(raw)) crosshairYear.textContent = formatYear(raw);
    }
    const focusYear = document.getElementById('focusYear');
    if (focusYear) {
      const raw = Number(String(focusYear.textContent).replace(/[^0-9-]/g,''));
      if (Number.isFinite(raw)) focusYear.textContent = formatYear(raw);
    }
    zoomPanel?.updateHistoryUI?.();
  };

  timeline?.addEventListener('pointermove',event => {
    if (drag || event.target.closest('a,button,input,.info-panel,.range-popover')) return;
    requestAnimationFrame(() => {
      const rect = timeline.getBoundingClientRect();
      const ratio = Math.max(0,Math.min(1,(event.clientX-rect.left)/Math.max(1,rect.width)));
      const year = Math.round(viewStart+(viewEnd-viewStart)*ratio);
      const yearEl = document.querySelector('.crosshair-year');
      if (yearEl) yearEl.textContent = formatYear(year);
      const context = document.querySelector('.crosshair-context');
      const periods = periodAt(year);
      if (context) context.textContent = periods.length ? periods.slice(0,2).map(period => period.title).join(' · ') : formatYear(year);
    });
  });

  const previousRender = render;
  render = function renderWithCompleteHistory() {
    previousRender();
    requestAnimationFrame(formatAxis);
  };

  requestAnimationFrame(() => {
    render();
    formatAxis();
  });
})();
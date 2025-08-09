/* game.js — Offline Reverse Wiki Game with ~100 mixed topics
   - All data bundled here (titles, descriptions, keywords)
   - Search with autocomplete, clickable links
   - Heat bar via BFS shortest path
   - Hints mask target words whole-word (multi-word targets supported)
   - Confetti on true victory only
   - New Game only after victory or Give Up
*/

(function(){
  // ---------- dataset (title, short description, image keyword, keywords) ----------
  // (About 100 mixed real-life topics)
  const ITEMS = [
    ["Dog","A dog is a domesticated mammal commonly kept as a pet. Dogs are known for their loyalty and varied breeds.","dog",["animal","pet"]],
    ["Cat","A small domesticated carnivorous mammal commonly kept as a pet, noted for agility.","cat",["animal","pet"]],
    ["Wolf","A wild canine native to Eurasia and North America that often hunts in packs.","wolf",["animal","wild"]],
    ["Lion","A big cat found in parts of Africa and India, living in social groups called prides.","lion",["animal","wild"]],
    ["Elephant","The largest land animal with a trunk and tusks, highly social and intelligent.","elephant",["animal","wild"]],
    ["Tiger","A large striped cat native to Asia and an apex predator in various habitats.","tiger",["animal","wild"]],
    ["Horse","A domesticated mammal used historically for transport, agriculture, and sport.","horse",["animal","domestic"]],
    ["Cow","A domesticated bovine used for milk and meat production in agriculture.","cow",["animal","farm"]],
    ["Sheep","Flock animals raised for wool and meat, among earliest domesticated livestock.","sheep",["animal","farm"]],
    ["Goat","Hardy animals raised for milk, meat, and fiber; browsers rather than grazers.","goat",["animal","farm"]],
    ["Apple","A common fruit eaten fresh or used in cooking; many varieties exist worldwide.","apple",["food","fruit"]],
    ["Banana","A long sweet tropical fruit commonly eaten as a snack or used in desserts.","banana",["food","fruit"]],
    ["Bread","A staple food made from flour and water, baked in many forms globally.","bread",["food","baked"]],
    ["Cheese","A dairy product produced by curdling milk and aging curds into varied flavors.","cheese",["food","dairy"]],
    ["Coffee","A brewed drink made from roasted coffee beans, popular worldwide for caffeine.","coffee",["food","drink"]],
    ["Tea","A beverage prepared by infusing processed leaves, significant culturally in many countries.","tea",["food","drink"]],
    ["Pizza","A baked flatbread topped with sauce, cheese, and toppings; originated in Italy.","pizza",["food","dish"]],
    ["Sushi","A Japanese dish combining vinegared rice with seafood or vegetables.","sushi",["food","dish"]],
    ["Pasta","An Italian staple of made dough, formed into shapes and served with sauces.","pasta",["food","dish"]],
    ["Chocolate","A sweet product made from cacao, used widely in confectionery and desserts.","chocolate",["food","sweet"]],
    ["New York City","A major US city known for finance, culture, and landmarks like Times Square.","nyc",["city","landmark"]],
    ["Los Angeles","A large California city known for the film industry, beaches, and entertainment.","la",["city","entertainment"]],
    ["Chicago","A US city notable for architecture, music, and cuisine such as deep-dish pizza.","chicago",["city","culture"]],
    ["London","The capital of the UK, a global center for culture, finance and history.","london",["city","landmark"]],
    ["Paris","The French capital, famous for art, cuisine and the Eiffel Tower.","paris",["city","landmark"]],
    ["Tokyo","Japan's capital, known for technology, culture and dense urban life.","tokyo",["city","culture"]],
    ["Sydney","An Australian city known for its harbour and Opera House.","sydney",["city","landmark"]],
    ["Mount Everest","Earth's highest mountain, located in the Himalayas on the Nepal-China border.","everest",["nature","landmark"]],
    ["Grand Canyon","A vast canyon carved by the Colorado River in Arizona, USA.","grand canyon",["nature","landmark"]],
    ["Niagara Falls","Powerful waterfalls on the US-Canada border, famous for tourism and hydropower.","niagara falls",["nature","landmark"]],
    ["Eiffel Tower","An iconic iron tower in Paris and a major tourist attraction.","eiffel tower",["landmark","structure"]],
    ["Statue of Liberty","A large statue on Liberty Island, symbolizing freedom in the United States.","statue of liberty",["landmark","history"]],
    ["Great Wall of China","A long series of fortifications built across northern China across centuries.","great wall",["landmark","history"]],
    ["Pyramids of Giza","Ancient Egyptian pyramids built as tombs for pharaohs near Cairo.","pyramids",["landmark","history"]],
    ["World War II","A global conflict from 1939 to 1945 with vast geopolitical impact.","world war ii",["history","war"]],
    ["Renaissance","A period of cultural revival in Europe notable for art and science advances.","renaissance",["history","culture"]],
    ["Shakespeare","An English playwright and poet considered one of the greatest writers in English.","shakespeare",["person","literature"]],
    ["Leonardo da Vinci","A Renaissance polymath famous for painting, invention, and science.","leonardo da vinci",["person","art"]],
    ["Albert Einstein","A theoretical physicist known for the theory of relativity and major contributions to physics.","albert einstein",["person","science"]],
    ["Isaac Newton","A mathematician and physicist notable for laws of motion and universal gravitation.","isaac newton",["person","science"]],
    ["Marie Curie","A physicist and chemist who conducted pioneering research on radioactivity.","marie curie",["person","science"]],
    ["Nelson Mandela","A South African anti-apartheid leader and former president known for reconciliation.","nelson mandela",["person","politics"]],
    ["Barack Obama","The 44th President of the United States, noted for policy and leadership.","barack obama",["person","politics"]],
    ["Internet","A global system of interconnected computer networks enabling data exchange and services.","internet",["technology","network"]],
    ["World Wide Web","An information system using the internet to access linked documents and resources.","world wide web",["technology","internet"]],
    ["Computer","An electronic device for performing computations and running programs.","computer",["technology","device"]],
    ["Smartphone","A portable device that combines telephony and computing capabilities in one unit.","smartphone",["technology","device"]],
    ["Artificial Intelligence","A field of computing focused on making systems that perform tasks requiring human intelligence.","artificial intelligence",["technology","ai"]],
    ["SpaceX","An aerospace company focused on rockets and spaceflight founded by Elon Musk.","spacex",["company","space"]],
    ["NASA","The US agency responsible for civil space exploration and aeronautics research.","nasa",["organization","space"]],
    ["Mars","The fourth planet from the Sun, subject of many exploration missions.","mars",["space","planet"]],
    ["Moon","Earth's natural satellite visited by humans during the Apollo missions.","moon",["space","satellite"]],
    ["Saturn","A gas giant planet noted for its prominent ring system.","saturn",["space","planet"]],
    ["Black Hole","An astrophysical object with gravitational field so strong that not even light can escape.","black hole",["space","astrophysics"]],
    ["DNA","A molecule carrying genetic instructions for living organisms.","dna",["science","biology"]],
    ["Cell (biology)","The basic structural and functional unit of living organisms.","cell",["science","biology"]],
    ["Photosynthesis","The process plants use to convert light energy into chemical energy.","photosynthesis",["science","biology"]],
    ["Evolution","The process of change in organisms over successive generations.","evolution",["science","biology"]],
    ["Plate Tectonics","A theory describing the motion of the Earth's lithosphere.","plate tectonics",["science","earth"]],
    ["Climate Change","Long-term changes to temperature and weather patterns, often influenced by humans.","climate change",["science","environment"]],
    ["Amazon Rainforest","The Earth's largest tropical rainforest, rich in biodiversity.","amazon rainforest",["nature","environment"]],
    ["Great Barrier Reef","A massive coral reef system off the coast of Australia.","great barrier reef",["nature","environment"]],
    ["Coral","Marine organisms building reefs and providing habitats for marine life.","coral",["nature","marine"]],
    ["Shark","A group of predatory fish important to marine ecosystems.","shark",["animal","marine"]],
    ["Whale","Large marine mammals including species like the blue whale.","whale",["animal","marine"]],
    ["Soccer","A global sport played between teams aiming to score in the opponent's goal.","soccer",["sport","team"]],
    ["Basketball","A team sport where players aim to shoot a ball through a hoop.","basketball",["sport","team"]],
    ["Tennis","A racket sport played one-on-one or in doubles on a rectangular court.","tennis",["sport","individual"]],
    ["Olympic Games","An international multi-sport event featuring athletes from many countries.","olympics",["sport","event"]],
    ["FIFA World Cup","A global international soccer tournament held every four years.","fifa world cup",["sport","event"]],
    ["Rock music","A genre of popular music originating from rock and roll and electric instruments.","rock music",["music","culture"]],
    ["Jazz","A music genre with roots in African-American communities and improvisation.","jazz",["music","culture"]],
    ["The Beatles","An English rock band from Liverpool with major influence on popular music.","the beatles",["music","band"]],
    ["Beethoven","A composer whose work straddled the Classical and Romantic periods.","beethoven",["music","composer"]],
    ["Vinyl record","An analog medium for storing recorded music soundtracks on plastic discs.","vinyl record",["music","medium"]],
    ["Film","A medium that records and displays moving images for storytelling and entertainment.","film",["art","media"]],
    ["Hollywood","A district in Los Angeles associated with the film industry and studio production.","hollywood",["place","film"]],
    ["Broadway","New York's theatre district known for musicals and plays.","broadway",["place","theater"]],
    ["Netflix","A streaming service offering films and television series online.","netflix",["company","media"]],
    ["YouTube","A major platform for user-uploaded videos and streaming content.","youtube",["company","media"]],
    ["Photography","The art and practice of creating images by recording light.","photography",["art","media"]],
    ["Camera","A device used for capturing photographic images.","camera",["technology","device"]],
    ["Bicycle","A human-powered two-wheeled vehicle used for transport and recreation.","bicycle",["transport","vehicle"]],
    ["Car","A motor vehicle for transporting people on roads.","car",["transport","vehicle"]],
    ["Train","A rail vehicle for transporting passengers or freight over tracks.","train",["transport","public"]],
    ["Airplane","A powered flying vehicle with fixed wings for air travel.","airplane",["transport","vehicle"]],
    ["Tesla","A company known for electric vehicles and energy products.","tesla",["company","automotive"]],
    ["Amazon (company)","E-commerce and cloud computing company operating globally.","amazon (company)",["company","commerce"]],
    ["Google","A technology company known for search, advertising, and many services.","google",["company","technology"]],
    ["Facebook","A social networking platform (Meta) used for connecting people online.","facebook",["company","social"]],
    ["Linux","An open-source operating system used in servers and desktops.","linux",["technology","software"]],
    ["Windows","A family of operating systems developed by Microsoft.","windows",["technology","software"]],
    ["macOS","An operating system used on Apple's Macintosh computers.","macos",["technology","software"]],
    ["Python (programming language)","A high-level programming language used in many domains.","python",["technology","programming"]],
    ["JavaScript","A programming language widely used to create interactive web pages.","javascript",["technology","programming"]],
    ["HTML","The standard markup language for creating web pages.","html",["technology","web"]],
    ["CSS","A style sheet language used to style HTML documents for presentation.","css",["technology","web"]],
    ["OpenAI","A company focusing on artificial intelligence research and deployment.","openai",["company","ai"]],
    ["Cryptocurrency","Digital currencies secured by cryptography and often decentralized.","cryptocurrency",["finance","technology"]],
    ["Bitcoin","A pioneering decentralized cryptocurrency introduced in 2009.","bitcoin",["crypto","currency"]],
    ["Stock Market","A public market for trading shares of companies and other financial instruments.","stock market",["finance","economy"]],
    ["Economics","The study of production, distribution, and consumption of goods and services.","economics",["social science","economy"]],
    ["Philosophy","The study of fundamental questions about existence, knowledge, and ethics.","philosophy",["humanities","culture"]],
    ["Psychology","The scientific study of mind and behavior.","psychology",["science","social"]],
    ["Sociology","The study of societies, social relationships, and institutions.","sociology",["social science","culture"]],
    ["Medicine","The science and practice of diagnosis, treatment, and prevention of disease.","medicine",["health","science"]],
    ["Vaccination","A medical intervention to stimulate the immune system to protect against disease.","vaccination",["medicine","health"]],
    ["Antibiotic","A drug used to treat bacterial infections by killing or inhibiting bacteria.","antibiotic",["medicine","health"]],
    ["Hawaii","A US state made of islands, known for volcanic landscapes and beaches.","hawaii",["place","travel"]],
    ["Istanbul","A city spanning Europe and Asia known for history and culture.","istanbul",["city","culture"]],
    ["Mumbai","A major Indian city known for film (Bollywood) and commerce.","mumbai",["city","culture"]],
    ["Berlin","Germany's capital with strong cultural and historical significance.","berlin",["city","culture"]],
    ["Coca-Cola","A globally distributed carbonated soft drink and brand.","coca-cola",["brand","food"]],
    ["McDonald's","A global fast-food chain known for burgers and fries.","mcdonalds",["brand","food"]],
    ["Nike","A multinational corporation for athletic shoes and apparel.","nike",["brand","company"]],
    ["Adidas","A global company making sports shoes and apparel.","adidas",["brand","company"]],
    ["Spotify","A music streaming service with millions of tracks and playlists.","spotify",["company","music"]],
    ["Grammy Award","An award that recognizes achievement in the music industry.","grammy",["award","music"]],
    ["Nobel Prize","International awards for global achievements in several fields like physics and peace.","nobel prize",["award","science"]],
    ["Olympics","An international multi-sport event held regularly among nations.","olympics",["sport","event"]],
  ];

  // Build PAGES map
  const PAGES = {};
  ITEMS.forEach(([title, desc, img, keywords])=>{
    PAGES[title] = { title, desc, img, keywords: keywords||[], links: [] };
  });

  const titles = Object.keys(PAGES);

  // Create realistic links: share keywords or share title words => link both ways
  for(let i=0;i<titles.length;i++){
    for(let j=i+1;j<titles.length;j++){
      const a = PAGES[titles[i]];
      const b = PAGES[titles[j]];
      const kwOverlap = a.keywords.some(k=> b.keywords.includes(k));
      const wordsA = a.title.toLowerCase().split(/\W+/);
      const wordsB = b.title.toLowerCase().split(/\W+/);
      const titleOverlap = wordsA.some(w=> wordsB.includes(w));
      if(kwOverlap || titleOverlap){
        if(!a.links.includes(b.title)) a.links.push(b.title);
        if(!b.links.includes(a.title)) b.links.push(a.title);
      }
    }
  }

  // add random edges to reach an average degree
  function addRandomEdges(avg){
    for(const t of titles){
      while(PAGES[t].links.length < avg){
        const cand = titles[Math.floor(Math.random()*titles.length)];
        if(cand !== t && !PAGES[t].links.includes(cand)){
          PAGES[t].links.push(cand);
          if(!PAGES[cand].links.includes(t)) PAGES[cand].links.push(t);
        }
      }
    }
  }
  addRandomEdges(5);

  // ensure graph connectivity
  function ensureConnected(){
    const seen = new Set();
    const q = [titles[0]]; seen.add(titles[0]);
    while(q.length){
      const n = q.shift();
      for(const nb of PAGES[n].links) if(!seen.has(nb)){ seen.add(nb); q.push(nb); }
    }
    if(seen.size === titles.length) return;
    const missing = titles.filter(t => !seen.has(t));
    for(const m of missing){
      const s = titles[Math.floor(Math.random()*titles.length)];
      if(!PAGES[m].links.includes(s)) PAGES[m].links.push(s);
      if(!PAGES[s].links.includes(m)) PAGES[s].links.push(m);
      // grow seen
      const q2 = [m]; seen.add(m);
      while(q2.length){ const n = q2.shift(); for(const nb of PAGES[n].links) if(!seen.has(nb)){ seen.add(nb); q2.push(nb);} }
    }
  }
  ensureConnected();

  // ---------- state ----------
  let current = null;
  let target = null;
  let history = [];
  let moves = 0;
  let gameOver = false;

  // DOM elements
  const pageTitleEl = document.getElementById("pageTitle");
  const pageSummaryEl = document.getElementById("pageSummary");
  const linksEl = document.getElementById("links");
  const hintTextEl = document.getElementById("hintText");
  const hintImgEl = document.getElementById("hintImage");
  const heatFill = document.getElementById("heatFill");
  const heatLabelEl = document.getElementById("heatLabel");
  const movesEl = document.getElementById("moves");
  const newGameBtn = document.getElementById("newGameBtn");
  const backBtn = document.getElementById("backBtn");
  const hintBtn = document.getElementById("hintBtn");
  const giveUpBtn = document.getElementById("giveUpBtn");
  const targetNoteEl = document.getElementById("targetNote");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const autocompleteEl = document.getElementById("autocomplete");
  const confettiContainer = document.getElementById("confettiContainer");

  // helpers
  function normalize(s){ return String(s).toLowerCase().trim(); }
  function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function maskTargetWords(text, targetWord){
    if(!text) return "";
    if(!targetWord) return text;
    const cleaned = String(targetWord).replace(/[_()]/g," ").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    let out = text;
    for(const w of words){
      const re = new RegExp("\\b"+escapeRegex(w)+"\\b","gi");
      out = out.replace(re,"_____");
    }
    return out;
  }

  // BFS shortest path length
  function shortestPathLen(from, to){
    if(normalize(from) === normalize(to)) return 0;
    const q = [{node:from, depth:0}];
    const seen = new Set([from]);
    while(q.length){
      const {node, depth} = q.shift();
      for(const nb of PAGES[node].links){
        if(seen.has(nb)) continue;
        if(normalize(nb) === normalize(to)) return depth + 1;
        seen.add(nb);
        q.push({node:nb, depth:depth+1});
      }
    }
    return Infinity;
  }

  function heatFromDistance(d){
    if(d === 0) return {pct:100, label:"🔥 Boiling (100%)"};
    if(d === 1) return {pct:92, label:"🔥 Very Hot (92%)"};
    if(d === 2) return {pct:75, label:"🌡 Warm (75%)"};
    if(d === 3) return {pct:55, label:"🌤 Mild (55%)"};
    if(d === 4) return {pct:35, label:"❄ Cold (35%)"};
    return {pct:12, label:"🧊 Far (12%)"};
  }

  function colorForPercent(p){
    p = Math.max(0, Math.min(100, p));
    if(p <= 50){
      const t = p/50;
      const r = Math.round(0 + (255-0)*t);
      const g = Math.round(122 + (165-122)*t);
      const b = Math.round(255 - (255*t));
      return `rgb(${r},${g},${b})`;
    } else {
      const t = (p-50)/50;
      const r = 255;
      const g = Math.round(165 - (165*t));
      const b = 0;
      return `rgb(${r},${g},${b})`;
    }
  }

  // UI render for a page
  function renderPage(title, countAsMove=true){
    current = title;
    const page = PAGES[title];
    pageTitleEl.textContent = page.title;
    pageSummaryEl.textContent = maskTargetWords(page.desc.split('. ')[0]+'.', target);

    linksEl.innerHTML = '';
    if(gameOver){
      // no nav links when gameover
      if(normalize(current) === normalize(target)){
        linksEl.innerHTML = `<div class="victory-text">🎉 You found the target: <b>${target}</b></div>`;
      } else {
        linksEl.innerHTML = `<div class="victory-text">Target revealed: <b>${target}</b></div>`;
      }
    } else {
      // populate links
      const neighbors = Array.from(new Set(page.links));
      neighbors.sort((a,b)=>{
        // prefer ones sharing keywords
        const aShare = shareKeyword(a,title) ? 0 : 1;
        const bShare = shareKeyword(b,title) ? 0 : 1;
        if(aShare !== bShare) return aShare - bShare;
        return a.localeCompare(b);
      });
      for(const n of neighbors){
        const btn = document.createElement('button');
        btn.className = 'linkBtn';
        btn.textContent = n;
        btn.onclick = ()=>{
          if(gameOver) return;
          history.push(current);
          moves++;
          movesEl.textContent = moves;
          navigateTo(n);
        };
        linksEl.appendChild(btn);
      }
    }

    // update heat
    updateHeat();

    // clear autocomplete
    autocompleteEl.style.display = 'none';
    autocompleteEl.innerHTML = '';
    searchInput.value = '';
    backBtn.disabled = history.length === 0;
  }

  function shareKeyword(a,b){
    const ka = PAGES[a].keywords || [];
    const kb = PAGES[b].keywords || [];
    return ka.some(x=> kb.includes(x));
  }

  function updateHeat(){
    const d = shortestPathLen(current, target);
    const heat = heatFromDistance(d);
    heatFill.style.width = heat.pct + '%';
    heatFill.style.background = colorForPercent(heat.pct);
    if(heat.pct >= 80) heatFill.style.boxShadow = "0 0 14px rgba(255,60,60,0.9), inset 0 0 10px rgba(255,120,80,0.25)";
    else heatFill.style.boxShadow = "none";
    if(d === 0) heatFill.classList.add('pulse'); else heatFill.classList.remove('pulse');
    heatLabelEl.textContent = heat.label;
  }

  function navigateTo(title){
    renderPage(title, true);
    if(normalize(title) === normalize(target)){
      gameOver = true;
      // true victory: confetti + new game
      launchConfetti();
      newGameBtn.style.display = 'inline-block';
      Array.from(document.querySelectorAll('.linkBtn')).forEach(b=> b.disabled = true);
      targetNoteEl.innerHTML = `Target: <b>${target}</b>`;
    }
  }

  function goBack(){
    if(gameOver) return;
    if(history.length === 0) return;
    const prev = history.pop();
    moves++;
    movesEl.textContent = moves;
    renderPage(prev, true);
  }

  function giveUp(){
    if(gameOver) return;
    gameOver = true;
    renderPage(target, true);
    newGameBtn.style.display = 'inline-block';
    hintTextEl.textContent = `You gave up — target was: ${target}`;
    hintImgEl.style.display = 'none';
    targetNoteEl.innerHTML = `Target: <b>${target}</b>`;
  }

  function newGame(){
    history = [];
    moves = 0;
    movesEl.textContent = moves;
    gameOver = false;
    newGameBtn.style.display = 'none';
    hintTextEl.textContent = 'Click Hint for a masked sentence or image.';
    hintImgEl.style.display = 'none';
    targetNoteEl.innerHTML = `<em>hidden</em>`;

    // pick random start & target
    const keys = Object.keys(PAGES);
    const start = keys[Math.floor(Math.random()*keys.length)];
    let tgt = keys[Math.floor(Math.random()*keys.length)];
    while(normalize(tgt) === normalize(start)) tgt = keys[Math.floor(Math.random()*keys.length)];
    current = start;
    target = tgt;

    // initial hint (masked first sentence)
    const first = (PAGES[target].desc.split('. ')[0] || PAGES[target].desc) + '.';
    hintTextEl.textContent = "First hint: " + maskTargetWords(first, target);
    renderPage(current, false);
  }

  // search/autocomplete
  function doSearch(term){
    if(!term) return;
    const keys = Object.keys(PAGES);
    const normalized = normalize(term);
    let found = keys.find(k => normalize(k) === normalized);
    if(!found) found = keys.find(k => normalize(k).startsWith(normalized));
    if(!found) found = keys.find(k => normalize(k).includes(normalized));
    if(found){
      history.push(current);
      moves++;
      movesEl.textContent = moves;
      navigateTo(found);
    } else {
      alert("No page found matching: " + term);
    }
  }

  function showAutocomplete(prefix){
    const keys = Object.keys(PAGES);
    const normalized = normalize(prefix);
    if(!normalized){
      autocompleteEl.style.display = 'none'; autocompleteEl.innerHTML = ''; return;
    }
    const matches = keys.filter(k => normalize(k).includes(normalized)).slice(0,20);
    if(matches.length === 0){ autocompleteEl.style.display = 'none'; autocompleteEl.innerHTML = ''; return; }
    autocompleteEl.innerHTML = '';
    matches.forEach(m => {
      const div = document.createElement('div');
      div.textContent = m;
      div.onclick = () => {
        searchInput.value = m;
        autocompleteEl.style.display = 'none';
        doSearch(m);
      };
      autocompleteEl.appendChild(div);
    });
    autocompleteEl.style.display = 'block';
  }

  // hint
  function showHint(){
    if(!target) return;
    const sents = PAGES[target].desc.split(/\. /).map(s=>s.trim()).filter(Boolean);
    let chosen = '';
    if(sents.length > 1) chosen = sents[1] + (sents[1].endsWith('.') ? '' : '.');
    else chosen = sents[0] || '';
    const type = Math.floor(Math.random()*3);
    hintTextEl.textContent = '';
    hintImgEl.style.display = 'none';
    if((type === 0 || type === 2) && chosen) hintTextEl.textContent = maskTargetWords(chosen, target);
    if((type === 1 || type === 2) && PAGES[target].img){
      hintImgEl.src = `https://source.unsplash.com/400x240/?${encodeURIComponent(PAGES[target].img)}`;
      hintImgEl.alt = target;
      hintImgEl.style.display = 'block';
    }
  }

  // confetti (victory only)
  function launchConfetti(){
    const container = confettiContainer;
    const COUNT = 50;
    for(let i=0;i<COUNT;i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random()*100 + 'vw';
      el.style.background = `hsl(${Math.random()*360}, 90%, 60%)`;
      el.style.width = (6 + Math.random()*8) + 'px';
      el.style.height = (10 + Math.random()*12) + 'px';
      el.style.opacity = 0.8 + Math.random()*0.2;
      el.style.animationDuration = (2.5 + Math.random()*2.5) + 's';
      container.appendChild(el);
      setTimeout(()=> el.remove(), 7000);
    }
  }

  // wiring
  backBtn.addEventListener('click', ()=> goBack());
  hintBtn.addEventListener('click', ()=> { if(!gameOver) showHint(); });
  giveUpBtn.addEventListener('click', ()=> giveUp());
  newGameBtn.addEventListener('click', ()=> newGame());
  searchBtn.addEventListener('click', ()=> doSearch(searchInput.value.trim()));
  searchInput.addEventListener('input', ()=> showAutocomplete(searchInput.value.trim()));
  searchInput.addEventListener('keydown', (e)=> {
    if(e.key === 'Enter'){ e.preventDefault(); doSearch(searchInput.value.trim()); autocompleteEl.style.display='none'; }
    if(e.key === 'Escape'){ autocompleteEl.style.display='none'; }
  });

  // init PAGES into map
  for(const [title,desc,img,keywords] of ITEMS) { /* already built above */ }
  // Build PAGES map (we already built earlier)

  // set moves
  movesEl.textContent = '0';

  // create PAGES object accessible in this closure
  const PAGES_MAP = PAGES; // already defined

  // start
  newGame();

  // expose for debug
  window.RWG = { PAGES: PAGES_MAP, shortestPathLen };

})();

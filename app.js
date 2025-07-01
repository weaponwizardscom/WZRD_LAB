
/* === OVERLAY CREATOR === */
function createOverlay(){
  const ov = document.createElement("div");
  ov.id = "action-overlay";
  ov.className = "action-overlay hidden";
  ov.innerHTML = '<button id="bg-overlay" class="overlay-btn">Zmień Tło</button>' +
                 '<button id="save-overlay" class="overlay-btn">Zapisz Obraz</button>';
  return ov;
}
const overlay = createOverlay();
document.addEventListener("DOMContentLoaded",()=>{

    /* === KONFIG === */
    let currentSvg=null;
    const TEXTURE ="img/glock17.png";
    const MODELS={glock:"g17.svg",sig:"sig.svg",cz:"cz.svg"};
let BG      =["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
const BG_DEFAULT = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
const BG_CZ = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];
    
    const PRICE={zamek:400,szkielet:400,spust:150,lufa:200,zerdz:50,pazur:50,
                 zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:150}; // płytka = 0
    const MIX2=800, MIXN=1000;
    
    /* === DOM === */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view"),partsBox=$("parts"),palette=$("palette"),priceBox=$("price");
    const bgBtn=$("bg-btn"),saveBtn=$("save-btn"),resetBtn=$("reset-btn");
    const sendBtn=$("send-btn"),modal=$("modal"),mSend=$("m-send"),mCancel=$("m-cancel"),
          mName=$("m-name"),mMail=$("m-mail"),mPhone=$("m-phone");
    const langPl=$("pl"),langEn=$("en"),hParts=$("h-parts"),hCol=$("h-col"),
          modalTitle=$("modal-title"),modalNote=$("modal-note");
    
    /* === DANE === */
    const PARTS=[
     {id:"zamek",    pl:"Zamek",           en:"Slide"},
     {id:"szkielet", pl:"Szkielet",        en:"Frame"},
     {id:"spust",    pl:"Spust",           en:"Trigger"},
     {id:"lufa",     pl:"Lufa",            en:"Barrel"},
     {id:"zerdz",    pl:"Żerdź",           en:"Recoil spring"},
     {id:"pazur",    pl:"Pazur",           en:"Extractor"},
     {id:"zrzut",    pl:"Zrzut magazynka", en:"Magazine catch"},
     {id:"blokadap", pl:"Blokada zamka",   en:"Slide lock"},
     {id:"blokada2", pl:"Zrzut zamka",     en:"Slide stop lever"},
     {id:"pin",      pl:"Pin",             en:"Trigger pin"},
     {id:"stopka",   pl:"Stopka",          en:"Floorplate"},
     {id:"plytka",   pl:"Płytka",          en:"Back plate",disabled:true}
    ];
    
    const COLORS={/* skrócone tutaj (pełna lista jak w index) */}
    Object.assign(COLORS,{
    "H-140 Bright White": "#FFFFFF",
    "H-136 Snow White": "#F5F5F5",
    "H-297 Stormtrooper White": "#F2F2F2",
    "H-242 Hidden White": "#E5E4E2",
    "H-312 Frost": "#C9C8C6",
    "H-151 Satin Aluminum": "#C0C0C0",
    "H-255 Crushed Silver": "#BDBFC1",
    "H-158 Shimmer Aluminum": "#B6B6B4",
    "H-152 Stainless": "#A9A9A9",
    "H-150 Savage Stainless": "#A3A3A3",
    "H-306 Springfield Grey": "#A2A4A6",
    "H-262 Stone Grey": "#A0A0A0",
    "H-265 Cold War Grey": "#999B9E",
    "H-184 Glock Grey": "#919396",
    "H-214 S&W Grey": "#8D918D", // Znany też jako Bull Shark Grey
    "H-227 Tactical Grey": "#8D8A82",
    "H-342 Smoke": "#84888B",
    "H-170 Titanium": "#7A7A7A",
    "H-147 Satin Mag": "#7A7A7A",
    "H-237 Tungsten": "#6E7176",
    "H-130 Combat Grey": "#6A6A6A",
    "H-188 Magpul Stealth Grey": "#5C6670",
    "H-210 Sig Dark Grey": "#5B5E5E",
    "H-234 Sniper Grey": "#5B6063",
    "H-213 Battleship Grey": "#52595D",
    "H-219 Gun Metal Grey": "#58595B",
    "H-139 Steel Grey": "#54585A",

    // === CZARNE ===
    "H-146 Graphite Black": "#3B3B3B",
    "H-190 Armor Black": "#212121",
    "H-238 Midnight Blue": "#1E232B", // Bardzo ciemny granat, prawie czarny
    "H-235 Socom Black": "#1C1C1C",
    "H-109 Gloss Black": "#101010",
    "H-294 Midnight Black": "#111111",

    // === BRĄZY / BEŻE / PIASKOWE ===
    "H-142 Light Sand": "#D2C3A8",
    "H-143 Benelli Sand": "#D1C6B4",
    "H-199 Desert Sand": "#C5BBAA",
    "H-33446 FS Sabre Sand": "#B19672",
    "H-267 Magpul FDE": "#A48F6A",
    "H-261 Glock FDE": "#A18A6E",
    "H-265 Flat Dark Earth": "#7A6D5A", // Na liście był też Cold War Grey z tym H-xxx, to jest poprawny FDE
    "H-8000 RAL 8000": "#937750",
    "H-235 Coyote Tan": "#8A7968", // Na liście był też Socom Black z tym H-xxx, to jest poprawny Coyote Tan
    "H-250 A.I. Dark Earth": "#7D6A54",
    "H-30372 FS Brown Sand": "#7B6F63",
    "H-268 Troy Coyote Tan": "#7B6A4C",
    "H-148 Burnt Bronze": "#8C6A48",
    "H-293 Vortex Bronze": "#7E6650",
    "H-259 Barrett Bronze": "#715B4C",
    "H-226 Patriot Brown": "#4B443D",
    "H-269 Barrett Brown": "#67594D",
    "H-258 Chocolate Brown": "#5C4B43",
    "H-339 Federal Brown": "#5E5044",
    "H-212 Federal Brown": "#4A403A", // Inna wersja

    // === ZIELENIE ===
    "H-168 Zombie Green": "#A3B93A",
    "H-331 Parakeet Green": "#C2D94B",
    "H-247 Desert Sage": "#6A6B5C",
    "H-231 Magpul Foliage Green": "#6C7164",
    "H-240 Mil Spec O.D. Green": "#5F604F",
    "H-232 Magpul O.D. Green": "#5A5B4C",
    "H-236 O.D. Green": "#57594B",
    "H-229 Sniper Green": "#565A4B",
    "H-264 Mil Spec Green": "#50544A",
    "H-189 Noveske Bazooka Green": "#6C6B4E",
    "H-344 Olive": "#6B6543",
    "H-200 Highland Green": "#4B5344",
    "H-248 Forest Green": "#404C3D",
    "H-353 Island Green": "#00887A",
    "H-316 Squatch Green": "#006A4E",

    // === NIEBIESKIE ===
    "H-175 Robin's Egg Blue": "#78C5B9",
    "H-327 Tiffany Blue": "#71CEC7",

    "H-357 Periwinkle": "#6B6EA6",
    "H-169 Sky Blue": "#5898D2",
    "H-329 Blue Raspberry": "#0077C0",
    "H-185 Blue Titanium": "#4A617A",
    "H-256 Cobalt": "#395173", // W poprzedniej liście ten kod H był błędnie przypisany
    "H-171 NRA Blue": "#00387B",
    "H-362 Patriot Blue": "#33415C",
    "H-258 Socom Blue": "#3B4B5A", // W poprzedniej liście ten kod H był błędnie przypisany
    "H-127 Kel-Tec Navy Blue": "#2B3C4B",

    // === RÓŻOWE / FIOLETOWE / CZERWONE ===
    "H-224 Sig Pink": "#E6C9C4",
    "H-321 Blush": "#D8C0C4",
    "H-244 Bazooka Pink": "#F3AACB",
    "H-141 Prison Pink": "#E55C9C",
    "H-217 Bright Purple": "#8A2BE2",
    "H-332 Purplexed": "#6C4E7C",
    "H-197 Wild Purple": "#5A3A54",
    "H-167 USMC Red": "#9E2B2F",
    "H-221 Crimson": "#891F2B",
    "H-216 S&W Red": "#B70101", // Znany też jako Firehouse Red

    // === POMARAŃCZOWE / ŻÓŁTE / ZŁOTE ===
    "H-128 Hunter Orange": "#F26522",
    "H-322 Blood Orange": "#DE4A07",
    "H-317 Sunflower": "#F9A602",
    "H-354 Lemon Zest": "#F7D51D",
    "H-144 Corvette Yellow": "#FDE135",
    "H-122 Gold": "#B79436",
    "H-327 Rose Gold": "#D9A99A", // Ten sam H-xxx co Tiffany Blue, ale inna nazwa i wygląd

    });
    
    /* === STAN === */
    let lang = localStorage.getItem("lang") || "pl", selections={},activePart=null,bgIdx=0;
    
    /* === INIT === */
    (async()=>{await preloadBGs();buildUI();
// overlay mapping
overlay.querySelector("#bg-overlay").onclick = ()=> bgBtn.click();
overlay.querySelector("#save-overlay").onclick = ()=> saveBtn.click();
addModelListeners();// defaultBlack() disabled as per user request
  changeBg();})();
    
    /* preload BG */
    function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}
    
    /* SVG */
    async function loadSvg(){
      if(!currentSvg)return;
      gunBox.innerHTML = await fetch(currentSvg).then(r=>r.text());
      gunBox.appendChild(overlay);
      const svg=gunBox.querySelector("svg");const layer=document.createElementNS("http://www.w3.org/2000/svg","g");
      layer.id="color-overlays";svg.appendChild(layer);
      PARTS.filter(p=>!p.disabled).forEach(p=>{
        const base=svg.querySelector("#"+p.id);if(!base)return;
        ["1","2"].forEach(n=>{const ov=base.cloneNode(true);ov.id=`color-overlay-${n}-${p.id}`;ov.classList.add("color-overlay");layer.appendChild(ov);});
      });
    }
    
    /* UI */
    function buildUI(){
      /* części */
      PARTS.forEach(p=>{
        const b=document.createElement("button");
        b.textContent=p[lang];b.dataset.id=p.id;
        if(p.disabled){b.classList.add("disabled");b.disabled=true;}
        else b.onclick=()=>selectPart(b,p.id);
        partsBox.appendChild(b);
      });
      /* mix */
      ["MIX (≤2)","MIX (3+)"].forEach((txt,i)=>{
        const m=document.createElement("button");m.className="mix";m.textContent=txt;
        m.onclick=()=>mix(i?undefined:2);partsBox.appendChild(m);
      });
      /* paleta */
      Object.entries(COLORS).forEach(([full,hex])=>{
        const [code,...rest]=full.split(" ");const name=rest.join(" ");
        const sw=document.createElement("div");sw.className="sw";sw.title=full;
        sw.onclick=()=>applyColor(activePart,hex,code);
        sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
        palette.appendChild(sw);
      });
    
      /* events */
      bgBtn.onclick=changeBg;saveBtn.onclick=savePng;resetBtn.onclick=resetAll;
      sendBtn.onclick=()=>modal.classList.remove("hidden");
      mCancel.onclick=()=>modal.classList.add("hidden");mSend.onclick=sendMail;
      langPl.onclick=()=>setLang("pl");langEn.onclick=()=>setLang("en");
    }
    
    /* Lang */
    function setLang(l){lang=l;
      partsBox.querySelectorAll("button").forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.id);if(p)b.textContent=p[lang];
      });
      hParts.textContent=l==="pl"?"1. Wybierz część":"1. Select part";
      hCol.textContent  =l==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select colour (Cerakote)";
      bgBtn.textContent =l==="pl"?"Zmień Tło":"Change background";
      saveBtn.textContent=l==="pl"?"Zapisz Obraz":"Save image";
      resetBtn.textContent=l==="pl"?"Resetuj Kolory":"Reset colours";
      sendBtn.textContent =l==="pl"?"Wyślij do Wizards!":"Send to Wizards!";
      mSend.textContent   =l==="pl"?"Wyślij":"Send";
      mCancel.textContent =l==="pl"?"Anuluj":"Cancel";
      mName.placeholder   =l==="pl"?"Imię":"Name";
      mMail.placeholder   =l==="pl"?"E-mail":"E-mail";
      mPhone.placeholder  =l==="pl"?"Telefon":"Phone";
      modalTitle.textContent=l==="pl"?"Wyślij projekt":"Send project";
      modalNote.textContent =l==="pl"?"Po wysłaniu dołącz pobrany plik PNG."
                                     :"After sending, attach the downloaded PNG.";
      langPl.classList.toggle("active",l==="pl");langEn.classList.toggle("active",l==="en");
      updateSummary();
    }
    
    /* wybór części */
    function selectPart(btn,id){
      partsBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");activePart=id;
    }
    
    /* apply colour */
    function applyColor(id,hex,code){
      if(!id){alert(lang==="pl"?"Najpierw wybierz część":"Select a part first");return;}
      ["1","2"].forEach(n=>{
        const ov=document.getElementById(`color-overlay-${n}-${id}`);
        if(ov)(ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
      });
      selections[id]=code;updateSummary();updatePrice();
    }
    
    /* MIX */
    function mix(maxCols){
      const keys=Object.keys(COLORS),used=new Set();
      PARTS.filter(p=>!p.disabled).forEach(p=>{
        let pick;
        do{pick=keys[Math.floor(Math.random()*keys.length)];}
        while(maxCols && used.size>=maxCols && !used.has(pick.split(" ")[0]));
        used.add(pick.split(" ")[0]);
        applyColor(p.id,COLORS[pick],pick.split(" ")[0]);
      });
    }
    
    /* Reset */
    function resetAll(){
      document.querySelectorAll(".color-overlay").forEach(o=>{
        (o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent");
      });
      selections={};activePart=null;updateSummary();updatePrice();
    }
    
    /* default colour */
    function defaultBlack(){PARTS.filter(p=>!p.disabled).forEach(p=>applyColor(p.id,COLORS["H-146 Graphite Black"],"H-146"));}
    
    /* BG */
    function changeBg(){bgIdx=(bgIdx+1)%BG.length;gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;}
    
    /* summary + price */
    function updateSummary(){
      const list=$("summary-list");list.innerHTML="";
      PARTS.forEach(p=>{if(selections[p.id]){const d=document.createElement("div");d.textContent=`${p[lang]} – ${selections[p.id]}`;list.appendChild(d);}});
    }
    function updatePrice(){
      const cols=new Set(Object.values(selections)).size;
      let total=Object.keys(selections).reduce((s,id)=>s+(PRICE[id]||0),0);
      total=cols<=2?Math.min(total,MIX2):Math.min(total,MIXN);
      priceBox.innerHTML=(lang==="pl"?"Szacowany koszt:&nbsp;&nbsp;":"Estimated cost:&nbsp;&nbsp;")+total+"&nbsp;zł";
      return total;
    }
    
    /* PNG save */
    const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
    async function savePng(){
      const cvs=document.createElement("canvas");cvs.width=1600;cvs.height=1200;const ctx=cvs.getContext("2d");
      ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200);
      ctx.drawImage(await loadImg(TEXTURE),0,0,1600,1200);
      const svg=gunBox.querySelector("svg");
      await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(async ov=>{
        const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
        const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
        ctx.drawImage(await loadImg(url),0,0,1600,1200);URL.revokeObjectURL(url);
      }));
      const a=document.createElement("a");a.href=cvs.toDataURL("image/png");a.download="weapon-wizards.png";a.click();
      return a.href;
    }
    
    /* mailto */
/* Model select */
function addModelListeners(){
  document.querySelectorAll(".model-btn").forEach(btn=>{
     btn.addEventListener("click",()=>chooseModel(btn.dataset.model));
  });
}
function chooseModel(model){
  const overlay=document.getElementById("model-select");
  if(overlay)overlay.classList.add("hidden");
  currentSvg=MODELS[model]||"g17.svg";
  if(model==="cz"){BG=BG_CZ;}else{BG=BG_DEFAULT;}bgIdx=0;changeBg();loadSvg();
}

    async function sendMail(){
      const name=mName.value.trim(),mail=mMail.value.trim(),tel=mPhone.value.trim();
      if(!name||!mail){alert(lang==="pl"?"Podaj imię i e-mail":"Please provide name and email");return;}
      await savePng();
      const cost=updatePrice();
      const body=[(lang==="pl"?"Imię":"Name")+": "+name,
                  "Telefon: "+tel,"E-mail: "+mail,
                  (lang==="pl"?"Koszt":"Cost")+": "+cost+" zł","","Kolory:",
                  ...PARTS.map(p=>`${p[lang]} – ${selections[p.id]||"–"}`),"",
                  (lang==="pl"?"Dołącz pobrany plik PNG.":"Attach the downloaded PNG.")].join("%0D%0A");
      location.href=`mailto:contact@weapon-wizards.com?subject=Projekt%20Weapon%20Wizards&cc=${encodeURIComponent(mail)}&body=${body}`;
      modal.classList.add("hidden");
    }
    
    });
    
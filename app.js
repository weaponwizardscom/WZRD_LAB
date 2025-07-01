document.addEventListener("DOMContentLoaded",()=>{

/* === KONFIG === */
let currentSvg=null;
const TEXTURE="img/glock17.png";
const MODELS={glock:"g17.svg",sig:"sig.svg",cz:"cz.svg"};

let BG      =["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
const BG_DEFAULT=[...BG];
const BG_CZ = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];

const PRICE={zamek:400,szkielet:400,spust:150,lufa:200,zerdz:50,pazur:50,
             zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:150};
const MIX2=800,MIXN=1000;

/* === DOM SHORT === */
const $=id=>document.getElementById(id);

/* === STAN === */
let lang = localStorage.getItem("lang")||"pl";
let selections={},activePart=null,bgIdx=0;

/* === INIT === */
preloadBGs();
buildUI();
addModelListeners();
changeBg();

/* === FUNKCJE === */
function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}

/* ==== SVG LOAD ==== */
async function loadSvg(){
  if(!currentSvg) return;
  const gunBox=$("gun-view");
  gunBox.innerHTML=await fetch(currentSvg).then(r=>r.text());
  const svg=gunBox.querySelector("svg");
  const overlayLayer=document.createElementNS("http://www.w3.org/2000/svg","g");
  overlayLayer.id="color-overlays";
  svg.appendChild(overlayLayer);
  PARTS.filter(p=>!p.disabled).forEach(p=>{
    const base=svg.querySelector("#"+p.id);if(!base)return;
    ["1","2"].forEach(n=>{
      const ov=base.cloneNode(true);
      ov.id=`color-overlay-${n}-${p.id}`;
      ov.classList.add("color-overlay");
      overlayLayer.appendChild(ov);
    });
  });
}

/* ==== BUDOWA UI ==== */
function buildUI(){
  const partsBox=$("parts"),palette=$("palette");
  PARTS.forEach(p=>{
    const b=document.createElement("button");
    b.textContent=p[lang];
    b.dataset.id=p.id;
    if(p.disabled){b.classList.add("disabled");b.disabled=true;}
    else b.onclick=()=>selectPart(b,p.id);
    partsBox.appendChild(b);
  });
  ["MIX (≤2)","MIX (3+)"].forEach((txt,i)=>{
    const m=document.createElement("button");m.className="mix";m.textContent=txt;
    m.onclick=()=>mix(i?undefined:2);
    partsBox.appendChild(m);
  });

  Object.entries(COLORS).forEach(([full,hex])=>{
    const [code,...rest]=full.split(" ");
    const name=rest.join(" ");
    const sw=document.createElement("div");
    sw.className="sw";sw.title=full;
    sw.onclick=()=>applyColor(activePart,hex,code);
    sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
    palette.appendChild(sw);
  });

  // Przyciski akcji
  $("bg-btn").onclick=changeBg;
  $("save-btn").onclick=savePng;
  $("reset-btn").onclick=resetAll;

  // Overlay mini‑buttons
  $("bg-overlay").onclick=()=>$("bg-btn").click();
  $("save-overlay").onclick=()=>$("save-btn").click();

  // Ustaw pierwsze tłumaczenie
  setLang(lang);
}

/* ====== SET LANG ====== */
function setLang(l){
  lang=l;
  localStorage.setItem("lang",l);

  $("h-parts").textContent=l==="pl"?"1. Wybierz część":"1. Select part";
  $("h-col").textContent =l==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select colour (Cerakote)";
  $("bg-btn").textContent=l==="pl"?"Zmień Tło":"Change background";
  $("save-btn").textContent=l==="pl"?"Zapisz Obraz":"Save image";
  $("reset-btn").textContent=l==="pl"?"Resetuj Kolory":"Reset colours";
  $("send-btn").textContent =l==="pl"?"Wyślij do Wizards!":"Send to Wizards!";
  $("price").previousLanguageUpdate=true; // flag for external updates

  // Overlay buttons
  if($("bg-overlay")){
    $("bg-overlay").textContent=l==="pl"?"Zmień Tło":"Change background";
    $("save-overlay").textContent=l==="pl"?"Zapisz Obraz":"Save image";
  }

  // Przetłumacz przyciski części
  document.querySelectorAll("#parts button").forEach(btn=>{
    const p=PARTS.find(x=>x.id===btn.dataset.id);if(p)btn.textContent=p[l];
  });

  updateSummary();
}

/* === WYBÓR CZĘŚCI === */
function selectPart(btn,id){
  document.querySelectorAll("#parts button").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");
  activePart=id;
}

/* === KOLORY === */
function applyColor(id,hex,code){
  if(!id){alert(lang==="pl"?"Najpierw wybierz część":"Select a part first");return;}
  ["1","2"].forEach(n=>{
    const ov=document.getElementById(`color-overlay-${n}-${id}`);
    if(ov)(ov.tagName==="g"?ov.querySelectorAll("*"):[ov]).forEach(s=>s.style.fill=hex);
  });
  selections[id]=code;
  updateSummary();
  updatePrice();
}

/* === MIX === */
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

/* === RESET === */
function resetAll(){
  document.querySelectorAll(".color-overlay").forEach(o=>{
    (o.tagName==="g"?o.querySelectorAll("*"):[o]).forEach(s=>s.style.fill="transparent");
  });
  selections={};activePart=null;updateSummary();updatePrice();
}

/* === PODSUMOWANIE / CENA === */
function updateSummary(){
  const list=$("summary-list");list.innerHTML="";
  PARTS.forEach(p=>{
    if(selections[p.id]){
      const d=document.createElement("div");
      d.textContent=`${p[lang]} – ${selections[p.id]}`;
      list.appendChild(d);
    }
  });
}
function updatePrice(){
  const cols=new Set(Object.values(selections)).size;
  let total=Object.keys(selections).reduce((s,id)=>s+(PRICE[id]||0),0);
  total=cols<=2?Math.min(total,MIX2):Math.min(total,MIXN);
  $("price").innerHTML=(lang==="pl"?"Szacowany koszt:&nbsp;&nbsp;":"Estimated cost:&nbsp;&nbsp;")+total+"&nbsp;zł";
  return total;
}

/* === BACKGROUND === */
function changeBg(){const gunBox=$("gun-view");bgIdx=(bgIdx+1)%BG.length;gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;}

/* === PNG === */
const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
async function savePng(){
  const cvs=document.createElement("canvas");cvs.width=1600;cvs.height=1200;
  const ctx=cvs.getContext("2d");
  ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200);
  ctx.drawImage(await loadImg(TEXTURE),0,0,1600,1200);
  const svg=$("gun-view").querySelector("svg");
  await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(async ov=>{
    const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
    const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
    ctx.drawImage(await loadImg(url),0,0,1600,1200);URL.revokeObjectURL(url);
  }));
  const a=document.createElement("a");a.href=cvs.toDataURL("image/png");a.download="weapon-wizards.png";a.click();
}

/* === MODEL CHOICE === */
function addModelListeners(){
  document.querySelectorAll(".model-btn").forEach(btn=>{
    btn.addEventListener("click",()=>chooseModel(btn.dataset.model));
  });
}
function chooseModel(model){
  const overlay=$("model-select");
  if(overlay)overlay.classList.add("hidden");
  currentSvg=MODELS[model]||"g17.svg";
  BG=(model==="cz")?BG_CZ:[...BG_DEFAULT];
  bgIdx=0;changeBg();
  $("action-overlay").classList.remove("hidden");
  loadSvg();
}

/* === DANE === */
const PARTS=[
 {id:"zamek",pl:"Zamek",en:"Slide"},
 {id:"szkielet",pl:"Szkielet",en:"Frame"},
 {id:"spust",pl:"Spust",en:"Trigger"},
 {id:"lufa",pl:"Lufa",en:"Barrel"},
 {id:"zerdz",pl:"Żerdź",en:"Recoil spring"},
 {id:"pazur",pl:"Pazur",en:"Extractor"},
 {id:"zrzut",pl:"Zrzut magazynka",en:"Magazine catch"},
 {id:"blokadap",pl:"Blokada zamka",en:"Slide lock"},
 {id:"blokada2",pl:"Zrzut zamka",en:"Slide stop lever"},
 {id:"pin",pl:"Pin",en:"Trigger pin"},
 {id:"stopka",pl:"Stopka",en:"Floorplate"},
 {id:"plytka",pl:"Płytka",en:"Back plate",disabled:true}
];

const COLORS={
  "H-146 Graphite Black":"#3B3B3B",
  "H-140 Bright White":"#FFFFFF"
  // skrócone dla demo
};

});
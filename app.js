/* === OVERLAY CREATOR === */
function createOverlay(){
  const ov = document.createElement("div");
  ov.id = "action-overlay";
  ov.className = "action-overlay hidden";
  ov.innerHTML = '<button id="bg-overlay" class="overlay-btn">Zmień tło</button><button id="save-overlay" class="overlay-btn">Zapisz obraz</button>';
  return ov;
}
const overlay = createOverlay();

document.addEventListener("DOMContentLoaded",()=>{

    /* === GŁÓWNA KONFIGURACJA === */
    const PISTOLS = {
        glock: {
            svg: 'g17.svg',
            views: {
                '01': { texture: 'img/pistols/glock/01/glock1.png', backgrounds: ['img/pistols/glock/01/g1.png', 'img/pistols/glock/01/g2.png', 'img/pistols/glock/01/g3.png', 'img/pistols/glock/01/g4.png', 'img/pistols/glock/01/g5.png', 'img/pistols/glock/01/g6.png', 'img/pistols/glock/01/g7.png'] },
                '02': { texture: 'img/pistols/glock/02/glock2.png', backgrounds: ['img/pistols/glock/02/g21.png', 'img/pistols/glock/02/g22.png', 'img/pistols/glock/02/g23.png', 'img/pistols/glock/02/g24.png', 'img/pistols/glock/02/g25.png', 'img/pistols/glock/02/g26.png', 'img/pistols/glock/02/g27.png'] },
                '03': { texture: 'img/pistols/glock/03/glock3.png', backgrounds: ['img/pistols/glock/03/g31.png', 'img/pistols/glock/03/g32.png', 'img/pistols/glock/03/g33.png', 'img/pistols/glock/03/g34.png', 'img/pistols/glock/03/g35.png', 'img/pistols/glock/03/g36.png', 'img/pistols/glock/03/g37.png'] }
            }
        },
        cz: {
            svg: 'cz.svg',
            views: {
                '01': { texture: 'img/pistols/cz/cz.png', backgrounds: ['img/pistols/cz/cz1.png', 'img/pistols/cz/cz2.png', 'img/pistols/cz/cz3.png', 'img/pistols/cz/cz4.png'] }
            }
        },
        sig: {
            svg: 'sig.svg',
            views: {
                '01': { texture: 'img/pistols/sig/sig_texture.png', backgrounds: ['img/pistols/sig/sig_bg_1.png'] }
            }
        }
    };
    
    const PRICE={zamek:350,szkielet:350,spust:100,lufa:200,zerdz:50,pazur:50,
                 zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:100};
    const CAMO_PRICE = 1200;
    const MIX2=800, MIXN=1000;
    
    /* === DOM === */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view"), partsBox=$("parts"), palette=$("palette"), priceBox=$("price");
    const summaryList=$("summary-list"), summaryPlaceholder=$("summary-placeholder");
    const viewBtn=$("view-btn"), weaponBtn=$("weapon-btn"), resetBtn=$("reset-btn"), sendBtn=$("send-btn");
    const sendModal=$("send-modal"), mSend=$("m-send"), mCancel=$("m-cancel"), mName=$("m-name"), mMail=$("m-mail"), mPhone=$("m-phone"), modalTitle=$("modal-title"), modalNote=$("modal-note");
    const camoModal=$("camo-modal"), camoPalette=$("camo-palette"), camoSwatch1=$("camo-swatch-1"), camoSwatch2=$("camo-swatch-2"), camoSwatch3=$("camo-swatch-3"), camoConfirmBtn=$("camo-confirm-btn"), camoCancelBtn=$("camo-cancel-btn"), camoModalTitle=$("camo-modal-title");
    const langPl=$("pl"), langEn=$("en"), hParts=$("h-parts"), hCol=$("h-col");
    
    /* === DANE === */
    let PARTS = [];
    let COLORS = {};
    
    /* === STAN APLIKACJI === */
    let lang = localStorage.getItem("lang") || "pl";
    let selections = {};
    let activePart = null;
    let currentModel = null;
    let currentViewIndex = 0;
    let currentBgIndex = 0;
    let currentTexture = null;
    let camoSelections = { c1: null, c2: null, c3: null }; 
    let camoTempSelections = [null, null, null]; 
    let camoSelectionIndex = 0; 
    
    /* === INIT === */
    (async()=>{
      try {
        const [partsData, colorsData] = await Promise.all([
            fetch('parts.json').then(res => res.json()),
            fetch('colors.json').then(res => res.json())
        ]);
        PARTS = partsData;
        COLORS = colorsData;
      } catch(e) {
        console.error("Błąd wczytywania plików konfiguracyjnych JSON:", e);
        gunBox.innerHTML = "<p style='color:red; text-align:center;'>Błąd ładowania konfiguracji.</p>";
        return;
      }
      
      buildUI();
      buildCamoPalette();
      addModelListeners();
      setLang(lang);
    })();
    
    async function loadSvg(svgPath){
      if(!svgPath)return;
      gunBox.innerHTML = `<p id="loading-text" style="text-align:center;padding-top:20px;color:#6c757d">${lang === 'pl' ? 'Ładowanie...' : 'Loading...'}</p>`;
      gunBox.innerHTML = await fetch(svgPath).then(r=>r.text());
      gunBox.appendChild(overlay);
      const svg=gunBox.querySelector("svg"), layer=document.createElementNS("http://www.w3.org/2000/svg","g");
      layer.id="color-overlays"; svg.appendChild(layer);
      [...PARTS, {id:'c1'}, {id:'c2'}, {id:'c3'}].forEach(p=>{
        const base=svg.querySelector("#"+p.id); if(!base) return;
        ["1","2"].forEach(n=>{
            const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`;
            ov.classList.add("color-overlay"); layer.appendChild(ov);
        });
      });
      Object.entries(selections).forEach(([partId, colorCode]) => {
          const colorEntry = Object.entries(COLORS).find(([name, hex]) => name.startsWith(colorCode));
          if(colorEntry) applyColorToSVG(partId, colorEntry[1], colorCode);
      });
    }
    
    function buildUI(){
      partsBox.innerHTML = ''; 
      palette.innerHTML = ''; 

      PARTS.forEach(p=>{
        const b=document.createElement("button"); b.textContent=p[lang]; b.dataset.id=p.id;
        if(p.disabled){ b.classList.add("disabled"); b.disabled=true; }
        else { b.onclick=()=>selectPart(b,p.id); }
        partsBox.appendChild(b);
      });
      ['MIX (≤2)','MIX (3+)'].forEach((txt,i)=>{
        const m=document.createElement("button"); m.className="mix"; m.textContent=txt;
        m.onclick=()=>mix(i?undefined:2); partsBox.appendChild(m);
      });
      const camoAlphaBtn=document.createElement("button");
      camoAlphaBtn.textContent="CAMO ALPHA"; camoAlphaBtn.className="camo-alpha";
      camoAlphaBtn.onclick = openCamoModal; partsBox.appendChild(camoAlphaBtn);
      const camoCharlieBtn = document.createElement("button");
      camoCharlieBtn.textContent = "CAMO CHARLIE"; camoCharlieBtn.className = "camo-charlie";
      camoCharlieBtn.disabled = true; partsBox.appendChild(camoCharlieBtn);
      const mixCamoAlphaBtn = document.createElement("button");
      mixCamoAlphaBtn.textContent = "MIX CAMO ALPHA"; mixCamoAlphaBtn.className = "mix-camo";
      mixCamoAlphaBtn.onclick = mixCamo; partsBox.appendChild(mixCamoAlphaBtn);
      const mixCamoCharlieBtn = document.createElement("button");
      mixCamoCharlieBtn.textContent = "MIX CAMO CHARLIE"; mixCamoCharlieBtn.className = "mix-camo";
      mixCamoCharlieBtn.disabled = true; partsBox.appendChild(mixCamoCharlieBtn);
      Object.entries(COLORS).forEach(([full,hex])=>{
        const [code,...rest]=full.split(" "); const name=rest.join(" ");
        const sw=document.createElement("div"); sw.className="sw"; sw.title=full;
        sw.onclick=()=>applyColor(activePart,hex,code);
        sw.innerHTML=`<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
        palette.appendChild(sw);
      });
      resetBtn.onclick=resetAll; sendBtn.onclick=()=>sendModal.classList.remove("hidden");
      mCancel.onclick=()=>sendModal.classList.add("hidden"); mSend.onclick=sendMail;
      langPl.onclick=()=>setLang("pl"); langEn.onclick=()=>setLang("en");
      viewBtn.onclick = changeView;
      overlay.querySelector("#bg-overlay").onclick = changeBg;
      overlay.querySelector("#save-overlay").onclick = ()=>savePng(true);
    }
    
    function buildCamoPalette() {
        camoPalette.innerHTML = '';
        Object.entries(COLORS).forEach(([full, hex]) => {
            const [code, ...rest] = full.split(" "); const name = rest.join(" ");
            const sw = document.createElement("div"); sw.className = "sw"; sw.title = full;
            sw.onclick = () => selectCamoColor({ hex, code });
            sw.innerHTML = `<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
            camoPalette.appendChild(sw);
        });
    }

    function openCamoModal() {
        camoTempSelections[0] = camoSelections.c1; 
        camoTempSelections[1] = camoSelections.c2;
        camoTempSelections[2] = camoSelections.c3;
        const swatches = [camoSwatch1, camoSwatch2, camoSwatch3];
        swatches.forEach((swatch, i) => {
            swatch.style.backgroundColor = camoTempSelections[i] ? camoTempSelections[i].hex : '#333';
            swatch.textContent = camoTempSelections[i] ? camoTempSelections[i].code : '';
        });
        camoSelectionIndex = 0;
        camoModal.classList.remove("hidden");
        camoConfirmBtn.onclick = confirmCamoSelection;
        camoCancelBtn.onclick = () => camoModal.classList.add("hidden");
    }

    function selectCamoColor(colorObject) {
        camoTempSelections[camoSelectionIndex] = colorObject;
        const swatches = [camoSwatch1, camoSwatch2, camoSwatch3];
        swatches[camoSelectionIndex].style.backgroundColor = colorObject.hex;
        swatches[camoSelectionIndex].textContent = colorObject.code;
        camoSelectionIndex = (camoSelectionIndex + 1) % 3;
    }
    
    function setLang(l){
      lang=l; localStorage.setItem('lang', l);
      document.title = l==="pl"?"Weapon-Wizards – Pistolet":"Weapon-Wizards – Pistol";
      
      partsBox.querySelectorAll("button:not(.mix):not([class^='camo-']):not(.mix-camo)").forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.id); if(p) b.textContent=p[lang];
      });
      hParts.textContent=l==="pl"?"1. Wybierz część":"1. Select part"; hCol.textContent=l==="pl"?"2. Wybierz kolor (Cerakote)":"2. Select colour (Cerakote)";
      if(viewBtn) viewBtn.textContent=l==="pl"?"Zmień widok":"Change view";
      if(weaponBtn) weaponBtn.textContent=l==="pl"?"Zmień broń":"Change weapon";
      resetBtn.textContent=l==="pl"?"Resetuj kolory":"Reset colours"; sendBtn.textContent=l==="pl"?"Wyślij do Wizards!":"Send to Wizards!";
      const bgOverlay=$("bg-overlay"), saveOverlay=$("save-overlay");
      if(bgOverlay) bgOverlay.textContent=l==="pl"?"Zmień tło":"Change background";
      if(saveOverlay) saveOverlay.textContent=l==="pl"?"Zapisz obraz":"Save image";
      mSend.textContent=l==="pl"?"Wyślij":"Send"; mCancel.textContent=l==="pl"?"Anuluj":"Cancel";
      mName.placeholder=l==="pl"?"Imię":"Name"; mMail.placeholder=l==="pl"?"E-mail":"E-mail"; mPhone.placeholder=l==="pl"?"Telefon":"Phone";
      modalTitle.textContent=l==="pl"?"Wyślij projekt":"Send project"; modalNote.textContent=l==="pl"?"Twój projekt zostanie wysłany automatycznie.":"Your project will be sent automatically.";
      camoModalTitle.textContent=l==='pl'?'Wybierz 3 kolory kamuflażu':'Select 3 camo colors';
      camoConfirmBtn.textContent=l==='pl'?'Zatwierdź':'Confirm'; camoCancelBtn.textContent=l==='pl'?'Anuluj':'Cancel';
      if(summaryPlaceholder) summaryPlaceholder.textContent = l === 'pl' ? 'W tym miejscu pojawią się wybrane przez Ciebie kolory.' : 'Your chosen colors will appear here.';
      langPl.classList.toggle("active",l==="pl"); langEn.classList.toggle("active",l==="en");
      updateSummaryAndPrice();
    }
    function selectPart(btn,id){
      partsBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); activePart=id;
    }
    function applyColorToSVG(id, hex, code) {
        if (!id) return;
        ["1","2"].forEach(n=>{
            const ov=$(`color-overlay-${n}-${id}`);
            if(ov) Array.from(ov.tagName==="g"?ov.children:[ov]).forEach(s=>s.style.fill=hex);
        });
        if (code) { selections[id] = code; } 
        else { delete selections[id]; }
    }
    
    function clearCamo() { /* ... */ }
    function clearSolidColors() { /* ... */ }
    function applyColor(id, hex, code){ /* ... */ }
    function mix(maxCols){ /* ... */ }
    function confirmCamoSelection() { /* ... */ }
    function mixCamo() { /* ... */ }
    function resetAll(){ /* ... */ }
    
    function changeView() {
        if (!currentModel) return;
        const modelData = PISTOLS[currentModel];
        const viewKeys = Object.keys(modelData.views);
        if (viewKeys.length < 2) return;
        currentViewIndex = (currentViewIndex + 1) % viewKeys.length;
        const newViewKey = viewKeys[currentViewIndex];
        loadView(currentModel, newViewKey, true);
    }
    
    async function loadView(modelKey, viewKey, viewChanged = false) {
        const modelData = PISTOLS[modelKey];
        if (!modelData) return;
        const viewData = modelData.views[viewKey];
        if (!viewData) return;

        if (!viewChanged) {
            await loadSvg(modelData.svg);
        }
        
        currentTexture = viewData.texture;
        currentBgIndex = Math.floor(Math.random() * viewData.backgrounds.length);
        gunBox.style.backgroundImage = `url('${viewData.backgrounds[currentBgIndex]}')`;
    }

    function chooseModel(modelKey){
      if (currentModel === modelKey) return; 
      
      const overlay=$("model-select"); if(overlay)overlay.classList.add("hidden");
      
      currentModel = modelKey;
      currentViewIndex = 0;
      resetAll();
      const firstViewKey = Object.keys(PISTOLS[currentModel].views)[0];
      loadView(currentModel, firstViewKey);
    }
    
    function changeBg(){ 
        if (!currentModel) return;
        const viewKey = Object.keys(PISTOLS[currentModel].views)[currentViewIndex];
        const backgrounds = PISTOLS[currentModel].views[viewKey].backgrounds;
        if (backgrounds.length < 2) return;
        currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
        gunBox.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
    }
    
    // ... Pozostałe funkcje (savePng, sendMail, etc.)
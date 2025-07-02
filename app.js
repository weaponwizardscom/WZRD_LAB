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
                  '02': { texture: 'img/pistols/glock/02/glock2.png', backgrounds: ['img/pistols/glock/02/g21.png', 'img/pistols/glock/02/g22.png', 'img/pistols/glock/02/g23.png'] },
                  '03': { texture: 'img/pistols/glock/03/glock3.png', backgrounds: ['img/pistols/glock/03/g31.png', 'img/pistols/glock/03/g32.png'] }
              }
          },
          cz: {
              svg: 'cz.svg',
              views: {
                  '01': { texture: 'img/pistols/cz/cz1.png', backgrounds: ['img/pistols/cz/cz2.png', 'img/pistols/cz/cz3.png', 'img/pistols/cz/cz4.png'] }
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
        // Wczytujemy dane z plików JSON
        try {
          const [partsData, colorsData] = await Promise.all([
              fetch('parts.json').then(res => res.json()),
              fetch('colors.json').then(res => res.json())
          ]);
          PARTS = partsData;
          COLORS = colorsData;
        } catch(e) {
          console.error("Błąd wczytywania plików konfiguracyjnych JSON:", e);
          gunBox.innerHTML = "<p style='color:red; text-align:center;'>Błąd ładowania konfiguracji. Sprawdź pliki parts.json i colors.json.</p>";
          return;
        }
        
        buildUI();
        buildCamoPalette();
        overlay.querySelector("#bg-overlay").onclick = changeBg;
        overlay.querySelector("#save-overlay").onclick = ()=>savePng(true);
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
        // Klonowanie wszystkich części (w tym c1, c2, c3, które są w pliku SVG)
        [...PARTS, {id:'c1'}, {id:'c2'}, {id:'c3'}].forEach(p=>{
          const base=svg.querySelector("#"+p.id); if(!base) return;
          ["1","2"].forEach(n=>{
              const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`;
              ov.classList.add("color-overlay"); layer.appendChild(ov);
          });
        });
        // Aplikuj zapisane kolory po załadowaniu nowego SVG
        Object.entries(selections).forEach(([partId, colorCode]) => {
            const colorObject = Object.entries(COLORS).find(([name, hex]) => name.startsWith(colorCode));
            if(colorObject) applyColorToSVG(partId, colorObject[1], colorCode);
        });
      }
      
      function buildUI(){
        partsBox.innerHTML = ''; 
        palette.innerHTML = ''; 
  
        PARTS.filter(p => !['c1', 'c2', 'c3'].includes(p.id)).forEach(p=>{
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
      }
      
      // ... reszta funkcji (zgodnie z poprzednimi ustaleniami)
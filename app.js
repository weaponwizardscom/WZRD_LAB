/* === OVERLAY CREATOR === */
function createOverlay(){
  const ov = document.createElement("div");
  ov.id = "action-overlay";
  ov.className = "action-overlay hidden";
  ov.innerHTML = '<button id="bg-overlay" class="overlay-btn"></button><button id="save-overlay" class="overlay-btn"></button>';
  return ov;
}
const overlay = createOverlay();

document.addEventListener("DOMContentLoaded",()=>{

    /* === KONFIG === */
    let currentSvg=null;
    const TEXTURE ="img/glock17.png";
    const MODELS={glock:"g17.svg",sig:"sig.svg",cz:"cz.svg"};
    let BG = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    const BG_DEFAULT = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    const BG_CZ = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];
    const PRICE={zamek:400,szkielet:400,spust:150,lufa:200,zerdz:50,pazur:50,
                 zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:150};
    const CAMO_PRICE = 1200;
    const MIX2=800, MIXN=1000;
    
    /* === DOM === */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view"), partsBox=$("parts"), palette=$("palette"), priceBox=$("price");
    const viewBtn=$("view-btn"), weaponBtn=$("weapon-btn"), resetBtn=$("reset-btn"), sendBtn=$("send-btn");
    const sendModal=$("send-modal"), mSend=$("m-send"), mCancel=$("m-cancel"), mName=$("m-name"), mMail=$("m-mail"), mPhone=$("m-phone"), modalTitle=$("modal-title"), modalNote=$("modal-note");
    const camoModal=$("camo-modal"), camoPalette=$("camo-palette"), camoSwatch1=$("camo-swatch-1"), camoSwatch2=$("camo-swatch-2"), camoConfirmBtn=$("camo-confirm-btn"), camoCancelBtn=$("camo-cancel-btn"), camoModalTitle=$("camo-modal-title");
    const langPl=$("pl"), langEn=$("en"), hParts=$("h-parts"), hCol=$("h-col");
    
    /* === DANE === */
    const PARTS=[
     {id:"zamek", pl:"Zamek", en:"Slide"}, {id:"szkielet", pl:"Szkielet", en:"Frame"},
     {id:"lufa", pl:"Lufa", en:"Barrel"}, {id:"spust", pl:"Spust", en:"Trigger"},
     {id:"zerdz", pl:"Żerdź", en:"Recoil spring"}, {id:"pazur", pl:"Pazur", en:"Extractor"},
     {id:"zrzut", pl:"Zrzut magazynka", en:"Magazine catch"}, {id:"blokadap", pl:"Blokada zamka", en:"Slide lock"},
     {id:"blokada2", pl:"Zrzut zamka", en:"Slide stop lever"}, {id:"pin", pl:"Pin", en:"Trigger pin"},
     {id:"stopka", pl:"Stopka", en:"Floorplate"}, {id:"plytka", pl:"Płytka", en:"Back plate", disabled:true},
     {id:"c1", pl:"Wzór 1", en:"Pattern 1"}, {id:"c2", pl:"Wzór 2", en:"Pattern 2"}
    ];
    
    const COLORS={/* skrócone */};
    Object.assign(COLORS,{"H-140 Bright White":"#FFFFFF","H-136 Snow White":"#F5F5F5","H-297 Stormtrooper White":"#F2F2F2","H-242 Hidden White":"#E5E4E2","H-312 Frost":"#C9C8C6","H-151 Satin Aluminum":"#C0C0C0","H-255 Crushed Silver":"#BDBFC1","H-158 Shimmer Aluminum":"#B6B6B4","H-152 Stainless":"#A9A9A9","H-150 Savage Stainless":"#A3A3A3","H-306 Springfield Grey":"#A2A4A6","H-262 Stone Grey":"#A0A0A0","H-265 Cold War Grey":"#999B9E","H-184 Glock Grey":"#919396","H-214 S&W Grey":"#8D918D","H-227 Tactical Grey":"#8D8A82","H-342 Smoke":"#84888B","H-170 Titanium":"#7A7A7A","H-147 Satin Mag":"#7A7A7A","H-237 Tungsten":"#6E7176","H-130 Combat Grey":"#6A6A6A","H-188 Magpul Stealth Grey":"#5C6670","H-210 Sig Dark Grey":"#5B5E5E","H-234 Sniper Grey":"#5B6063","H-213 Battleship Grey":"#52595D","H-219 Gun Metal Grey":"#58595B","H-139 Steel Grey":"#54585A","H-146 Graphite Black":"#3B3B3B","H-190 Armor Black":"#212121","H-238 Midnight Blue":"#1E232B","H-235 Socom Black":"#1C1C1C","H-109 Gloss Black":"#101010","H-294 Midnight Black":"#111111","H-142 Light Sand":"#D2C3A8","H-143 Benelli Sand":"#D1C6B4","H-199 Desert Sand":"#C5BBAA","H-33446 FS Sabre Sand":"#B19672","H-267 Magpul FDE":"#A48F6A","H-261 Glock FDE":"#A18A6E","H-265 Flat Dark Earth":"#7A6D5A","H-8000 RAL 8000":"#937750","H-235 Coyote Tan":"#8A7968","H-250 A.I. Dark Earth":"#7D6A54","H-30372 FS Brown Sand":"#7B6F63","H-268 Troy Coyote Tan":"#7B6A4C","H-148 Burnt Bronze":"#8C6A48","H-293 Vortex Bronze":"#7E6650","H-259 Barrett Bronze":"#715B4C","H-226 Patriot Brown":"#4B443D","H-269 Barrett Brown":"#67594D","H-258 Chocolate Brown":"#5C4B43","H-339 Federal Brown":"#5E5044","H-212 Federal Brown":"#4A403A","H-168 Zombie Green":"#A3B93A","H-331 Parakeet Green":"#C2D94B","H-247 Desert Sage":"#6A6B5C","H-231 Magpul Foliage Green":"#6C7164","H-240 Mil Spec O.D. Green":"#5F604F","H-232 Magpul O.D. Green":"#5A5B4C","H-236 O.D. Green":"#57594B","H-229 Sniper Green":"#565A4B","H-264 Mil Spec Green":"#50544A","H-189 Noveske Bazooka Green":"#6C6B4E","H-344 Olive":"#6B6543","H-200 Highland Green":"#4B5344","H-248 Forest Green":"#404C3D","H-353 Island Green":"#00887A","H-316 Squatch Green":"#006A4E","H-175 Robin's Egg Blue":"#78C5B9","H-327 Tiffany Blue":"#71CEC7","H-357 Periwinkle":"#6B6EA6","H-169 Sky Blue":"#5898D2","H-329 Blue Raspberry":"#0077C0","H-185 Blue Titanium":"#4A617A","H-256 Cobalt":"#395173","H-171 NRA Blue":"#00387B","H-362 Patriot Blue":"#33415C","H-258 Socom Blue":"#3B4B5A","H-127 Kel-Tec Navy Blue":"#2B3C4B","H-224 Sig Pink":"#E6C9C4","H-321 Blush":"#D8C0C4","H-244 Bazooka Pink":"#F3AACB","H-141 Prison Pink":"#E55C9C","H-217 Bright Purple":"#8A2BE2","H-332 Purplexed":"#6C4E7C","H-197 Wild Purple":"#5A3A54","H-167 USMC Red":"#9E2B2F","H-221 Crimson":"#891F2B","H-216 S&W Red":"#B70101","H-128 Hunter Orange":"#F26522","H-322 Blood Orange":"#DE4A07","H-317 Sunflower":"#F9A602","H-354 Lemon Zest":"#F7D51D","H-144 Corvette Yellow":"#FDE135","H-122 Gold":"#B79436","H-327 Rose Gold":"#D9A99A"});
    
    /* === STAN === */
    let lang = localStorage.getItem("lang") || "pl";
    let selections = {};
    let activePart = null;
    let bgIdx = 0;
    let camoSelections = { c1: null, c2: null };
    let camoTempSelections = [null, null];
    let camoSelectionIndex = 0;
    
    /* === INIT === */
    (async()=>{
      await preloadBGs(); buildUI(); buildCamoPalette();
      overlay.querySelector("#bg-overlay").onclick = changeBg;
      overlay.querySelector("#save-overlay").onclick = ()=>savePng(true);
      addModelListeners(); changeBg(); setLang(lang);
    })();
    
    function preloadBGs(){ BG.forEach(src=>{const i=new Image();i.src=src;}); }
    
    async function loadSvg(){
      if(!currentSvg)return;
      gunBox.innerHTML = await fetch(currentSvg).then(r=>r.text());
      gunBox.appendChild(overlay);
      const svg=gunBox.querySelector("svg"), layer=document.createElementNS("http://www.w3.org/2000/svg","g");
      layer.id="color-overlays"; svg.appendChild(layer);
      PARTS.forEach(p=>{
        const base=svg.querySelector("#"+p.id); if(!base) return;
        ["1","2"].forEach(n=>{
            const ov=base.cloneNode(true); ov.id=`color-overlay-${n}-${p.id}`;
            ov.classList.add("color-overlay"); layer.appendChild(ov);
        });
      });
      setLang(lang);
    }
    
    function buildUI(){
      PARTS.filter(p => !['c1', 'c2'].includes(p.id)).forEach(p=>{
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

      const mixCamoBtn = document.createElement("button");
      mixCamoBtn.textContent = "MIX CAMO"; mixCamoBtn.className = "mix-camo";
      mixCamoBtn.onclick = mixCamo; partsBox.appendChild(mixCamoBtn);
      
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
    }
    
    function buildCamoPalette() {
        camoPalette.innerHTML = '';
        Object.entries(COLORS).forEach(([full, hex]) => {
            const [code, ...rest] = full.split(" "); const name = rest.join(" ");
            const sw = document.createElement("div"); sw.className = "sw"; sw.title = full;
            sw.onclick = () => selectCamoColor(hex);
            sw.innerHTML = `<div class="dot" style="background:${hex}"></div><div class="lbl">${code}<br>${name}</div>`;
            camoPalette.appendChild(sw);
        });
    }

    function openCamoModal() {
        camoTempSelections[0] = camoSelections.c1; camoTempSelections[1] = camoSelections.c2;
        camoSwatch1.style.backgroundColor = camoTempSelections[0] || '#333';
        camoSwatch2.style.backgroundColor = camoTempSelections[1] || '#333';
        camoSelectionIndex = 0;
        camoModal.classList.remove("hidden");
        camoConfirmBtn.onclick = confirmCamoSelection;
        camoCancelBtn.onclick = () => camoModal.classList.add("hidden");
    }

    function selectCamoColor(hex) {
        camoTempSelections[camoSelectionIndex] = hex;
        (camoSelectionIndex === 0 ? camoSwatch1 : camoSwatch2).style.backgroundColor = hex;
        camoSelectionIndex = (camoSelectionIndex + 1) % 2;
    }

    function confirmCamoSelection() {
        const [color1, color2] = camoTempSelections;
        if (color1 && color2) {
            clearSolidColors();
            camoSelections.c1 = color1; camoSelections.c2 = color2;
            const code1 = Object.keys(COLORS).find(key => COLORS[key] === color1).split(" ")[0];
            const code2 = Object.keys(COLORS).find(key => COLORS[key] === color2).split(" ")[0];
            applyColorToSVG('c1', color1, code1);
            applyColorToSVG('c2', color2, code2);
            camoModal.classList.add("hidden");
            updateSummaryAndPrice();
        } else {
            alert(lang === 'pl' ? 'Proszę wybrać oba kolory.' : 'Please select both colors.');
        }
    }
    
    function setLang(l){
      lang=l; localStorage.setItem('lang', l);
      document.title = l==="pl"?"Weapon-Wizards – Pistolet":"Weapon-Wizards – Pistol";
      const loadingText=$('loading-text'); if(loadingText) loadingText.textContent=l==='pl'?'Ładowanie...':'Loading...';
      
      partsBox.querySelectorAll("button:not(.mix):not(.camo-alpha):not(.mix-camo)").forEach(b=>{
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
      camoModalTitle.textContent=l==='pl'?'Wybierz 2 kolory kamuflażu':'Select 2 camo colors';
      camoConfirmBtn.textContent=l==='pl'?'Zatwierdź':'Confirm'; camoCancelBtn.textContent=l==='pl'?'Anuluj':'Cancel';
      langPl.classList.toggle("active",l==="pl"); langEn.classList.toggle("active",l==="en");
      updateSummaryAndPrice();
    }
    
    function selectPart(btn,id){
      partsBox.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected"); activePart=id;
    }
    
    // *** KLUCZOWA POPRAWKA: Funkcja applyColorToSVG nakłada kolor i zapisuje stan ***
    function applyColorToSVG(id, hex, code) {
        if (!id) return;
        ["1","2"].forEach(n=>{
            const ov=$(`color-overlay-${n}-${id}`);
            if(ov) Array.from(ov.tagName==="g"?ov.children:[ov]).forEach(s=>s.style.fill=hex);
        });
        if (code) { selections[id] = code; } 
        else { delete selections[id]; }
    }
    
    function clearCamo() {
        if (!camoSelections.c1 && !camoSelections.c2) return;
        applyColorToSVG('c1', 'transparent', null);
        applyColorToSVG('c2', 'transparent', null);
        camoSelections = { c1: null, c2: null };
    }

    function clearSolidColors() {
        PARTS.forEach(p => {
            if (!['c1', 'c2'].includes(p.id) && selections[p.id]) {
                 applyColorToSVG(p.id, 'transparent', null);
            }
        });
    }

    // *** POPRAWIONA GŁÓWNA FUNKCJA NAKŁADANIA KOLORU ***
    function applyColor(id, hex, code){
      if(!id){ alert(lang==="pl"?"Najpierw wybierz część":"Select a part first"); return; }
      clearCamo();
      applyColorToSVG(id, hex, code); // Użycie nowej, poprawionej funkcji
      updateSummaryAndPrice();
    }
    
    function mix(maxCols){
      clearCamo();
      clearSolidColors();
      const keys=Object.keys(COLORS), used=new Set();
      const partsToMix = PARTS.filter(p=>!p.disabled && !['c1', 'c2'].includes(p.id));
      partsToMix.forEach(p=>{
        let pick;
        do{ pick=keys[Math.floor(Math.random()*keys.length)]; }
        while(maxCols && used.size>=maxCols && !used.has(pick.split(" ")[0]));
        used.add(pick.split(" ")[0]);
        applyColorToSVG(p.id,COLORS[pick],pick.split(" ")[0]);
      });
      updateSummaryAndPrice();
    }

    function mixCamo() {
        clearSolidColors();
        const keys = Object.keys(COLORS);
        const color1 = COLORS[keys[Math.floor(Math.random() * keys.length)]];
        const color2 = COLORS[keys[Math.floor(Math.random() * keys.length)]];
        camoTempSelections = [color1, color2];
        confirmCamoSelection();
    }
    
    function resetAll(){
      clearCamo();
      clearSolidColors();
      activePart=null;
      updateSummaryAndPrice();
    }
    
    function changeBg(){ bgIdx=(bgIdx+1)%BG.length; gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`; }
    
    function updateSummaryAndPrice(){
      // Podsumowanie
      const list=$("summary-list"); list.innerHTML="";
      const isCamoActive = !!camoSelections.c1;
      
      Object.entries(selections).forEach(([partId, colorCode]) => {
          const part = PARTS.find(p => p.id === partId);
          const isCamoPart = ['c1', 'c2'].includes(partId);
          if (part && colorCode && ((isCamoActive && isCamoPart) || (!isCamoActive && !isCamoPart))) {
              const d=document.createElement("div");
              d.textContent=`${part[lang]} – ${colorCode}`;
              list.appendChild(d);
          }
      });

      // Cena
      let total = 0;
      if (isCamoActive) {
          total = CAMO_PRICE;
      } else {
          const solidSelections = Object.keys(selections).filter(id => !['c1', 'c2'].includes(id));
          const cols=new Set(solidSelections.map(id => selections[id])).size;
          total = solidSelections.reduce((s,id)=>s+(PRICE[id]||0),0);
          if (cols > 0) {
            total = cols<=2 ? Math.min(total,MIX2) : Math.min(total,MIXN);
          }
      }
      priceBox.innerHTML=(lang==="pl"?"Szacowany koszt:&nbsp;&nbsp;":"Estimated cost:&nbsp;&nbsp;")+total+"&nbsp;zł";
    }
    
    function addModelListeners(){ document.querySelectorAll(".model-btn").forEach(btn=>{ btn.addEventListener("click",()=>chooseModel(btn.dataset.model)); });}
    function chooseModel(model){
      const overlay=$("model-select"); if(overlay)overlay.classList.add("hidden");
      currentSvg=MODELS[model]||"g17.svg";
      if(model==="cz"){BG=BG_CZ;}else{BG=BG_DEFAULT;}
      bgIdx=0; changeBg(); loadSvg();
    }
    const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
    async function savePng(download=false){
      const cvs=document.createElement("canvas"); cvs.width=1600; cvs.height=1200;
      const ctx=cvs.getContext("2d");
      ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200); ctx.drawImage(await loadImg(TEXTURE),0,0,1600,1200);
      const svg=gunBox.querySelector("svg");
      await Promise.all([...svg.querySelectorAll(".color-overlay")].filter(o=>o.style.fill!=="transparent").map(async ov=>{
        const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
        const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
        ctx.drawImage(await loadImg(url),0,0,1600,1200); URL.revokeObjectURL(url);
      }));
      if (download) { const a=document.createElement("a"); a.href=cvs.toDataURL("image/png"); a.download="weapon-wizards.png"; a.click(); } 
      else { return cvs.toDataURL("image/png"); }
    }
    async function sendMail(){
      const name = mName.value.trim(), email = mMail.value.trim(), phone = mPhone.value.trim();
      if(!name || !email){ alert(lang==="pl"?"Proszę podać imię i e-mail.":"Please provide name and e-mail."); return; }
      const originalBtnText = mSend.textContent;
      mSend.textContent = lang==='pl'?'Wysyłanie...':'Sending...'; mSend.disabled = true;
      modalNote.textContent = lang==='pl'?'Proszę czekać...':'Please wait...';
      try {
        const imageData = await savePng(false); const formData = new FormData();
        formData.append('name', name); formData.append('email', email); formData.append('phone', phone);
        formData.append('cost', priceBox.textContent);
        let summaryText = "";
        const isCamoActive = !!camoSelections.c1;
        Object.entries(selections).forEach(([partId, colorCode]) => {
            const part = PARTS.find(p => p.id === partId);
            const isCamoPart = ['c1', 'c2'].includes(partId);
            if (part && colorCode && ((isCamoActive && isCamoPart) || (!isCamoActive && !isCamoPart))) {
                summaryText += `${part[lang]} – ${colorCode}\n`;
            }
        });
        formData.append('summary', summaryText); formData.append('image', imageData);
        const response = await fetch('wyslij-mail.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'success') {
            modalNote.textContent = lang==='pl'?'Projekt wysłany pomyślnie!':'Project sent successfully!';
            setTimeout(() => { sendModal.classList.add("hidden"); mSend.textContent = originalBtnText; mSend.disabled = false; }, 2000);
        } else { throw new Error(result.message); }
      } catch (error) {
        console.error('Błąd wysyłania:', error);
        modalNote.textContent = (lang==='pl'?'Błąd wysyłki: ':'Sending error: ') + error.message;
        mSend.textContent = originalBtnText; mSend.disabled = false;
      }
    }
});
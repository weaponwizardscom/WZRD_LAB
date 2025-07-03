/* === OVERLAY CREATOR === */
function createOverlay(){
  const ov = document.createElement("div");
  ov.id = "action-overlay";
  ov.className = "action-overlay"; 
  ov.innerHTML = '<button id="bg-overlay" class="overlay-btn" data-translate="change_bg">Zmień tło</button><button id="save-overlay" class="overlay-btn" data-translate="save_image">Zapisz obraz</button>';
  return ov;
}
const overlay = createOverlay();

document.addEventListener("DOMContentLoaded",()=>{

    /* === KONFIG === */
    let currentModel = null; let currentSvg=null; let currentTexture=null;
    const MODELS={glock:"g17.svg",sig:"sig.svg",cz:"cz.svg"};
    const TEXTURES = { glock: "img/glock17.png", cz: "img/cz_texture.png", sig: "img/sig_texture.png" };
    let BG = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    const BG_DEFAULT = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
    const BG_CZ = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];
    const PRICE={zamek:350,szkielet:350,spust:100,lufa:200,zerdz:50,pazur:50, zrzut:50,blokadap:50,blokada2:50,pin:50,stopka:100};
    const CAMO_PRICE = 1200;
    const MIX2=800, MIXN=1000;
    
    /* === DOM === */
    const $=id=>document.getElementById(id);
    const gunBox=$("gun-view"), partsBox=$("parts"), palette=$("palette"), priceBox=$("price");
    const summaryList=$("summary-list"), summaryPlaceholder=$("summary-placeholder");
    const viewBtn=$("view-btn"), weaponBtn=$("weapon-btn"), resetBtn=$("reset-btn"), sendBtn=$("send-btn");
    const sendModal=$("send-modal"), mSend=$("m-send"), mCancel=$("m-cancel"), mName=$("m-name"), mMail=$("m-mail"), mPhone=$("m-phone"), modalTitle=$("modal-title"), modalNote=$("modal-note");
    const camoModal=$("camo-modal"), camoPalette=$("camo-palette"), camoSwatch1=$("camo-swatch-1"), camoSwatch2=$("camo-swatch-2"), camoSwatch3=$("camo-swatch-3"), camoConfirmBtn=$("camo-confirm-btn"), camoCancelBtn=$("camo-cancel-btn"), camoModalTitle=$("camo-modal-title");
    const langPl=$("pl"), langEn=$("en");
    
    /* === DANE i TŁUMACZENIA === */
    const PARTS=[
     {id:"zamek", pl:"Zamek", en:"Slide"}, {id:"szkielet", pl:"Szkielet", en:"Frame"},
     {id:"lufa", pl:"Lufa", en:"Barrel"}, {id:"spust", pl:"Spust", en:"Trigger"},
     {id:"zerdz", pl:"Żerdź", en:"Recoil spring"}, {id:"pazur", pl:"Pazur", en:"Extractor"},
     {id:"zrzut", pl:"Zrzut magazynka", en:"Magazine catch"}, {id:"blokadap", pl:"Blokada zamka", en:"Slide lock"},
     {id:"blokada2", pl:"Zrzut zamka", en:"Slide stop lever"}, {id:"pin", pl:"Pin", en:"Trigger pin"},
     {id:"stopka", pl:"Stopka", en:"Floorplate"}, {id:"plytka", pl:"Płytka", en:"Back plate", disabled:true},
     {id:"c1", pl:"Wzór 1", en:"Pattern 1"}, {id:"c2", pl:"Wzór 2", en:"Pattern 2"},
     {id:"c3", pl:"Wzór 3", en:"Pattern 3"}
    ];
    
    const COLORS = {
        "H-140 Bright White": "#E8EBE6", "H-136 Snow White": "#F7F8F3", "H-297 Stormtrooper White": "#EFF1F0", "H-242 Hidden White": "#E6E5E1", "H-312 Frost": "#C9C8C6", "H-151 Satin Aluminum": "#C0C0C0", "H-255 Crushed Silver": "#AEB2B5", "H-152 Stainless": "#A9A9A9", "H-306 Springfield Grey": "#A2A4A6", "H-262 Stone Grey": "#9F9E99", "H-265 Cold War Grey": "#8D918D", "H-227 Tactical Grey": "#8C8A81", "H-170 Titanium": "#908C86", "H-237 Tungsten": "#6A6B6E", "H-130 Combat Grey": "#6A6A6A", "H-188 Magpul Stealth Grey": "#45484B", "H-210 Sig Dark Grey": "#5B5E5E", "H-234 Sniper Grey": "#5B6063", "H-213 Battleship Grey": "#52595D", "H-146 Graphite Black": "#474748", "H-190 Armor Black": "#464647", "H-127 Kel-Tec Navy Blue": "#455562", "H-362 Patriot Blue": "#33415C", "H-171 NRA Blue": "#3E5164", "H-258 Socom Blue": "#3B4B5A", "H-238 Midnight Blue": "#484B56", "H-245 Socom Black": "#1C1C1C", "H-294 Midnight Black": "#111111", "H-142 Light Sand": "#DAC5A2", "H-199 Desert Sand": "#A38F7B", "H-30372 FS Brown Sand": "#7B6F63", "H-33446 FS Sabre Sand": "#B19672", "H-265 Flat Dark Earth": "#7A6D5A", "H-8000 RAL 8000": "#8B7355", "H-250 A.I. Dark Earth": "#7D6A54", "H-268 Troy Coyote Tan": "#7B6A4C", "H-148 Burnt Bronze": "#6D5947", "H-293 Vortex Bronze": "#7E6650", "H-226 Patriot Brown": "#4B443D", "H-269 Barrett Brown": "#67594D", "H-149 Copper Brown": "#8B4513", "H-339 Federal Brown": "#5E5044", "H-34094 Green": "#344033", "H-248 Forest Green": "#404C3D", "H-200 Highland Green": "#4B5344", "H-189 Noveske Bazooka Green": "#726D54", "H-344 Olive": "#6B6543", "H-229 Sniper Green": "#565A4B", "H-240 Mil Spec O.D. Green": "#5F604F", "H-231 Magpul Foliage Green": "#6C7164", "H-247 Desert Sage": "#6A6B5C", "H-305 Jesse James Eastern Front Green": "#555849", "H-353 Island Green": "#00887A", "H-316 Squatch Green": "#006A4E", "H-331 Parakeet Green": "#C2D94B", "H-354 Lemon Zest": "#F7D51D", "H-144 Corvette Yellow": "#FDE135", "H-317 Sunflower": "#F9A602", "H-128 Hunter Orange": "#E85F47", "H-167 USMC Red": "#B24645", "H-216 S&W Red": "#B70101", "H-221 Crimson": "#891F2B", "H-141 Prison Pink": "#DF88A7", "H-224 Sig Pink": "#E6C9C4", "H-321 Blush": "#D8C0C4", "H-357 Periwinkle": "#6B6EA6", "H-332 Purplexed": "#6C4E7C", "H-197 Wild Purple": "#845F84", "H-122 Gold": "#D4AF37",
    };
    
    const translations = {
        pl: {
            my_profile: "Mój Profil", logout: "Wyloguj", change_bg: "Zmień tło", save_image: "Zapisz obraz",
            loading: "Ładowanie...", select_part: "1. Wybierz część", select_color: "2. Wybierz kolor (Cerakote)",
            change_view: "Zmień widok", change_weapon: "Zmień broń", reset_colors: "Resetuj kolory",
            consult_project: "Skonsultuj projekt z Wizards", send_project_title: "Wyślij projekt",
            name_placeholder: "Imię", email_placeholder: "E-mail", phone_placeholder: "Telefon",
            send_btn: "Wyślij", cancel_btn: "Anuluj", send_note: "Twój projekt zostanie wysłany automatycznie.",
            camo_select_title: "Wybierz 3 kolory kamuflażu", confirm_btn: "Zatwierdź",
            summary_placeholder: "W tym miejscu pojawią się wybrane przez Ciebie kolory.",
            cost_label: "Szacowany koszt:"
        },
        en: {
            my_profile: "My Profile", logout: "Logout", change_bg: "Change background", save_image: "Save image",
            loading: "Loading...", select_part: "1. Select part", select_color: "2. Select colour (Cerakote)",
            change_view: "Change view", change_weapon: "Change weapon", reset_colors: "Reset colours",
            consult_project: "Consult the project with Wizards", send_project_title: "Send project",
            name_placeholder: "Name", email_placeholder: "E-mail", phone_placeholder: "Phone",
            send_btn: "Send", cancel_btn: "Cancel", send_note: "Your project will be sent automatically.",
            camo_select_title: "Select 3 camo colors", confirm_btn: "Confirm",
            summary_placeholder: "Your chosen colors will appear here.",
            cost_label: "Estimated cost:"
        }
    };
    
    /* === STAN === */
    let lang = localStorage.getItem("lang") || "pl";
    let selections = {}; let activePart = null; let bgIdx = 0;
    let camoSelections = { c1: null, c2: null, c3: null }; 
    let camoTempSelections = [null, null, null]; let camoSelectionIndex = 0; 
    
    /* === INIT === */
    (async()=>{
      if (window.firebaseAuth) {
        const auth = window.firebaseAuth;
        auth.onAuthStateChanged(user => {
          if (user) {
            const userNameDisplay = document.getElementById('user-name-display');
            if (userNameDisplay) userNameDisplay.textContent = user.displayName;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());
            const mNameInput = document.getElementById('m-name');
            const mMailInput = document.getElementById('m-mail');
            if(mNameInput) mNameInput.value = user.displayName || '';
            if(mMailInput) mMailInput.value = user.email || '';
          }
        });
      }
      await preloadBGs();
      buildUI();
      buildCamoPalette();
      overlay.querySelector("#bg-overlay").onclick = changeBg;
      overlay.querySelector("#save-overlay").onclick = ()=>savePng(true);
      addModelListeners();
      setLang(lang);
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
      partsBox.innerHTML = ''; palette.innerHTML = ''; 
      PARTS.filter(p => !['c1', 'c2', 'c3'].includes(p.id)).forEach(p=>{
        const b=document.createElement("button"); b.dataset.id=p.id;
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
      document.documentElement.lang = l;
      document.title = l==="pl"?"Weapon-Wizards – Pistolet":"Weapon-Wizards – Pistol";
      
      document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if(translations[l] && translations[l][key]) el.textContent = translations[l][key];
      });
       document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.dataset.translatePlaceholder;
        if(translations[l] && translations[l][key]) el.placeholder = translations[l][key];
      });
      
      partsBox.querySelectorAll("button:not(.mix):not(.camo-alpha):not(.mix-camo):not(.camo-charlie)").forEach(b=>{
        const p=PARTS.find(x=>x.id===b.dataset.id); if(p) b.textContent=p[lang];
      });
      
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
    
    function clearCamo() {
        if (!camoSelections.c1 && !camoSelections.c2 && !camoSelections.c3) return;
        applyColorToSVG('c1', 'transparent', null);
        applyColorToSVG('c2', 'transparent', null);
        applyColorToSVG('c3', 'transparent', null);
        camoSelections = { c1: null, c2: null, c3: null };
    }

    function clearSolidColors() {
        PARTS.forEach(p => {
            if (!['c1', 'c2', 'c3'].includes(p.id) && selections[p.id]) {
                 applyColorToSVG(p.id, 'transparent', null);
            }
        });
    }

    function applyColor(id, hex, code){
      if(!id){ alert(translations[lang].select_part_alert || "Najpierw wybierz część"); return; }
      clearCamo();
      applyColorToSVG(id, hex, code);
      updateSummaryAndPrice();
    }

    function mix(maxCols){
      clearCamo();
      clearSolidColors();
      const keys=Object.keys(COLORS), used=new Set();
      const partsToMix = PARTS.filter(p=>!p.disabled && !['c1', 'c2', 'c3'].includes(p.id));
      partsToMix.forEach(p=>{
        let pick;
        do{ pick=keys[Math.floor(Math.random()*keys.length)]; }
        while(maxCols && used.size>=maxCols && !used.has(pick.split(" ")[0]));
        used.add(pick.split(" ")[0]);
        applyColorToSVG(p.id,COLORS[pick],pick.split(" ")[0]);
      });
      updateSummaryAndPrice();
    }
    
    function confirmCamoSelection() {
        const [color1, color2, color3] = camoTempSelections;
        if (color1 && color2 && color3) {
            clearSolidColors();
            camoSelections = { c1: color1, c2: color2, c3: color3 };
            applyColorToSVG('c1', color1.hex, color1.code);
            applyColorToSVG('c2', color2.hex, color2.code);
            applyColorToSVG('c3', color3.hex, color3.code);
            camoModal.classList.add("hidden");
            updateSummaryAndPrice();
        } else {
            alert(translations[lang].camo_select_3_colors_alert || 'Proszę wybrać wszystkie trzy kolory.');
        }
    }

    function mixCamo() {
        clearSolidColors();
        const keys = Object.keys(COLORS);
        const randomColor = () => {
            const full = keys[Math.floor(Math.random() * keys.length)];
            return { hex: COLORS[full], code: full.split(" ")[0] };
        };
        camoTempSelections = [randomColor(), randomColor(), randomColor()];
        confirmCamoSelection();
    }
    
    function resetAll(){
      selections = {}; camoSelections = { c1: null, c2: null, c3: null }; activePart=null;
      document.querySelectorAll(".color-overlay").forEach(o=>{
        (Array.from(o.tagName==="g"?o.children:[o])).forEach(s=>s.style.fill='transparent');
      });
      updateSummaryAndPrice();
    }

    function changeBg(){ bgIdx=(bgIdx+1)%BG.length; gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`; }
    
    function updateSummaryAndPrice(){
      summaryList.innerHTML="";
      const isCamoActive = !!camoSelections.c1;
      let hasSelections = false;
      Object.entries(selections).forEach(([partId, colorCode]) => {
          const part = PARTS.find(p => p.id === partId);
          const isCamoPart = ['c1', 'c2', 'c3'].includes(partId);
          if (part && colorCode && ((isCamoActive && isCamoPart) || (!isCamoActive && !isCamoPart))) {
              hasSelections = true;
              const d=document.createElement("div");
              d.textContent=`${part[lang]} – ${colorCode}`;
              summaryList.appendChild(d);
          }
      });
      summaryPlaceholder.style.display = hasSelections ? 'none' : 'flex';
      
      let total = 0;
      if (isCamoActive) {
          total = CAMO_PRICE;
      } else {
          const solidSelections = Object.keys(selections).filter(id => !['c1', 'c2', 'c3'].includes(id));
          const cols=new Set(solidSelections.map(id => selections[id])).size;
          total = solidSelections.reduce((s,id)=>s+(PRICE[id]||0),0);
          if (cols > 0) {
            total = cols<=2 ? Math.min(total,MIX2) : Math.min(total,MIXN);
          }
      }
      priceBox.innerHTML=`<span data-translate="cost_label">${translations[lang].cost_label}</span>&nbsp;&nbsp;`+total+"&nbsp;zł";
    }

    function addModelListeners(){
      document.querySelectorAll(".model-btn").forEach(btn=>{
         btn.addEventListener("click",()=>chooseModel(btn.dataset.model));
      });
    }

    function chooseModel(model){
      if (currentModel === model && gunBox.querySelector("svg")) return; 
      currentModel = model;
      const overlay=$("model-select"); if(overlay)overlay.classList.add("hidden");
      currentSvg=MODELS[model]||"g17.svg";
      currentTexture = TEXTURES[model] || TEXTURES.glock;
      if(model==="cz"){BG=BG_CZ;}else{BG=BG_DEFAULT;}
      bgIdx=-1; changeBg();
      resetAll();
      loadSvg();
    }

    const loadImg=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
    async function savePng(download=false){
      const cvs=document.createElement("canvas"); cvs.width=1600; cvs.height=1200;
      const ctx=cvs.getContext("2d");
      ctx.drawImage(await loadImg(BG[bgIdx]),0,0,1600,1200);
      if(currentTexture) {
        ctx.drawImage(await loadImg(currentTexture),0,0,1600,1200);
      }
      const svg=gunBox.querySelector("svg");
      const activeSelections = Object.keys(selections);
      for (const partId of activeSelections) {
          const overlays = [...svg.querySelectorAll(`[id$="-${partId}"].color-overlay`)];
          for (const ov of overlays) {
            if (ov.style.fill && ov.style.fill !== 'transparent') {
                const xml=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svg.getAttribute("viewBox")}"><g style="mix-blend-mode:hard-light;opacity:.45">${ov.outerHTML}</g></svg>`;
                const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));
                ctx.drawImage(await loadImg(url),0,0,1600,1200);
                URL.revokeObjectURL(url);
            }
          }
      }
      if (download) { const a=document.createElement("a"); a.href=cvs.toDataURL("image/png"); a.download="weapon-wizards.png"; a.click(); } 
      else { return cvs.toDataURL("image/png"); }
    }
    
    async function sendMail(){
      const name = mName.value.trim(), email = mMail.value.trim(), phone = mPhone.value.trim();
      if(!name || !email){ alert(translations[lang].send_error_name_email || "Proszę podać imię i e-mail."); return; }
      const originalBtnText = mSend.textContent;
      mSend.textContent = translations[lang].sending_in_progress || 'Wysyłanie...'; mSend.disabled = true;
      modalNote.textContent = translations[lang].please_wait || 'Proszę czekać...';
      try {
        const imageData = await savePng(false); const formData = new FormData();
        formData.append('name', name); formData.append('email', email); formData.append('phone', phone);
        formData.append('cost', priceBox.textContent);
        let summaryText = "";
        const isCamoActive = !!camoSelections.c1;
        Object.entries(selections).forEach(([partId, colorCode]) => {
            const part = PARTS.find(p => p.id === partId);
            const isCamoPart = ['c1', 'c2', 'c3'].includes(partId);
            if (part && colorCode && ((isCamoActive && isCamoPart) || (!isCamoActive && !isCamoPart))) {
                summaryText += `${part[lang]} – ${colorCode}\n`;
            }
        });
        formData.append('summary', summaryText); formData.append('image', imageData);
        const response = await fetch('wyslij-mail.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.status === 'success') {
            modalNote.textContent = translations[lang].send_success || 'Projekt wysłany pomyślnie!';
            setTimeout(() => { sendModal.classList.add("hidden"); mSend.textContent = originalBtnText; mSend.disabled = false; }, 2000);
        } else { throw new Error(result.message); }
      } catch (error) {
        console.error('Błąd wysyłania:', error);
        modalNote.textContent = (translations[lang].send_error || 'Błąd wysyłki: ') + error.message;
        mSend.textContent = originalBtnText; mSend.disabled = false;
      }
    }
});
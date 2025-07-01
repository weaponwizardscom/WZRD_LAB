
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
    const langPlBtn=$("pl"),langEnBtn=$("en"),hParts=$("h-parts"),hCol=$("h-col"),
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

    const COLORS={}; // skrócone – pełna lista w oryginale
    /* ... (tu pominięto długą listę, pozostaje bez zmian) ... */

    /* === STAN === */
    let lang = localStorage.getItem("lang") || "pl";
    let selections={},activePart=null,bgIdx=0;

    /* === INIT === */
    (async()=>{
        await preloadBGs();
        buildUI();
        setLang(lang);              // <<< ustawia język od razu po zbudowaniu UI
        addModelListeners();
        changeBg();
    })();

    /* preload BG */
    function preloadBGs(){BG.forEach(src=>{const i=new Image();i.src=src;});}

    /* SVG */
    async function loadSvg(){
      if(!currentSvg)return;
      const overlay = document.getElementById("action-overlay");
      gunBox.innerHTML=await fetch(currentSvg).then(r=>r.text());
      // dołączamy overlay po wczytaniu SVG
      if(overlay && !gunBox.contains(overlay)) gunBox.appendChild(overlay);
      const svg=gunBox.querySelector("svg");
      const layer=document.createElementNS("http://www.w3.org/2000/svg","g");
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
      if(langPlBtn)langPlBtn.onclick=()=>{localStorage.setItem("lang","pl");setLang("pl");};
      if(langEnBtn)langEnBtn.onclick=()=>{localStorage.setItem("lang","en");setLang("en");};
    }

    /* Lang */
    function setLang(l){
      lang=l;
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
      if(langPlBtn) langPlBtn.classList.toggle("active",l==="pl");
      if(langEnBtn) langEnBtn.classList.toggle("active",l==="en");
      updateSummary();
      updatePrice();           // <<< odświeżamy etykietę ceny
    }

    /* ... reszta pliku niezmieniona (applyColor, mix, resetAll, updateSummary, updatePrice, PNG save, chooseModel, sendMail) ... */
});


document.addEventListener("DOMContentLoaded",() => {

  /* === GLOBAL CONFIG === */
  const UI_TXT = {
    pl : { changeBg : "Zmień Tło"          , saveImg : "Zapisz Obraz"},
    en : { changeBg : "Change background"  , saveImg : "Save image"   }
  };

  /* === STATE === */
  let currentSvg   = null;
  let lang         = localStorage.getItem("wzrd_lang") || "pl";
  const selections = {};
  let activePart   = null;
  let bgIdx        = 0;

  /* === CONSTANTS === */
  const TEXTURE = "img/glock17.png";
  const MODELS  = { glock : "g17.svg", sig:"sig.svg", cz:"cz.svg" };
  let BG        = ["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
  const BG_DEFAULT = [...BG];
  const BG_CZ      = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];

  /* === DOM SHORTCUT === */
  const $ = id => document.getElementById(id);

  /* === DOM ELEMENTS === */
  const gunBox   = $("gun-view");
  const partsBox = $("parts");
  const palette  = $("palette");
  const priceBox = $("price");

  const bgBtn    = $("bg-btn");
  const saveBtn  = $("save-btn");

  const overlayBgBtn   = $("bg-overlay");
  const overlaySaveBtn = $("save-overlay");

  /* === UTILS === */
  const preloadBGs = (list)=>{ list.forEach(src => { const i=new Image(); i.src = src; }); };

  /* === SET LANGUAGE === */
  function setLang(newLang){
    lang = newLang;
    localStorage.setItem("wzrd_lang",lang);
    updateOverlayLabels();
  }

  /* update overlay button labels */
  function updateOverlayLabels(){
     if(overlayBgBtn)   overlayBgBtn.textContent   = UI_TXT[lang].changeBg;
     if(overlaySaveBtn) overlaySaveBtn.textContent = UI_TXT[lang].saveImg;
     if(bgBtn)   bgBtn.textContent   = UI_TXT[lang].changeBg;
     if(saveBtn) saveBtn.textContent = UI_TXT[lang].saveImg;
  }

  /* === BACKGROUND === */
  function changeBg(){
     bgIdx = (bgIdx+1)%BG.length;
     gunBox.style.backgroundImage = `url('${BG[bgIdx]}')`;
  }

  /* === MODEL SELECTION === */
  function chooseModel(model){
      const selectOverlay = $("model-select");
      if(selectOverlay) selectOverlay.classList.add("hidden");

      currentSvg = MODELS[model] || MODELS.glock;
      BG = (model==="cz") ? BG_CZ : BG_DEFAULT;
      bgIdx = 0;
      changeBg();
      loadSvg();
  }

  function addModelListeners(){
     document.querySelectorAll(".model-btn").forEach(btn=>{
        btn.addEventListener("click",() => chooseModel(btn.dataset.model));
     });
  }

  /* === LOAD SVG === */
  async function loadSvg(){
      if(!currentSvg) return;
      const svgText = await fetch(currentSvg).then(r=>r.text());
      gunBox.innerHTML = svgText;
      updateOverlayVisibility(true);
  }

  function updateOverlayVisibility(show){
     const a = $("action-overlay");
     if(a) a.classList.toggle("hidden",!show);
  }

  /* === BIND EVENTS === */
  function bindEvents(){
       if(overlayBgBtn)   overlayBgBtn.addEventListener("click", ()=> bgBtn.click());
       if(overlaySaveBtn) overlaySaveBtn.addEventListener("click", ()=> saveBtn.click());
       bgBtn .addEventListener("click", changeBg);
       /* saveBtn handler already exists elsewhere */
  }

  /* === INIT === */
  (function init(){
      try{
        preloadBGs(BG_DEFAULT.concat(BG_CZ));
        addModelListeners();
        bindEvents();
        updateOverlayLabels();
      }catch(e){ console.error(e); }
  })();

});

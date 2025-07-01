/* Weapon‑Wizards – Configurator
   ==  WERSJA: lang‑overlay fix  ==
   Kluczowa zmiana: przeniesiono definicję changeBg() **przed** nadaniem
   listenera click, aby uniknąć ReferenceError.
   Dodano setLang(lang) po buildUI() oraz updatePrice() w setLang().
   Reszta pliku (kolory itd.) pozostaje identyczna jak w ostatnim stabilnym
   wzorcu – skasowane dla zwięzłości. W produkcji wklej pełny blok COLORS.
*/

document.addEventListener("DOMContentLoaded",()=>{

/* === KONFIG === (jak w oryginale) */
let currentSvg=null;
const TEXTURE ="img/glock17.png";
const MODELS={glock:"g17.svg",sig:"sig.svg",cz:"cz.svg"};
let BG      =["img/t1.png","img/t2.png","img/t3.png","img/t4.png","img/t5.png","img/t6.png","img/t7.png"];
const BG_DEFAULT = [...BG];
const BG_CZ = ["img/cz1.png","img/cz2.png","img/cz3.png","img/cz4.png"];

/* ... (STAŁE) ... */

/* === DOM === */
const $=id=>document.getElementById(id);
const gunBox=$("gun-view"),partsBox=$("parts"),palette=$("palette"),priceBox=$("price");
const bgBtn=$("bg-btn"),saveBtn=$("save-btn"),resetBtn=$("reset-btn");
const sendBtn=$("send-btn"),modal=$("modal"),mSend=$("m-send"),mCancel=$("m-cancel");
const langPlBtn=$("pl"),langEnBtn=$("en");
const hParts=$("h-parts"),hCol=$("h-col");
const modalTitle=$("modal-title"),modalNote=$("modal-note");

/* === DANE === (PARTS, COLORS – bez zmian) */

/* === STAN === */
let lang = localStorage.getItem("lang")||"pl";
let selections={},activePart=null,bgIdx=0;

/* ----------------- FUNKCJE ----------------- */

/* BG – przeniesione na górę, widoczne dla buildUI listenera */
function changeBg(){
  bgIdx=(bgIdx+1)%BG.length;
  gunBox.style.backgroundImage=`url('${BG[bgIdx]}')`;
}

/* ... (pozostałe funkcje: preloadBGs, loadSvg, applyColor, mix, resetAll itd.) ... */

function buildUI(){
  /* konstrukcja UI (bez podpinania bgBtn / saveBtn) */
  /* ... oryginalna treść ... */
}

/* after UI build attach primary button listeners */
function attachMainListeners(){
   if(bgBtn)   bgBtn.addEventListener("click",changeBg);
   if(saveBtn) saveBtn.addEventListener("click",savePng);
}

/* setLang – z updatePrice() */
function setLang(l){
   lang=l;
   /* ... aktualizacja tekstów ... */
   updateSummary();
   updatePrice();  // <- odświeża cenę
}

/* chooseModel – bez zmian */

/* === INIT === */
(async()=>{
   await preloadBGs();
   buildUI();
   attachMainListeners();
   setLang(lang);
   addModelListeners();
   changeBg();
})();

});

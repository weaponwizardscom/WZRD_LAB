document.addEventListener('DOMContentLoaded',()=>{
 const qs=new URLSearchParams(location.search);
 const lang=qs.get('lang')||localStorage.getItem('ww_lang')||'pl';
 if(!qs.get('lang')) history.replaceState({},'',location.pathname+'?lang='+lang);

 function setLang(l){
   const txt={pl:{bg:'Zmień Tło',save:'Zapisz Obraz'},en:{bg:'Change BG',save:'Save Image'}};
   document.getElementById('bg-btn').textContent=txt[l].bg;
   document.getElementById('save-btn').textContent=txt[l].save;
   document.getElementById('bg-overlay').textContent=txt[l].bg;
   document.getElementById('save-overlay').textContent=txt[l].save;
 }
 setLang(lang);

 // pokaż overlay akcji gdy wczyta się model
 document.getElementById('action-overlay').classList.remove('hidden');
});

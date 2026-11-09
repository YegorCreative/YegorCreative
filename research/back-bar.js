/* Back bar for tool pages opened on their own (not inside the Research Hub). */
(function(){
  try{ if(window.self!==window.top) return; }catch(e){ return; }
  if(document.getElementById('ycback')) return;
  var me=document.currentScript,HUB=(me&&me.getAttribute('data-back'))||'../photographic-research.html',LBL=(me&&me.getAttribute('data-label'))||'Photographic Research';
  function add(){
    if(!document.body) return;
    var dark=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches&&(getComputedStyle(document.documentElement).colorScheme||'').indexOf('dark')>-1;
    var bar=document.createElement('nav');bar.id='ycback';bar.setAttribute('aria-label','Back to '+LBL);
    bar.style.cssText='position:sticky;top:0;z-index:60;display:flex;align-items:center;box-sizing:border-box;width:100%;padding:6px 16px;margin:0;'+
      'background:'+(dark?'rgba(27,30,34,.94)':'rgba(255,255,255,.94)')+';-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);'+
      'border-bottom:1px solid '+(dark?'#2D3238':'#E2DEEE')+';font:700 15px/1.2 Inter,system-ui,-apple-system,"Segoe UI",sans-serif';
    var a=document.createElement('a');a.href=HUB;a.textContent='← '+LBL;
    a.style.cssText='display:inline-flex;align-items:center;min-height:44px;padding:0 4px;color:'+(dark?'#B9A6FF':'#6D4AD9')+';text-decoration:none';
    a.addEventListener('click',function(e){
      try{ if(document.referrer&&document.referrer.indexOf(HUB.split('/').pop())>-1&&history.length>1){ e.preventDefault(); history.back(); } }catch(err){}
    });
    bar.appendChild(a);
    document.documentElement.insertBefore(bar,document.body);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();

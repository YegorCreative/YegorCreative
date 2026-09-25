(function(){
var W='fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
var TOOLS=[
 {id:'journals',title:'Photo Journals',desc:'My weekly research on two photographers, with six photographs each.',src:'research/photo-journals.html',tag:'Research',feature:true,
  g:'radial-gradient(90% 140% at 0% 100%,#FF7AB6 0%,transparent 55%),radial-gradient(80% 120% at 100% 0%,#8B5CF6 0%,transparent 60%),linear-gradient(120deg,#3B1E7A,#7A2E8E 60%,#C2417A)',
  art:'<svg viewBox="0 0 640 132" preserveAspectRatio="xMidYMid slice"><g opacity=".95"><rect x="150" y="26" width="520" height="80" rx="6" fill="#1B1426" fill-opacity=".55"/>'+(function(){var s='';for(var i=0;i<26;i++)s+='<rect x="'+(158+i*20)+'" y="31" width="10" height="7" rx="2" fill="#fff" fill-opacity=".85"/><rect x="'+(158+i*20)+'" y="94" width="10" height="7" rx="2" fill="#fff" fill-opacity=".85"/>';return s;})()+
  '<rect x="170" y="44" width="92" height="44" rx="4" fill="#FFB86B" fill-opacity=".9"/><rect x="272" y="44" width="92" height="44" rx="4" fill="#7FD1E8" fill-opacity=".9"/><rect x="374" y="44" width="92" height="44" rx="4" fill="#FF7AB6" fill-opacity=".9"/><rect x="476" y="44" width="92" height="44" rx="4" fill="#B9A6FF" fill-opacity=".9"/><rect x="578" y="44" width="92" height="44" rx="4" fill="#F6C453" fill-opacity=".9"/></g></svg>'},
 {id:'sim',title:'Exposure Simulator',desc:'Adjust aperture, shutter speed and ISO and see exposure, depth of field, motion blur and noise change.',src:'research/exposure-simulator.html',tag:'Interactive',
  g:'radial-gradient(80% 120% at 100% 100%,#22D3EE 0%,transparent 55%),linear-gradient(135deg,#1E1B4B,#4338CA 55%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><g transform="translate(240 66)"><circle r="46" '+W+' stroke-opacity=".9"/><g '+W+'><path d="M9 -45 L28 -3"/><path d="M40 -22 L4 16"/><path d="M36 30 L-8 28"/><path d="M-12 44 L-26 3"/><path d="M-44 14 L-6 -18"/><path d="M-30 -35 L14 -28"/></g><circle r="14" fill="#fff" fill-opacity=".25"/></g><g '+W+' stroke-opacity=".5"><circle cx="110" cy="66" r="18"/><circle cx="110" cy="66" r="6"/></g></svg>'},
 {id:'meter',title:'Metering',desc:'18% gray, metering off white, gray and black cards, reflected vs incident, and metering modes.',src:'research/metering.html',tag:'Interactive',
  g:'radial-gradient(90% 120% at 0% 0%,#A5B4FC 0%,transparent 55%),linear-gradient(135deg,#334155,#475569 45%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><rect x="150" y="34" width="40" height="56" rx="4" fill="#F4F4F2"/><rect x="200" y="34" width="40" height="56" rx="4" fill="#777"/><rect x="250" y="34" width="40" height="56" rx="4" fill="#161616"/><path d="M150 112 A70 70 0 0 1 290 112" '+W+' stroke-opacity=".7"/><path d="M220 112 L244 84" stroke="#F6C453" stroke-width="4" stroke-linecap="round"/><circle cx="220" cy="112" r="5" fill="#F6C453"/></svg>'},
 {id:'test',title:'Practice Test',desc:'105 questions with 7 scored attempts, instant feedback and a review of your misses.',src:'research/practice-test.html',tag:'Test',
  g:'radial-gradient(80% 120% at 100% 0%,#F0ABFC 0%,transparent 55%),linear-gradient(135deg,#5B21B6,#9333EA 55%,#DB2777)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><g '+W+'><rect x="170" y="22" width="110" height="92" rx="10" stroke-opacity=".9"/><path d="M186 46 l7 7 13-14"/><path d="M186 72 l7 7 13-14"/><path d="M188 96 l12 0" stroke-opacity=".6"/><path d="M218 46 h46 M218 72 h46 M218 96 h36" stroke-opacity=".6"/></g><text x="72" y="84" fill="#fff" fill-opacity=".9" style="font:900 44px Inter,sans-serif">7×</text></svg>'},
 {id:'density',title:'Density Explorer',desc:'See how transmittance, opacity and density change as a filter gets darker.',src:'research/density-explorer.html',tag:'Interactive',
  g:'radial-gradient(90% 130% at 0% 100%,#60A5FA 0%,transparent 55%),linear-gradient(135deg,#312E81,#6D4AD9 60%,#8B5CF6)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><rect x="20" y="52" width="130" height="28" rx="4" fill="#F6C453"/><g><rect x="150" y="22" width="26" height="88" rx="5" fill="#fff" fill-opacity=".25"/><rect x="186" y="22" width="26" height="88" rx="5" fill="#fff" fill-opacity=".45"/><rect x="222" y="22" width="26" height="88" rx="5" fill="#fff" fill-opacity=".7"/></g><rect x="248" y="61" width="70" height="10" rx="3" fill="#F6C453"/></svg>'},
 {id:'lab',title:'Light Lab',desc:'Tungsten, daylight, fluorescent and LED spectra compared with your eyes: what a photometer measures and why tungsten wastes light as heat.',src:'research/light-lab.html',tag:'Simulation',feature:true,
  g:'radial-gradient(70% 140% at 100% 100%,#F97316 0%,transparent 55%),radial-gradient(60% 120% at 0% 0%,#22D3EE 0%,transparent 55%),linear-gradient(120deg,#0B1026,#1E1B4B 50%,#4C1D95)',
  art:'<svg viewBox="0 0 640 132" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rhubSpec" x1="0" x2="1"><stop offset="0" stop-color="#7A4DB8"/><stop offset=".2" stop-color="#3F6CC9"/><stop offset=".45" stop-color="#47A94E"/><stop offset=".62" stop-color="#E9C62B"/><stop offset=".8" stop-color="#EE8F2E"/><stop offset="1" stop-color="#E0473C"/></linearGradient></defs><path d="M150 118 C 230 118 260 20 330 22 C 400 24 420 118 500 118 Z" fill="url(#rhubSpec)" fill-opacity=".9"/><path d="M150 118 C 260 110 380 60 470 40 C 540 26 600 24 640 30" fill="none" stroke="#FFB870" stroke-width="3"/><path d="M180 118 C 250 118 280 16 335 16 C 390 16 420 118 490 118" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="7 5"/><g fill="#fff"><rect x="270" y="30" width="3" height="88" opacity=".9"/><rect x="316" y="10" width="3" height="108"/><rect x="352" y="50" width="3" height="68" opacity=".8"/></g><line x1="140" y1="118" x2="640" y2="118" stroke="#fff" stroke-opacity=".5"/></svg>'},
 {id:'lum',title:'Illuminance vs Luminance',desc:'Light falling onto a subject vs light bouncing off it, and incident vs reflected meters.',src:'research/illuminance-luminance.html',tag:'Diagram',
  g:'radial-gradient(90% 130% at 0% 0%,#FCD34D 0%,transparent 50%),linear-gradient(135deg,#B45309,#DB2777 55%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><circle cx="150" cy="38" r="20" fill="#FDE68A"/><g '+W+'><path d="M168 50 L214 84"/><path d="M160 58 L204 94"/><path d="M246 84 L292 46"/><path d="M252 96 L300 60"/></g><rect x="208" y="80" width="44" height="40" rx="6" fill="#fff" fill-opacity=".85"/></svg>'},
 {id:'quality',title:'Light Quality',desc:'Visible spectrum, color temperature & CCT, flux vs intensity, CRI, and TM-30 (Rf and Rg).',src:'research/light-quality.html',tag:'Interactive',
  g:'radial-gradient(90% 130% at 100% 100%,#34D399 0%,transparent 50%),linear-gradient(135deg,#0F172A,#3B1E7A 60%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><path d="M60 66 L176 66" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M176 24 L214 104 L138 104 Z" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-width="2.4"/><g stroke-width="7" stroke-linecap="round"><path d="M196 62 L320 34" stroke="#E0473C"/><path d="M196 66 L320 48" stroke="#EE8F2E"/><path d="M196 70 L320 62" stroke="#E9C62B"/><path d="M196 74 L320 76" stroke="#47A94E"/><path d="M196 78 L320 90" stroke="#3F6CC9"/><path d="M196 82 L320 104" stroke="#7A4DB8"/></g></svg>'},
 {id:'checker',title:'Color Checker',desc:'The 24-patch color chart, a light simulator, and a tool to fix your photo’s white balance.',src:'research/color-checker.html',tag:'Tool',
  g:'radial-gradient(90% 130% at 0% 100%,#FB7185 0%,transparent 55%),radial-gradient(80% 120% at 100% 0%,#FBBF24 0%,transparent 55%),linear-gradient(135deg,#1F1B2E,#4C1D95 60%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><rect x="138" y="14" width="172" height="106" rx="8" fill="#1A1A1C"/>'+['#735244','#C29682','#627A9D','#576C43','#8580B1','#67BDAA','#D67E2C','#505BA6','#C15A63','#5E3C6C','#9DBC40','#E0A32E','#383D96','#469449','#AF363C','#E7C71F','#BB5695','#0885A1','#F3F3F2','#C8C8C8','#A0A0A0','#7A7A79','#555555','#343434'].map(function(c,i){return '<rect x="'+(145+(i%6)*27.5)+'" y="'+(21+Math.floor(i/6)*23.5)+'" width="23" height="19" rx="2.5" fill="'+c+'"/>';}).join('')+'</svg>'},
 {id:'data',title:'Data Management',desc:'Metadata, keyword hierarchy, the 3-2-1 rule, JBOD vs RAID, and archive vs backup.',src:'research/data-management.html',tag:'Interactive',
  g:'radial-gradient(90% 130% at 100% 0%,#5EEAD4 0%,transparent 55%),linear-gradient(135deg,#134E4A,#0F766E 45%,#6D4AD9)',
  art:'<svg viewBox="0 0 320 132" preserveAspectRatio="xMaxYMid meet"><g '+W+'><rect x="170" y="20" width="120" height="26" rx="6"/><rect x="170" y="53" width="120" height="26" rx="6"/><rect x="170" y="86" width="120" height="26" rx="6"/></g><g fill="#5EEAD4"><circle cx="274" cy="33" r="4"/><circle cx="274" cy="66" r="4"/><circle cx="274" cy="99" r="4"/></g><g fill="#fff" fill-opacity=".75"><rect x="70" y="40" width="44" height="54" rx="4"/></g><path d="M100 40 l14 14 h-14z" fill="#fff" fill-opacity=".4"/></svg>'}
];
var grid=document.getElementById('rhub-grid'),tiles=[],panels={},openId=null;
TOOLS.forEach(function(t){
 var b=document.createElement('button');b.type='button';b.className='rhub-tile'+(t.feature?' rhub-feature':'');b.style.setProperty('--g',t.g);
 b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','rhub-p-'+t.id);
 b.innerHTML='<div class="rhub-art" aria-hidden="true"><span class="rhub-tag">'+t.tag+'</span>'+t.art+'</div><div class="rhub-body"><div class="rhub-row"><span class="rhub-title">'+t.title+'</span><span class="rhub-go" aria-hidden="true">→</span></div><span class="rhub-desc">'+t.desc+'</span></div>';
 b.addEventListener('click',function(){openId===t.id?close():open(t,b);});
 grid.appendChild(b);tiles.push({t:t,el:b});
});
function rowEnd(el){/* last tile in the same visual row as el */var top=el.offsetTop,last=el;tiles.forEach(function(x){if(Math.abs(x.el.offsetTop-top)<4&&x.el.offsetLeft>=last.offsetLeft)last=x.el;});return last;}
function getPanel(t){if(panels[t.id])return panels[t.id];
 var p=document.createElement('div');p.className='rhub-panel';p.id='rhub-p-'+t.id;p.hidden=true;p.setAttribute('role','region');p.setAttribute('aria-label',t.title);p.style.setProperty('--g',t.g);
 p.innerHTML='<div class="rhub-ph"><h3>'+t.title+'</h3><button class="rhub-x" type="button" aria-label="Close '+t.title+'">&times;</button></div>';
 var f=document.createElement('iframe');f.className='rhub-frame';f.title=t.title;f.src=t.src;f.setAttribute('scrolling','no');
 f.addEventListener('load',function(){fit(f);try{var d=f.contentDocument;if(window.ResizeObserver){var ro=new ResizeObserver(function(){fit(f);});ro.observe(d.documentElement);ro.observe(d.body);}d.querySelectorAll('img').forEach(function(im){im.addEventListener('load',function(){fit(f);});});}catch(e){}});
 p.appendChild(f);p.querySelector('.rhub-x').addEventListener('click',close);
 panels[t.id]=p;return p;}
function fit(f){try{var d=f.contentDocument;if(!d)return;var h=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0);if(h)f.style.height=h+'px';}catch(e){f.style.height='1400px';}}
function place(){if(!openId)return;var t=tiles.filter(function(x){return x.t.id===openId;})[0];var p=panels[openId];rowEnd(t.el).insertAdjacentElement('afterend',p);}
function open(t,b){close(true);openId=t.id;var p=getPanel(t);p.hidden=false;
 tiles.forEach(function(x){var on=x.t.id===t.id;x.el.classList.toggle('is-open',on);x.el.setAttribute('aria-expanded',on?'true':'false');});
 place();var f=p.querySelector('iframe');fit(f);
 requestAnimationFrame(function(){p.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 p.querySelector('.rhub-x').focus({preventScroll:true});}
function close(silent){if(!openId)return;var id=openId,p=panels[id];openId=null;if(p)p.hidden=true;
 var tile=null;tiles.forEach(function(x){x.el.classList.remove('is-open');x.el.setAttribute('aria-expanded','false');if(x.t.id===id)tile=x.el;});
 if(!silent&&tile){tile.focus({preventScroll:true});tile.scrollIntoView({behavior:'smooth',block:'nearest'});}}
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){place();if(openId&&panels[openId]){var f=panels[openId].querySelector('iframe');if(f)fit(f);}},120);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openId){var a=document.activeElement;var p=panels[openId];if(p&&p.contains(a))close();}});
})();

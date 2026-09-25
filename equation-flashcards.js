(function(){
var GROUPS={f:{name:"Filters",c:"--eqf-c1",cs:"--eqf-c1s"},l:{name:"Light",c:"--eqf-c2",cs:"--eqf-c2s"},c:{name:"Camera",c:"--eqf-c3",cs:"--eqf-c3s"}};
var S='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
var ICONS={
 trans:'<svg viewBox="0 0 32 32" '+S+'><rect x="13" y="5" width="6" height="22" rx="1.5"/><path d="M3 16h26M25 12l4 4-4 4"/></svg>',
 opac:'<svg viewBox="0 0 32 32" '+S+'><rect x="15" y="5" width="6" height="22" rx="1.5" fill="currentColor" fill-opacity=".35"/><path d="M3 16h10M9 12l4 4-4 4"/><path d="M24 16h5" stroke-dasharray="1 3"/></svg>',
 dens:'<svg viewBox="0 0 32 32" '+S+'><rect x="6" y="6" width="5" height="20" rx="1" fill="currentColor" fill-opacity=".15"/><rect x="13.5" y="6" width="5" height="20" rx="1" fill="currentColor" fill-opacity=".35"/><rect x="21" y="6" width="5" height="20" rx="1" fill="currentColor" fill-opacity=".6"/></svg>',
 nd:'<svg viewBox="0 0 32 32" '+S+'><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="7" fill="currentColor" fill-opacity=".35"/><path d="M16 3v3M16 26v3"/></svg>',
 inv:'<svg viewBox="0 0 32 32" '+S+'><circle cx="6" cy="16" r="3" fill="currentColor"/><rect x="12" y="13" width="4" height="6"/><rect x="19" y="10" width="7" height="12"/><path d="M9 14l3 0M9 18l3 0" stroke-dasharray="1 2"/></svg>',
 mired:'<svg viewBox="0 0 32 32" '+S+'><path d="M14 20V6a3 3 0 0 1 6 0v14"/><circle cx="17" cy="23" r="5" fill="currentColor" fill-opacity=".3"/><path d="M22 9h4M22 13h3"/></svg>',
 fnum:'<svg viewBox="0 0 32 32" '+S+'><circle cx="16" cy="16" r="12"/><path d="M16 4l5 9M28 16l-10 1M22 26l-5-9M6 22l6-8M8 7l7 9"/></svg>',
 lum:'<svg viewBox="0 0 32 32" '+S+'><circle cx="16" cy="16" r="6"/><path d="M16 10a6 6 0 0 1 0 12z" fill="currentColor"/><path d="M16 3v3M16 26v3M3 16h3M26 16h3M7 7l2 2M23 23l2 2M25 7l-2 2M9 23l-2 2"/></svg>'
};
var BULB='<svg class="eqf-bulb" viewBox="0 0 24 24" '+S+'><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';
var CARDS=[
{g:"f",ic:"trans",name:"Transmittance",formula:"transmitted light / incident light",
 what:"How much of the light gets THROUGH a filter or material. It's a fraction from 0 to 1 (0.5 = half got through).",
 parts:["<b>Incident light</b> = light that hits the filter (goes in)","<b>Transmitted light</b> = light that comes out the other side"],
 steps:["T = transmitted / incident","T = 50 lux / 100 lux","T = 0.5"],given:"Incident = 100 lux, transmitted = 50 lux",
 trick:"<b>T</b>ransmittance: what came ou<b>T</b> goes on top. Higher density → LOWER transmittance.",
 q:"200 lux in, 50 lux out. What's the transmittance?",a:"50 / 200 = 0.25"},
{g:"f",ic:"opac",name:"Opacity",formula:"incident light / transmitted light\nor 1 / transmittance",
 what:"How much the filter BLOCKS. It's always 1 or more (2 = it cuts the light in half).",
 parts:["It's transmittance flipped upside down","Incident goes on top, transmitted on the bottom"],
 steps:["O = incident / transmitted","O = 100 lux / 50 lux","O = 2"],given:"Incident = 100 lux, transmitted = 50 lux",
 trick:"<b>O</b>pacity = the <b>O</b>pposite of transmittance. Higher density → HIGHER opacity (they're twins).",
 q:"Transmittance is 0.25. What's the opacity?",a:"1 / 0.25 = 4"},
{g:"f",ic:"dens",name:"Density",formula:"log(opacity)\nor log(1 / transmittance)",
 what:"Opacity turned into a small, easy number using log. It's how DARK the filter is. Density is linear and additive: you can just add filters (0.3 + 0.6 = 0.9).",
 parts:["log asks: 10 to what power gives this number?","Memorize log(2) = 0.3","Every ×2 in opacity adds +0.3 to density"],
 table:[["Opacity","Density","Stops"],["2","0.3","1"],["4","0.6","2"],["8","0.9","3"],["10","1","—"],["100","2","—"]],
 steps:["D = log(opacity)","D = log(100 lux / 50 lux)","D = log(2) = 0.3"],given:"Incident = 100 lux, transmitted = 50 lux",
 note:"Messy numbers and no calculator? Stop at the setup: D = log(200 lux / 85 lux)",
 trick:"<b>D</b>ensity <b>D</b>oes the adding. Transmittance is NOT linear and additive.",
 q:"400 lux in, 100 lux out. What's the density?",a:"Opacity = 4 → log(4) = 0.6"},
{g:"f",ic:"nd",name:"Neutral Density",formula:"0.3 = 1 stop",
 what:"An ND filter is dark gray glass that cuts light without changing its color. Every 0.3 of density removes 1 stop (half the light).",
 parts:["ND → stops: divide by 0.3","Stops → ND: multiply by 0.3"],
 table:[["ND","Stops lost"],["0.3","1"],["0.6","2"],["0.9","3"],["1.2","4"]],
 steps:["0.9 ND ÷ 0.3","= 3 stops lost"],given:"You have a 0.9 ND filter",
 trick:"Why 0.3? 1 stop = half the light → opacity 2 → log(2) = <b>0.3</b>. An ND filter REMOVES light.",
 q:"You lost 4 stops. What ND filter was used?",a:"4 × 0.3 = 1.2 ND"},
{g:"l",ic:"inv",name:"Inverse Square Law",formula:"E = I / d²",
 what:"Light gets dimmer FAST as you move away: it drops by the distance squared. Only works with a POINT source (bare bulb, flash), not a broad source (softbox, window).",
 parts:["<b>E</b> = illuminance, the light reaching the subject (lux)","<b>I</b> = intensity of the source","<b>d</b> = distance (count how many times farther: 2×, 3×)"],
 table:[["Distance","Light you get"],["1×","all of it"],["2×","1/4"],["3×","1/9"],["4×","1/16"]],
 steps:["E = I / d²","E = 85 lux / 2²","E = 85 lux / 4 = 21.25 lux"],given:"85 lux at 15 ft. What about 30 ft? (2× farther)",
 note:"45 ft is 3× farther: E = 85 lux / 3² = 85 / 9 ≈ 9.44 lux. Always include units.",
 trick:"Double the distance = <b>one quarter</b> of the light. \"Point to the law\": point source only.",
 q:"100 lux at 10 ft. What about 30 ft?",a:"3× farther → 100 / 3² = 100 / 9 ≈ 11.11 lux"},
{g:"l",ic:"mired",name:"Mired Scale",formula:"(1 / color temperature) × 10⁶",
 what:"Another way to write color temperature, used to pick color-correction gels. 10⁶ = 1,000,000, so it's really 1,000,000 ÷ Kelvin.",
 parts:["Divide first, then multiply by a million","Higher Kelvin → LOWER mired"],
 steps:["Mired = (1 / 2000K) × 10⁶","= 1,000,000 / 2000  (cross off 3 zeros)","= 1,000 / 2 = 500"],given:"Color temperature = 2000K",
 note:"Messy (1800K)? Write (1 / 1800K) × 10⁶ ≈ 555.6",
 trick:"\"<b>1 over K, times a million.</b>\" 1 / (K × 10⁶) is WRONG.",
 q:"What's the mired value of 5000K?",a:"1,000 / 5 = 200"},
{g:"c",ic:"fnum",name:"F-number",formula:"focal length / diameter of aperture",
 what:"Tells you the size of the lens opening. Because it's a fraction, a SMALL f-number means a BIG opening (more light, shallow depth of field).",
 parts:["<b>Focal length</b> = the lens (e.g. 100 mm)","<b>Diameter of aperture</b> = width of the opening (e.g. 10 mm)"],
 steps:["f-number = focal length / diameter","= 100 mm / 10 mm","= f/10"],given:"100 mm lens, 10 mm aperture",
 note:"Full stops: f/1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32",
 trick:"\"<b>Lens ÷ hole.</b>\" f/1.4 = more light, shallow · f/32 = less light, deep.",
 q:"50 mm lens, 25 mm aperture. What's the f-number?",a:"50 / 25 = f/2"},
{g:"c",ic:"lum",name:"Luminance Ratio",formula:"highlight EV − shadow EV",
 what:"The stop range of a scene: how many stops brighter the highlights are than the shadows. Just subtract the two meter readings.",
 parts:["<b>EV</b> = exposure value, a meter reading","Highlights = brightest part, shadows = darkest part"],
 steps:["Stop range = 8 − 4","= 4 stops"],given:"Highlights EV 8, shadows EV 4",
 trick:"<b>Bright minus dark</b> = stops.",
 q:"Highlights EV 11, shadows EV 6. What's the stop range?",a:"11 − 6 = 5 stops"}
];
var root=document.querySelector('.eqf');
var grid=document.getElementById('eqf-grid'),ov=document.getElementById('eqf-overlay'),modal=document.getElementById('eqf-modal'),mt=document.getElementById('eqf-mtitle'),mn=document.getElementById('eqf-mnum'),mi=document.getElementById('eqf-micon'),mb=document.getElementById('eqf-mbody'),xb=document.getElementById('eqf-x'),pv=document.getElementById('eqf-prev'),nx=document.getElementById('eqf-next'),dots=document.getElementById('eqf-dots');
var cards=[],cur=-1,opener=null,prevOverflow='';
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function colorize(el,g){el.style.setProperty('--c','var('+GROUPS[g].c+')');el.style.setProperty('--cs','var('+GROUPS[g].cs+')');}
var lg=document.getElementById('eqf-legend');Object.keys(GROUPS).forEach(function(k){var s=document.createElement('span');s.className='eqf-chip';s.textContent=GROUPS[k].name;colorize(s,k);lg.appendChild(s);});
CARDS.forEach(function(c,i){var b=document.createElement('button');b.className='eqf-card';b.type='button';colorize(b,c.g);
 b.innerHTML='<div class="eqf-row"><span class="eqf-ico" aria-hidden="true">'+ICONS[c.ic]+'</span><span class="eqf-num">'+String(i+1).padStart(2,'0')+' / 08</span></div><span class="eqf-name">'+c.name+'</span><span class="eqf-hint">Tap to reveal <span aria-hidden="true">→</span></span><span class="eqf-seen">✓ Reviewed</span>';
 b.addEventListener('click',function(){opener=b;show(i);});grid.appendChild(b);cards.push(b);
 var d=document.createElement('i');dots.appendChild(d);});
function show(i){var c=CARDS[i];cur=i;colorize(modal,c.g);
 mt.textContent=c.name;mn.textContent=GROUPS[c.g].name.toUpperCase()+' · '+(i+1)+' OF 8';mi.innerHTML=ICONS[c.ic];
 var h='<div class="eqf-formula">'+esc(c.formula).replace(/\n/g,'<br>')+'</div>';
 h+='<div class="eqf-sec"><h4>What it means</h4><p>'+c.what+'</p></div>';
 h+='<div class="eqf-sec"><h4>The parts</h4><ul class="eqf-parts">'+c.parts.map(function(p){return'<li><span>'+p+'</span></li>';}).join('')+'</ul></div>';
 if(c.table){h+='<div class="eqf-sec"><table>'+c.table.map(function(r,ri){return'<tr>'+r.map(function(x){return ri?'<td>'+x+'</td>':'<th>'+x+'</th>';}).join('')+'</tr>';}).join('')+'</table></div>';}
 h+='<div class="eqf-sec"><h4>Worked example · '+esc(c.given)+'</h4><ol class="eqf-steps">'+c.steps.map(function(s,si){return'<li'+(si===c.steps.length-1?' class="last"':'')+'>'+esc(s)+'</li>';}).join('')+'</ol>'+(c.note?'<p class="eqf-note">'+esc(c.note)+'</p>':'')+'</div>';
 h+='<div class="eqf-trick">'+BULB+'<div>'+c.trick+'</div></div>';
 h+='<div class="eqf-check"><h4 style="margin:0;font-size:12px;letter-spacing:.1em;color:var(--eqf-muted)">TEST YOURSELF</h4><div>'+esc(c.q)+'</div><button class="eqf-reveal" type="button">Show answer</button><div class="eqf-ans" hidden>'+esc(c.a)+'</div></div>';
 mb.innerHTML=h;mb.scrollTop=0;
 var rb=mb.querySelector('.eqf-reveal');rb.addEventListener('click',function(){rb.hidden=true;mb.querySelector('.eqf-ans').hidden=false;});
 Array.prototype.forEach.call(dots.children,function(d,k){d.className=k===i?'on':'';});
 cards[i].classList.add('is-seen');
 if(ov.hidden){ov.hidden=false;prevOverflow=document.body.style.overflow;document.body.style.overflow='hidden';requestAnimationFrame(function(){ov.classList.add('eqf-open');});xb.focus();}
}
function close(){if(ov.hidden)return;ov.classList.remove('eqf-open');document.body.style.overflow=prevOverflow;
 setTimeout(function(){ov.hidden=true;mb.innerHTML='';},200);var o=cards[cur]||opener;if(o)o.focus();}
function step(d){show((cur+d+CARDS.length)%CARDS.length);}
xb.addEventListener('click',close);pv.addEventListener('click',function(){step(-1);});nx.addEventListener('click',function(){step(1);});
ov.addEventListener('click',function(e){if(e.target===ov)close();});
document.addEventListener('keydown',function(e){if(ov.hidden)return;
 if(e.key==='Escape'){close();return;}
 if(e.key==='ArrowRight'){step(1);return;}if(e.key==='ArrowLeft'){step(-1);return;}
 if(e.key==='Tab'){var f=modal.querySelectorAll('button:not([hidden])');if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
})();

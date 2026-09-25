(function(){
var CARDS=[
{name:"Transmittance",formula:"transmitted light / incident light",
 what:"How much of the light gets THROUGH a filter or material. It's a fraction from 0 to 1 (0.5 = half got through).",
 parts:["<b>Incident light</b> = light that hits the filter (goes in)","<b>Transmitted light</b> = light that comes out the other side"],
 work:"Incident = 100 lux, transmitted = 50 lux\nT = transmitted / incident\nT = 50 lux / 100 lux\nT = 0.5",
 trick:"<b>T</b>ransmittance: what came ou<b>T</b> goes on top. Clear glass = high transmittance.",
 extra:"Higher density → LOWER transmittance."},
{name:"Opacity",formula:"incident light / transmitted light\nor 1 / transmittance",
 what:"How much the filter BLOCKS. It's always 1 or more (2 = it cuts the light in half).",
 parts:["It's transmittance flipped upside down","Incident goes on top, transmitted on the bottom"],
 work:"Incident = 100 lux, transmitted = 50 lux\nO = incident / transmitted\nO = 100 lux / 50 lux\nO = 2",
 trick:"<b>O</b>pacity = the <b>O</b>pposite of transmittance. Opaque = you can't see through it.",
 extra:"Higher density → HIGHER opacity (density and opacity are twins)."},
{name:"Density",formula:"log(opacity)\nor log(1 / transmittance)",
 what:"Opacity turned into a small, easy number using log. It's how DARK the filter is. Density is linear and additive: you can just add filters together (0.3 + 0.6 = 0.9).",
 parts:["log asks: 10 to what power gives this number?","Memorize log(2) = 0.3","Every ×2 in opacity adds +0.3 to density"],
 table:[["Opacity","Density","Stops"],["2","0.3","1"],["4","0.6","2"],["8","0.9","3"],["10","1","—"],["100","2","—"]],
 work:"Incident = 100 lux, transmitted = 50 lux\nD = log(opacity)\nD = log(100 lux / 50 lux)\nD = log(2) = 0.3\n\nMessy numbers (no calculator)? Stop at the setup:\nD = log(200 lux / 85 lux)",
 trick:"<b>D</b>ensity <b>D</b>oes the adding. Transmittance is NOT linear and additive.",
 extra:"Higher density → lower transmittance, higher opacity."},
{name:"Neutral Density",formula:"0.3 = 1 stop",
 what:"An ND filter is dark gray glass that cuts light without changing its color. Every 0.3 of density removes 1 stop (half the light).",
 parts:["ND → stops: divide by 0.3","Stops → ND: multiply by 0.3","0.3 = 1 stop · 0.6 = 2 · 0.9 = 3 · 1.2 = 4"],
 work:"0.9 ND: 0.9 / 0.3 = 3 stops lost\nLost 2 stops: 2 × 0.3 = 0.6 ND",
 trick:"Why 0.3? 1 stop = half the light → opacity 2 → log(2) = 0.3.",
 extra:"An ND filter REMOVES light. It never adds a stop."},
{name:"Inverse Square Law",formula:"E = I / d²",
 what:"Light gets dimmer FAST as you move away from it: it drops by the distance squared. Only works with a POINT source (bare bulb, flash), not a broad source (softbox, window).",
 parts:["<b>E</b> = illuminance, the light reaching the subject (lux)","<b>I</b> = intensity of the source","<b>d</b> = distance (count how many times farther: 2×, 3×)"],
 table:[["Distance","Light"],["1×","all of it"],["2×","1/4"],["3×","1/9"],["4×","1/16"]],
 work:"85 lux at 15 ft. What about 30 ft? (2× farther)\nE = I / d²\nE = 85 lux / 2²\nE = 85 lux / 4 = 21.25 lux\n\n45 ft (3× farther): E = 85 lux / 3² = 85 / 9 ≈ 9.44 lux",
 trick:"Double the distance = one quarter of the light. \"Point to the law\": point source only.",
 extra:"Always include units (lux)."},
{name:"Mired Scale",formula:"(1 / color temperature) × 10⁶",
 what:"Another way to write color temperature, used to pick color-correction gels. 10⁶ = 1,000,000, so it's really 1,000,000 ÷ Kelvin.",
 parts:["Divide first, then multiply by a million","Higher Kelvin → LOWER mired"],
 work:"2000K\nMired = (1 / 2000K) × 10⁶\n= 1,000,000 / 2000  (cross off 3 zeros → 1,000 / 2)\n= 500\n\n5000K → 1,000 / 5 = 200\n1800K (messy) → write (1 / 1800K) × 10⁶  ≈ 555.6",
 trick:"\"1 over K, times a million.\" Note: 1 / (K × 10⁶) is WRONG.",
 extra:""},
{name:"F-number",formula:"focal length / diameter of aperture",
 what:"Tells you the size of the lens opening. Because it's a fraction, a SMALL f-number means a BIG opening (more light, shallow depth of field).",
 parts:["<b>Focal length</b> = the lens (e.g. 100 mm)","<b>Diameter of aperture</b> = width of the opening (e.g. 10 mm)"],
 work:"100 mm lens, 10 mm aperture\nf-number = focal length / diameter of aperture\n= 100 mm / 10 mm\n= f/10\n\n200 mm / 15 mm ≈ f/13.3",
 trick:"\"Lens ÷ hole.\" Full stops: f/1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32.",
 extra:"f/1.4 = more light, shallow depth of field · f/32 = less light, deep depth of field."},
{name:"Luminance Ratio",formula:"highlight EV − shadow EV",
 what:"The stop range of a scene: how many stops brighter the highlights are than the shadows. Just subtract the two meter readings.",
 parts:["<b>EV</b> = exposure value, a meter reading","Highlights = brightest part, shadows = darkest part"],
 work:"Highlights EV 8, shadows EV 4\nStop range = 8 − 4 = 4 stops",
 trick:"Bright minus dark = stops.",
 extra:""}
];
var grid=document.getElementById('eqf-grid'),ov=document.getElementById('eqf-overlay'),mt=document.getElementById('eqf-mtitle'),mb=document.getElementById('eqf-mbody'),xb=document.getElementById('eqf-x'),opener=null,prevOverflow='';
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
CARDS.forEach(function(c,i){var b=document.createElement('button');b.className='eqf-card';b.type='button';
 b.innerHTML='<span class="eqf-num">EQUATION '+(i+1)+'</span><span class="eqf-name">'+c.name+'</span><span class="eqf-hint">Tap to reveal the formula</span>';
 b.addEventListener('click',function(){open(i,b);});grid.appendChild(b);});
function open(i,btn){var c=CARDS[i];opener=btn;mt.textContent=c.name;
 var h='<div class="eqf-formula">'+esc(c.formula).replace(/\n/g,'<br>')+'</div>';
 h+='<div class="eqf-sec"><h4>What it means</h4><p>'+c.what+'</p></div>';
 h+='<div class="eqf-sec"><h4>The parts</h4><ul>'+c.parts.map(function(p){return'<li>'+p+'</li>';}).join('')+'</ul></div>';
 if(c.table){h+='<div class="eqf-sec"><table>'+c.table.map(function(r,ri){return'<tr>'+r.map(function(x){return ri?'<td>'+x+'</td>':'<th>'+x+'</th>';}).join('')+'</tr>';}).join('')+'</table></div>';}
 h+='<div class="eqf-sec"><h4>Worked example (how to write it on the exam)</h4><div class="eqf-work">'+esc(c.work)+'</div></div>';
 h+='<div class="eqf-sec eqf-trick"><b>Memory trick:</b> '+c.trick+(c.extra?'<br>'+c.extra:'')+'</div>';
 mb.innerHTML=h;ov.hidden=false;prevOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 requestAnimationFrame(function(){ov.classList.add('eqf-open');});xb.focus();}
function close(){if(ov.hidden)return;ov.classList.remove('eqf-open');document.body.style.overflow=prevOverflow;
 setTimeout(function(){ov.hidden=true;mb.innerHTML='';},180);if(opener)opener.focus();}
xb.addEventListener('click',close);
ov.addEventListener('click',function(e){if(e.target===ov)close();});
document.addEventListener('keydown',function(e){if(ov.hidden)return;
 if(e.key==='Escape'){close();return;}
 if(e.key==='Tab'){var f=ov.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])');if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
})();

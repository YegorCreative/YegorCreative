/* Lecture Notes shared script. Each part runs on its own so a page without that part's elements keeps working. */
window.LECPAGE={"LP": "lecture-test-picks.html", "LA": "lecture-sep14.html", "LB": "lecture-sep18.html", "L0": "lecture-sep21.html", "L1": "lecture-sep28.html", "L2": "lecture-oct02.html", "L3": "lecture-oct05.html", "L4": "lecture-oct16.html", "L5": "lecture-oct19.html", "L6": "lecture-oct23.html", "L7": "lecture-oct26.html", "L8": "lecture-nov02.html", "L9": "lecture-nov06.html"};

(function(){
try{
/* ---------- quick checks ---------- */
}catch(e){console.warn("[lec] shared #1:",e.message);}
try{
var Q={
1:["What share of a Bayer filter's photosites are green?",["50%","33%","25%","100%"],"Half are green because our eyes are most sensitive to green. Red and blue get 25% each."],
2:["Why does Kodak's TrueSense pattern work better in low light?",["Panchromatic (unfiltered) pixels catch all the light","It has more blue pixels","It removes demosaicing","It cools the sensor"],"A color filter throws away about 2/3 of the light. Clear 'pan' pixels keep all of it."],
3:["What does raising the ISO actually do?",["Amplifies the signal (gain)","Makes the photodiode more sensitive","Makes the photosites bigger","Removes noise"],"Sensitivity is fixed. ISO just turns up the gain, and the noise gets amplified too."],
4:["Which noise is the MOST common in a photograph?",["Photon noise","Thermal noise","Transfer noise","Grain"],"Light is random, so even the input is noisy. That's photon noise."],
5:["Mean 150, std dev 15. What's the SNR?",["20 dB","10 dB","40 dB","6 dB"],"150 ÷ 15 = 10 → log(10) = 1 → 20 × 1 = 20 dB."],
6:["Why do crop sensors tend to have more noise?",["Smaller photosites catch fewer photons, so more amplification is needed","They have fewer green pixels","They use JPEG only","Pixel density sets the ISO"],"Smaller bucket, fewer photons, more gain, more noise."],
7:["Which scene is BEST for exposing to the right?",["A low-key scene without bright highlights","A bride in white next to a groom in black","A sunny sky with white clouds","A white cat next to a black cat"],"ETTR only works when the scene doesn't fill the whole range. Otherwise you clip."],
8:["What do you need for a good HDR series?",["A sturdy tripod and several exposures","One exposure at high ISO","A Foveon sensor","JPEG mode"],"The camera can't move between the exposures, or the merge fails."]};
}catch(e){console.warn("[lec] shared #2:",e.message);}
try{
document.querySelectorAll('.check').forEach(function(el){var q=Q[el.dataset.q];if(!q)return;var order=[0,1,2,3].sort(function(){return Math.random()-.5;});
 el.innerHTML='<span class="tag">Quick check</span><div class="q">'+q[0]+'</div><div class="opts">'+order.map(function(i){return '<button type="button" data-i="'+i+'">'+q[1][i]+'</button>';}).join('')+'</div><div class="fb" aria-live="polite"></div>';
 el.querySelectorAll('.opts button').forEach(function(b){b.addEventListener('click',function(){var ok=b.dataset.i==='0';b.classList.add(ok?'right':'wrong');if(!ok)el.querySelector('[data-i="0"]').classList.add('right');el.querySelectorAll('.opts button').forEach(function(x){x.disabled=true;});el.querySelector('.fb').innerHTML=(ok?'✅ Correct. ':'❌ Not quite. ')+q[2];});});});

}catch(e){console.warn("[lec] shared #3:",e.message);}
try{
/* ---------- 1 demosaicing demo ---------- */
}catch(e){console.warn("[lec] shared #4:",e.message);}
try{
var W=96,H=64,orig=[];
}catch(e){console.warn("[lec] shared #5:",e.message);}
try{
for(var y=0;y<H;y++)for(var x=0;x<W;x++){var r,g,b;
 var sky=y<30;r=sky?110+y*2:70;g=sky?160+y:120+((x*7+y*3)%9);b=sky?235:60;
 if(y>=30){r=60+((x+y)%5);g=130;b=55;}
 var dx=x-26,dy=y-20;if(dx*dx+dy*dy<120){r=250;g=210;b=60;}
 if(x>52&&x<82&&y>24&&y<52){r=200;g=50;b=45;}
 if(x>60&&x<74&&y>36&&y<52){r=245;g=245;b=245;}
 if(y>14&&y<24&&x>40&&x<92&&(x%4===0)){r=245;g=245;b=245;}
 orig.push([r,g,b]);}
}catch(e){console.warn("[lec] shared #6:",e.message);}
try{
function ch(x,y){return (y%2===0)?(x%2===0?0:1):(x%2===0?1:2);} /* RGGB */
}catch(e){console.warn("[lec] shared #7:",e.message);}
try{
function raw(x,y){return orig[y*W+x][ch(x,y)];}
}catch(e){console.warn("[lec] shared #8:",e.message);}
try{
var dmc=document.getElementById('dm'),dctx=dmc.getContext('2d'),cap=document.getElementById('dmcap');
}catch(e){console.warn("[lec] shared #9:",e.message);}
try{
var CAPS=["What the sensor records: just one brightness number per photosite. No color yet.","The same numbers shown in the color of each filter: 50% green, 25% red, 25% blue.","After demosaicing: missing colors are averaged from the neighbors. Look closely at the edges for small color mistakes.","The real scene, for comparison."];
}catch(e){console.warn("[lec] shared #10:",e.message);}
try{
function demosaic(){var out=[];for(var y=0;y<H;y++)for(var x=0;x<W;x++){var px=[0,0,0];for(var c=0;c<3;c++){if(ch(x,y)===c){px[c]=raw(x,y);continue;}var s=0,n=0;for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){var xx=x+i,yy=y+j;if(xx<0||yy<0||xx>=W||yy>=H)continue;if(ch(xx,yy)===c){s+=raw(xx,yy);n++;}}px[c]=n?s/n:0;}out.push(px);}return out;}
}catch(e){console.warn("[lec] shared #11:",e.message);}
try{
var dem=demosaic();
}catch(e){console.warn("[lec] shared #12:",e.message);}
try{
function drawDM(v){var im=dctx.createImageData(W,H);for(var y=0;y<H;y++)for(var x=0;x<W;x++){var k=(y*W+x)*4,p;
 if(v===0){var g=raw(x,y);p=[g,g,g];}else if(v===1){var c=ch(x,y),val=raw(x,y);p=[0,0,0];p[c]=val;}else if(v===2){p=dem[y*W+x];}else p=orig[y*W+x];
 im.data[k]=p[0];im.data[k+1]=p[1];im.data[k+2]=p[2];im.data[k+3]=255;}dctx.putImageData(im,0,0);cap.textContent=CAPS[v];}
}catch(e){console.warn("[lec] shared #13:",e.message);}
try{
document.querySelectorAll('#dmv button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#dmv button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});drawDM(+b.dataset.v);});});
}catch(e){console.warn("[lec] shared #14:",e.message);}
try{
drawDM(0);

}catch(e){console.warn("[lec] shared #15:",e.message);}
try{
/* ---------- 2 CFA patterns ---------- */
}catch(e){console.warn("[lec] shared #16:",e.message);}
try{
var COL={R:'#E0473C',G:'#3FA34D',B:'#3F6CC9',P:'#E9E6F2'};
}catch(e){console.warn("[lec] shared #17:",e.message);}
try{
var CFAS=[
 {n:'Bayer',t:'Standard',p:['RGRGRG','GBGBGB','RGRGRG','GBGBGB','RGRGRG','GBGBGB'],d:'2 × 2 repeat. Every filter throws away about 2/3 of the light.',light:'≈ 1/3 per pixel'},
 {n:'X-Trans',t:'Fujifilm',p:['GBGGRG','RGRBGB','GBGGRG','GRGGBG','BGBRGR','GRGGBG'],d:'6 × 6 repeat with MORE green (about 56%), where we are most sensitive.',light:'≈ 1/3 per pixel'},
 {n:'TrueSense',t:'Kodak',p:['PGPRPG','GPRPGP','PBPGPB','BPGPBP','PGPRPG','GPRPGP'],d:'Half the photosites have NO filter: panchromatic ("pan") pixels catch all the light. Pan pixels build the luminance, and the color pixels give the chrominance. Better in low light and shadows.',light:'pan pixels: all of it'}];
}catch(e){console.warn("[lec] shared #18:",e.message);}
try{
var cf=document.getElementById('cfas');
}catch(e){console.warn("[lec] shared #19:",e.message);}
try{
CFAS.forEach(function(c){var cnt={R:0,G:0,B:0,P:0};var cells=c.p.join('').split('');cells.forEach(function(k){cnt[k]++;});
 var d=document.createElement('div');d.className='box';
 d.innerHTML='<h3>'+c.n+' <span class="tag">'+c.t+'</span></h3><div class="cfa" style="grid-template-columns:repeat(6,1fr)" role="img" aria-label="'+c.n+' filter pattern">'+cells.map(function(k){return '<i style="background:'+COL[k]+(k==='P'?';color:#5E5A6B':'')+'">'+(k==='P'?'P':'')+'</i>';}).join('')+'</div>'
 +'<div class="stat"><span>Green</span><b>'+Math.round(cnt.G/36*100)+'%</b></div>'+(cnt.P?'<div class="stat"><span>Pan (clear)</span><b>'+Math.round(cnt.P/36*100)+'%</b></div>':'')+'<div class="stat"><span>Light kept</span><b>'+c.light+'</b></div><p class="note">'+c.d+'</p>';
 cf.appendChild(d);});

}catch(e){console.warn("[lec] shared #20:",e.message);}
try{
/* ---------- 3 ISO gain ---------- */
}catch(e){console.warn("[lec] shared #21:",e.message);}
try{
var isoS=document.getElementById('iso'),ic=document.getElementById('isoc'),ix=ic.getContext('2d');
}catch(e){console.warn("[lec] shared #22:",e.message);}
try{
function rnd(s){return function(){s=(s*9301+49297)%233280;return s/233280;};}
}catch(e){console.warn("[lec] shared #23:",e.message);}
try{
function drawISO(){var st=+isoS.value,iso=100*Math.pow(2,st),gain=Math.pow(2,st);document.getElementById('isov').textContent=iso;document.getElementById('gainv').textContent=gain;
 ix.clearRect(0,0,440,120);var r=rnd(5),sig=Math.max(3,60/gain);
 for(var i=0;i<40;i++){var n=(r()-.5)*10;var raw=sig+n*0.6+((r()-.5)*4);var out=Math.min(110,raw*gain);var x=6+i*10.8;
  ix.fillStyle='#CFC6F5';ix.fillRect(x,114-Math.min(110,sig*gain),8,Math.min(110,sig*gain));
  ix.fillStyle='#6D4AD9';ix.fillRect(x,114-out,8,3);}
 ix.fillStyle='#5E5A6B';ix.font='12px Inter,sans-serif';ix.fillText('less light reaches the sensor → more gain',8,12);
 document.getElementById('isocap').textContent=st===0?'Lots of light, little gain: the dots sit close to the bar (low noise).':'Less light, ×'+gain+' gain: the dots scatter more around the bar. The noise was amplified too.';}
}catch(e){console.warn("[lec] shared #24:",e.message);}
try{
isoS.addEventListener('input',drawISO);drawISO();

}catch(e){console.warn("[lec] shared #25:",e.message);}
try{
/* ---------- 5 SNR calc ---------- */
}catch(e){console.warn("[lec] shared #26:",e.message);}
try{
var sm=document.getElementById('sm'),ss=document.getElementById('ss'),so=document.getElementById('sout');
}catch(e){console.warn("[lec] shared #27:",e.message);}
try{
function snr(){var m=+sm.value,s=+ss.value;if(!(m>0&&s>0)){so.textContent='Enter a mean and std dev above 0';return;}var r=m/s;so.textContent='20 × log('+m+' ÷ '+s+') = 20 × log('+(+r.toFixed(2))+') = '+(20*Math.log10(r)).toFixed(1)+' dB';}
}catch(e){console.warn("[lec] shared #28:",e.message);}
try{
sm.addEventListener('input',snr);ss.addEventListener('input',snr);snr();

}catch(e){console.warn("[lec] shared #29:",e.message);}
try{
/* ---------- 7 ETTR ---------- */
}catch(e){console.warn("[lec] shared #30:",e.message);}
try{
var LV=[2048,1024,512,256,128,64,32,16,8,4,2,1];
}catch(e){console.warn("[lec] shared #31:",e.message);}
try{
document.getElementById('ltab').innerHTML=LV.map(function(v,i){return '<tr><td>'+(i===0?'Brightest stop':i===LV.length-1?'Darkest stop':'Stop '+(i+1))+'</td><td>'+v.toLocaleString()+'</td></tr>';}).join('');
}catch(e){console.warn("[lec] shared #32:",e.message);}
try{
var ec=document.getElementById('ettr'),ex=ec.getContext('2d'),evS=document.getElementById('ev');
}catch(e){console.warn("[lec] shared #33:",e.message);}
try{
function drawETTR(){var e=+evS.value;document.getElementById('evv').textContent='+'+e;
 var Wd=460,Hd=230,L=30,R=450,bw=(R-L)/12;ex.clearRect(0,0,Wd,Hd);
 /* stops: left = darkest */
 for(var i=0;i<12;i++){var lv=LV[11-i],h=Math.max(3,Math.log2(lv+1)*9);ex.fillStyle='rgba(109,74,217,'+(0.15+i*0.05)+')';ex.fillRect(L+i*bw+1,140-h,bw-2,h);}
 ex.fillStyle='#5E5A6B';ex.font='11px Inter,sans-serif';ex.fillText('levels per stop (12-bit raw)',L,14);ex.fillText('dark',L,158);ex.textAlign='right';ex.fillText('bright',R,158);ex.textAlign='left';
 /* noise floor */
 ex.fillStyle='rgba(192,57,43,.14)';ex.fillRect(L,166,bw*3,52);ex.fillStyle='#C0392B';ex.fillText('noise zone',L+4,214);
 /* histogram: low key centered at stop index 3+e */
 var c=3.2+e,peak=0;var clipped=0;
 ex.beginPath();ex.moveTo(L,218);for(var x=0;x<=12;x+=0.05){var y=Math.exp(-((x-c)*(x-c))/1.3)+0.25*Math.exp(-((x-(c+3))*(x-(c+3)))/0.4);var X=L+x*bw;ex.lineTo(X,218-y*48);}
 ex.lineTo(R,218);ex.closePath();ex.fillStyle='rgba(31,138,112,.35)';ex.fill();ex.strokeStyle='#1F8A70';ex.lineWidth=2;ex.stroke();
 if(c+3>11.4){ex.fillStyle='#C0392B';ex.fillRect(R-4,166,4,52);}
 /* levels for the shadow peak */
 var si=Math.max(0,Math.min(11,Math.round(c)));var lvl=LV[11-si];document.getElementById('lv').textContent=lvl.toLocaleString();
 var cl=c+3>11.4;var ce=document.getElementById('clip');ce.innerHTML=cl?'<span class="pill bad">highlights clipped</span>':'<span class="pill ok">none</span>';
 document.getElementById('ettrcap').textContent=e===0?'Normal exposure: the shadows sit near the noise and get only a few levels.':(cl?'Too far: the brightest part of the scene is clipped and gone. Back off one stop.':'+'+e+' stop'+(e>1?'s':'')+': the shadows move right, away from the noise, and get '+lvl.toLocaleString()+' levels. Darken it back down in raw processing.');}
}catch(e){console.warn("[lec] shared #34:",e.message);}
try{
evS.addEventListener('input',drawETTR);drawETTR();
}catch(e){console.warn("[lec] shared #35:",e.message);}
try{
/* ===== extra quick checks ===== */
}catch(e){console.warn("[lec] extra quick checks #36:",e.message);}
try{
Object.assign(Q,{
n1:["Which lens is \"normal\" on a full-frame camera?",["About 50 mm (≈ the sensor diagonal)","About 150 mm","About 24 mm","About 85 mm"],"Normal ≈ the diagonal: ~50 mm for full frame, ~150 mm for 4×5. It gives about 47°, like the eye."],
n2:["Which combination does NOT work?",["A crop-sensor lens on a full-frame camera","A full-frame lens on a crop camera","A full-frame lens on a full-frame camera","A crop lens on a crop camera"],"A crop lens's image circle is too small for a full-frame sensor."],
n3:["A telephoto lens gives…",["More magnification, a narrower view and less depth of field","A wider view and more depth of field","Barrel distortion","Less magnification"],"Telephoto = longer than normal."],
n4:["In a reverse telephoto (retrofocus) lens, where is the back nodal point?",["Behind the lens group, so the lens sits away from the mirror","In front of the lens","Exactly at the sensor","There isn't one"],"Swapping the elements moves the back nodal point behind the group. It's the wide-angle design."],
n5:["What changes perspective?",["Moving the camera closer or farther","Zooming the lens","Changing the aperture","Changing the ISO"],"Lens → framing. Camera position → perspective."],
n6:["A prime lens is…",["A fixed focal length lens, often with a large maximum aperture","A variable focal length lens","Always a telephoto","A lens with a built-in mirror"],"Prime = one focal length, usually fast."],
n7:["To be a TRUE macro lens, it must reach at least…",["1:1 (life size)","1:2 (half size)","1:10","2:1"],"Only lenses that reach 1:1 or more are true macro lenses."],
n8:["A +4 diopter supplemental lens has a focal length of…",["250 mm","4 mm","400 mm","40 mm"],"f = 1/D = 1/4 m = 0.25 m = 250 mm."],
n9:["How does a soft-focus lens make its effect?",["By under-correcting spherical aberration, so the edges are soft and the center is sharp","By defocusing the lens","With a mirror","With a blur filter on the sensor"],"It's not defocus. The center stays sharp, and stopping down reduces the effect."],
a1:["What does an anamorphic projection lens do?",["Stretches the squeezed film image back out to a wide picture","Squeezes the scene onto the film","Adds bokeh","Corrects chromatic aberration"],"The camera's anamorphic lens squeezes, the projector's stretches it back out."],
a2:["Bokeh is…",["The quality of the blur in out-of-focus areas","The amount of depth of field","Color fringing at edges","A type of distortion"],"It's determined by lens aberrations and the aperture, and usually copies the aperture's shape."],
a3:["In chromatic aberration, which color bends the MOST?",["Blue (short wavelengths)","Red (long wavelengths)","Green","They all bend the same"],"Blue bends most, red least, green in between. The sensor goes where green focuses."],
a4:["Spherical aberration is when…",["Rays through different parts of the lens come to focus at different points","Colors focus at different points","Straight lines bulge outward","Light disperses through a small hole"],"Edge rays focus closer than center rays. It depends on the quality of the optics."],
a5:["A fisheye lens shows which distortion?",["Barrel (edges bulge out)","Pincushion (lines curve in)","Chromatic","Spherical"],"Barrel: magnification decreases with distance from the axis. Negative lenses give pincushion."],
a6:["Optimum pinhole diameter for a 9-inch pinhole-to-film distance?",["√9 ÷ 141 ≈ 0.021 in","9 ÷ 141 ≈ 0.064 in","√9 ÷ 28 ≈ 0.107 in","141 ÷ 9 ≈ 15.7 in"],"Inches use 141: D = √f ÷ 141 = 3 ÷ 141 ≈ 0.0213 in. (Millimeters use 28.)"],
a7:["You stop down from f/8 to f/32 and the image gets softer. Why?",["Diffraction: light spreads out through the tiny aperture","Spherical aberration got worse","The shutter got slower","The sensor overheated"],"You passed the lens's diffraction limit."],
a8:["Which of these does NOT affect the circle of confusion?",["The file format you save in","Individual eyesight","Contrast between the circle and the background","Level of illumination"],"Her four: eyesight, contrast, illumination level, the viewer's opinion."],
a9:["Which three things control depth of field?",["Aperture, object distance, focal length","Shutter speed, ISO, aperture","ISO, focal length, white balance","Sensor size, file format, aperture"],"Her \"beautiful test question\"."],
a10:["You focus at the hyperfocal distance (30 ft). Depth of field now runs from…",["15 ft to infinity","30 ft to infinity","0 ft to 30 ft","60 ft to infinity"],"Half the hyperfocal distance to infinity."],
a11:["Your camera is on a tripod. Image stabilization should be…",["Off","On","On, maximum mode","It never matters"],"Mechanical IS adds wobble on a tripod and can damage gear."],
v1:["Which autofocus method uses the main sensor and finds focus at maximum contrast?",["Contrast detection: slower, but cheaper and smaller","Phase detection","LensAlign","Manual focus"],"Phase detection calculates distance (fast, separate sensor/microlenses). Contrast detection scans for the contrast peak."],
v2:["Faraway mountains look hazy and low in contrast. Which depth cue is that?",["Aerial haze","Overlap","Linear perspective","Stereophotography"],"Haze is \"incredible\" for showing depth."],
v3:["Beyond about 20 ft, how does your brain judge depth?",["Shadows and relative motion","Binocular disparity","Your dominant eye","It can't at all"],"Binocular vision works within about 18–20 ft; past that, disparity is too small."],
v4:["In one-point perspective, the receding (orthogonal) lines meet at the…",["Vanishing point on the horizon line","Bottom of the frame","Optical axis","Focal point"],"Horizon line + vanishing point + orthogonal lines."],
v5:["You double the focal length without moving. The image of everything in the scene…",["Doubles in size, so the size ratios (perspective) stay the same","Gets half as big","Changes perspective","Doesn't change"],"Image size ∝ focal length. Only moving the camera changes perspective."],
d1:["On the camera it's a photosite. In the file it's a…",["Pixel","Photodiode","Bit","Voxel"],"Photosite = on the sensor. Pixel = in the file."],
d2:["What turns the photosite's analog voltage into a digital count?",["The A/D (analog-to-digital) converter","The Bayer filter","The microlens","The shutter"],"The A/D converter. The number of possible counts is limited by bit depth."],
d3:["How many colors can a 24-bit image show?",["About 16.7 million","256","65,536","4,096"],"2²⁴ ≈ 16.7 million (8 bits each for R, G and B)."],
d4:["The in-camera histogram is based on…",["The JPEG preview","The raw data","The lens","The ISO"],"Even when you shoot raw, the camera's histogram comes from the JPEG."],
d5:["Which sensor has an A/D converter at every photosite and uses microlenses?",["CMOS","CCD","Foveon X3","Film"],"CMOS: circuitry at each photosite takes space, so microlenses funnel light in."],
d6:["Who invented the Bayer pattern, and where?",["Bryce Bayer, Kodak (1976)","Bryce Bayer, Canon (1969)","Boyle and Smith, Bell Labs","Frank Wanlass, Fairchild"],"Bryce Bayer at Kodak, patent 1976, Emmy in 2001."],
r1:["How many bits are in a byte?",["8","2","10","1,024"],"A byte = 8 bits. A bit is a single 0 or 1."],
r2:["Which file type keeps a logo sharp at any size?",["Vector (e.g. EPS)","Raster (e.g. JPEG)","RAW","BMP"],"Vectors store shapes as math, so they redraw sharply at any size."],
r4:["Which setting does NOT change the RAW data?",["Picture style / saturation","Aperture","Shutter speed","Exposure"],"Picture style, saturation, contrast and sharpening only affect the JPEG and the preview."],
r5:["Compared with a JPEG, an unprocessed RAW has…",["Higher dynamic range, lower contrast, less sharpness","Lower dynamic range, more contrast","The same everything, just bigger","More sharpness and more contrast"],"RAW keeps more range but hasn't been given contrast or sharpening yet. It isn't ready for output."],
r6:["What values can an 8-bit (JPEG) channel hold?",["0–255","1–256","0–100","0–4,095"],"2⁸ = 256 levels, numbered 0 to 255."],
r7:["You deleted the .xmp file next to your RAW. What happens?",["Your Camera Raw edits are lost","The RAW is deleted","Nothing","The RAW becomes a JPEG"],"The .xmp sidecar holds the edit instructions. Keep it with the RAW."],
r8:["What is DNG's big archival promise?",["Adobe guarantees old DNGs will still open (legacy & versionable)","It is always uncompressed","Every camera writes it","It is 50% smaller"],"DNG is open and versionable, so Adobe promises future software will open it."],
f1:["Preservation = redundancy + documentation + validation + …?",["a migration plan","a bigger hard drive","JPEG copies","DNG only"],"Keep moving data off old media before you can't read it."],
f2:["Why do raw files get tone mapping?",["Sensors are linear but human vision isn't","To add noise","To demosaic","To compress"],"Tone mapping (like a gamma curve) makes the linear sensor data look natural."],
f3:["What is BigTIFF for?",["Files larger than 4 GB (64-bit offsets)","Animated images","Lossy web images","Vector graphics"],"Classic TIFF uses 32-bit offsets with a 4 GB limit. BigTIFF uses 64-bit offsets."],
f4:["What happens when you re-save a JPEG over and over?",["Generational degradation: artifacts build up","Nothing, it's lossless","It turns into a TIFF","Resolution drops by half"],"Each save compresses an already compressed file."],
f5:["Which format is limited to 256 colors?",["GIF","PNG","TIFF","HEIF"],"GIF uses indexed color: a palette of at most 256 colors."],
f6:["In JPEG compression, which channels get cut in half first?",["The color (Cb, Cr) channels","The brightness (Y) channel","All three equally","None"],"We're more sensitive to brightness than to color, so color is subsampled."],
f7:["Zooming to 3200% in Photoshop shows big squares. What is that?",["Pixelation: just magnification, not an artifact","Blocking","Aliasing","Posterization"],"Pixelation isn't an artifact. The pixels are just magnified."],
f8:["What is a virtual copy?",["Another set of edit instructions on the same original","A duplicate full-size file","A JPEG export","A backup drive"],"One original file, many sets of instructions."],
o2:["Light that bounces off a surface at the same angle it came in is…",["Reflected (specular)","Absorbed","Transmitted","Scattered"],"RATS: Reflected, Absorbed, Transmitted, Scattered."],
o3:["Why does a 4×5 ground glass show the image upside down and backwards?",["Every real lens image is inverted, and there's no prism to flip it","The film is loaded backwards","Refraction in the ground glass","It's a negative lens"],"A DSLR flips it with a pentaprism and a mirrorless camera does it in software. The 4×5 doesn't."],
o4:["Which lens can form a real image by itself?",["Positive (thicker in the center)","Negative (thinner in the center)","Both","Neither"],"A positive lens converges light to a point. A negative lens diverges it."],
o5:["Focal length is measured from the back nodal point to the focal plane with the object at…",["Infinity","1 meter","The front nodal point","Twice the focal length"],"Light from infinity enters parallel and comes to focus at the focal plane."],
o6:["f = 100 mm, R = 3. What is v?",["400 mm","300 mm","133 mm","33 mm"],"v = f(R + 1) = 100 × 4 = 400 mm. Then u = v ÷ R ≈ 133.3 mm."],
o7:["Which focal length bends light more sharply (more distortion)?",["Short (wide angle)","Long (telephoto)","They bend the same","Only zoom lenses"],"Short focal lengths bend rays more, so wide angles distort more."],
o8:["What controls perspective?",["Camera-to-subject distance","Focal length","Aperture","Sensor size"],"Focal length changes the angle of view and image scale. Distance changes perspective."],
w1:["You keep the near subject the same size while switching from a 50 mm to a 200 mm lens. The background…",["Looks bigger and closer to the subject","Looks smaller and farther away","Doesn't change at all","Gets more depth of field"],"Backing up with a longer lens compresses space: the background looks big and close (emphasized)."],
w2:["Strong perspective (converging lines, big near objects) is really caused by…",["Being close to the subject","The wide-angle lens itself","A high f-number","The sensor size"],"It's a function of distance. You just tend to use a wide angle when you're close."],
w3:["Full-frame camera, 100 mm lens, print enlarged 4×. Normal viewing distance?",["400 mm (about 16 in)","25 mm","104 mm","100 mm"],"Viewing distance = focal length × magnification = 100 × 4 = 400 mm."],
w4:["Which colors seem to come forward (approach) in a photo?",["Warm colors, like reds","Cool colors, like blues","Deep greens","Neutral grays"],"Warm = approaching. Cool blues and deep greens = receding."],
w5:["Who invented holography, and what was he trying to do?",["Dennis Gabor, improving electron microscope resolving power","Bryce Bayer, making color sensors","Dennis Gabor, making 3-D movies","Thomas Sutton, making panoramas"],"Gabor (Nobel Prize in Physics) invented it by accident. Good holograms need coherent light: a laser."],
w6:["Vignetting (darker corners)…",["Changes with f-number and can be removed with a lens profile","Never changes with f-number","Only happens with film","Is a type of noise"],"It follows cosine falloff and changes with the f-number."],
x1:["100 lux goes into a filter and 25 lux comes out. Transmittance?",["0.25","4","0.6","25"],"T = transmitted ÷ incident = 25 ÷ 100 = 0.25 (no units)."],
x2:["Transmittance is 0.25. Opacity?",["4","0.25","0.6","25"],"O = 1 ÷ T = 1 ÷ 0.25 = 4."],
x3:["You stack a 0.3 and a 0.6 ND filter. Total?",["0.9 density = 3 stops","0.18 density = 2 stops","0.9 density = 9 stops","0.6 density = 2 stops"],"Density is additive: 0.3 + 0.6 = 0.9, and every 0.3 is one stop."],
x4:["What does a histogram show?",["How often each value occurs (frequency)","Whether the photo is good","The color temperature","The focal length"],"Frequency of values. It says nothing about image quality."],
y2:["Which list is all FULL f-stops in order?",["2.8, 4, 5.6, 8, 11","2.8, 3.5, 4, 5.6, 8","2, 3, 4, 5, 6","4, 5.6, 6.3, 8, 11"],"1.4 · 2 · 2.8 · 4 · 5.6 · 8 · 11 · 16 · 22 · 32."],
y3:["Base: ISO 400, 1/60, f/5.6. You change to f/11 and keep ISO. Equivalent shutter speed?",["1/15","1/250","1/30","1/8"],"f/5.6 → 8 → 11 = −2 stops, so the shutter adds 2: 1/60 → 1/30 → 1/15."],
y4:["On a DIGITAL camera, the speckle from high ISO is called…",["Noise","Grain","Bokeh","Flare"],"Digital = noise. Film = graininess."],
y5:["How many digital counts are in an 8-bit (JPEG) histogram?",["256 (0 to 255)","255","100","1,024"],"0 counts too, so 0–255 is 256 values."],
y6:["Base N: 1/125, f/8. The N − 2 row (change shutter only) is…",["1/500","1/30","1/250","1/60"],"Count 2 stops LESS light from the base: 1/125 → 1/250 → 1/500."],
z1:["Pixel values in an image file are…",["Integers (whole numbers)","Floating point numbers","Fractions","Negative numbers"],"Files hold whole numbers. Filter math makes decimals, so you round back."],
z2:["A pixel is in row 9, column 16. Written row major, its address is…",["(9, 16)","(16, 9)","(0, 0)","(25, 0)"],"Row major = row first. Column major would be (16, 9)."],
z3:["Halving an image with nearest neighbor turned a checkerboard into a solid color. Why?",["It throws out every other pixel in every other row","It averages 16 neighbors","It adds blur","It sharpens edges"],"Nearest neighbor just drops pixels when reducing, so the pattern can disappear."],
z4:["Changing a pixel using the pixels around it is called…",["Pixel group processing","Pixel point processing","Demosaicing","Bit depth"],"Group = neighbors involved. Point = one pixel alone, like fixing a hot pixel."],
z5:["Which kernel size could a spatial filter use?",["5 × 5","4 × 4","2 × 2","6 × 6"],"Kernels are always odd so there is a center pixel: 3 × 3, 5 × 5, 9 × 9."],
z6:["A 1/9 blur filter sits over nine pixels: eight are 90 and one is 0. New center value?",["80","90","10","45"],"(8 × 90 + 0) ÷ 9 = 720 ÷ 9 = 80."]});
}catch(e){console.warn("[lec] extra quick checks #37:",e.message);}
try{
document.querySelectorAll('.check').forEach(function(el){if(el.innerHTML)return;var q=Q[el.dataset.q];if(!q)return;var order=[0,1,2,3].sort(function(){return Math.random()-.5;});
 el.innerHTML='<span class="tag">Quick check</span><div class="q">'+q[0]+'</div><div class="opts">'+order.map(function(i){return '<button type="button" data-i="'+i+'">'+q[1][i]+'</button>';}).join('')+'</div><div class="fb" aria-live="polite"></div>';
 el.querySelectorAll('.opts button').forEach(function(b){b.addEventListener('click',function(){var ok=b.dataset.i==='0';b.classList.add(ok?'right':'wrong');if(!ok)el.querySelector('[data-i="0"]').classList.add('right');el.querySelectorAll('.opts button').forEach(function(x){x.disabled=true;});el.querySelector('.fb').innerHTML=(ok?'✅ Correct. ':'❌ Not quite. ')+q[2];});});});

}catch(e){console.warn("[lec] extra quick checks #38:",e.message);}
try{
/* ===== lecture tabs ===== */
}catch(e){console.warn("[lec] lecture tabs #39:",e.message);}
try{
var tabs=document.querySelectorAll('#lecs button');
}catch(e){console.warn("[lec] lecture tabs #40:",e.message);}
try{
function showLec(id,scroll){tabs.forEach(function(b){var on=b.dataset.l===id;b.setAttribute('aria-selected',on);b.setAttribute('aria-pressed',on);});
 document.querySelectorAll('.lec').forEach(function(d){d.hidden=d.id!==id;});
 try{localStorage.setItem('e2-lec',id);}catch(e){}
 if(scroll){var t=document.getElementById('lecs');try{if(window.frameElement&&window.parent!==window){var fr=window.frameElement.getBoundingClientRect(),r=t.getBoundingClientRect();if(fr.top+r.top<0)window.parent.scrollTo({top:window.parent.scrollY+fr.top+r.top-12,behavior:'smooth'});return;}}catch(e){}if(t.getBoundingClientRect().top<0)t.scrollIntoView({block:'start'});}}
}catch(e){console.warn("[lec] lecture tabs #41:",e.message);}
try{
tabs.forEach(function(b){b.addEventListener('click',function(){showLec(b.dataset.l,true);});});
}catch(e){console.warn("[lec] lecture tabs #42:",e.message);}
try{
document.querySelectorAll('.toc a').forEach(function(a){if(a._b)return;a._b=1;a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();
 try{if(window.frameElement&&window.parent!==window){var fr=window.frameElement.getBoundingClientRect();window.parent.scrollTo({top:window.parent.scrollY+fr.top+t.getBoundingClientRect().top-12,behavior:'smooth'});return;}}catch(err){}
 t.scrollIntoView({behavior:'smooth',block:'start'});});});
}catch(e){console.warn("[lec] lecture tabs #43:",e.message);}
try{
try{var saved=localStorage.getItem('e2-lec');if(saved&&document.getElementById(saved))showLec(saved,false);}catch(e){}


}catch(e){console.warn("[lec] lecture tabs #44:",e.message);}
try{
/* ===== her test picks ===== */
}catch(e){console.warn("[lec] her test picks #45:",e.message);}
try{
(function(){var P=[{"l": "L4", "s": "o2", "d": "Oct 16", "said": "“Excellent test question”", "q": "What 4 things can happen to light when it hits something?", "a": "<b>RATS</b>: <b>R</b>eflected · <b>A</b>bsorbed · <b>T</b>ransmitted · <b>S</b>cattered", "x": "Reflected: angle in = angle out. Absorbed: turns into heat (a black shirt in the sun). Transmitted: passes through. Scattered: redirected by dust or water (fog + headlights)."}, {"l": "L2", "s": "r5", "d": "Oct 2", "said": "“A really good test question”", "q": "Compared with a JPEG, a RAW file has…", "a": "<b>Higher</b> dynamic range, <b>lower</b> contrast, <b>less</b> sharp, and it's <b>not ready for output</b>.", "x": "Less sharp because the anti-aliasing filter blurs a little and sharpening is only added in processing."}, {"l": "L2", "s": "r5", "d": "Oct 2", "said": "Test question", "q": "Which file is bigger: the RAW file or the demosaiced image?", "a": "The <b>demosaiced</b> image.", "x": "RAW = 1 value per photosite (1 channel). Demosaiced = red, green and blue at every pixel (3 channels)."}, {"l": "L2", "s": "r6", "d": "Oct 2", "said": "Test question", "q": "What values can one channel of an 8-bit image hold?", "a": "<b>0 to 255</b> (256 levels)", "x": "2⁸ = 256. Counting starts at 0, so the top value is 255. 12-bit = 4,096 levels, 16-bit = 65,536."}, {"l": "L3", "s": "f4", "d": "Oct 5", "said": "Test question", "q": "What happens when you edit and re-save a JPEG over and over?", "a": "<b>Generational degradation</b>: it's compressed again every save, so artifacts build up.", "x": "Fix: convert to TIFF or PSD before you edit."}, {"l": "L3", "s": "f4", "d": "Oct 5", "said": "Test question (the chart)", "q": "TIFF vs JPEG: which is better for repeated editing, and which allows transparency?", "a": "<b>TIFF</b> for both. JPEG degrades every save and has no transparency.", "x": "TIFF: lossless or lossy, 8/16/32 bits, layers, large files. JPEG: lossy, 8 bits only, small files."}, {"l": "L4", "s": "o4", "d": "Oct 16", "said": "Test question", "q": "Positive vs negative lens: what does each one do?", "a": "<b>Positive (convex)</b>: thicker in the center, <b>converges</b> light, forms a <b>real image</b>.<br><b>Negative (concave)</b>: thinner in the center, <b>diverges</b> light, <b>can't</b> form a real image alone.", "x": "Every camera lens uses both, e.g. an achromatic doublet."}, {"l": "L4", "s": "o6", "d": "Oct 16", "said": "Calculator trap", "q": "1/u + 1/v = 0.02 on your calculator. What is the focal length?", "a": "Press <b>1/x</b>: f = 1 ÷ 0.02 = <b>50 mm</b>", "x": "1/u + 1/v gives 1/f, not f. A 0.02 mm focal length makes no sense, so always flip it."}, {"l": "L5", "s": "n4", "d": "Oct 19", "said": "“A very good test question”", "q": "Telephoto vs reverse telephoto (retrofocus): how are the elements arranged?", "a": "<b>Telephoto</b>: positive element in <b>front</b>, negative behind → rear nodal point falls <b>in front of</b> the lens.<br><b>Retrofocus</b>: negative in front, positive behind → rear nodal point falls <b>behind</b> the lens, so a wide angle clears the DSLR mirror.", "x": "Her slide calls it “Reverse Telephoto Wide Angle Lens”."}, {"l": "L5", "s": "n5", "d": "Oct 19", "said": "She “can't impose upon that enough”", "q": "What does changing the focal length change, and what does moving the camera change?", "a": "Focal length → <b>framing</b>.<br>Camera position → <b>perspective</b>.", "x": "Zooming never changes perspective. Only distance does."},{"l": "L6", "s": "a8", "d": "Oct 23", "said": "“Beautiful test question”", "q": "What affects your circle of confusion?", "a": "<b>Eyesight</b> · <b>contrast</b> (circle vs background) · <b>level of illumination</b> · the viewer's <b>opinion</b> of sharpness", "x": "Memory hook: Every Coffee Looks Okay."},{"l": "L6", "s": "a9", "d": "Oct 23", "said": "“Also a beautiful test question”", "q": "What are the three depth of field controls?", "a": "<b>Aperture</b> · <b>object distance</b> (camera to subject) · <b>focal length</b>", "x": "Smaller aperture, farther away, shorter lens = more depth of field."},{"l": "L7", "s": "v5", "d": "Oct 26", "said": "In blue on her slide (“probably on a test”)", "q": "How do focal length and object distance affect image size?", "a": "Image size is <b>directly proportional to focal length</b> and <b>inversely proportional to object distance</b>.", "x": "Double the focal length → everything twice as big. Twice as far away → half as big."}, {"l": "LB", "s": "y2", "d": "Sep 18", "said": "“You need to have this memorized for the test”", "q": "What are the full stops for f-number, shutter speed and ISO?", "a": "f/ <b>1.4 · 2 · 2.8 · 4 · 5.6 · 8 · 11 · 16 · 22 · 32</b><br>Shutter <b>1 · 1/2 · 1/4 · 1/8 · 1/15 · 1/30 · 1/60 · 1/125 · 1/250 · 1/500 · 1/1000</b><br>ISO <b>100 · 200 · 400 · 800 · 1600 · 3200 · 6400</b>", "x": "Each full stop halves or doubles the light. She calls these free points."}, {"l": "LB", "s": "y3", "d": "Sep 18", "said": "On every test (“never had a test without one”)", "q": "Base: ISO 200, 1/125, f/8. You keep ISO 200 and change to 1/30. What f-number keeps the exposure equivalent?", "a": "<b>f/16</b>. 1/125 → 1/30 adds 2 stops (+2), so f/8 → f/11 → f/16 takes 2 away (−2). The column adds to 0.", "x": "Her second example: ISO 200 → 800 (+2), keep f/8, so 1/125 → 1/500 (−2)."}, {"l": "LB", "s": "y5", "d": "Sep 18", "said": "“Write that down and underline it”", "q": "How many digital counts does the camera histogram have?", "a": "<b>256</b>, numbered <b>0 to 255</b>.", "x": "Most students say 255. Zero counts too."}, {"l": "L9", "s": "z4", "d": "Nov 6", "said": "“I can guarantee you're going to have to define these on a test”", "q": "Define pixel point processing and pixel group processing.", "a": "<b>Point:</b> changes <b>one pixel</b> without looking at its neighbors (fixing a hot pixel).<br><b>Group:</b> changes the <b>center pixel</b> using the pixels <b>around it</b> (blurring, sharpening, scaling).", "x": "Point = one pixel alone. Group = the pixel and its neighbors."}];
var fc=document.getElementById('fc');if(!fc)return;
var order=P.map(function(_,i){return i;}),i=0,back=false,mark={};
try{mark=JSON.parse(localStorage.getItem('e2-picks')||'{}')||{};}catch(e){}
function save(){try{localStorage.setItem('e2-picks',JSON.stringify(mark));}catch(e){}}
function goSec(l,sid){if(!document.getElementById(l)&&window.LECPAGE&&LECPAGE[l]){location.href=LECPAGE[l]+"#"+sid;return;}showLec(l,false);var t=document.getElementById(sid);if(!t)return;setTimeout(function(){
 try{if(window.frameElement&&window.parent!==window){var fr=window.frameElement.getBoundingClientRect();window.parent.scrollTo({top:window.parent.scrollY+fr.top+t.getBoundingClientRect().top-12,behavior:'smooth'});return;}}catch(e){}
 t.scrollIntoView({behavior:'smooth',block:'start'});},30);}
var typeOn=false,rev=false,typed='',ptbox=document.getElementById('ptbox'),pin=document.getElementById('pin');
function draw(anim){var k=order[i],c=P[k];fc.classList.toggle('back',back);
 var qHTML=rev?'<div class="fa">'+c.a+'</div>':'<div class="fq">'+c.q+'</div>',aHTML=rev?'<div class="fq">'+c.q+'</div>':'<div class="fa">'+c.a+'</div>'+(c.x?'<div class="fx">'+c.x+'</div>':'');
 var you=typed?'<div class="fyou">You wrote: '+typed.replace(/[&<>]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m];})+'</div>':'';
 fc.innerHTML='<span class="meta"><span>★ '+c.d+' lecture'+(rev?' · flipped':'')+'</span><span>'+(i+1)+' / '+order.length+'</span></span><span class="fbd">'+(back?aHTML+you+'<div class="hint">'+c.said+(typed?' · then tap Got it or Again':'')+'</div>':qHTML+'<div class="hint">'+(rev?'What was the question? ':'')+(typeOn?'Type below, then Show answer':'Tap to see the answer')+'</div>')+'</span>';
 fc.setAttribute('aria-label',(back?'Answer: ':'Question: ')+fc.textContent);
 ptbox.hidden=!typeOn||back;
 if(anim){fc.classList.remove('flip');void fc.offsetWidth;fc.classList.add('flip');}
 document.getElementById('pdots').innerHTML=order.map(function(k2,j){return '<i class="'+(j===i?'cur ':'')+(mark[k2]==='ok'?'ok':mark[k2]==='ag'?'ag':'')+'"></i>';}).join('');}
function step(d){i=(i+d+order.length)%order.length;back=false;typed='';pin.value='';draw(true);}
fc.addEventListener('click',function(){back=!back;draw(true);});
document.getElementById('pchk').onclick=function(){typed=pin.value.trim();back=true;draw(true);};
pin.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();document.getElementById('pchk').click();}});
document.getElementById('ptype').onclick=function(){typeOn=!typeOn;this.setAttribute('aria-pressed',typeOn);back=false;typed='';draw(false);if(typeOn)pin.focus();};
document.getElementById('pdir').onclick=function(){rev=!rev;this.setAttribute('aria-pressed',rev);back=false;typed='';draw(true);};
document.getElementById('pprev').onclick=function(){step(-1);};
document.getElementById('pnext').onclick=function(){step(1);};
document.getElementById('pok').onclick=function(){mark[order[i]]='ok';save();step(1);};
document.getElementById('pagain').onclick=function(){mark[order[i]]='ag';save();step(1);};
document.getElementById('pshuf').onclick=function(){for(var a=order.length-1;a>0;a--){var b=Math.floor(Math.random()*(a+1)),t=order[a];order[a]=order[b];order[b]=t;}i=0;back=false;draw(true);};
document.getElementById('pmiss').onclick=function(){var m=P.map(function(_,k){return k;}).filter(function(k){return mark[k]==='ag';});if(!m.length){fc.innerHTML='<div class="fq">No “Again” cards 🎉</div><div class="hint">Tap “All cards” to start over</div>';return;}order=m;i=0;back=false;draw(true);};
document.getElementById('pall').onclick=function(){order=P.map(function(_,k){return k;});i=0;back=false;draw(true);};
document.getElementById('pgo').onclick=function(){var c=P[order[i]];goSec(c.l,c.s);};
document.getElementById('plist').innerHTML=P.map(function(c,k){return '<button type="button" data-k="'+k+'"><span class="pd">★ '+c.d+'</span><span class="pq2">'+c.q+'</span><span class="ps">'+c.said+'</span></button>';}).join('');
document.querySelectorAll('#plist button').forEach(function(b){b.addEventListener('click',function(){var c=P[+b.dataset.k];goSec(c.l,c.s);});});
draw(false);})();
}catch(e){console.warn("[lec] her test picks #46:",e.message);}
try{
/* ===== Oct 23 · aberrations & depth of field ===== */
}catch(e){console.warn("[lec] Oct 23 · aberrations & depth of field #47:",e.message);}
try{
(function(){
var NS='http://www.w3.org/2000/svg';
function segPick(id,fn){var g=document.getElementById(id);if(!g)return;var bs=g.querySelectorAll('button');bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b);});fn(b);});});}
function T(x,y,t,o){o=o||{};return '<text x="'+x+'" y="'+y+'" text-anchor="'+(o.a||'middle')+'" style="font:'+(o.w||700)+' '+Math.round((o.s||13)*1.3)+'px Inter,sans-serif" fill="'+(o.c||'#15131C')+'">'+t+'</text>';}

/* anamorphic */
var an=document.getElementById('ansvg');
if(an){var caps=['The wide scene on the movie set (the white lines show what the camera sees).','On the film: the anamorphic lens squeezes everything sideways, so people look tall and skinny.','On the screen: the projector\'s anamorphic lens stretches it back, so the audience sees a wide, normal picture.'];
function scene(){var s='<rect width="400" height="150" fill="#BFE3F5"/><rect y="105" width="400" height="45" fill="#8FBF6A"/><circle cx="330" cy="38" r="20" fill="#FFD34D"/>';[60,130,200,270,340].forEach(function(x,i){s+='<circle cx="'+x+'" cy="70" r="11" fill="#F2C9A5"/><rect x="'+(x-11)+'" y="82" width="22" height="34" rx="6" fill="'+['#E0473C','#3F6CC9','#6D4AD9','#3FA34D','#D9822B'][i]+'"/>';});return s;}
function drawAn(k){var sx=k===1?0.42:1,w=400*sx,x0=(460-w)/2;an.innerHTML='<rect width="460" height="200" fill="#F6F5FA"/><g transform="translate('+x0+',22) scale('+sx+',1)">'+scene()+'</g>'+(k===0?'<rect x="30" y="22" width="400" height="150" fill="none" stroke="#fff" stroke-width="4"/>':'')+(k===1?'<rect x="'+(x0-14)+'" y="14" width="'+(w+28)+'" height="166" fill="none" stroke="#15131C" stroke-width="3" stroke-dasharray="6 6"/>':'')+T(230,192,['wide scene','squeezed onto standard film','stretched back by the projector lens'][k],{s:13});document.getElementById('ancap').textContent=caps[k];}
segPick('anb',function(b){drawAn(+b.dataset.s);});drawAn(0);}

/* bokeh */
var bk=document.getElementById('bksvg');
if(bk){function shape(t,x,y,r){if(t==='c')return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';if(t==='h'){var p=[];for(var i=0;i<6;i++){var a=Math.PI/6+i*Math.PI/3;p.push((x+r*Math.cos(a)).toFixed(1)+','+(y+r*Math.sin(a)).toFixed(1));}return '<polygon points="'+p.join(' ')+'"/>';}
 var s=r/16;return '<path transform="translate('+x+','+y+') scale('+s+')" d="M0 14 C-22 -2 -14 -18 0 -8 C14 -18 22 -2 0 14Z"/>';}
function drawBk(t){var cols=['#FFD27A','#FF9E7A','#FFF1B8','#9EC9FF','#FFB3D1','#FFE28A'],s='<rect width="460" height="170" rx="12" fill="#14101C"/><g opacity=".85">';var pts=[[50,40,22],[120,95,30],[200,45,18],[260,120,26],[330,60,32],[410,110,24],[80,140,16],[180,150,14],[380,30,15],[300,150,12]];
 pts.forEach(function(p,i){s+='<g fill="'+cols[i%6]+'" fill-opacity=".55" stroke="'+cols[i%6]+'" stroke-width="1.5">'+shape(t,p[0],p[1],p[2])+'</g>';});bk.innerHTML=s+'</g>';}
segPick('bkb',function(b){drawBk(b.dataset.s);});drawBk('c');}

/* chromatic aberration */
var ca=document.getElementById('casvg');
if(ca){function drawCa(d){var L=150,cy=100,s='<rect width="460" height="200" fill="#fff"/><line x1="10" y1="100" x2="450" y2="100" stroke="#C9C4D8" stroke-dasharray="5 5"/>';
 s+='<path d="M150 30 Q170 100 150 170 Q130 100 150 30Z" fill="#DCD3FA" stroke="#6D4AD9" stroke-width="2"/>';if(d)s+='<path d="M162 32 Q152 100 162 168 L176 168 Q166 100 176 32Z" fill="#C7E3F6" stroke="#3F6CC9" stroke-width="2"/>'+T(132,24,'crown',{s:11,c:'#6D4AD9'})+T(186,24,'flint',{s:11,c:'#3F6CC9'});
 var fx=d?{B:330,G:330,R:330}:{B:300,G:330,R:362},C={B:'#3F6CC9',G:'#3FA34D',R:'#E0473C'};
 [-1,1].forEach(function(sg){var y0=cy+sg*58;['R','G','B'].forEach(function(k,i){var yy=y0+sg*(i-1)*3;var x2=fx[k],ex=440,ey=cy+(cy-yy)*(ex-x2)/(x2-(d?176:150));s+='<line x1="10" y1="'+yy+'" x2="'+(d?176:150)+'" y2="'+yy+'" stroke="'+C[k]+'" stroke-width="2"/><line x1="'+(d?176:150)+'" y1="'+yy+'" x2="'+ex+'" y2="'+ey+'" stroke="'+C[k]+'" stroke-width="2"/>';});});
 s+='<line x1="330" y1="40" x2="330" y2="160" stroke="#15131C" stroke-width="3"/>'+T(330,34,'sensor',{s:12})+(d?'':T(300,186,'B',{c:C.B})+T(330,186,'G',{c:C.G})+T(362,186,'R',{c:C.R}));ca.innerHTML=s;
 document.getElementById('cacap').textContent=d?'Achromatic doublet: positive crown glass + negative flint glass, cemented. Red, green and blue now meet at (or near) one point.':'Single lens: blue focuses first, red last. The sensor sits where green focuses, so red and blue make colored fringes.';}
segPick('cab',function(b){drawCa(b.dataset.s==='1');});drawCa(false);}

/* spherical */
var sp=document.getElementById('spsvg');
if(sp){var s='<rect width="460" height="250" fill="#fff"/>';[[62,'Perfect lens: sharp image',0],[188,'Spherical lens: unsharp image',1]].forEach(function(r){var cy=r[0];s+='<path d="M140 '+(cy-52)+' Q165 '+cy+' 140 '+(cy+52)+'Z" fill="#DCD3FA" stroke="#6D4AD9" stroke-width="2"/>';
 for(var h=-44;h<=44;h+=11){if(!h)continue;var fx=r[2]?380-Math.pow(Math.abs(h)/44,2)*90:360,ex=450,ey=cy-h*(ex-fx)/(fx-150);s+='<line x1="10" y1="'+(cy+h)+'" x2="150" y2="'+(cy+h)+'" stroke="#E0473C" stroke-width="1.5"/><line x1="150" y1="'+(cy+h)+'" x2="'+ex+'" y2="'+ey.toFixed(1)+'" stroke="#E0473C" stroke-width="1.5"/>';}
 s+=T(300,cy-42,r[1],{s:13});});sp.innerHTML=s;}

/* distortion grid */
var dk=document.getElementById('dk'),ds=document.getElementById('dsvg');
if(dk){function drawD(){var k=+dk.value*0.06,s='<rect width="300" height="200" fill="#fff"/>';function P(x,y){var nx=(x-150)/150,ny=(y-100)/150,r2=nx*nx+ny*ny,f=1+k*r2*2.2;return (150+nx*150*f).toFixed(1)+','+(100+ny*150*f).toFixed(1);}
 for(var gx=10;gx<=290;gx+=20){var p=[];for(var y=10;y<=190;y+=5)p.push(P(gx,y));s+='<polyline points="'+p.join(' ')+'" fill="none" stroke="#15131C" stroke-width="2"/>';}
 for(var gy=10;gy<=190;gy+=20){var q=[];for(var x=10;x<=290;x+=5)q.push(P(x,gy));s+='<polyline points="'+q.join(' ')+'" fill="none" stroke="#15131C" stroke-width="2"/>';}
 ds.innerHTML=s;document.getElementById('dkv').textContent=k<0?'Barrel distortion (bulges out)':k>0?'Pincushion distortion (pinches in)':'No distortion';}
dk.addEventListener('input',drawD);drawD();}

/* pinhole calculator */
var pf=document.getElementById('pf'),pu=document.getElementById('pu'),po=document.getElementById('pout');
if(pf){function calcP(){var f=+pf.value,u=pu.value;if(!(f>0)){po.innerHTML='<li>Enter a distance above 0</li>';return;}var k=u==='in'?141:28,d=Math.sqrt(f)/k,dmm=u==='in'?d*25.4:d;
 po.innerHTML='<li>√'+f+' = '+Math.sqrt(f).toFixed(3)+'</li><li>D = '+Math.sqrt(f).toFixed(3)+' ÷ '+k+' = <b>'+d.toFixed(4)+' '+(u==='in'?'in':'mm')+'</b></li><li class="last">≈ '+dmm.toFixed(2)+' mm wide'+(u==='in'?' (×25.4)':'')+'</li>';}
[pf,pu].forEach(function(e){e.addEventListener('input',calcP);});calcP();}

/* diffraction sweet spot */
var dfs=document.getElementById('dfs'),dfg=document.getElementById('dfsvg');
if(dfs){var F=[1.4,2,2.8,4,5.6,8,11,16,22,32];function ab(i){return 9*Math.pow(0.62,i)+0.3;}function di(i){return 0.25*Math.pow(1.45,i);}
 function X(i){return 50+i*42;}function Y(v){return 175-v*15;}
 function drawDf(){var i=+dfs.value,s='<rect width="460" height="210" fill="#fff"/><line x1="40" y1="175" x2="440" y2="175" stroke="#15131C"/><line x1="40" y1="20" x2="40" y2="175" stroke="#15131C"/>'+T(16,100,'blur',{s:11,a:'middle'})+T(240,205,'aperture (f-number) →',{s:11});
 F.forEach(function(f,k){s+=T(X(k),190,'f/'+f,{s:10,w:600});});
 function line(fn,c,w,dash){var p=[];for(var k=0;k<10;k++)p.push(X(k)+','+Y(Math.min(fn(k),10)).toFixed(1));return '<polyline points="'+p.join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+w+'"'+(dash?' stroke-dasharray="6 5"':'')+'/>';}
 s+=line(ab,'#D9822B',2,1)+line(di,'#3F6CC9',2,1)+line(function(k){return ab(k)+di(k);},'#6D4AD9',3.5);
 var tot=ab(i)+di(i);s+='<line x1="'+X(i)+'" y1="20" x2="'+X(i)+'" y2="175" stroke="#15131C" stroke-dasharray="3 4"/><circle cx="'+X(i)+'" cy="'+Y(tot)+'" r="6" fill="#6D4AD9"/>';
 s+=T(300,40,'aberrations',{s:11,c:'#D9822B',a:'start'})+T(300,56,'diffraction',{s:11,c:'#3F6CC9',a:'start'})+T(300,72,'total blur',{s:11,c:'#6D4AD9',a:'start'});
 dfg.innerHTML=s;document.getElementById('dfv').textContent='f/'+F[i];var best=[4,5,6].indexOf(i)>=0;
 document.getElementById('dfcap').textContent=i<3?'Wide open: aberrations make the most blur.':best?'Sweet spot: the sharpest this (made-up) lens gets.':'Past the diffraction limit: stopping down now makes it softer, not sharper.';}
dfs.addEventListener('input',drawDf);drawDf();}

/* circle of confusion */
var cu=document.getElementById('cu'),cf=document.getElementById('cfsvg'),cN=8;
if(cu){var DIST=[];for(var k=0;k<=40;k++)DIST.push(Math.round(Math.exp(Math.log(500)+k*(Math.log(20000)-Math.log(500))/40)));DIST[10]=2000;
 function drawCf(){var f=50,u0=2000,u=DIST[+cu.value],c=0.03,A=f/cN,v0=1/(1/f-1/u0),v=1/(1/f-1/u),b=A*Math.abs(v-v0)/v,ok=b<=c;
 var H=f*f/(cN*c)+f,near=H*u0/(H+(u0-f)),far=u0<H?H*u0/(H-(u0-f)):Infinity;
 var s='<rect width="460" height="190" fill="#fff"/><line x1="10" y1="90" x2="320" y2="90" stroke="#C9C4D8" stroke-dasharray="5 5"/>';
 var ox=20+Math.min(Math.log(u/500)/Math.log(40),1)*110;s+='<circle cx="'+ox.toFixed(1)+'" cy="90" r="5" fill="#D9822B"/>'+T(ox,112,(u/1000).toFixed(u<1000?2:1)+' m',{s:11});
 var lx=170,ap=Math.max(6,Math.min(46,(50/cN)*6.5)),sx=260,ix=sx+(v-v0)*1.8;ix=Math.max(200,Math.min(320,ix));
 s+='<path d="M'+lx+' 38 Q'+(lx+14)+' 90 '+lx+' 142 Q'+(lx-14)+' 90 '+lx+' 38Z" fill="#DCD3FA" stroke="#6D4AD9" stroke-width="2"/><line x1="'+lx+'" y1="'+(90-ap)+'" x2="'+lx+'" y2="'+(90+ap)+'" stroke="#6D4AD9" stroke-width="5"/>';
 [-1,1].forEach(function(g){var ay=90+g*ap;s+='<line x1="'+ox.toFixed(1)+'" y1="90" x2="'+lx+'" y2="'+ay+'" stroke="#D9822B" stroke-width="1.5"/><line x1="'+lx+'" y1="'+ay+'" x2="'+ix.toFixed(1)+'" y2="90" stroke="#D9822B" stroke-width="1.5"/>';var ey=90+g*ap*(ix-sx)/(ix-lx);s+='';});
 s+='<line x1="'+sx+'" y1="30" x2="'+sx+'" y2="150" stroke="#15131C" stroke-width="3"/>'+T(sx,24,'sensor',{s:11});
 var R=Math.max(1.5,Math.min(30,b/c*7));s+='<rect x="340" y="40" width="110" height="100" rx="10" fill="#14101C"/><circle cx="395" cy="90" r="7" fill="none" stroke="#fff" stroke-dasharray="3 3"/><circle cx="395" cy="90" r="'+R.toFixed(1)+'" fill="#FFD27A" fill-opacity=".8"/>'+T(395,160,ok?'a point ✓':'blurry ✗',{s:11,c:ok?'#1F8A70':'#C0392B'});
 cf.innerHTML=s;document.getElementById('cuv').textContent=(u/1000).toFixed(u<1000?2:1)+' m';
 document.getElementById('cfcap').innerHTML='Blur circle '+b.toFixed(3)+' mm vs permissible 0.03 mm (dashed). At f/'+cN+' the depth of field is about <b>'+(near/1000).toFixed(2)+' m to '+(far===Infinity?'∞':(far/1000).toFixed(2)+' m')+'</b>.';}
 cu.addEventListener('input',drawCf);segPick('cfn',function(b){cN=+b.dataset.n;drawCf();});drawCf();}

/* relative f-stops */
var rf=document.getElementById('rf'),rn=document.getElementById('rn'),ro=document.getElementById('rout');
if(rf){function calcR(){var f=+rf.value,n=+rn.value;ro.textContent=(f>0&&n>0)?'Aperture diameter = '+f+' ÷ '+n+' = '+(f/n).toFixed(1)+' mm':'Enter values above 0';}[rf,rn].forEach(function(e){e.addEventListener('input',calcR);});calcR();}

/* hyperfocal */
var hf=document.getElementById('hfsvg'),hM='inf',hN=22;
if(hf){function drawH(){var f=50,c=0.03,H=f*f/(hN*c)+f,Hft=H/304.8,near=hM==='inf'?Hft:Hft/2;
 function X(ft){return 40+Math.min(ft/40,1)*360;}
 var s='<rect width="460" height="170" fill="#fff"/><rect x="'+X(near).toFixed(1)+'" y="60" width="'+(430-X(near)).toFixed(1)+'" height="40" rx="8" fill="#E1F4EE" stroke="#1F8A70"/><line x1="40" y1="80" x2="440" y2="80" stroke="#15131C" stroke-width="2"/>';
 s+='<rect x="14" y="68" width="22" height="24" rx="4" fill="#15131C"/>'+T(25,112,'camera',{s:11});
 for(var ft=0;ft<=40;ft+=10)s+='<line x1="'+X(ft)+'" y1="98" x2="'+X(ft)+'" y2="106" stroke="#5E5A6B"/>'+T(X(ft),122,ft+' ft',{s:10,w:600,c:'#5E5A6B'});
 s+=T(445,85,'∞',{s:20,a:'end'});var fx=hM==='inf'?440:X(Hft);s+='<path d="M'+fx+' 52 l-7 -12 h14z" fill="#E0473C"/>'+T(fx,32,'focus',{s:11,c:'#E0473C'});
 s+=T(X(near),148,'sharp from '+near.toFixed(1)+' ft',{s:12,c:'#1F8A70'});hf.innerHTML=s;
 document.getElementById('hfcap').innerHTML='50 mm at f/'+hN+': hyperfocal distance ≈ <b>'+Hft.toFixed(1)+' ft</b>. '+(hM==='inf'?'Focused at ∞, everything from '+Hft.toFixed(1)+' ft to ∞ is sharp.':'Focused at '+Hft.toFixed(1)+' ft, everything from half that, <b>'+(Hft/2).toFixed(1)+' ft</b>, to ∞ is sharp.');}
 segPick('hfm',function(b){hM=b.dataset.m;drawH();});segPick('hfn',function(b){hN=+b.dataset.n;drawH();});drawH();}
})();

}catch(e){console.warn("[lec] Oct 23 · aberrations & depth of field #48:",e.message);}
try{
/* ===== Oct 26 · autofocus & perspective ===== */
}catch(e){console.warn("[lec] Oct 26 · autofocus & perspective #49:",e.message);}
try{
(function(){
function T(x,y,t,o){o=o||{};return '<text x="'+x+'" y="'+y+'" text-anchor="'+(o.a||'middle')+'" style="font:'+(o.w||700)+' '+(o.s||15)+'px Inter,sans-serif" fill="'+(o.c||'#15131C')+'">'+t+'</text>';}
var af=document.getElementById('afsvg');if(!af)return;
var PK=0.62,timer=null,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function C(x){return Math.exp(-Math.pow((x-PK)/0.13,2));}
function drawAF(pos,trail,label){var X=function(x){return 40+x*380;},Y=function(c){return 150-c*120;};
 var s='<rect width="460" height="190" fill="#fff"/><line x1="40" y1="150" x2="420" y2="150" stroke="#15131C"/><line x1="40" y1="20" x2="40" y2="150" stroke="#15131C"/>';
 var p=[];for(var i=0;i<=100;i++){var x=i/100;p.push(X(x).toFixed(1)+','+Y(C(x)).toFixed(1));}
 s+='<polyline points="'+p.join(' ')+'" fill="none" stroke="#6D4AD9" stroke-width="3"/>';
 (trail||[]).forEach(function(x){s+='<circle cx="'+X(x)+'" cy="'+Y(C(x))+'" r="4" fill="#D9822B" fill-opacity=".6"/>';});
 s+='<line x1="'+X(pos)+'" y1="20" x2="'+X(pos)+'" y2="150" stroke="#D9822B" stroke-dasharray="4 4"/><circle cx="'+X(pos)+'" cy="'+Y(C(pos))+'" r="7" fill="#D9822B"/>';
 s+=T(230,175,'lens position →',{s:13,c:'#5E5A6B'})+T(28,90,'contrast',{s:13,c:'#5E5A6B'}).replace('<text','<text transform="rotate(-90 28 90)"');
 af.innerHTML=s;if(label)document.getElementById('afcap').innerHTML=label;}
function run(kind){clearInterval(timer);if(kind==='p'){var steps=[0.08,0.6,PK],k=0,tr=[];timer=setInterval(function(){tr.push(steps[k]);drawAF(steps[k],tr,k===0?'Phase detection measures the distance…':k===1?'…jumps the lens there…':'<b>…and fine-tunes. In focus in 2 moves. Fast.</b>');k++;if(k>=steps.length)clearInterval(timer);},RM?0:450);return;}
 var x=0.05,tr=[],best=0,bx=0,phase=0;timer=setInterval(function(){tr.push(x);var c=C(x);if(c>best){best=c;bx=x;}drawAF(x,tr,'Contrast detection: moving through focus and measuring contrast…');
  if(phase===0){x+=0.05;if(x>0.95){phase=1;}}else{clearInterval(timer);drawAF(bx,tr,'<b>Back to the contrast peak: in focus.</b> It had to scan past the peak to find it, so it\'s slower.');}},RM?0:120);}
document.getElementById('afc').onclick=function(){run('c');};document.getElementById('afp').onclick=function(){run('p');};
drawAF(PK,[],'Contrast is highest at perfect focus.');

/* linear perspective */
var vpx=document.getElementById('vpx'),hz=document.getElementById('hz'),lp=document.getElementById('lpsvg'),ort=true;
function drawLP(){var vx=+vpx.value,hy=+hz.value,s='<rect width="460" height="230" fill="#fff"/>';
 s+='<line x1="0" y1="'+hy+'" x2="460" y2="'+hy+'" stroke="#3F6CC9" stroke-width="2"/>'+T(10,hy-6,'horizon line',{s:12,a:'start',c:'#3F6CC9'});
 function toward(x,y,t){return [x+(vx-x)*t,y+(hy-y)*t];}
 [[20,40,130,220],[330,40,440,220]].forEach(function(b,bi){var x0=b[0],y0=b[1],x1=b[2],y1=b[3],t=0.55;var inner=bi===0?x1:x0;
  var pts=[[inner,y0],[inner,y1]];var far=pts.map(function(p){return toward(p[0],p[1],t);});
  if(ort){[[inner,y0],[inner,y1],[bi===0?x0:x1,y0]].forEach(function(p){s+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+vx+'" y2="'+hy+'" stroke="#E0473C" stroke-dasharray="4 4"/>';});}
  s+='<rect x="'+x0+'" y="'+y0+'" width="'+(x1-x0)+'" height="'+(y1-y0)+'" fill="#EFEAFD" stroke="#6D4AD9" stroke-width="2"/>';
  s+='<polygon points="'+inner+','+y0+' '+far[0][0].toFixed(1)+','+far[0][1].toFixed(1)+' '+far[1][0].toFixed(1)+','+far[1][1].toFixed(1)+' '+inner+','+y1+'" fill="#DCD3FA" stroke="#6D4AD9" stroke-width="2"/>';
  for(var k=1;k<=3;k++){var tt=k*0.13,a=toward(inner,y0+30,tt),c=toward(inner,y0+60,tt);s+='<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+c[0].toFixed(1)+'" y2="'+c[1].toFixed(1)+'" stroke="#6D4AD9" stroke-width="3"/>';}});
 s+='<circle cx="'+vx+'" cy="'+hy+'" r="6" fill="#3F6CC9"/>'+T(vx,hy+22,'vanishing point',{s:12,c:'#3F6CC9'});
 lp.innerHTML=s;}
vpx.addEventListener('input',drawLP);hz.addEventListener('input',drawLP);
document.getElementById('orth').onclick=function(){ort=!ort;this.textContent=ort?'Hide orthogonal lines':'Show orthogonal lines';this.setAttribute('aria-pressed',ort);drawLP();};drawLP();

/* boots */
var bF=50,bd=document.getElementById('bd'),bs=document.getElementById('bsvg');
function boot(x,base,h,c){var w=h*0.7;return '<path d="M'+(x)+' '+(base-h)+' h'+(w*0.45)+' v'+(h*0.62)+' q'+(w*0.1)+' '+(h*0.18)+' '+(w*0.55)+' '+(h*0.22)+' v'+(h*0.16)+' h-'+(w)+' z" fill="'+c+'" stroke="#5a3b1f" stroke-width="1.5"/>';}
function drawB(){var u=+bd.value,s1=0.75*(bF/50)*(10/u),s2=s1/2,px=60;
 var s='<rect width="460" height="200" fill="#fff"/><line x1="10" y1="170" x2="450" y2="170" stroke="#C9C4D8" stroke-width="2"/>';
 var h1=Math.min(150,s1*px),h2=Math.min(150,s2*px);
 s+=boot(110,170,h1,'#A0703F')+boot(300,170,h2,'#A0703F');
 s+=T(130,190,u+' ft · '+(Math.round(s1*1000)/1000)+' in',{s:13})+T(315,190,(2*u)+' ft · '+(Math.round(s2*1000)/1000)+' in',{s:13});
 bs.innerHTML=s;document.getElementById('bdv').textContent=u+' ft';
 document.getElementById('bcap').innerHTML='At '+bF+' mm the near boot images at <b>'+(Math.round(s1*1000)/1000)+' in</b> and the far one at <b>'+(Math.round(s2*1000)/1000)+' in</b>: still exactly <b>2:1</b>. Change the focal length and both change together; change the distance and the sizes change inversely.';}
document.querySelectorAll('#bf button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#bf button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});bF=+b.dataset.f;drawB();});});
bd.addEventListener('input',drawB);drawB();
})();

}catch(e){console.warn("[lec] Oct 26 · autofocus & perspective #50:",e.message);}
try{
/* ===== crop factor & diopters (Oct 19) ===== */
}catch(e){console.warn("[lec] crop factor & diopters (Oct 19) #51:",e.message);}
try{
(function(){var cw=document.getElementById('cw'),ch=document.getElementById('ch'),cf=document.getElementById('cf'),o=document.getElementById('csteps');if(!cw)return;
function r1(n){return Math.round(n*10)/10;}
function calc(){var w=+cw.value,h=+ch.value,f=+cf.value;if(!(w>0&&h>0&&f>0)){o.innerHTML='<li>Enter values above 0</li>';return;}var d=Math.sqrt(w*w+h*h),c=43.3/d,aov=2*Math.atan(d/(2*f))*180/Math.PI;
 o.innerHTML='<li>diagonal = √('+w+'² + '+h+'²) = '+r1(d)+' mm</li><li>crop = 43.3 ÷ '+r1(d)+' = '+(Math.round(c*100)/100)+'×</li><li>normal lens ≈ the diagonal ≈ '+Math.round(d)+' mm'+(c>0.95&&c<1.05?' (for full frame, class rounds this to 50 mm)':'')+'</li><li class="last">'+f+' mm acts like '+Math.round(f*c)+' mm on full frame · '+r1(aov)+'° diagonal</li>';}
[cw,ch,cf].forEach(function(e){e.addEventListener('input',calc);});
document.querySelectorAll('#n1 .btn[data-s]').forEach(function(b){b.addEventListener('click',function(){var v=b.dataset.s.split(',');cw.value=v[0];ch.value=v[1];calc();});});calc();
var sel={1:false,2:true,4:false},db=document.getElementById('dbtns'),dout=document.getElementById('dout');
function dr(){var D=0;Object.keys(sel).forEach(function(k){if(sel[k])D+=+k;});var parts=Object.keys(sel).filter(function(k){return sel[k];}).map(function(k){return '+'+k;});
 dout.innerHTML=D?('D = '+parts.join(' ')+' = <b>'+D+' diopters</b> → f = 1/'+D+' m = <b>'+Math.round(1000/D)+' mm</b>'):'Tap a lens to add it';
 db.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',sel[b.dataset.d]?'true':'false');b.style.background=sel[b.dataset.d]?'var(--accent)':'';b.style.color=sel[b.dataset.d]?'#fff':'';});}
[1,2,4].forEach(function(k){var b=document.createElement('button');b.type='button';b.className='btn';b.dataset.d=k;b.textContent='+'+k+' diopter';b.addEventListener('click',function(){sel[k]=!sel[k];dr();});db.appendChild(b);});dr();})();

}catch(e){console.warn("[lec] crop factor & diopters (Oct 19) #52:",e.message);}
try{
/* ===== bytes ===== */
}catch(e){console.warn("[lec] bytes #53:",e.message);}
try{
var tb=document.getElementById('tb');function tbf(){var n=+tb.value;document.getElementById('tbv').textContent=n;var bytes=n*1e12,gib=bytes/Math.pow(1024,3);document.getElementById('tbout').textContent=n+' TB = '+(n*1e12).toLocaleString()+' bytes → shows as ≈ '+Math.round(gib).toLocaleString()+' GB on a computer that counts in 1,024s';}tb.addEventListener('input',tbf);tbf();

}catch(e){console.warn("[lec] bytes #54:",e.message);}
try{
/* ===== raster vs vector ===== */
}catch(e){console.warn("[lec] raster vs vector #55:",e.message);}
try{
var rc=document.getElementById('rast'),rx=rc.getContext('2d'),small=document.createElement('canvas');small.width=small.height=24;var sx=small.getContext('2d');sx.fillStyle='#fff';sx.fillRect(0,0,24,24);sx.fillStyle='#6D4AD9';sx.font='900 18px Arial';sx.textAlign='center';sx.fillText('A',12,19);
}catch(e){console.warn("[lec] raster vs vector #56:",e.message);}
try{
function zoomf(){var z=+document.getElementById('zoom').value;document.getElementById('zv').textContent=z;rx.imageSmoothingEnabled=false;rx.fillStyle='#fff';rx.fillRect(0,0,200,200);var s=200*z/24*24/24;var w=24*(200/24)*z;rx.drawImage(small,100-w/2,100-w/2-(z-1)*10,w,w);
 document.getElementById('vg').setAttribute('transform','translate(100 '+(100-(z-1)*10*0)+') scale('+z+') translate(-100 -100)');}
}catch(e){console.warn("[lec] raster vs vector #57:",e.message);}
try{
document.getElementById('zoom').addEventListener('input',zoomf);zoomf();

}catch(e){console.warn("[lec] raster vs vector #58:",e.message);}
try{
/* ===== bit depth ===== */
}catch(e){console.warn("[lec] bit depth #59:",e.message);}
try{
var bs=document.getElementById('bits'),bc=document.getElementById('bitc'),bx=bc.getContext('2d');
}catch(e){console.warn("[lec] bit depth #60:",e.message);}
try{
function bitf(){var b=+bs.value,L=Math.pow(2,b);document.getElementById('bv').textContent=b;document.getElementById('blv').textContent=L.toLocaleString();document.getElementById('brange').textContent='(values 0–'+(L-1).toLocaleString()+')';
 for(var x=0;x<480;x++){var t=x/479,q=Math.round(t*(L-1))/(L-1),v=Math.round(q*255);bx.fillStyle='rgb('+v+','+v+','+v+')';bx.fillRect(x,0,1,70);}
 document.getElementById('bcap').textContent=b<=5?'Only '+L+' levels: you can see the steps (posterization / banding).':(b<=8?'Looks smooth to the eye. 8 bits is enough for printing and viewing.':'Your screen can’t show more than about 8 bits, but the extra levels give room for editing.');}
}catch(e){console.warn("[lec] bit depth #61:",e.message);}
try{
bs.addEventListener('input',bitf);bitf();

}catch(e){console.warn("[lec] bit depth #62:",e.message);}
try{
/* ===== chains ===== */
}catch(e){console.warn("[lec] chains #63:",e.message);}
try{
function chain(id,arr){document.getElementById(id).innerHTML=arr.map(function(a,i){return (i?'<i>→</i>':'')+'<span'+(a[0]==='*'?' class="alt"':'')+'>'+a.replace('*','')+'</span>';}).join('');}
}catch(e){console.warn("[lec] chains #64:",e.message);}
try{
chain('chain',['Photons','Sensor','Analog signal','Gain / analog processing','A to D conversion','Digital sensor data','Raw file','*Image processing: demosaic · white balance · color · noise reduction · tone mapping · sharpening','Rendered image','File encoding','*Compression','Output']);
}catch(e){console.warn("[lec] chains #65:",e.message);}
try{
chain('adchain',['Photons','Photosite charge','Voltage (analog)','A/D converter','Digital count','Pixel']);
}catch(e){console.warn("[lec] chains #66:",e.message);}
try{
(function(){var q=document.getElementById('qe');if(!q)return;q.innerHTML=[['CCD',90,'#6D4AD9'],['Human eye',15,'#1F8A70'],['Film',5,'#D9822B']].map(function(r){return '<div class="qerow"><span>'+r[0]+'</span><div class="qetrack"><i style="width:'+r[1]+'%;background:'+r[2]+'"></i></div><b>≈ '+r[1]+'%</b></div>';}).join('');})();
}catch(e){console.warn("[lec] chains #67:",e.message);}
try{
chain('jchain',['RGB','YCbCr','Chroma subsampling','8 × 8 blocks','Quantization','Entropy coding','JPEG']);
}catch(e){console.warn("[lec] chains #68:",e.message);}
try{
document.getElementById('rle').innerHTML='RRRRBBBBBBBGG'.split('').map(function(c){return '<b style="background:'+({R:'#E0473C',B:'#3F6CC9',G:'#3FA34D'})[c]+'"></b>';}).join('')+'<span class="note" style="width:100%">13 pixels → "R4 B7 G2"</span>';

}catch(e){console.warn("[lec] chains #69:",e.message);}
try{
/* ===== JPEG demo (real browser JPEG encoder) ===== */
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #70:",e.message);}
try{
var js=document.getElementById('jsrc'),jsx=js.getContext('2d'),jo=document.getElementById('jout'),jox=jo.getContext('2d'),gen=1,cur=null;
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #71:",e.message);}
try{
(function(){var im=jsx.createImageData(96,96);for(var y=0;y<96;y++)for(var x=0;x<96;x++){var k=(y*96+x)*4,r,g,b;var t=x/95;r=Math.round(40+180*t);g=Math.round(90+60*Math.sin(y/9));b=Math.round(200-150*t);
 if((x-48)*(x-48)+(y-30)*(y-30)<200){r=245;g=200;b=40;} if(y>60&&((x+y)%6<3)){r=30;g=30;b=40;} if(y>60&&((x+y)%6>=3)){r=235;g=235;b=235;} if(x>66&&x<90&&y>8&&y<22){r=200;g=40;b=60;}
 im.data[k]=r;im.data[k+1]=g;im.data[k+2]=b;im.data[k+3]=255;}jsx.putImageData(im,0,0);})();
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #72:",e.message);}
try{
function encode(srcCanvas,q,cb){var url=srcCanvas.toDataURL('image/jpeg',q/100);var img=new Image();img.onload=function(){cb(img,Math.round((url.length-23)*3/4));};img.src=url;}
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #73:",e.message);}
try{
function jrun(reset){var q=+document.getElementById('jq').value;document.getElementById('jqv').textContent=q;if(reset){gen=1;cur=js;}
 encode(cur||js,q,function(img,bytes){jox.drawImage(img,0,0);var tmp=document.createElement('canvas');tmp.width=tmp.height=96;tmp.getContext('2d').drawImage(img,0,0);cur=tmp;document.getElementById('jgv').textContent=gen;
  document.getElementById('jcap').innerHTML='JPEG q'+q+' · ≈ '+(bytes/1024).toFixed(1)+' KB (original ≈ 27 KB uncompressed)'+(gen>1?' · after '+gen+' saves':'');});}
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #74:",e.message);}
try{
document.getElementById('jq').addEventListener('input',function(){jrun(true);});
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #75:",e.message);}
try{
document.getElementById('jresave').addEventListener('click',function(){gen++;jrun(false);});
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #76:",e.message);}
try{
document.getElementById('jreset').addEventListener('click',function(){document.getElementById('jq').value=50;jrun(true);});
}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #77:",e.message);}
try{
jrun(true);

}catch(e){console.warn("[lec] JPEG demo (real browser JPEG encoder) #78:",e.message);}
try{
/* ===== lens calculator ===== */
}catch(e){console.warn("[lec] lens calculator #79:",e.message);}
try{
function fmt(n){return (Math.round(n*10)/10).toLocaleString();}
}catch(e){console.warn("[lec] lens calculator #80:",e.message);}
try{
function lens(){var f=+document.getElementById('lf').value,R=+document.getElementById('lr').value,o=document.getElementById('lsteps');if(!(f>0&&R>0)){o.innerHTML='<li>Enter f and R above 0</li>';return;}
 var v=f*(R+1),u=v/R;o.innerHTML='<li>v = f (R + 1) = '+f+' × ('+R+' + 1)</li><li>v = '+fmt(v)+' mm</li><li>R = v / u → u = v / R = '+fmt(v)+' / '+R+'</li><li class="last">u = '+fmt(u)+' mm · v = '+fmt(v)+' mm'+(R===1?' (1:1 → u = v = 2f)':'')+'</li>';}
}catch(e){console.warn("[lec] lens calculator #81:",e.message);}
try{
['lf','lr'].forEach(function(i){document.getElementById(i).addEventListener('input',lens);});lens();
}catch(e){console.warn("[lec] lens calculator #82:",e.message);}
try{
function ff(){var u=+document.getElementById('fu').value,v=+document.getElementById('fv').value,o=document.getElementById('fout');if(!(u>0&&v>0)){o.textContent='Enter u and v above 0';return;}var inv=1/u+1/v;o.textContent='1/'+u+' + 1/'+v+' = '+inv.toFixed(4)+' → press 1/x → f = '+fmt(1/inv)+' mm · R = v/u = '+fmt(v/u);}
}catch(e){console.warn("[lec] lens calculator #83:",e.message);}
try{
['fu','fv'].forEach(function(i){document.getElementById(i).addEventListener('input',ff);});ff();

}catch(e){console.warn("[lec] lens calculator #84:",e.message);}
try{
/* ===== angle of view ===== */
}catch(e){console.warn("[lec] angle of view #85:",e.message);}
try{
var ac=document.getElementById('aov'),ax=ac.getContext('2d');
}catch(e){console.warn("[lec] angle of view #86:",e.message);}
try{
function aovf(){var f=+document.getElementById('fl').value,d=+document.getElementById('sens').value;document.getElementById('flv').textContent=f;var a=2*Math.atan(d/(2*f));var deg=a*180/Math.PI;
 ax.clearRect(0,0,460,190);var cx=30,cy=95,L=420,h=Math.min(90,Math.tan(a/2)*L);ax.fillStyle='rgba(109,74,217,.18)';ax.beginPath();ax.moveTo(cx,cy);ax.lineTo(cx+L,cy-h);ax.lineTo(cx+L,cy+h);ax.closePath();ax.fill();ax.strokeStyle='#6D4AD9';ax.lineWidth=2;ax.stroke();
 ax.fillStyle='#15131C';ax.fillRect(cx-18,cy-12,18,24);ax.font='800 16px Inter,sans-serif';ax.fillText(deg.toFixed(1)+'°',cx+40,cy+6);
 var crop=(43.27/d);document.getElementById('aovcap').textContent=f+' mm on '+(crop>1.05?'a '+crop.toFixed(1)+'× crop sensor (looks like '+Math.round(f*crop)+' mm on full frame)':'full frame')+' → '+deg.toFixed(1)+'° diagonal'+(deg>60?' · wide angle':deg<25?' · telephoto':' · normal-ish');}
}catch(e){console.warn("[lec] angle of view #87:",e.message);}
try{
document.getElementById('fl').addEventListener('input',aovf);document.getElementById('sens').addEventListener('change',aovf);aovf();


}catch(e){console.warn("[lec] angle of view #88:",e.message);}
try{
/* ===== extra visuals (slide pass) ===== */
}catch(e){console.warn("[lec] extra visuals (slide pass) #89:",e.message);}
try{
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function seg(id,cb){var g=document.getElementById(id);if(!g)return;g.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){g.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});cb(b.dataset.v);});});}
/* bitonal H */
(function(){var svg=document.getElementById('bitonal');if(!svg)return;var H=['11111111111','10001110001','11011111011','11011111011','11011111011','11000000011','11011111011','11011111011','11011111011','10001110001','11111111111'];
 function draw(mode){var s='';for(var y=0;y<11;y++)for(var x=0;x<11;x++){var v=H[y][x];s+='<rect x="'+(x*30)+'" y="'+(y*30)+'" width="30" height="30" fill="'+(mode==='num'?'#fff':(v==='1'?'#fff':'#15131C'))+'" stroke="#C9C3DA"/>';if(mode==='num')s+='<text x="'+(x*30+15)+'" y="'+(y*30+20)+'" text-anchor="middle" font-size="14" font-weight="800" fill="'+(v==='1'?'#9A95A8':'#15131C')+'">'+v+'</text>';}svg.innerHTML=s;}
 draw('img');seg('btv',draw);})();
/* bits bar chart */
(function(){var c=document.getElementById('bitbars');if(!c)return;var x=c.getContext('2d'),W=560,H=260,L=72,B=215,T=24,bw=(W-L-10)/16;
 x.font='16px Inter,sans-serif';x.fillStyle='#5E5A6B';x.strokeStyle='#E2DEEE';
 [0,20000,40000,60000].forEach(function(v){var y=B-(v/65536)*(B-T);x.beginPath();x.moveTo(L,y);x.lineTo(W-10,y);x.stroke();x.textAlign='right';x.fillText(v.toLocaleString(),L-6,y+4);});
 for(var b=1;b<=16;b++){var v=Math.pow(2,b),h=Math.max(1,(v/65536)*(B-T)),X=L+(b-1)*bw+3;x.fillStyle=b===8?'#D9822B':(b===16?'#6D4AD9':'#9C8BE0');x.fillRect(X,B-h,bw-6,h);x.fillStyle='#5E5A6B';x.textAlign='center';x.fillText(b,X+(bw-6)/2,B+16);}
 x.fillStyle='#15131C';x.font='800 17px Inter,sans-serif';x.textAlign='center';x.fillText('number of bits',L+(W-L)/2,B+32);
 x.fillStyle='#D9822B';x.fillText('8 bits = 256',L+7.5*bw,B-30);x.fillStyle='#6D4AD9';x.textAlign='right';x.fillText('16 bits = 65,536',W-14,T+10);})();
/* low vs high frequency */
(function(){var a=document.getElementById('lfa'),cc=document.getElementById('lfc'),s=document.getElementById('lfb');if(!a)return;var W=160,H=110,wall=[],grass=[],sd=3;function r(){sd=(sd*9301+49297)%233280;return sd/233280;}
 for(var y=0;y<H;y++)for(var x=0;x<W;x++){var d=Math.hypot(x-40,y-20);wall.push(Math.max(0,Math.min(1,0.95-d/190)));var g=0.45+0.25*Math.sin(x*1.7+Math.sin(y*0.9)*2)+0.3*(r()-0.5)+0.15*Math.sin(y*0.6);grass.push(Math.max(0,Math.min(1,g)));}
 function q(cv,data,L,tint){var ctx=cv.getContext('2d'),im=ctx.createImageData(W,H);for(var i=0;i<data.length;i++){var v=Math.round(data[i]*(L-1))/(L-1);im.data[i*4]=Math.round(v*tint[0]);im.data[i*4+1]=Math.round(v*tint[1]);im.data[i*4+2]=Math.round(v*tint[2]);im.data[i*4+3]=255;}ctx.putImageData(im,0,0);}
 function draw(){var b=+s.value,L=Math.pow(2,b);document.getElementById('lfbv').textContent=b;document.getElementById('lfbl').textContent=L;q(a,wall,L,[250,244,236]);q(cc,grass,L,[150,215,120]);}
 s.addEventListener('input',draw);draw();})();
/* readout race */
(function(){var c=document.getElementById('readout');if(!c)return;var x=c.getContext('2d'),N=4,cap=document.getElementById('rdcap'),grid,out,ticks,timer=null,mode='';
 function reset(){grid=[];for(var r=0;r<N;r++){grid.push([]);for(var k=0;k<N;k++)grid[r].push(30+Math.round(Math.random()*200));}out=[];ticks=0;mode='';draw();cap.textContent='Each square is one photosite’s charge. Press a button.';}
 function draw(){x.clearRect(0,0,560,250);var S=40,X0=40,Y0=20;for(var r=0;r<N;r++)for(var k=0;k<N;k++){var v=grid[r][k];x.fillStyle=v==null?'#F4F5F7':'rgb('+v+','+v+','+(v+20>255?255:v+20)+')';x.fillRect(X0+k*S,Y0+r*S,S-4,S-4);}
  x.strokeStyle='#D9822B';x.lineWidth=2;x.strokeRect(X0-4,Y0+(N-1)*S-4,N*S+4,S+4);x.fillStyle='#D9822B';x.font='15px Inter,sans-serif';x.fillText(mode==='ccd'?'readout row':'',X0,Y0+N*S+14);
  x.fillStyle='#6D4AD9';x.fillRect(260,Y0+(N-1)*S,70,S-4);x.fillStyle='#fff';x.font='800 18px Inter,sans-serif';x.fillText('A/D',278,Y0+(N-1)*S+23);
  x.fillStyle='#15131C';x.font='800 19px Inter,sans-serif';x.fillText('Read: '+out.length+' / 16',350,40);x.fillText('Steps: '+ticks,350,68);
  out.slice(-16).forEach(function(v,i){x.fillStyle='rgb('+v+','+v+','+v+')';x.fillRect(350+(i%8)*24,90+Math.floor(i/8)*24,20,20);});}
 function stop(){if(timer){clearInterval(timer);timer=null;}}
 function ccdTick(){var bottom=grid[N-1],has=bottom.some(function(v){return v!=null;});
  if(has){var v=bottom.pop();bottom.unshift(null);if(v!=null)out.push(v);}
  else{var any=false;for(var r=0;r<N-1;r++)for(var k=0;k<N;k++)if(grid[r][k]!=null)any=true;
   if(!any){stop();cap.innerHTML='<b>CCD finished in '+ticks+' steps.</b> Every row shifts down one at a time and each pixel goes through the same single A/D converter. That\u2019s uniform, but slow and power-hungry.';draw();return;}
   for(var r2=N-1;r2>0;r2--)grid[r2]=grid[r2-1].slice();grid[0]=[null,null,null,null];}
  ticks++;draw();}
 function readCCD(){stop();reset();mode='ccd';cap.textContent='CCD: shift the bottom row out one pixel at a time, then move every row down…';timer=setInterval(ccdTick,RM?40:220);}
 function readCMOS(){stop();reset();mode='cmos';ticks=1;for(var r=0;r<N;r++)for(var k=0;k<N;k++){out.push(grid[r][k]);grid[r][k]=null;}draw();cap.innerHTML='<b>CMOS finished in 1 step.</b> Every photosite has its own A/D converter, so all of them are read at once: fast, with low power.';}
 document.getElementById('rdccd').addEventListener('click',readCCD);document.getElementById('rdcmos').addEventListener('click',readCMOS);document.getElementById('rdreset').addEventListener('click',function(){stop();reset();});reset();})();
/* moon */
(function(){var s=document.getElementById('moon');if(!s)return;var Wd=180,rad=[];for(var y=0;y<Wd;y++)for(var x=0;x<Wd;x++){var d=Math.hypot(x-90,y-90),v=0;if(d<70){v=1.9;[[70,70,14],[110,95,18],[85,125,10],[118,60,8],[60,105,9]].forEach(function(c){var e=Math.hypot(x-c[0],y-c[1]);if(e<c[2])v-=0.7*(1-0.5*e/c[2]);});v*=1-0.15*(d/70);}rad.push(v);}
 function paint(id,raw,stops){var ctx=document.getElementById(id).getContext('2d'),im=ctx.createImageData(Wd,Wd),k=Math.pow(2,-stops);for(var i=0;i<rad.length;i++){var stored=raw?Math.min(4.0,rad[i]):Math.min(1,rad[i]);var v=Math.round(Math.min(1,stored*k)*255);if(raw&&stops===0)v=Math.round(Math.min(1,rad[i])*255);im.data[i*4]=v;im.data[i*4+1]=v;im.data[i*4+2]=Math.round(v*0.97);im.data[i*4+3]=255;}ctx.putImageData(im,0,0);}
 function draw(){var st=+s.value;document.getElementById('moonv').textContent=st;paint('moonj',false,st);paint('moonr',true,st);}s.addEventListener('input',draw);draw();})();
/* aliasing */
(function(){var c=document.getElementById('aliasc'),s=document.getElementById('alias');if(!c)return;var ctx=c.getContext('2d'),N=400,src=new Float32Array(N*N);for(var y=0;y<N;y++)for(var x=0;x<N;x++){var dx=x-N/2,dy=y-N/2;src[y*N+x]=0.5+0.5*Math.cos((dx*dx+dy*dy)*0.0105);}
 function draw(){var n=+s.value;document.getElementById('aliasv').textContent=n;var small=document.createElement('canvas');small.width=small.height=n;var sc=small.getContext('2d'),im=sc.createImageData(n,n);
  for(var y=0;y<n;y++)for(var x=0;x<n;x++){var sx=Math.floor((x+0.5)*N/n),sy=Math.floor((y+0.5)*N/n),v=Math.round(src[sy*N+sx]*255),i=(y*n+x)*4;im.data[i]=v;im.data[i+1]=v;im.data[i+2]=v;im.data[i+3]=255;}
  sc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(small,0,0,N,N);
  document.getElementById('aliascap').innerHTML=n>=360?'Enough samples: the rings look right.':'Under-sampled: <b>false rings (moiré)</b> appear in the corners that aren’t in the real pattern. That’s aliasing, a sampling problem, not only a JPEG problem.';}
 s.addEventListener('input',draw);draw();})();
/* pinhole */
(function(){var s=document.getElementById('ph'),svg=document.getElementById('phsvg');if(!s)return;var names=['tiny','small','medium','large','huge'];
 function draw(){var k=+s.value,hole=k*4,blur=k*1.6,bright=0.25+k*0.17;document.getElementById('phv').textContent=names[k-1];
  var g='<line x1="10" y1="110" x2="450" y2="110" stroke="#9A95A8" stroke-dasharray="4 4"/><path d="M70 110 V40" stroke="#6D4AD9" stroke-width="6"/><path d="M60 52 L70 34 L80 52" fill="#6D4AD9"/><text x="70" y="135" text-anchor="middle" font-size="11">object</text>';
  g+='<rect x="236" y="20" width="8" height="'+(90-hole/2)+'" fill="#15131C"/><rect x="236" y="'+(110+hole/2)+'" width="8" height="'+(90-hole/2)+'" fill="#15131C"/><text x="240" y="14" text-anchor="middle" font-size="11">pinhole</text>';
  g+='<path d="M70 40 L410 180 M70 110 L410 110" stroke="#E0A21E" stroke-width="'+(1+hole/3)+'" stroke-opacity=".55"/>';
  g+='<rect x="404" y="20" width="6" height="180" fill="#C9C3DA"/><g opacity="'+bright.toFixed(2)+'"><path d="M394 110 V176" stroke="#6D4AD9" stroke-width="'+(6+blur)+'" stroke-opacity="'+(1-k*0.12).toFixed(2)+'"/><path d="M384 166 L394 184 L404 166" fill="#6D4AD9"/></g><text x="454" y="197" text-anchor="end" font-size="11">upside-down image on the back</text>';
  g+='<path d="M70 150 H236" stroke="#15131C"/><text x="153" y="166" text-anchor="middle" font-size="11">object distance</text><path d="M244 195 H404" stroke="#15131C"/><text x="324" y="190" text-anchor="middle" font-size="11">image distance</text>';
  svg.innerHTML=g;document.getElementById('phcap').innerHTML=k<=2?'Small hole: <b>sharper but dim</b>, so you need a very long exposure.':(k===3?'Medium hole: a balance between sharpness and brightness.':'Big hole: <b>brighter but blurry</b>, because each point spreads into a big spot.')+' Either way, the image is <b>upside down</b>, and there’s only one sharp image distance for each hole size.';}
 s.addEventListener('input',draw);draw();})();
/* focal-length zoom */
(function(){var c=document.getElementById('zoomc'),s=document.getElementById('zf');if(!c)return;var ctx=c.getContext('2d'),base=document.createElement('canvas');base.width=1800;base.height=1200;var b=base.getContext('2d');
 var gr=b.createLinearGradient(0,0,0,700);gr.addColorStop(0,'#8EC1EE');gr.addColorStop(1,'#DCEBF6');b.fillStyle=gr;b.fillRect(0,0,1800,700);
 b.fillStyle='#9DB4C8';b.beginPath();b.moveTo(0,640);for(var x=0;x<=1800;x+=60)b.lineTo(x,600-40*Math.sin(x/170)-20*Math.sin(x/53));b.lineTo(1800,700);b.lineTo(0,700);b.fill();
 b.fillStyle='#5C8DB3';b.fillRect(0,690,1800,180);
 function ship(x,y,w,col){b.fillStyle=col;b.fillRect(x,y,w,w*0.16);b.fillStyle='#E9ECEF';b.fillRect(x+w*0.7,y-w*0.12,w*0.16,w*0.12);b.fillStyle='#2B2B30';b.fillRect(x+w*0.75,y-w*0.2,w*0.04,w*0.08);}
 ship(830,718,120,'#B23A3A');ship(990,722,90,'#3A3F55');ship(700,726,60,'#C4572B');
 b.fillStyle='#6DA34D';b.fillRect(0,860,1800,340);b.fillStyle='#4E7F38';for(var i=0;i<60;i++){b.fillRect(Math.random()*1800,880+Math.random()*300,4,14);}
 b.fillStyle='#8B8F96';b.fillRect(780,930,200,14);b.fillRect(800,944,10,30);b.fillRect(950,944,10,30);
 function tree(x,y,s){b.fillStyle='#5A3E25';b.fillRect(x-s*0.06,y-s*0.6,s*0.12,s*0.7);b.fillStyle='#2F6B32';[[0,-0.9,0.45],[-0.3,-0.7,0.35],[0.3,-0.7,0.35],[0,-1.2,0.32]].forEach(function(t){b.beginPath();b.arc(x+t[0]*s,y+t[1]*s,t[2]*s,0,7);b.fill();});}
 tree(120,1050,420);tree(1700,1080,460);tree(1420,880,220);tree(380,880,200);
 function draw(){var f=+s.value;document.getElementById('zfv').textContent=f;var a=2*Math.atan(43.3/(2*f))*180/Math.PI;document.getElementById('zfa').textContent='≈ '+a.toFixed(0)+'° view';
  var k=18/f,w=1800*k,h=1200*k,cx=900,cy=760;var sx=Math.max(0,Math.min(1800-w,cx-w/2)),sy=Math.max(0,Math.min(1200-h,cy-h/2));ctx.drawImage(base,sx,sy,w,h,0,0,600,400);
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(10,360,90,30);ctx.fillStyle='#fff';ctx.font='800 16px Inter,sans-serif';ctx.fillText(f+' mm',20,381);}
 s.addEventListener('input',draw);draw();})();
/* tilt-shift */
(function(){var svg=document.getElementById('tssvg');if(!svg)return;
 function draw(v){var shift=v==='1';var topW=shift?160:96,bw=160,cx=220;var g='<rect width="440" height="260" fill="#DCEBF6"/><rect y="220" width="440" height="40" fill="#8FA88A"/>';
  var tl=cx-topW/2,tr=cx+topW/2,bl=cx-bw/2,br=cx+bw/2;g+='<path d="M'+bl+' 222 L'+tl+' 28 L'+tr+' 28 L'+br+' 222Z" fill="#C9B79C" stroke="#7A6A55" stroke-width="2"/>';
  for(var r=0;r<7;r++){var t=0.1+r*0.125,y=222-(222-28)*t,lw=bw+(topW-bw)*t;for(var k=0;k<3;k++){var x=cx-lw/2+lw*(0.15+k*0.28),ww=lw*0.16;g+='<rect x="'+x.toFixed(1)+'" y="'+(y-14).toFixed(1)+'" width="'+ww.toFixed(1)+'" height="14" fill="#5C8DB3"/>';}}
  if(!shift){g+='<path d="M'+tl+' 28 L'+(cx-14)+' -120 M'+tr+' 28 L'+(cx+14)+' -120" stroke="#C0392B" stroke-width="2" stroke-dasharray="6 5"/><text x="220" y="250" text-anchor="middle" font-size="12" fill="#C0392B" font-weight="800">sides lean in (converge)</text>';}
  else g+='<text x="220" y="250" text-anchor="middle" font-size="12" fill="#1F8A70" font-weight="800">verticals stay parallel ✓</text>';
  svg.innerHTML=g;document.getElementById('tscap').innerHTML=shift?'Camera kept <b>level</b>, lens <b>shifted up</b>: the whole building fits and the verticals stay straight. Great for architecture and real estate.':'Tilting the camera up to fit the building makes the top look narrower and the bottom "fat" (keystone distortion).';}
 draw('0');seg('tsv',draw);})();
})();


}catch(e){console.warn("[lec] extra visuals (slide pass) #90:",e.message);}
})();
try{
(function(){
var W=[{f:50,d:5},{f:100,d:10},{f:200,d:20}],GAP=5,svg=document.getElementById('wbsvg');if(!svg)return;
function boot(x,base,h,col){var w=h*.62;return '<g fill="'+col+'"><rect x="'+(x-w*.32)+'" y="'+(base-h)+'" width="'+(w*.5)+'" height="'+(h*.85)+'" rx="'+(h*.06)+'"/><rect x="'+(x-w*.32)+'" y="'+(base-h*.28)+'" width="'+w+'" height="'+(h*.28)+'" rx="'+(h*.1)+'"/></g>';}
function draw(i){var s=W[i],near=120,far=near*s.d/(s.d+GAP),gap=170*(GAP/(s.d+GAP))*2;
 var x1=130,x2=Math.min(x1+40+gap*1.6,400),g='<line x1="10" y1="190" x2="450" y2="190" stroke="#9A95A8" stroke-dasharray="4 4"/>';
 g+=boot(x2,190-near*0.12,far,'#3F6CC9')+boot(x1,190,near,'#6D4AD9');
 g+='<text x="'+x1+'" y="205" text-anchor="middle" font-size="12" fill="#5E5A6B">near boot</text><text x="'+x2+'" y="205" text-anchor="middle" font-size="12" fill="#5E5A6B">far boot ('+GAP+' ft behind)</text>';
 svg.innerHTML=g;
 document.getElementById('wbcap').textContent=s.f+' mm from '+s.d+' ft: the far boot looks '+Math.round(100*s.d/(s.d+GAP))+'% as tall as the near one.';
 document.querySelectorAll('#wb button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.i==String(i));});}
document.querySelectorAll('#wb button').forEach(function(b){b.addEventListener('click',function(){draw(+b.dataset.i);});});draw(0);
var f=document.getElementById('vdf'),m=document.getElementById('vdm'),o=document.getElementById('vdo');
function vd(){var v=(+f.value)*(+m.value);o.textContent=v>0?('View from '+Math.round(v)+' mm ≈ '+(v/25.4).toFixed(1)+' in'):'Enter both numbers';}
f.addEventListener('input',vd);m.addEventListener('input',vd);vd();
})();
}catch(e){console.warn("[lec] extra 0:",e.message);}
(function(){
})();
try{
(function(){
var $=function(i){return document.getElementById(i);};
/* transmittance slider */
var tl=$('tdl');if(tl){var tf=function(){var t=+tl.value/100,o=1/t,d=Math.log10(o);$('tdv').textContent=tl.value;$('tdT').textContent=t.toFixed(2);$('tdO').textContent=o.toFixed(2);$('tdD').textContent=d.toFixed(2);$('tdS').textContent=(d/0.3).toFixed(1);};tl.addEventListener('input',tf);tf();}
/* kindergarten histogram */
var hs=$('hgsvg');if(hs){var C=['Red','Green','Blue','Yellow'],AM=[5,4,5,4],PM=[4,4,8,2],COL=['#E0473C','#3FA34D','#3F6CC9','#E0A21E'],mode='side';
 function hg(){var g='<line x1="50" y1="190" x2="450" y2="190" stroke="#9A95A8"/><line x1="50" y1="20" x2="50" y2="190" stroke="#9A95A8"/>',sc=12;
  for(var v=0;v<=14;v+=2)g+='<text x="42" y="'+(194-v*sc)+'" text-anchor="end" font-size="11" fill="#5E5A6B">'+v+'</text>';
  C.forEach(function(c,i){var x=75+i*95;
   if(mode==='side'){g+='<rect x="'+x+'" y="'+(190-AM[i]*sc)+'" width="30" height="'+AM[i]*sc+'" fill="#6D4AD9"/><rect x="'+(x+32)+'" y="'+(190-PM[i]*sc)+'" width="30" height="'+PM[i]*sc+'" fill="#3FA34D"/>';}
   else{g+='<rect x="'+(x+8)+'" y="'+(190-AM[i]*sc)+'" width="46" height="'+AM[i]*sc+'" fill="#6D4AD9"/><rect x="'+(x+8)+'" y="'+(190-(AM[i]+PM[i])*sc)+'" width="46" height="'+PM[i]*sc+'" fill="#3FA34D"/><text x="'+(x+31)+'" y="'+(184-(AM[i]+PM[i])*sc)+'" text-anchor="middle" font-size="12" font-weight="800" fill="#15131C">'+(AM[i]+PM[i])+'</text>';}
   g+='<text x="'+(x+31)+'" y="207" text-anchor="middle" font-size="12" font-weight="700" fill="'+COL[i]+'">'+c+'</text>';});
  g+='<rect x="300" y="14" width="12" height="12" fill="#6D4AD9"/><text x="317" y="25" font-size="12" fill="#15131C">Group 1 (morning)</text><rect x="300" y="32" width="12" height="12" fill="#3FA34D"/><text x="317" y="43" font-size="12" fill="#15131C">Group 2 (afternoon)</text>';
  hs.innerHTML=g;$('hgcap').textContent=mode==='side'?'Side by side: compare the two classes color by color.':'Stacked: the totals are your shopping list (9 · 8 · 13 · 6).';
  document.querySelectorAll('#hgseg button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===mode);});}
 document.querySelectorAll('#hgseg button').forEach(function(b){b.onclick=function(){mode=b.dataset.m;hg();};});hg();}
/* equivalent exposure calculator */
var I=['100','200','400','800','1600','3200','6400'],S=['1','1/2','1/4','1/8','1/15','1/30','1/60','1/125','1/250','1/500','1/1000'],F=['1.4','2','2.8','4','5.6','8','11','16','22','32'];
var L={I:I,S:S,F:F},NM={I:'ISO',S:'Shutter',F:'f-number'},SG={I:1,S:-1,F:-1};
function fill(el,arr,sel){el.innerHTML=arr.map(function(v,i){return '<option value="'+i+'"'+(i===sel?' selected':'')+'>'+(el.id==='eqF'||(el.id==='eqN'&&arr===F)?'f/':'')+v+'</option>';}).join('');}
if($('eqI')){fill($('eqI'),I,1);fill($('eqS'),S,7);fill($('eqF'),F,5);
 function base(k){return +$({I:'eqI',S:'eqS',F:'eqF'}[k]).value;}
 function opts(){var c=$('eqC').value;fill($('eqN'),L[c],base(c));$('eqK').innerHTML=['F','S','I'].filter(function(k){return k!==c;}).map(function(k){return '<option value="'+k+'">'+NM[k]+'</option>';}).join('');calc();}
 function calc(){var c=$('eqC').value,k=$('eqK').value,d=(+$('eqN').value-base(c))*SG[c],ni=base(k)-d*SG[k],o=$('eqO');
  if(!d){o.textContent='Pick a new value to see the equivalent exposure.';return;}
  var fmt=function(key,i){return key==='F'?'f/'+F[i]:key==='S'?S[i]+' s':'ISO '+I[i];};
  if(ni<0||ni>=L[k].length){o.textContent=NM[c]+' '+(d>0?'+':'')+d+' stops. '+NM[k]+' would need '+(-d>0?'+':'')+(-d)+' stops, which is off the scale. Compensate with the other setting.';return;}
  o.innerHTML=NM[c]+': <b>'+(d>0?'+':'')+d+'</b> · '+NM[k]+': <b>'+(-d>0?'+':'')+(-d)+'</b> → use <b>'+fmt(k,ni)+'</b>. Total = 0.';}
 ['eqI','eqS','eqF','eqC'].forEach(function(id){$(id).addEventListener('change',opts);});$('eqN').addEventListener('change',calc);$('eqK').addEventListener('change',calc);opts();}
})();
}catch(e){console.warn("[lec] extra 1:",e.message);}
(function(){
})();
try{
(function(){
var I=[[255,255,255,255,255,255,255],[255,255,255,255,255,255,255],[255,255,0,0,0,255,255],[255,255,255,0,255,255,255],[255,255,255,0,255,255,255],[255,255,255,0,255,255,255],[255,255,255,255,255,255,255]];
var K={blur:{v:[[1,1,1],[1,1,1],[1,1,1]].map(function(r){return r.map(function(){return 1/9;});}),t:['1/9','1/9','1/9','1/9','1/9','1/9','1/9','1/9','1/9']},sharp:{v:[[0,-1,0],[-1,5,-1],[0,-1,0]],t:['0','−1','0','−1','5','−1','0','−1','0']}};
var ki='blur',sel=[1,1],gi=document.getElementById('kimg'),gf=document.getElementById('kfil'),out=document.getElementById('kout');if(!gi)return;
function draw(){var h='';for(var r=0;r<7;r++)for(var c=0;c<7;c++){var v=I[r][c],inner=r>0&&r<6&&c>0&&c<6,on=r===sel[0]&&c===sel[1],nb=Math.abs(r-sel[0])<=1&&Math.abs(c-sel[1])<=1&&!on;
 h+='<button type="button" '+(inner?'':'disabled ')+'data-r="'+r+'" data-c="'+c+'" class="'+(on?'on':nb?'nb':'')+'" style="background:rgb('+v+','+v+','+v+');color:'+(v>128?'#15131C':'#fff')+(inner?'':';opacity:.55;cursor:not-allowed')+'" aria-label="Row '+r+' column '+c+', value '+v+'">'+v+'</button>';}
 gi.innerHTML=h;gf.innerHTML=K[ki].t.map(function(t){return '<span>'+t+'</span>';}).join('');
 var parts=[],sum=0,k=K[ki].v;for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){var f=k[a+1][b+1],p=I[sel[0]+a][sel[1]+b];sum+=f*p;parts.push(K[ki].t[(a+1)*3+b+1]+'×'+p);}
 var rd=Math.round(sum),cl=Math.max(0,Math.min(255,rd));
 out.innerHTML=parts.join(' + ')+'<br>= '+(Math.round(sum*100)/100)+' → round → <b>'+rd+'</b>'+(cl!==rd?' → clipped to <b>'+cl+'</b> (0–255)':'')+' (was '+I[sel[0]][sel[1]]+')';
 gi.querySelectorAll('button:not([disabled])').forEach(function(b){b.onclick=function(){sel=[+b.dataset.r,+b.dataset.c];draw();};});
 document.querySelectorAll('#kseg button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.k===ki);});}
document.querySelectorAll('#kseg button').forEach(function(b){b.onclick=function(){ki=b.dataset.k;draw();};});draw();
})();
}catch(e){console.warn("[lec] extra 2:",e.message);}
(function(){
})();
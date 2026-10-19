const iconPaths={necklace:'<path d="M6 3c0 9-2 17 6 18 8-1 6-9 6-18"/>',moon:'<path d="M20 13a8 8 0 0 1-9-9 8 8 0 1 0 9 9Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',undo:'<path d="m8 4-4 4 4 4M4 8h9a7 7 0 0 1 0 14"/>',redo:'<path d="m16 4 4 4-4 4m4-4h-9a7 7 0 0 0 0 14"/>',straight:'<path d="M3 12h18"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>',curved:'<path d="M3 6v4a9 9 0 0 0 18 0V6"/>',circular:'<circle cx="12" cy="12" r="8"/>',minus:'<path d="M5 12h14"/>',plus:'<path d="M5 12h14m-7-7v14"/>',fit:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',duplicate:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',left:'<path d="m10 5-7 7 7 7M3 12h18"/>',right:'<path d="m14 5 7 7-7 7M3 12h18"/>',delete:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',add:'<path d="M5 12h14m-7-7v14"/>',up:'<path d="m6 15 6-6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>'};
function uiIcon(name){return '<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[name]+'</svg>'}
const $=id=>document.getElementById(id),types=['Round','Cube','Alphabet','Heart','Star','Polygon','Oval','Rectangle'];
const paletteAddButton=$('addColor');
const defaults=['#43b864','#9261d7','#f8e6b5','#ea665e','#f2b829','#43b994','#ee70b7','#e9933e'];
let palettes=[
  {name:'Sunday morning',colors:['#43b864','#f2b829','#9261d7','#f8e6b5','#3c9ed8']},
  {name:'Poolside',colors:['#f5c52c','#329fdc','#f8ead1','#f07950']},
  {name:'Berry club',colors:['#9c315c','#ea83a6','#e9c95b','#5a9d61']}
,
  {name:'Monochrome',colors:['#ffffff','#dedede','#939393','#474747','#111111']},
  {name:'Electric pop',colors:['#ff2a55','#ffca00','#123cff','#00d5cb','#e800da','#ffffff']},
  {name:'Soft sorbet',colors:['#f8b9cd','#f7d4a3','#eadd98','#b6dbc8','#b4cced','#cdbcec']},
  {name:'Earth & clay',colors:['#a64f35','#c8875d','#dbc6a1','#748264','#3e5948','#faf5e8']},
  {name:'Ocean glass',colors:['#103f62','#007e9b','#23bbbd','#9dddd1','#e8f6ef']},
  {name:'Cherry soda',colors:['#991d36','#ed3458','#ffa4b3','#fff1e8','#3a1826']},
  {name:'Midnight jewels',colors:['#1f2767','#62419b','#087f71','#ab3478','#d7b55a','#ffffff']},
  {name:'Citrus garden',colors:['#f7c800','#ff7832','#a5cc3e','#338846','#fff8d9']}
];
const builtInPalettes=palettes.map(p=>({...p,colors:[...p.colors]}));
try{const saved=JSON.parse(localStorage.getItem('beads-palettes-v2')||'null');if(Array.isArray(saved)&&saved.length&&saved.every(p=>typeof p.name==='string'&&Array.isArray(p.colors)&&p.colors.length&&p.colors.every(c=>/^#[0-9a-fA-F]{6}$/.test(c))))palettes=saved;else{const old=JSON.parse(localStorage.getItem('beads-palettes')||'[]');if(Array.isArray(old))palettes.push(...old.filter(p=>typeof p.name==='string'&&Array.isArray(p.colors)&&p.colors.length&&p.colors.every(c=>/^#[0-9a-fA-F]{6}$/.test(c))))}}catch{}
for(const preset of builtInPalettes)if(!palettes.some(p=>p.name===preset.name))palettes.push(preset);
let palette=[...palettes[0].colors];
function persistPalettes(){try{localStorage.setItem('beads-palettes-v2',JSON.stringify(palettes))}catch{}}
function contrastText(color){const rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));const luminance=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;return luminance<.179?'#ffffff':'#000000'}
function updateTextContrast(b){if(b.autoTextColor!==false)b.textColor=contrastText(b.finish==='Steel'?'#c9d3d7':b.color)}
let nextId=1;const make=(type,color,letter='')=>({id:nextId++,type,color:color||defaults[types.indexOf(type)],size:8,space:0,letter,textColor:contrastText(color||defaults[types.indexOf(type)]),autoTextColor:true,finish:'Glossy',sides:6,width:type==='Oval'?12:type==='Rectangle'?13:8,height:type==='Oval'?8:type==='Rectangle'?7:8});
let state={beads:[],mode:'circular',gap:1,scale:1,showClasp:true,string:'#b9b9b9',bg:'#f2f2f2'},selected=null,history=[],future=[],activeColor=palette[0],activeType='Round',positions=[],view={zoom:1,x:0,y:0};
let selectedIds=new Set(),anchorId=null,darkMode=false;try{darkMode=localStorage.getItem('beads-dark-mode')==='true'}catch{}
['Round','Cube','Round','Oval','Round','Star','Round','Cube','Round'].forEach((t,i)=>state.beads.push(make(t,t==='Round'?palette[i%3]:null)));
'PIKO'.split('').forEach(l=>state.beads.push(make('Alphabet','#faf6ed',l)));
['Heart','Round','Cube','Round','Star','Round','Oval','Round','Cube','Round','Round'].forEach((t,i)=>state.beads.push(make(t,t==='Round'?palette[i%3]:null)));
selected=state.beads[10].id;selectedIds.add(selected);anchorId=selected;
const snapshot=()=>JSON.stringify({state,selected,anchorId,selection:[...selectedIds]});function restore(s){const entry=JSON.parse(s);state=entry.state;selected=entry.selected;anchorId=entry.anchorId;selectedIds=new Set(entry.selection);render()}function change(fn){history.push(snapshot());if(history.length>80)history.shift();future=[];fn();render()}function toast(s){$('toast').textContent=s;$('toast').classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('visible'),2400)}
function current(){return state.beads.find(b=>b.id===selected)}
function chosen(){return state.beads.filter(b=>selectedIds.has(b.id))}
function choose(id,shift=false,individual=false){
  if(id==null){if(!shift&&!individual){selectedIds.clear();selected=null;anchorId=null}}
  else if(shift){
    const a=state.beads.findIndex(b=>b.id===anchorId),z=state.beads.findIndex(b=>b.id===id);
    if(a<0){selectedIds=new Set([id]);anchorId=id}else selectedIds=new Set(state.beads.slice(Math.min(a,z),Math.max(a,z)+1).map(b=>b.id));
    selected=id;
  }else if(individual){
    if(selectedIds.has(id)){selectedIds.delete(id);selected=chosen().at(-1)?.id??null;if(anchorId===id)anchorId=selected}
    else{selectedIds.add(id);selected=id;anchorId=id}
  }else{selectedIds=new Set([id]);selected=id;anchorId=id}
  render()
}
function insertionIndex(){const index=state.beads.findIndex(b=>b.id===selected);return index<0?state.beads.length:index+1}
function add(beads,index=insertionIndex()){change(()=>{state.beads.splice(index,0,...beads);selectedIds=new Set(beads.map(b=>b.id));selected=beads.at(-1)?.id;anchorId=selected});}
function applyChosen(key,value){if(!selectedIds.size)return;change(()=>chosen().forEach(b=>{const previous=b.type;b[key]=value;if(key==='type'&&(value==='Oval'||value==='Rectangle')&&previous!=='Oval'&&previous!=='Rectangle'){b.width=value==='Oval'?12:13;b.height=value==='Oval'?8:7}if(key==='type'&&value==='Polygon'&&!b.sides)b.sides=6;if(key==='type'&&value==='Alphabet'&&!b.letter)b.letter='A';if(key==='textColor')b.autoTextColor=false;if(['color','type','finish'].includes(key))updateTextContrast(b)}))}
function duplicateChosen(){const originals=chosen();if(!originals.length)return;change(()=>{const copies=originals.map(b=>({...b,id:nextId++})),last=state.beads.indexOf(originals.at(-1));state.beads.splice(last+1,0,...copies);selectedIds=new Set(copies.map(b=>b.id));selected=copies.at(-1).id;anchorId=copies[0].id})}
function deleteChosen(){if(!selectedIds.size)return;change(()=>{const first=state.beads.findIndex(b=>selectedIds.has(b.id));state.beads=state.beads.filter(b=>!selectedIds.has(b.id));selected=state.beads[Math.min(first,state.beads.length-1)]?.id??null;selectedIds=new Set(selected==null?[]:[selected]);anchorId=selected})}
function setTheme(on){darkMode=on;if(on&&(state.bg==='#f2f2f2'||state.bg==='#ffffff'))state.bg='#161616';else if(!on&&state.bg==='#161616')state.bg='#f2f2f2';if(on&&state.string==='#b9b9b9')state.string='#777777';else if(!on&&state.string==='#777777')state.string='#b9b9b9';document.documentElement.classList.toggle('dark-theme',on);$('themeToggle').innerHTML=uiIcon(on?'sun':'moon');$('themeToggle').setAttribute('aria-label',on?'Switch to light mode':'Switch to dark mode');$('themeToggle').setAttribute('aria-pressed',String(on));try{localStorage.setItem('beads-dark-mode',String(on))}catch{};render()}

function bead(ctx,b,x,y,r,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);if(b.type==='Oval'||b.type==='Rectangle')ctx.scale((b.width||12)/8,(b.height||8)/8);ctx.beginPath();if(b.type==='Rectangle')ctx.roundRect(-r,-r,r*2,r*2,r*.25);else if(b.type==='Cube'||b.type==='Alphabet')ctx.roundRect(-r,-r,r*2,r*2,r*.28);else if(b.type==='Heart'){ctx.moveTo(0,r*.8);ctx.bezierCurveTo(-r*.18,r*.68,-r*.95,r*.2,-r*.95,-r*.36);ctx.bezierCurveTo(-r*.95,-r*.95,-r*.28,-r*1.04,0,-r*.48);ctx.bezierCurveTo(r*.28,-r*1.04,r*.95,-r*.95,r*.95,-r*.36);ctx.bezierCurveTo(r*.95,r*.2,r*.18,r*.68,0,r*.8);ctx.closePath()}else if(b.type==='Polygon'){let sides=Math.max(3,Math.min(12,Number(b.sides)||6));for(let i=0;i<sides;i++){let a=-Math.PI/2+i*Math.PI*2/sides;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath()}else if(b.type==='Star'){for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.5:r;ctx.lineTo(Math.cos(a)*k,Math.sin(a)*k)}ctx.closePath()}else ctx.arc(0,0,r,0,Math.PI*2);
const channels=b.color.slice(1).match(/../g).map(v=>parseInt(v,16)),whiteBead=b.finish!=='Steel'&&Math.min(...channels)>=235&&Math.max(...channels)-Math.min(...channels)<=18;
let g=ctx.createRadialGradient(-r*.35,-r*.4,r*.03,0,0,r*1.15);g.addColorStop(0,shade(b.color,24));g.addColorStop(.28,b.color);g.addColorStop(.72,whiteBead?shade(b.color,-8):b.color);g.addColorStop(1,shade(b.color,whiteBead?-42:-35));
const flatSteel=b.type==='Cube'||b.type==='Alphabet'||b.type==='Rectangle';
const steel=flatSteel?(b.type==='Rectangle'?ctx.createLinearGradient(-r,0,r,0):ctx.createLinearGradient(-r,-r,r,r)):ctx.createRadialGradient(-r*.34,-r*.42,r*.02,0,0,r*1.15);
const steelStops=flatSteel?[[0,'#737e85'],[.36,'#e8edef'],[.56,'#fafcfd'],[1,'#68757d']]:[[0,'#ffffff'],[.16,'#f9fcfd'],[.4,'#c9d3d7'],[.66,'#818e96'],[.83,'#e8eef0'],[1,'#48545d']];
steelStops.forEach(([stop,color])=>steel.addColorStop(stop,color));
ctx.shadowColor=whiteBead?'rgba(0,0,0,.14)':'#34382424';ctx.shadowBlur=r*(whiteBead?.34:.25);ctx.shadowOffsetY=r*(whiteBead?.14:.12);ctx.globalAlpha=b.finish==='Semi transparent'?.8:1;ctx.fillStyle=b.finish==='Steel'?steel:b.finish==='Matte'?b.color:g;ctx.fill();ctx.shadowColor='transparent';ctx.lineWidth=b.finish==='Steel'?Math.max(.45,r*.018):Math.max(.6,r*.025);ctx.strokeStyle=b.finish==='Steel'?steel:whiteBead?shade(b.color,-32):b.finish==='Semi transparent'?'#ffffffaa':shade(b.color,-18);ctx.stroke();ctx.globalAlpha=1;
if(b.finish==='Glossy'||b.finish==='Semi transparent'){
  ctx.save();ctx.clip();
  const shine=ctx.createRadialGradient(-r*.43,-r*.57,0,-r*.25,-r*.37,r*.95);
  shine.addColorStop(0,'rgba(255,255,255,.95)');shine.addColorStop(.22,'rgba(255,255,255,.65)');shine.addColorStop(.58,'rgba(255,255,255,.12)');shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=shine;ctx.fillRect(-r,-r,r*2,r*2);
  ctx.beginPath();ctx.ellipse(-r*.34,-r*.55,r*.42,r*.12,-.4,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.78)';ctx.fill();
  ctx.beginPath();ctx.ellipse(r*.48,r*.46,r*.25,r*.07,-.65,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.32)';ctx.fill();
  ctx.restore();
}
if(b.finish==='Steel'){ctx.save();ctx.clip();ctx.fillStyle='#ffffffaa';if(flatSteel){ctx.globalAlpha=.3;ctx.fillRect(-r*.92,-r*.92,r*1.84,r*.045)}else{ctx.beginPath();ctx.ellipse(-r*.35,-r*.54,r*.38,r*.1,-.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(r*.42,r*.42,r*.22,r*.07,-.5,0,Math.PI*2);ctx.fillStyle='#ffffff6b';ctx.fill()}ctx.restore()}
if(b.type==='Alphabet'){ctx.fillStyle=b.textColor||'#46443c';ctx.font=`600 ${r*1.22}px 'DM Sans',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.letter||'A',0,r*.05)}else{ctx.fillStyle='#6b655247';ctx.beginPath();ctx.ellipse(-r*.77,0,r*.075,r*.14,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(r*.77,0,r*.075,r*.14,0,0,7);ctx.fill()}if(b.finish==='Frosted'){ctx.fillStyle='#ffffff38';for(let i=0;i<24;i++){let a=i*2.4,k=Math.sqrt(i/24)*r*.75;ctx.fillRect(Math.cos(a)*k,Math.sin(a)*k,1,1)}}ctx.restore()}
function shade(hex,n){return '#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,parseInt(v,16)+n)).toString(16).padStart(2,'0')).join('')}
function thumb(b,size=48){const c=document.createElement('canvas');c.width=c.height=size*2;const factor=Math.max(1,(b.width||8)/8,(b.height||8)/8);bead(c.getContext('2d'),b,size,size,size*.57/factor);return c}
function beadWidth(b){return (b.type==='Oval'||b.type==='Rectangle')?(b.width||12)*b.size/8:b.size}
function beadHeight(b){return (b.type==='Oval'||b.type==='Rectangle')?(b.height||8)*b.size/8:b.size}
function layout(w,h,vertical=false){
  const bs=state.beads;if(!bs.length)return [];
  const ds=bs.map(b=>beadWidth(b)*state.scale),hs=bs.map(b=>beadHeight(b)*state.scale),gaps=bs.map(b=>state.gap+b.space);
  const total=ds.reduce((a,b)=>a+b,0)+gaps.reduce((a,b)=>a+b,0),claspLength=state.showClasp!==false?14*state.scale:0;
  const result=[],maxW=Math.max(...ds),maxH=Math.max(...hs);let cursor=0;
  if(state.mode==='straight'){
    const occupied=total+claspLength,k=Math.min(5.6,(w-90)/Math.max(occupied,1),(h-90)/maxH);
    bs.forEach((b,i)=>{cursor+=gaps[i]/2;result.push({x:w/2-occupied*k/2+(cursor+ds[i]/2)*k,y:h/2-15,r:b.size*state.scale*k/2,hitRadius:Math.max(ds[i],hs[i])*k/2,angle:0,id:b.id});cursor+=ds[i]+gaps[i]/2});
  }else if(state.mode==='necklace'){
    const samples=[{t:0,length:0}];let arcLength=0;for(let i=1;i<=360;i++){const t=i*Math.PI/360,previous=samples.at(-1).t;arcLength+=Math.hypot(Math.cos(t)-Math.cos(previous),2*(Math.sin(t)-Math.sin(previous)));samples.push({t,length:arcLength})}
    const rx=Math.max((total+claspLength)/arcLength,maxH*1.3,24),ry=rx*2,k=Math.min(5,(w-100)/(2*rx+maxW),(h-100)/(ry+maxH));
    bs.forEach((b,i)=>{cursor+=gaps[i]/2;const distance=(cursor+ds[i]/2)/(total+claspLength)*arcLength;const next=samples.findIndex(p=>p.length>=distance),end=samples[Math.max(1,next)],start=samples[Math.max(0,next-1)];const t=start.t+(end.t-start.t)*(distance-start.length)/(end.length-start.length);result.push({x:w/2-Math.cos(t)*rx*k,y:h/2-ry*k/2+Math.sin(t)*ry*k,r:b.size*state.scale*k/2,hitRadius:Math.max(ds[i],hs[i])*k/2,angle:b.type==='Alphabet'?0:Math.atan2(ry*Math.cos(t),rx*Math.sin(t)),id:b.id});cursor+=ds[i]+gaps[i]/2});
  }else{
    const circular=state.mode==='circular',wholeArc=circular?Math.PI*2:Math.PI*1.35;
    const radius=Math.max((total+(circular?claspLength:0))/wholeArc,maxH*1.3,24);
    const claspArc=circular?claspLength/radius:0,arc=wholeArc-claspArc;
    const k=Math.min(5,(w-95)/(2*radius+Math.max(maxW,maxH)),(h-125)/(2*radius+Math.max(maxW,maxH)));
    bs.forEach((b,i)=>{cursor+=gaps[i]/2;const a=(1-(cursor+ds[i]/2)/total)*arc+(circular?-Math.PI/2+claspArc/2:(Math.PI-arc)/2);result.push({x:w/2+Math.cos(a)*radius*k,y:h/2-14+Math.sin(a)*radius*k,r:b.size*state.scale*k/2,hitRadius:Math.max(ds[i],hs[i])*k/2,angle:b.type==='Alphabet'?0:a+Math.PI/2,id:b.id});cursor+=ds[i]+gaps[i]/2});
  }
  if(vertical&&state.mode==='straight')result.forEach(p=>{const oldX=p.x;p.x=w/2;p.y=h/2+(oldX-w/2)});
  return result;
}
function claspPosition(pts,w,h,vertical=false){
  if(!pts.length||state.showClasp===false)return null;
  const first=pts[0],last=pts.at(-1),b=state.beads.at(-1),k=last.r/(b.size*state.scale/2),size=5.5*state.scale*k;
  if(state.mode==='circular'){const radius=Math.hypot(first.x-w/2,first.y-(h/2-14));return{x:w/2,y:h/2-14-radius,size,angle:0}}
  let angle=vertical&&state.mode==='straight'?Math.PI/2:0;if((state.mode==='curved'||state.mode==='necklace')&&pts.length>1){const prev=pts.at(-2);angle=Math.atan2(last.y-prev.y,last.x-prev.x)}
  const distance=beadWidth(b)*state.scale*k/2+size*1.15;
  return{x:last.x+Math.cos(angle)*distance,y:last.y+Math.sin(angle)*distance,size,angle};
}
function drawClasp(ctx,p){
  if(!p)return;const s=p.size;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  ctx.strokeStyle=state.string;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-s*1.45,0);ctx.lineTo(s*1.45,0);ctx.stroke();
  const metal=ctx.createLinearGradient(0,-s*.5,0,s*.5);[[0,'#6e7981'],[.25,'#f9fcfd'],[.5,'#a3afb6'],[.75,'#eff4f6'],[1,'#56636d']].forEach(([t,c])=>metal.addColorStop(t,c));
  ctx.strokeStyle=metal;ctx.lineWidth=Math.max(2,s*.14);ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#0003';ctx.shadowBlur=3;ctx.shadowOffsetY=1;
  ctx.beginPath();ctx.arc(-s*.86,0,s*.22,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,0,s*.65,s*.37,0,.42,Math.PI*2-.42);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.59,-s*.15);ctx.lineTo(s*.59,s*.15);ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.34,-s*.32);ctx.lineTo(s*.47,-s*.48);ctx.stroke();
  ctx.beginPath();ctx.arc(s*.94,0,s*.23,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function draw(ctx,w,h,exporting=false,transparent=false,vertical=false){
  ctx.clearRect(0,0,w,h);if(!transparent){ctx.fillStyle=state.bg;ctx.fillRect(0,0,w,h)}
  const pts=layout(w,h,vertical),cx=w/2,cy=h/2;
  if(!exporting)positions=pts.map(p=>({...p,x:cx+view.x+(p.x-cx)*view.zoom,y:cy+view.y+(p.y-cy)*view.zoom,hitRadius:p.hitRadius*view.zoom}));
  ctx.save();if(!exporting){ctx.translate(cx+view.x,cy+view.y);ctx.scale(view.zoom,view.zoom);ctx.translate(-cx,-cy)}
  if(!pts.length){if(!exporting){ctx.fillStyle='#888888';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText('Your next favorite starts with one bead.',cx,cy)}ctx.restore();return}
  ctx.strokeStyle=state.string;ctx.lineWidth=2;ctx.beginPath();
  if(state.mode==='circular'&&pts.length>2){const p=pts[0],centerY=cy-14;ctx.arc(cx,centerY,Math.hypot(p.x-cx,p.y-centerY),0,Math.PI*2)}
  else pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.stroke();drawClasp(ctx,claspPosition(pts,w,h,vertical));pts.forEach((p,i)=>{if(!exporting&&selectedIds.has(p.id)){ctx.beginPath();ctx.arc(p.x,p.y,p.hitRadius+6,0,Math.PI*2);ctx.strokeStyle='#0d99ff';ctx.lineWidth=2/view.zoom;ctx.stroke()}bead(ctx,state.beads[i],p.x,p.y,p.r,p.angle)});ctx.restore()
}
function drawCanvas(){const c=$('canvas'),box=c.getBoundingClientRect(),d=window.devicePixelRatio||1;const pixelW=Math.round(box.width*d),pixelH=Math.round(box.height*d);if(c.width!==pixelW)c.width=pixelW;if(c.height!==pixelH)c.height=pixelH;const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);draw(ctx,box.width,box.height)}
function zoomAt(next,x,y){const box=$('canvas').getBoundingClientRect(),cx=box.width/2,cy=box.height/2,old=view.zoom;view.zoom=Math.max(.4,Math.min(5,next));const ratio=view.zoom/old;view.x=x-cx-ratio*(x-cx-view.x);view.y=y-cy-ratio*(y-cy-view.y);drawCanvas()}
function fitView(){view={zoom:1,x:0,y:0};drawCanvas()}
function render(){selectedIds=new Set([...selectedIds].filter(id=>state.beads.some(b=>b.id===id)));if(!selectedIds.has(selected))selected=chosen().at(-1)?.id??null;if(anchorId!=null&&!state.beads.some(b=>b.id===anchorId))anchorId=selected;const b=current(),group=chosen(),mixed=key=>group.some(x=>x[key]!==b?.[key]);$('undo').disabled=!history.length;$('redo').disabled=!future.length;document.querySelectorAll('[data-mode]').forEach(el=>el.classList.toggle('active',el.dataset.mode===state.mode));$('selectionControls').classList.toggle('no-selection',!b);$('noSelection').hidden=!!b;$('letterColorLabel').hidden=!group.length||!group.every(x=>x.type==='Alphabet');$('selectedPreview').hidden=group.length!==1;$('selectedPreview').replaceChildren(...(group.length===1?[thumb(b,70)]:[]));$('selectedIndex').textContent=b?(group.length>1?group.length+' SELECTED':'BEAD '+String(state.beads.indexOf(b)+1).padStart(2,'0')):'NO SELECTION';if(b){$('typeControl').hidden=group.length>1;$('moveLeft').disabled=state.beads.findIndex(x=>selectedIds.has(x.id))===0;$('moveRight').disabled=state.beads.findLastIndex(x=>selectedIds.has(x.id))===state.beads.length-1;$('beadActions').classList.toggle('multi',group.length>1);$('beadType').value=b.type;$('beadSize').value=b.size;$('sizeOutput').value=mixed('size')?'Mixed':b.size+' mm';$('beadSpace').value=b.space;$('spaceOutput').value=mixed('space')?'Mixed':b.space+' mm';$('letter').value=mixed('letter')?'':b.letter;$('autoTextColor').checked=group.every(x=>x.autoTextColor!==false);$('autoTextColor').indeterminate=group.some(x=>x.autoTextColor===false)&&group.some(x=>x.autoTextColor!==false);$('letterColor').value=b.textColor||contrastText(b.color);$('letterHex').value=mixed('textColor')?'':(b.textColor||'#46443c').toUpperCase();$('letterHex').placeholder=mixed('textColor')?'Mixed':'#000000';document.querySelectorAll('[data-text-color]').forEach(el=>el.classList.toggle('active',!mixed('textColor')&&el.dataset.textColor.toLowerCase()===(b.textColor||'#46443c').toLowerCase()));$('letterLabel').hidden=group.length!==1||b.type!=='Alphabet';$('sidesLabel').hidden=group.length!==1||b.type!=='Polygon';$('polygonSides').value=b.type==='Polygon'?(b.sides||6):(group.find(x=>x.type==='Polygon')?.sides||6);$('sidesOutput').value=group.filter(x=>x.type==='Polygon').some(x=>x.sides!==Number($('polygonSides').value))?'Mixed':$('polygonSides').value;const dimensions=group.filter(x=>x.type==='Oval'||x.type==='Rectangle');$('dimensionsControls').hidden=group.length!==1||!dimensions.length;if(dimensions.length){$('beadWidth').value=dimensions[0].width;$('beadHeight').value=dimensions[0].height;$('beadWidth').title=dimensions.some(x=>x.width!==dimensions[0].width)?'Mixed widths — enter a new value to set all':'';$('beadHeight').title=dimensions.some(x=>x.height!==dimensions[0].height)?'Mixed heights — enter a new value to set all':''}$('finish').value=mixed('finish')?'':b.finish}renderSwatches();syncRanges();
$('moveLeft').setAttribute('aria-label',group.length>1?'Move selected beads left ([)':'Move bead left ([)');$('moveRight').setAttribute('aria-label',group.length>1?'Move selected beads right (])':'Move bead right (])');$('duplicate').setAttribute('aria-label',group.length>1?'Duplicate '+group.length+' selected beads':'Duplicate selected bead');$('delete').setAttribute('aria-label',group.length>1?'Delete selected beads':'Delete selected bead');
$('total').textContent=state.beads.length;$('length').textContent=(state.beads.reduce((s,b)=>s+beadWidth(b)*state.scale+b.space+state.gap,0)/10).toFixed(1)+' cm';$('showClasp').checked=state.showClasp!==false;$('gap').value=state.gap;$('gapOutput').value=state.gap+' mm';$('scale').value=state.scale;$('scaleOutput').value=Math.round(state.scale*100)+'%';$('stringColor').value=state.string;$('bgColor').value=state.bg;$('dropCanvas').style.background=state.bg;$('workspace').style.background=state.bg;
const counts={},colors={};state.beads.forEach(b=>{counts[b.type]=(counts[b.type]||0)+1;colors[b.color]=(colors[b.color]||0)+1});$('summary').replaceChildren();let p=document.createElement('div');p.textContent=Object.entries(counts).map(([t,n])=>`${n} ${t.toLowerCase()}`).join(' · ');$('summary').append(p);p=document.createElement('div');p.textContent='Letters: '+(state.beads.filter(b=>b.type==='Alphabet').map(b=>b.letter||'A').join(' ')||'—');$('summary').append(p);p=document.createElement('div');p.className='summary-colors';Object.entries(colors).forEach(([c,n])=>{let s=document.createElement('span'),dot=document.createElement('i');dot.style.background=c;s.title=c; s.append(dot,document.createTextNode(n));p.append(s)});$('summary').append(p);drawCanvas()}
function renderPalette(){const s=$('paletteSelect');s.replaceChildren(...palettes.map((p,i)=>{let o=document.createElement('option');o.value=i;o.textContent=p.name;return o}));renderSwatches()}
function renderSwatches(){
  $('swatches').replaceChildren(...palette.map((color,index)=>{
    const item=document.createElement('div');item.className='swatch-item';
    const use=document.createElement('button');use.type='button';const group=chosen(),selectedColor=group.length&&group.every(b=>b.color.toLowerCase()===group[0].color.toLowerCase())?group[0].color:null;use.className='swatch'+((group.length?selectedColor:activeColor)?.toLowerCase()===color.toLowerCase()?' active':'');use.style.background=color;use.title='Use '+color;use.setAttribute('aria-label','Use color '+color);use.onclick=()=>{activeColor=color;if(selectedIds.size)applyChosen('color',color);renderSwatches()};
    const remove=document.createElement('button');remove.type='button';remove.className='remove-swatch';remove.textContent='×';remove.title='Remove '+color;remove.setAttribute('aria-label','Remove color '+color);remove.onclick=()=>{
      if(palette.length===1)return toast('Keep at least one color in a palette.');
      palette.splice(index,1);palettes[Number($('paletteSelect').value)||0].colors=[...palette];
      if(activeColor===color)activeColor=palette[0];persistPalettes();renderSwatches();
    };
    item.append(use,remove);return item;
  }));
  $('swatches').append(paletteAddButton);$('paletteColor').disabled=palette.length>=12;paletteAddButton.classList.toggle('full',palette.length>=12);paletteAddButton.title=palette.length>=12?'Palette is full (12 colors)':'Add color';
}
types.forEach((t,i)=>{let el=document.createElement('button');el.className='bead-tile';el.draggable=true;el.append(thumb(make(t,defaults[i],t==='Alphabet'?'A':'')),document.createTextNode(t));el.onclick=()=>{activeType=t;add([make(t,t==='Round'?activeColor:defaults[i],t==='Alphabet'?'A':'')])};el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({type:t}));$('library').append(el);let opt=document.createElement('option');opt.textContent=t;$('beadType').append(opt)});$('beadType').prepend(Object.assign(document.createElement('option'),{value:'',textContent:'Mixed types',disabled:true}));
function drop(e,index=insertionIndex()){try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.type&&types.includes(d.type)){activeType=d.type;add([make(d.type,d.type==='Round'?activeColor:undefined,d.type==='Alphabet'?'A':'')],index)}else if(d.id&&state.beads.some(b=>b.id===d.id)){change(()=>{let from=state.beads.findIndex(b=>b.id===d.id),[b]=state.beads.splice(from,1);state.beads.splice(index>from?index-1:index,0,b);selectedIds=new Set([b.id]);selected=b.id;anchorId=b.id})}}catch{toast('Choose a bead from the library.')}}
['dropCanvas'].forEach(id=>{$(id).ondragover=e=>e.preventDefault();$(id).ondrop=e=>{e.preventDefault();drop(e)}});
$('canvas').onclick=e=>{if(Date.now()<suppressClickUntil)return;let r=$('canvas').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let p=positions.find(p=>Math.hypot(p.x-x,p.y-y)<p.hitRadius+7);choose(p?.id??null,e.shiftKey,e.metaKey||e.ctrlKey)};
const pointers=new Map();let gestureMoved=false,suppressClickUntil=0,canvasDrag=null,marquee=null;
const canvas=$('canvas');
const selectionBox=document.createElement('div');selectionBox.className='selection-box';selectionBox.hidden=true;selectionBox.setAttribute('aria-hidden','true');$('dropCanvas').append(selectionBox);
const point=e=>{const rect=canvas.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top}};
canvas.onpointerdown=e=>{const p=point(e);if(marquee)return;if(canvasDrag&&e.pointerType==='touch'){const d=canvasDrag;if(d.started&&d.before)restore(d.before);pointers.set(d.pointerId,{x:d.startX,y:d.startY,startX:d.startX,startY:d.startY});canvasDrag=null}const hit=positions.find(b=>Math.hypot(b.x-p.x,b.y-p.y)<b.hitRadius+7);if(!pointers.size&&e.button===0&&hit&&(e.pointerType==='mouse'||selectedIds.has(hit.id))){canvasDrag={pointerId:e.pointerId,startX:p.x,startY:p.y,id:hit.id,started:false,before:null};canvas.setPointerCapture?.(e.pointerId);return}if(e.pointerType==='mouse'&&e.button===0&&!hit&&!pointers.size){marquee={pointerId:e.pointerId,start:p,end:p,started:false,additive:e.shiftKey||e.metaKey||e.ctrlKey,previous:[...selectedIds],previousActive:selected,previousAnchor:anchorId};canvas.setPointerCapture?.(e.pointerId);return}if(e.pointerType==='mouse'&&e.button!==1)return;pointers.set(e.pointerId,{...p,startX:p.x,startY:p.y});canvas.setPointerCapture?.(e.pointerId);if(pointers.size>1)gestureMoved=true};
canvas.onpointermove=e=>{const p=point(e);if(marquee?.pointerId===e.pointerId){const m=marquee;if(!m.started&&Math.hypot(p.x-m.start.x,p.y-m.start.y)<4)return;m.started=true;m.end=p;const left=Math.min(m.start.x,p.x),top=Math.min(m.start.y,p.y),right=Math.max(m.start.x,p.x),bottom=Math.max(m.start.y,p.y);selectionBox.hidden=false;Object.assign(selectionBox.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px'});const hits=positions.filter(b=>{const x=Math.max(left,Math.min(right,b.x)),y=Math.max(top,Math.min(bottom,b.y));return Math.hypot(b.x-x,b.y-y)<=b.hitRadius}).map(b=>b.id);selectedIds=new Set([...(m.additive?m.previous:[]),...hits]);selected=selectedIds.has(m.previousActive)?m.previousActive:chosen().at(-1)?.id??null;anchorId=selected;render();e.preventDefault?.();return}if(canvasDrag?.pointerId===e.pointerId){const d=canvasDrag;if(!d.started&&Math.hypot(p.x-d.startX,p.y-d.startY)<6)return;if(!d.started){d.started=true;if(!selectedIds.has(d.id))choose(d.id);d.before=snapshot();canvas.classList.add('panning')}const candidates=positions.map((bead,i)=>({bead,i,distance:Math.hypot(bead.x-p.x,bead.y-p.y)})).sort((a,b)=>a.distance-b.distance);const nearest=candidates[0];if(nearest&&nearest.distance<nearest.bead.hitRadius+45&&!selectedIds.has(nearest.bead.id)){const targetIndex=nearest.i,targetId=nearest.bead.id,firstIndex=state.beads.findIndex(b=>selectedIds.has(b.id));const moving=chosen(),remaining=state.beads.filter(b=>!selectedIds.has(b.id));const insert=remaining.findIndex(b=>b.id===targetId)+(targetIndex>firstIndex?1:0);const reordered=[...remaining];reordered.splice(insert,0,...moving);if(reordered.some((b,i)=>b.id!==state.beads[i].id)){state.beads=reordered;render()}}e.preventDefault?.();return}if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);if(pointers.size===1){if(!gestureMoved&&Math.hypot(p.x-old.startX,p.y-old.startY)<3)return;gestureMoved=true;view.x+=p.x-old.x;view.y+=p.y-old.y;canvas.classList.add('panning');pointers.set(e.pointerId,{...old,x:p.x,y:p.y});drawCanvas();return}
  const before=[...pointers.values()],oldMid={x:(before[0].x+before[1].x)/2,y:(before[0].y+before[1].y)/2},oldDist=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y);
  pointers.set(e.pointerId,{...old,x:p.x,y:p.y});const after=[...pointers.values()],mid={x:(after[0].x+after[1].x)/2,y:(after[0].y+after[1].y)/2},dist=Math.hypot(after[0].x-after[1].x,after[0].y-after[1].y);
  if(oldDist>0)zoomAt(view.zoom*dist/oldDist,mid.x,mid.y);view.x+=mid.x-oldMid.x;view.y+=mid.y-oldMid.y;gestureMoved=true;drawCanvas();e.preventDefault()
};
const pointerEnd=e=>{
  if(marquee?.pointerId===e.pointerId){const m=marquee;marquee=null;selectionBox.hidden=true;if(m.started){suppressClickUntil=Date.now()+400;if(e.type==='pointercancel'){selectedIds=new Set(m.previous);selected=m.previousActive;anchorId=m.previousAnchor}render()}return}

  if(canvasDrag?.pointerId===e.pointerId){
    const d=canvasDrag;canvasDrag=null;
    if(d.started){
      suppressClickUntil=Date.now()+400;
      if(e.type==='pointercancel')restore(d.before);
      else if(d.before!==snapshot()){history.push(d.before);if(history.length>80)history.shift();future=[];render()}
      canvas.classList.remove('panning');drawCanvas();
    }
    return;
  }
  pointers.delete(e.pointerId);
  if(!pointers.size){if(gestureMoved)suppressClickUntil=Date.now()+400;gestureMoved=false;canvas.classList.remove('panning')}
};
canvas.onpointerup=pointerEnd;canvas.onpointercancel=pointerEnd;
canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const p=point(e);zoomAt(view.zoom*Math.exp(-e.deltaY*.01),p.x,p.y)}else{view.x-=e.shiftKey&&!e.deltaX?e.deltaY:e.deltaX;view.y-=e.shiftKey&&!e.deltaX?0:e.deltaY;drawCanvas()}},{passive:false});
$('modes').onclick=e=>{const b=e.target.closest('[data-mode]');if(b)change(()=>state.mode=b.dataset.mode)};
$('addText').onclick=()=>{const letters=[...$('text').value.toUpperCase()].filter(c=>!(/\s/u.test(c))).slice(0,40);if(!letters.length)return toast('Type a word first.');add(letters.map(l=>make('Alphabet','#faf6ed',l)));toast('Your words, strung together.')};$('text').onkeydown=e=>{if(e.key==='Enter')$('addText').click()};
function prop(id,key,parse=v=>v){$(id).onchange=e=>applyChosen(key,parse(e.target.value))}prop('beadType','type');let sizeBefore=null;$('beadSize').oninput=e=>{if(!chosen().length)return;if(sizeBefore===null)sizeBefore=snapshot();const value=Number(e.target.value);chosen().forEach(b=>b.size=value);$('sizeOutput').value=value+' mm';drawCanvas()};$('beadSize').onchange=e=>{const value=Number(e.target.value);if(sizeBefore!==null){const before=sizeBefore;sizeBefore=null;chosen().forEach(b=>b.size=value);if(before!==snapshot()){history.push(before);if(history.length>80)history.shift();future=[]}render()}else applyChosen('size',value)};prop('beadSpace','space',Number);prop('letter','letter',v=>[...v.toUpperCase()][0]||'A');prop('finish','finish');function setTextColor(value){if(!chosen().length||!chosen().every(b=>b.type==='Alphabet'))return;const hex=value.startsWith('#')?value:'#'+value;if(!/^#[0-9a-f]{6}$/i.test(hex)){toast('Enter a 6-digit HEX color.');render();return}applyChosen('textColor',hex.toLowerCase())}$('autoTextColor').onchange=e=>{const enabled=e.target.checked;change(()=>chosen().filter(b=>b.type==='Alphabet').forEach(b=>{b.autoTextColor=enabled;if(enabled)updateTextContrast(b)}))};$('letterColor').onchange=e=>setTextColor(e.target.value);$('letterHex').onchange=e=>setTextColor(e.target.value.trim());document.querySelectorAll('[data-text-color]').forEach(el=>el.onclick=()=>setTextColor(el.dataset.textColor));['beadWidth','beadHeight'].forEach((id,i)=>{$(id).onchange=e=>{let v=Math.max(3,Math.min(30,Number(e.target.value)||8)),key=i?'height':'width';if(chosen().some(b=>b.type==='Oval'||b.type==='Rectangle'))change(()=>chosen().filter(b=>b.type==='Oval'||b.type==='Rectangle').forEach(b=>b[key]=v))}});document.querySelectorAll('[data-step-id]').forEach(btn=>btn.onclick=()=>{const input=$(btn.dataset.stepId),next=Math.max(3,Math.min(30,(Number(input.value)||8)+Number(btn.dataset.delta)));input.value=String(next);input.onchange({target:input})});$('polygonSides').onchange=e=>{const n=Math.max(3,Math.min(12,Number(e.target.value)));if(chosen().some(b=>b.type==='Polygon'))change(()=>chosen().filter(b=>b.type==='Polygon').forEach(b=>b.sides=n))};
[['gap','gap',Number],['scale','scale',Number],['bgColor','bg',v=>v],['stringColor','string',v=>v]].forEach(([id,k,parse])=>$(id).onchange=e=>change(()=>state[k]=parse(e.target.value)));
$('showClasp').onchange=e=>change(()=>state.showClasp=e.target.checked);$('duplicate').onclick=duplicateChosen;$('delete').onclick=deleteChosen;
function move(dir){if(!selectedIds.size)return;const selectedIndexes=state.beads.map((b,i)=>selectedIds.has(b.id)?i:-1).filter(i=>i>=0);if(dir<0&&selectedIndexes[0]===0||dir>0&&selectedIndexes.at(-1)===state.beads.length-1)return;change(()=>{const indexes=dir>0?[...selectedIndexes].reverse():selectedIndexes;for(const i of indexes){if(!selectedIds.has(state.beads[i+dir].id))[state.beads[i],state.beads[i+dir]]=[state.beads[i+dir],state.beads[i]]}})}$('moveLeft').onclick=()=>move(-1);$('moveRight').onclick=()=>move(1);$('clear').onclick=()=>{if(state.beads.length)change(()=>{state.beads=[];selected=null;anchorId=null;selectedIds.clear()})};
$('undo').onclick=()=>{if(history.length){future.push(snapshot());restore(history.pop())}};$('redo').onclick=()=>{if(future.length){history.push(snapshot());restore(future.pop())}};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&['+','=','-','_','0'].includes(e.key)){e.preventDefault();if(e.key==='0')fitView();else zoomAt(view.zoom*(e.key==='-'||e.key==='_'?1/1.2:1.2),$('canvas').getBoundingClientRect().width/2,$('canvas').getBoundingClientRect().height/2);return}if(!e.metaKey&&!e.ctrlKey&&!e.altKey&&['BracketLeft','BracketRight'].includes(e.code)){if(!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();move(e.code==='BracketLeft'?-1:1)}return}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicateChosen();return}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();return}if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('delete').click()}if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});
$('paletteSelect').onchange=e=>{palette=[...palettes[e.target.value].colors];activeColor=palette[0];renderSwatches()};
$('paletteColor').onchange=()=>{if(palette.length>=12)return toast('Use up to 12 colors per palette.');const color=$('paletteColor').value.toLowerCase();if(palette.some(c=>c.toLowerCase()===color))return toast('That color is already in this palette.');palette.push(color);palettes[Number($('paletteSelect').value)||0].colors=[...palette];activeColor=color;persistPalettes();renderSwatches()};
let generationVariant=0,generationSource=null,lastGeneratedSignature=null,lastGeneratedMode=null;
const designSignature=beads=>JSON.stringify(beads.map(({id,...bead})=>bead));
function generatePattern(mode,n,source=state.beads,variant=0){
 const shapes=['Round','Cube','Heart','Star','Polygon','Oval','Rectangle'],pick=list=>list[Math.floor(Math.random()*list.length)];
 const sized=(type,color,size)=>({...make(type,color,type==='Alphabet'?'A':''),size});
 if(source.length&&variant){const offset=variant%source.length;source=[...source.slice(offset),...source.slice(0,offset)]}
 if(mode==='Symmetrical pattern')return [...source,...[...source].reverse()].map(b=>({...b,id:nextId++}));
 if(mode==='Repeat pattern')return Array.from({length:n},(_,i)=>({...source[i%source.length],id:nextId++}));
 const accentShapes=[activeType==='Alphabet'?'Round':activeType,'Heart','Star','Cube','Polygon'];
 return Array.from({length:n},(_,i)=>{
  if(mode==='Small + statement'){const accent=i%4===3,group=Math.floor(i/4);return sized(accent?accentShapes[(group+variant)%accentShapes.length]:'Round',accent?palette[(group+variant)%palette.length]:'#ffffff',accent?10+((group+variant)%3)*2:4+variant%2)}
  if(mode==='Random')return sized(pick(shapes),pick(palette),pick([4,5,6,8,10,12]));
  if(mode==='Gradient'){const a=palette[variant%palette.length].slice(1).match(/../g).map(v=>parseInt(v,16)),b=palette[(palette.length-1+variant)%palette.length].slice(1).match(/../g).map(v=>parseInt(v,16));const color='#'+a.map((v,j)=>Math.round(v+(b[j]-v)*i/(n-1)).toString(16).padStart(2,'0')).join('');return sized(i%4===3?shapes[(5+variant)%shapes.length]:'Round',color,4+variant%3+Math.round((6+variant%2)*Math.sin(Math.PI*i/(n-1))))}
  return sized(i%2?shapes[(1+variant)%shapes.length]:shapes[variant%shapes.length],palette[(i+variant)%palette.length],i%2?10+variant%3:4+variant%3);
 });
}
$('generate').onclick=()=>{const n=Math.max(2,Math.min(120,Number($('patternCount').value)||16)),mode=$('pattern').value;const unchanged=mode===lastGeneratedMode&&designSignature(state.beads)===lastGeneratedSignature;const source=unchanged&&generationSource?generationSource.map(b=>({...b})):state.beads.map(b=>({...b}));if((mode==='Repeat pattern'||mode==='Symmetrical pattern')&&!source.length)return toast('Add a few beads to build a pattern first.');if(mode==='Symmetrical pattern'&&source.length>120)return toast('Use 120 beads or fewer for symmetry.');const bs=generatePattern(mode,n,source,++generationVariant);generationSource=source;lastGeneratedMode=mode;lastGeneratedSignature=designSignature(bs);change(()=>{state.beads=bs;selected=bs[0]?.id??null;anchorId=selected;selectedIds=new Set(selected==null?[]:[selected])});toast('Pattern created. Undo anytime.')};
$('export').onclick=openExport;$('zoomIn').onclick=()=>zoomAt(view.zoom*1.2,$('canvas').getBoundingClientRect().width/2,$('canvas').getBoundingClientRect().height/2);$('zoomOut').onclick=()=>zoomAt(view.zoom/1.2,$('canvas').getBoundingClientRect().width/2,$('canvas').getBoundingClientRect().height/2);$('resetView').onclick=fitView;new ResizeObserver(drawCanvas).observe($('dropCanvas'));$('themeToggle').onclick=()=>setTheme(!darkMode);setTheme(darkMode);renderPalette();render();

function syncRange(input){const pct=100*(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min));input.style.setProperty('--range',pct+'%')}
function syncRanges(){document.querySelectorAll('input[type=range]').forEach(syncRange)}
for(const [id,name] of Object.entries({undo:'undo',redo:'redo',zoomOut:'minus',zoomIn:'plus',resetView:'fit',duplicate:'duplicate',moveLeft:'left',moveRight:'right',delete:'delete',addText:'add'}))$(id).innerHTML=uiIcon(name);
document.querySelectorAll('[data-mode]').forEach(button=>button.innerHTML=uiIcon(button.dataset.mode));
document.querySelectorAll('[data-step-id]').forEach(button=>button.innerHTML=uiIcon(Number(button.dataset.delta)>0?'up':'down'));
document.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',()=>{syncRange(input);const output=input.parentElement.querySelector('output');if(output)output.value=input.id==='scale'?Math.round(Number(input.value)*100)+'%':input.value+(input.id==='polygonSides'?'':' mm')}));
syncRanges();

let lastDefaultCaption=null;
function posterLines(ctx,text,width){const lines=[];for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=width){line=next;continue}if(line)lines.push(line);line='';for(const char of word){if(ctx.measureText(line+char).width>width&&line){lines.push(line);line=''}line+=char}}lines.push(line)}return lines}
function posterText(ctx,text,{family,size,minSize,width,height,y,color,leading}){let lines;do{ctx.font=`400 ${size}px ${family}`;lines=posterLines(ctx,text,width);if(lines.length*size*leading<=height||size<=minSize)break;size-=2}while(size>=minSize);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='top';const start=y+(height-lines.length*size*leading)/2;lines.forEach((line,i)=>ctx.fillText(line,500,start+i*size*leading))}
function posterArtwork(ctx){
 const art=document.createElement('canvas');art.width=art.height=2000;const artCtx=art.getContext('2d');artCtx.scale(2,2);draw(artCtx,1000,1000,true,true,state.mode==='straight');
 const points=layout(1000,1000,state.mode==='straight'),bounds=points.map((p,i)=>{const b=state.beads[i],flat=['Cube','Alphabet','Rectangle','Polygon','Star','Heart'].includes(b.type);const rx=(b.type==='Oval'||b.type==='Rectangle'?b.width/8:1)*p.r,ry=(b.type==='Oval'||b.type==='Rectangle'?b.height/8:1)*p.r;const ex=flat?Math.abs(Math.cos(p.angle))*rx+Math.abs(Math.sin(p.angle))*ry:Math.sqrt((rx*Math.cos(p.angle))**2+(ry*Math.sin(p.angle))**2);const ey=flat?Math.abs(Math.sin(p.angle))*rx+Math.abs(Math.cos(p.angle))*ry:Math.sqrt((rx*Math.sin(p.angle))**2+(ry*Math.cos(p.angle))**2);const shadow=p.r*.3+4;return {left:p.x-ex-shadow,right:p.x+ex+shadow,top:p.y-ey-shadow,bottom:p.y+ey+shadow}});
 const clasp=claspPosition(points,1000,1000,state.mode==='straight');if(clasp){const r=clasp.size*1.6+5;bounds.push({left:clasp.x-r,right:clasp.x+r,top:clasp.y-r,bottom:clasp.y+r})}if(!bounds.length)return;
 const left=Math.max(0,Math.min(...bounds.map(b=>b.left))),top=Math.max(0,Math.min(...bounds.map(b=>b.top))),right=Math.min(1000,Math.max(...bounds.map(b=>b.right))),bottom=Math.min(1000,Math.max(...bounds.map(b=>b.bottom)));const width=right-left,height=bottom-top,k=Math.min(936/width,1000/height);ctx.drawImage(art,left*2,top*2,width*2,height*2,500-width*k/2,250+(1000-height*k)/2,width*k,height*k);
}
function renderExport(){const canvas=$('exportPreview'),ctx=canvas.getContext('2d'),bg=$('exportBackground').value,transparent=$('exportFill').value==='transparent';ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,1000,1500);if(!transparent){ctx.fillStyle=bg;ctx.fillRect(0,0,1000,1500)}const text=contrastText(bg);posterText(ctx,$('exportTitle').value,{family:"'Instrument Serif', Georgia, serif",size:112,minSize:34,width:920,height:190,y:35,color:text,leading:.88});posterArtwork(ctx);posterText(ctx,$('exportCaption').value,{family:"'DM Sans', sans-serif",size:22,minSize:14,width:840,height:160,y:1300,color:text==='#ffffff'?'#bcbcbc':'#858585',leading:1.25});$('exportBackground').disabled=transparent;document.querySelectorAll('[data-export-bg]').forEach(button=>{button.disabled=transparent;button.classList.toggle('active',button.dataset.exportBg===bg)})}
async function openExport(){if(!state.beads.length)return toast('Add a bead before exporting.');if(lastDefaultCaption===null||$('exportCaption').value===lastDefaultCaption){const letters=state.beads.filter(b=>b.type==='Alphabet').map(b=>b.letter||'A').join('');const length=(state.beads.reduce((sum,b)=>sum+beadWidth(b)*state.scale+b.space+state.gap,0)/10).toFixed(1);const date=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',timeZone:'Asia/Jakarta'}).format(new Date()).replaceAll('/','.');$('exportCaption').value=(letters?letters:'Designed in Beads Studio.')+'\n'+state.beads.length+' beads · '+length+' cm\n'+date;lastDefaultCaption=$('exportCaption').value;}if(!$('exportDialog').open)$('exportDialog').showModal();renderExport();if(document.fonts){await Promise.all([document.fonts.load("112px 'Instrument Serif'"),document.fonts.load("22px 'DM Sans'")]);if($('exportDialog').open)renderExport()}}
$('closeExport').onclick=()=>$('exportDialog').close();
['exportTitle','exportCaption','exportBackground','exportFill'].forEach(id=>$(id).addEventListener('input',renderExport));
document.querySelectorAll('[data-export-bg]').forEach(button=>button.onclick=()=>{$('exportBackground').value=button.dataset.exportBg;renderExport()});
$('downloadPoster').onclick=async()=>{const button=$('downloadPoster');button.disabled=true;try{if(document.fonts)await document.fonts.ready;renderExport();const blob=await new Promise(resolve=>$('exportPreview').toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG unavailable');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='beads-studio-poster.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Poster downloaded.')}catch{toast('Export failed. Please try again.')}finally{button.disabled=false}};

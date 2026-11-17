'use client';
import {useEffect,useRef} from 'react';

type Props={selected:number;onSelect:(index:number)=>void;lang:'ru'|'kk'};
type Point=[number,number];
const destinations:[string,number,number][]=[['Australia',-25,133],['USA',39,-98],['Korea',36,128],['Germany',51,10]];
const land:Point[][]=[
 [[72,-168],[70,-145],[64,-135],[58,-130],[55,-124],[50,-128],[48,-124],[43,-124],[40,-123],[37,-121],[33,-117],[31,-112],[27,-110],[24,-108],[21,-105],[18,-103],[16,-98],[14,-92],[11,-86],[8,-82],[10,-78],[8,-75],[11,-72],[15,-75],[18,-77],[21,-81],[25,-80],[29,-81],[30,-84],[29,-89],[30,-93],[28,-97],[25,-97],[26,-100],[29,-104],[31,-108],[34,-108],[36,-111],[39,-114],[42,-117],[46,-123],[49,-123],[53,-128],[57,-133],[60,-140],[64,-151],[69,-160]],
 [[12,-81],[9,-78],[7,-77],[5,-77],[2,-79],[-2,-80],[-5,-78],[-8,-78],[-11,-77],[-15,-75],[-18,-71],[-22,-70],[-27,-71],[-31,-72],[-36,-73],[-42,-73],[-49,-75],[-54,-70],[-53,-64],[-48,-65],[-44,-66],[-40,-63],[-36,-58],[-32,-53],[-27,-48],[-22,-44],[-17,-40],[-12,-38],[-8,-35],[-4,-35],[-1,-49],[2,-52],[5,-60],[8,-62],[10,-66],[11,-71]],
 [[59,-52],[61,-45],[67,-38],[74,-34],[80,-40],[83,-52],[80,-61],[74,-58],[68,-54],[63,-57]],
 [[36,-10],[43,-9],[44,-2],[48,-5],[51,2],[54,7],[58,8],[61,5],[66,12],[70,19],[71,27],[68,31],[66,39],[61,39],[58,34],[54,30],[51,29],[48,24],[46,17],[43,16],[40,19],[38,16],[36,10]],
 [[36,-7],[34,-2],[31,0],[27,-4],[23,-12],[19,-16],[15,-17],[11,-15],[8,-12],[5,-7],[4,4],[6,9],[4,12],[2,14],[-2,13],[-5,17],[-10,14],[-14,13],[-18,12],[-23,15],[-27,17],[-31,19],[-34,25],[-29,31],[-24,34],[-17,38],[-10,40],[-5,42],[0,42],[5,42],[10,44],[13,49],[17,51],[21,46],[15,43],[12,40],[11,36],[12,33],[15,32],[18,37],[23,35],[28,34],[32,32],[35,27],[33,22],[31,18],[32,14],[34,10],[36,5]],
 [[72,30],[69,42],[70,56],[67,68],[69,82],[68,94],[66,108],[63,120],[57,128],[54,135],[49,141],[45,143],[42,136],[39,130],[35,129],[33,126],[35,122],[39,119],[38,115],[34,111],[30,113],[26,120],[22,114],[20,108],[18,110],[14,109],[10,106],[8,104],[5,100],[1,104],[-3,104],[-6,106],[-8,114],[-7,119],[-4,122],[1,120],[4,117],[7,118],[10,116],[14,117],[17,121],[22,121],[25,125],[28,129],[31,131],[35,136],[39,141],[44,145],[49,150],[54,160],[59,163],[64,170],[69,179],[72,169],[70,158],[72,145],[70,133],[72,120],[74,109],[76,98],[77,84],[75,70],[73,58],[75,47],[73,38]],
 [[31,35],[27,37],[23,40],[20,42],[16,43],[13,45],[11,51],[15,55],[20,57],[24,58],[28,56],[30,51],[32,47]],
 [[-11,112],[-16,114],[-21,113],[-25,115],[-31,115],[-35,119],[-35,125],[-34,131],[-31,135],[-29,140],[-25,148],[-20,151],[-16,147],[-13,143],[-12,136],[-11,128],[-10,120]],
 [[-5,130],[-8,132],[-7,137],[-4,140],[-2,137]],
 [[-4,114],[-5,119],[-7,122],[-9,120],[-8,116]],
 [[35,127],[37,128],[39,127],[41,129],[39,131],[36,130]],
 [[31,130],[33,132],[35,135],[38,137],[41,141],[44,144],[42,145],[38,141],[35,138],[33,135]],
 [[-17,178],[-20,177],[-22,179],[-19,-179]],
 [[-22,-176],[-25,-175],[-27,-172],[-24,-171]],
];
const rad=(n:number)=>n*Math.PI/180;
const inside=(lat:number,lon:number,poly:Point[])=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [yi,xi]=poly[i],[yj,xj]=poly[j];if(((xi>lon)!==(xj>lon))&&(lat<(yj-yi)*(lon-xi)/(xj-xi)+yi))c=!c;}return c;};
const landDots:Point[]=[];for(let lat=-56;lat<=80;lat+=3.3)for(let lon=-180;lon<=180;lon+=3.3)if(land.some(poly=>inside(lat,lon,poly)))landDots.push([lat,lon]);

export default function EarthGlobe({selected,onSelect,lang}:Props){
 const canvasRef=useRef<HTMLCanvasElement>(null);const hostRef=useRef<HTMLDivElement>(null);const selectRef=useRef(onSelect);selectRef.current=onSelect;
 const selectedRef=useRef(selected);selectedRef.current=selected;const targetYawRef=useRef(rad(18));const targetPitchRef=useRef(rad(16));
 useEffect(()=>{const canvas=canvasRef.current,host=hostRef.current;if(!canvas||!host)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  let width=0,height=0,dpr=1,frame=0,yaw=rad(18),pitch=rad(16),targetYaw=yaw,targetPitch=pitch,dragging=false,moved=false,lastX=0,lastY=0,downX=0,downY=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize=()=>{const rect=host.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);};
  const project=(lat:number,lon:number,cx:number,cy:number,r:number)=>{const a=rad(lat),d=rad(lon)-yaw,p= pitch;const x=Math.cos(a)*Math.sin(d),z=Math.sin(a)*Math.sin(p)+Math.cos(a)*Math.cos(d)*Math.cos(p),y=Math.sin(a)*Math.cos(p)-Math.cos(a)*Math.cos(d)*Math.sin(p);return{x:cx+x*r,y:cy-y*r,z};};
  const draw=()=>{if(!ctx||!width||!height)return;ctx.clearRect(0,0,width,height);const size=Math.min(width*.84,height*.88),r=size*.47,cx=width/2,cy=height/2;
   const halo=ctx.createRadialGradient(cx,cy,r*.75,cx,cy,r*1.14);halo.addColorStop(0,'#4a73a500');halo.addColorStop(.78,'#4a73a50c');halo.addColorStop(1,'#4a73a52b');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*1.16,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();const ocean=ctx.createRadialGradient(cx-r*.36,cy-r*.44,r*.08,cx,cy,r*1.2);ocean.addColorStop(0,'#204c78');ocean.addColorStop(.54,'#123659');ocean.addColorStop(1,'#081c35');ctx.fillStyle=ocean;ctx.fillRect(cx-r,cy-r,r*2,r*2);
   ctx.strokeStyle='rgba(191,218,242,.16)';ctx.lineWidth=1;for(let latitude=-60;latitude<=60;latitude+=30){ctx.beginPath();for(let step=0;step<=100;step++){const longitude=-180+step*3.6,p=project(latitude,longitude,cx,cy,r);step?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.stroke();}for(let longitude=-150;longitude<180;longitude+=30){ctx.beginPath();for(let step=0;step<=100;step++){const latitude=-90+step*1.8,p=project(latitude,longitude,cx,cy,r);step?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.stroke();}
   ctx.fillStyle='rgba(227,197,140,.82)';for(const [latitude,longitude] of landDots){const p=project(latitude,longitude,cx,cy,r);if(p.z<0)continue;const dot=1.05+Math.max(0,p.z)*.42;ctx.beginPath();ctx.arc(p.x,p.y,dot,0,Math.PI*2);ctx.fill();}
   const points=destinations.map((d,i)=>({...project(d[1],d[2],cx,cy,r),i}));for(const p of points){if(p.z<0)continue;const active=p.i===selectedRef.current;ctx.beginPath();ctx.arc(p.x,p.y,active?8:5.5,0,Math.PI*2);ctx.fillStyle=active?'#f05a61':'#ffffff';ctx.shadowColor=active?'#ef4e5c':'#d6e7fa';ctx.shadowBlur=active?18:9;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(p.x,p.y,active?14:10,0,Math.PI*2);ctx.strokeStyle=active?'rgba(240,90,97,.65)':'rgba(255,255,255,.42)';ctx.lineWidth=1;ctx.stroke();}
   const shade=ctx.createRadialGradient(cx-r*.36,cy-r*.48,r*.22,cx,cy,r*1.15);shade.addColorStop(0,'rgba(255,255,255,.12)');shade.addColorStop(.55,'rgba(13,35,58,0)');shade.addColorStop(1,'rgba(2,10,22,.46)');ctx.fillStyle=shade;ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.restore();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='rgba(202,224,245,.42)';ctx.lineWidth=1.2;ctx.stroke();
  };
  const tick=()=>{if(!dragging){const targetYaw=targetYawRef.current,targetPitch=targetPitchRef.current;if(reduced){yaw+=(targetYaw-yaw)*.09;pitch+=(targetPitch-pitch)*.09;}else{let delta=(targetYaw-yaw+Math.PI*3)%(Math.PI*2)-Math.PI;yaw+=delta*.045+.00045;pitch+=(targetPitch-pitch)*.045;}}draw();frame=requestAnimationFrame(tick);};
  const onDown=(e:PointerEvent)=>{dragging=true;moved=false;downX=lastX=e.clientX;downY=lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');};
  const onMove=(e:PointerEvent)=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>6)moved=true;yaw-=dx/(Math.min(width,height)*.47);pitch=Math.max(-1.05,Math.min(1.05,pitch+dy/(Math.min(width,height)*.47)));targetYawRef.current=yaw;targetPitchRef.current=pitch;lastX=e.clientX;lastY=e.clientY;};
  const onUp=(e:PointerEvent)=>{if(!dragging)return;dragging=false;canvas.classList.remove('is-dragging');if(!moved){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,cx=width/2,cy=height/2,r=Math.min(width*.84,height*.88)*.47;let nearest=-1,dist=Infinity;destinations.forEach((d,i)=>{const p=project(d[1],d[2],cx,cy,r),next=Math.hypot(x-p.x,y-p.y);if(p.z>0&&next<dist){nearest=i;dist=next;}});if(nearest>=0&&dist<28)selectRef.current(nearest);}};
  resize();const observer=new ResizeObserver(resize);observer.observe(host);canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);frame=requestAnimationFrame(tick);
 return()=>{cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);};
 },[]);
 useEffect(()=>{const d=destinations[selected];if(d){targetYawRef.current=rad(d[2]);targetPitchRef.current=rad(d[1]);}},[selected]);
 return <div className="globe-card"><div className="globe-orbit globe-orbit-a"/><div className="globe-orbit globe-orbit-b"/><div className="globe-overline"><span className="globe-pulse"/>{lang==='ru'?'НАПРАВЛЕНИЯ VISA WORLD':'VISA WORLD БАҒЫТТАРЫ'}</div><div className="globe-stage" ref={hostRef}><canvas ref={canvasRef} role="img" aria-label={lang==='ru'?'Интерактивный глобус: перетаскивайте для вращения, нажмите на отметку страны':'Интерактивті глобус: айналдыру үшін сүйреңіз, ел белгісін басыңыз'}/><span className="globe-label globe-label-one">0{selected+1} / 04</span><span className="globe-label globe-label-two">360°</span></div><div className="globe-hint">{lang==='ru'?'Вращайте глобус · нажмите на отметку':'Глобусты айналдырыңыз · белгісін басыңыз'}</div></div>;
}

'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './HeartSpinner.module.css';

const BLACK=[0,0,0] as const, RED=[234,13,1] as const, WHITE=[255,255,255] as const;
const TAU=Math.PI*2;
type Point={x:number;y:number;z:number;nx:number;ny:number;nz:number;u:number;v:number;side:number;seed:number};
type Mask={data:Uint8Array;size:number};

function hash(x:number){const s=Math.sin(x*127.1+311.7)*43758.5453;return s-Math.floor(s)}
function heartInside(x:number,y:number){const X=x*1.05,Y=-(y+.02)*1.06;const a=X*X+Y*Y-1;return a*a*a-X*X*Y*Y*Y<=0}
function radiusAt(a:number){let lo=0,hi=1.65;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(heartInside(Math.cos(a)*m,Math.sin(a)*m))lo=m;else hi=m}return lo}

function makeSurface(taper:number){
  const pts:Point[]=[];let id=1;
  for(let y=-1.18;y<=1.02;y+=.018)for(let x=-1.18;x<=1.18;x+=.018){
    if(!heartInside(x,y))continue;
    const a=Math.atan2(y+.02,x), edge=radiusAt(a),r=Math.hypot(x,y+.02)/edge;
    const ear=.9+taper*.1*(1-Math.min(1,Math.abs(x)/1.12));
    const z=.43*ear*Math.sqrt(Math.max(.012,1-r*r));
    const eps=.012;
    const zx=.43*ear*Math.sqrt(Math.max(.012,1-Math.pow(Math.hypot(x+eps,y+.02)/radiusAt(Math.atan2(y+.02,x+eps)),2)));
    const zy=.43*ear*Math.sqrt(Math.max(.012,1-Math.pow(Math.hypot(x,y+eps+.02)/radiusAt(Math.atan2(y+eps+.02,x)),2)));
    let nx=-(zx-z)/eps,ny=-(zy-z)/eps,nz=1;const n=Math.hypot(nx,ny,nz);nx/=n;ny/=n;nz/=n;
    const u=(x+1.2)/2.4,v=(y+1.2)/2.3;
    pts.push({x,y,z,nx,ny,nz,u,v,side:1,seed:hash(id++)});
    pts.push({x,y,z:-z,nx:-nx,ny:-ny,nz:-nz,u:1-u,v,side:-1,seed:hash(id++)});
  }
  for(let i=0;i<720;i++){
    const a=TAU*i/720,r=radiusAt(a),x=Math.cos(a)*r,y=Math.sin(a)*r-.02;
    const r2=radiusAt(a+.003),tx=Math.cos(a+.003)*r2-x,ty=Math.sin(a+.003)*r2-(y+.02);
    let nx=ty,ny=-tx;const nn=Math.hypot(nx,ny);nx/=nn;ny/=nn;
    const ear=.9+taper*.1*(1-Math.min(1,Math.abs(x)/1.12)),max=.43*ear;
    for(let q=-10;q<=10;q++){const z=max*q/10;pts.push({x,y,z,nx,ny,nz:0,u:0,v:0,side:0,seed:hash(id++)})}
  }
  return pts;
}

async function loadMask(src:string,size=430):Promise<Mask>{
  const img=new Image();img.src=src;await img.decode();
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d',{willReadFrequently:true})!;
  g.drawImage(img,0,0,size,size);const px=g.getImageData(0,0,size,size).data,out=new Uint8Array(size*size);
  for(let i=0;i<out.length;i++){const r=px[i*4],gg=px[i*4+1],b=px[i*4+2];out[i]=(r>gg*1.8&&r>b*1.8&&r>80)?1:0}
  return {data:out,size};
}

function dot(buf:Uint8ClampedArray,w:number,h:number,x:number,y:number,r:number,c:readonly number[]){
  const rr=r*r;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(dx*dx+dy*dy>rr)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const k=(yy*w+xx)*4;buf[k]=c[0];buf[k+1]=c[1];buf[k+2]=c[2];buf[k+3]=255}
}

export default function HeartSpinner(){
  const canvas=useRef<HTMLCanvasElement>(null),raf=useRef(0),last=useRef(0),angleRef=useRef(0);
  const [playing,setPlaying]=useState(true),[angle,setAngle]=useState(0),[speed,setSpeed]=useState(12);
  const [density,setDensity]=useState(58),[white,setWhite]=useState(10),[taper,setTaper]=useState(45);
  const [masks,setMasks]=useState<{front:Mask;back:Mask}|null>(null);
  const points=useMemo(()=>makeSurface(taper/100),[taper]);
  useEffect(()=>{Promise.all([loadMask('/heart/love-lincoln.svg'),loadMask('/heart/invitation.svg')]).then(([front,back])=>setMasks({front,back}))},[]);

  const render=useCallback((deg:number,exportSize?:number)=>{
    const c=canvas.current;if(!c)return;const css=exportSize||Math.max(540,Math.min(1000,c.clientWidth*devicePixelRatio));
    const w=Math.round(css),h=w;if(c.width!==w||c.height!==h){c.width=w;c.height=h}
    const g=c.getContext('2d')!,im=g.createImageData(w,h),buf=im.data;for(let i=3;i<buf.length;i+=4)buf[i]=255;
    const th=deg*Math.PI/180,co=Math.cos(th),si=Math.sin(th),scale=w*.37,cx=w/2,cy=h*.515;
    const light=[-.42,-.36,.82], view=[0,0,1];
    const ordered=points.map(p=>{const X=p.x*co+p.z*si,Z=-p.x*si+p.z*co;return {p,X,Z}}).sort((a,b)=>a.Z-b.Z);
    const d=density/100;
    for(const o of ordered){const p=o.p,nx=p.nx*co+p.nz*si,nz=-p.nx*si+p.nz*co;if(nx*view[0]+p.ny*view[1]+nz*view[2]<-.03)continue;
      const lam=Math.max(0,nx*light[0]+p.ny*light[1]+nz*light[2]);const spec=Math.pow(Math.max(0,nx*(-.32)+p.ny*(-.28)+nz*.9),30);
      const redChance=Math.max(.018,Math.pow(lam,1.75)*d*.62);const whiteChance=spec*(white/100)*.9;
      if(p.seed>redChance&&p.seed>whiteChance)continue;const x=Math.round(cx+o.X*scale),y=Math.round(cy+p.y*scale),r=Math.max(1,Math.round(w/760));dot(buf,w,h,x,y,r,p.seed<whiteChance?WHITE:RED)
    }
    if(masks){
      const frontVisible=Math.cos(th)>.035,backVisible=Math.cos(th)<-.035,mask=frontVisible?masks.front:backVisible?masks.back:null,sgn=frontVisible?1:-1;
      if(mask){const step=Math.max(1,Math.floor(mask.size/360));for(let my=0;my<mask.size;my+=step)for(let mx=0;mx<mask.size;mx+=step){if(!mask.data[my*mask.size+mx])continue;
        const x0=(mx/mask.size*2.4-1.2),y0=(my/mask.size*2.3-1.2);if(!heartInside(x0,y0))continue;
        const a=Math.atan2(y0+.02,x0),ed=radiusAt(a),r=Math.hypot(x0,y0+.02)/ed,z=.435*Math.sqrt(Math.max(.008,1-r*r))*sgn;
        const X=x0*co+z*si,Z=-x0*si+z*co;if(Z<-.05)continue;dot(buf,w,h,Math.round(cx+X*scale),Math.round(cy+y0*scale),Math.max(1,Math.round(w/760)),RED)
      }}
    }
    g.putImageData(im,0,0);
  },[density,masks,points,white]);

  useEffect(()=>{render(angle)},[angle,render]);
  useEffect(()=>{if(!playing)return;const tick=(t:number)=>{if(last.current){angleRef.current=(angleRef.current+(t-last.current)*speed/1000)%360;setAngle(angleRef.current)}last.current=t;raf.current=requestAnimationFrame(tick)};raf.current=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf.current);last.current=0}},[playing,speed]);
  const setScrub=(v:number)=>{angleRef.current=v;setAngle(v)};
  const save=()=>{render(angle,2400);requestAnimationFrame(()=>{const a=document.createElement('a');a.download=`lincoln-heart-${Math.round(angle)}deg.png`;a.href=canvas.current!.toDataURL('image/png');a.click();render(angle)})};

  return <main className={styles.page}>
    <section className={styles.stage} aria-label="Rotating three-color stippled heart">
      <p className={styles.eyebrow}>Lincoln is for Lovers / Motion Study 01</p>
      <canvas ref={canvas} className={styles.canvas}/><p className={styles.angle}>{angle.toFixed(1)}°</p>
    </section>
    <aside className={styles.panel}>
      <h1>Heart<br/>Rotation</h1><p>Live geometry and lighting study. Every rendered pixel is black, Lincoln red, or white.</p>
      <div className={styles.buttons}><button className={`${styles.button} ${playing?styles.buttonActive:''}`} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Play'}</button><button className={styles.button} onClick={()=>setScrub(0)}>Reset</button></div>
      <div className={styles.group}>
        <label className={styles.label}>Rotation <output>{Math.round(angle)}°</output></label><input className={styles.range} aria-label="Rotation angle" type="range" min="0" max="360" step="1" value={angle} onChange={e=>setScrub(+e.target.value)}/>
        <label className={styles.label}>Speed <output>{speed}°/s</output></label><input className={styles.range} aria-label="Rotation speed" type="range" min="3" max="30" value={speed} onChange={e=>setSpeed(+e.target.value)}/>
      </div>
      <div className={styles.group}>
        <label className={styles.label}>Red density <output>{density}</output></label><input className={styles.range} aria-label="Red stipple density" type="range" min="25" max="85" value={density} onChange={e=>setDensity(+e.target.value)}/>
        <label className={styles.label}>White restraint <output>{white}</output></label><input className={styles.range} aria-label="White highlight amount" type="range" min="0" max="30" value={white} onChange={e=>setWhite(+e.target.value)}/>
        <label className={styles.label}>Center fullness <output>{taper}</output></label><input className={styles.range} aria-label="Center fullness" type="range" min="0" max="100" value={taper} onChange={e=>setTaper(+e.target.value)}/>
      </div>
      <button className={styles.button} onClick={save}>Save 2400px still</button>
      <div className={styles.swatches} aria-label="Exact palette"><i/><i/><i/></div>
      <p className={styles.note}>#000000 / #EA0D01 / #FFFFFF<br/>No gradients. No motion blur. No flicker.</p>
    </aside>
  </main>
}

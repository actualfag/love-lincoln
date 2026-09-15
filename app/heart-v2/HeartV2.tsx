"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./HeartV2.module.css";

const RED = new THREE.Color("#EA0D01");
const WHITE = new THREE.Color("#FFFFFF");
const BLACK = new THREE.Color("#000000");

// Every box below is in the UNROTATED text-local frame (i.e. plain SVG-local coordinates,
// before the -7deg group rotation and before the viewBox's y offset) -- the same frame the
// original love-lincoln.svg lettering group is defined in.
const SVG_Y_OFFSET = 140;
const LETTERING_ROTATE_DEG = -7, LETTERING_PIVOT: [number, number] = [640, 515 + SVG_Y_OFFSET];
// "Love," and "Lincoln"'s bounding boxes genuinely overlap (Lincoln's L reaches up into Love's
// row), so a bounding-box wipe can never keep them as two clean, non-bleeding writing stages --
// whichever box is drawn would leak into the other's territory wherever they overlap. The actual
// fix: public/heart/love-word-mask.png and lincoln-word-mask.png are pre-split, pixel-exact
// masks (built once via connected-component analysis of the source art, verified to have zero
// overlapping pixels and to fully cover the original ink between the four of them). Each mask
// contains ONLY that word's own ink and is fully transparent everywhere else, so revealing a
// generous box from each mask can never show so much as one pixel of the other word early.
const LOVE_BOX: [number, number, number, number] = [220, 290, 765, 700];
const LINCOLN_BOX: [number, number, number, number] = [375, 280, 1120, 975];
// Both faces are static decals now (love-text.png / invitation-text.png) -- no write-on
// animation on either side.

function rotatePt(px: number, py: number, cx: number, cy: number, deg: number): [number, number] {
  const rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad), dx = px - cx, dy = py - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

function boxCorners(box: [number, number, number, number], pivot: [number, number] = LETTERING_PIVOT): [number, number][] {
  const [x0, y0, x1, y1] = box;
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
    .map(([px, py]) => rotatePt(px, py, pivot[0], pivot[1], LETTERING_ROTATE_DEG));
}

function tracePolygon(ctx: CanvasRenderingContext2D, corners: [number, number][]) {
  ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i][0], corners[i][1]);
  ctx.closePath();
}

// Reveals a region of ONE word/line's isolated ink mask by clipping to a rectangle that grows
// along the same -7deg tilt as the lettering itself (defined in the untilted frame, then rotated
// into final image space) -- so the reveal follows the script's own slant rather than cutting
// across it. Because `img` here is a mask containing ONLY that group's pixels (transparent
// elsewhere), this can never leak a stroke belonging to a different word/line, no matter how
// generous `box` is.
function tiltedReveal(ctx: CanvasRenderingContext2D, img: HTMLImageElement, box: [number, number, number, number], t: number, pivot: [number, number] = LETTERING_PIVOT) {
  if (t <= 0 || !img.complete || img.naturalWidth === 0) return;
  const [x0, y0, x1, y1] = box;
  const revealX = x0 + (x1 - x0) * Math.min(1, t);
  if (revealX <= x0) return;
  ctx.save();
  ctx.beginPath();
  tracePolygon(ctx, boxCorners([x0, y0, revealX, y1], pivot));
  ctx.clip();
  ctx.drawImage(img, 0, 0, 1280, 1280, 0, 0, 1280, 1280);
  ctx.restore();
}

function loadImg(src: string) { const img = new Image(); img.src = src; return img; }

function makeLoveWriteOnTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1280; canvas.height = 1280;
  const ctx = canvas.getContext("2d")!;
  const loveImg = loadImg("/heart/love-word-mask.png");
  const lincolnImg = loadImg("/heart/lincoln-word-mask.png");
  const openQImg = loadImg("/heart/open-quote-mask.png");
  const closeQImg = loadImg("/heart/close-quote-mask.png");
  // Writing order, matching the reference video: "Love," completes fully, then "Lincoln", then
  // both quotation marks fade in together.
  const STAGES = { love: [0, .42], lincoln: [.42, .86], quotes: [.86, 1] };
  const stageT = (t: number, [a, b]: number[]) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = THREE.LinearFilter;
  function draw(t: number) {
    ctx.clearRect(0, 0, 1280, 1280);
    tiltedReveal(ctx, loveImg, LOVE_BOX, stageT(t, STAGES.love));
    tiltedReveal(ctx, lincolnImg, LINCOLN_BOX, stageT(t, STAGES.lincoln));
    const qt = stageT(t, STAGES.quotes);
    if (qt > 0) {
      ctx.save(); ctx.globalAlpha = qt;
      ctx.drawImage(openQImg, 0, 0, 1280, 1280, 0, 0, 1280, 1280);
      ctx.drawImage(closeQImg, 0, 0, 1280, 1280, 0, 0, 1280, 1280);
      ctx.restore();
    }
  }
  draw(0);
  return { texture, draw };
}

type P=[number,number];
const HEART_CURVES:[P,P,P,P][]=([
  [[640,938],[547,867],[425,793],[322,711]],
  [[322,711],[169,590],[72,454],[66,309]],
  [[66,309],[60,174],[139,76],[263,45]],
  [[263,45],[385,15],[504,62],[640,198]],
  [[640,198],[776,62],[895,15],[1017,45]],
  [[1017,45],[1141,76],[1220,174],[1214,309]],
  [[1214,309],[1208,454],[1111,590],[958,711]],
  [[958,711],[855,793],[733,867],[640,938]],
] as [P,P,P,P][]);
const OUTLINE_SUBDIV=60;
const HEART_OUTLINE=HEART_CURVES.flatMap((c,curve)=>Array.from({length:OUTLINE_SUBDIV},(_,i)=>{
  const u=i/OUTLINE_SUBDIV,v=1-u;
  const x=v*v*v*c[0][0]+3*v*v*u*c[1][0]+3*v*u*u*c[2][0]+u*u*u*c[3][0];
  const y=v*v*v*c[0][1]+3*v*v*u*c[1][1]+3*v*u*u*c[2][1]+u*u*u*c[3][1];
  return new THREE.Vector2((x-640)/574,-(y-491.5)/446.5);
}));
function outline(t:number) {
  return HEART_OUTLINE[Math.floor((((t/(Math.PI*2))%1)+1)%1*HEART_OUTLINE.length)];
}
function boundaryRadius(x:number,y:number){
  const len=Math.hypot(x,y);if(len<.0001)return 1;
  const dx=x/len,dy=y/len;let best=0;
  for(let i=0;i<HEART_OUTLINE.length;i++){
    const a=HEART_OUTLINE[i],b=HEART_OUTLINE[(i+1)%HEART_OUTLINE.length];
    const ax=a.x*2.68,ay=a.y*2.16,bx=b.x*2.68,by=b.y*2.16,ex=bx-ax,ey=by-ay;
    const den=ex*dy-ey*dx;if(Math.abs(den)<1e-7)continue;
    const u=(ay*dx-ax*dy)/den;
    if(u>=0&&u<=1){const px=ax+u*ex,py=ay+u*ey,t=px*dx+py*dy;if(t>best)best=t}
  }
  return best||1;
}

function makeHeart() {
  const segments=HEART_OUTLINE.length, rings=56, positions:number[]=[], uvs:number[]=[], indices:number[]=[];
  for(let side=0;side<2;side++){
    const sign=side===0?1:-1;
    for(let r=0;r<=rings;r++){
      const q=r/rings;
      for(let i=0;i<segments;i++){
        const p=outline(i/segments*Math.PI*2);
        const x=p.x*q*2.68, y=p.y*q*2.16;
        const shoulderTaper=1-.055*Math.max(0,(Math.abs(x)-1.15)/1.3);
        const z=sign*.96*Math.pow(Math.max(0,1-Math.pow(q,1.68)),.53)*shoulderTaper;
        positions.push(x,y,z); uvs.push(x/5+.5,y/4.8+.5);
      }
    }
    const off=side*(rings+1)*segments;
    for(let r=0;r<rings;r++) for(let i=0;i<segments;i++){
      const n=(i+1)%segments, a=off+r*segments+i,b=off+r*segments+n,c=off+(r+1)*segments+i,d=off+(r+1)*segments+n;
      if(side===0) indices.push(a,c,b,b,c,d); else indices.push(a,b,c,b,d,c);
    }
  }
  const back=(rings+1)*segments;
  for(let i=0;i<segments;i++){const n=(i+1)%segments,a=rings*segments+i,b=rings*segments+n,c=back+rings*segments+i,d=back+rings*segments+n;indices.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(indices); g.computeVertexNormals();
  const normal=g.getAttribute("normal") as THREE.BufferAttribute;
  // The heart outline has genuine corners (the cleft, the bottom point) where the incoming and
  // outgoing tangent directions differ -- correct for a 2D silhouette, but a naive per-vertex
  // tangent reproduces that as a hard crease running the full height of the lit 3D surface.
  // Smooth the tangent-perpendicular direction around the loop first so those corners round out
  // the way the actual bulge does, instead of leaving a seam.
  const rawPerp:[number,number][]=[];
  for(let i=0;i<segments;i++){
    const prev=outline(((i-1+segments)%segments)/segments*Math.PI*2),next=outline(((i+1)%segments)/segments*Math.PI*2);
    const tx=next.x-prev.x,ty=next.y-prev.y,tl=Math.hypot(tx,ty)||1;
    rawPerp.push([-ty/tl,tx/tl]);
  }
  const SMOOTH=Math.round(segments*0.045);
  const perp:[number,number][]=rawPerp.map((_,i)=>{
    let sx=0,sy=0;
    for(let k=-SMOOTH;k<=SMOOTH;k++){const idx=(i+k+segments)%segments;sx+=rawPerp[idx][0];sy+=rawPerp[idx][1];}
    const l=Math.hypot(sx,sy)||1; return [sx/l,sy/l];
  });
  for(let side=0;side<2;side++) for(let r=0;r<=rings;r++) for(let i=0;i<segments;i++){
    const [ox,oy]=perp[i],q=r/rings,edge=Math.pow(q,2.7),face=Math.pow(1-q,.48),sign=side===0?1:-1;
    const nl=Math.hypot(ox*edge,oy*edge,face)||1,k=side*(rings+1)*segments+r*segments+i;
    normal.setXYZ(k,ox*edge/nl,oy*edge/nl,sign*face/nl);
  }
  normal.needsUpdate=true;
  return g;
}

function makeStipplePoints(surface:THREE.BufferGeometry,count=310000){
  const pos=surface.getAttribute("position") as THREE.BufferAttribute;
  const nor=surface.getAttribute("normal") as THREE.BufferAttribute;
  const idx=surface.index!; const triCount=idx.count/3;
  const cumulative=new Float64Array(triCount); let total=0;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
  for(let t=0;t<triCount;t++){
    a.fromBufferAttribute(pos,idx.getX(t*3));b.fromBufferAttribute(pos,idx.getX(t*3+1));c.fromBufferAttribute(pos,idx.getX(t*3+2));
    total+=ab.subVectors(b,a).cross(ac.subVectors(c,a)).length()*.5;cumulative[t]=total;
  }
  let state=0x19f3a71; const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
  const points=new Float32Array(count*3),normals=new Float32Array(count*3),seeds=new Float32Array(count);
  for(let n=0;n<count;n++){
    const target=random()*total;let lo=0,hi=triCount-1;while(lo<hi){const m=(lo+hi)>>1;if(cumulative[m]<target)lo=m+1;else hi=m}
    const ia=idx.getX(lo*3),ib=idx.getX(lo*3+1),ic=idx.getX(lo*3+2);let u=random(),v=random();if(u+v>1){u=1-u;v=1-v}const w=1-u-v;
    const px=pos.getX(ia)*w+pos.getX(ib)*u+pos.getX(ic)*v,py=pos.getY(ia)*w+pos.getY(ib)*u+pos.getY(ic)*v,pz=pos.getZ(ia)*w+pos.getZ(ib)*u+pos.getZ(ic)*v;
    const nx=nor.getX(ia)*w+nor.getX(ib)*u+nor.getX(ic)*v,ny=nor.getY(ia)*w+nor.getY(ib)*u+nor.getY(ic)*v,nz=nor.getZ(ia)*w+nor.getZ(ib)*u+nor.getZ(ic)*v;const nl=Math.hypot(nx,ny,nz)||1;
    points[n*3]=px+nx/nl*.006;points[n*3+1]=py+ny/nl*.006;points[n*3+2]=pz+nz/nl*.006;normals[n*3]=nx/nl;normals[n*3+1]=ny/nl;normals[n*3+2]=nz/nl;seeds[n]=random();
  }
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(points,3));g.setAttribute("normal",new THREE.BufferAttribute(normals,3));g.setAttribute("seed",new THREE.BufferAttribute(seeds,1));return g;
}
const pointVertex=`varying vec3 vN;varying vec3 vWorld;varying vec3 vObject;varying float vSeed;attribute float seed;void main(){vSeed=seed;vObject=position;vN=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;gl_PointSize=1.55;}`;
const pointFragment=`
precision highp float;varying vec3 vN;varying vec3 vWorld;varying vec3 vObject;varying float vSeed;uniform float redDensity;uniform float whiteAmount;
float hash3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
float noise3(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  float n000=hash3(i),n100=hash3(i+vec3(1,0,0)),n010=hash3(i+vec3(0,1,0)),n110=hash3(i+vec3(1,1,0));
  float n001=hash3(i+vec3(0,0,1)),n101=hash3(i+vec3(1,0,1)),n011=hash3(i+vec3(0,1,1)),n111=hash3(i+vec3(1,1,1));
  float nx00=mix(n000,n100,f.x),nx10=mix(n010,n110,f.x),nx01=mix(n001,n101,f.x),nx11=mix(n011,n111,f.x);
  return mix(mix(nx00,nx10,f.y),mix(nx01,nx11,f.y),f.z);
}
void main(){
  if(length(gl_PointCoord-.5)>.47)discard;
  vec3 N=normalize(vN);
  // abs(N.z) makes the fitted (front-face-derived) light field apply identically to the
  // back face, matching the reference art where both faces share the same lighting.
  vec3 Nf=vec3(N.x,N.y,abs(N.z));
  // Highlight lobe directions, pulled inward from the least-squares fit's raw grazing-biased
  // values (blended toward straight-on) so each highlight reads as a bold graphic shape sitting
  // inset on the face, not a thin sliver hugging the silhouette.
  vec3 R0=normalize(vec3(0.549,-0.411,0.7276));
  vec3 R2=normalize(vec3(-0.60,0.55,0.58));
  vec3 R3=normalize(vec3(0.2569,0.02,0.8180));
  // Stretch the two round top highlights into ovals along the lobe's diagonal curve (matching
  // the reference art) by shrinking the perpendicular axis's contribution to the alignment dot
  // product -- iso-alignment contours widen into ellipses along AXIS instead of staying circular.
  vec2 L0_AXIS=normalize(vec2(1.0,-0.6)); vec2 L0_PERP=vec2(-L0_AXIS.y,L0_AXIS.x);
  vec2 L2_AXIS=normalize(vec2(-1.0,-0.6)); vec2 L2_PERP=vec2(-L2_AXIS.y,L2_AXIS.x);
  float aL0=dot(Nf.xy,L0_AXIS)*dot(R0.xy,L0_AXIS)+0.4*dot(Nf.xy,L0_PERP)*dot(R0.xy,L0_PERP)+Nf.z*R0.z;
  float aL2=dot(Nf.xy,L2_AXIS)*dot(R2.xy,L2_AXIS)+0.4*dot(Nf.xy,L2_PERP)*dot(R2.xy,L2_PERP)+Nf.z*R2.z;
  // max(), not sum, across lights: each patch of red visibly belongs to and traces the falloff
  // of ONE dominant light rather than blurring into a flat wash. Within each light, a tight
  // "core" term (reaches white) plus a broader, much dimmer "shoulder" term (same direction,
  // low exponent) are summed -- the shoulder never reaches white on its own, it just extends
  // that one highlight's own gradient outward so it has graduated density at its edge, without
  // growing the solid-white core area.
  // Keep the face where the text sits protected: shoulders (the broad, low-exponent halo part
  // of each light) are damped near dead-center so that patch stays black through most of the
  // rotation -- only a light's tight core (when actually aimed there) can still light it up.
  float faceMask=smoothstep(0.28,1.55,length(vObject.xy));
  // Cores are damped too (not just shoulders) so that even when a light's peak direction
  // happens to sweep over the text mid-rotation, it doesn't fully wash it out -- just dims
  // through, rather than off.
  float coreMask=mix(0.4,1.0,faceMask);
  float L0=pow(max(aL0,0.),46.)*0.40*coreMask+pow(max(aL0,0.),20.)*0.07*faceMask;
  // Top-nub light: tightened further so it only touches the lobe it's already on, not the face.
  float L2=pow(max(aL2,0.),72.)*0.44*coreMask+pow(max(aL2,0.),30.)*0.035*faceMask;
  // Bottom bar: much higher exponent narrows it (the curved surface itself keeps it elongated
  // into a streak, so raising the exponent shrinks width without turning it back into a blob).
  float L3=pow(max(dot(Nf,R3),0.),260.)*0.46*coreMask+pow(max(dot(Nf,R3),0.),75.)*0.05*faceMask;
  float highlight=max(max(L0,L2),L3);
  // Fresnel-style rim: a soft, direction-independent floor near the curved edge (not summed
  // with the highlights above -- it only matters where no highlight already dominates).
  float rim=pow(clamp(1.0-Nf.z,0.,1.),4.5)*0.05;
  float illum=max(highlight,rim)+0.006;
  // Layer in coarse, object-attached clumping (riso ink density drift) under the fine
  // per-point randomness, instead of a perfectly independent scatter.
  float clumpA=noise3(vObject*3.1+vec3(11.,3.,7.));
  float clumpB=noise3(vObject*7.4+vec3(-5.,19.,2.));
  float clump=mix(.85,1.15,clumpA*.7+clumpB*.3);
  // Pull the brightest whites in off the silhouette instead of letting them hug the rim:
  // fade white ignition (not red) as the point nears the outer edge.
  float radial=length(vec2(vObject.x/2.68,vObject.y/2.16));
  float edgeInset=1.0-smoothstep(0.70,0.98,radial);
  // White: rises with illumination, saturating to solid coverage right at the core.
  float whiteChance=clamp(smoothstep(.14,.40,illum)*edgeInset*whiteAmount,0.,.95);
  // Red: NOT a straight function of illumination. It is the illumination that white didn't
  // claim -- so it is near-zero at the very core (white owns that), rises to its densest,
  // "stark red" as white fades out, then fades toward black as illumination keeps dropping.
  // That single (1-whiteChance) factor is what makes it a hump instead of a flat wash.
  // A real floor (not a straight multiply from illum=0) so the baseline illum everywhere on the
  // face doesn't sprinkle a uniform low-level red dusting -- only areas actually catching some
  // real light cross the threshold, leaving unlit areas (including around the text) solid black.
  float redChance=clamp(smoothstep(.015,.34,illum)*(1.0-whiteChance)*redDensity*clump,0.,.95);
  if(vSeed<whiteChance)gl_FragColor=vec4(1.);
  else if(vSeed<whiteChance+redChance)gl_FragColor=vec4(.917647,.050980,.003922,1.);
  else discard;
}`;
const surfaceVertex=`varying vec3 vN;varying vec3 vWorld;varying vec3 vObject;void main(){vObject=position;vN=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
const surfaceFragment=`precision highp float;varying vec3 vN;varying vec3 vWorld;varying vec3 vObject;uniform float redDensity;uniform float whiteAmount;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float hash3s(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
float noise3s(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  float n000=hash3s(i),n100=hash3s(i+vec3(1,0,0)),n010=hash3s(i+vec3(0,1,0)),n110=hash3s(i+vec3(1,1,0));
  float n001=hash3s(i+vec3(0,0,1)),n101=hash3s(i+vec3(1,0,1)),n011=hash3s(i+vec3(0,1,1)),n111=hash3s(i+vec3(1,1,1));
  float nx00=mix(n000,n100,f.x),nx10=mix(n010,n110,f.x),nx01=mix(n001,n101,f.x),nx11=mix(n011,n111,f.x);
  return mix(mix(nx00,nx10,f.y),mix(nx01,nx11,f.y),f.z);
}
void main(){vec3 N=normalize(vN);vec3 an=abs(N);vec2 uv=an.x>an.y&&an.x>an.z?vObject.yz:(an.y>an.z?vObject.xz:vObject.xy);uv*=92.;vec2 cell=floor(uv),f=fract(uv);vec2 jitter=vec2(hash(cell),hash(cell+19.37))*.72+.14;float dotShape=1.-smoothstep(.105,.145,length(f-jitter));float rnd=hash(cell+53.19);
vec3 Nf=vec3(N.x,N.y,abs(N.z));
vec3 R0=normalize(vec3(0.549,-0.411,0.7276)),R2=normalize(vec3(-0.60,0.55,0.58)),R3=normalize(vec3(0.2569,0.02,0.8180));
vec2 L0_AXIS=normalize(vec2(1.0,-0.6)); vec2 L0_PERP=vec2(-L0_AXIS.y,L0_AXIS.x);
vec2 L2_AXIS=normalize(vec2(-1.0,-0.6)); vec2 L2_PERP=vec2(-L2_AXIS.y,L2_AXIS.x);
float aL0=dot(Nf.xy,L0_AXIS)*dot(R0.xy,L0_AXIS)+0.4*dot(Nf.xy,L0_PERP)*dot(R0.xy,L0_PERP)+Nf.z*R0.z;
float aL2=dot(Nf.xy,L2_AXIS)*dot(R2.xy,L2_AXIS)+0.4*dot(Nf.xy,L2_PERP)*dot(R2.xy,L2_PERP)+Nf.z*R2.z;
float faceMask=smoothstep(0.28,1.55,length(vObject.xy));
float coreMask=mix(0.4,1.0,faceMask);
float L0=pow(max(aL0,0.),46.)*0.40*coreMask+pow(max(aL0,0.),20.)*0.07*faceMask;
float L2=pow(max(aL2,0.),72.)*0.44*coreMask+pow(max(aL2,0.),30.)*0.035*faceMask;
float L3=pow(max(dot(Nf,R3),0.),260.)*0.46*coreMask+pow(max(dot(Nf,R3),0.),75.)*0.05*faceMask;
float highlight=max(max(L0,L2),L3);
float rim=pow(clamp(1.0-Nf.z,0.,1.),4.5)*0.05;
float illum=max(highlight,rim)+0.006;
float radial=length(vec2(vObject.x/2.68,vObject.y/2.16));float edgeInset=1.0-smoothstep(0.70,0.98,radial);
float clumpA=noise3s(vObject*3.1+vec3(11.,3.,7.));float clumpB=noise3s(vObject*7.4+vec3(-5.,19.,2.));float clump=mix(.85,1.15,clumpA*.7+clumpB*.3);
float whiteLevel=clamp(smoothstep(.14,.40,illum)*edgeInset*whiteAmount,0.,.95);
float redLevel=clamp(smoothstep(.015,.34,illum)*(1.0-whiteLevel)*redDensity*clump,0.,.95);
if(dotShape>.5&&rnd<whiteLevel)gl_FragColor=vec4(1.);else if(dotShape>.5&&rnd<whiteLevel+redLevel)gl_FragColor=vec4(.917647,.050980,.003922,1.);else gl_FragColor=vec4(0.,0.,0.,1.);}`;

function decalMaterial(url:string){
  const tex=new THREE.TextureLoader().load(url); tex.colorSpace=THREE.SRGBColorSpace; tex.minFilter=THREE.LinearFilter;
  return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,uniforms:{map:{value:tex}},vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D map; varying vec2 vUv; void main(){vec4 t=texture2D(map,vUv);if(max(max(t.r,t.g),t.b)<.16 && t.a<.5)discard;float ink=max(t.r,max(t.g,t.b));if(ink<.18)discard;gl_FragColor=vec4(0.917647,0.050980,0.003922,1.);}`});
}

export default function HeartV2({mode="points"}:{mode?:"points"|"surface"}){
  // Starts showing the back face ("I request...") first -- angle 180 is where that decal faces
  // the camera -- then turns through to "Love, Lincoln" (angle 0/360) as the second face.
  const mount=useRef<HTMLDivElement>(null), playing=useRef(true), speedRef=useRef(17), angleRef=useRef(180);
  const [isPlaying,setPlaying]=useState(true),[angle,setAngle]=useState(180),[density,setDensity]=useState(0.5),[white,setWhite]=useState(1.2);
  const uniforms=useRef({redDensity:{value:0.5},whiteAmount:{value:1.2}});
  useEffect(()=>{playing.current=isPlaying},[isPlaying]); useEffect(()=>{uniforms.current.redDensity.value=density},[density]); useEffect(()=>{uniforms.current.whiteAmount.value=white},[white]);
  useEffect(()=>{
    const host=mount.current!; const scene=new THREE.Scene(); scene.background=BLACK;
    const camera=new THREE.PerspectiveCamera(28,1,.1,100); camera.position.set(0,0,15.3);
    const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,preserveDrawingBuffer:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.domElement.className=styles.canvas; host.appendChild(renderer.domElement);
    const group=new THREE.Group(); group.scale.setScalar(.56); group.position.set(0,0,0); scene.add(group);
    const heartGeometry=makeHeart();
    const heartMaterial=mode==="surface"?new THREE.ShaderMaterial({vertexShader:surfaceVertex,fragmentShader:surfaceFragment,uniforms:uniforms.current,side:THREE.DoubleSide,transparent:false}):new THREE.MeshBasicMaterial({color:BLACK,side:THREE.DoubleSide,depthWrite:true});
    group.add(new THREE.Mesh(heartGeometry,heartMaterial));
    const pointMaterial=mode==="points"?new THREE.ShaderMaterial({vertexShader:pointVertex,fragmentShader:pointFragment,uniforms:uniforms.current,transparent:true,depthWrite:false,depthTest:true}):null;
    if(pointMaterial)group.add(new THREE.Points(makeStipplePoints(heartGeometry,650000),pointMaterial));
    const loader=new THREE.TextureLoader();
    function bulgeHeight(x:number,y:number){
      const q=Math.min(1,Math.hypot(x,y)/boundaryRadius(x,y));
      const shoulderTaper=1-.055*Math.max(0,(Math.abs(x)-1.15)/1.3);
      return .96*Math.pow(Math.max(0,1-Math.pow(q,1.68)),.53)*shoulderTaper;
    }
    function addDecal(src:string|THREE.Texture,back=false){
      let tex:THREE.Texture;
      if(typeof src==="string"){tex=loader.load(src); tex.colorSpace=THREE.SRGBColorSpace; tex.minFilter=THREE.LinearFilter;}
      else tex=src;
      const geo=new THREE.PlaneGeometry(4.76,4.34,72,72);
      const pos=geo.getAttribute("position") as THREE.BufferAttribute;
      const normals=new Float32Array(pos.count*3);
      const eps=.01;
      // signedHeight is expressed directly in FINAL (post-mirror) plane coordinates, so the
      // finite-difference normal below matches the geometry exactly with no sign juggling.
      const signedHeight=(fx:number,fy:number)=>{
        const bulge=bulgeHeight(back?-fx:fx,fy);
        return back?-bulge-.012:bulge+.012;
      };
      for(let i=0;i<pos.count;i++){
        const fx=back?-pos.getX(i):pos.getX(i),fy=pos.getY(i);
        pos.setZ(i,signedHeight(fx,fy));
        if(back)pos.setX(i,fx);
        const dzdx=(signedHeight(fx+eps,fy)-signedHeight(fx-eps,fy))/(2*eps);
        const dzdy=(signedHeight(fx,fy+eps)-signedHeight(fx,fy-eps))/(2*eps);
        // Front: solid sits below the bulge, so (-dzdx,-dzdy,1) points outward.
        // Back: the bulge dips toward -z, so the outward normal is the mirror of that.
        const nx=back?dzdx:-dzdx, ny=back?dzdy:-dzdy, nz=back?-1:1;
        const nl=Math.hypot(nx,ny,nz)||1;
        normals[i*3]=nx/nl; normals[i*3+1]=ny/nl; normals[i*3+2]=nz/nl;
      }
      pos.needsUpdate=true;
      geo.setAttribute("vnormal",new THREE.BufferAttribute(normals,3));
      const dm=new THREE.ShaderMaterial({uniforms:{map:{value:tex}},transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,vertexShader:`attribute vec3 vnormal;varying vec2 vUv;varying float vFacing;void main(){vUv=uv;vFacing=normalize(normalMatrix*vnormal).z;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying float vFacing;void main(){if(vFacing<.04)discard;vec4 t=texture2D(map,vUv);float ink=max(t.r,max(t.g,t.b));if(t.a<.2||ink<.16)discard;gl_FragColor=vec4(0.917647,0.050980,0.003922,1.);}`});
      const mesh=new THREE.Mesh(geo,dm); group.add(mesh);
    }
    addDecal("/heart/love-text.png"); addDecal("/heart/invitation-text.png",true);
    let resizeFrame=0;
    const resize=()=>{
      cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{
        const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
        const canvas=renderer.domElement;
        const pixelRatio=renderer.getPixelRatio();
        if(canvas.width!==Math.floor(w*pixelRatio)||canvas.height!==Math.floor(h*pixelRatio)){
          renderer.setSize(w,h,false);
          camera.aspect=w/h;
          camera.updateProjectionMatrix();
        }
      });
    };
    resize();
    const settleResize=window.setTimeout(resize,150);
    window.addEventListener("resize",resize,{passive:true});
    let previous=performance.now(),raf=0,lastUi=0;
    const draw=(now:number)=>{const dt=(now-previous)/1000;previous=now;if(playing.current)angleRef.current=(angleRef.current+speedRef.current*dt)%360;group.rotation.y=THREE.MathUtils.degToRad(-angleRef.current);
      renderer.render(scene,camera);if(now-lastUi>80){setAngle(Math.round(angleRef.current));lastUi=now}raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);cancelAnimationFrame(resizeFrame);window.clearTimeout(settleResize);window.removeEventListener("resize",resize);renderer.dispose();heartGeometry.dispose();heartMaterial.dispose();pointMaterial?.dispose();host.removeChild(renderer.domElement)};
  },[mode]);
  const scrub=(next:number)=>{playing.current=false;setPlaying(false);angleRef.current=next;setAngle(next)};
  return <main className={styles.page}><section className={styles.stage} ref={mount}><span className={styles.tag}>continuous surface study · exact 3-color output</span></section><div className={styles.controls}><button onClick={()=>setPlaying(v=>!v)}>{isPlaying?"Pause":"Play"}</button><label>Angle<input type="range" min="0" max="360" step="1" value={angle} onChange={e=>scrub(+e.target.value)}/></label><label>Speed<input type="range" min="3" max="30" defaultValue="17" onChange={e=>speedRef.current=+e.target.value}/></label><label>Red density<input type="range" min="0" max="2" step=".025" value={density} onChange={e=>setDensity(+e.target.value)}/></label><label>White<input type="range" min="0" max="2" step=".05" value={white} onChange={e=>setWhite(+e.target.value)}/></label><span className={styles.angle}>{angle}°</span></div></main>;
}

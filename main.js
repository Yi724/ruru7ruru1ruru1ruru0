(()=>{'use strict';
const sky=document.getElementById('sky'),sc=sky.getContext('2d'),cake=document.getElementById('cake'),cc=cake.getContext('2d');let W,H,CW,CH,dpr=Math.min(devicePixelRatio||1,2),time=0,spin=0,dragging=false,px=0,show=false;
function size(){W=innerWidth;H=innerHeight;sky.width=W*dpr;sky.height=H*dpr;sc.setTransform(dpr,0,0,dpr,0,0);let r=cake.getBoundingClientRect();CW=r.width;CH=r.height;cake.width=Math.max(1,Math.round(CW*dpr));cake.height=Math.max(1,Math.round(CH*dpr));cc.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',size);size();
const rand=(a,b)=>a+Math.random()*(b-a);
const colors=['#ffd5f4','#d6b8ff','#a6caff','#ffe6b6','#ffffff','#ff7ea8','#9be7ff'];
let stars=Array.from({length:220},()=>({x:Math.random(),y:Math.random()*.87,r:rand(.3,1.7),p:rand(0,7)}));
let rockets=[],sparks=[],flashes=[];let launchClock=0,launchTarget=.24;
// Seconds-based fireworks: fast ascending rockets, staggered bursts, fading luminous trails and gravity.
function firework(x=rand(.13,.88)*W,y=rand(.07,.48)*H,big=false){
 const color=colors[Math.floor(rand(0,colors.length))],n=big?145:95;
 flashes.push({x,y,life:.18,max:.18,color});
 for(let i=0;i<n;i++){
  let a=i/n*Math.PI*2+rand(-.065,.065),v=rand(big?155:120,big?360:270),life=rand(.65,1.32);
  sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,color,r:rand(.75,1.85),trail:[],glitter:Math.random()<1});
 }
}
function launchFirework(big=false){
 const tx=rand(.13,.87)*W,ty=rand(.07,.48)*H;
 const x=tx+rand(-75,75),y=H*.82;
 const duration=rand(.34,.58);
 rockets.push({x,y,sx:x,sy:y,tx,ty,age:0,duration,color:colors[Math.floor(rand(0,colors.length))],big,trail:[]});
}
for(let i=0;i<11;i++)setTimeout(()=>launchFirework(true),i*155);
function drawSky(dt){dt*=10;
 sc.clearRect(0,0,W,H);
 for(const s of stars){let a=.25+.5*(1+Math.sin(time*1.08+s.p))/2;sc.globalAlpha=a;sc.fillStyle='#fce4ff';sc.beginPath();sc.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);sc.fill()}
 sc.globalAlpha=1;
 launchClock+=dt;
 if(launchClock>=launchTarget){launchClock=0;launchTarget=rand(.16,.39);launchFirework(Math.random()<1)}
 for(let i=rockets.length-1;i>=0;i--){
  const p=rockets[i];p.age+=dt;let t=Math.min(1,p.age/p.duration);p.x=p.sx+(p.tx-p.sx)*t;p.y=p.sy+(p.ty-p.sy)*(1-(1-t)*(1-t));
  p.trail.push([p.x,p.y]);if(p.trail.length>8)p.trail.shift();sc.globalAlpha=.95;sc.strokeStyle=p.color;sc.lineWidth=2;sc.shadowBlur=12;sc.shadowColor=p.color;sc.beginPath();for(let j=0;j<p.trail.length;j++){const q=p.trail[j];if(j===0)sc.moveTo(...q);else sc.lineTo(...q)}sc.stroke();sc.shadowBlur=0;
  if(t>=1){firework(p.x,p.y,p.big);rockets.splice(i,1)}
 }
 for(let i=sparks.length-1;i>=0;i--){
  let p=sparks[i];p.trail.push([p.x,p.y]);if(p.trail.length>4)p.trail.shift();
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=115*dt;p.vx*=Math.exp(-.65*dt);p.vy*=Math.exp(-.22*dt);p.life-=dt;
  let alpha=Math.max(0,p.life/p.max);sc.globalAlpha=alpha;sc.strokeStyle=p.color;sc.lineWidth=p.r*alpha;sc.beginPath();for(let j=0;j<p.trail.length;j++){let q=p.trail[j];if(!j)sc.moveTo(q[0],q[1]);else sc.lineTo(q[0],q[1])}sc.lineTo(p.x,p.y);sc.stroke();
  if(p.glitter&&Math.random()<1){sc.fillStyle='#fff';sc.fillRect(p.x+rand(-3,3),p.y+rand(-3,3),1.4,1.4)}
  if(p.life<=0)sparks.splice(i,1)
 }
 for(let i=flashes.length-1;i>=0;i--){let p=flashes[i];p.life-=dt;sc.globalAlpha=Math.max(0,p.life/p.max)*.65;let g=sc.createRadialGradient(p.x,p.y,0,p.x,p.y,48);g.addColorStop(0,'#fff');g.addColorStop(.18,p.color);g.addColorStop(1,'transparent');sc.fillStyle=g;sc.beginPath();sc.arc(p.x,p.y,48,0,7);sc.fill();if(p.life<=0)flashes.splice(i,1)}
 sc.globalAlpha=1;
}
// Actual 3D point-cloud geometry: particles on three cylinder surfaces, icing drips,
// dense rose-shaped rosettes, orbiting gold stardust, and a candle.
let pts=[];const add=(x,y,z,c,s=1,kind=0)=>pts.push({x,y,z,c,s,kind,phase:Math.random()*6.28});
function cylinder(r,z,h,n){for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),rr=Math.random()<1?r:Math.sqrt(Math.random())*r,zz=z+rand(0,h),c=Math.random()<1?'#ffcaeb':Math.random()<1?'#b6adff':'#6e8ce9';add(Math.cos(a)*rr,zz,Math.sin(a)*rr,c,rand(.5,1.7))}for(let i=0;i<1100;i++){let a=rand(0,7),rr=rand(.1,r),zz=z+h+rand(-.01,.018);add(Math.cos(a)*rr,zz,Math.sin(a)*rr,'#e9c9ff',rand(.6,1.5))}}
function icing(r,top){for(let i=0;i<1550;i++){let a=rand(0,Math.PI*2),d=(.12+.16*Math.pow(Math.max(0,Math.sin(a*17)+.4*Math.sin(a*29)),3)),y=top-rand(0,d),rr=r+rand(-.016,.02);add(Math.cos(a)*rr,y,Math.sin(a)*rr,Math.random()<1?'#ffe3f3':'#fff3ff',rand(.6,1.4))}}
// Each rose is an explicitly spiralling multi-ring cloud, not a simple spherical blob.
function rose(cx,cy,cz,R,variant){let palette=variant===0?['#ffafd8','#f8c5ee','#e58ec9']:variant===1?['#d9b4ff','#a995f1','#f0c9ff']:['#a9c8ff','#b7a6ff','#f1b5ef'];for(let layer=0;layer<4;layer++){let petals=5+layer*3;for(let p=0;p<petals;p++){let base=2*Math.PI*p/petals+layer*.32;for(let k=0;k<25;k++){let u=rand(-1,1),t=Math.random(),a=base+u*(.26+layer*.035),rr=R*(.12+layer*.23+.12*t+.07*Math.cos(u*2));let y=cy+R*(.23+layer*.035+t*.16- .08*u*u);add(cx+Math.cos(a)*rr,y,cz+Math.sin(a)*rr,palette[(p+k)%3],rand(.7,1.6),1)}}}}
const tiers=[[1.87,.1,.69,3100],[1.39,.86,.65,2450],[.96,1.57,.59,1900]];for(const [r,z,h,n] of tiers){cylinder(r,z,h,n);icing(r,z+h);let count=r>1.8?32:r>1.2?25:18;for(let i=0;i<count;i++){let a=i/count*Math.PI*2,rr=r-.14;rose(Math.cos(a)*rr,z+h+.01,Math.sin(a)*rr,.21,i%3)}}for(let i=0;i<16;i++){let a=i*2.39996,rr=.67*Math.sqrt(i/16);rose(Math.cos(a)*rr,2.29,Math.sin(a)*rr,.18,i%3)}
// Cake platter, glowing spiralling gold trails, twisted candle and flame.
for(let i=0;i<1600;i++){let a=rand(0,7),r=rand(1.83,2.11);add(Math.cos(a)*r,.03+rand(-.03,.02),Math.sin(a)*r,'#f5d8a0',rand(.6,1.4))}
for(let i=0;i<850;i++){let t=i/850*Math.PI*5,rad=2.04-.27*i/850,y=.25+2.4*i/850;add(Math.cos(t)*rad,y,Math.sin(t)*rad,i%4?'#f9dba4':'#fff4e2',rand(.7,1.7),2)}
for(let i=0;i<460;i++){let y=2.26+rand(0,.46),a=rand(0,7),r=rand(0,.047);add(Math.cos(a)*r,y,Math.sin(a)*r,'#fff1e5',rand(.7,1.2));if(i%3===0){let yy=2.26+rand(0,.46),aa=(yy-2.26)*35;add(Math.cos(aa)*.052,yy,Math.sin(aa)*.052,'#ff9dc9',1.3)}}for(let i=0;i<170;i++){let a=rand(0,7),y=2.76+rand(0,.23),r=.12*Math.sin((y-2.76)/.23*Math.PI)*Math.sqrt(Math.random());add(Math.cos(a)*r,y,Math.sin(a)*r,Math.random()<1?'#fff0b7':'#ffbd77',rand(.9,2.2),3)}
function project(p,angle,scale,centerX,centerY){let co=Math.cos(angle),si=Math.sin(angle),x=p.x*co-p.z*si,z=p.x*si+p.z*co,depth=5.6-z,f=4.6/depth;return {x:centerX+x*scale*f,y:centerY-p.y*scale*f+z*scale*.12*f,z,scale:f}}
function drawCake(dt){cc.clearRect(0,0,CW,CH);if(!show)return;spin+=dragging?0:3.6*dt;let S=Math.min(CW/5.6,CH/3.8),cx=CW*.5,cy=CH*.77;let visible=[];for(let i=0;i<pts.length;i++){let p=pts[i],v=project(p,spin,S,cx,cy);if(v.x<-5||v.x>CW+5||v.y<-5||v.y>CH+5)continue;visible.push({v,p})}visible.sort((a,b)=>a.v.z-b.v.z);for(let {v,p} of visible){let twinkle=.75+.25*Math.sin(time*.04+p.phase),r=Math.max(.35,p.s*v.scale*S*.011),alpha=(.54+.38*twinkle)*(p.kind===2?.85:1);cc.globalAlpha=alpha;cc.fillStyle=p.c;cc.shadowColor=p.c;cc.shadowBlur=p.kind===2?10:Math.min(8,r*2.8);cc.beginPath();cc.arc(v.x,v.y,r,0,7);cc.fill()}cc.globalAlpha=1;cc.shadowBlur=0}
let previous=performance.now();function frame(now){const dt=Math.min((now-previous)/1000,.05);previous=now;time+=dt;drawSky(dt);drawCake(dt);requestAnimationFrame(frame)}requestAnimationFrame(frame);
let startX=0;cake.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;startX=px;cake.setPointerCapture(e.pointerId)});cake.addEventListener('pointermove',e=>{if(dragging){spin+=(e.clientX-px)*.012;px=e.clientX}});cake.addEventListener('pointerup',()=>dragging=false);cake.addEventListener('pointercancel',()=>dragging=false);
setTimeout(()=>{document.getElementById('intro').classList.add('gone');document.getElementById('main').classList.add('show');show=true;size()},2800);
const modal=document.getElementById('letterModal');document.getElementById('message').textContent=window.BIRTHDAY_MESSAGE||'';document.getElementById('envelope').addEventListener('click',()=>{modal.hidden=false;firework(W*.5,H*.32,true)});document.getElementById('closeLetter').addEventListener('click',()=>modal.hidden=true);modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.hidden=true});
})();

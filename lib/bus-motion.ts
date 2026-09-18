import { projectToRoute, type Point } from './bus-route';
const distance=(a:Point,b:Point)=>Math.hypot((b[0]-a[0])*111320,(b[1]-a[1])*111320*Math.cos(a[0]*Math.PI/180));
export function busMotion(from:Point,to:Point,path:Point[]){
 const a=projectToRoute(from,path),b=projectToRoute(to,path);
 if(!a||!b||a.distance>120||b.distance>120||b.along<a.along-15||b.along-a.along>1200)return null;
 const points:Point[]=[from,...path.slice(a.segment+1,b.segment+1),to];
 const lengths=points.slice(1).map((p,i)=>distance(points[i],p));const total=lengths.reduce((x,y)=>x+y,0);
 return (fraction:number)=>{let remaining=total*Math.max(0,Math.min(1,fraction));for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?Math.max(0,Math.min(1,remaining/lengths[i])):1;const p=points[i],q=points[i+1];return {point:[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t] as Point,bearing:(Math.atan2((q[1]-p[1])*Math.cos(p[0]*Math.PI/180),q[0]-p[0])*180/Math.PI+360)%360}}remaining-=lengths[i]}return {point:to,bearing:b.bearing}};
}

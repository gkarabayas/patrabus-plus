export type Point=[number,number];
type StopPoint={code:string;name:string;latitude:number;longitude:number};
const metres=(a:Point,b:Point)=>Math.hypot((b[1]-a[1])*111320*Math.cos(a[0]*Math.PI/180),(b[0]-a[0])*111320);
export function projectToRoute(point:Point,path:Point[],minimum=0){
 let best:{along:number;distance:number;bearing:number;segment:number}|null=null,total=0;
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],scale=111320*Math.cos(a[0]*Math.PI/180);
  const dx=(b[1]-a[1])*scale,dy=(b[0]-a[0])*111320,len=Math.hypot(dx,dy);
  if(!len)continue;
  const px=(point[1]-a[1])*scale,py=(point[0]-a[0])*111320;
  const t=Math.max(0,Math.min(1,(px*dx+py*dy)/(len*len))),along=total+t*len;
  const distance=Math.hypot(px-t*dx,py-t*dy);
  if(along>=minimum&&(!best||distance<best.distance))best={along,distance,bearing:(Math.atan2(dx,dy)*180/Math.PI+360)%360,segment:i};
  total+=len;
 }
 return best;
}
export function getApproach(point:Point,path:Point[],ordered:StopPoint[],targetCode:string){
 if(path.length<2||!ordered.length)return null;
 const bus=projectToRoute(point,path);if(!bus||bus.distance>120)return null;
 let minimum=0;
 const positioned=ordered.map(stop=>{const position=projectToRoute([stop.latitude,stop.longitude],path,minimum);if(position)minimum=position.along;return {stop,position}});
 const targetIndex=positioned.findIndex(item=>item.stop.code===targetCode);
 if(targetIndex<0)return null;
 const target=positioned[targetIndex].position;
 if(!target||target.distance>150||bus.along>target.along+35)return null;
 const pending=positioned.slice(0,targetIndex+1).filter(item=>item.position&&item.position.distance<=150&&item.position.along>bus.along+20);
 const preceding=positioned.slice(0,targetIndex+1).filter(item=>item.position&&item.position.along<=bus.along+20).at(-1);
 const start=preceding?.position?.along??0;
 const progress=target.along<=start?1:Math.max(0,Math.min(1,(bus.along-start)/(target.along-start)));
 const visible=pending.map(item=>item.stop);
 if(!visible.some(stop=>stop.code===targetCode))visible.push(positioned[targetIndex].stop);
 const between=path.slice(bus.segment+1,target.segment+1);
 const stopPositions=visible.map(stop=>({code:stop.code,along:positioned.find(item=>item.stop.code===stop.code)?.position?.along??target.along}));
 return {bus,target,stops:visible,stopPositions,remaining:pending.length,progress,previous:preceding?.stop??null,path:[point,...between,[positioned[targetIndex].stop.latitude,positioned[targetIndex].stop.longitude] as Point]};
}
export function validGps(lat:string,lng:string){const a=Number(lat),b=Number(lng);return lat.trim()!==''&&lng.trim()!==''&&Number.isFinite(a)&&Number.isFinite(b)&&a>=38&&a<=39&&b>=21&&b<=22}

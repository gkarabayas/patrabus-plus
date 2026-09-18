'use client';
import { useRef } from 'react';
import { Bus, MapPin } from 'lucide-react';
type TimelineStop={code:string;name:string;progress:number};
type Props={journey:string;target:string;progress:number;previous:{code:string;name:string}|null;stops:TimelineStop[]};
export function BusStopTimeline({journey,target,progress,previous,stops}:Props){
 const snapshot=useRef<{journey:string;stops:TimelineStop[]}|null>(null);
 if(snapshot.current?.journey!==journey){const origin={code:previous?.code||'origin',name:previous?.name||'Ζωντανή θέση',progress:0};snapshot.current={journey,stops:[origin,...stops.filter(s=>s.code!==origin.code)]}}
 const rows=snapshot.current.stops;
 let position=0;
 for(let i=1;i<rows.length;i++){const before=rows[i-1].progress,after=rows[i].progress;if(progress>=after){position=i;continue}position=i-1+(after>before?Math.max(0,(progress-before)/(after-before)):0);break}
 const offset=Math.max(0,Math.min(rows.length-1,position))*64;
 return <div className="vertical-bus-timeline" role="progressbar" aria-label="Προσέγγιση λεωφορείου στη στάση" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}>
  <div className="vertical-timeline-rail" style={{height:Math.max(0,rows.length-1)*64}}><span style={{height:offset}}/></div>
  {rows.map((stop,i)=><div className={'vertical-timeline-stop'+(stop.code===target?' destination':'')+(stop.progress<progress?' passed':'')} key={stop.code+'-'+i}><span className="vertical-timeline-dot">{stop.code===target&&<MapPin size={16}/>}</span><span className="vertical-timeline-name">{stop.name}{stop.code===target&&<small>Η στάση σου</small>}</span></div>)}
  <span className="vertical-timeline-bus" style={{top:32+offset}} title="Ζωντανή θέση λεωφορείου"><Bus size={20}/></span>
 </div>
}

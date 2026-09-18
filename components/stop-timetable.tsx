'use client';
import { useEffect, useState } from 'react';
import { CalendarClock, X, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

type Trip={id:number;routeCode:string;routeName:string;lineCode:string;lineName:string;lineColor:string;lineTextColor:string;stopCode:string;tripTime:string;tripTimeHour:number;tripTimeMinute:number};
type Props={stop:{code:string;name:string};open:boolean;onOpenChange:(value:boolean)=>void};
function athensDate(){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Athens',year:'numeric',month:'2-digit',day:'2-digit',}).formatToParts(new Date());const get=(key:string)=>parts.find(p=>p.type===key)!.value;return get('year')+'-'+get('month')+'-'+get('day')}
const color=(value:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;

export function StopTimetable({stop,open,onOpenChange}:Props){
 const [date,setDate]=useState(()=>athensDate()),[trips,setTrips]=useState<Trip[]>([]),[state,setState]=useState('loading'),[retry,setRetry]=useState(0),[lineFilter,setLineFilter]=useState('all');
 const day=date?new Date(date+'T12:00:00Z').getUTCDay():null;
 useEffect(()=>{if(open){setDate(athensDate());setLineFilter('all')}},[open,stop.code]);
 useEffect(()=>{if(!open||day===null||!Number.isFinite(day))return;const controller=new AbortController();setState('loading');setTrips([]);fetch('/api/bus?kind=schedule&code='+stop.code+'&day='+day,{signal:controller.signal}).then(async response=>{if(!response.ok)throw Error('schedule');const data=await response.json();if(!Array.isArray(data))throw Error('schedule');setTrips(data.filter((trip:Trip)=>trip.stopCode===stop.code));setState('ready')}).catch(error=>{if(error.name!=='AbortError')setState('error')});return()=>controller.abort()},[open,stop.code,day,retry]);
 const servingLines=[...new Map(trips.map(t=>[t.lineCode,t])).values()].sort((a,b)=>a.lineCode.localeCompare(b.lineCode,undefined,{numeric:true}));
 useEffect(()=>{if(state==='ready'&&lineFilter!=='all'&&!trips.some(t=>t.lineCode===lineFilter))setLineFilter('all')},[trips,state,lineFilter]);
 const visible=trips.filter(t=>lineFilter==='all'||t.lineCode===lineFilter).sort((a,b)=>a.tripTimeHour*60+a.tripTimeMinute-b.tripTimeHour*60-b.tripTimeMinute||a.lineCode.localeCompare(b.lineCode));
 const groups=[...new Set(visible.map(t=>t.tripTimeHour))];
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent fullscreen className="stops-screen timetable-screen" showCloseButton={false} initialFocus={false}>
  <div className="stops-screen-header"><DialogClose className="picker-back" aria-label="Κλείσιμο προγράμματος"><X size={22}/></DialogClose><DialogTitle>Πρόγραμμα στάσης</DialogTitle><CalendarClock size={22}/></div>
  <DialogDescription className="timetable-stop">{stop.name}</DialogDescription>
  <div className="timetable-controls">
   <label>Ημερομηνία<input type="date" value={date} onChange={e=>{if(e.target.value)setDate(e.target.value)}}/></label>
   {servingLines.length>1&&<div className="timetable-lines" role="group" aria-label="Φίλτρο γραμμής προγράμματος"><button aria-pressed={lineFilter==='all'} onClick={()=>setLineFilter('all')}>Όλες</button>{servingLines.map(item=><button key={item.lineCode} aria-pressed={lineFilter===item.lineCode} aria-label={'Γραμμή '+item.lineCode+' · '+item.lineName} onClick={()=>setLineFilter(item.lineCode)}><span className="dropdown-line-badge" style={{background:color(item.lineColor,'#657075'),color:color(item.lineTextColor,'#ffffff')}}>{item.lineCode}</span></button>)}</div>}
  </div>
  <div className="timetable-list" aria-live="polite">
   {state==='loading'?<p className="picker-feedback">Φόρτωση προγράμματος…</p>:state==='error'?<div className="timetable-error"><p>Το πρόγραμμα δεν είναι διαθέσιμο αυτή τη στιγμή.</p><button onClick={()=>setRetry(x=>x+1)}><RefreshCw size={16}/> Δοκίμασε ξανά</button></div>:!visible.length?<div className="timetable-empty"><CalendarClock size={28}/><p>Δεν υπάρχει δημοσιευμένο πρόγραμμα για αυτή τη στάση και ημέρα.</p></div>:groups.map(hour=><section className="timetable-hour" key={hour}><h3>{String(hour).padStart(2,'0')}:00</h3><div>{visible.filter(t=>t.tripTimeHour===hour).map((trip,i)=><div className="timetable-trip" key={trip.id+'-'+i}><time>{trip.tripTime}</time><span className="dropdown-line-badge" style={{background:color(trip.lineColor,'#657075'),color:color(trip.lineTextColor,'#ffffff')}}>{trip.lineCode}</span><span>{trip.routeName}</span></div>)}</div></section>)}

  </div>
  <footer className="timetable-note"><p>Προγραμματισμένες ώρες για αυτή τη στάση από το CityBus. Δεν είναι live εκτιμήσεις.</p><p>Το εβδομαδιαίο πρόγραμμα μπορεί να διαφέρει σε αργίες ή έκτακτες αλλαγές.</p><a href={'https://patra.citybus.gr/el/stops'} target="_blank" rel="noreferrer">Πηγή: CityBus</a></footer>
 </DialogContent></Dialog>
}

'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, X, Check, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
type Line={code:string;name:string;color:string;textColor:string;routes:{code:string;name:string}[]};
const color=(value:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
export function LinePicker({open,onOpenChange,lines,line,direction,onChoose}:{open:boolean;onOpenChange:(open:boolean)=>void;lines:Line[];line:string;direction:string;onChoose:(line:string,route:string|null)=>void}){
 const [draft,setDraft]=useState<string|null>(null);
 useEffect(()=>{if(open)setDraft(null)},[open]);
 const chosen=lines.find(l=>l.code===draft);
 const choose=(code:string,route:string|null)=>{onChoose(code,route);onOpenChange(false)};
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent fullscreen className="stops-screen line-picker-screen" showCloseButton={false} initialFocus={false}>
  <div className="stops-screen-header">{chosen?<button className="picker-back" onClick={()=>setDraft(null)} aria-label="Πίσω στις γραμμές"><ArrowLeft size={22}/></button>:<DialogClose className="picker-back" aria-label="Κλείσιμο επιλογής γραμμής"><X size={22}/></DialogClose>}<DialogTitle>{chosen?'Διάλεξε κατεύθυνση':'Διάλεξε γραμμή'}</DialogTitle></div>
  <DialogDescription className="line-picker-description">{chosen?<><span className="dropdown-line-badge" style={{background:color(chosen.color,'#657075'),color:color(chosen.textColor,'#ffffff')}}>{chosen.code}</span>{chosen.name}</>:'Γραμμές λεωφορείων'}</DialogDescription>
  <div className="line-picker-list">{chosen?chosen.routes.map((route,i)=><button key={route.code} className="line-picker-row direction-picker-row" onClick={()=>choose(chosen.code,route.code)}><span><strong>{route.name}</strong>{i===0&&<small>Πρώτη κατεύθυνση</small>}</span>{line===chosen.code&&direction===route.code?<Check size={19}/>:<ChevronRight size={18}/>}</button>):<><button className="line-picker-row" onClick={()=>choose('all',null)}><strong>Όλες οι γραμμές</strong>{line==='all'&&<Check size={19}/>}</button>{lines.map(item=><button className="line-picker-row" key={item.code} onClick={()=>setDraft(item.code)}><span className="dropdown-line-badge" style={{background:color(item.color,'#657075'),color:color(item.textColor,'#ffffff')}}>{item.code}</span><strong>{item.name}</strong>{line===item.code?<Check size={19}/>:<ChevronRight size={18}/>}</button>)}</>}</div>
 </DialogContent></Dialog>
}

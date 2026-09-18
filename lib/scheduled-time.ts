export type Trip={id:number;day:number;stopCode:string;lineCode:string;routeCode:string;routeName:string;lineColor:string;lineTextColor:string;tripTime:string;tripTimeHour:number;tripTimeMinute:number};
export function upcomingSchedule(trips:Trip[],now:number,line:string,direction:string){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Athens',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(now));const get=(key:string)=>parts.find(p=>p.type===key)!.value;const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));const minute=Number(get('hour'))*60+Number(get('minute'))+Number(get('second'))/60;
 return trips.filter(t=>(line==='all'||t.lineCode===line)&&(direction==='all'||t.routeCode===direction)).map(t=>({...t,minutes:(t.day===day?0:1440)+t.tripTimeHour*60+t.tripTimeMinute-minute})).filter(t=>t.minutes>=0&&t.minutes<=45).sort((a,b)=>a.minutes-b.minutes);
}

'use client';
import { useEffect, useState } from 'react';
import { Bus } from 'lucide-react';

export function LaunchScreen({ready}:{ready:boolean}){
 const [leaving,setLeaving]=useState(false),[visible,setVisible]=useState(true),[minimumElapsed,setMinimumElapsed]=useState(false);
 useEffect(()=>{const timeout=setTimeout(()=>setMinimumElapsed(true),1500);return()=>clearTimeout(timeout)},[]);
 useEffect(()=>{if(ready&&minimumElapsed)setLeaving(true)},[ready,minimumElapsed]);
 useEffect(()=>{const timeout=setTimeout(()=>setLeaving(true),7000);return()=>clearTimeout(timeout)},[]);
 useEffect(()=>{if(!leaving)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const timeout=setTimeout(()=>setVisible(false),reduced?100:600);return()=>clearTimeout(timeout)},[leaving]);
 if(!visible)return null;
 return <div className={'launch-screen'+(leaving?' launch-leaving':'')} role="status" aria-label="Φόρτωση PatraBus+" aria-live="polite">
  <div className="launch-brand"><div className="launch-symbol"><span className="launch-symbol-line"/><Bus size={44} strokeWidth={1.5}/></div><h1>PatraBus<span>+</span></h1><div className="launch-loader" aria-hidden="true"><span/></div><p>Φόρτωση</p></div>
 </div>
}

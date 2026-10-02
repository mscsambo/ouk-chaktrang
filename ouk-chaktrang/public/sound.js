// Short synthesized effects: no external audio files or network requests.
export class GameSound {
 constructor(){this.ctx=null;this.master=null;this.enabled=true;try{this.enabled=localStorage.getItem('ouk-sound')!=='off';}catch{}}
 unlock(){
  if(!this.enabled)return Promise.resolve();
  try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return Promise.resolve();
   if(!this.ctx||this.ctx.state==='closed'){this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=.35;this.master.connect(this.ctx.destination);}
   return this.ctx.state!=='running'?this.ctx.resume().catch(()=>{}):Promise.resolve();
  }catch{return Promise.resolve();}
 }
 setEnabled(enabled){this.enabled=enabled;try{localStorage.setItem('ouk-sound',enabled?'on':'off');}catch{}
  if(this.master){this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setValueAtTime(enabled?.35:0,this.ctx.currentTime);}
  if(enabled)this.unlock();
 }
 play(kind,delay=0){
  if(!this.enabled||!this.ctx)return;
  const patterns={move:[[540,0,.07],[310,.025,.08]],capture:[[250,0,.10],[160,.045,.10]],invalid:[[145,0,.10],[110,.12,.12]],check:[[660,0,.13],[880,.16,.18]],count:[[1050,0,.045]],countStart:[[700,0,.08],[930,.10,.10]],countStop:[[650,0,.08],[460,.10,.10]],win:[[523,0,.16],[659,.18,.16],[784,.36,.16],[1047,.54,.34]],lose:[[440,0,.2],[349,.23,.2],[262,.46,.34]],draw:[[523,0,.18],[523,.24,.22]],start:[[440,0,.08],[660,.10,.13]]};
  this.unlock().then(()=>{if(!this.enabled||this.ctx?.state!=='running')return;try{
   const start=this.ctx.currentTime+delay;
   for(const [frequency,offset,duration] of patterns[kind]||patterns.move){
    const oscillator=this.ctx.createOscillator(),gain=this.ctx.createGain(),at=start+offset;
    oscillator.type=['move','capture','invalid'].includes(kind)?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,at);
    if(kind==='move'||kind==='capture')oscillator.frequency.exponentialRampToValueAtTime(frequency*.65,at+duration);
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.45,at+.005);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    oscillator.connect(gain);gain.connect(this.master);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(at);oscillator.stop(at+duration+.02);
   }
  }catch{/* Unsupported or interrupted audio must not interrupt a game. */}}).catch(()=>{});
 }
}

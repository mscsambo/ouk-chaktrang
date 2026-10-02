export class PartnerConnection {
 constructor(onUpdate,onStatus){this.onUpdate=onUpdate;this.onStatus=onStatus;this.id=null;this.room=null;this.timer=null;this.generation=0;this.busy=false;this.polling=false;}
 async request(path,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});
   const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'roomUnavailable'),{room:data.room});return data.room;
  }finally{clearTimeout(timeout);}
 }
 accept(room){if(!this.room||room.revision>=this.room.revision){this.room=room;this.onUpdate(room);}}
 schedule(){clearTimeout(this.timer);if(this.id)this.timer=setTimeout(()=>this.poll(),document.hidden?4000:1000);}
 async poll(){
  if(!this.id||this.polling)return;const generation=this.generation,id=this.id;this.polling=true;
  try{const room=await this.request('/api/rooms/'+encodeURIComponent(id));if(generation===this.generation){this.accept(room);this.onStatus('connected');}}
  catch(error){if(generation===this.generation)this.onStatus(error.message==='roomNotFound'?'roomNotFound':'reconnecting');}
  finally{this.polling=false;if(generation===this.generation)this.schedule();}
 }
 close(){this.generation++;clearTimeout(this.timer);this.id=null;this.room=null;this.busy=false;this.polling=false;}
 async open(id){this.close();this.id=id;this.onStatus('connecting');await this.poll();}
 async create(){
  this.close();const generation=this.generation;this.busy=true;this.onStatus('creating');
  try{const room=await this.request('/api/rooms',{id:crypto.randomUUID()});if(generation!==this.generation)return;this.id=room.id;this.accept(room);this.onStatus('connected');this.schedule();}
  catch{if(generation===this.generation)this.onStatus('roomUnavailable');}
  finally{if(generation===this.generation){this.busy=false;this.onStatus('idle');}}
 }
 async action(action,data={}){
  if(this.busy||!this.room)return;const generation=this.generation;this.busy=true;this.onStatus('saving');
  try{const room=await this.request(`/api/rooms/${this.id}/${action}`,{...data,revision:this.room.revision});if(generation===this.generation){this.accept(room);this.onStatus('connected');}}
  catch(error){if(generation===this.generation){if(error.room)this.accept(error.room);this.onStatus(error.message||'roomUnavailable');}}
  finally{if(generation===this.generation){this.busy=false;this.onStatus('idle');this.poll();}}
 }
}

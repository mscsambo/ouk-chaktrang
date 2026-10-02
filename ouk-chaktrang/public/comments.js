const words={
 en:{profileRequired:'Create a profile with your name to post a comment. You can still watch and read comments.',createProfile:'Create profile',title:'Comments',help:'Players and visitors can join the conversation.',label:'Add a comment',placeholder:'Write a comment…',send:'Send',sending:'Sending…',loading:'Loading comments…',empty:'No comments yet. Start the conversation.',earlier:'Load earlier comments',ivory:'Ivory player',purple:'Purple player',visitor:'Visitor',you:'You',failed:'Could not send. Your comment is saved here; tap Send to retry.',offline:'Comments are reconnecting…',invalid:'Write a comment between 1 and 500 characters.',fast:'Please wait a moment before posting again.',sent:'Comment sent.'},
 km:{profileRequired:'សូមបង្កើតប្រវត្តិរូបជាមួយឈ្មោះរបស់អ្នក ដើម្បីបញ្ចេញមតិ។ អ្នកនៅតែអាចមើលការប្រកួត និងអានមតិបាន។',createProfile:'បង្កើតប្រវត្តិរូប',title:'មតិយោបល់',help:'អ្នកលេង និងអ្នកទស្សនាអាចចូលរួមបញ្ចេញមតិ។',label:'បញ្ចេញមតិ',placeholder:'សរសេរមតិយោបល់…',send:'ផ្ញើ',sending:'កំពុងផ្ញើ…',loading:'កំពុងផ្ទុកមតិយោបល់…',empty:'មិនទាន់មានមតិយោបល់ទេ។ ចាប់ផ្តើមការសន្ទនា។',earlier:'មើលមតិមុនៗ',ivory:'អ្នកលេងពណ៌ស',purple:'អ្នកលេងពណ៌ស្វាយ',visitor:'អ្នកទស្សនា',you:'អ្នក',failed:'មិនអាចផ្ញើបាន។ មតិរបស់អ្នកនៅទីនេះដដែល។ ចុចផ្ញើ ដើម្បីសាកម្ដងទៀត។',offline:'កំពុងភ្ជាប់មតិយោបល់ឡើងវិញ…',invalid:'សូមសរសេរមតិពី ១ ដល់ ៥០០ តួអក្សរ។',fast:'សូមរង់ចាំបន្តិច មុនផ្ញើមតិបន្ទាប់។',sent:'បានផ្ញើមតិយោបល់។'}
};
export class RoomComments{
 constructor(getLanguage,onCreateProfile=()=>{}){
  this.profileReady=false;
  this.getLanguage=getLanguage;this.id=null;this.generation=0;this.items=new Map();this.cursor=0;this.loaded=false;this.sending=false;this.loading=false;this.olderLoading=false;this.hasEarlier=false;this.timer=null;this.status='';this.pending=null;
  this.el=id=>document.getElementById(id);
  this.el('comments-create-profile').onclick=onCreateProfile;
  this.el('comment-form').addEventListener('submit',event=>{event.preventDefault();this.send();});
  this.el('comment-text').addEventListener('input',()=>this.renderControls());
  this.el('comments-earlier').onclick=()=>this.older();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.poll();});
  window.addEventListener('online',()=>this.poll());
 }
 setProfileReady(ready){this.profileReady=ready;if(ready&&this.status==='profileRequired')this.status='';this.renderControls();}
 tr(key){return (words[this.getLanguage()]||words.en)[key]||'';}
 setRoom(id){
  if(this.id===id)return;
  this.generation++;clearTimeout(this.timer);this.id=id;this.items.clear();this.cursor=0;this.loaded=false;this.sending=false;this.loading=false;this.olderLoading=false;this.hasEarlier=false;this.pending=null;this.status='';this.el('comment-text').value='';this.el('comments').hidden=!id;
  this.render();if(id)this.poll();
 }
 async request(query='',body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch(`/api/rooms/${encodeURIComponent(this.id)}/comments${query}`,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'failed');return data;}
  finally{clearTimeout(timeout);}
 }
 merge(messages){let changed=false;for(const message of messages)if(!this.items.has(message.id)){this.items.set(message.id,message);changed=true;}return changed;}
 async poll(){
  if(!this.id||this.loading)return;
  const generation=this.generation;this.loading=true;let nextDelay=document.hidden?5000:2000;
  try{const result=await this.request(this.loaded?'?after='+this.cursor:'');if(generation!==this.generation)return;
   const changed=this.merge(result.messages);if(result.messages.length)this.cursor=Math.max(this.cursor,...result.messages.map(m=>m.id));if(!this.loaded)this.hasEarlier=result.hasEarlier;
   this.loaded=true;if(this.status==='offline')this.status='';if(result.hasMore)nextDelay=0;
   if(changed)this.renderMessages();this.renderControls();
  }catch{if(generation===this.generation){if(!['failed','fast','invalid'].includes(this.status))this.status='offline';this.renderControls();}}
  finally{if(generation===this.generation){this.loading=false;clearTimeout(this.timer);if(this.id)this.timer=setTimeout(()=>this.poll(),nextDelay);}}
 }
 async older(){
  if(!this.id||this.olderLoading||!this.hasEarlier)return;const generation=this.generation;this.olderLoading=true;this.renderControls();
  try{const result=await this.request('?before='+Math.min(...this.items.keys()));if(generation!==this.generation)return;this.merge(result.messages);this.hasEarlier=result.hasEarlier;this.renderMessages('prepend');}
  catch{if(generation===this.generation)this.status='offline';}
  finally{if(generation===this.generation){this.olderLoading=false;this.renderControls();}}
 }
 async send(){
  if(!this.id||!this.loaded||this.sending)return;
  if(!this.profileReady){this.status='profileRequired';this.renderControls();return;}
  const text=this.el('comment-text').value.trim();if(!text||text.length>500){this.status='invalid';this.renderControls();return;}
  const generation=this.generation;if(this.pending?.text!==text)this.pending={text,clientId:crypto.randomUUID()};this.sending=true;this.status='';this.renderControls();
  try{const result=await this.request('',this.pending);if(generation!==this.generation)return;this.merge([result.message]);this.pending=null;this.el('comment-text').value='';this.status='sent';this.renderMessages('bottom');}
  catch(error){if(generation===this.generation){if(error.message==='profileRequired'){this.profileReady=false;this.status='profileRequired';}else this.status=error.message==='commentTooFast'?'fast':error.message==='commentInvalid'?'invalid':'failed';}}
  finally{if(generation===this.generation){this.sending=false;this.renderControls();this.poll();}}
 }
 renderControls(){
  this.el('comment-form').hidden=!this.profileReady;this.el('comments-profile-gate').hidden=this.profileReady;
  this.el('comments-profile-help').textContent=this.tr('profileRequired');this.el('comments-create-profile').textContent=this.tr('createProfile');
  for(const [id,key] of [['comments-title','title'],['comments-help','help'],['comment-label','label'],['comments-earlier','earlier']])this.el(id).textContent=this.tr(key);
  this.el('comment-text').placeholder=this.tr('placeholder');this.el('comment-text').disabled=this.sending||!this.profileReady;
  this.el('comment-send').textContent=this.tr(this.sending?'sending':'send');this.el('comment-send').disabled=!this.profileReady||this.sending||!this.loaded||!this.el('comment-text').value.trim();
  this.el('comment-length').textContent=this.el('comment-text').value.length+' / 500';this.el('comments-earlier').hidden=!this.hasEarlier;this.el('comments-earlier').disabled=this.olderLoading;
  this.el('comment-status').textContent=this.status?this.tr(this.status):!this.loaded?this.tr('loading'):'';this.el('comment-status').dataset.error=String(['failed','fast','invalid','offline'].includes(this.status));
  this.el('comments-empty').hidden=this.items.size>0;this.el('comments-empty').textContent=this.tr(this.loaded?'empty':'loading');
 }
 renderMessages(scroll){
  const list=this.el('comments-list'),oldHeight=list.scrollHeight,oldTop=list.scrollTop,atBottom=oldHeight-oldTop-list.clientHeight<50;list.replaceChildren();
  for(const message of [...this.items.values()].sort((a,b)=>a.id-b.id)){
   const article=document.createElement('article');article.className='comment'+(message.mine?' mine':'');
   const header=document.createElement('div');header.className='comment-meta';
   const name=document.createElement('strong');name.className='comment-author '+message.role;name.textContent=(message.name?message.name+' · ':'')+this.tr(message.role==='w'?'ivory':message.role==='b'?'purple':'visitor')+(message.role==='visitor'&&!message.name?' '+message.visitorTag:'')+(message.mine?' · '+this.tr('you'):'');
   const time=document.createElement('time');time.dateTime=new Date(message.createdAt).toISOString();time.textContent=new Date(message.createdAt).toLocaleTimeString(this.getLanguage()==='km'?'km-KH':'en-GB',{hour:'2-digit',minute:'2-digit'});time.title=new Date(message.createdAt).toLocaleString();
   const text=document.createElement('p');text.textContent=message.text;header.append(name,time);article.append(header,text);list.append(article);
  }
  if(scroll==='prepend')list.scrollTop=oldTop+list.scrollHeight-oldHeight;else if(scroll==='bottom'||atBottom)list.scrollTop=list.scrollHeight;else list.scrollTop=oldTop;
 }
 render(){this.renderMessages();this.renderControls();}
}

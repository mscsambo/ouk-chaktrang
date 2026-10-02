const words={
 en:{create:'Create profile',edit:'Edit profile',title:'Your profile',name:'Display name',placeholder:'Your name',save:'Save profile',saving:'Saving…',cancel:'Cancel',help:'Your name is visible to players and visitors. This profile is remembered in this browser; clearing browser data or switching browsers starts a separate profile.',scope:'Partner games',wins:'Wins',losses:'Losses',draws:'Draws',failed:'Could not save. Please check your connection and try again.',invalid:'Enter a name from 1 to 40 characters.',saved:'Profile saved.',loading:'Loading profile…',retry:'Retry',loadFailed:'Could not load your profile.',hint:'Choose a name for games and comments.'},
 km:{create:'បង្កើតប្រវត្តិរូប',edit:'កែប្រវត្តិរូប',title:'ប្រវត្តិរូបរបស់អ្នក',name:'ឈ្មោះបង្ហាញ',placeholder:'ឈ្មោះរបស់អ្នក',save:'រក្សាទុក',saving:'កំពុងរក្សាទុក…',cancel:'បោះបង់',help:'អ្នកលេង និងអ្នកទស្សនាអាចឃើញឈ្មោះអ្នក។ ប្រវត្តិរូបនេះត្រូវបានចងចាំក្នុងកម្មវិធីរុករកនេះ។ ការលុបទិន្នន័យ ឬប្តូរកម្មវិធីរុករកនឹងបង្កើតប្រវត្តិរូបផ្សេង។',scope:'ការប្រកួតជាមួយដៃគូ',wins:'ឈ្នះ',losses:'ចាញ់',draws:'ស្មើ',failed:'មិនអាចរក្សាទុកបាន។ សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកម្ដងទៀត។',invalid:'សូមបញ្ចូលឈ្មោះពី ១ ដល់ ៤០ តួអក្សរ។',saved:'បានរក្សាទុកប្រវត្តិរូប។',loading:'កំពុងផ្ទុកប្រវត្តិរូប…',retry:'សាកម្ដងទៀត',loadFailed:'មិនអាចផ្ទុកប្រវត្តិរូបបាន។',hint:'ជ្រើសឈ្មោះសម្រាប់ការលេង និងមតិយោបល់។'}
};
export class PlayerProfile{
 constructor(language,onChange){
  this.language=language;this.onChange=onChange;this.data=null;this.loading=true;this.saving=false;this.error='';this.el=id=>document.getElementById(id);
  this.el('profile-open').onclick=()=>this.open();
  this.el('profile-form').addEventListener('submit',event=>{event.preventDefault();this.save();});
  this.el('profile-cancel').onclick=()=>this.el('profile-dialog').close();
 }
 tr(key){return (words[this.language()]||words.en)[key];}
 stats(data){if(!data)return '';const s=data.stats;return `${this.tr('wins')} ${s.wins} · ${this.tr('losses')} ${s.losses} · ${this.tr('draws')} ${s.draws}`;}
 async request(body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch('/api/profile',{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error);return data.profile;}
  finally{clearTimeout(timeout);}
 }
 async init(){this.loading=true;this.render();try{this.data=await this.request();this.error='';}catch{this.error='loadFailed';}finally{this.loading=false;this.render();this.onChange();}}
 open(){if(this.loading)return;if(!this.data){this.init();return;}this.error='';this.el('profile-name').value=this.data.name||'';this.render();this.el('profile-dialog').showModal();this.el('profile-name').focus();}
 async save(){
  if(this.saving)return;const name=this.el('profile-name').value.trim();if(!name||name.length>40){this.error='invalid';this.render();return;}
  this.saving=true;this.error='';this.render();
  try{this.data=await this.request({name});this.el('profile-dialog').close();this.onChange();}
  catch(error){this.error=error.message==='profileInvalid'?'invalid':'failed';}
  finally{this.saving=false;this.render();}
 }
 adopt(data){if(data){this.data=data;this.render();}}
 render(){
  this.el('profile-dialog-stats').textContent=this.data?`${this.tr('scope')} · ${this.stats(this.data)}`:'';
  this.el('profile-open').textContent=this.tr(!this.data&&!this.loading?'retry':this.data?.name?'edit':'create');this.el('profile-open').disabled=this.loading;
  this.el('profile-summary-name').textContent=this.loading?this.tr('loading'):this.data?.name||this.tr(this.error==='loadFailed'?'loadFailed':'hint');
  this.el('profile-summary-stats').textContent=this.data?`${this.tr('scope')} · ${this.stats(this.data)}`:'';
  for(const [id,key] of [['profile-title','title'],['profile-name-label','name'],['profile-help','help'],['profile-cancel','cancel']])this.el(id).textContent=this.tr(key);
  this.el('profile-name').placeholder=this.tr('placeholder');this.el('profile-name').disabled=this.saving;
  this.el('profile-save').disabled=this.saving;this.el('profile-save').textContent=this.tr(this.saving?'saving':'save');
  this.el('profile-error').textContent=this.error?this.tr(this.error):'';
 }
}

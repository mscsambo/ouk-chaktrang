const words={
 en:{board:'Board',game:'Game',chat:'Comments',profile:'Profile',options:'Game options',close:'Done',chatTitle:'Game conversation',chatHelp:'Comments belong to a partner game. Create a game or open an invitation link to join.',partner:'Play a partner',ai:'AI practice',beginner:'Beginner',medium:'Medium',advanced:'Advanced',play:'Play AI',again:'Play again',retry:'Retry AI',choose:'Choose your color',invite:'Invite your partner',create:'Create partner game',watch:'Watching',waiting:'Waiting for partner',live:'Partner game',loading:'Connecting…'},
 km:{board:'ក្តារអុក',game:'ល្បែង',chat:'មតិ',profile:'ប្រវត្តិរូប',options:'ជម្រើសល្បែង',close:'រួចរាល់',chatTitle:'ការសន្ទនាក្នុងល្បែង',chatHelp:'មតិយោបល់សម្រាប់ល្បែងជាមួយដៃគូ។ បង្កើតល្បែង ឬបើកតំណអញ្ជើញ ដើម្បីចូលរួម។',partner:'លេងជាមួយដៃគូ',ai:'ហាត់ជាមួយ AI',beginner:'ដំបូង',medium:'មធ្យម',advanced:'កម្រិតខ្ពស់',play:'លេងជាមួយ AI',again:'លេងម្តងទៀត',retry:'សាក AI ម្តងទៀត',choose:'ជ្រើសពណ៌របស់អ្នក',invite:'អញ្ជើញដៃគូ',create:'បង្កើតល្បែងជាមួយដៃគូ',watch:'កំពុងមើល',waiting:'រង់ចាំដៃគូ',live:'ល្បែងជាមួយដៃគូ',loading:'កំពុងភ្ជាប់…'}
};
export class MobileApp{
 constructor(getState,actions){
  this.getState=getState;this.actions=actions;this.view='board';this.previousColor=null;this.previousRoom=null;this.el=id=>document.getElementById(id);
  this.media=window.matchMedia('(max-width: 680px)');this.panel=document.querySelector('.panel');this.anchor=document.createElement('div');this.anchor.hidden=true;this.panel.before(this.anchor);
  this.el('mobile-board').onclick=()=>this.showBoard();
  this.el('mobile-game').onclick=()=>this.openGame();this.el('mobile-options').onclick=()=>this.openGame();
  this.el('mobile-chat').onclick=()=>{this.view='chat';this.render();window.scrollTo({top:0});};
  this.el('mobile-profile').onclick=()=>actions.profile();
  this.el('mobile-sheet-close').onclick=()=>this.closeGame();
  this.el('mobile-game-sheet').addEventListener('close',()=>this.render());
  this.el('mobile-partner').onclick=()=>{actions.partner();this.openGame();};
  this.el('mobile-play').onclick=()=>{const s=getState();if(s.mode==='ai'){actions.play();this.showBoard();}else this.openGame();};
  this.el('start').addEventListener('click',()=>{if(this.media.matches)this.showBoard();});
  this.media.addEventListener('change',()=>this.mount());this.mount();
 }
 tr(key){return (words[this.getState().lang]||words.en)[key]||key;}
 mount(){
  if(this.media.matches)this.el('mobile-sheet-content').append(this.panel);
  else{this.closeGame();this.anchor.after(this.panel);}
  this.render();
 }
 openGame(){if(this.media.matches&&!this.el('mobile-game-sheet').open)this.el('mobile-game-sheet').showModal();this.render();}
 closeGame(){if(this.el('mobile-game-sheet').open)this.el('mobile-game-sheet').close();}
 showBoard(){this.view='board';this.closeGame();this.render();if(this.media.matches)window.scrollTo({top:0});}
 render(){
  const s=this.getState(),online=s.mode==='partner',r=s.room;
  document.body.dataset.mobileView=this.view;
  for(const [id,key] of [['mobile-board-label','board'],['mobile-game-label','game'],['mobile-chat-label','chat'],['mobile-profile-label','profile'],['mobile-sheet-title','options'],['mobile-sheet-close','close'],['mobile-chat-title','chatTitle'],['mobile-chat-help','chatHelp'],['mobile-partner','partner']])this.el(id).textContent=this.tr(key);
  this.el('mobile-options-label').textContent=this.tr('options');
  this.el('mobile-mode').textContent=online?this.tr(r?.ready?(r.myColor?'live':'watch'):r?'waiting':'live'):`${this.tr('ai')} · ${this.tr(s.level)}`;
  this.el('mobile-chat-empty').hidden=!!(online&&r);
  this.el('mobile-play').hidden=online?!!r?.ready:!!s.started&&!s.finished&&!s.failed;
  this.el('mobile-play').disabled=online&&(s.busy||s.loading);
  this.el('mobile-play').textContent=this.tr(online?(!r?(s.loading?'loading':'create'):r.myColor?'invite':'choose'):s.failed?'retry':s.finished?'again':'play');
  this.el('mobile-profile').disabled=s.profileLoading;
  for(const id of ['board','game','chat'])this.el('mobile-'+id).setAttribute('aria-pressed',String(id==='game'?this.el('mobile-game-sheet').open:!this.el('mobile-game-sheet').open&&this.view===id));
  // Return to the board once a color has been successfully reserved.
  const color=r?.myColor||null;
  if(this.media.matches&&color&&!this.previousColor&&this.previousRoom===r?.id)this.showBoardAfterClaim=true;
  this.previousColor=color;this.previousRoom=r?.id||null;
  if(this.showBoardAfterClaim){this.showBoardAfterClaim=false;this.showBoard();}
 }
}

import {MobileApp} from './mobile.js';
import {PlayerProfile} from './profile.js';
import {RoomComments} from './comments.js';
import {PartnerConnection} from './partner.js';
import {GameSound} from './sound.js';
import {initial,legal,apply,inCheck,outcome,names,english,color,square,countOption,positionKey} from './engine.js';
const $=id=>document.getElementById(id);
const translations={
 en:{share:'Copy link',copied:'Link copied!',shareTitle:'Share this game',shareHelp:'Anyone with this link can play. No account needed.',practice:'AI practice',thinking:'Thinking…',you:'You',ivory:'Light pieces · First move',ready:'Ready',tap:'Tap a piece, then a highlighted square.',playComputer:'PLAY THE COMPUTER',yourPace:'Your board. Your pace.',choose:'Choose a challenge and make your first move.',difficulty:'Difficulty',beginner:'Beginner',medium:'Medium',advanced:'Advanced',beginnerDesc:'A forgiving place to start',mediumDesc:'A little more to think about',advancedDesc:'Deeper plans. Tougher replies.',playAI:'Play AI',gameStatus:'GAME STATUS',readyPlay:'Ready to play',noClock:'No clock. Take your time.',resign:'Resign',rules:'How to play',moves:'Moves',historyEmpty:'Your moves will appear here.',footer:'Cambodian chess · One move at a time',cancel:'Cancel',newGame:'New game',yourTurn:'Your turn',aiTurn:'AI is thinking',check:'Ouk! Your king is in check.',checkAI:'Ouk! The AI king is in check.',yourDetail:'Select a light piece to see its legal moves.',aiDetail:'Planning the next move…',red:'Dark purple pieces',win:'You win!',lose:'AI wins',draw:'Draw',checkmate:'Checkmate',stalemate:'Stalemate',counting:'Draw under the endgame counting rule.',bareKings:'Only the two kings remain.',repetition:'Threefold repetition',resigned:'You resigned.',again:'Choose a level and play again.',newTitle:'Start a new game?',newDetail:'This will end the current game and reset the board.',resignTitle:'Resign this game?',resignDetail:'The AI will win this game.',countStart:'Start endgame count',countStop:'Stop endgame count',countLabel:'Endgame count',claimDraw:'Accept counting draw',error:'The AI could not finish its move. Tap Retry AI.',retry:'Retry AI',startFirst:'Choose a difficulty and tap Play AI.',noMoves:'This piece has no legal moves.',selected:'Selected',legalMoves:'legal moves',pieceCount:'Piece count',boardCount:'Board count'},
 km:{share:'ចម្លងតំណ',copied:'បានចម្លង!',shareTitle:'ចែករំលែកល្បែង',shareHelp:'អ្នកដែលមានតំណនេះអាចលេងបាន ដោយមិនចាំបាច់បង្កើតគណនី។',practice:'ហាត់លេងជាមួយ AI',thinking:'កំពុងគិត…',you:'អ្នក',ivory:'កូនអុកពណ៌ស្រាល · ដើរមុន',ready:'រួចរាល់',tap:'ចុចកូនអុក រួចចុចក្រឡាដែលបានបន្លិច។',playComputer:'លេងជាមួយកុំព្យូទ័រ',yourPace:'ក្តារអុករបស់អ្នក',choose:'ជ្រើសរើសកម្រិត រួចចាប់ផ្តើមលេង។',difficulty:'កម្រិត',beginner:'ដំបូង',medium:'មធ្យម',advanced:'កម្រិតខ្ពស់',beginnerDesc:'សម្រាប់អ្នកទើបចាប់ផ្តើម',mediumDesc:'បង្កើនការគិត និងយុទ្ធសាស្ត្រ',advancedDesc:'ប្រកួតប្រជែងកាន់តែខ្លាំង',playAI:'លេងជាមួយ AI',gameStatus:'ស្ថានភាព',readyPlay:'ត្រៀមខ្លួនលេង',noClock:'គ្មានកំណត់ពេល។ គិតតាមសម្រួល។',resign:'ចុះចាញ់',rules:'របៀបលេង',moves:'ប្រវត្តិដើរ',historyEmpty:'ប្រវត្តិដើរនឹងបង្ហាញនៅទីនេះ។',footer:'អុកខ្មែរ · មួយជំហានម្តងៗ',cancel:'បោះបង់',newGame:'លេងថ្មី',yourTurn:'ដល់វេនអ្នក',aiTurn:'AI កំពុងគិត',check:'អុក! ស្តេចរបស់អ្នកកំពុងរងការគំរាម។',checkAI:'អុក! ស្តេចរបស់ AI កំពុងរងការគំរាម។',yourDetail:'ជ្រើសកូនអុកពណ៌ស្រាល ដើម្បីមើលក្រឡាដែលអាចដើរ។',aiDetail:'កំពុងគិតជំហានបន្ទាប់…',red:'កូនអុកពណ៌ស្វាយចាស់',win:'អ្នកឈ្នះ!',lose:'AI ឈ្នះ',draw:'ស្មើ',checkmate:'អុកស្លាប់',stalemate:'គ្មានជំហានអាចដើរ',counting:'ស្មើតាមច្បាប់រាប់ចុងល្បែង។',bareKings:'នៅសល់តែស្តេចទាំងពីរ។',repetition:'ទីតាំងដដែលបីដង',resigned:'អ្នកបានចុះចាញ់។',again:'ជ្រើសកម្រិត រួចលេងម្តងទៀត។',newTitle:'ចាប់ផ្តើមលេងថ្មី?',newDetail:'ការប្រកួតបច្ចុប្បន្ននឹងបញ្ចប់ ហើយក្តារអុកនឹងចាប់ផ្តើមឡើងវិញ។',resignTitle:'ចុះចាញ់ការប្រកួតនេះ?',resignDetail:'AI នឹងឈ្នះការប្រកួតនេះ។',countStart:'ចាប់ផ្តើមរាប់',countStop:'ឈប់រាប់',countLabel:'ការរាប់ចុងល្បែង',claimDraw:'ទទួលយកលទ្ធផលស្មើ',error:'AI មានបញ្ហា។ សូមចុចសាកម្តងទៀត។',retry:'សាក AI ម្តងទៀត',startFirst:'ជ្រើសកម្រិត រួចចុចលេងជាមួយ AI។',noMoves:'កូនអុកនេះគ្មានជំហានអាចដើរ។',selected:'បានជ្រើស',legalMoves:'ជំហានអាចដើរ',pieceCount:'រាប់កូនអុក',boardCount:'រាប់ក្តារ'}
};
Object.assign(translations.en,{soundOn:'Sound on',soundOff:'Sound off',soundLabel:'Game sound',gameOver:'GAME OVER',viewBoard:'View board',playAgain:'Play again',wrongMove:'Invalid move. Choose a highlighted square.',protectKing:'Invalid move. You must move your king to safety, block the attack, or capture the attacker.',selectOwn:'Select one of your light pieces first.',waitAI:'Please wait for the AI to finish its move.',countStarted:'Endgame counting has started.',countStopped:'Endgame counting has stopped.',countAdvanced:'The endgame count has advanced.',countRemaining:'counted moves remaining',wonMate:'Checkmate! The AI king cannot escape. You win!',lostMate:'Checkmate! Your king cannot escape. The AI wins.',drawLimit:'Draw! The endgame counting limit has been reached.',drawAccepted:'Draw! The counting draw was accepted.',countAccepted:'Counting draw accepted',stalemateDetail:'Draw! There are no legal moves, and the king is not in check.'});
Object.assign(translations.km,{soundOn:'បើកសំឡេង',soundOff:'បិទសំឡេង',soundLabel:'សំឡេងល្បែង',gameOver:'ចប់ការប្រកួត',viewBoard:'មើលក្តារអុក',playAgain:'លេងម្តងទៀត',wrongMove:'ដើរមិនត្រឹមត្រូវ។ សូមជ្រើសក្រឡាដែលបានបន្លិច។',protectKing:'ដើរមិនត្រឹមត្រូវ។ អ្នកត្រូវជួយស្តេចឱ្យផុតពីការអុក ដោយដើរគេច បាំង ឬស៊ីកូនអុកដែលកំពុងគំរាម។',selectOwn:'សូមជ្រើសកូនអុកពណ៌ស្រាលរបស់អ្នកជាមុន។',waitAI:'សូមរង់ចាំ AI ដើររួចសិន។',countStarted:'បានចាប់ផ្តើមរាប់ចុងល្បែង។',countStopped:'បានឈប់រាប់ចុងល្បែង។',countAdvanced:'ចំនួនរាប់ចុងល្បែងបានកើនឡើង។',countRemaining:'ជំហានរាប់នៅសល់',wonMate:'អុកស្លាប់! ស្តេចរបស់ AI មិនអាចគេចបាន។ អ្នកឈ្នះ!',lostMate:'អុកស្លាប់! ស្តេចរបស់អ្នកមិនអាចគេចបាន។ AI ឈ្នះ!',drawLimit:'ស្មើ! ការរាប់ចុងល្បែងបានដល់កំណត់។',drawAccepted:'ស្មើ! បានទទួលយកលទ្ធផលស្មើតាមច្បាប់រាប់។',countAccepted:'បានទទួលយកលទ្ធផលស្មើ',stalemateDetail:'ស្មើ! គ្មានជំហានអាចដើរ ហើយស្តេចមិនកំពុងត្រូវអុក។'});
Object.assign(translations.en,{gameMode:'Game mode',modeAI:'Play AI',modePartner:'Play a partner',partner:'Partner',partnerTurn:'Partner’s turn',partnerWins:'Your partner wins',partnerCheck:'Ouk! Your partner’s king is in check.',partnerDetail:'Select one of your pieces to see its legal moves.',partnerWait:'Waiting for your partner’s move.',createRoom:'Create partner game',invitePartner:'Invite your partner',colorHelp:'Choose a color. The first selection reserves it.',ivoryColor:'Ivory',purpleColor:'Purple',available:'Choose',taken:'Reserved',yourColor:'Your color',waitingPartner:'Waiting for your partner to choose a color.',chooseColor:'Choose an available color to join.',bothReady:'Both players are ready. Ivory moves first.',spectator:'Watching',roomFull:'Both colors are reserved. You can watch this game.',connecting:'Connecting…',connected:'Connected',creating:'Creating your game…',saving:'Saving…',reconnecting:'Connection interrupted. Reconnecting…',roomUnavailable:'Cannot connect. Check your connection and try again.',roomNotFound:'This game link was not found.',colorTaken:'That color is already reserved. Choose the other color.',notYourSeat:'Choose an available color before playing.',notYourTurn:'Please wait for your partner’s move.',gameChanged:'The game changed. The board has been updated.',gameFinished:'This game has finished.',cannotCount:'Counting is not available in this position.',invalidRequest:'The request could not be completed.',forbidden:'Please reopen this game link and try again.',newPartner:'Create a new partner game',switchMode:'Change game mode?',switchDetail:'Your current partner game will remain available at its link. An AI game will be reset.',continue:'Continue',partnerResign:'Your partner will win this game.',partnerResigned:'Your partner resigned. You win!',playerResigned:'A player resigned.',wonPartnerMate:'Checkmate! Your partner’s king cannot escape. You win!',lostPartnerMate:'Checkmate! Your king cannot escape. Your partner wins.',ivoryWins:'Ivory wins',purpleWins:'Purple wins',selectYourPiece:'Select one of your pieces first.',shareRoomAgain:'Start a new partner game and share its new link.',partnerHeading:'PLAY WITH A PARTNER',partnerChoose:'Create a game, share the link, and choose your colors.',ivoryFirst:'Ivory moves first.'});
Object.assign(translations.km,{gameMode:'របៀបលេង',modeAI:'លេងជាមួយ AI',modePartner:'លេងជាមួយដៃគូ',partner:'ដៃគូ',partnerTurn:'វេនដៃគូ',partnerWins:'ដៃគូរបស់អ្នកឈ្នះ',partnerCheck:'អុក! ស្តេចដៃគូកំពុងត្រូវអុក។',partnerDetail:'ជ្រើសកូនអុករបស់អ្នក ដើម្បីមើលជំហានអាចដើរ។',partnerWait:'កំពុងរង់ចាំដៃគូដើរ។',createRoom:'បង្កើតល្បែងជាមួយដៃគូ',invitePartner:'អញ្ជើញដៃគូ',colorHelp:'ជ្រើសរើសពណ៌។ អ្នកជ្រើសមុនទទួលបានពណ៌នោះ។',ivoryColor:'ពណ៌ស',purpleColor:'ពណ៌ស្វាយ',available:'ជ្រើសរើស',taken:'មានអ្នកជ្រើសរួច',yourColor:'ពណ៌របស់អ្នក',waitingPartner:'រង់ចាំដៃគូជ្រើសពណ៌។',chooseColor:'ជ្រើសពណ៌ដែលនៅទំនេរ ដើម្បីចូលលេង។',bothReady:'អ្នកទាំងពីររួចរាល់។ ពណ៌សដើរមុន។',spectator:'កំពុងមើល',roomFull:'ពណ៌ទាំងពីរមានអ្នកជ្រើសរួច។ អ្នកអាចមើលការប្រកួតនេះ។',connecting:'កំពុងភ្ជាប់…',connected:'បានភ្ជាប់',creating:'កំពុងបង្កើតល្បែង…',saving:'កំពុងរក្សាទុក…',reconnecting:'ការតភ្ជាប់បានដាច់។ កំពុងភ្ជាប់ឡើងវិញ…',roomUnavailable:'មិនអាចភ្ជាប់បាន។ សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកម្ដងទៀត។',roomNotFound:'រកមិនឃើញល្បែងនេះ។',colorTaken:'ពណ៌នេះមានអ្នកជ្រើសរួច។ សូមជ្រើសពណ៌ផ្សេង។',notYourSeat:'សូមជ្រើសពណ៌ដែលនៅទំនេរសិន។',notYourTurn:'សូមរង់ចាំដៃគូដើរ។',gameChanged:'ល្បែងបានផ្លាស់ប្តូរ។ ក្តារអុកបានធ្វើបច្ចុប្បន្នភាព។',gameFinished:'ការប្រកួតនេះបានបញ្ចប់។',cannotCount:'មិនអាចចាប់ផ្តើមរាប់នៅទីតាំងនេះបានទេ។',invalidRequest:'មិនអាចបំពេញសំណើនេះបានទេ។',forbidden:'សូមបើកតំណល្បែងឡើងវិញ ហើយសាកម្ដងទៀត។',newPartner:'បង្កើតល្បែងថ្មីជាមួយដៃគូ',switchMode:'ប្តូររបៀបលេង?',switchDetail:'ល្បែងជាមួយដៃគូអាចបើកវិញតាមតំណដដែល។ ល្បែង AI នឹងចាប់ផ្តើមឡើងវិញ។',continue:'បន្ត',partnerResign:'ដៃគូរបស់អ្នកនឹងឈ្នះ។',partnerResigned:'ដៃគូបានចុះចាញ់។ អ្នកឈ្នះ!',playerResigned:'អ្នកលេងម្នាក់បានចុះចាញ់។',wonPartnerMate:'អុកស្លាប់! ស្តេចដៃគូមិនអាចគេចបាន។ អ្នកឈ្នះ!',lostPartnerMate:'អុកស្លាប់! ស្តេចអ្នកមិនអាចគេចបាន។ ដៃគូឈ្នះ។',ivoryWins:'ពណ៌សឈ្នះ',purpleWins:'ពណ៌ស្វាយឈ្នះ',selectYourPiece:'សូមជ្រើសកូនអុករបស់អ្នកជាមុន។',shareRoomAgain:'បង្កើតល្បែងថ្មីជាមួយដៃគូ រួចចែករំលែកតំណថ្មី។',partnerHeading:'លេងជាមួយដៃគូ',partnerChoose:'បង្កើតល្បែង ចែករំលែកតំណ ហើយជ្រើសពណ៌។',ivoryFirst:'ពណ៌សដើរមុន។'});
let mobileApp=null;
let mode='ai',room=null,connectionState='';
let lang='en',state=initial(),selected=null,targets=[],started=false,finished=null,level='beginner',worker=null,requestId=0,history=[],positions=[positionKey(state)],last=null,failed=false,pendingConfirm=null;
const tr=k=>translations[lang][k]||k;
const sound=new GameSound();
const comments=new RoomComments(()=>lang,()=>profile.open());
const partner=new PartnerConnection(syncRoom,roomStatus);
const profile=new PlayerProfile(()=>lang,()=>{comments.setProfileReady(!!profile.data?.name);renderPlayers();renderRoomLobby();if(mode==='partner'&&partner.id)partner.poll();});
const playerSide=()=>mode==='ai'?'w':room?.myColor||null;
const sideName=side=>mode==='ai'?(side==='w'?tr('you'):'AI'):(side===playerSide()?tr('you'):tr(side==='w'?'ivoryColor':'purpleColor'));
const resultKey=()=>finished.winner===null?'draw':finished.winner===playerSide()?'win':mode==='ai'?'lose':playerSide()?'partnerWins':finished.winner==='w'?'ivoryWins':'purpleWins';
const checkKey=()=>state.turn===playerSide()?'check':mode==='ai'?'checkAI':'partnerCheck';

let notice=null,announcedResult=null;
document.addEventListener('click',()=>sound.unlock(),{capture:true});
function notify(key,tone='info'){notice={key,tone};renderFeedback();}
function resultDetail(){
 if(finished.reason==='checkmate')return mode==='ai'?tr(finished.winner==='w'?'wonMate':'lostMate'):playerSide()?tr(finished.winner===playerSide()?'wonPartnerMate':'lostPartnerMate'):tr(resultKey())+' · '+tr('checkmate');
 if(finished.reason==='resigned'&&mode==='partner')return tr(!playerSide()?'playerResigned':finished.winner===playerSide()?'partnerResigned':'resigned');
 if(finished.reason==='counting')return tr(state.count&&state.count.current>=state.count.limit?'drawLimit':'counting');
 if(finished.reason==='countAccepted')return tr('drawAccepted');
 if(finished.reason==='stalemate')return tr('stalemateDetail');
 return tr(finished.reason);
}
function renderFeedback(){
 $('sound').textContent=tr(sound.enabled?'soundOn':'soundOff');$('sound').setAttribute('aria-checked',String(sound.enabled));$('sound').setAttribute('aria-label',tr('soundLabel'));
 const text=finished?resultDetail():notice?tr(notice.key):started&&inCheck(state)?tr(checkKey()):'';
 $('game-notice').hidden=!text;$('game-notice').textContent=text;$('game-notice').dataset.tone=finished?'result':notice?.tone||(inCheck(state)?'check':'info');
 $('count-display').hidden=!state.count;$('count-display').replaceChildren();
 if(state.count){const count=state.count,remaining=Math.max(0,count.limit-count.current),label=document.createElement('span'),number=document.createElement('strong');
  label.textContent=`${tr(count.kind==='piece'?'pieceCount':'boardCount')} · ${sideName(count.side)}${remaining<=5?' · '+remaining+' '+tr('countRemaining'):''}`;
  number.textContent=`${count.current} / ${count.limit}`;$('count-display').append(label,number);$('count-display').classList.toggle('near-limit',remaining<=5);
 }
 if(finished){$('result-title').textContent=tr(resultKey());$('result-detail').textContent=resultDetail();}
}
function announceEnd(){
 if(!finished||announcedResult===finished)return;announcedResult=finished;stopWorker();
 if($('confirm-dialog').open){$('confirm-dialog').close();pendingConfirm=null;}
 sound.play(finished.winner===null?'draw':finished.winner===playerSide()?'win':'lose',.16);
 $('result-dialog').showModal();
}
$('sound').onclick=()=>{sound.setEnabled(!sound.enabled);renderFeedback();if(sound.enabled)sound.play('start');};
$('play-again').onclick=()=>{$('result-dialog').close();if(mode==='partner')createRoom();else newGame();};
function haptic(){try{window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();}catch{}}
function render(){
 $('board').replaceChildren();const check=inCheck(state)?state.board.indexOf(state.turn==='w'?'K':'k'):-1;
 const flipped=playerSide()==='b';
 for(let display=0;display<64;display++){const i=flipped?63-display:display;
  const cell=document.createElement('button'),p=state.board[i],type=p?.toUpperCase();cell.className='cell';cell.dataset.index=i;
  if(i===selected)cell.classList.add('selected');if(targets.some(m=>m.to===i))cell.classList.add('legal');if(last&&(last.from===i||last.to===i))cell.classList.add('last');if(i===check)cell.classList.add('check');
  cell.setAttribute('aria-label',`${square(i)}${p?`, ${sideName(color(p))} ${lang==='km'?names[type]:english[type]}`:''}${targets.some(m=>m.to===i)?', '+tr('legalMoves'):''}`);
  cell.setAttribute('aria-pressed',String(selected===i));
  if(display%8===0){const rank=document.createElement('span');rank.className='rank';rank.textContent=8-(i>>3);rank.setAttribute('aria-hidden','true');cell.append(rank);}
  if(p){const piece=document.createElement('img');piece.className=`piece ${color(p)}`;piece.src=`./pieces/${color(p)}${type}.svg`;piece.alt='';piece.draggable=false;piece.width=100;piece.height=100;cell.title=`${names[type]} · ${english[type]}`;cell.append(piece);}
  $('board').append(cell);
 }
 const mine=playerSide(),other=mine==='b'?'w':'b';
 document.querySelector('.files').replaceChildren(...(flipped?'hgfedcba':'abcdefgh').split('').map(letter=>{const span=document.createElement('span');span.textContent=letter;return span;}));
 renderPlayers();
 $('thinking').hidden=mode!=='ai'||!started||!!finished||state.turn!=='b'||failed;
 $('start').textContent=failed?tr('retry'):tr(started?'newGame':'playAI');$('start').hidden=mode==='partner';$('levels').hidden=mode==='partner';
 $('resign').disabled=!started||!!finished||!mine||(mode==='partner'&&partner.busy);
 document.querySelectorAll('input[name="level"]').forEach(el=>el.disabled=started&&!finished);
 $('turn-badge').textContent=finished?tr(resultKey()):tr(started?(state.turn===mine?'yourTurn':mode==='ai'?'thinking':'partnerTurn'):'ready');
 $('turn-badge').classList.toggle('active',started&&!finished&&state.turn===mine);
 $('status').classList.toggle('finished',!!finished);
 if(finished){$('status').textContent=tr(resultKey());$('status-detail').textContent=tr(finished.reason)+' '+tr(mode==='ai'?'again':'shareRoomAgain');}
 else if(failed){$('status').textContent=tr('error');$('status-detail').textContent='';}
 else if(!started){$('status').textContent=tr(mode==='partner'?(room?.myColor?'waitingPartner':'chooseColor'):'readyPlay');$('status-detail').textContent=tr(mode==='partner'?'ivoryFirst':'noClock');}
 else{$('status').textContent=tr(check>=0?checkKey():(state.turn===mine?'yourTurn':mode==='ai'?'aiTurn':'partnerTurn'));$('status-detail').textContent=tr(state.turn===mine?(mode==='ai'?'yourDetail':'partnerDetail'):(mode==='ai'?'aiDetail':'partnerWait'));}
 if(state.count&&!finished)$('status-detail').textContent+=` · ${tr(state.count.kind==='piece'?'pieceCount':'boardCount')} ${state.count.current}/${state.count.limit} (${sideName(state.count.side)})`;
 const opt=mine?countOption(state,mine):null;$('count').hidden=!started||!!finished||!mine||state.turn!==mine||(!opt&&!state.count);$('count').disabled=mode==='partner'&&partner.busy;
 $('count').textContent=tr(state.count?(state.count.side===mine?'countStop':'claimDraw'):'countStart');
 renderRoomLobby();
 renderHistory();renderFeedback();announceEnd();
}
function renderPlayers(){
 const mine=playerSide(),bottom=mine||'w',top=bottom==='w'?'b':'w';
 const online=mode==='partner',self=online?room?.players?.[bottom]:profile.data,opponent=room?.players?.[top];
 $('self-name').textContent=self?.name?self.name+(mine?' · '+tr('you'):''):online?tr(bottom==='w'?'ivoryColor':'purpleColor'):tr('you');
 $('opponent').textContent=online?(opponent?.name||tr(top==='w'?'ivoryColor':'purpleColor')):'Chaktrang AI';
 $('opponent-level').textContent=online?tr(top==='w'?'ivoryColor':'purpleColor'):`${tr(level)} · ${tr('red')}`;
 $('self-color').textContent=online?tr(bottom==='w'?'ivoryColor':'purpleColor'):tr('ivory');
 $('opponent-avatar').textContent=online?(top==='w'?'ស':'ស្វ'):'AI';$('self-avatar').textContent=bottom==='w'?'ស':'ស្វ';
 for(const [id,side] of [['self-avatar',bottom],['opponent-avatar',top]]){$(id).classList.toggle('side-purple',side==='b');$(id).classList.toggle('side-white',side==='w');}
 for(const [id,data] of [['self-record',self],['opponent-record',opponent]]){$(id).hidden=!online||!data;$(id).textContent=online&&data?profile.stats(data):'';}
}
function renderHistory(){
 $('move-total').textContent=String(history.length);$('history').replaceChildren();
 if(!history.length){const p=document.createElement('p');p.className='empty';p.textContent=tr('historyEmpty');$('history').append(p);return;}
 for(let i=0;i<history.length;i+=2){const row=document.createElement('div');row.className='move-row';const n=document.createElement('span');n.className='move-number';n.textContent=`${i/2+1}.`;row.append(n);
  for(const item of history.slice(i,i+2)){const text=document.createElement('span');text.className='move-text';text.textContent=item.notation;text.title=(lang==='km'?names:english)[item.piece.toUpperCase()];row.append(text);}$('history').append(row);
 }
 $('history').scrollTop=$('history').scrollHeight;
}
function stopWorker(){requestId++;worker?.terminate();worker=null;}
function playMove(m){
 const previousCount=state.count?.current;
 const p=state.board[m.from],capture=state.board[m.to];state=apply(state,m);last=m;selected=null;targets=[];
 const promoted=p.toUpperCase()==='P'&&state.board[m.to].toUpperCase()==='F';
 history.push({piece:p,notation:`${square(m.from)}${capture?'×':'–'}${square(m.to)}${promoted?'=F':''}${inCheck(state)?'+':''}`});
 positions.push(positionKey(state));finished=outcome(state);if(!finished&&positions.filter(k=>k===positionKey(state)).length>=3)finished={winner:null,reason:'repetition'};
 notice=null;sound.play(capture?'capture':'move');
 if(!finished){
  if(state.count&&state.count.current!==previousCount){notice={key:'countAdvanced',tone:'count'};sound.play('count',.13);}
  if(inCheck(state)){notice={key:checkKey(),tone:'check'};sound.play('check',.20);}
 }
 $('board-note').textContent=tr('tap');haptic();render();if(started&&!finished&&state.turn==='b')requestAI();
}
function ensureWorker(){
 if(worker)return;
 worker=new Worker(new URL('./ai-worker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{if(data.id!==requestId||mode!=='ai'||finished)return;if(data.error||!data.move){aiError();return;}const valid=legal(state).find(m=>m.from===data.move.from&&m.to===data.move.to);if(!valid){aiError();return;}playMove(valid);};
 worker.onerror=()=>aiError();
}
function requestAI(){
 requestId++;failed=false;
 if(!state.count){const option=countOption(state,'b');if(option){state={...state,count:option};notice={key:'countStarted',tone:'count'};sound.play('countStart',.15);}}
 else if(state.count.side==='w'&&countOption(state,'b')){finished={winner:null,reason:'countAccepted'};render();return;}
 render();try{ensureWorker();worker.postMessage({state,level,id:requestId});}catch{aiError();}
}
function aiError(){stopWorker();failed=true;render();}
function newGame(){stopWorker();sound.play('start');notice=null;announcedResult=null;if($('result-dialog').open)$('result-dialog').close();level=document.querySelector('input[name="level"]:checked').value;state=initial();positions=[positionKey(state)];history=[];last=null;selected=null;targets=[];finished=null;failed=false;started=true;$('board-note').textContent=tr('tap');render();try{ensureWorker();}catch{}}
function confirmAction(type,action){pendingConfirm=action;$('confirm-title').textContent=tr(type==='new'?'newTitle':'resignTitle');$('confirm-detail').textContent=tr(type==='new'?'newDetail':'resignDetail');$('confirm').textContent=tr(type==='new'?'newGame':'resign');$('confirm-dialog').showModal();}
$('board').addEventListener('click',e=>{
 const cell=e.target.closest('.cell');if(!cell)return;const i=Number(cell.dataset.index);
 if(!started){notify(mode==='partner'?(room?.myColor?'waitingPartner':'chooseColor'):'startFirst');return;}
 if(mode==='partner'&&partner.busy){notify('saving');return;}
 if(mode==='partner'&&!playerSide()){notify('roomFull');return;}
 if(finished){$('result-dialog').showModal();return;}
 if(state.turn!==playerSide()){notify(mode==='ai'?'waitAI':'notYourTurn');return;}
 const move=targets.find(m=>m.to===i);if(move){if(mode==='partner')partner.action('move',move);else playMove(move);return;}
 if(i===selected){selected=null;targets=[];notice=null;$('board-note').textContent=tr('tap');}
 else if(state.board[i]&&color(state.board[i])===playerSide()){
  selected=i;targets=legal(state,i);notice=null;
  $('board-note').textContent=targets.length?`${names[state.board[i].toUpperCase()]} · ${targets.length} ${tr('legalMoves')}`:tr('noMoves');
  if(!targets.length){notice={key:'noMoves',tone:'error'};sound.play('invalid');}
 }else{
  notify(selected===null?(mode==='ai'?'selectOwn':'selectYourPiece'):inCheck(state)?'protectKing':'wrongMove','error');sound.play('invalid');
  $('board').querySelectorAll('.invalid-target').forEach(el=>el.classList.remove('invalid-target'));cell.classList.add('invalid-target');
  return;
 }
 haptic();render();$('board').querySelector(`[data-index="${i}"]`)?.focus({preventScroll:true});
});
$('board').addEventListener('keydown',e=>{const cell=e.target.closest('.cell');if(!cell)return;const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[e.key];if(step){e.preventDefault();const index=Math.max(0,Math.min(63,Number(cell.dataset.index)+step*(playerSide()==='b'?-1:1)));$('board').querySelector(`[data-index="${index}"]`).focus();}});
$('start').onclick=()=>{if(failed){requestAI();return;}if(started&&!finished&&history.length)confirmAction('new',newGame);else newGame();};
$('resign').onclick=()=>{confirmAction('resign',()=>{if(mode==='partner'){partner.action('resign');return;}stopWorker();finished={winner:'b',reason:'resigned'};render();});if(mode==='partner')$('confirm-detail').textContent=tr('partnerResign');};
$('cancel').onclick=()=>$('confirm-dialog').close();$('confirm').onclick=()=>{$('confirm-dialog').close();pendingConfirm?.();pendingConfirm=null;};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('input[name="level"]').forEach(el=>el.onchange=()=>{level=el.value;render();});
$('count').onclick=()=>{if(mode==='partner'){partner.action('count');return;}if(state.count?.side==='b'){finished={winner:null,reason:'countAccepted'};render();return;}const stopping=!!state.count;state={...state,count:stopping?null:countOption(state,'w')};notice={key:stopping?'countStopped':'countStarted',tone:'count'};sound.play(stopping?'countStop':'countStart');render();};
$('copy-invite').onclick=()=> $('share').onclick();
let copyTimer;
$('share').onclick=async()=>{
 const url=shareUrl();
 try{await navigator.clipboard.writeText(url);$('share').textContent=tr('copied');clearTimeout(copyTimer);copyTimer=setTimeout(()=>$('share').textContent=tr('share'),2500);}
 catch{$('share-url').value=url;$('share-dialog').showModal();$('share-url').focus();$('share-url').select();}
};
function shareUrl(){const url=new URL(window.location.href);url.search='';url.hash='';if(mode==='partner'&&room)url.searchParams.set('room',room.id);return url.href;}
function renderRoomLobby(){
 mobileApp?.render();
 $('partner-lobby').hidden=mode!=='partner';document.body.classList.toggle('partner-game',mode==='partner');
 document.querySelector('[data-i18n="playComputer"]').textContent=tr(mode==='partner'?'partnerHeading':'playComputer');
 document.querySelector('[data-i18n="choose"]').textContent=tr(mode==='partner'?'partnerChoose':'choose');
 document.querySelectorAll('input[name="mode"]').forEach(el=>el.checked=el.value===mode);
 if(mode!=='partner')return;
 $('partner-lobby').classList.toggle('in-play',!!room?.ready);
 $('create-room').hidden=!!room;$('create-room').disabled=partner.busy||profile.loading||connectionState==='connecting';$('room-controls').hidden=!room;
 $('connection-status').textContent=tr(connectionState||'partnerChoose');$('connection-status').dataset.error=String(['roomUnavailable','reconnecting','roomNotFound'].includes(connectionState));
 if(!room)return;
 $('invite-link').value=shareUrl();
 for(const [side,id,label] of [['w','claim-white','white-seat'],['b','claim-black','black-seat']]){
  $(id).disabled=partner.busy||room.slots[side]||!!room.myColor;$(id).classList.toggle('your-seat',room.myColor===side);$(label).textContent=(room.players?.[side]?.name?room.players[side].name+' · ':'')+tr(room.myColor===side?'yourColor':room.slots[side]?'taken':'available');
 }
 $('room-instruction').textContent=tr(room.ready?(room.myColor?'bothReady':'roomFull'):room.myColor?'waitingPartner':'chooseColor');
}
function roomStatus(code){
 if(mode!=='partner')return;
 if(code!=='idle')connectionState=translations.en[code]?code:'roomUnavailable';
 if(['colorTaken','notYourSeat','notYourTurn','gameChanged','gameFinished','wrongMove','cannotCount','forbidden','invalidRequest'].includes(code)){notify(code,'error');if(code==='wrongMove')sound.play('invalid');}
 renderRoomLobby();$('resign').disabled=!started||!!finished||!playerSide()||partner.busy;$('count').disabled=partner.busy;
}
function syncRoom(next){
 if(mode!=='partner')return;
 comments.setRoom(next.id);
 if(next.myColor&&next.players?.[next.myColor])profile.adopt(next.players[next.myColor]);
 if(room?.id===next.id&&room.revision===next.revision){room=next;renderRoomLobby();renderPlayers();return;}
 const previous=room;room=next;const url=new URL(window.location.href);url.searchParams.set('room',room.id);window.history.replaceState(null,'',url);
 const changed=previous&&next.history.length>previous.history.length;
 state=next.state;history=next.history;finished=next.result;started=next.ready;failed=false;selected=null;targets=[];notice=null;last=history.at(-1)||null;
 if(changed){sound.play(last.capture?'capture':'move');haptic();}
 if(previous&&!finished){
  if(!previous.state.count&&state.count){notice={key:'countStarted',tone:'count'};sound.play('countStart',.13);}
  else if(previous.state.count&&!state.count){notice={key:'countStopped',tone:'count'};sound.play('countStop');}
  else if(state.count&&state.count.current!==previous.state.count?.current){notice={key:'countAdvanced',tone:'count'};sound.play('count',.13);}
  if(changed&&inCheck(state)){notice={key:checkKey(),tone:'check'};sound.play('check',.2);}
 }
 $('board-note').textContent=tr('tap');render();
}
function resetLocal(){comments.setRoom(null);stopWorker();state=initial();history=[];positions=[positionKey(state)];last=null;selected=null;targets=[];notice=null;finished=null;announcedResult=null;started=false;failed=false;}
function setMode(next){partner.close();room=null;connectionState='';mode=next;resetLocal();const url=new URL(window.location.href);url.searchParams.delete('room');window.history.replaceState(null,'',url);render();}
function createRoom(){resetLocal();room=null;connectionState='creating';render();partner.create();}
$('create-room').onclick=createRoom;
$('claim-white').onclick=()=>partner.action('claim',{color:'w'});$('claim-black').onclick=()=>partner.action('claim',{color:'b'});
for(const input of document.querySelectorAll('input[name="mode"]'))input.onchange=()=>{
 if(input.value===mode)return;
 const next=input.value;
 if(started&&!finished){pendingConfirm=()=>setMode(next);$('confirm-title').textContent=tr('switchMode');$('confirm-detail').textContent=tr('switchDetail');$('confirm').textContent=tr('continue');$('confirm-dialog').showModal();renderRoomLobby();}
 else setMode(next);
};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='partner')partner.poll();});
window.addEventListener('online',()=>{if(mode==='partner')partner.poll();});
const ruleData={
 en:[['ស្តេច · King','One square in any direction.'],['នាង · Neang','One square diagonally.'],['គោល · Koul','One square diagonally, or forward.'],['សេះ · Horse','An L-shaped jump: two squares, then one across.'],['ទូក · Boat','Any distance along an unobstructed row or column.'],['ត្រី · Fish','One square forward; captures diagonally. Promotes on its sixth rank to a diagonal stepper.']],
 km:[['ស្តេច','ដើរមួយក្រឡាទៅគ្រប់ទិស។'],['នាង','ដើរបញ្ឆិតមួយក្រឡា។'],['គោល','ដើរបញ្ឆិតមួយក្រឡា ឬទៅមុខមួយក្រឡា។'],['សេះ','លោតជារាងអក្សរ L៖ ពីរក្រឡា និងមួយក្រឡាទៅចំហៀង។'],['ទូក','ដើរត្រង់តាមជួរដេក ឬជួរឈរ ដែលគ្មានកូនអុករាំង។'],['ត្រី','ដើរទៅមុខមួយក្រឡា និងស៊ីបញ្ឆិត។ ដល់ជួរទី៦ ក្លាយជាត្រីបក ដើរបញ្ឆិតមួយក្រឡា។']]
};
function renderRules(){
 const container=$('rules-content');container.replaceChildren();
 const intro=document.createElement('p');intro.textContent=lang==='km'?'គោលដៅគឺអុកស្លាប់ស្តេចគូប្រកួត។ ពណ៌សដើរមុន។':'Checkmate the opposing king. Ivory moves first.';container.append(intro);
 ruleData[lang].forEach(([name,text])=>{const row=document.createElement('div');row.className='rule-row';const n=document.createElement('span');n.className='rule-name';n.textContent=name;const t=document.createElement('span');t.textContent=text;row.append(n,t);container.append(row);});
 const paragraphs=lang==='km'?[
 'ជំហានដំបូង៖ ស្តេចអាចលោតដូចសេះទៅជួរទី២ ដោយមិនស៊ី និងមិនកំពុងត្រូវអុក។ បាត់សិទ្ធិលោត បើទូកគូប្រកួតចូលជួរដេក ឬជួរឈរដូចស្តេច។ នាងអាចលោតទៅមុខពីរក្រឡាដោយមិនស៊ី។',
 'នៅសល់កូនអុកបី ឬតិច អ្នកអាចចាប់ផ្តើមរាប់។ ពេលនៅសល់តែស្តេច និងគ្មានត្រីមិនទាន់បក កំណត់រាប់អាស្រ័យលើកូនអុកគូប្រកួត។ ចំនួនបង្ហាញក្នុងស្ថានភាព។',
 'នេះជាកំណែហាត់លេង តាមច្បាប់ Cambodian របស់ PyChess។ កម្រិត AI ខុសគ្នាតាមជម្រៅស្វែងរក និងពេលគិត។ មិនទាន់មានចំណាត់ថ្នាក់កម្លាំងផ្លូវការ។'
 ]:[
 'First moves: the king may make a non-capturing knight jump to its second rank when not checked. Rook alignment removes that right. The original Neang may jump two squares forward without capturing.',
 'Counting: with at most three pieces, you may start a 64-move count. A lone king with no unpromoted fish uses a material-based limit: 8, 16, 22, 32, 44, or 64. The counter is shown during play. Threefold repetition and stalemate draw.',
 'Practice rules follow the PyChess Cambodian profile. AI levels use different search depths and thinking budgets; they are not rated playing strengths.'
 ];for(const text of paragraphs){const p=document.createElement('p');p.textContent=text;container.append(p);}
 const link=document.createElement('a');link.href='https://www.pychess.org/variants/cambodian';link.target='_blank';link.rel='noopener noreferrer';link.textContent=lang==='km'?'អានច្បាប់លម្អិតនៅ PyChess':'Read the full rules on PyChess';container.append(link);
 const credit=document.createElement('p');credit.className='piece-credit';
 credit.append(document.createTextNode(lang==='km'?'រូបកូនអុក៖ ':'Piece artwork: '));
 const artist=document.createElement('a');artist.href='https://github.com/Fulmene/makruk-pieces-image';artist.target='_blank';artist.rel='noopener noreferrer';artist.textContent='Fulmene';credit.append(artist,document.createTextNode(' · '));
 const license=document.createElement('a');license.href='https://creativecommons.org/licenses/by-sa/4.0/';license.target='_blank';license.rel='noopener noreferrer';license.textContent='CC BY-SA 4.0';credit.append(license,document.createTextNode(' · '));
 const details=document.createElement('a');details.href='./pieces/ATTRIBUTION.txt';details.target='_blank';details.textContent=lang==='km'?'ប្រភព':'Sources';credit.append(details);container.append(credit);
}
$('rules').onclick=()=>{renderRules();$('rules-dialog').showModal();};
$('language').onclick=()=>{lang=lang==='en'?'km':'en';document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));$('language').textContent=lang==='en'?'ខ្មែរ':'EN';$('board-note').textContent=tr('tap');render();comments.render();profile.render();mobileApp?.render();};
function initTelegram(){try{const tg=window.Telegram?.WebApp;if(!tg||!tg.initData)return;tg.ready();tg.expand();tg.setHeaderColor?.('#24243a');tg.setBackgroundColor?.('#f5f5f8');const safe=()=>{document.body.style.setProperty('--tg-safe-top',Math.max(tg.safeAreaInset?.top||0,tg.contentSafeAreaInset?.top||0)+'px');document.body.style.setProperty('--tg-safe-bottom',Math.max(tg.safeAreaInset?.bottom||0,tg.contentSafeAreaInset?.bottom||0)+'px');};safe();tg.onEvent?.('safeAreaChanged',safe);tg.onEvent?.('contentSafeAreaChanged',safe);}catch{}}
window.addEventListener('load',initTelegram);
mobileApp=new MobileApp(()=>({lang,mode,room,level,started,finished,failed,busy:partner.busy,loading:profile.loading||connectionState==='connecting',profileLoading:profile.loading}),{
 profile:()=>profile.open(),play:()=>$('start').onclick(),partner:()=>{const input=document.querySelector('input[name="mode"][value="partner"]');if(mode!=='partner'){input.checked=true;input.onchange();}}
});
const invitedRoom=new URL(window.location.href).searchParams.get('room');if(invitedRoom){mode='partner';connectionState='connecting';}render();
// Establish the guest cookie before a room or comments can issue parallel requests.
profile.init().then(()=>{if(invitedRoom&&mode==='partner')partner.open(invitedRoom);});

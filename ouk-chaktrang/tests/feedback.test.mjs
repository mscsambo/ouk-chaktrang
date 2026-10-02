import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as engine from '../public/engine.js';
class Element{
 constructor(){this.children=[];this.dataset={};this.hidden=false;this.open=false;this.textContent='';this.listeners={};this.attrs={};const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x),contains:x=>classes.has(x)};}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.listeners[k]=fn;}focus(){}select(){}close(){this.open=false;}showModal(){this.open=true;this.openCount=(this.openCount||0)+1;}
 querySelector(selector){const i=selector.match(/data-index="(\d+)"/);return i?this.children.find(x=>x.dataset.index===Number(i[1])||x.dataset.index===i[1]):null;}
 querySelectorAll(){return [];}closest(){return this;}
}
const ids=new Map(),get=id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
const radio={value:'beginner'},sounds=[];
const context=vm.createContext({...engine,URL,console,setTimeout,clearTimeout,document:{getElementById:get,createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){},querySelector:selector=>selector.startsWith('input')?radio:get(selector),querySelectorAll:selector=>selector.includes('level')?[radio]:[],documentElement:{},body:new Element()},window:{location:{href:'https://game.example/'},history:{replaceState(){}},addEventListener(){}},MobileApp:class{render(){}},PlayerProfile:class{data=null;loading=false;init(){return Promise.resolve();}adopt(p){this.data=p;}render(){}stats(p){return `Wins ${p.stats.wins} · Losses ${p.stats.losses} · Draws ${p.stats.draws}`;}},RoomComments:class{setRoom(){}render(){}setProfileReady(){}},PartnerConnection:class{busy=false;actions=[];close(){}poll(){}action(type,data){this.actions.push({type,data});}},GameSound:class{enabled=true;unlock(){return Promise.resolve();}setEnabled(v){this.enabled=v;}play(k){if(this.enabled)sounds.push(k);}},Worker:class{postMessage(){}terminate(){}}});
const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',"'https://game.example/app.js'");
vm.runInContext(source+`\nglobalThis.testAPI={partnerLoad(r){mode='partner';syncRoom(r);},actions:()=>partner.actions,side:playerSide,start:newGame,render,move:playMove,load(s){stopWorker();state=s;started=true;finished=null;announcedResult=null;notice=null;selected=null;targets=[];history=[];positions=[positionKey(s)];render();},get:()=>({state,selected,finished}),click(i){$('board').listeners.click({target:$('board').children.find(cell=>Number(cell.dataset.index)===i)});}};`,context);
const api=context.testAPI,idx=s=>(8-Number(s[1]))*8+'abcdefgh'.indexOf(s[0]);
const fixture=(pieces,turn='w')=>{const s=engine.initial();s.board.fill(null);s.rights={wK:false,wQ:false,bK:false,bQ:false};s.turn=turn;for(const [sq,p]of Object.entries(pieces))s.board[idx(sq)]=p;return s;};
api.start();api.click(idx('a3'));const before=engine.positionKey(api.get().state);api.click(idx('a5'));
assert.equal(engine.positionKey(api.get().state),before);assert.equal(api.get().selected,idx('a3'));assert.match(get('game-notice').textContent,/Invalid move/);assert.equal(sounds.at(-1),'invalid');
api.click(idx('a4'));assert.equal(api.get().state.board[idx('a4')],'P');assert(sounds.includes('move'));
api.load(fixture({a1:'K',h8:'k',a3:'r',b2:'r'},'b'));api.move({from:idx('a3'),to:idx('a2')});
assert.equal(api.get().finished.reason,'checkmate');assert(get('result-dialog').open);assert.match(get('result-detail').textContent,/Your king cannot escape/);assert.equal(sounds.at(-1),'lose');
const soundsAfterEnd=sounds.length,opens=get('result-dialog').openCount;api.render();assert.equal(sounds.length,soundsAfterEnd);assert.equal(get('result-dialog').openCount,opens);
api.start();assert(!get('result-dialog').open);assert(get('count-display').hidden);
let s=fixture({a1:'K',h8:'k',e8:'r'});s.count={side:'w',kind:'piece',current:14,limit:16};api.load(s);api.move({from:idx('a1'),to:idx('b1')});
assert.equal(api.get().state.count.current,15);assert.equal(get('count-display').children[1].textContent,'15 / 16');assert(sounds.includes('count'));assert(get('count-display').classList.contains('near-limit'));
s=fixture({a1:'K',h8:'k',e8:'r'});s.count={side:'w',kind:'piece',current:15,limit:16};api.load(s);api.move({from:idx('a1'),to:idx('b1')});assert.equal(api.get().finished.reason,'counting');assert.match(get('result-detail').textContent,/counting limit/);
api.load(fixture({a1:'K',h8:'k',e8:'r'}));get('count').onclick();assert(api.get().state.count);assert.match(get('game-notice').textContent,/started/);get('count').onclick();assert.equal(api.get().state.count,null);assert.match(get('game-notice').textContent,/stopped/);
get('sound').onclick();assert.equal(get('sound').attrs['aria-checked'],'false');const mutedAt=sounds.length;api.start();assert.equal(sounds.length,mutedAt);get('sound').onclick();assert.equal(sounds.at(-1),'start');
get('language').onclick();api.click(idx('a3'));api.click(idx('a5'));assert.match(get('game-notice').textContent,/ដើរមិនត្រឹមត្រូវ/);
// Purple players see their own pieces at the bottom and can submit only their turn.
let online=engine.initial();online.turn='b';
api.partnerLoad({id:'9f9e64bf-ad1a-4e3c-b841-0625957075b0',revision:2,slots:{w:true,b:true},myColor:'b',ready:true,state:online,history:[],result:null});
assert.equal(api.side(),'b');assert.equal(get('board').children[0].dataset.index,63);assert.equal(get('board').children[63].dataset.index,0);
assert.equal(get('claim-white').disabled,true);assert.equal(get('claim-black').disabled,true);
api.click(idx('a6'));api.click(idx('a5'));assert.equal(api.actions().at(-1).type,'move');assert.equal(api.actions().at(-1).data.from,idx('a6'));
api.partnerLoad({id:'9f9e64bf-ad1a-4e3c-b841-0625957075b0',revision:3,slots:{w:true,b:true},myColor:'b',ready:true,state:online,history:[],result:{winner:'b',reason:'checkmate'}});
assert.equal(get('result-title').textContent,'អ្នកឈ្នះ!');
const playerInfo={w:{name:'សំបូរ',stats:{wins:2,losses:1,draws:0}},b:{name:'Partner',stats:{wins:1,losses:2,draws:0}}};
api.partnerLoad({id:'9f9e64bf-ad1a-4e3c-b841-0625957075b0',revision:3,slots:{w:true,b:true},myColor:'b',ready:true,state:online,history:[],result:{winner:'b',reason:'checkmate'},players:playerInfo});
assert.match(get('self-name').textContent,/Partner/);assert.equal(get('opponent').textContent,'សំបូរ');assert.match(get('self-record').textContent,/Wins 1/);
api.partnerLoad({id:'9f9e64bf-ad1a-4e3c-b841-0625957075b0',revision:4,slots:{w:true,b:true},myColor:null,ready:true,state:online,history:[],result:null,players:playerInfo});
assert.equal(get('self-name').textContent,'សំបូរ');assert.equal(get('opponent').textContent,'Partner');
console.log('Passed: profile names and records update at unchanged room revision; spectators see both players.');
console.log('Passed: partner color locking, purple board orientation, own-side moves and result perspective.');
console.log('Passed: invalid-move preservation, move sound, checkmate modal once, restart, count advance/limit/start/stop, mute, and Khmer feedback.');
// Exercise the real audio module with an AudioContext contract double.
let starts=0,gainValue=null,resumes=0;const param=()=>({value:0,setValueAtTime(v){gainValue=v;},cancelScheduledValues(){},exponentialRampToValueAtTime(){}});
globalThis.AudioContext=class{state='suspended';currentTime=0;destination={};resume(){resumes++;this.state='running';return Promise.resolve();}createGain(){return {gain:param(),connect(){},disconnect(){}};}createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){starts++;},stop(){}};}};
const {GameSound}=await import('../public/sound.js');const audio=new GameSound();audio.play('move');assert.equal(starts,0);await audio.unlock();audio.play('move');await Promise.resolve();assert.equal(starts,2);assert.equal(resumes,1);audio.setEnabled(false);assert.equal(gainValue,0);audio.play('win');await Promise.resolve();assert.equal(starts,2);
console.log('Passed: audio gesture initialization, effect scheduling, resume and mute.');

import assert from 'node:assert/strict';
import {MobileApp} from '../public/mobile.js';
class Element{
 constructor(){this.children=[];this.dataset={};this.attrs={};this.listeners={};this.hidden=false;this.open=false;}
 append(node){if(node.parent)node.parent.children=node.parent.children.filter(x=>x!==node);this.children.push(node);node.parent=this;}
 before(node){const parent=this.parent;parent.children.splice(parent.children.indexOf(this),0,node);node.parent=parent;}
 after(node){if(node.parent)node.parent.children=node.parent.children.filter(x=>x!==node);const parent=this.parent;parent.children.splice(parent.children.indexOf(this)+1,0,node);node.parent=parent;}
 addEventListener(event,callback){this.listeners[event]=callback;}setAttribute(key,value){this.attrs[key]=value;}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}
}
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
const layout=new Element(),panel=new Element();layout.append(panel);panel.preservedState='game in progress';
const media={matches:true,addEventListener(type,fn){this.change=fn;}};
globalThis.document={body:new Element(),getElementById:el,querySelector:()=>panel,createElement:()=>new Element()};globalThis.window={matchMedia:()=>media,scrollTo(){}};
let plays=0,profiles=0;const s={lang:'en',mode:'ai',level:'medium',started:false,finished:null,failed:false,room:null,profileLoading:false};
const app=new MobileApp(()=>s,{play(){plays++;s.started=true;},profile(){profiles++;},partner(){s.mode='partner';}});
assert.equal(panel.parent,el('mobile-sheet-content'));assert.equal(el('mobile-mode').textContent,'AI practice · Medium');
el('mobile-game').onclick();assert(el('mobile-game-sheet').open);assert.equal(el('mobile-game').attrs['aria-pressed'],'true');
el('mobile-sheet-close').onclick();assert(!el('mobile-game-sheet').open);
el('mobile-play').onclick();assert.equal(plays,1);assert(el('mobile-play').hidden);
el('mobile-chat').onclick();assert.equal(document.body.dataset.mobileView,'chat');assert(!el('mobile-chat-empty').hidden);
el('mobile-profile').onclick();assert.equal(profiles,1);
el('mobile-partner').onclick();assert(el('mobile-game-sheet').open);assert.equal(s.mode,'partner');
s.room={id:'one',myColor:null,ready:false};app.render();assert(el('mobile-chat-empty').hidden);assert.equal(el('mobile-play').textContent,'Choose your color');
s.room.myColor='b';app.render();assert(!el('mobile-game-sheet').open);assert.equal(document.body.dataset.mobileView,'board');assert.equal(el('mobile-play').textContent,'Invite your partner');
s.room.ready=true;app.render();assert(el('mobile-play').hidden);
s.lang='km';app.render();assert.equal(el('mobile-game-label').textContent,'ល្បែង');
app.openGame();media.matches=false;media.change();assert.equal(panel.parent,layout);assert(!el('mobile-game-sheet').open);assert.equal(panel.preservedState,'game in progress');
media.matches=true;media.change();assert.equal(panel.parent,el('mobile-sheet-content'));assert.equal(el('mobile-sheet-content').children.length,1);assert.equal(panel.preservedState,'game in progress');
s.room={id:'two',myColor:null,ready:true};app.render();assert.equal(el('mobile-mode').textContent,'កំពុងមើល');assert(el('mobile-play').hidden);
console.log('Passed: mobile navigation, game sheet, AI start, comments empty state, profile access, successful seat claim returns to board, spectator mode, Khmer, and mobile/desktop reparenting without losing game state.');

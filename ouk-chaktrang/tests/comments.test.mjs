import assert from 'node:assert/strict';
import {RoomComments} from '../public/comments.js';
class Element{constructor(){this.children=[];this.value='';this.dataset={};this.scrollHeight=0;this.scrollTop=0;this.clientHeight=200;this.listeners={};this.textContent='';}addEventListener(type,fn){this.listeners[type]=fn;}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}}
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
globalThis.document={hidden:false,getElementById:el,createElement:()=>new Element(),addEventListener(){}};globalThis.window={addEventListener(){}};
let lang='en',profileOpens=0;const chat=new RoomComments(()=>lang,()=>profileOpens++);chat.id='room-one';chat.loaded=true;chat.poll=async()=>{};
el('comment-text').value='Draft before profile';
let blockedRequests=0;chat.request=async()=>{blockedRequests++;};await chat.send();
assert.equal(blockedRequests,0);assert(el('comment-form').hidden);assert(!el('comments-profile-gate').hidden);assert(el('comment-send').disabled);
el('comments-create-profile').onclick();assert.equal(profileOpens,1);
chat.setProfileReady(true);assert(!el('comment-form').hidden);assert(el('comments-profile-gate').hidden);assert.equal(el('comment-text').value,'Draft before profile');
el('comment-text').value='សួស្តី <script>alert(1)</script>';
let attempts=[];chat.request=async(query,body)=>{attempts.push({...body});throw new Error('network');};
await chat.send();assert.equal(el('comment-text').value,'សួស្តី <script>alert(1)</script>');assert.equal(chat.status,'failed');assert(!chat.sending);
chat.request=async(query,body)=>{attempts.push({...body});return {message:{id:7,role:'visitor',visitorTag:'A12BCD',text:body.text,createdAt:Date.now(),mine:true}};};
await chat.send();assert.equal(attempts[0].clientId,attempts[1].clientId);assert.equal(el('comment-text').value,'');assert.equal(chat.items.size,1);assert.equal(chat.cursor,0);
assert.equal(el('comments-list').children[0].children[1].textContent,'សួស្តី <script>alert(1)</script>');
assert.equal(el('comments-list').children[0].children[0].children[0].textContent,'Visitor A12BCD · You');
chat.merge([{id:6,role:'w',visitorTag:'ABC123',text:'Earlier message arriving after my post',createdAt:Date.now(),mine:false}]);chat.render();assert.equal(el('comments-list').children.length,2);assert.equal(el('comments-list').children[0].children[1].textContent,'Earlier message arriving after my post');
lang='km';chat.render();assert.equal(el('comments-title').textContent,'មតិយោបល់');assert.match(el('comments-list').children[1].children[0].children[0].textContent,/អ្នកទស្សនា/);
// The server can revoke posting if this browser's profile is no longer present.
chat.request=async()=>{throw new Error('profileRequired');};el('comment-text').value='Keep this draft';await chat.send();
assert(!chat.profileReady);assert(el('comment-form').hidden);assert.equal(el('comment-text').value,'Keep this draft');assert.match(el('comments-profile-help').textContent,/ប្រវត្តិរូប/);
chat.setProfileReady(true);assert(!el('comment-form').hidden);assert.equal(el('comment-text').value,'Keep this draft');
console.log('Passed: profile gate blocks unnamed posts, opens profile editor, unlocks after save, preserves drafts, handles server rejection, and translates to Khmer.');
// A response from a previous game cannot populate the next game's comment area.
let finish;chat.request=()=>new Promise(resolve=>finish=resolve);chat.loaded=true;el('comment-text').value='old room draft';const pending=chat.send();chat.setRoom('room-two');finish({message:{id:99,role:'visitor',text:'old room draft',createdAt:Date.now(),mine:true}});await pending;
assert.equal(chat.items.size,0);assert.equal(el('comment-text').value,'');assert(!chat.sending);chat.setRoom(null);
console.log('Passed: failed-send draft preservation, same retry ID, plain-text rendering, no missed-message cursor advance after posting, chronological merge, Khmer labels and room-switch isolation.');

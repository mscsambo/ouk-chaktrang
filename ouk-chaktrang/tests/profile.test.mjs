import assert from 'node:assert/strict';
import {PlayerProfile} from '../public/profile.js';
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{textContent:'',value:'',disabled:false,open:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},showModal(){this.open=true;},close(){this.open=false;},focus(){}});return elements.get(id);}
globalThis.document={getElementById:el};
let lang='en',changes=0;
const profile=new PlayerProfile(()=>lang,()=>changes++);
let fail=true;profile.request=async(body)=>{if(fail)throw new Error('offline');return {name:body?.name||null,stats:{wins:3,losses:1,draws:2}};};
await profile.init();assert.equal(profile.loading,false);assert.match(el('profile-summary-name').textContent,/Could not load/);assert.equal(el('profile-open').textContent,'Retry');
fail=false;await profile.init();profile.open();assert(el('profile-dialog').open);
el('profile-name').value='សំបូរ';fail=true;await profile.save();assert.equal(el('profile-name').value,'សំបូរ');assert(el('profile-dialog').open);assert.match(el('profile-error').textContent,/Could not save/);
fail=false;await profile.save();assert(!el('profile-dialog').open);assert.equal(el('profile-summary-name').textContent,'សំបូរ');assert.match(el('profile-summary-stats').textContent,/Wins 3/);assert.equal(el('profile-open').textContent,'Edit profile');
profile.open();el('profile-name').value='   ';await profile.save();assert.match(el('profile-error').textContent,/1 to 40/);
el('profile-name').value='<img src=x onerror=alert(1)>';await profile.save();assert.equal(el('profile-summary-name').textContent,'<img src=x onerror=alert(1)>');
lang='km';profile.render();assert.equal(el('profile-open').textContent,'កែប្រវត្តិរូប');assert.match(el('profile-summary-stats').textContent,/ឈ្នះ 3/);
profile.adopt({name:'New name',stats:{wins:4,losses:1,draws:2}});assert.equal(el('profile-summary-name').textContent,'New name');assert.match(el('profile-summary-stats').textContent,/ឈ្នះ 4/);
assert(changes>=4);console.log('Passed: profile loading recovery, failed save preserves draft, editing, plain-text names, validation, Khmer labels and refreshed records.');

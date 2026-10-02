import assert from 'node:assert/strict';
import {initial,legal,apply,attacked,inCheck,countOption,outcome,chooseMove,positionKey} from '../public/engine.js';
const idx=s=>(8-Number(s[1]))*8+'abcdefgh'.indexOf(s[0]);
const fixture=(pieces,turn='w',rights={wK:false,wQ:false,bK:false,bQ:false})=>{const s=initial();s.board.fill(null);s.turn=turn;s.rights=rights;for(const [sq,p] of Object.entries(pieces))s.board[idx(sq)]=p;return s;};
const can=(s,a,b)=>legal(s,idx(a)).some(m=>m.to===idx(b));
let s=initial();assert.equal(s.board.filter(Boolean).length,32);assert.equal(s.board[idx('d1')],'K');assert.equal(s.board[idx('e8')],'k');
assert(can(s,'a3','a4'));assert(!can(s,'a3','a5'));assert(can(s,'d1','b2'));assert(can(s,'d1','f2'));assert(!can(s,'e1','e3'));
s=fixture({a1:'K',h8:'k',d4:'Q'});assert.equal(legal(s,idx('d4')).length,4);assert(!can(s,'d4','d5'));
s=fixture({a1:'K',h8:'k',d4:'B'});assert.equal(legal(s,idx('d4')).length,5);assert(can(s,'d4','d5'));assert(!can(s,'d4','d3'));
s=fixture({a1:'K',h8:'k',d4:'N'});assert.equal(legal(s,idx('d4')).length,8);
s=fixture({a1:'K',h8:'k',d4:'R',d6:'P',f4:'p'});assert(can(s,'d4','f4'));assert(!can(s,'d4','g4'));assert(!can(s,'d4','d6'));
s=fixture({a1:'K',h8:'k',d5:'P',e6:'p'});assert(can(s,'d5','e6'));assert.equal(apply(s,{from:idx('d5'),to:idx('e6')}).board[idx('e6')],'F');
s=fixture({a1:'K',h8:'k',d4:'p'},'b');assert.equal(apply(s,{from:idx('d4'),to:idx('d3')}).board[idx('d3')],'f');
s=fixture({e1:'K',a8:'k',e2:'R',e8:'r'});assert(!can(s,'e2','f2'));assert(can(s,'e2','e8'));
s=fixture({d1:'K',h8:'k',d8:'r'},'w',{wK:true,wQ:false,bK:false,bQ:false});assert(inCheck(s));assert(!can(s,'d1','b2'));
s=fixture({d1:'K',h8:'k',a8:'r',d3:'P'},'b',{wK:true,wQ:false,bK:false,bQ:false});s=apply(s,{from:idx('a8'),to:idx('d8')});assert.equal(s.rights.wK,false);assert(!inCheck(s));
s=fixture({a1:'K',h8:'k',e1:'Q',e2:'P'},'w',{wK:false,wQ:true,bK:false,bQ:false});assert(can(s,'e1','e3'));s=apply(s,{from:idx('e1'),to:idx('e3')});assert.equal(s.rights.wQ,false);
s=fixture({a1:'K',h8:'k',d1:'Q',d3:'p'},'w',{wK:false,wQ:true,bK:false,bQ:false});assert(!can(s,'d1','d3'));
s=fixture({a1:'K',h8:'k',a2:'r',b2:'r'});assert.equal(outcome(s).reason,'checkmate');
s=fixture({a1:'K',c3:'k',b2:'r'});assert.equal(outcome(s).reason,'stalemate');
s=fixture({a1:'K',h8:'k'});assert.equal(outcome(s).reason,'bareKings');
s=fixture({a1:'K',h8:'k',e8:'r',g8:'r'});assert.deepEqual(countOption(s,'w'),{side:'w',kind:'piece',current:4,limit:8});s.count=countOption(s,'w');s=apply(s,{from:idx('a1'),to:idx('b1')});assert.equal(s.count.current,5);assert.equal(s.count.limit,8);s.count.current=8;assert.equal(outcome(s).reason,'counting');
s=fixture({a1:'K',h8:'k',h7:'p',a2:'P'});assert.equal(countOption(s,'w').kind,'board');
for(const level of ['beginner','medium','advanced']){s=initial();const before=positionKey(s),r=chooseMove(s,level,()=>0);assert(legal(s).some(m=>m.from===r.move.from&&m.to===r.move.to));assert.equal(positionKey(s),before);assert(r.depth>=1);console.log(`${level}: legal move, completed depth ${r.depth}, ${r.nodes} nodes`);}
// Exercise alternating legal turns, king safety and promotions in a practice game.
s=initial();for(let ply=0;ply<80&&!outcome(s);ply++){const r=chooseMove(s,ply%2?'medium':'beginner',()=>.6);const mover=s.turn;s=apply(s,r.move);assert(!inCheck(s,mover));assert.equal(s.board.filter(p=>p==='K'||p==='k').length,2);}
console.log('Passed: setup, move geometry, blockers, promotion, pins, opening rights, terminal states, counting, all AI levels, and 80-ply self-play.');

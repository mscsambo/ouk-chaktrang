import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleRooms} from '../server/rooms.js';
import {initial,positionKey} from '../public/engine.js';
const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+file,'utf8'));
const DB={
 prepare(sql){
  return {bind(...args){
   const statement=sqlite.prepare(sql);
   return {
    async first(){return statement.get(...args)||null;},
    async all(){return {results:statement.all(...args)};},
    async run(){const result=statement.run(...args);return {meta:{changes:Number(result.changes)}};}
   };
  }};
 }
};
function client(){return {cookie:null,async send(path,body){const headers={'Origin':'https://game.example'};if(this.cookie)headers.Cookie=this.cookie;if(body)headers['Content-Type']='application/json';const response=await handleRooms(new Request('https://game.example'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined}),{DB});if(response.headers.has('set-cookie'))this.cookie=response.headers.get('set-cookie').split(';')[0];return {status:response.status,...await response.json()};}};}
const a=client(),b=client(),third=client(),id=crypto.randomUUID(),path='/api/rooms/'+id;
assert.equal((await a.send('/api/rooms',{id})).status,201);await b.send(path);await third.send(path);
assert.notEqual(a.cookie,b.cookie);assert.equal((await a.send(path)).room.myColor,null);
const race=await Promise.all([a.send(path+'/claim',{color:'w'}),b.send(path+'/claim',{color:'w'})]);assert.deepEqual(race.map(x=>x.status).sort(),[200,409]);
const white=race[0].status===200?a:b,black=white===a?b:a;
let room=(await white.send(path)).room;assert.equal(room.myColor,'w');assert(!room.ready);
assert.equal((await white.send(path+'/move',{revision:room.revision,from:40,to:32})).error,'waitingPartner');
// The same visitor cannot occupy both colors.
assert.equal((await white.send(path+'/claim',{color:'b'})).room.myColor,'w');assert.equal((await black.send(path)).room.slots.b,false);
assert.equal((await black.send(path+'/claim',{color:'b'})).status,200);room=(await white.send(path)).room;assert(room.ready);
assert.equal((await third.send(path+'/claim',{color:'b'})).status,409);
assert.equal((await third.send(path+'/move',{revision:room.revision,from:40,to:32})).status,403);
assert.equal((await black.send(path+'/move',{revision:room.revision,from:16,to:24})).error,'notYourTurn');
assert.equal((await white.send(path+'/move',{revision:room.revision,from:40,to:24})).error,'wrongMove');
const moves=await Promise.all([white.send(path+'/move',{revision:room.revision,from:40,to:32}),white.send(path+'/move',{revision:room.revision,from:41,to:33})]);assert.deepEqual(moves.map(x=>x.status).sort(),[200,409]);
room=(await black.send(path)).room;assert.equal(room.history.length,1);assert.equal(room.state.turn,'b');assert.equal(room.myColor,'b');
const reply=await black.send(path+'/move',{revision:room.revision,from:16,to:24});assert.equal(reply.status,200);assert.equal(reply.room.state.turn,'w');
assert.deepEqual((await white.send(path)).room.state,reply.room.state);
const reconnect=client();reconnect.cookie=white.cookie;assert.equal((await reconnect.send(path)).room.myColor,'w');
assert(!JSON.stringify(reply).includes('white_seat'));assert(!JSON.stringify(reply).includes('black_seat'));
// Commenting is independent of seats, turn order and the game revision.
const beforeChat=(await white.send(path)).room.revision;
assert.equal((await white.send('/api/profile')).profile.name,null);
for(const guest of [white,third]){
 const denied=await guest.send(path+'/comments',{text:'No profile yet',clientId:crypto.randomUUID(),name:'Spoofed name'});
 assert.equal(denied.status,403);assert.equal(denied.error,'profileRequired');
 assert.equal((await guest.send(path+'/comments')).status,200);
}
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM room_comments').get().n,0);
console.log('Passed: profiles are required server-side for both seated players and visitors; unsigned names cannot bypass the gate and reading remains public.');
assert.equal((await white.send('/api/profile',{name:'  សំបូរ  ',stats:{wins:999}})).profile.name,'សំបូរ');
assert.equal((await black.send('/api/profile',{name:'Partner'})).profile.stats.wins,0);
assert.equal((await third.send('/api/profile',{name:'Visitor <script>'})).status,200);
assert.equal((await third.send('/api/profile',{name:'  '})).status,400);
assert.equal((await third.send('/api/profile',{name:'x'.repeat(41)})).status,400);
assert.equal((await third.send('/api/profile',{name:'abc\u0000def'})).status,400);
assert.equal((await reconnect.send('/api/profile')).profile.name,'សំបូរ');
const namedRoom=(await third.send(path)).room;
assert.equal(namedRoom.players.w.name,'សំបូរ');assert.equal(namedRoom.players.b.name,'Partner');
assert(!JSON.stringify(namedRoom).includes(authorHashPlaceholder()));
function authorHashPlaceholder(){return sqlite.prepare('SELECT white_seat FROM rooms WHERE id=?').get(id).white_seat;}

const sendComment=(client,text,clientId=crypto.randomUUID())=>client.send(path+'/comments',{text,clientId});
const firstComment=await sendComment(white,'សួស្តី! Good game.');assert.equal(firstComment.status,201);assert.equal(firstComment.message.role,'w');assert.equal(firstComment.message.name,'សំបូរ');
const blackComment=await sendComment(black,'Your turn!');assert.equal(blackComment.message.role,'b');
const visitorId=crypto.randomUUID(),visitorComment=await third.send(path+'/comments',{text:'Watching with friends <img src=x onerror=alert(1)>',clientId:visitorId,role:'w'});
assert.equal(visitorComment.message.role,'visitor');assert.equal(visitorComment.message.name,'Visitor <script>');assert(visitorComment.message.mine);assert.equal(visitorComment.message.text,'Watching with friends <img src=x onerror=alert(1)>');
const retry=await third.send(path+'/comments',{text:'duplicate retry',clientId:visitorId});assert.equal(retry.message.id,visitorComment.message.id);assert.equal(retry.status,200);
const cooldown=await sendComment(third,'too soon');assert.equal(cooldown.status,429);
assert.equal((await sendComment(third,'   ')).status,400);assert.equal((await sendComment(third,'x'.repeat(501))).status,400);
const feed=await white.send(path+'/comments');assert.equal(feed.messages.length,3);assert(feed.messages[0].mine);assert(!feed.messages[2].mine);assert(!JSON.stringify(feed).includes('author_hash'));
assert.equal((await white.send(path)).room.revision,beforeChat);
const watcher=client();assert.equal((await watcher.send(path+'/comments')).messages.length,3);assert.equal((await watcher.send(path+'/move',{revision:beforeChat,from:32,to:24})).status,403);
const room2=crypto.randomUUID();await a.send('/api/rooms',{id:room2});assert.equal((await a.send('/api/rooms/'+room2+'/comments')).messages.length,0);
// Larger conversations can page back and catch up without gaps.
const author=sqlite.prepare('SELECT author_hash FROM room_comments WHERE id=?').get(firstComment.message.id).author_hash;
const insert=sqlite.prepare('INSERT INTO room_comments(room_id,author_hash,client_id,role,visitor_tag,message,created_at) VALUES(?,?,?,?,?,?,?)');
for(let n=0;n<110;n++)insert.run(id,author,crypto.randomUUID(),'w','TEST01','Comment '+n,Date.now()-10000);
const recent=await a.send(path+'/comments');assert.equal(recent.messages.length,50);assert(recent.hasEarlier);
const older=await a.send(path+'/comments?before='+recent.messages[0].id);assert.equal(older.messages.length,50);assert(older.messages.at(-1).id<recent.messages[0].id);
const catchup=await a.send(path+'/comments?after=0');assert.equal(catchup.messages.length,100);assert(catchup.hasMore);
assert.equal((await a.send(path+'/comments?after='+catchup.messages.at(-1).id)).messages.length,13);
console.log('Passed: both players and visitors can comment, server-assigned roles, plain text, retry deduplication, cooldown, validation, history, incremental sync, pagination, room isolation, and unchanged game permissions/revision.');
assert.equal((await black.send(path+'/resign',{revision:reply.room.revision})).room.result.winner,'w');
room=(await white.send(path)).room;assert.equal(room.result.reason,'resigned');assert.equal((await white.send(path+'/move',{revision:room.revision,from:32,to:24})).error,'gameFinished');
assert.deepEqual((await white.send('/api/profile')).profile.stats,{wins:1,losses:0,draws:0});
assert.deepEqual((await black.send('/api/profile')).profile.stats,{wins:0,losses:1,draws:0});
assert.deepEqual((await third.send('/api/profile')).profile.stats,{wins:0,losses:0,draws:0});
await black.send(path+'/resign',{revision:reply.room.revision});await white.send(path);await white.send(path);
assert.equal((await white.send('/api/profile')).profile.stats.wins,1);
assert.equal((await white.send('/api/profile',{name:'New name'})).profile.stats.wins,1);
assert.equal((await reconnect.send(path)).room.players.w.name,'New name');
assert.equal((await white.send(path+'/comments?after=0')).messages[0].name,'សំបូរ');
const forbiddenProfile=await handleRooms(new Request('https://game.example/api/profile',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({name:'Hijacked'})}),{DB});assert.equal(forbiddenProfile.status,403);
assert.equal((await white.send('/api/profile')).profile.name,'New name');
assert.equal((await a.send('/api/rooms/'+crypto.randomUUID())).status,404);
const cross=await handleRooms(new Request('https://game.example/api/rooms',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID()})}),{DB});assert.equal(cross.status,403);
const bad=await handleRooms(new Request('https://game.example/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:'null'}),{DB});assert.equal(bad.status,400);
const idx=s=>(8-Number(s[1]))*8+'abcdefgh'.indexOf(s[0]);
function seed(pieces,turn='w',count=null){const position=initial();position.board.fill(null);position.rights={wK:false,wQ:false,bK:false,bQ:false};position.turn=turn;position.count=count;for(const [sq,p]of Object.entries(pieces))position.board[idx(sq)]=p;const game={position,moves:[],keys:[positionKey(position)],result:null};sqlite.prepare('UPDATE rooms SET state_json=?, revision=revision+1 WHERE id=?').run(JSON.stringify(game),id);}
seed({h8:'K',a1:'k',a3:'R',b2:'R'});room=(await white.send(path)).room;const mate=await white.send(path+'/move',{revision:room.revision,from:idx('a3'),to:idx('a2')});assert.equal(mate.room.result.reason,'checkmate');assert.equal((await black.send(path)).room.result.winner,'w');
seed({a1:'K',h8:'k',e8:'r'});room=(await white.send(path)).room;const count=await white.send(path+'/count',{revision:room.revision});assert.equal(count.room.state.count.side,'w');assert.equal(count.room.state.count.limit,16);
seed({a1:'K',h8:'k',e8:'r'},'w',{side:'w',kind:'piece',current:15,limit:16});room=(await white.send(path)).room;const drawn=await white.send(path+'/move',{revision:room.revision,from:idx('a1'),to:idx('b1')});assert.equal(drawn.room.result.winner,null);assert.equal(drawn.room.result.reason,'counting');
assert.deepEqual((await white.send('/api/profile')).profile.stats,{wins:0,losses:0,draws:1});
assert.deepEqual((await black.send('/api/profile')).profile.stats,{wins:0,losses:0,draws:1});
console.log('Passed: named guest profiles, Unicode validation, spoofed stats ignored, cookie continuity, private identity, comment name snapshots, live name updates, one result per room, no spectator records, draws, and CSRF rejection.');
console.log('Passed: concurrent color reservation, distinct guest seats, full room, server move validation, turn order, concurrent moves, two-client sync, reconnection, resignation, checkmate, counting, missing rooms, request validation and cross-site rejection.');
sqlite.close();

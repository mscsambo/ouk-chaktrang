import {playerProfile,profileRequest} from './profiles.js';
import {commentsRequest} from './comments.js';
import {initial,legal,apply,outcome,positionKey,countOption,opposite,inCheck,square} from '../public/engine.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COOKIE='__Host-ouk_guest';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const database=env=>{if(!env.DB)throw new Error('Room database unavailable');return env.DB;};
async function identity(request){
 let token=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1),fresh=false;
 if(!/^[a-f0-9]{64}$/.test(token||'')){token=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');fresh=true;}
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),v=>v.toString(16).padStart(2,'0')).join('');
 return {hash,cookie:fresh?`${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000`:null};
}
async function view(row,who,db){
 const game=JSON.parse(row.state_json);
 const [w,b]=await Promise.all([playerProfile(db,row.white_seat),playerProfile(db,row.black_seat)]);
 return {id:row.id,revision:row.revision,players:{w,b},slots:{w:!!row.white_seat,b:!!row.black_seat},myColor:row.white_seat===who?'w':row.black_seat===who?'b':null,ready:!!row.white_seat&&!!row.black_seat,state:game.position,history:game.moves,result:game.result};
}
const read=(db,id)=>db.prepare('SELECT * FROM rooms WHERE id = ?').bind(id).first();
async function body(request){
 if(!request.headers.get('content-type')?.includes('application/json'))throw Object.assign(new Error('invalidRequest'),{status:400});
 const reader=request.body?.getReader();let size=0,chunks=[];if(!reader)throw Object.assign(new Error('invalidRequest'),{status:400});
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();throw Object.assign(new Error('invalidRequest'),{status:413});}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{const parsed=JSON.parse(new TextDecoder().decode(bytes));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();return parsed;}catch{throw Object.assign(new Error('invalidRequest'),{status:400});}
}
async function route(request,env,who){
 const url=new URL(request.url),db=database(env),path=url.pathname;
 if(request.method==='POST'){
  const origin=request.headers.get('origin');if((origin&&origin!==url.origin)||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'forbidden'},403);
 }
 if(path==='/api/profile')return profileRequest(request,db,who,request.method==='POST'?await body(request):null);
 if(path==='/api/rooms'&&request.method==='POST'){
  const input=await body(request);if(!UUID.test(input.id))return json({error:'invalidRequest'},400);
  const position=initial(),game={position,moves:[],keys:[positionKey(position)],result:null},now=Date.now();
  await db.prepare('INSERT OR IGNORE INTO rooms (id,state_json,created_at,updated_at) VALUES (?,?,?,?)').bind(input.id,JSON.stringify(game),now,now).run();
  return json({room:await view(await read(db,input.id),who,db)},201);
 }
 const match=path.match(/^\/api\/rooms\/([^/]+)(?:\/(claim|move|count|resign|comments))?$/);if(!match||!UUID.test(match[1]))return json({error:'notFound'},404);
 const [,id,action]=match,row=await read(db,id);if(!row)return json({error:'roomNotFound'},404);
 if(action==='comments')return commentsRequest(request,db,row,who,request.method==='POST'?await body(request):null);
 if(request.method==='GET'&&!action)return json({room:await view(row,who,db)});
 if(request.method!=='POST'||!action)return json({error:'invalidRequest'},405);
 const input=await body(request),snapshot=await view(row,who,db);
 if(action==='claim'){
  if(!['w','b'].includes(input.color))return json({error:'invalidRequest'},400);
  if(snapshot.myColor)return json({room:snapshot});
  // A conditional UPDATE is the color reservation. It cannot grant the same seat twice.
  const column=input.color==='w'?'white_seat':'black_seat',other=input.color==='w'?'black_seat':'white_seat';
  const changed=await db.prepare(`UPDATE rooms SET ${column} = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND ${column} IS NULL AND (${other} IS NULL OR ${other} <> ?)` ).bind(who,Date.now(),id,who).run();
  const current=await view(await read(db,id),who,db);return json({room:current,...(!changed.meta.changes?{error:'colorTaken'}:{})},changed.meta.changes?200:409);
 }
 if(!snapshot.myColor)return json({error:'notYourSeat',room:snapshot},403);
 if(!snapshot.ready)return json({error:'waitingPartner',room:snapshot},409);
 if(snapshot.result)return json({error:'gameFinished',room:snapshot},409);
 if(input.revision!==row.revision)return json({error:'gameChanged',room:snapshot},409);
 const game=JSON.parse(row.state_json),side=snapshot.myColor;
 if(action==='resign')game.result={winner:opposite(side),reason:'resigned'};
 else{
  if(game.position.turn!==side)return json({error:'notYourTurn',room:snapshot},409);
  if(action==='move'){
   if(!Number.isInteger(input.from)||!Number.isInteger(input.to))return json({error:'invalidRequest'},400);
   const move=legal(game.position,input.from).find(m=>m.to===input.to);if(!move)return json({error:'wrongMove',room:snapshot},400);
   const piece=game.position.board[move.from],capture=game.position.board[move.to];game.position=apply(game.position,move);
   const promoted=piece.toUpperCase()==='P'&&game.position.board[move.to].toUpperCase()==='F';
   game.moves.push({piece,from:move.from,to:move.to,capture:!!capture,notation:`${square(move.from)}${capture?'×':'–'}${square(move.to)}${promoted?'=F':''}${inCheck(game.position)?'+':''}`});
   game.keys.push(positionKey(game.position));game.result=outcome(game.position);
   if(!game.result&&game.keys.filter(k=>k===positionKey(game.position)).length>=3)game.result={winner:null,reason:'repetition'};
  }else if(action==='count'){
   if(game.position.count?.side===opposite(side))game.result={winner:null,reason:'countAccepted'};
   else if(game.position.count)game.position.count=null;
   else{const option=countOption(game.position,side);if(!option)return json({error:'cannotCount',room:snapshot},400);game.position.count=option;}
  }
 }
 const changed=await db.prepare('UPDATE rooms SET state_json = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(game),Date.now(),id,row.revision).run();
 const current=await view(await read(db,id),who,db);return json({room:current,...(!changed.meta.changes?{error:'gameChanged'}:{})},changed.meta.changes?200:409);
}
export async function handleRooms(request,env){
 const guest=await identity(request);let response;
 try{response=await route(request,env,guest.hash);}catch(error){console.error('Room request failed:',error.status?error.message:'storage failure');response=json({error:error.status?error.message:'roomUnavailable'},error.status||503);}
 if(guest.cookie)response.headers.append('Set-Cookie',guest.cookie);return response;
}

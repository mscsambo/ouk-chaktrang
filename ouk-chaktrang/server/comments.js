const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const display=(row,who)=>({id:row.id,role:row.role,visitorTag:row.visitor_tag,name:row.author_name||null,text:row.message,createdAt:row.created_at,mine:row.author_hash===who});
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function commentsRequest(request,db,room,who,input){
 const url=new URL(request.url),id=room.id;
 if(request.method==='GET'){
  const after=url.searchParams.get('after'),before=url.searchParams.get('before');
  if((after&&before)||[after,before].some(v=>v!==null&&(!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v)))))return json({error:'invalidRequest'},400);
  const rows=after!==null?await db.prepare('SELECT * FROM room_comments WHERE room_id = ? AND id > ? ORDER BY id ASC LIMIT 101').bind(id,Number(after)).all():before!==null?await db.prepare('SELECT * FROM room_comments WHERE room_id = ? AND id < ? ORDER BY id DESC LIMIT 51').bind(id,Number(before)).all():await db.prepare('SELECT * FROM room_comments WHERE room_id = ? ORDER BY id DESC LIMIT 51').bind(id).all();
  const limit=after!==null?100:50,hasMore=rows.results.length>limit,selected=rows.results.slice(0,limit);if(after===null)selected.reverse();
  return json({messages:selected.map(row=>display(row,who)),hasEarlier:after===null?hasMore:undefined,hasMore:after!==null?hasMore:false});
 }
 if(request.method!=='POST')return json({error:'invalidRequest'},405);
 if(!UUID.test(input.clientId)||typeof input.text!=='string'||!input.text.trim()||input.text.trim().length>500)return json({error:'commentInvalid'},400);
 const profile=await db.prepare('SELECT display_name FROM profiles WHERE guest_hash = ?').bind(who).first();
 if(!profile?.display_name)return json({error:'profileRequired'},403);
 const existing=await db.prepare('SELECT * FROM room_comments WHERE room_id = ? AND author_hash = ? AND client_id = ?').bind(id,who,input.clientId).first();
 if(existing)return json({message:display(existing,who)});
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id+':'+who));
 const tag=Array.from(new Uint8Array(bytes).slice(0,3),v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
 const role=room.white_seat===who?'w':room.black_seat===who?'b':'visitor',now=Date.now();
 // The cooldown and retry key are checked atomically without touching game state.
 await db.prepare('INSERT OR IGNORE INTO room_comments (room_id,author_hash,client_id,role,visitor_tag,author_name,message,created_at) SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM room_comments WHERE room_id = ? AND author_hash = ? AND created_at > ?)').bind(id,who,input.clientId,role,tag,profile?.display_name||null,input.text.trim(),now,id,who,now-2000).run();
 const posted=await db.prepare('SELECT * FROM room_comments WHERE room_id = ? AND author_hash = ? AND client_id = ?').bind(id,who,input.clientId).first();
 return posted?json({message:display(posted,who)},201):json({error:'commentTooFast'},429);
}

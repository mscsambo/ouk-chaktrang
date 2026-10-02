const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function playerProfile(db,who){
 if(!who)return null;
 const profile=await db.prepare('SELECT display_name FROM profiles WHERE guest_hash = ?').bind(who).first();
 // Each room contributes at most once. Results come only from server-validated game state.
 const stats=await db.prepare(`SELECT
  COALESCE(SUM(CASE WHEN json_extract(state_json,'$.result.winner') = side THEN 1 ELSE 0 END),0) AS wins,
  COALESCE(SUM(CASE WHEN json_extract(state_json,'$.result.winner') IN ('w','b') AND json_extract(state_json,'$.result.winner') <> side THEN 1 ELSE 0 END),0) AS losses,
  COALESCE(SUM(CASE WHEN json_extract(state_json,'$.result.reason') IS NOT NULL AND json_extract(state_json,'$.result.winner') IS NULL THEN 1 ELSE 0 END),0) AS draws
  FROM (SELECT state_json, 'w' AS side FROM rooms WHERE white_seat = ? AND black_seat IS NOT NULL
        UNION ALL SELECT state_json, 'b' AS side FROM rooms WHERE black_seat = ? AND white_seat IS NOT NULL)` ).bind(who,who).first();
 return {name:profile?.display_name||null,stats:{wins:Number(stats.wins),losses:Number(stats.losses),draws:Number(stats.draws)}};
}
export async function profileRequest(request,db,who,input){
 if(request.method==='GET')return json({profile:await playerProfile(db,who)});
 if(request.method!=='POST')return json({error:'invalidRequest'},405);
 const name=typeof input.name==='string'?input.name.normalize('NFC').trim():'';
 if(!name||name.length>40||/[\p{Cc}\p{Cf}]/u.test(name))return json({error:'profileInvalid'},400);
 const now=Date.now();
 await db.prepare('INSERT INTO profiles (guest_hash,display_name,created_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(guest_hash) DO UPDATE SET display_name=excluded.display_name,updated_at=excluded.updated_at').bind(who,name,now,now).run();
 return json({profile:await playerProfile(db,who)});
}

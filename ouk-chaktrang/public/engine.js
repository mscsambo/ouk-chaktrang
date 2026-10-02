// Ouk Chaktrang rules profile: https://www.pychess.org/variants/cambodian
export const names={K:'ស្តេច',Q:'នាង',B:'គោល',N:'សេះ',R:'ទូក',P:'ត្រី',F:'ត្រីបក'};
export const english={K:'King',Q:'Neang',B:'Koul',N:'Horse',R:'Boat',P:'Fish',F:'Promoted fish'};
const diagonal=[[-1,-1],[-1,1],[1,-1],[1,1]],orthogonal=[[-1,0],[1,0],[0,-1],[0,1]],knight=[[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]];
const value={K:0,Q:180,F:180,B:280,N:320,R:550,P:100};
export const color=p=>p===p.toUpperCase()?'w':'b';
export const opposite=s=>s==='w'?'b':'w';
const inside=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
export const square=i=>'abcdefgh'[i%8]+(8-Math.floor(i/8));
export function initial(){
 const board=Array(64).fill(null);
 'rnbqkbnr'.split('').forEach((p,i)=>board[i]=p);
 'RNBKQBNR'.split('').forEach((p,i)=>board[56+i]=p);
 for(let i=16;i<24;i++)board[i]='p'; for(let i=40;i<48;i++)board[i]='P';
 return {board,turn:'w',rights:{wK:true,wQ:true,bK:true,bQ:true},count:null,ply:0};
}
export function attacked(s,target,by){
 const tr=target>>3,tc=target%8;
 for(let i=0;i<64;i++){
  const p=s.board[i];if(!p||color(p)!==by)continue;
  const t=p.toUpperCase(),dr=tr-(i>>3),dc=tc-i%8,dir=by==='w'?-1:1;
  if(t==='P'&&dr===dir&&Math.abs(dc)===1)return true;
  if((t==='Q'||t==='F')&&Math.abs(dr)===1&&Math.abs(dc)===1)return true;
  if(t==='B'&&((Math.abs(dr)===1&&Math.abs(dc)===1)||(dr===dir&&dc===0)))return true;
  if(t==='K'&&Math.max(Math.abs(dr),Math.abs(dc))===1)return true;
  if(t==='N'&&Math.abs(dr)*Math.abs(dc)===2)return true;
  if(t==='R'&&(dr===0||dc===0)&&(dr||dc)){
   let r=(i>>3)+Math.sign(dr),c=i%8+Math.sign(dc),blocked=false;
   while(r!==tr||c!==tc){if(s.board[r*8+c]){blocked=true;break;}r+=Math.sign(dr);c+=Math.sign(dc);}
   if(!blocked)return true;
  }
 }
 return false;
}
export function inCheck(s,side=s.turn){const k=s.board.indexOf(side==='w'?'K':'k');return k<0||attacked(s,k,opposite(side));}
function pseudo(s,from){
 const p=s.board[from];if(!p)return [];const side=color(p),t=p.toUpperCase(),r=from>>3,c=from%8,d=side==='w'?-1:1,moves=[];
 const add=(nr,nc)=>{if(!inside(nr,nc))return;const to=nr*8+nc,v=s.board[to];if(!v||(color(v)!==side&&v.toUpperCase()!=='K'))moves.push({from,to});};
 if(t==='R')for(const [dr,dc] of orthogonal){let nr=r+dr,nc=c+dc;while(inside(nr,nc)){add(nr,nc);if(s.board[nr*8+nc])break;nr+=dr;nc+=dc;}}
 else if(t==='P'){
  if(inside(r+d,c)&&!s.board[(r+d)*8+c])add(r+d,c);
  for(const dc of [-1,1])if(inside(r+d,c+dc)&&s.board[(r+d)*8+c+dc])add(r+d,c+dc);
 }else{
  const steps=t==='N'?knight:t==='K'?[...diagonal,...orthogonal]:t==='B'?[...diagonal,[d,0]]:diagonal;
  for(const [dr,dc] of steps)add(r+dr,c+dc);
  if(t==='K'&&s.rights[side+'K']&&!inCheck(s,side))for(const dc of [-2,2]){
   if(inside(r+d,c+dc)&&!s.board[(r+d)*8+c+dc])add(r+d,c+dc);
  }
  if(t==='Q'&&s.rights[side+'Q']&&inside(r+2*d,c)&&!s.board[(r+2*d)*8+c])add(r+2*d,c);
 }
 return moves;
}
export function apply(s,m,updateCount=true){
 const next={board:s.board.slice(),turn:opposite(s.turn),rights:{...s.rights},count:s.count?{...s.count}:null,ply:s.ply+1};
 const p=next.board[m.from],side=color(p),t=p.toUpperCase(),captured=next.board[m.to];
 if(captured?.toUpperCase()==='Q')next.rights[color(captured)+'Q']=false;
 next.board[m.from]=null;next.board[m.to]=p;
 if(t==='K'||t==='Q')next.rights[side+t]=false;
 if(t==='P'&&((side==='w'&&(m.to>>3)===2)||(side==='b'&&(m.to>>3)===5)))next.board[m.to]=side==='w'?'F':'f';
 for(const own of ['w','b'])if(next.rights[own+'K']){
  const k=next.board.indexOf(own==='w'?'K':'k'),rook=own==='w'?'r':'R';
  if(next.board.some((v,i)=>v===rook&&((i>>3)===(k>>3)||i%8===k%8)))next.rights[own+'K']=false;
 }
 if(updateCount&&next.count&&next.count.side===side)next.count.current++;
 return next;
}
export function legal(s,from=null){
 const result=[];for(let i=0;i<64;i++)if((from===null||from===i)&&s.board[i]&&color(s.board[i])===s.turn)
  for(const m of pseudo(s,i))if(!inCheck(apply(s,m,false),s.turn))result.push(m);
 return result;
}
export function countOption(s,side){
 const pieces=s.board.filter(Boolean),own=pieces.filter(p=>color(p)===side);if(own.length>3)return null;
 const board={side,kind:'board',current:0,limit:64};
 if(own.length!==1||pieces.some(p=>p.toUpperCase()==='P'))return board;
 const n=t=>pieces.filter(p=>p.toUpperCase()===t&&color(p)!==side).length;
 const limit=Math.min(n('R')>=2?8:64,n('R')>=1?16:64,n('B')>=2?22:64,n('N')>=2?32:64,n('B')>=1?44:64);
 return {side,kind:'piece',current:pieces.length,limit};
}
export function positionKey(s){return s.board.map(p=>p||'.').join('')+s.turn+Object.values(s.rights).map(Number).join('');}
export function outcome(s,moves=legal(s)){
 if(!moves.length){if(!inCheck(s))return {winner:null,reason:'stalemate'};const winner=opposite(s.turn);return {winner:s.count?.side===winner?null:winner,reason:s.count?.side===winner?'counting':'checkmate'};}
 if(s.count&&s.count.current>=s.count.limit)return {winner:null,reason:'counting'};
 if(s.board.filter(Boolean).length===2)return {winner:null,reason:'bareKings'};
 return null;
}
function evaluate(s){
 let score=0;for(let i=0;i<64;i++){const p=s.board[i];if(!p)continue;const side=color(p),t=p.toUpperCase(),r=i>>3,c=i%8,central=7-Math.abs(3.5-r)-Math.abs(3.5-c),advance=side==='w'?7-r:r;
  let n=value[t];if(t==='P')n+=advance*7;if(['B','N','Q','F'].includes(t))n+=central*7;if(t==='R')n+=central*2;score+=side==='w'?n:-n;
 }return s.turn==='w'?score:-score;
}
function ordered(s,moves){return moves.sort((a,b)=>priority(s,b)-priority(s,a));}
function priority(s,m){const target=s.board[m.to];return (target?value[target.toUpperCase()]*10-value[s.board[m.from].toUpperCase()]:0)+(s.board[m.from].toUpperCase()==='P'&&[2,5].includes(m.to>>3)?100:0);}
export function chooseMove(s,level='medium',random=Math.random){
 const settings={beginner:{depth:1,ms:60},medium:{depth:3,ms:220},advanced:{depth:5,ms:650}}[level]||{depth:3,ms:220};
 const root=ordered(s,legal(s));if(!root.length)return {move:null,depth:0,nodes:0};
 const deadline=Date.now()+settings.ms;let nodes=0,doneDepth=0,best=root[0];const TIMEOUT=Symbol('timeout');
 function search(pos,depth,alpha,beta,ply){
  nodes++;if((nodes&15)===0&&Date.now()>deadline)throw TIMEOUT;
  if(depth===0){if(pos.count&&pos.count.current>=pos.count.limit)return 0;return evaluate(pos);}
  const moves=ordered(pos,legal(pos)),end=outcome(pos,moves);if(end)return end.winner===null?0:-100000+ply;
  let max=-Infinity;for(const m of moves){const score=-search(apply(pos,m),depth-1,-beta,-alpha,ply+1);max=Math.max(max,score);alpha=Math.max(alpha,score);if(alpha>=beta)break;}return max;
 }
 for(let depth=1;depth<=settings.depth;depth++){
  try{
   let scores=[],alpha=-Infinity;
   for(const m of root){const score=-search(apply(s,m),depth-1,-Infinity,-alpha,1);scores.push({m,score});alpha=Math.max(alpha,score);}
   scores.sort((a,b)=>b.score-a.score);best=scores[0].m;
   if(level==='beginner'){
    const pool=scores.filter(x=>x.score>=scores[0].score-200);best=pool[Math.floor(random()*Math.min(5,pool.length))].m;
   }
   const index=root.findIndex(m=>m.from===best.from&&m.to===best.to);root.unshift(root.splice(index,1)[0]);doneDepth=depth;
  }catch(e){if(e!==TIMEOUT)throw e;break;}
 }
 return {move:best,depth:doneDepth,nodes};
}

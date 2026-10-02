import {handleRooms} from './rooms.js';
import {assets} from '../.generated/assets.js';
export default {async fetch(request,env){
 const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return handleRooms(request,env);
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
 const asset=assets[url.pathname==='/'?'/index.html':url.pathname];if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
}};

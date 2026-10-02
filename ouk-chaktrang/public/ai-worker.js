import {chooseMove} from './engine.js';
self.onmessage=({data})=>{try{self.postMessage({...chooseMove(data.state,data.level),id:data.id});}catch(e){self.postMessage({id:data.id,error:e.message});}};

import {readdir,readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
import {build} from 'esbuild';
const assets={},types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
async function collect(path,prefix=''){for(const entry of await readdir(path,{withFileTypes:true})){const full=path+'/'+entry.name,key=prefix+'/'+entry.name;if(entry.isDirectory())await collect(full,key);else assets[key]={body:await readFile(full,'utf8'),type:types[entry.name.slice(entry.name.lastIndexOf('.'))]||'text/plain'};}}
await collect('public');await mkdir('.generated',{recursive:true});await writeFile('.generated/assets.js','export const assets = '+JSON.stringify(assets)+';');
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});
await build({entryPoints:['server/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022'});
await mkdir('dist/.openai',{recursive:true});await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built Worker with '+Object.keys(assets).length+' embedded public assets and D1 migrations.');

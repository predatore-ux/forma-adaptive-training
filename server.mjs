import {trainingAPI} from './api.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/'))return await trainingAPI(req,res,url);const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!path.startsWith(root+sep))throw Error();const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.webm':'video/webm'})[extname(path)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end()}}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));


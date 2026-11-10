import {trainingAPI} from './api.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){try{return await trainingAPI(req,res,url)}catch{res.writeHead(500);return res.end("Service unavailable")}}const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!path.startsWith(root+sep))throw Error();const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css','.jpg':'image/jpeg','.webm':'video/webm'})[extname(path)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end()}}).listen(Number(process.env.PORT||4173),process.env.HOST||'127.0.0.1');


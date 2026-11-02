const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const files={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
for(const n of fs.readdirSync(path.join(root,'assets'))){if(n.endsWith('.png'))files['/assets/'+n]=['assets/'+n,'image/png'];} 
const pick=(real,demo)=>fs.existsSync(path.join(root,real))?real:demo;
files['/api/excerpts']=[pick('../.private/excerpts.json','../.private/demo-excerpts.json'),'application/json; charset=utf-8'];
files['/api/stats']=[pick('../.private/stats.json','../.private/demo-stats.json'),'application/json; charset=utf-8'];
const port=Number(process.env.SAGE_PORT||4173);
http.createServer((req,res)=>{
 const host=req.headers.host;
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(host)||req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403);res.end();return;}
 if(req.method!=='GET'){res.writeHead(405);res.end();return;}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
 let url;try{url=new URL(req.url,'http://'+host).pathname;}catch{res.writeHead(400);res.end();return;}
 if(!files[url]){res.writeHead(404);res.end('Not found');return;}
 const [name,type]=files[url];
 fs.open(path.join(root,name),'r',(err,fd)=>{
  if(err){res.writeHead(503);res.end('Local data unavailable');return;}
  res.writeHead(200,{'Content-Type':type});fs.createReadStream(null,{fd,autoClose:true}).pipe(res);
 });
}).listen(port,'127.0.0.1',()=>console.log('QuiteSage: http://127.0.0.1:'+port+' (local snapshot only)'));

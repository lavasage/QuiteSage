const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),build=path.join(root,'android/build');fs.mkdirSync(build,{recursive:true});
const target=fs.mkdtempSync(path.join(build,'public-assets-'));
// Always a fresh allowlisted directory. Never inspect or copy account data.
for(const name of ['index.html','style.css','app.js','notes.js','data-setup.js','agent-setup.txt'])fs.copyFileSync(path.join(root,'prototype',name),path.join(target,name));
for(const name of ['plate-entropy','plate-cave','plate-attention','plate-belief'])fs.copyFileSync(path.join(root,'prototype/assets',name+'.png'),path.join(target,name+'.png'));
fs.mkdirSync(path.join(target,'fonts'));for(const name of ['QuiteSageSerif-Regular.woff2','OFL.txt','FONT-NOTICE.txt'])fs.copyFileSync(path.join(root,'prototype/assets/fonts',name),path.join(target,'fonts',name));
fs.writeFileSync(path.join(target,'excerpts.json'),JSON.stringify({connected:false,available:false,excerpts:[]}));fs.writeFileSync(path.join(target,'stats.json'),JSON.stringify({connected:false,available:false}));
console.log(path.basename(target));

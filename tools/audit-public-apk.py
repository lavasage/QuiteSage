import zipfile,json,re,sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'android/build/QuiteSage.apk')
expected={'assets/excerpts.json':{'connected':False,'available':False,'excerpts':[]},'assets/stats.json':{'connected':False,'available':False}}
allowed={'index.html','style.css','app.js','notes.js','data-setup.js','agent-setup.txt','excerpts.json','stats.json','plate-entropy.png','plate-cave.png','plate-attention.png','plate-belief.png','fonts/QuiteSageSerif-Regular.woff2','fonts/OFL.txt','fonts/FONT-NOTICE.txt'}
with zipfile.ZipFile(p) as z:
 actual={n[7:] for n in z.namelist() if n.startswith('assets/') and not n.endswith('/')}
 assert actual==allowed, 'APK assets are not the exact public allowlist'
 for name,value in expected.items():assert json.loads(z.read(name))==value,'APK contains reading records or statistics'
 for name in z.namelist():
  if name.endswith(('.js','.txt','.html','.json')):assert not re.search(rb'wrk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}',z.read(name)),'Possible embedded credential'
print('PASS: exact public asset allowlist; zero excerpts; zero account statistics; no credential patterns')

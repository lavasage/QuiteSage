const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const adb='C:/Users/lcc30/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const serialIndex=process.argv.indexOf('--serial');
function detectSerial(){
 // 只连一台设备时不用手写序列号；多台再要求 --serial
 try{
  const out=cp.spawnSync(adb,['devices'],{encoding:'utf8',timeout:8000}).stdout||'';
  const ids=out.split('\n').slice(1).map(l=>l.trim()).filter(l=>/\tdevice$/.test(l)).map(l=>l.split('\t')[0]);
  return ids.length===1?ids[0]:'';
 }catch(e){return '';}
}
const serial=serialIndex<0?(process.env.ADB_SERIAL||detectSerial()):process.argv[serialIndex+1],pkg='com.sagepaper.launcher';
if(!serial)throw new Error('需要 --serial <设备序列号> 或环境变量 ADB_SERIAL（或只连一台设备）');
if(!serial||!/^[A-Za-z0-9._:/-]+$/.test(serial))throw new Error('Invalid --serial');
const manifest=fs.readFileSync(path.join(root,'android/AndroidManifest.xml'),'utf8');
const expectedCode=manifest.match(/android:versionCode="(\d+)"/)[1];
const expectedName=manifest.match(/android:versionName="([^"]+)"/)[1];
const waitIndex=process.argv.indexOf('--wait-ms');
const waitMs=waitIndex<0?90000:Number(process.argv[waitIndex+1]);
if(!Number.isFinite(waitMs)||waitMs<1000||waitMs>300000)throw new Error('Invalid --wait-ms');
function run(args,timeout=12000){return cp.spawnSync(adb,['-s',serial,...args],{encoding:'utf8',maxBuffer:16*1024*1024,timeout});}
function isCurrent(output){return new RegExp('versionCode='+expectedCode+'(?:\\s|$)').test(output)&&output.split('\n').some(line=>line.trim()==='versionName='+expectedName);}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const deadline=Date.now()+waitMs;let attempts=0,nextInstall=0,verifiedInstall=false,grantedUsage=false;
 console.log('Waiting for EPD106 at '+serial+'; target '+expectedName+' / code '+expectedCode+'.');
 while(Date.now()<deadline){
  const version=run(['shell','dumpsys','package',pkg],4000);
  if(version.status===0&&isCurrent(version.stdout||'')){
   if(!verifiedInstall){console.log('Device package version verified: '+expectedName+' / code '+expectedCode+'.');verifiedInstall=true;}
   if(!grantedUsage){
    // 阅读天数要判断"今天有没有打开微信读书"，靠用量统计；该权限只能由系统特殊授权。
    const grant=run(['shell','appops','set',pkg,'GET_USAGE_STATS','allow'],4000);
    if(grant.status===0)grantedUsage=true;
   }
   const home=run(['shell','cmd','package','set-home-activity',pkg+'/.SageActivity'],4000);
   if(home.status!==0){await pause(1000);continue;}
   const start=run(['shell','am','start','-n',pkg+'/.SageActivity'],4000);
   if(start.status!==0){await pause(1000);continue;}
   const resolved=run(['shell','cmd','package','resolve-activity','--brief','-a','android.intent.action.MAIN','-c','android.intent.category.HOME'],4000);
   const foreground=run(['shell','dumpsys','activity','activities'],4000);
   if(resolved.status===0&&(resolved.stdout||'').includes(pkg)&&/mResumedActivity:.*com\.sagepaper\.launcher/.test(foreground.stdout||'')){
    console.log('Default HOME and foreground verified.');return;
   }
  }else if(version.status===0&&Date.now()>=nextInstall&&attempts<3){
   attempts++;console.log('Installing update (attempt '+attempts+').');
   const install=run(['install','--no-streaming','-r',path.join(root,'android/build/QuiteSage.apk')],30000);
   const detail=(install.stderr||install.stdout||'').trim();
   if(detail)console.log(detail.slice(0,1200));
   // A USB disconnect can hide the result while Android finishes installation.
   // Read the actual package version before retrying or reporting success.
   nextInstall=Date.now()+5000;
  }
  await pause(1000);
 }
 console.error(verifiedInstall?'Package installed; HOME/foreground verification pending USB connection.':'Device update not verified within the connection window.');
 process.exitCode=2;
})().catch(error=>{console.error(error.message);process.exitCode=1;});

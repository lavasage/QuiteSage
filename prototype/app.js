(function(){'use strict';var native=!!window.SageNative,apps=[],home=document.getElementById('home'),drawer=document.getElementById('drawer'),panel=document.getElementById('panel-content');document.addEventListener('keydown',function(e){if(e.key==='Tab')document.body.classList.add('keyboard');});document.addEventListener('touchstart',function(){document.body.classList.remove('keyboard');});document.addEventListener('mousedown',function(){document.body.classList.remove('keyboard');});
var icons={book:'<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h10l3 3 3-3h10v22H19l-3 2-3-2H3zM16 8v21"/></svg>',apps:'<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 3h10v10H3zM19 3h10v10H19zM3 19h10v10H3zM19 19h10v10H19z"/></svg>'};
icons.reader='<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 5h8l4 3 4-3h8v21h-8l-4 3-4-3H4zM16 8v21M8 11h4M8 16h4M20 11h4M20 16h4"/></svg>';
icons.library='<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 5h6v23H5zM14 5h5v23h-5zM21 7l5-1 4 21-5 1zM5 10h6M14 10h5M23 13l5-1"/></svg>';
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad2(n){return ('0'+n).slice(-2);}
function fmtDay(sec){var d=new Date(sec*1000);return isNaN(d.getTime())?'':d.getFullYear()+'.'+pad2(d.getMonth()+1)+'.'+pad2(d.getDate());}
function notice(t){document.getElementById('notice').textContent=t;clearTimeout(notice.timer);notice.timer=setTimeout(function(){document.getElementById('notice').textContent='';},5000);}
function update(s){var d=new Date(s&&s.now||Date.now()),h=d.getHours(),m=d.getMinutes();document.getElementById('clock').textContent=('0'+h).slice(-2)+':'+('0'+m).slice(-2);document.getElementById('calendar').textContent=(d.getMonth()+1)+'月'+d.getDate()+'日';document.getElementById('weekday').textContent='周'+['日','一','二','三','四','五','六'][d.getDay()];var battery=document.getElementById('battery');battery.textContent=s&&s.battery!=null?s.battery+'%':'';battery.hidden=!(s&&s.battery!=null);var wifi=document.getElementById('wifi');if(s&&s.wifi!=null){var lv=Math.max(0,Math.min(4,s.wifi));if(wifi.getAttribute('data-lv')!==String(lv)){wifi.innerHTML=wifiIcon(lv);wifi.setAttribute('data-lv',String(lv));}wifi.hidden=false;}else wifi.hidden=true;}
function wifiIcon(level){return '<svg class="wifi-icon" viewBox="0 0 20 16" aria-hidden="true">'
+'<path d="M2 6.2a12.4 12.4 0 0 1 16 0"/>'
+(level>=2?'<path d="M5.6 9.6a7.8 7.8 0 0 1 8.8 0"/>':'')
+(level>=3?'<path d="M8.6 12.7a3.4 3.4 0 0 1 2.8 0"/>':'')
+(level<1?'<path d="M3 15 17 1"/>':'')
+'</svg>';}window.SageUpdateDevice=update;window.addEventListener('resize',function(){setTimeout(fitExcerpt,60);});
var excerpts=[],bag=[],currentExcerpt=null,excerptInfo=null,lastExcerptId='',previousExcerpts=[];
try{lastExcerptId=localStorage.getItem('sage-last-excerpt')||'';}catch(ignore){}
function displayExcerpt(record,remember){
 if(remember&&currentExcerpt&&currentExcerpt.id!==record.id){previousExcerpts.push(currentExcerpt);if(previousExcerpts.length>50)previousExcerpts.shift();}
 currentExcerpt=record;lastExcerptId=record.id;
 try{localStorage.setItem('sage-last-excerpt',lastExcerptId);}catch(ignore){}
 document.getElementById('excerpt-text').textContent=record.text;
 document.getElementById('excerpt-text').classList.remove('loading');
 var source=document.getElementById('excerpt-source');var day=record.createdAt?fmtDay(record.createdAt):'';source.innerHTML='<cite>《'+esc(record.title)+'》</cite>'+(day?'<time class="excerpt-date" datetime="'+day.replace(/\./g,'-')+'">'+day+'</time>':'');source.hidden=false;
 document.getElementById('next-excerpt').disabled=excerpts.length<2;
 fitExcerpt();
}
function fitExcerpt(){
 var box=document.querySelector('.excerpt'),page=document.querySelector('.excerpt-page'),text=document.getElementById('excerpt-text');
 if(!box||!page||!text||!currentExcerpt||!box.clientHeight)return;
 text.style.fontSize='';page.style.paddingTop='';
 var size=parseFloat(getComputedStyle(text).fontSize)||26;
 while(size>18&&page.offsetHeight>box.clientHeight){size-=1;text.style.fontSize=size+'px';}
 var pad=parseFloat(getComputedStyle(page).paddingTop)||0;
 while(pad>16&&page.offsetHeight>box.clientHeight){pad=Math.max(16,pad-28);page.style.paddingTop=pad+'px';}
}

function nextExcerpt(){
 if(!excerpts.length)return;
 if(!bag.length){bag=excerpts.slice();for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),swap=bag[i];bag[i]=bag[j];bag[j]=swap;}if(bag.length>1&&bag[bag.length-1].id===lastExcerptId){var first=bag[0];bag[0]=bag[bag.length-1];bag[bag.length-1]=first;}}
 displayExcerpt(bag.pop(),true);
}
function sameBook(){
 if(!currentExcerpt)return false;
 var choices=excerpts.filter(function(q){return q.bookId===currentExcerpt.bookId&&q.id!==currentExcerpt.id;});
 if(!choices.length)return false;
 var chosen=choices[Math.floor(Math.random()*choices.length)];bag=bag.filter(function(q){return q.id!==chosen.id;});displayExcerpt(chosen,true);return true;
}
function previousExcerpt(){if(!previousExcerpts.length)return false;displayExcerpt(previousExcerpts.pop(),false);return true;}
function holdAction(button,action){
 var timer=null,suppress=false,startX=0,startY=0;
 function cancel(){clearTimeout(timer);timer=null;}
 function begin(e){if(button.disabled||e.button>0)return;cancel();suppress=false;var p=e.touches?e.touches[0]:e;startX=p.clientX;startY=p.clientY;timer=setTimeout(function(){timer=null;suppress=action()===true;},650);}
 function move(e){var p=e.touches?e.touches[0]:e;if(p&&(Math.abs(p.clientX-startX)>12||Math.abs(p.clientY-startY)>12))cancel();}
 if(window.PointerEvent){button.addEventListener('pointerdown',begin);button.addEventListener('pointermove',move);button.addEventListener('pointerup',cancel);button.addEventListener('pointercancel',cancel);button.addEventListener('pointerleave',cancel);}
 else{button.addEventListener('touchstart',begin);button.addEventListener('touchmove',move);button.addEventListener('touchend',cancel);button.addEventListener('touchcancel',cancel);button.addEventListener('mousedown',begin);button.addEventListener('mousemove',move);button.addEventListener('mouseup',cancel);button.addEventListener('mouseleave',cancel);}
 button.addEventListener('contextmenu',function(e){e.preventDefault();});
 button.addEventListener('click',function(e){if(suppress){e.preventDefault();e.stopImmediatePropagation();suppress=false;}},true);
 button.addEventListener('keydown',function(e){if(e.shiftKey&&e.key==='Enter'){e.preventDefault();action();}});
}
holdAction(document.getElementById('excerpt-source'),sameBook);
holdAction(document.getElementById('next-excerpt'),previousExcerpt);
function loadExcerpts(){
 var request=new XMLHttpRequest();request.open('GET','/api/excerpts');request.timeout=12000;
 function unavailable(){document.getElementById('excerpt-text').textContent='摘抄暂时没有送达。';document.getElementById('excerpt-text').classList.remove('loading');document.getElementById('excerpt-source').hidden=true;var b=document.getElementById('next-excerpt');b.disabled=false;b.querySelector('span').textContent='重新载入';b.onclick=loadExcerpts;}
 request.onload=function(){try{if(request.status!==200)throw new Error('Unavailable');var data=JSON.parse(request.responseText);excerpts=(data.excerpts||[]).filter(function(x){return x.id&&x.text&&x.title&&x.author;});bag=[];excerptInfo=data;if(!excerpts.length){document.getElementById('excerpt-text').textContent='还没有适合展示的完整划线。';document.getElementById('excerpt-text').classList.remove('loading');document.getElementById('next-excerpt').disabled=true;return;}var b=document.getElementById('next-excerpt');b.querySelector('span').textContent='换一则';b.onclick=nextExcerpt;nextExcerpt();deepLink();}catch(e){unavailable();}};
 request.onerror=unavailable;request.ontimeout=unavailable;request.send();
}
document.getElementById('excerpt-source').onclick=function(){
 if(!currentExcerpt)return;var q=currentExcerpt,e=q.evidence||{};
 var date=function(value,seconds){if(!value)return '未提供';var d=new Date(seconds?value*1000:value);return isNaN(d.getTime())?'未提供':d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';};
 openPanel('摘抄出处','<blockquote class="detail-excerpt">'+esc(q.text)+'</blockquote><h2 class="source-title">《'+esc(q.title)+'》</h2><p>'+esc(q.author)+'</p><dl class="source-details"><dt>章节</dt><dd>'+esc(q.chapter||'未提供')+'</dd><dt>划线时间</dt><dd>'+date(q.createdAt,true)+'</dd><dt>数据获取</dt><dd>'+date(e.fetchedAt)+'</dd><dt>来源</dt><dd>微信读书 · 我的划线</dd></dl>');
};
var THEMES=[{id:'plate-entropy',name:'熵与秩序',words:'有序 · 无序 · 不可逆',note:'闭合系统里，秩序总是以更大的无序为代价。热力学第二定律，也是阅读的隐喻：每读一页，旧的确定性就被稀释一点。'},{id:'plate-cave',name:'洞穴与光',words:'影像 · 真实 · 影子',note:'柏拉图在《理想国》第七卷写下洞穴：人被锁链固定，只看见火光投在墙上的影子，并把影子当作全部真实。回头，是疼痛的开始。'},{id:'plate-attention',name:'注意的窄门',words:'聚焦 · 选择 · 盲区',note:'注意力的容量有限，视野之外即盲区。认知心理学把这道窄门画成一个圆：圆心是当下，边缘是你自愿放弃的世界。'},{id:'plate-belief',name:'误差与信念',words:'先验 · 证据 · 更新',note:'先验是起点，不是结论。贝叶斯推断要求每一条新证据修正旧信念，而后验又成为下一次的先验——认知由此获得方向。'}];
var themeIndex=0;try{themeIndex=parseInt(localStorage.getItem('sage-lock-theme')||'0',10)||0;}catch(ignore){}if(themeIndex<0||themeIndex>=THEMES.length)themeIndex=0;
function themePanel(){
 var rows=THEMES.map(function(t,i){return '<button class="theme-row" data-theme="'+i+'"><img src="/assets/'+t.id+'.png" alt=""><span><b>'+esc(t.name)+'</b><i>'+esc(t.words)+'</i></span>'+(i===themeIndex?'<em>当前</em>':'')+'</button>';}).join('');
 var supported=rotationSupported(),on=rotationEnabled();
 var head=(supported?'<button class="theme-rotate" data-action="rotate"><span>锁屏轮播</span><em'+(on?' class="on"':'')+'>'+(on?'已开启':'已关闭')+'</em></button>':'');
 openPanel('锁屏壁纸',head+rows+'<p class="theme-note">'+(supported?(on?'轮播中：每次锁屏随机换一幅，'+THEMES.length+' 幅不重复轮换。':'开启后每次锁屏随机换一幅，'+THEMES.length+' 幅不重复轮换。'):'')+'四幅分别对应热力学、希腊哲学、认知心理学与贝叶斯推断；点开可全幅预览，也可单独设为设备壁纸。</p>');
}
function rotationSupported(){if(!native)return true;try{return !!window.SageNative.rotationSupported();}catch(e){return false;}}
function rotationEnabled(){if(!native)return false;try{return !!window.SageNative.rotationEnabled();}catch(e){return false;}}
function toggleRotation(){
 if(!native||!window.SageNative.setRotation){notice('浏览器预览；设备上可开启轮播。');return;}
 var on=!rotationEnabled();
 window.SageNative.setRotation(on);
 themePanel();
}
function previewTheme(i){
 if(i<0||i>=THEMES.length)return;themeIndex=i;document.getElementById('lock-apply').textContent=native&&!rotationSupported()?'系统壁纸设置':'设为壁纸';
 var img=document.getElementById('lock-preview');img.src='/assets/'+THEMES[i].id+'.png';img.hidden=false;
 document.getElementById('paper').className='paper lock-mode';document.getElementById('lock-actions').hidden=true;
}
function clearPreview(){document.getElementById('lock-preview').hidden=true;document.getElementById('lock-actions').hidden=true;document.getElementById('paper').className='paper';}
function closePreview(){clearPreview();themePanel();}
function applyTheme(){
 var t=THEMES[themeIndex];try{localStorage.setItem('sage-lock-theme',String(themeIndex));}catch(ignore){}
 if(native&&window.SageNative.setWallpaper)window.SageNative.setWallpaper(t.id);else{notice('浏览器预览；在设备上会把《'+t.name+'》设为壁纸。');closePreview();}
}
var archiveCache=null;
function buildArchive(){
 if(archiveCache)return archiveCache;
 var s={n:excerpts.length,books:{},min:0,max:0,latest:null},i;
 for(i=0;i<excerpts.length;i++){var q=excerpts[i];s.books[q.bookId]=1;
  if(q.createdAt){if(!s.min||q.createdAt<s.min)s.min=q.createdAt;if(!s.max||q.createdAt>s.max){s.max=q.createdAt;s.latest=q;}}}
 s.bookCount=Object.keys(s.books).length;
 archiveCache=s;return s;
}
var reading=null;
function dayKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function readDays(){
 var days={},k,i;
 if(reading&&reading.daily)for(k in reading.daily)days[k]=reading.daily[k];
 try{var led=JSON.parse(localStorage.getItem('sage-read-days')||'{}');for(k in led)days[k]=Math.max(days[k]||0,led[k]||1);}catch(ignore){}
 return days;
}
function markToday(){
 try{var led=JSON.parse(localStorage.getItem('sage-read-days')||'{}'),k=dayKey(new Date());
  if(!led[k]){led[k]=1;var ks=Object.keys(led).sort();while(ks.length>800)delete led[ks.shift()];localStorage.setItem('sage-read-days',JSON.stringify(led));}
 }catch(ignore){}
}
function streak(){
 var days=readDays(),d=new Date();
 if(!(days[dayKey(d)]>0))return 0;
 var n=0;
 while(days[dayKey(d)]>0){n++;d.setDate(d.getDate()-1);if(n>3650)break;}
 return n;
}
function readerOpenedToday(){
 if(!native)return true;
 try{if(window.SageNative.readerOpenedToday)return !!window.SageNative.readerOpenedToday();}catch(ignore){}
 return false;
}
function applyReading(){
 if(readerOpenedToday())markToday();
 var el=document.getElementById('streak');
 el.textContent='已连续阅读 '+streak()+' 天';
 el.hidden=false;
}
window.SageReadingSync=applyReading;
function loadStats(){
 var req=new XMLHttpRequest();req.open('GET','/api/stats');req.timeout=12000;
 req.onload=function(){try{if(req.status!==200)throw 0;reading=JSON.parse(req.responseText);applyReading();}catch(e){}};
 req.onerror=req.ontimeout=function(){};
 req.send();
}
function readStatCell(item){
 var v=String(item.value||''),num=v.replace(/[^0-9.]/g,''),unit=v.replace(/[0-9.]/g,'');
 return '<div class="stat"><b>'+esc(num)+(unit?'<i>'+esc(unit)+'</i>':'')+'</b><span>'+esc(item.label)+'</span></div>';
}
function heatGrid(){
 var rows=(reading.years||[]).map(function(y){
  var cells=y.level.map(function(lv){return '<i class="heat-cell l'+lv+'"></i>';}).join('');
  return '<div class="heat-row"><span class="heat-year">'+y.year+'</span>'+cells+'</div>';
 }).join('');
 var head='<div class="heat-row heat-head"><span class="heat-year"></span>';
 for(var m=1;m<=12;m++)head+='<span class="heat-month">'+m+'</span>';
 head+='</div>';
 return '<div class="heat">'+head+rows+'</div>';
}
function hourBars(){
 var h=reading.hours||[],max=0,i;
 for(i=0;i<h.length;i++)if(h[i]>max)max=h[i];
 if(!max)return '';
 var bars=h.map(function(v){return '<i class="tick" style="height:'+Math.max(1,Math.round(v/max*52))+'px"></i>';}).join('');
 return '<div class="ticks">'+bars+'</div><div class="chart-axis axis-hours"><span>0 时</span><span>6 时</span><span>12 时</span><span>18 时</span><span>24 时</span></div>';
}
function interestRows(){
 var cats=reading.categories||[],top=cats.length?cats[0].hours:1;
 return cats.map(function(c){
  return '<div class="rank-row"><div class="rank-line"><span class="rank-name">'+esc(c.title)+'</span><span class="rank-count">'+Math.round(c.hours)+' 小时</span></div><span class="rank-track"><span class="rank-fill" style="width:'+Math.max(2,Math.round(c.hours/top*100))+'%"></span></span></div>';
 }).join('');
}
function archivePanel(){
 if(!reading){openPanel('阅读档案','<p class="empty">阅读统计暂时没有载入。</p>');return;}
 var s=buildArchive(),hours=Math.round((reading.totalReadTime||0)/3600);
 var html='<div class="stats">'
  +'<div class="stat-grid">'+(reading.readStat||[]).map(readStatCell).join('')+'</div>'
  +'<div class="section"><div class="section-head"><strong>阅读时长</strong><em>共 '+hours+' 小时</em></div>'+heatGrid()+'<div class="heat-key"><span>少</span><i class="heat-cell l1"></i><i class="heat-cell l2"></i><i class="heat-cell l3"></i><i class="heat-cell l4"></i><span>多</span></div></div>'
  +'<div class="section"><div class="section-head"><strong>一天之中</strong><em>按累计时长</em></div>'+hourBars()+'</div>'
  +'<div class="section"><div class="section-head"><strong>兴趣分布</strong><em>前 5 类</em></div>'+interestRows()+'</div>'
  +(s.latest?'<div class="stats-foot"><div class="foot-line"><span>最近一次划线</span><em>'+fmtDay(s.max)+'</em></div><div class="foot-title">《'+esc(s.latest.title)+'》</div></div>':'')
  +'</div>';
 openPanel('阅读档案',html);
}
function deepLink(){var m=/^#(.+)$/.exec(location.hash);if(!m)return;var id=decodeURIComponent(m[1]),hit=excerpts.filter(function(q){return q.id===id;})[0];if(hit&&(!currentExcerpt||currentExcerpt.id!==hit.id))displayExcerpt(hit,false);}
loadExcerpts();loadStats();applyReading();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fitExcerpt();});
function icon(a){return a&&a.icon?'<img class="app-icon" src="'+esc(a.icon)+'" alt="">':icons.book;}
function launch(pkg){if(native)window.SageNative.launchApp(pkg);else notice('浏览器预览；App入口在设备上启动。');}
function openPanel(title,html){window.SageNotes.close();home.hidden=true;drawer.hidden=false;document.getElementById('panel-title').textContent=title;panel.innerHTML=html;drawer.scrollTop=0;document.getElementById('back').focus();}
function back(){window.SageNotes.close();home.hidden=false;drawer.hidden=true;panel.innerHTML='';document.getElementById('settings').focus();}window.SageGoHome=back;
function showApps(){openPanel('全部应用',apps.length?apps.map(function(a){return '<button class="app-row" data-package="'+esc(a.packageName)+'">'+icon(a)+'<span>'+esc(a.label)+'</span></button>';}).join(''):'<p class="empty">浏览器中无法读取设备应用列表。请在墨水屏上查看已安装的App。</p>');}
function system(){var row=function(x){return '<button class="system-row" data-action="'+x[0]+'">'+x[1]+'</button>';};var mine=[['archive','阅读档案'],['themes','锁屏壁纸']].map(row).join('');var dev=[['app','微信读书'],['wifi','Wi-Fi'],['brightness','亮度与显示'],['date','日期与时间'],['settings','系统设置'],['oldhome','返回原桌面']].map(row).join('');openPanel('设置',mine+'<p class="panel-sub">设备</p>'+dev+'<button class="system-row" data-action="art">画面注记</button>');}
function perform(a){if(a==='notes'){window.SageNotes.open(openPanel,panel);return;}if(a==='apps'){showApps();return;}if(a==='archive'){archivePanel();return;}if(a==='themes'){themePanel();return;}if(a==='rotate'){toggleRotation();return;}if(a==='art'){var t=THEMES[themeIndex];openPanel(t.name+' · 注','<img class="about-art" src="/assets/'+t.id+'.png" alt=""><p class="art-note">'+esc(t.words)+'</p><p>'+esc(t.note)+'</p>');return;}if(native)window.SageNative.perform(a);else notice('浏览器预览；设备上将打开对应系统入口。');}
function pinned(){var items=[{packageName:'com.tencent.weread.eink',label:'微信读书',icon:icons.reader},{action:'archive',label:'阅读档案',icon:icons.library},{action:'notes',label:'纸上随记',icon:'<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 5h13v5M7 5v23h19V16M17 20l-5 1 1-5L25 4l4 4zM22 7l4 4"/></svg>'},{action:'apps',label:'全部应用',icon:icons.apps}];document.getElementById('pinned').innerHTML=items.map(function(t){return '<button '+(t.packageName?'data-package="'+t.packageName+'"':'data-action="'+t.action+'"')+'>'+t.icon+'<span>'+t.label+'</span></button>';}).join('');}
document.addEventListener('click',function(e){var t=e.target.closest('[data-package],[data-action],[data-theme]');if(!t)return;if(t.hasAttribute('data-theme'))previewTheme(parseInt(t.getAttribute('data-theme'),10));else if(t.hasAttribute('data-package'))launch(t.getAttribute('data-package'));else perform(t.getAttribute('data-action'));});document.getElementById('settings').onclick=system;document.getElementById('back').onclick=back;document.getElementById('clock-button').onclick=function(){perform('date');};document.getElementById('lock-apply').onclick=applyTheme;document.getElementById('lock-close').onclick=closePreview;document.getElementById('lock-preview').onclick=function(){var a=document.getElementById('lock-actions');if(a.hidden){a.hidden=false;clearTimeout(a.timer);a.timer=setTimeout(function(){a.hidden=true;},6000);}};document.getElementById('mode').onchange=function(e){if(e.target.value==='lock')previewTheme(themeIndex);else{clearPreview();back();}};var QP=new URLSearchParams(location.search);if(QP.has('device'))document.body.classList.add('device-mode');if(QP.get('panel')==='archive')setTimeout(archivePanel,700);else if(QP.get('panel')==='themes')setTimeout(themePanel,700);if(native){try{apps=JSON.parse(window.SageNative.listApps());update(JSON.parse(window.SageNative.deviceState()));}catch(e){notice('应用列表暂不可用，可从设置返回原桌面。');update();}}else{update();setTimeout(function tick(){update();setTimeout(tick,60000-Date.now()%60000);},60000-Date.now()%60000);}pinned();}());



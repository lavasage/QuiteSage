(function(){'use strict';var native=!!window.SageNative,apps=[],home=document.getElementById('home'),drawer=document.getElementById('drawer'),panel=document.getElementById('panel-content');document.addEventListener('keydown',function(e){if(e.key==='Tab')document.body.classList.add('keyboard');});document.addEventListener('touchstart',function(){document.body.classList.remove('keyboard');});document.addEventListener('mousedown',function(){document.body.classList.remove('keyboard');});
var icons={book:'<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h10l3 3 3-3h10v22H19l-3 2-3-2H3zM16 8v21"/></svg>',apps:'<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 4h9v9H4zM19 4h9v9h-9zM4 19h9v9H4zM19 19h9v9h-9z"/></svg>'};
icons.reader='<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 5h8l4 3 4-3h8v21h-8l-4 3-4-3H4zM16 8v21M8 11h4M8 16h4M20 11h4M20 16h4"/></svg>';
icons.library='<svg class="icon-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 5h6v23H5zM14 5h5v23h-5zM21 7l5-1 4 21-5 1zM5 10h6M14 10h5M23 13l5-1"/></svg>';
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function notice(t){document.getElementById('notice').textContent=t;clearTimeout(notice.timer);notice.timer=setTimeout(function(){document.getElementById('notice').textContent='';},5000);}
function update(s){var d=new Date(s&&s.now||Date.now()),h=d.getHours(),m=d.getMinutes();document.getElementById('clock').textContent=('0'+h).slice(-2)+':'+('0'+m).slice(-2);document.getElementById('calendar').textContent=(d.getMonth()+1)+'月'+d.getDate()+'日';document.getElementById('weekday').textContent=d.getFullYear()+' · 星期'+['日','一','二','三','四','五','六'][d.getDay()];document.getElementById('battery').textContent=s&&s.battery!=null?'电量 '+s.battery+'%':'浏览器预览';}window.SageUpdateDevice=update;
var excerpts=[],bag=[],currentExcerpt=null,excerptInfo=null,lastExcerptId='';
try{lastExcerptId=localStorage.getItem('sage-last-excerpt')||'';}catch(ignore){}
function nextExcerpt(){
 if(!excerpts.length)return;
 if(!bag.length){bag=excerpts.slice();for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),swap=bag[i];bag[i]=bag[j];bag[j]=swap;}if(bag.length>1&&bag[bag.length-1].id===lastExcerptId){var first=bag[0];bag[0]=bag[bag.length-1];bag[bag.length-1]=first;}}
 currentExcerpt=bag.pop();lastExcerptId=currentExcerpt.id;
 try{localStorage.setItem('sage-last-excerpt',lastExcerptId);}catch(ignore){}
 var text=document.getElementById('excerpt-text'),source=document.getElementById('excerpt-source');
 text.textContent=currentExcerpt.text;text.className=currentExcerpt.text.length<=55?'short':'';
 source.innerHTML='<cite>《'+esc(currentExcerpt.title)+'》</cite><span>'+esc(currentExcerpt.author)+'</span>';source.hidden=false;
 var dateNode=document.getElementById('excerpt-date'),date=currentExcerpt.createdAt?new Date(currentExcerpt.createdAt*1000):null;dateNode.hidden=!date||isNaN(date.getTime());if(!dateNode.hidden){var stamp=date.getFullYear()+'.'+('0'+(date.getMonth()+1)).slice(-2)+'.'+('0'+date.getDate()).slice(-2);dateNode.innerHTML='<span>划于</span><time>'+stamp+'</time>';} 
 document.getElementById('next-excerpt').disabled=excerpts.length<2;
}
function loadExcerpts(){
 var request=new XMLHttpRequest();request.open('GET','/api/excerpts');request.timeout=12000;
 function unavailable(){document.getElementById('excerpt-text').textContent='摘抄暂时没有送达。';document.getElementById('excerpt-source').hidden=true;document.getElementById('excerpt-date').hidden=true;var b=document.getElementById('next-excerpt');b.disabled=false;b.querySelector('span').textContent='重新载入';b.onclick=loadExcerpts;}
 request.onload=function(){try{if(request.status!==200)throw new Error('Unavailable');var data=JSON.parse(request.responseText);excerpts=(data.excerpts||[]).filter(function(x){return x.id&&x.text&&x.title&&x.author;});bag=[];excerptInfo=data;if(!excerpts.length){document.getElementById('excerpt-text').textContent='还没有适合展示的完整划线。';document.getElementById('next-excerpt').disabled=true;return;}var b=document.getElementById('next-excerpt');b.querySelector('span').textContent='换一则';b.onclick=nextExcerpt;nextExcerpt();}catch(e){unavailable();}};
 request.onerror=unavailable;request.ontimeout=unavailable;request.send();
}
document.getElementById('excerpt-source').onclick=function(){
 if(!currentExcerpt)return;var q=currentExcerpt,e=q.evidence||{};
 var date=function(value,seconds){if(!value)return '未提供';var d=new Date(seconds?value*1000:value);return isNaN(d.getTime())?'未提供':d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日';};
 openPanel('摘抄出处','<blockquote class="detail-excerpt">'+esc(q.text)+'</blockquote><h2 class="source-title">《'+esc(q.title)+'》</h2><p>'+esc(q.author)+'</p><dl class="source-details"><dt>章节</dt><dd>'+esc(q.chapter||'未提供')+'</dd><dt>划线时间</dt><dd>'+date(q.createdAt,true)+'</dd><dt>数据获取</dt><dd>'+date(e.fetchedAt)+'</dd><dt>来源</dt><dd>微信读书 '+esc(e.api||'未提供')+'</dd></dl><p>这是你保存的完整划线，未改写或补写。随机展示不代表你对这段文字的立场。</p><p>摘抄池收录 '+excerpts.length+' 条完整短划线；按长度与书目信息筛选，相同文字去重，不按观点筛选。</p>');
};
loadExcerpts();
function icon(a){return a&&a.icon?'<img class="app-icon" src="'+esc(a.icon)+'" alt="">':icons.book;}
function launch(pkg){if(native)window.SageNative.launchApp(pkg);else notice('浏览器预览；App入口在设备上启动。');}
function openPanel(title,html){home.hidden=true;drawer.hidden=false;document.getElementById('panel-title').textContent=title;panel.innerHTML=html;drawer.scrollTop=0;document.getElementById('back').focus();}
function back(){home.hidden=false;drawer.hidden=true;panel.innerHTML='';document.getElementById('settings').focus();}window.SageGoHome=back;
function showApps(){openPanel('全部应用',apps.length?apps.map(function(a){return '<button class="app-row" data-package="'+esc(a.packageName)+'">'+icon(a)+'<span>'+esc(a.label)+'</span></button>';}).join(''):'<p class="empty">浏览器中无法读取设备应用列表。请在墨水屏上查看已安装的App。</p>');}
function system(){openPanel('设备设置',[['app','微信读书'],['wifi','Wi-Fi'],['brightness','亮度与显示'],['date','日期与时间'],['settings','系统设置'],['oldhome','返回原桌面']].map(function(x){return '<button class="system-row" data-action="'+x[0]+'">'+x[1]+'</button>';}).join('')+'<button class="system-row" data-action="art">关于这幅画</button>');}
function perform(a){if(a==='art'){openPanel('种子与尺度','<img class="about-art" src="/assets/specimen-lock-v1.png" alt="完整种荚版画"><p>标本与秩序，以自然形态和几何观察呼应概念、生命与语言的阅读线索。这是原创艺术意象，不是科学测量图。锁屏保留全幅，桌面以真实划线重访旧页。</p>');return;}if(native)window.SageNative.perform(a);else notice('浏览器预览；设备上将打开对应系统入口。');}
function pinned(){var targets=[{packageName:'com.tencent.weread.eink',label:'微信读书'},{packageName:'com.duokan.einkreader',label:'多看阅读'}];document.getElementById('pinned').innerHTML=targets.filter(function(t){return !native||apps.some(function(a){return a.packageName===t.packageName;});}).map(function(t){var actual=apps.filter(function(a){return a.packageName===t.packageName;})[0];return '<button data-package="'+esc(t.packageName)+'">'+(t.packageName==='com.tencent.weread.eink'?icons.reader:icons.library)+'<span>'+esc(actual?actual.label:t.label)+'</span></button>';}).join('')+'<button id="all-apps">'+icons.apps+'<span>全部应用</span></button>';document.getElementById('all-apps').onclick=showApps;}
document.addEventListener('click',function(e){var t=e.target.closest('[data-package],[data-action]');if(!t)return;if(t.hasAttribute('data-package'))launch(t.getAttribute('data-package'));else perform(t.getAttribute('data-action'));});document.getElementById('settings').onclick=system;document.getElementById('back').onclick=back;document.getElementById('clock-button').onclick=function(){perform('date');};document.getElementById('mode').onchange=function(e){var lock=e.target.value==='lock';document.getElementById('paper').className=lock?'paper lock-mode':'paper';document.getElementById('lock-preview').hidden=!lock;if(!lock)back();};if(new URLSearchParams(location.search).has('device'))document.body.classList.add('device-mode');if(native){try{apps=JSON.parse(window.SageNative.listApps());update(JSON.parse(window.SageNative.deviceState()));}catch(e){notice('应用列表暂不可用，可从设置返回原桌面。');update();}}else{update();setTimeout(function tick(){update();setTimeout(tick,60000-Date.now()%60000);},60000-Date.now()%60000);}pinned();}());



const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, '.private');
const load = name => { const f=path.join(dir,name+'.json'); if(!fs.existsSync(f))return null; const s=JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));Object.defineProperty(s,'_snapshot',{value:name+'.json'});return s; };
const shelf=load('shelf'), notebooks=load('notebooks-0');
const ids=[...new Set([...(shelf.response.books||[]).map(b=>b.bookId),...notebooks.response.books.map(b=>b.bookId)])];
const source = (s, jsonPath) => s ? {api:s.apiName,path:jsonPath,fetchedAt:s.fetchedAt,snapshot:s._snapshot,skillVersion:s.skillVersion}:null;
const books=ids.map(id=>{
  const ss=shelf.response.books.find(b=>b.bookId===id), nn=notebooks.response.books.find(b=>b.bookId===id);
  const bs=load('book-'+id), ps=load('progress-'+id);
  const b=bs?.response||ss||nn?.book||{}, p=ps?.response?.book||{};
  const hasProgress=typeof p.progress==='number';
  return {id,title:b.title||ss?.title||nn?.book?.title||'书名未返回',author:b.author||ss?.author||nn?.book?.author||null,category:b.category||ss?.category||null,cover:b.cover||ss?.cover||nn?.book?.cover||null,wordCount:b.wordCount??null,intro:b.intro||null,readerLink:b.readerLink||ss?.readerLink||null,deepLink:b.deepLink||ss?.deepLink||null,inShelf:!!ss,private:ss?.secret===1,progress:hasProgress?p.progress:null,started:p.isStartReading??null,finishedAt:p.finishTime||null,markedFinished:ss?ss.finishReading===1:nn?.markedStatus===1,lastReadAt:p.updateTime||ss?.readUpdateTime||null,readSeconds:p.recordReadingTime??null,status:hasProgress?(p.progress===100?'finished':(p.isStartReading===false||p.isStartReading===0)?'unstarted':p.progress>0?'reading':'unknown'):'unknown',highlightCount:nn?.noteCount??null,reviewCount:nn?.reviewCount??null,bookmarkCount:nn?.bookmarkCount??null,evidence:{metadata:source(bs,'response'),progress:source(ps,'response.book'),shelf:ss?source(shelf,'response.books[bookId='+id+']'):null,notebook:nn?source(notebooks,'response.books[bookId='+id+']'):null},updatedAt:{metadata:b.updateTime||null,progress:p.updateTime||null}};
});
const notes=[];
for(const b of books){b.rawRecordReadingTime=b.readSeconds;b.readSeconds=null;b.fieldAvailability={wordCount:b.wordCount===null?'missing':'available',progress:b.progress===null?'missing':'available',readSeconds:'unverified-semantics',navigation:'unsupported-in-html'};}
for(const file of fs.readdirSync(dir)){
 if(!/^(highlights-|reviews-).*\.json$/.test(file))continue;
 const s=load(file.slice(0,-5));
 if(file.startsWith('highlights-'))for(const n of s.response.updated||[]){notes.push({id:n.bookmarkId,bookId:s.parameters.bookId,kind:'highlight',text:n.markText||'',createdAt:n.createTime||null,chapterUid:n.chapterUid??null,chapter:(s.response.chapters||[]).find(c=>c.chapterUid===n.chapterUid)?.title||null,range:n.range||null,evidence:source(s,'response.updated[bookmarkId='+n.bookmarkId+']')});}
 else for(const item of s.response.reviews||[]){const n=item.review||item;notes.push({id:n.reviewId,bookId:s.parameters.bookid,kind:n.content?'thought':'image-note',text:n.content||'',abstract:n.abstract||null,hasImage:!!n.pencilNote,createdAt:n.createTime||null,chapterUid:n.chapterUid??null,chapter:n.chapterName||n.chapterTitle||null,range:n.range||null,evidence:source(s,'response.reviews[reviewId='+n.reviewId+'].review')});}
}
const seen=new Set();const uniqueNotes=notes.filter(n=>{const key=n.kind+':'+n.id;if(seen.has(key))return false;seen.add(key);return true;});
const stats={};for(const mode of ['overall','annually','monthly','weekly']){const s=load('stats-'+mode);stats[mode]={...s.response,evidence:source(s,'response')};delete stats[mode].rank;delete stats[mode].medals;delete stats[mode].preferCp;delete stats[mode].preferBooks;delete stats[mode].readLongest;}
const errors=load('collection-status')||[];
const history=[];for(let year=2021;year<=2025;year++){const s=load('stats-'+year);if(s)history.push({year,totalReadTime:s.response.totalReadTime,readDays:s.response.readDays,categories:(s.response.preferCategory||[]).filter(c=>c.readingTime>0),evidence:source(s,'response')});}
const data={generatedAt:new Date().toISOString(),timezone:'Asia/Shanghai',source:'Tencent WeChatReading official gateway',books,notes:uniqueNotes,stats,shelfCounts:{books:shelf.response.books.length,albums:shelf.response.albums.length,articleEntry:shelf.response.mp&&Object.keys(shelf.response.mp).length?1:0},notebookCounts:{books:notebooks.response.totalBookCount,total:notebooks.response.totalNoteCount,highlights:notebooks.response.books.reduce((a,b)=>a+(b.noteCount||0),0),reviews:notebooks.response.books.reduce((a,b)=>a+(b.reviewCount||0),0),bookmarks:notebooks.response.books.reduce((a,b)=>a+(b.bookmarkCount||0),0)},availability:{notebooksComplete:!notebooks.response.hasMore,errors:errors.filter(x=>x.status!=='available')},device:{width:758,height:1024,appHeight:960,dpi:212,android:'8.1',webview:'61',package:'com.tencent.weread.eink',battery:null,navigation:null,refreshCapability:null}};
data.history=history;
const curationFile=path.join(root,'reports/curation.json');data.curation=fs.existsSync(curationFile)?JSON.parse(fs.readFileSync(curationFile,'utf8')):{recommendations:[]};
data.caveats=['单书 recordReadingTime 全部为 0，与周期统计不能对应，暂不展示为累计时长。','全部书籍 wordCount 未返回，不能判断长短篇偏好。','部分读完标记与当前进度不同，分别展示。','分类时长不保证互斥，不能相加作总量或计算整体百分比。','年度文字/收听分项与 totalReadTime 存在不一致，暂不做占比图。'];
fs.writeFileSync(path.join(dir,'normalized.json'),JSON.stringify(data,null,2));
console.log(JSON.stringify({books:books.length,shelf:books.filter(b=>b.inShelf).length,notes:uniqueNotes.length,counts:data.notebookCounts,errors:data.availability.errors.length}));

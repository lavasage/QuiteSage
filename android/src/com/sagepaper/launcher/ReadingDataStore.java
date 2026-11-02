package com.sagepaper.launcher;

import android.content.Context;
import android.util.AtomicFile;
import org.json.*;
import java.io.*;
import java.util.*;

/** Only explicit, user-selected imports enter this device-private store. */
public final class ReadingDataStore {
    public static final int MAX_BYTES=5*1024*1024;
    private final AtomicFile file;
    public ReadingDataStore(Context context){file=new AtomicFile(new File(context.getFilesDir(),"reading-data-v1.json"));}
    public static byte[] readLimited(InputStream in) throws IOException {
        ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[8192];int n;
        while((n=in.read(b))!=-1){if(out.size()+n>MAX_BYTES)throw new IOException("文件超过 5 MB");out.write(b,0,n);}return out.toByteArray();
    }
    private static void secrets(Object value,int depth) throws Exception {
        if(depth>24)throw new IOException("数据层级过深");
        if(value instanceof JSONObject){JSONObject o=(JSONObject)value;Iterator<String> keys=o.keys();while(keys.hasNext()){String k=keys.next();String t=k.toLowerCase(Locale.US).replace("_","").replace("-","").replace(" ","");if(Arrays.asList("apikey","accesstoken","refreshtoken","authorization","cookie","password","secret","token","credentials","credential","privatekey").contains(t))throw new IOException("数据文件不能包含认证信息");secrets(o.get(k),depth+1);}}
        else if(value instanceof JSONArray){JSONArray a=(JSONArray)value;for(int i=0;i<a.length();i++)secrets(a.get(i),depth+1);}
        else if(value instanceof String&&((String)value).matches("(?s).*(wrk-[A-Za-z0-9_-]{16,}|github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}).*"))throw new IOException("数据文件不能包含密钥");
    }
    private static String text(JSONObject o,String key,int max,boolean required) throws Exception {Object v=o.opt(key);if(v==null||v==JSONObject.NULL){if(required)throw new IOException("缺少字段："+key);return "";}if(!(v instanceof String)||((String)v).length()>max||(required&&((String)v).trim().length()==0))throw new IOException("无效字段："+key);return (String)v;}
    private static double number(Object v) throws Exception {if(!(v instanceof Number))throw new IOException("统计字段需要数字");double n=((Number)v).doubleValue();if(Double.isNaN(n)||Double.isInfinite(n)||n<0)throw new IOException("统计数值无效");return n;}
    public static JSONObject validate(String raw) throws Exception {
        if(raw.getBytes("UTF-8").length>MAX_BYTES)throw new IOException("文件超过 5 MB");
        JSONObject root=new JSONObject(raw.replaceFirst("^\uFEFF",""));secrets(root,0);
        if(root.optInt("schemaVersion",-1)!=1||!"weread-skill".equals(root.optString("source")))throw new IOException("请选择 QuiteSage 阅读数据文件");
        JSONObject out=new JSONObject();out.put("schemaVersion",1);out.put("source","weread-skill");out.put("exportedAt",text(root,"exportedAt",80,true));out.put("ownerLabel",text(root,"ownerLabel",100,false));
        JSONObject e=root.getJSONObject("excerpts"),clean=new JSONObject();JSONArray a=e.getJSONArray("excerpts"),rows=new JSONArray();if(a.length()>10000)throw new IOException("摘抄数量过多");Set<String> ids=new HashSet<String>();
        for(int i=0;i<a.length();i++){JSONObject q=a.getJSONObject(i),n=new JSONObject();for(String k:new String[]{"id","bookId","text","title","author"})n.put(k,text(q,k,"text".equals(k)?20000:500,!"bookId".equals(k)));if(!ids.add(n.getString("id")))throw new IOException("摘抄 ID 重复");n.put("chapter",text(q,"chapter",1000,false));if(q.has("createdAt")&&!q.isNull("createdAt"))n.put("createdAt",number(q.get("createdAt")));JSONObject evidence=q.optJSONObject("evidence");if(evidence!=null){JSONObject ev=new JSONObject();ev.put("fetchedAt",text(evidence,"fetchedAt",80,false));n.put("evidence",ev);}rows.put(n);}
        clean.put("excerpts",rows);clean.put("fetchedAt",text(e,"fetchedAt",80,false));out.put("excerpts",clean);
        if(root.has("stats")&&!root.isNull("stats")&&!(root.opt("stats") instanceof JSONObject))throw new IOException("统计必须为对象或 null");
        JSONObject stats=root.optJSONObject("stats");if(stats==null){out.put("stats",JSONObject.NULL);return out;}
        for(String key:new String[]{"readStat","hours","years","categories"})if(stats.has(key)&&!stats.isNull(key)&&!(stats.opt(key) instanceof JSONArray))throw new IOException("统计数组格式无效："+key);
        if(stats.has("daily")&&!stats.isNull("daily")&&!(stats.opt("daily") instanceof JSONObject))throw new IOException("日期统计格式无效");
        JSONObject s=new JSONObject();s.put("fetchedAt",text(stats,"fetchedAt",80,false));if(stats.has("totalReadTime")&&!stats.isNull("totalReadTime"))s.put("totalReadTime",number(stats.get("totalReadTime")));
        JSONArray stat=stats.optJSONArray("readStat"),rs=new JSONArray();if(stat!=null){if(stat.length()>20)throw new IOException("统计项目过多");for(int i=0;i<stat.length();i++){JSONObject n=stat.getJSONObject(i),r=new JSONObject();r.put("label",text(n,"label",100,true));Object v=n.get("value");if(!(v instanceof String)&&!(v instanceof Number))throw new IOException("统计读数无效");if(v instanceof Number)number(v);if(String.valueOf(v).length()>1000||String.valueOf(v).trim().length()==0)throw new IOException("统计读数无效");r.put("value",String.valueOf(v));rs.put(r);}}s.put("readStat",rs);
        JSONArray hours=stats.optJSONArray("hours"),hs=new JSONArray();if(hours!=null&&hours.length()!=24)throw new IOException("小时统计需要 24 项");if(hours!=null)for(int i=0;i<24;i++)hs.put(number(hours.get(i)));s.put("hours",hs);
        JSONArray years=stats.optJSONArray("years"),ys=new JSONArray();if(years!=null){if(years.length()>150)throw new IOException("年份数量无效");for(int i=0;i<years.length();i++){JSONObject y=years.getJSONObject(i),r=new JSONObject();double yr=number(y.get("year"));if(yr<1900||yr>2200||yr!=(int)yr)throw new IOException("年份无效");r.put("year",(int)yr);JSONArray levels=y.getJSONArray("level"),ls=new JSONArray();if(levels.length()!=12)throw new IOException("月份数量无效");for(int j=0;j<12;j++){double lv=number(levels.get(j));if(lv>4||lv!=(int)lv)throw new IOException("热图等级无效");ls.put((int)lv);}r.put("level",ls);ys.put(r);}}s.put("years",ys);
        JSONArray cats=stats.optJSONArray("categories"),cs=new JSONArray();if(cats!=null){if(cats.length()>100)throw new IOException("分类数量无效");for(int i=0;i<cats.length();i++){JSONObject c=cats.getJSONObject(i),r=new JSONObject();r.put("title",text(c,"title",200,true));r.put("hours",number(c.get("hours")));cs.put(r);}}s.put("categories",cs);
        JSONObject daily=stats.optJSONObject("daily"),ds=new JSONObject();if(daily!=null){if(daily.length()>55000)throw new IOException("日期数量无效");Iterator<String> keys=daily.keys();while(keys.hasNext()){String k=keys.next();if(!k.matches("\\d{4}-\\d{2}-\\d{2}"))throw new IOException("日期格式无效");ds.put(k,number(daily.get(k)));}}s.put("daily",ds);out.put("stats",s);return out;
    }
    private synchronized JSONObject read(){try{InputStream in=file.openRead();try{return validate(new String(readLimited(in),"UTF-8"));}finally{in.close();}}catch(Exception e){return null;}}
    public synchronized void replace(String raw) throws Exception {byte[] data=validate(raw).toString().getBytes("UTF-8");FileOutputStream stream=null;try{stream=file.startWrite();stream.write(data);file.finishWrite(stream);}catch(Exception e){if(stream!=null)file.failWrite(stream);throw e;}}
    public synchronized void clear(){file.delete();}
    public String part(String key){try{JSONObject root=read(),out=root==null?new JSONObject():root.optJSONObject(key);if(out==null)out=new JSONObject();out.put("connected",root!=null);out.put("available",root!=null&&!root.isNull(key));if("excerpts".equals(key)&&!out.has("excerpts"))out.put("excerpts",new JSONArray());return out.toString();}catch(Exception e){return "{\"connected\":false,\"available\":false,\"excerpts\":[]}";}}
    public String status(){try{JSONObject root=read(),s=new JSONObject();s.put("connected",root!=null);if(root!=null){s.put("ownerLabel",root.optString("ownerLabel"));s.put("exportedAt",root.optString("exportedAt"));s.put("excerptCount",root.getJSONObject("excerpts").getJSONArray("excerpts").length());}return s.toString();}catch(Exception e){return "{\"connected\":false}";}}
}

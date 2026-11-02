package com.sagepaper.launcher;

import android.app.Activity;
import android.app.WallpaperManager;
import android.app.admin.DevicePolicyManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.BatteryManager;
import android.os.Build;
import android.content.*;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.*;
import android.view.View;
import android.view.WindowManager;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import android.content.pm.ResolveInfo;
import org.json.JSONArray;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class SageActivity extends Activity {
    private WebView web;
    private boolean registered;
    private boolean screenRegistered;
    private static final String ORIGIN="https://sage.local";
    private static final String READER="com.tencent.weread.eink";
    private static final String[] PLATES={"plate-entropy","plate-cave","plate-attention","plate-belief"};
    private final BroadcastReceiver updates=new BroadcastReceiver(){public void onReceive(Context c,Intent i){updateDevice();}};
    private final BroadcastReceiver screenOn=new BroadcastReceiver(){public void onReceive(Context c,Intent i){if(Intent.ACTION_SCREEN_ON.equals(i.getAction()))rotateWallpaper();}};
    private SharedPreferences prefs(){return getSharedPreferences("sage",MODE_PRIVATE);}
    private static String dayKey(){return new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date());}
    public void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        hideSystemBars();
        lockStatusBar();
        web=new WebView(this); web.setBackgroundColor(Color.WHITE);setContentView(web);
        WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false);s.setBuiltInZoomControls(false);s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Bridge(),"SageNative");
        web.setWebChromeClient(new WebChromeClient(){public boolean onConsoleMessage(ConsoleMessage m){android.util.Log.i("SagePaper",m.message()+" @"+m.lineNumber());return true;}});
        web.setWebViewClient(new WebViewClient(){
            public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){
                Uri u=r.getUrl();
                if(!"sage.local".equals(u.getHost()))return null;
                try{
                    String p=u.getPath(); InputStream in;String mime;
                    if("/".equals(p)||"/index.html".equals(p)){in=getAssets().open("index.html");mime="text/html";}
                    else if("/style.css".equals(p)){in=getAssets().open("style.css");mime="text/css";}
                    else if("/notes.js".equals(p)){in=getAssets().open("notes.js");mime="text/javascript";}
                    else if("/app.js".equals(p)){in=getAssets().open("app.js");mime="text/javascript";}
                    else if("/api/excerpts".equals(p)){in=getAssets().open("excerpts.json");mime="application/json";}
                    else if("/api/stats".equals(p)){in=getAssets().open("stats.json");mime="application/json";}
                    else if("/assets/fonts/QuiteSageSerif-Regular.woff2".equals(p)){in=getAssets().open("fonts/QuiteSageSerif-Regular.woff2");mime="font/woff2";}
                    else if(p!=null&&p.indexOf("/assets/")==0){
                        String name=p.substring("/assets/".length());
                        if(name.length()==0||name.indexOf("..")>=0||name.indexOf('/')>=0||name.indexOf('\\')>=0)return error(404,"Not found");
                        String low=name.toLowerCase(Locale.US);
                        mime=low.endsWith(".png")?"image/png":low.endsWith(".json")?"application/json":"application/octet-stream";
                        in=getAssets().open(name);
                    }
                    else return error(404,"Not found");
                    Map<String,String> headers=new HashMap<String,String>();headers.put("Cache-Control","no-store");
                    headers.put("Content-Security-Policy","default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'");
                    // 二进制资源不能带字符集，否则 WebView 会按文本转码，图片直接渲染失败。
                    String enc=(mime.indexOf("image/")==0||mime.indexOf("font/")==0)?null:"UTF-8";
                    return new WebResourceResponse(mime,enc,200,"OK",headers,in);
                }catch(Exception ex){return error(503,"Snapshot unavailable");}
            }
            public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return navigate(r.getUrl());}
            public boolean shouldOverrideUrlLoading(WebView v,String u){return navigate(Uri.parse(u));}
            public void onPageFinished(WebView v,String u){updateDevice();}
        });
        web.loadUrl(ORIGIN+"/?device=1");
        rotateWallpaper();
        try{registerReceiver(screenOn,new IntentFilter(Intent.ACTION_SCREEN_ON));screenRegistered=true;}catch(Exception ignored){}
    }
    private WebResourceResponse error(int status,String message){return new WebResourceResponse("text/plain","UTF-8",status,message,new HashMap<String,String>(),new ByteArrayInputStream(message.getBytes()));}
    /* 沉浸式全屏：状态栏和导航栏都不占位，也不留常驻条。 */
    private void hideSystemBars(){
        final int flags=View.SYSTEM_UI_FLAG_LAYOUT_STABLE|View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN|View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            |View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        getWindow().getDecorView().setSystemUiVisibility(flags);
    }
    /* 成为设备所有者后彻底禁掉系统状态栏下拉；未授权时静默跳过，靠沉浸模式兜底。 */
    private void lockStatusBar(){
        try{
            DevicePolicyManager dpm=(DevicePolicyManager)getSystemService(Context.DEVICE_POLICY_SERVICE);
            if(dpm==null||!dpm.isDeviceOwnerApp(getPackageName()))return;
            dpm.setStatusBarDisabled(new ComponentName(this,SageAdmin.class),true);
        }catch(Exception ignored){}
    }
    private int wifiLevel(){
        try{
            ConnectivityManager cm=(ConnectivityManager)getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo ni=cm==null?null:cm.getActiveNetworkInfo();
            if(ni==null||!ni.isConnected())return 0;
            if(ni.getType()!=ConnectivityManager.TYPE_WIFI)return 4;
            WifiManager wm=(WifiManager)getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if(wm==null)return 4;
            int rssi=wm.getConnectionInfo().getRssi();
            return WifiManager.calculateSignalLevel(rssi,4)+1;
        }catch(Exception ex){return 0;}
    }
    private boolean navigate(Uri u){
        if("https".equals(u.getScheme())&&"sage.local".equals(u.getHost()))return false;
        openReader(u.toString());return true;
    }
    private void openReader(String url){
        try{
            prefs().edit().putString("lastReaderLaunch",dayKey()).apply();
            Uri u=Uri.parse(url);
            if("https".equals(u.getScheme())&&"weread.qq.com".equals(u.getHost())){
                Intent i=new Intent(Intent.ACTION_VIEW,u);i.setPackage(READER);
                if(i.resolveActivity(getPackageManager())!=null){startActivity(i);return;}
            }
        }catch(Exception ignored){}
        Intent fallback=getPackageManager().getLaunchIntentForPackage(READER);
        if(fallback!=null){try{startActivity(fallback);return;}catch(Exception ignored){}}
        Toast.makeText(this,"未找到可打开的微信读书墨水屏版",Toast.LENGTH_LONG).show();
    }
    private String deviceState(){
        JSONObject j=new JSONObject();try{
            Intent b=registerReceiver(null,new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            int level=b==null?-1:b.getIntExtra(BatteryManager.EXTRA_LEVEL,-1),scale=b==null?-1:b.getIntExtra(BatteryManager.EXTRA_SCALE,100);
            j.put("battery",level<0||scale<=0?JSONObject.NULL:Math.round(level*100f/scale));
            j.put("now",System.currentTimeMillis());j.put("width",getResources().getDisplayMetrics().widthPixels);
            j.put("height",getResources().getDisplayMetrics().heightPixels);j.put("densityDpi",getResources().getDisplayMetrics().densityDpi);
            j.put("wifi",wifiLevel());
        }catch(Exception ignored){}return j.toString();
    }
    private void updateDevice(){if(web!=null)web.evaluateJavascript("window.SageUpdateDevice&&window.SageUpdateDevice("+deviceState()+");",null);}
    private void action(String action){
        try{
            if("app".equals(action)){openReader("");return;}
            if("oldhome".equals(action)){Intent i=new Intent(Intent.ACTION_MAIN);i.setComponent(new ComponentName("cn.modificator.launcher","cn.modificator.launcher.Launcher"));startActivity(i);return;}
            if("settings".equals(action)&&openVendorSettings())return;
            String target="wifi".equals(action)?Settings.ACTION_WIFI_SETTINGS:"brightness".equals(action)?Settings.ACTION_DISPLAY_SETTINGS:"date".equals(action)?Settings.ACTION_DATE_SETTINGS:"settings".equals(action)?Settings.ACTION_SETTINGS:null;
            if(target!=null)startActivity(new Intent(target));
        }catch(Exception e){if(openVendorSettings())Toast.makeText(this,"已回退到设备原生设置",Toast.LENGTH_LONG).show();else Toast.makeText(this,"此系统入口不可用，可进入原桌面设置",Toast.LENGTH_LONG).show();}
    }
    private boolean openVendorSettings(){try{Intent i=getPackageManager().getLaunchIntentForPackage("com.mgs.settings");if(i!=null){startActivity(i);return true;}}catch(Exception ignored){}return false;}
    private String listApps(){
        JSONArray a=new JSONArray();Set<String> seen=new HashSet<String>();
        Intent query=new Intent(Intent.ACTION_MAIN);query.addCategory(Intent.CATEGORY_LAUNCHER);
        List<ResolveInfo> result=getPackageManager().queryIntentActivities(query,0);
        Collections.sort(result,new ResolveInfo.DisplayNameComparator(getPackageManager()));
        for(ResolveInfo info:result){String pkg=info.activityInfo.packageName;if(pkg.equals(getPackageName())||seen.contains(pkg))continue;seen.add(pkg);
            try{JSONObject j=new JSONObject();j.put("packageName",pkg);j.put("label",info.loadLabel(getPackageManager()).toString());Drawable d=info.loadIcon(getPackageManager());Bitmap b=Bitmap.createBitmap(64,64,Bitmap.Config.ARGB_8888);Canvas c=new Canvas(b);d.setBounds(0,0,64,64);d.draw(c);ByteArrayOutputStream bytes=new ByteArrayOutputStream();b.compress(Bitmap.CompressFormat.PNG,100,bytes);j.put("icon","data:image/png;base64,"+Base64.encodeToString(bytes.toByteArray(),Base64.NO_WRAP));b.recycle();a.put(j);}catch(Exception ignored){}
        }return a.toString();
    }
    private void launchApp(String pkg){try{Intent i=getPackageManager().getLaunchIntentForPackage(pkg);if(i!=null){if(READER.equals(pkg))prefs().edit().putString("lastReaderLaunch",dayKey()).apply();startActivity(i);return;}}catch(Exception ignored){}Toast.makeText(this,"应用未安装或无法启动",Toast.LENGTH_LONG).show();}
    private boolean hasOemWallpaper(){try{Class.forName("android.util.MoguWallPaper");return true;}catch(ClassNotFoundException absent){return false;}}
    private boolean applyWallpaper(String name,boolean toast){
        if(hasOemWallpaper()){
            if(toast){try{startActivity(new Intent().setComponent(new ComponentName("com.mgs.settings","com.mgs.settings.DevicesSettingsActivity")));}catch(Exception e){startActivity(new Intent().setComponent(new ComponentName("com.mgs.settings","com.mgs.settings.MgsSettingsActivity")));}}
            return false;
        }
        try{
            if(name==null||name.length()==0||name.indexOf("..")>=0||name.indexOf('/')>=0)throw new IOException("bad wallpaper name");
            InputStream in=getAssets().open(name+".png");
            Bitmap b=BitmapFactory.decodeStream(in);in.close();
            if(b==null)throw new IOException("wallpaper decode failed");
            WallpaperManager wm=WallpaperManager.getInstance(this);
            if(Build.VERSION.SDK_INT>=24)wm.setBitmap(b,null,true,WallpaperManager.FLAG_SYSTEM|WallpaperManager.FLAG_LOCK);
            else wm.setBitmap(b);
            b.recycle();
            if(toast)Toast.makeText(this,"已设为设备壁纸",Toast.LENGTH_LONG).show();
            return true;
        }catch(Exception e){
            android.util.Log.e("SageWallpaper","Cannot apply "+name,e);
            if(toast)Toast.makeText(this,"此设备不接受直接设置壁纸，请在系统设置里更换",Toast.LENGTH_LONG).show();
        }
        if(toast)Toast.makeText(this,"壁纸切换失败，请在系统设置里更换",Toast.LENGTH_LONG).show();
        return false;
    }
    private void rotateWallpaper(){
        if(hasOemWallpaper())return;
        SharedPreferences p=prefs();
        if(!p.getBoolean("rotate",true))return;
        String bag=p.getString("rotateBag","");
        if(bag.length()==0){
            List<Integer> order=new ArrayList<Integer>();
            for(int n=0;n<PLATES.length;n++)order.add(n);
            Collections.shuffle(order);
            if(order.get(0)==p.getInt("rotateIndex",-1))Collections.swap(order,0,1);
            StringBuilder sequence=new StringBuilder();for(int n:order)sequence.append(n);
            bag=sequence.toString();
        }
        int i=bag.charAt(0)-'0';
        if(applyWallpaper(PLATES[i],false))p.edit().putInt("rotateIndex",i).putString("rotateBag",bag.substring(1)).apply();
        else android.util.Log.e("SageWallpaper","Rotation failed: "+PLATES[i]);
    }
    /* 今日是否打开过微信读书：优先用量统计，未授权时退回"从桌面启动过"的记录。 */
    private boolean readerOpenedToday(){
        boolean fallback=dayKey().equals(prefs().getString("lastReaderLaunch",""));
        long from;
        Calendar c=Calendar.getInstance();c.set(Calendar.HOUR_OF_DAY,0);c.set(Calendar.MINUTE,0);c.set(Calendar.SECOND,0);c.set(Calendar.MILLISECOND,0);
        from=c.getTimeInMillis();
        try{
            UsageStatsManager usm=(UsageStatsManager)getSystemService(Context.USAGE_STATS_SERVICE);
            if(usm==null)return fallback;
            long now=System.currentTimeMillis();
            List<UsageStats> stats=usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY,from,now);
            if(stats!=null)for(UsageStats u:stats){
                if(READER.equals(u.getPackageName())&&u.getLastTimeUsed()>=from)return true;
            }
            UsageEvents events=usm.queryEvents(from,now);
            if(events!=null){
                UsageEvents.Event e=new UsageEvents.Event();
                while(events.hasNextEvent()){
                    events.getNextEvent(e);
                    if(READER.equals(e.getPackageName())&&e.getEventType()==1)return true;
                }
            }
            return fallback;
        }catch(Exception ex){return fallback;}
    }
    public class Bridge {
        @JavascriptInterface public String listApps(){return SageActivity.this.listApps();}
        @JavascriptInterface public void launchApp(final String p){runOnUiThread(new Runnable(){public void run(){SageActivity.this.launchApp(p);}});}
        @JavascriptInterface public void setWallpaper(final String n){runOnUiThread(new Runnable(){public void run(){
            for(int i=0;i<PLATES.length;i++)if(PLATES[i].equals(n))prefs().edit().putInt("rotateIndex",i).remove("rotateBag").apply();
            applyWallpaper(n,true);
        }});}
        @JavascriptInterface public boolean rotationSupported(){return !hasOemWallpaper();}
        @JavascriptInterface public boolean rotationEnabled(){return !hasOemWallpaper()&&prefs().getBoolean("rotate",true);}
        @JavascriptInterface public void setRotation(final boolean on){runOnUiThread(new Runnable(){public void run(){
            SharedPreferences p=prefs();p.edit().putBoolean("rotate",on).apply();
            Toast.makeText(SageActivity.this,on?"轮播已开启：每次进入锁屏换一张":"轮播已关闭",Toast.LENGTH_SHORT).show();
        }});}
        @JavascriptInterface public boolean readerOpenedToday(){return SageActivity.this.readerOpenedToday();}
        @JavascriptInterface public String deviceState(){return SageActivity.this.deviceState();}
        @JavascriptInterface public void perform(final String a){runOnUiThread(new Runnable(){public void run(){action(a);}});}
        @JavascriptInterface public void openReader(final String u){runOnUiThread(new Runnable(){public void run(){SageActivity.this.openReader(u);}});}
    }
    protected void onStart(){super.onStart();if(!registered){IntentFilter f=new IntentFilter();f.addAction(Intent.ACTION_BATTERY_CHANGED);f.addAction(Intent.ACTION_TIME_TICK);f.addAction(Intent.ACTION_TIME_CHANGED);f.addAction(Intent.ACTION_TIMEZONE_CHANGED);registerReceiver(updates,f);registered=true;}}
    protected void onResume(){super.onResume();getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);if(web!=null){web.onResume();updateDevice();web.evaluateJavascript("window.SageReadingSync&&window.SageReadingSync();",null);}}
    public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus){hideSystemBars();lockStatusBar();}}
    protected void onPause(){if(web!=null)web.onPause();super.onPause();}
    protected void onStop(){if(registered){unregisterReceiver(updates);registered=false;}super.onStop();}    public void onBackPressed(){web.evaluateJavascript("window.SageGoHome&&window.SageGoHome();",null);}
    protected void onNewIntent(Intent i){super.onNewIntent(i);if(Intent.ACTION_MAIN.equals(i.getAction()))web.evaluateJavascript("window.SageGoHome&&window.SageGoHome();",null);}
    protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("SageNative");web.destroy();web=null;}if(screenRegistered){try{unregisterReceiver(screenOn);}catch(Exception ignored){}screenRegistered=false;}super.onDestroy();}
}

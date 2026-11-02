package com.sagepaper.launcher;
import android.app.Activity;
import android.os.Bundle;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiConfiguration;
import org.json.JSONObject;
import java.io.FileOutputStream;

/** Shell-only setup helper using the standard Android 8.1 WifiManager API. */
public class WifiSetupActivity extends Activity {
 public void onCreate(Bundle state){
  super.onCreate(state);JSONObject result=new JSONObject();
  String ssid=getIntent().getStringExtra("ssid"),password=getIntent().getStringExtra("password");
  try{
   if(ssid==null||ssid.length()==0||ssid.length()>32||password==null||password.length()<8||password.length()>63)throw new IllegalArgumentException();
   WifiManager wifi=(WifiManager)getApplicationContext().getSystemService(WIFI_SERVICE);
   wifi.setWifiEnabled(true);
   WifiConfiguration c=new WifiConfiguration();c.SSID=JSONObject.quote(ssid);c.preSharedKey=JSONObject.quote(password);
   c.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
   int id=wifi.addNetwork(c);result.put("networkId",id);
   boolean enabled=id>=0&&wifi.enableNetwork(id,true);result.put("enabled",enabled);
   result.put("reconnectRequested",enabled&&wifi.reconnect());
  }catch(Exception e){try{result.put("error",e.getClass().getSimpleName());}catch(Exception ignored){}}
  finally{password=null;getIntent().removeExtra("password");}
  try{FileOutputStream f=openFileOutput("wifi-setup-result.json",MODE_PRIVATE);f.write(result.toString().getBytes("UTF-8"));f.close();}catch(Exception ignored){}
  finish();
 }
}

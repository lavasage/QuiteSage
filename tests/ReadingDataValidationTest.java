import com.sagepaper.launcher.ReadingDataStore;
import org.json.*;
public class ReadingDataValidationTest {
 static int passed=0;
 static JSONObject base() throws Exception {return new JSONObject("{\"schemaVersion\":1,\"source\":\"weread-skill\",\"exportedAt\":\"2026-01-01T00:00:00Z\",\"excerpts\":{\"excerpts\":[]},\"stats\":null}");}
 static void reject(JSONObject b) throws Exception {boolean failed=false;try{ReadingDataStore.validate(b.toString());}catch(Exception e){failed=true;}if(!failed)throw new AssertionError("Expected invalid data rejection");passed++;}
 public static void main(String[] args) throws Exception {
  JSONObject clean=ReadingDataStore.validate(base().toString());if(clean.getJSONObject("excerpts").getJSONArray("excerpts").length()!=0||!clean.isNull("stats"))throw new AssertionError();passed++;
  for(String key:new String[]{"apiKey","token","API_KEY","authorization","cookie","password","private-key"}){JSONObject b=base();b.put("nested",new JSONObject().put(key,"TEST_ONLY"));reject(b);}
  JSONObject b=base();b.put("stats",new JSONObject().put("hours",new JSONArray().put(1)));reject(b);
  for(String key:new String[]{"hours","readStat","years","categories","daily"}){b=base();b.put("stats",new JSONObject().put(key,"invalid"));reject(b);}
  b=base();b.put("stats","invalid");reject(b);
  b=base();b.put("stats",new JSONObject().put("totalReadTime",-1));reject(b);
  b=base();JSONObject q=new JSONObject("{\"id\":\"TEST_ONLY\",\"text\":\"TEST_ONLY\",\"title\":\"TEST_ONLY\",\"author\":\"TEST_ONLY\"}");b.getJSONObject("excerpts").getJSONArray("excerpts").put(q).put(q);reject(b);
  b=base();b.put("stats",new JSONObject());clean=ReadingDataStore.validate(b.toString());if(clean.getJSONObject("stats").has("totalReadTime"))throw new AssertionError("Unknown time invented");passed++;
  b=base();b.put("privateUnexpectedField","TEST_ONLY");clean=ReadingDataStore.validate(b.toString());if(clean.has("privateUnexpectedField"))throw new AssertionError("Unexpected field retained");passed++;
  if(args.length>0){JSONObject raw=new JSONObject(new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(args[0])),"UTF-8"));JSONObject imported=ReadingDataStore.validate(raw.toString());JSONArray before=raw.getJSONObject("excerpts").getJSONArray("excerpts"),after=imported.getJSONObject("excerpts").getJSONArray("excerpts");if(before.length()!=after.length())throw new AssertionError("Record count changed");for(int i=0;i<before.length();i++)if(!before.getJSONObject(i).getString("text").equals(after.getJSONObject(i).getString("text")))throw new AssertionError("Original highlight changed");System.out.println("PASS: explicit local fixture imports without changing original highlights");}
  System.out.println("PASS: "+passed+" Android import validation cases (host JSON runtime)");
 }
}

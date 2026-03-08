(function(){
  var Q = document;
  function $(id){ return Q.getElementById(id); }

var db = await fetchDbText();
if(!db){
  setKeyStatus("db error (fetch failed)");
  return;
}
  
  var I  = $("in"),
      O  = $("out"),
      B  = $("btn"),
      S  = $("status");

  var KM = $("key-menu"),
      KU = $("key-unlock"),
      KL = $("license"),
      KS = $("key-status"),
      U  = $("username");

  var P    = Q.querySelector(".page");
  var DASH = $("dashboard");

  var OBF_WIN  = $("obf-window");
  var OBF_HEAD = $("obf-header");

  // твой гист с базой ключей (по строкам)
  var DB_URL = "https://gist.githubusercontent.com/lolexell/d6c16c6bb4fe536c6fc3f68cd4204fe6/raw/e412e60149f60505c35785bc636de459eabf5046/keys_databaseLOLFUSCATOR.db";

  var hasKey      = false;
  var currentUser = null;
  var currentKey  = null;

  function setStatus(text, extraClass){
    if(!S) return;
    S.textContent = text;
    S.className = "status " + (extraClass || "");
  }

  function setKeyStatus(text){
    if(KS) KS.textContent = text;
  }

  function normalizeLua(src){
    if(!src) return "";
    return src
      .replace(/\r/g,"")
      .replace(/--\[\[[\s\S]*?\]\]/g,"")
      .replace(/--[^\n]*/g,"")
      .replace(/[ \t]+/g," ")
      .replace(/^\s+|\s+$/gm,"");
  }

  function xorJS(str, key){
    var out = [];
    var kl  = key.length;
    for(var i = 0; i < str.length; i++){
      var kch = key.charCodeAt(i % kl);
      var c   = str.charCodeAt(i) ^ kch;
      out.push(String.fromCharCode(c));
    }
    return out.join("");
  }

  function b64(s){
    return btoa(s);
  }

  function toTableLiteral(s){
    var res = [];
    for(var i = 0; i < s.length; i++){
      res.push(s.charCodeAt(i));
    }
    return "{" + res.join(",") + "}";
  }

  async function fetchDbText(){
    try{
      var r = await fetch(DB_URL);
      if(!r.ok) throw new Error("db " + r.status);
      return await r.text();
    }catch(e){
      console.error("db fetch error:", e);
      return "";
    }
  }
function dbHasKey(dbText, key){
  if(!dbText || !key) return false;
  var lines = dbText.split(/\r?\n/).map(function(s){
    return s.trim().toUpperCase();
  }).filter(Boolean);
  return lines.indexOf(key.toUpperCase()) !== -1;
}


  function isValidKeyFormat(key){
    return /^LOLF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key.toUpperCase());
  }

  function renderDashboard(){
    if(!DASH || !hasKey) return;
    var u = currentUser || "anonymous";
    var k = currentKey  || "unknown";
    DASH.innerHTML =
      '<div class="dash-card">' +
        '<div class="dash-title">Account</div>' +
        '<div class="dash-row"><span>User:</span><code>'+u+'</code></div>' +
        '<div class="dash-row"><span>Key:</span><code>'+k+'</code></div>' +
        '<div class="dash-row"><span>Plan:</span><code>lolfuscator 9.0</code></div>' +
        '<div class="dash-row"><span>Status:</span><code>active</code></div>' +
      '</div>';
  }

  async function handleAuth(){
    var user   = (U  && U.value.trim())  || "";
    var rawKey = (KL && KL.value.trim()) || "";
    var key    = rawKey.toUpperCase();

    if(!user || !key){
      setKeyStatus("enter username & key");
      return;
    }
    if(user.length < 3){
      setKeyStatus("username too short");
      return;
    }
    if(!isValidKeyFormat(key)){
      setKeyStatus("invalid format (LOLF-XXXX-XXXX-XXXX)");
      return;
    }

    setKeyStatus("checking db...");

    var db = await fetchDbText();
    if(!db){
      setKeyStatus("db error (fetch failed)");
      return;
    }

    if(!dbHasKey(db, key)){
      setKeyStatus("invalid key");
      return;
    }

    hasKey      = true;
    currentUser = user;
    currentKey  = key;

    setKeyStatus("login ok");

    if(KM) KM.style.display = "none";
    if(P)  P.classList.remove("blurred");
    renderDashboard();
  }

  function CORE_OBF(src){
    var contactLine = "contact lolexell on discord: lolexell";
    var KEY = "DNchubD6FNiydub97346dbfkjd";

    var clean = normalizeLua(src || "");
    var bytes = [];
    var n = clean.length;
    if(n > 255) n = 255;

    bytes[0] = 1;        // op
    bytes[1] = n;        // len
    for(var i = 0; i < n; i++){
      bytes[2 + i] = clean.charCodeAt(i);
    }
    bytes[2 + n] = 0;    // stop

    var raw = String.fromCharCode.apply(null, bytes);

    var enc = xorJS(raw, KEY);
    var B64 = b64(enc);

    var TKEY = toTableLiteral(KEY);

    var luaStub =
"--// lolfuscator 9.0 || lolfuscator.net\n" +
"local __K=" + TKEY + " " +
"local function __jt(t)local o={}for i=1,#t do o[i]=string.char(t[i])end return table.concat(o)end " +
"local _K=__jt(__K) " +
"local __B='" + B64 + "' " +
"local __abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' " +
"local function __b64(d) d=d:gsub('[^'..__abc..'=]','') return (d:gsub('.',function(x) if x=='=' then return '' end local r,f='',(__abc:find(x)-1) for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end return r end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x) if #x~=8 then return '' end local c=0 for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end return string.char(c) end)) end " +
"local function __xor(s,k)local t={}local kl=#k for i=1,#s do local c=s:byte(i)local kk=k:byte(((i-1)%kl)+1)t[#t+1]=string.char(c~kk)end return table.concat(t)end " +
"local _d=__b64(__B) " +
"_d=__xor(_d,_K) " +
"local __bc={}for i=1,#_d do __bc[i]=_d:byte(i)end " +
"local __ip=1 " +
"while __ip<=#__bc do " +
" local op=__bc[__ip];__ip=__ip+1 " +
" if op==1 then " +
"  local len=__bc[__ip];__ip=__ip+1 " +
"  local buf={}for i=1,len do buf[i]=string.char(__bc[__ip]);__ip=__ip+1 end " +
"  local chunk=table.concat(buf) " +
"  local l=loadstring or load " +
"  return l(chunk)() " +
" elseif op==0 then " +
"  break " +
" else " +
"  __ip=__ip+(op%2) " +
" end " +
"end ";

    return luaStub;
  }

  async function runObfuscate(){
    if(!hasKey){
      if(O) O.value = "-- enter valid username + key first";
      if(KM) KM.style.display = "flex";
      if(P)  P.classList.add("blurred");
      setKeyStatus("enter username & key");
      return;
    }

    var src = (I && I.value) || "";
    if(!src.trim()){
      if(O) O.value = "-- nothing to obfuscate";
      setStatus("idle","idle");
      return;
    }

    try{
      setStatus("obfuscating...","working");
      var out = CORE_OBF(src);
      if(O) O.value = out;
      setStatus("done","ok");
    }catch(e){
      console.error(e);
      if(O) O.value = "-- error: " + (e && e.message || e);
      setStatus("error","error");
    }
  }

  function makeDraggable(winEl, handleEl){
    if(!winEl || !handleEl) return;

    var shiftX = 0, shiftY = 0;

    handleEl.addEventListener("mousedown", function(e){
      e.preventDefault();

      var rect = winEl.getBoundingClientRect();
      shiftX = e.clientX - rect.left;
      shiftY = e.clientY - rect.top;

      winEl.style.transform = "none";
      winEl.style.left = rect.left + "px";
      winEl.style.top  = rect.top  + "px";

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    function onMove(e){
      e.preventDefault();

      var newLeft = e.clientX - shiftX;
      var newTop  = e.clientY - shiftY;

      var vpW = window.innerWidth;
      var vpH = window.innerHeight;
      var rect = winEl.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;

      if(newLeft < 0) newLeft = 0;
      if(newTop  < 0) newTop  = 0;
      if(newLeft + w > vpW) newLeft = vpW - w;
      if(newTop  + h > vpH) newTop  = vpH - h;

      winEl.style.left = newLeft + "px";
      winEl.style.top  = newTop  + "px";
    }

    function onUp(){
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
  }

  // init
  if(P)  P.classList.add("blurred");
  if(KM) KM.style.display = "flex";
  setKeyStatus("enter username & key");

  if(KU) KU.onclick = handleAuth;
  if(B)  B.onclick  = runObfuscate;

  var KEY_WIN  = Q.querySelector(".key-window");
  var KEY_HEAD = Q.querySelector(".key-header");
  makeDraggable(KEY_WIN, KEY_HEAD);
  makeDraggable(OBF_WIN, OBF_HEAD);
})();

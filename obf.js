(function(){
  var d = document;
  function g(id){ return d.getElementById(id); }

  var srcIn   = g("in");
  var outOut  = g("out");
  var btnObf  = g("btn");
  var statusN = g("status");

  var keyMenu   = g("key-menu");
  var keyUnlock = g("key-unlock");
  var keyInput  = g("license");
  var keyStatus = g("key-status");
  var page      = d.querySelector(".page");

  // ВСТАВЬ СВОЙ RAW URL ГИСТА
  var GIST_URL = "https://gist.githubusercontent.com/lolexell/d6c16c6bb4fe536c6fc3f68cd4204fe6/raw/52fb1d3b0abd1be0d9e2ec6391c0a462b49da236/keys_databaseLOLFUSCATOR.db";

  var keyValid = false;

  function setStatus(text, cls){
    if(!statusN) return;
    statusN.textContent = text;
    statusN.className = "status " + (cls || "");
  }

  function setKeyStatus(text){
    if(keyStatus) keyStatus.textContent = text;
  }

  async function fetchKeys(){
    try{
      var res = await fetch(GIST_URL);
      if(!res.ok) throw new Error("keys http "+res.status);
      var text = await res.text();
      return text.split(/\r?\n/).map(function(l){return l.trim();}).filter(Boolean);
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async function tryUnlock(){
    var key = (keyInput && keyInput.value.trim()) || "";
    if(!key){
      setKeyStatus("enter key");
      return;
    }
    setKeyStatus("checking...");
    var keys = await fetchKeys();
    if(!keys.length){
      setKeyStatus("keys error");
      return;
    }
    if(keys.indexOf(key) === -1){
      setKeyStatus("invalid key");
      return;
    }
    keyValid = true;
    setKeyStatus("key ok");
    if(page) page.classList.remove("blurred");
    // key-menu НЕ скрываем, по твоему условию
  }

  function normalizeLua(src){
    if(!src) return "";
    return src.replace(/\r/g,"")
              .replace(/--\[\[[\s\S]*?\]\]/g,"")
              .replace(/--[^\n]*/g,"")
              .replace(/[ \t]+/g," ")
              .replace(/^\s+|\s+$/gm,"");
  }

  function xorString(str, key){
    var out = [], kl = key.length, j = 0;
    for(var i=0;i<str.length;i++){
      j = (j + 1) % kl;
      out[i] = String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(j));
    }
    return out.join("");
  }

  function b64encode(str){
    return btoa(str);
  }

  function hideKey(raw){
    var nums = [];
    for(var i=0;i<raw.length;i++) nums.push(raw.charCodeAt(i));
    return "{" + nums.join(",") + "}";
  }

  function buildObf(plain){
    var rawKey = "DNchubD6FNiydub97346dbfkjd";
    var norm   = normalizeLua(plain);

    var bytes = [];
    var len   = norm.length;
    if(len > 255) len = 255;
    bytes.push(1);
    bytes.push(len);
    for(var i=0;i<len;i++) bytes.push(norm.charCodeAt(i));
    bytes.push(0);

    var bcStr = String.fromCharCode.apply(null, bytes);
    var bcXor = xorString(bcStr, rawKey);
    var bcB64 = b64encode(bcXor);

    var keyTable = hideKey(rawKey);

    var stub =
"--// lolfuscator 5.0 || lolfuscator.net "
+"local __Kb=" + keyTable + " "
+"local function __mkK(t)local s={}for i=1,#t do s[i]=string.char(t[i])end return table.concat(s)end "
+"local _K=__mkK(__Kb) "
+"local _B64='" + bcB64 + "' "
+"local _abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' "
+"local _g1,_g2,_g3=0,1,2 for _i=1,7 do _g1=_g1+(_i%2) _g2=_g2+(_i%3) _g3=_g3+(_g1%3) end "
+"local function _spin(a,b) for i=1,(a%9)+2 do b=b+((i*a)%3) end return b end "
+"local function _from_b64(d) d=d:gsub('[^'.._abc..'=]','') return (d:gsub('.',function(x) if x=='=' then return '' end local r,f='',(_abc:find(x)-1) for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end return r end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x) if #x~=8 then return '' end local c=0 for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end return string.char(c) end)) end "
+"for __=1,4 do _g1=_spin(__,_g1) end "
+"local function _xor(s,k)local t={}local kl=#k for i=1,#s do local c=s:byte(i)local kk=k:byte(((i-1)%kl)+1)t[#t+1]=string.char(c~kk)if(i%6)==0 then local q=i*i end end return table.concat(t)end "
+"local _dec=_xor(_from_b64(_B64),_K) "
+"local _bc={}for i=1,#_dec do _bc[i]=_dec:byte(i)end "
+"local _stack={}local _sp=0 "
+"local function push(v)_sp=_sp+1 _stack[_sp]=v end "
+"local function pop()local v=_stack[_sp] _stack[_sp]=nil _sp=_sp-1 return v end "
+"for iii=1,5 do local t=0 for j=1,8 do t=t+((j*iii)%4) end if t%5==2 then push(t)pop()end end "
+"local _ip=1 "
+"while _ip<=#_bc do "
+" local op=_bc[_ip];_ip=_ip+1 "
+" if op==1 then "
+"  local len=_bc[_ip];_ip=_ip+1 "
+"  local buf={}for i=1,len do buf[i]=string.char(_bc[_ip]);_ip=_ip+1 end "
+"  for j=1,3 do local s=j*j*j end "
+"  local chunk=table.concat(buf) "
+"  local l=loadstring or load "
+"  local _f=(function(h) for z=1,2 do local k=z*z end return h end)(l) "
+"  return _f(chunk)() "
+" elseif op==2 then "
+"  local t=0 for i=1,14 do t=t+((i*3)%5) end "
+" elseif op==3 then "
+"  for i=1,6 do local z=i*(i-1) end "
+" elseif op==0 then "
+"  break "
+" else "
+"  _ip=_ip+(op%2) "
+" end "
+" for ___=1,2 do local v=___*___ end "
+"end ";

    return stub;
  }

  async function runObfuscate(){
    if(!keyValid){
      if(outOut) outOut.value = "-- enter valid key first";
      if(keyMenu) keyMenu.style.display = "flex";
      if(page) page.classList.add("blurred");
      return;
    }

    var v = (srcIn && srcIn.value) || "";
    if(!v.trim()){
      if(outOut) outOut.value = "-- nothing to obfuscate";
      setStatus("idle","idle");
      return;
    }
    try{
      setStatus("obfuscating...","working");
      var out = buildObf(v);
      if(outOut) outOut.value = out;
      setStatus("done","ok");
    }catch(e){
      console.error(e);
      if(outOut) outOut.value = "-- error: " + (e && e.message || e);
      setStatus("error","error");
    }
  }

  // init
  if(page) page.classList.add("blurred");
  if(keyMenu) keyMenu.style.display = "flex";

  if(keyUnlock){
    keyUnlock.onclick = function(){ tryUnlock(); };
  }

  if(btnObf){
    btnObf.onclick = function(){ runObfuscate(); };
  }
})();

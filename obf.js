(function(){
  var d = document;
  function g(id){ return d.getElementById(id); }

  var srcIn   = g("in");
  var outOut  = g("out");
  var btnObf  = g("btn");
  var cmt     = g("cmt");
  var statusN = g("status");

  function setStatus(text, cls){
    if(!statusN) return;
    statusN.textContent = text;
    statusN.className = "status " + (cls || "");
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
    var out = [], kl = key.length;
    for(var i=0;i<str.length;i++){
      var k = key.charCodeAt(i % kl);
      out[i] = String.fromCharCode(str.charCodeAt(i) ^ k);
    }
    return out.join("");
  }

  function b64encode(str){
    return btoa(str);
  }

  function buildVM(plain){
    var rawKey = "DNchubD6FNiydub97346dbfkjd";
    var norm   = normalizeLua(plain);

    // строим байткод VM: [1,len,bytes...,0]
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

    // ключ спрячем как массив чисел
    var keyNums = [];
    for(var k=0;k<rawKey.length;k++) keyNums.push(rawKey.charCodeAt(k));
    var keyExpr = "{" + keyNums.join(",") + "}";

    var stub =
"--// lolfuscator 4.0 || lolfuscator.net "
+"local __Kb=" + keyExpr + " "
+"local function __mkK(t)local s={}for i=1,#t do s[i]=string.char(t[i])end return table.concat(s)end "
+"local _K=__mkK(__Kb) "
+"local _B64='" + bcB64 + "' "
+"local _abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' "
+"local function _from_b64(d) d=d:gsub('[^'.._abc..'=]','') return (d:gsub('.',function(x) if x=='=' then return '' end local r,f='',(_abc:find(x)-1) for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end return r end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x) if #x~=8 then return '' end local c=0 for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end return string.char(c) end)) end "
+"local function _xor(s,k)local t={}local kl=#k for i=1,#s do local c=s:byte(i)local kk=k:byte(((i-1)%kl)+1)t[#t+1]=string.char(c~kk)end return table.concat(t)end "
+"local _dec=_xor(_from_b64(_B64),_K) "
+"local _bc={}for i=1,#_dec do _bc[i]=_dec:byte(i)end "
+"local _ip=1 "
+"while _ip<=#_bc do "
+" local op=_bc[_ip];_ip=_ip+1 "
+" if op==1 then "
+"  local len=_bc[_ip];_ip=_ip+1 "
+"  local buf={}for i=1,len do buf[i]=string.char(_bc[_ip]);_ip=_ip+1 end "
+"  local chunk=table.concat(buf) "
+"  local l=loadstring or load "
+"  return l(chunk)() "
+" elseif op==0 then break end "
+"end ";

    return stub;
  }

  function runObfuscate(){
    var v = (srcIn && srcIn.value) || "";
    if(!v.trim()){
      if(outOut) outOut.value = "-- nothing to obfuscate";
      setStatus("idle","idle");
      return;
    }
    try{
      setStatus("obfuscating...","working");
      if(cmt) cmt.textContent = "";

      var out = buildVM(v);
      if(outOut) outOut.value = out;

      setStatus("done","ok");
    }catch(e){
      if(outOut) outOut.value = "-- error: " + (e && e.message || e);
      setStatus("error","error");
      console.error(e);
    }
  }

  if(btnObf){
    btnObf.onclick = runObfuscate;
  }
})();

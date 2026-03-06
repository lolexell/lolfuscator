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
    var s = src.replace(/\r/g, "")
               .replace(/--\[\[[\s\S]*?\]\]/g, "")
               .replace(/--[^\n]*/g, "")
               .replace(/[ \t]+/g, " ")
               .replace(/^\s+|\s+$/gm, "");
    return s;
  }

  function xorString(str, key){
    var out = [];
    for(var i=0;i<str.length;i++){
      var k = key.charCodeAt(i % key.length);
      out.push(String.fromCharCode(str.charCodeAt(i) ^ k));
    }
    return out.join("");
  }

  function b64encode(str){
    return btoa(str);
  }

  function buildVM(plain){
    var key = "lolfuscator.meow";
    var norm = normalizeLua(plain);
    var xored = xorString(norm, key);
    var b64 = b64encode(xored);

    var stub =
"--// lolfuscator 3.0 || lolfuscator.net\n"+
"local _K='" + key.replace(/'/g,"\\'") + "'\n"+
"local _B64='" + b64 + "'\n"+
"local _abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\n"+
"local function _from_b64(d)\n"+
"  d=d:gsub('[^'.._abc..'=]','')\n"+
"  return (d:gsub('.',function(x)\n"+
"    if x=='=' then return '' end\n"+
"    local r,f='',(_abc:find(x)-1)\n"+
"    for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end\n"+
"    return r\n"+
"  end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x)\n"+
"    if #x~=8 then return '' end\n"+
"    local c=0\n"+
"    for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end\n"+
"    return string.char(c)\n"+
"  end))\n"+
"end\n"+
"local function _xor(s,k)\n"+
"  local t={} local kl=#k\n"+
"  for i=1,#s do\n"+
"    local c=s:byte(i) local kk=k:byte((i-1)%kl+1)\n"+
"    t[#t+1]=string.char(bit32.bxor(c,kk))\n"+
"  end\n"+
"  return table.concat(t)\n"+
"end\n"+
"local _decoded=_xor(_from_b64(_B64),_K)\n"+
"local _bc={} for i=1,#_decoded do _bc[i]=_decoded:byte(i) end\n"+
"local _stack={} local _sp=0\n"+
"local function push(v) _sp=_sp+1 _stack[_sp]=v end\n"+
"local function pop() local v=_stack[_sp] _stack[_sp]=nil _sp=_sp-1 return v end\n"+
"local _ip=1\n"+
"while _ip<=#_bc do\n"+
"  local op=_bc[_ip];_ip=_ip+1\n"+
"  if op==1 then\n"+
"    local len=_bc[_ip];_ip=_ip+1\n"+
"    local buf={} for i=1,len do buf[i]=string.char(_bc[_ip]);_ip=_ip+1 end\n"+
"    local chunk=table.concat(buf)\n"+
"    local l=loadstring or load\n"+
"    return l(chunk)()\n"+
"  elseif op==0 then\n"+
"    break\n"+
"  else\n"+
"    _ip=_ip+op%2\n"+
"  end\n"+
"end\n";

    var bytes = [];
    var src = norm;
    var len = src.length;
    if(len>255) len = 255;
    bytes.push(1);
    bytes.push(len);
    for(var i=0;i<len;i++){
      bytes.push(src.charCodeAt(i));
    }
    bytes.push(0);

    var bcStr = String.fromCharCode.apply(null, bytes);
    var bcXor = xorString(bcStr, key);
    var bcB64 = b64encode(bcXor);

    stub = stub.replace(b64, bcB64);

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

      var out  = buildVM(v);

      if(outOut) outOut.value = out;
      setStatus("done","ok");
    }catch(e){
      if(outOut) outOut.value = "-- error: " + (e && e.message || e);
      setStatus("error","error");
    }
  }

  if(btnObf){
    btnObf.onclick = runObfuscate;
  }
})();

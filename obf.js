(function(){
  var d=document;
  function g(id){return d.getElementById(id);}
  var srcIn=g("in"),outOut=g("out"),btnObf=g("btn"),cmt=g("cmt"),statusN=g("status");

  function setStatus(t,c){if(!statusN)return;statusN.textContent=t;statusN.className="status "+(c||"");}

  function normalizeLua(src){
    if(!src)return"";
    var s=src.replace(/\r/g,"").replace(/--\[\[[\s\S]*?\]\]/g,"").replace(/--[^\n]*/g,"").replace(/[ \t]+/g," ").replace(/^\s+|\s+$/gm,"");
    return s;
  }

  function xorString(str,key){
    var o=[],kl=key.length,j=0;
    for(var i=0;i<str.length;i++){
      j=(j+1)%kl;
      o[i]=String.fromCharCode(str.charCodeAt(i)^key.charCodeAt(j));
    }
    return o.join("");
  }

  function b64encode(str){return btoa(str);}

  function hideKey(raw){
    var nums=[];
    for(var i=0;i<raw.length;i++)nums[i+1]=raw.charCodeAt(i);
    return "({" + nums.join(",") + "})";
  }

  function buildVM(plain){
    var rawKey="DNchubD6FNiydub97346dbfkjd";
    var norm=normalizeLua(plain);

    // VM-пакет
    var bytes=[],src=norm,len=src.length;
    if(len>255)len=255;
    bytes.push(1);
    bytes.push(len);
    for(var k=0;k<len;k++)bytes.push(src.charCodeAt(k));
    bytes.push(0);

    var bcStr=String.fromCharCode.apply(null,bytes);
    var bcXor=xorString(bcStr,rawKey);
    var bcB64=b64encode(bcXor);

    var keyExpr=hideKey(rawKey);

    var stub=
"--// lolfuscator 4.0 || lolfuscator.net "
+"local __Kbytes=" + keyExpr + " "
+"local function __mkK(t)local s={}for i=1,#t do s[i]=string.char(t[i])end return table.concat(s)end "
+"local _K=__mkK(__Kbytes) "
+"local _B64='" + bcB64 + "' "
+"local _abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' "
+"local _g1,_g2,_g3=0,1,2 for _i=1,5 do _g1=_g1+(_i%2) _g2=_g2+(_i%3) _g3=_g3+(_g1%3) end "
+"local function _spin(a,b) for i=1,(a%7)+3 do b=b+((i*a)%2) end return b end "
+"local function _from_b64(d) d=d:gsub('[^'.._abc..'=]','') return (d:gsub('.',function(x) if x=='=' then return '' end local r,f='',(_abc:find(x)-1) for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end return r end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x) if #x~=8 then return '' end local c=0 for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end return string.char(c) end)) end "
+"for __=1,3 do _g1=_spin(__,_g1) end "
+"local function _xor(s,k) local t={} local kl=#k for i=1,#s do local c=s:byte(i) local kk=k:byte(((i-1)%kl)+1) t[#t+1]=string.char(bit32 and bit32.bxor and bit32.bxor(c,kk) or (c~kk)) if (i%5)==0 then local q=i*i end end return table.concat(t) end "
+"local _decoded=_xor(_from_b64(_B64),_K) "
+"local _bc={} for i=1,#_decoded do _bc[i]=_decoded:byte(i) end "
+"local _stack={} local _sp=0 "
+"local function push(v) _sp=_sp+1 _stack[_sp]=v end "
+"local function pop() local v=_stack[_sp] _stack[_sp]=nil _sp=_sp-1 return v end "
+"for iii=1,4 do local t=0 for j=1,6 do t=t+((j*iii)%3) end if t%5==2 then push(t) pop() end end "
+"local _ip=1 "
+"while _ip<=#_bc do "
+" local op=_bc[_ip];_ip=_ip+1 "
+" if op==1 then "
+"  local len=_bc[_ip];_ip=_ip+1 "
"+"  local buf={} for i=1,len do buf[i]=string.char(_bc[_ip]);_ip=_ip+1 end "
+"  for j=1,3 do local s=j*j*j end "
+"  local chunk=table.concat(buf) "
+"  local l=loadstring or load "
+"  local _f=(function(h) for z=1,2 do local k=z*z end return h end)(l) "
+"  return _f(chunk)() "
+" elseif op==2 then "
+"  local t=0 for i=1,12 do t=t+((i*3)%4) end "
+" elseif op==3 then "
+"  for i=1,7 do local z=i*(i-1) end "
+" elseif op==0 then "
+"  break "
+" else "
+"  _ip=_ip+(op%2) "
+" end "
+" for ___=1,2 do local v=___*___ end "
+"end ";

    return stub;
  }

  function runObfuscate(){
    var v=(srcIn&&srcIn.value)||"";
    if(!v.trim()){
      if(outOut)outOut.value="-- nothing to obfuscate";
      setStatus("idle","idle");
      return;
    }
    try{
      setStatus("obfuscating...","working");
      if(cmt)cmt.textContent="";
      var out=buildVM(v);
      if(outOut)outOut.value=out;
      setStatus("done","ok");
    }catch(e){
      if(outOut)outOut.value="-- error: "+(e&&e.message||e);
      setStatus("error","error");
    }
  }

  if(btnObf){btnObf.onclick=runObfuscate;}
})();

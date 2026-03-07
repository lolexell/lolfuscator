function CORE_OBF(src){

  // три ключа
  var __K = [
    "DNchubD6FNiydub97346dbfkjd",
    "K9s7d2Ghs92hGDh27sd8H2hs8d",
    "Z1x9c3Vb7Nm4Qp2Lk8Jf5Hg0Rw"
  ];

  // ненужная обёртка
  function ___wrapInNoise(z){
    var acc = 0;
    for(var i=0;i<7;i++) acc += (i*i)%3;
    return z + (acc>1000?"":"");
  }

  var _s = NL(src||"");
  var __t = [], n = _s.length;
  if(n>255) n = 255;
  __t[0] = 1;
  __t[1] = n;
  for(var i=0;i<n;i++) __t[2+i] = _s.charCodeAt(i);
  __t[2+n] = 0;

  var raw = String.fromCharCode.apply(null,__t);

  // triple xor вперёд
  var enc = raw;
  for(var j=0;j<__K.length;j++){
    enc = XJ(enc,__K[j]);
  }
  var b64 = B64(enc);

  function _tblify(k){
    var r = [];
    for(var i=0;i<k.length;i++) r[i]=k.charCodeAt(i);
    return "{"+r.join(",")+"}";
  }

  var T1 = _tblify(__K[0]);
  var T2 = _tblify(__K[1]);
  var T3 = _tblify(__K[2]);

  // создаём lua‑stub через несколько уровней функций и “фиктивное шифрование”
  function makeLuaStub(payloadB64){
    function level1(bb){
      function level2(xx){
        var head =
"--// lolfuscator 9.0 || lolfuscator.net\n"

        var body =
"local __K0=" + T1 + " "
+"local __K1=" + T2 + " "
+"local __K2=" + T3 + " "
+"local function __jt(t)local o={}for i=1,#t do o[i]=string.char(t[i])end return table.concat(o)end "
+"local _K0,_K1,_K2=__jt(__K0),__jt(__K1),__jt(__K2) "
+"local __B='" + bb + "' "
+"local __abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' "
+"local __g1,__g2,__g3=0,1,2 for _i=1,7 do __g1=__g1+(_i%2) __g2=__g2+(_i%3) __g3=__g3+(__g1%3) end "
+"local function __spin(a,b) for i=1,(a%9)+2 do b=b+((i*a)%3) end return b end "
+"local function __b64(d) d=d:gsub('[^'..__abc..'=]','') return (d:gsub('.',function(x) if x=='=' then return '' end local r,f='',(__abc:find(x)-1) for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end return r end):gsub('%d%d%d?%d?%d?%d?%d?%d?',function(x) if #x~=8 then return '' end local c=0 for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end return string.char(c) end)) end "
+"for __=1,4 do __g1=__spin(__,__g1) end "
+"local function __xor(s,k)local t={}local kl=#k for i=1,#s do local c=s:byte(i)local kk=k:byte(((i-1)%kl)+1)t[#t+1]=string.char(c~kk)if(i%6)==0 then local _=i*i end end return table.concat(t)end "
+"local _d=__b64(__B) "
+"_d=__xor(_d,_K2) "
+"_d=__xor(_d,_K1) "
+"_d=__xor(_d,_K0) "
+"local __bc={}for i=1,#_d do __bc[i]=_d:byte(i)end "
+"local __S,___sp={},0 "
+"local function __push(v)___sp=___sp+1 __S[___sp]=v end "
+"local function __pop()local v=__S[___sp] __S[___sp]=nil ___sp=___sp-1 return v end "
+"for iii=1,5 do local t=0 for j=1,8 do t=t+((j*iii)%4) end if t%5==2 then __push(t)__pop()end end "
+"local __ip=1 "
+"while __ip<=#__bc do "
+" local op=__bc[__ip];__ip=__ip+1 "
+" if op==1 then "
+"  local len=__bc[__ip];__ip=__ip+1 "
+"  local buf={}for i=1,len do buf[i]=string.char(__bc[__ip]);__ip=__ip+1 end "
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
+"  __ip=__ip+(op%2) "
+" end "
+" for ___=1,2 do local v=___*___ end "
+"end ";

        // псевдо‑шифратор тела
        function fakeCrypt(s){
          var r=[],i;
          for(i=0;i<s.length;i++){
            r[i]=s.charAt(i); // ничего не делает
          }
          return r.join("");
        }

        var merged = head + fakeCrypt(body);
        // ещё один бесполезный слой
        return (function(q){ return q; })(merged);
      }
      return level2(bb);
    }
    // бесполезный if
    return __p(false,level1(payloadB64)) || level1(payloadB64);
  }

  return ___wrapInNoise(makeLuaStub(b64));
}

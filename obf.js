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
               .replace(/\n+/g, ";")
               .replace(/\s*([()\[\]{};,=+\-*/%^#<>~|&!])\s*/g, "$1")
               .replace(/^ +| +$/gm, "")
               .replace(/;;+/g, ";");
    return s;
  }

  function encodeLuraph(str){
    var enc = [];
    var state = 0xAB;
    for(var i = 0; i < str.length; i++){
      var c = str.charCodeAt(i);
      var v = c ^ state;
      v = ((v << 1) | (v >>> 7)) & 0xFF;
      v ^= 0x5E;
      v = ((v << 3) | (v >>> 5)) & 0xFF;
      state = (state * 0x41 + 0x403 + i) & 0xFF;
      enc.push(v);
    }
    return enc;
  }

  function toLuraphTable(arr){
    return "{" + arr.map(v => "0x"+v.toString(16).padStart(2,"0")).join(",")+"}";
  }

  function buildLuraphLoader(plain){
    var bytes = encodeLuraph(plain);
    var tbl = toLuraphTable(bytes);

    return `--// lolfuscator 2.0 | lolfuscator.net
local _L=${tbl} local _K=0xAB local _R={} local _I=1
while _I<=#_L do
local _V=_L[_I]
_V=((_V>>>1)|(_V<<7))&255 _V=_V~0x5E
_V=((_V>>>3)|(_V<<5))&255 _V=_V~_K
_R[_I]=string.char(_V)
_K=(_K*65+1027+(_I-1))&255 _I=_I+1
end
local _X=0 for _=1,math.min(10,#_R) do _X=_X+string.byte(_R[_]) end
if _X%11~=4 then error("LVM")end
local _D=loadstring or load return _D(table.concat(_R))()
`;
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
      if(cmt) cmt.textContent = "-- lolfuscator 2.0 | base64 x luraph encoding";

      var norm = normalizeLua(v);
      var out  = buildLuraphLoader(norm);

      if(outOut) outOut.value = out;
      setStatus("done","ok");
    }catch(e){
      if(outOut) outOut.value = "-- error: " + (e && e.message || e);
      setStatus("error","error");
    }
  }

  if(btnObf){
    btnObf.onclick = runObfuskate;
  }
})();

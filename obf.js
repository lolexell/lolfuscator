(function(){
  var d = document,
      $ = function(id){ return d.getElementById(id); },
      input  = $("in"),
      output = $("out"),
      btn    = $("btn"),
      cmt    = $("cmt");

  function hex(n){ return ("00"+n.toString(16)).slice(-2); }

  function encode(src){
    var out = [], i = 0, c, marker;
    for(; i < src.length; i++){
      c = src.charCodeAt(i) ^ (13 + (i * 7) % 211);
      marker = (i % 2 ? "~" : "!");
      out.push("\\" + hex(c));
      if(i % 11 === 0) out.push(marker);
    }
    return out.join("");
  }

  function buildObfuscated(src){
    var payload = encode(src);
    var header = cmt.checked
      ? "--// lolfuscator.meow 1.0 || lolfuscator.net\n"
      : "";
    var stub =
"local o=(\""+payload+"\") local _=string.char local x={} local r=1 " +
"for i=1,#o do local c=o:byte(i) if c==126 or c==33 then " +
"else local v=c ~ (13+((r-1)*7)%211) x[r]=_(v) r=r+1 end end " +
"local f=table.concat(x) local l=loadstring or load if l then l(f)() end";
    return header .. stub;
  }

  btn.onclick = function(){
    var v = input.value || "";
    if(!v.trim()){
      output.value = "-- nothing to obfuscate";
      return;
    }
    try{
      output.value = buildObfuscated(v);
    }catch(e){
      output.value = "-- obfuscation error: " + (e && e.message || e);
    }
  };
})();

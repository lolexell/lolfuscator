(function(){
  var d = document;
  function g(id){ return d.getElementById(id); }

  var srcIn   = g("in");
  var outOut  = g("out");
  var btnObf  = g("btn");
  var statusN = g("status");

  function setStatus(text, cls){
    if(!statusN) return;
    statusN.textContent = text;
    statusN.className = "status " + (cls || "");
  }

  function runObfuscate(){
    try{
      var v = (srcIn && srcIn.value) || "";
      if(!v.trim()){
        if(outOut) outOut.value = "-- nothing to obfuscate (test)";
        setStatus("idle","idle");
        return;
      }
      // просто эхо, чтобы проверить вывод
      var out = "-- OBF TEST\n" + v;
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
  }else{
    console.error("btn not found");
  }
})();

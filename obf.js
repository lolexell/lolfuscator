(function(){
  var d = document;
  function $(id){ return d.getElementById(id); }

  var input  = $("in");
  var output = $("out");
  var btn    = $("btn");
  var cmt    = $("cmt");
  var statusNode = $("status");

  function setStatus(t){
    if(statusNode) statusNode.textContent = t;
  }

  // На случай, если где‑то id не совпал, сразу увидишь в консоли
  console.log("init lolfuscator", {input, output, btn, cmt, statusNode});

  if (!btn || !input || !output) {
    console.error("Required elements not found. Check ids in HTML.");
    return;
  }

  function toLuaEscapedBytes(src){
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      out.push("\\" + c.toString(10));
    }
    return out.join("");
  }

  function buildLua(src){
    var payload = toLuaEscapedBytes(src);
    var header = (cmt && cmt.checked)
      ? "--// lolfuscator.meow 1.0 || lolfuscator.net\n"
      : "";

    var lua =
      header +
      "local o = \"" + payload + "\"\n" +
      "local _ = string.char\n" +
      "local t = {}\n" +
      "local r = 1\n" +
      "for i = 1, #o do\n" +
      " local c = o:byte(i)\n" +
      " local v = c ~ (13 + ((r-1) * 7) % 211)\n" +
      " t[r] = _(v)\n" +
      " r = r + 1\n" +
      "end\n" +
      "local f = table.concat(t)\n" +
      "local L = loadstring or load\n" +
      "if L then L(f)() end";

    return lua;
  }

  btn.onclick = function(){
    var v = input.value || "";
    if (!v.trim()) {
      output.value = "-- nothing to obfuscate";
      setStatus("idle: empty input");
      return;
    }
    try {
      var res = buildLua(v);
      output.value = res;
      setStatus("ok: obfuscated");
    } catch (e) {
      console.error(e);
      output.value = "-- obfuscation error: " + (e && e.message || e);
      setStatus("error");
    }
  };
})();

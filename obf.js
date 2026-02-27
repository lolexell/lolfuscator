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

  // Переводим строку Lua в \ddd последовательность
  function toLuaEscapedBytes(src){
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      out.push("\\" + c.toString(10));
    }
    return out.join("");
  }

  // Здесь НЕТ xor, просто pack/unpack, чтобы гарантированно работало
  function buildLua(src){
    var payload = toLuaEscapedBytes(src);
    var header = (cmt && cmt.checked)
      ? "--// lolfuscator.meow 1.0 || lolfuscator.net\n"
      : "";

    var lua =
      header +
      "local o = \"" + payload + "\"\n" +
      "local t = {}\n" +
      "local i = 1\n" +
      "while i <= #o do\n" +
      " local c = o:byte(i)\n" +
      " if c == 92 then -- '\\\\'\n" +
      "  local a,b,c2 = o:match(\"(%d%d?%d?)\", i+1)\n" +
      "  local num = tonumber(a)\n" +
      "  table.insert(t, string.char(num))\n" +
      "  i = i + 1 + #a\n" +
      " else\n" +
      "  table.insert(t, string.char(c))\n" +
      " end\n" +
      " i = i + 1\n" +
      "end\n" +
      "local f = table.concat(t)\n" +
      "local L = loadstring or load\n" +
      "if L then L(f)() end";

    return lua;
  }

  // Плавный вывод текста в textarea
  function typeOut(text, target, done){
    target.value = "";
    var i = 0;
    var len = text.length;
    var speed = 5; // мс между символами

    function step(){
      if (i >= len) {
        if (done) done();
        return;
      }
      // добавляем пачками, чтобы не было слишком долго
      var chunkSize = 4;
      var next = i + chunkSize;
      target.value += text.slice(i, next);
      i = next;
      target.scrollTop = target.scrollHeight;
      setTimeout(step, speed);
    }
    step();
  }

  if (!btn || !input || !output) {
    console.error("lolfuscator: check element ids in HTML");
    return;
  }

  btn.onclick = function(){
    var v = input.value || "";
    if (!v.trim()) {
      output.value = "-- nothing to obfuscate";
      setStatus("idle: empty input");
      return;
    }

    // Показываем процесс
    output.value = "Obfuscating... Please wait...";
    setStatus("working...");

    // Задержка 1 секунда перед реальным выводом
    setTimeout(function(){
      try {
        var res = buildLua(v);
        typeOut(res, output, function(){
          setStatus("ok: obfuscated");
        });
      } catch (e) {
        console.error(e);
        output.value = "-- obfuscation error: " + (e && e.message || e);
        setStatus("error");
      }
    }, 1000);
  };
})();

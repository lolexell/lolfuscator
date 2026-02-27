(function(){
  var d = document;
  function $(id){ return d.getElementById(id); }

  // obfuscator elements
  var input  = $("in");
  var output = $("out");
  var btn    = $("btn");
  var cmt    = $("cmt");
  var statusNode = $("status");

  // deobfuscator elements
  var dein   = $("dein");
  var deout  = $("deout");
  var dbtn   = $("dbtn");
  var dstatus = $("dstatus");

  function setStatus(node, t){
    if(node) node.textContent = t;
  }

  // ===== OBFUSCATOR =====

  // \ddd формат
  function toLuaEscapedBytes(src){
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      out.push("\\" + c.toString(10));
    }
    return out.join("");
  }

  // Обратная операция для \ddd → строка (внутреннее использование и в деобфускаторе)
  function fromLuaEscapedBytes(s){
    var res = [];
    var i = 0;
    while (i < s.length) {
      var c = s.charCodeAt(i);
      if (c === 92) { // '\'
        // читаем до 3 цифр
        var j = i + 1;
        var digits = "";
        while (j < s.length && digits.length < 3) {
          var ch = s.charCodeAt(j);
          if (ch >= 48 && ch <= 57) { // 0-9
            digits += s.charAt(j);
            j++;
          } else break;
        }
        if (digits.length > 0) {
          res.push(String.fromCharCode(parseInt(digits, 10)));
          i = j;
          continue;
        } else {
          res.push(s.charAt(i));
        }
      } else {
        res.push(s.charAt(i));
      }
      i++;
    }
    return res.join("");
  }

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
      "  local digits = {}\n" +
      "  local j = i + 1\n" +
      "  while j <= #o and #digits < 3 do\n" +
      "   local ch = o:byte(j)\n" +
      "   if ch >= 48 and ch <= 57 then\n" +
      "    digits[#digits+1] = string.char(ch)\n" +
      "    j = j + 1\n" +
      "   else break end\n" +
      "  end\n" +
      "  local num = tonumber(table.concat(digits))\n" +
      "  t[#t+1] = string.char(num)\n" +
      "  i = j\n" +
      " else\n" +
      "  t[#t+1] = string.char(c)\n" +
      "  i = i + 1\n" +
      " end\n" +
      "end\n" +
      "local f = table.concat(t)\n" +
      "local L = loadstring or load\n" +
      "if L then L(f)() end";

    return lua;
  }

  // плавный вывод текста в textarea
  function typeOut(text, target, done){
    target.value = "";
    var i = 0;
    var len = text.length;
    var speed = 5;

    function step(){
      if (i >= len) {
        if (done) done();
        return;
      }
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
      setStatus(statusNode, "idle: empty input");
      return;
    }

    output.value = "Obfuscating... Please wait...";
    setStatus(statusNode, "working...");

    setTimeout(function(){
      try {
        var res = buildLua(v);
        typeOut(res, output, function(){
          setStatus(statusNode, "ok: obfuscated");
        });
      } catch (e) {
        console.error(e);
        output.value = "-- obfuscation error: " + (e && e.message || e);
        setStatus(statusNode, "error");
      }
    }, 1000);
  };

  // ===== DEOBFUSCATOR =====
  if (dbtn && dein && deout) {
    dbtn.onclick = function(){
      var src = dein.value || "";
      if (!src.trim()) {
        deout.value = "-- nothing to deobfuscate";
        setStatus(dstatus, "idle: empty input");
        return;
      }

      setStatus(dstatus, "parsing...");

      try{
        // вытаскиваем содержимое строки после `local o = "`
        var m = src.match(/local%s+o%s*=%s*\"([^"]*)\"/);
        if (!m) {
          deout.value = "-- can't find payload (local o = \"...\")";
          setStatus(dstatus, "error");
          return;
        }

        var payload = m[1];
        var plain = fromLuaEscapedBytes(payload);
        deout.value = plain;
        setStatus(dstatus, "ok: deobfuscated");
      }catch(e){
        console.error(e);
        deout.value = "-- deobfuscation error: " + (e && e.message || e);
        setStatus(dstatus, "error");
      }
    };
  }
})();

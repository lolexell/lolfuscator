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

  // ===== helpers =====

  // лёгкое "сжатие" Lua: убираем лишние пробелы и пустые строки
  function compressLua(src){
    var lines = src.split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (l === "" || l.startsWith("--")) continue;
      // несколько пробелов → один
      l = l.replace(/\s+/g, " ");
      out.push(l);
    }
    // объединяем в одну строку с ; чтобы было более "слеплено"
    return out.join(";");
  }

  // \ddd формат
  function toLuaEscapedBytes(src){
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      out.push("\\" + c.toString(10));
    }
    return out.join("");
  }

  function fromLuaEscapedBytes(s){
    var res = [];
    var i = 0;
    while (i < s.length) {
      var c = s.charCodeAt(i);
      if (c === 92) { // '\'
        var j = i + 1;
        var digits = "";
        while (j < s.length && digits.length < 3) {
          var ch = s.charCodeAt(j);
          if (ch >= 48 && ch <= 57) {
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

  // ===== OBFUSCATOR (визуально "под Luraph") =====

  function buildLua(src){
    // сначала лёгкая минификация
    var compact = compressLua(src);
    var payload = toLuaEscapedBytes(compact);

    var header = (cmt && cmt.checked)
      ? "--// lolfuscator.meow 1.0 || lolfuscator.net\n"
      : "";

    // немного мусора и странных имён, формат похож на "VM loader"
    var lua =
      header ..
      "local _0=(\""..payload.."\");" ..
      "local _1=string.char;local _2, _3, _4 = {},0,nil;" ..
      "for _5=1,#_0 do local _6=_0:byte(_5);" ..
      "if _6==92 then" .. -- '\'
      " local _7={};local _8=_5+1;" ..
      " while _8<=#_0 and #_7<3 do local _9=_0:byte(_8);" ..
      "  if _9>=48 and _9<=57 then _7[#_7+1]=_1(_9);_8=_8+1 else break end end " ..
      " local _a=tonumber(table.concat(_7));_2[#_2+1]=_1(_a);_5=_8-1;" ..
      "else _2[#_2+1]=_1(_6) end end " ..
      "local _b=table.concat(_2);local _c=(loadstring or load);if _c then _c(_b)() end";

    // Чтобы избежать проблем с конкатенацией в JS, соберём через +
    lua =
      header +
      "local _0 = \"" + payload + "\";" +
      "local _1=string.char;local _2,_3,_4={},0,nil;" +
      "for _5=1,#_0 do local _6=_0:byte(_5);" +
      "if _6==92 then " +
      " local _7={};local _8=_5+1;" +
      " while _8<=#_0 and #_7<3 do local _9=_0:byte(_8);" +
      "  if _9>=48 and _9<=57 then _7[#_7+1]=_1(_9);_8=_8+1 else break end end " +
      " local _a=tonumber(table.concat(_7));_2[#_2+1]=_1(_a);_5=_8-1;" +
      "else _2[#_2+1]=_1(_6) end end " +
      "local _b=table.concat(_2);local _c=(loadstring or load);if _c then _c(_b)() end";

    return lua;
  }

  // ===== INIT OBFUSCATOR BUTTON =====

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
        output.value = res;
        output.scrollTop = 0;
        setStatus(statusNode, "ok: obfuscated");
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
        // ищем local _0 = "...."
        var m = src.match(/local%s+_0%s*=%s*\"([^"]*)\"/);
        if (!m) {
          deout.value = "-- can't find payload (local _0 = \"...\")";
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

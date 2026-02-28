(function(){
  var d = document;
  function $(id){ return d.getElementById(id); }

  // obfuscator
  var input  = $("in");
  var output = $("out");
  var btn    = $("btn");
  var cmt    = $("cmt");
  var statusNode = $("status");

  // deobfuscator
  var dein   = $("dein");
  var deout  = $("deout");
  var dbtn   = $("dbtn");
  var dstatus = $("dstatus");

  function setStatus(node, t){
    if(node) node.textContent = t;
  }

  // лёгкое сжатие
  function compressLua(src){
    var lines = src.split(/\r?\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (!l || l.startsWith("--")) continue;
      l = l.replace(/\s+/g, " ");
      out.push(l);
    }
    return out.join(";");
  }

  // pack to \ddd
  function toLuaEscapedBytes(src){
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var c = src.charCodeAt(i);
      out.push("\\" + c.toString(10));
    }
    return out.join("");
  }

  // unpack \ddd
  function fromLuaEscapedBytes(s){
    var res = [];
    var i = 0;
    while (i < s.length) {
      var c = s.charCodeAt(i);
      if (c === 92) {
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
        }
      }
      res.push(s.charAt(i));
      i++;
    }
    return res.join("");
  }

  // генерация luraph‑стайл loader’а
  function buildLua(src){
    var compact = compressLua(src);
    var payload = toLuaEscapedBytes(compact);
    var header = (cmt && cmt.checked)
      ? "--// lolfuscator.meow 1.0 || lolfuscator.net\n"
      : "";

    // мусорные имена и VM‑подобная конструкция
    var lua =
      header +
      "local lIlIlI0O0O=\"" + payload + "\";" +
      "local O0l1l0=string.char;local l0l1I10,IllI1I,Il0l1l={},{},{};local O00O01=1;local l1I1O0=(#lIlIlI0O0O%3)+1;local I0O0Ol=(loadstring or load);" +
      "for lI0Ol0=1,#lIlIlI0O0O do local l1l0OI=lIlIlI0O0O:byte(lI0Ol0);" +
        "if l1l0OI==92 then " + /* '\' */
          "local I1l0l0={};local O1O0O0=lI0Ol0+1;while O1O0O0<=#lIlIlI0O0O and #I1l0l0<3 do local O1I1O1=lIlIlI0O0O:byte(O1O0O0);" +
          "if O1I1O1>=48 and O1I1O1<=57 then I1l0l0[#I1l0l0+1]=O0l1l0(O1I1O1);O1O0O0=O1O0O0+1 else break end end;" +
          "local lO0O10=tonumber(table.concat(I1l0l0)) or 0;Il0l1l[#Il0l1l+1]=O0l1l0(lO0O10);lI0Ol0=O1O0O0-1;" +
        "else Il0l1l[#Il0l1l+1]=O0l1l0(l1l0OI) end;" +
      "end;" +
      "local OI0I01=table.concat(Il0l1l);" +
      "--[[lolfuscator-vm]]" +
      "local function l11O0I(l0OOO1,Ol1O0O) return (l0OOO1 and Ol1O0O) and l0OOO1 or Ol1O0O end;" +
      "local function O0I0O1(OI0,lOO) if not OI0 then return lOO end return OI0 end;" +
      "if I0O0Ol then local OOl01I=OI0I01;local IOI1Ol=l11O0I(I0O0Ol,load);local lO0I1O=O0I0O1(OOl01I,OI0I01);IOI1Ol(lO0I1O)() end";

    return lua;
  }

  // init obfuscator
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

  // deobfuscator
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
        // ищем local lIlIlI0O0O = "...."
        var m = src.match(/local%s+lIlIlI0O0O%s*=%s*\"([^"]*)\"/);
        if (!m) {
          deout.value = "-- can't find payload (local lIlIlI0O0O = \"...\")";
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

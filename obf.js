(function(){
  var d = document;
  function g(id){ return d.getElementById(id); }

  // --- obfuscator refs ---
  var srcIn   = g("in");      // input textarea
  var outOut  = g("out");     // output textarea
  var btnObf  = g("btn");     // Obfuscate button
  var cmt     = g("cmt");     // comment/status small text
  var statusN = g("status");  // main status label

  function setStatus(text, cls){
    if(!statusN) return;
    statusN.textContent = text;
    statusN.className = "status " + (cls || "");
  }

  // нормализация Lua: ужимаем, чтобы меньше читалось
  function normalizeLua(src){
    if(!src) return "";
    var s = src.replace(/\r/g, "");
    s = s.replace(/--\[\[[\s\S]*?]]/g, "");    // многострочные комменты
    s = s.replace(/--[^\n]*/g, "");           // однострочные комменты
    s = s.replace(/[ \t]+/g, " ");
    s = s.replace(/\n+/g, "\n");
    s = s.replace(/\s*([\(\)\{\}\[\];,=+\-*/%^#<>~])\s*/g, "$1");
    s = s.replace(/^\s+|\s+$/g, "");
    s = s.replace(/\n/g, ";");
    return s;
  }

  // кодируем строку в массив псевдо‑байтов (с XOR/сдвигами)
  function encodeWeird(str){
    var key = 157;
    var arr = [];
    for(var i=0;i<str.length;i++){
      var c = str.charCodeAt(i);
      // немного рандомного мусора в расчёте
      var salt = (i * 73 + 19) & 255;
      var v = (c ^ key ^ salt);
      v = ((v << 3) | (v >>> 5)) & 255; // циклический сдвиг
      arr.push(v);
      key = (key + 37) & 255;
    }
    return arr;
  }

  // превращаем массив чисел в lua-таблицу вида {123,45,...}
  function toLuaTable(arr){
    var parts = [];
    for(var i=0;i<arr.length;i++){
      parts.push(arr[i].toString());
    }
    return "{" + parts.join(",") + "}";
  }

  // генерим более “виртуальный” загрузчик
  function buildLoader(plain){
    var bytes = encodeWeird(plain);
    var tableStr = toLuaTable(bytes);

    var stub =
"local lIlIlI0O0O=" + tableStr + " " +
"local function lIIIIllI1(lIIllI1I,l1IlIl1I) " +
"local IIlIl1lI,IlllIl1I=0,{} " +
"local l1l1Il1I=157 " +
"for lI1lIlIl=1,#lIIllI1I do " +
"local IIl1lIlI=lIIllI1I[lI1lIlIl] " +
"local IlIl1IlI=((IIl1lIlI >> 3)&255)|((IIl1lIlI << 5)&255) " +
"local lIl1lIlI=(IlIl1IlI ~ l1l1Il1I ~ ((IIlIl1lI*73+19)&255))&255 " +
"IlllIl1I[#IlllIl1I+1]=string.char(lIl1lIlI) " +
"l1l1Il1I=(l1l1Il1I+37)&255 " +
"IIlIl1lI=IIlIl1lI+1 " +
"end " +
"local l1I1I1Il=table.concat(IlllIl1I) " +
"local l11lI1Il=(lIIllI1I and l1IlIl1I) and 0 or 1 " +
"if l11lI1Il~=1 then error('vm broken') end " +
"local _llIl1I1=loadstring or load " +
"if not _llIl1I1 then error('no loader') end " +
"return _llIl1I1(l1I1I1Il)() " +
"end " +
"local function lIIlIIlIl(...) return ... end " +
"return lIIIIllI1(lIlIlI0O0O, lIIlIIlIl)";

    var header =
"--// lolfuscator.meow 1.0 || lolfuscator.net\n" +
"local _0O0,OO00,O0O0=nil,nil,nil " +
"for _O0O=1,0 do _0O0=OO00 or O0O0 end ";

    return header + stub;
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
      if(cmt) cmt.textContent = "-- generating pseudo-VM garbage";

      var norm = normalizeLua(v);
      var out  = buildLoader(norm);

      if(outOut) outOut.value = out;
      setStatus("ok","ok");
    }catch(e){
      if(outOut) outOut.value = "-- obfuscation error: " + (e && e.message || e);
      setStatus("error","error");
    }
  }

  if(btnObf){
    btnObf.onclick = runObfuscate;
  }
})();

// --- RUN LUA вместо деобфускатора ---
(function(){
  var d = document;
  function g(id){ return d.getElementById(id); }

  var srcIn   = g("in");          // исходный Lua (верхнее поле)
  var runBtn  = g("runLuaBtn");
  var runLog  = g("runlog");
  var runStat = g("runStatus");

  function setRunStatus(text, cls){
    if(!runStat) return;
    runStat.textContent = text;
    runStat.className = "status " + (cls || "");
  }

  if(runBtn && runLog && srcIn){
    runBtn.onclick = function(){
      var code = srcIn.value || "";
      if(!code.trim()){
        runLog.value = "-- nothing to run";
        setRunStatus("no input","error");
        return;
      }

      if(!window.fengari || typeof fengari.load !== "function"){
        runLog.value =
"-- fengari-web is not loaded.\n" +
"Add:\n" +
"<script src=\"https://unpkg.com/fengari-web/dist/fengari-web.js\"></script>\n" +
"before obf.js";
        setRunStatus("no fengari","error");
        return;
      }

      try{
        runLog.value = "";
        setRunStatus("running...","working");

        var out = [];
        var oldLog = console.log;
        console.log = function(){
          var msg = Array.prototype.slice.call(arguments).join(" ");
          out.push(msg);
        };

        // запуск Lua-кода через fengari [web:25][web:28]
        var fn = fengari.load(code, "lolfuscator_run");
        fn();

        console.log = oldLog;

        runLog.value = out.join("\n") || "-- (no output)";
        setRunStatus("ok","ok");
      }catch(e){
        console.log = oldLog;
        runLog.value = "-- lua runtime error:\n" + (e && e.message || e);
        setRunStatus("error","error");
      }
    };
  }
})();

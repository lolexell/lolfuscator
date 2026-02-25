(function(U){
  var z = document,
      Q = function(q){return z.getElementById(q)},
      X = Q("in"),
      Y = Q("out"),
      B = Q("btn"),
      C = Q("cmt");

  function J(n){return ("00"+n.toString(16)).slice(-2)}
  function S(s){
    var o=[],i=0,c,t;
    for(;i<s.length;i++){
      c=s.charCodeAt(i) ^ (13 + (i*7)%211);
      t = (i%2? "~":"!");
      o.push("\\" + J(c));
      if(i%11===0) o.push(t);
    }
    return o.join("");
  }

  function H(src){
    var p = S(src);
    var head = C.checked
      ? "--// lua hub obf\n"
      : "";
    var stub =
"local o=(\""+p+"\")local _=string.char;local x={}local r=1;" +
"for i=1,#o do local c=o:byte(i);if c==126 or c==33 then else" +
" local v=c ~ (13+((r-1)*7)%211);x[r]=_(v);r=r+1 end end " +
"local f=table.concat(x) loadstring(f)()";
    return head+stub;
  }

  var W = "onkeyup onclick".split(" ");
  for(var i=0;i<W.length;i++){
    X[W[i]] = function(){};
  }

  B.onclick = function(){
    var v = X.value||"";
    if(!v.trim()){
      Y.value = "-- nothing to obfuscate";
      return;
    }
    try{
      Y.value = H(v);
    }catch(e){
      Y.value = "-- obfuscation error: "..e;
    }
  };
})();

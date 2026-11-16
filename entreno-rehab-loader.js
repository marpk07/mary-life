(function(){
  function run(code){ var s=document.createElement('script'); s.textContent=code; document.head.appendChild(s); }
  Promise.all([
    fetch('entreno-rehab-app.p1.js?v=2').then(r=>r.text()),
    fetch('entreno-rehab-app.p2.js?v=2').then(r=>r.text())
  ]).then(function(parts){ run(parts[0]+parts[1]); }).catch(function(e){ console.error(e); });
})();

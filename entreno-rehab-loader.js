(function(){
  var CDN = 'https://cdn.jsdelivr.net/gh/marpk07/mary-life@f5ea0228d3685d24266bc911ba26266bd7ec592f/entreno-rehab-app.js';
  function inject(code){
    var s=document.createElement('script');
    s.textContent=code;
    document.head.appendChild(s);
  }
  function loadPatch(){
    var s=document.createElement('script');
    s.src='entreno-rehab-hist-patch.js?v=6';
    document.head.appendChild(s);
  }
  fetch(CDN).then(function(r){ return r.text(); }).then(function(code){
    inject(code);
    loadPatch();
  }).catch(function(e){
    console.error(e);
    fetch('entreno-rehab-app.js?v=6').then(function(r){return r.text();}).then(function(t){
      if(t && t.indexOf('TEMPLATES')>=0){ inject(t); loadPatch(); }
    });
  });
})();

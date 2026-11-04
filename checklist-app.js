(async function(){
  try {
    var code = '';
    for (var i = 0; i < 4; i++) {
      var r = await fetch('clf-'+i+'.txt?v=fix6');
      if (!r.ok) throw new Error('part '+i+' '+r.status);
      code += await r.text();
    }
    (0, eval)(code);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('sync');
    if (el) el.textContent = 'Error: ' + e.message;
  }
})();

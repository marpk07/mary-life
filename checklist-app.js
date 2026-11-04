(async function(){
  try {
    var code = '';
    for (var i = 0; i < 6; i++) {
      var r = await fetch('boot-'+i+'.txt?v=fix7');
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

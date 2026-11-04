/* MARY alimentación · parche salsas v3 */
(function(){
  function wait(){
    if(typeof window.saveSalsas==='function' && typeof window.showTab==='function'){
      console.log('alimentacion patch ready');
      return;
    }
    setTimeout(wait, 100);
  }
  wait();
})();

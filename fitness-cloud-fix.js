(function(){
  function stripFotosForCloud(data){
    try{
      var copy=JSON.parse(JSON.stringify(data));
      if(Array.isArray(copy.fotos)){
        copy.fotos=copy.fotos.map(function(f){
          return {id:f.id,date:f.date||'',pose:f.pose||'',hasPhoto:!!(f.url&&String(f.url).length>50),url:''};
        });
      }
      return copy;
    }catch(e){return data;}
  }
  function install(){
    if(typeof saveDatabase!=='function'){setTimeout(install,300);return;}
    if(window.__maryFitCloudStrip)return;
    window.__maryFitCloudStrip=true;
    saveDatabase=function(){
      try{
        var key=(typeof STORAGE_KEY!=='undefined'?STORAGE_KEY:'MARY_FITNESS_DATA_V9');
        localStorage.setItem(key,JSON.stringify(maryData));
        if(typeof isCloudReady!=='undefined'&&isCloudReady&&typeof db!=='undefined'&&db){
          db.collection('mary_fitness').doc('user_data').set(stripFotosForCloud(maryData)).catch(function(e){console.warn(e);});
        }
      }catch(e){console.error(e);}
    };
    window.exportFitnessPhotos=function(){
      var list=(maryData.fotos||[]).filter(function(f){return f.url&&String(f.url).length>50;});
      if(!list.length){if(typeof showToast==='function')showToast('No hay fotos con imagen en este dispositivo');return;}
      list.forEach(function(f,i){
        try{
          var a=document.createElement('a');a.href=f.url;
          a.download='fitness_'+(f.date||'foto')+'_'+(f.id||i)+'.jpg';
          document.body.appendChild(a);a.click();a.remove();
        }catch(e){}
      });
      if(typeof showToast==='function')showToast('Descargando '+list.length+' foto(s)');
    };
    console.log('[Mary] Fitness cloud photo strip active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
  setTimeout(install,1000);
  setTimeout(install,3000);
})();

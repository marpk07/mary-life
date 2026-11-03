(function(){
  function go(fn){
    if(window._calAPI) return fn(window._calAPI);
    setTimeout(function(){ go(fn); }, 40);
  }
  window.exportPDFDiario = function(){
    go(function(C){
      C.collectForm();
      const day = document.getElementById('day-date').value || C.todayISO();
      const d = C.ensureDay(day);
      const store = C.getStore();
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit:'pt', format:'a4' });
        const W = doc.internal.pageSize.getWidth();
        const pink=[236,72,153], purple=[124,58,160], lilac=[248,244,255], soft=[255,241,247];
        const text=[35,28,48], muted=[110,95,125];
        function card(x,y,w,h){ doc.setFillColor(255,255,255); doc.setDrawColor(230,220,245); doc.roundedRect(x,y,w,h,10,10,'FD'); }
        function section(str,y){ doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...purple); doc.text(str,40,y); return y+14; }
        function pageHeader(){
          doc.setFillColor(...lilac); doc.rect(0,0,W,26,'F');
          doc.setFillColor(...pink); doc.roundedRect(40,7,110,13,6,6,'F');
          doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
          doc.text('CIERRE DIARIO',52,16);
        }
        function cleanNote(s){
          if(!s) return '';
          s = String(s).replace(/[|｜]/g,'').replace(/\u00a0/g,' ').replace(/[\u200b\u200c\u200d\ufeff]/g,'');
          s = s.replace(/\s+/g,' ').trim();
          var words = s.split(' ');
          var short = 0;
          for(var i=0;i<words.length;i++){ if(words[i].length<=1) short++; }
          if(words.length>6 && short/words.length>0.55){
            s = words.join('');
          }
          return s;
        }
        doc.setFillColor(...lilac); doc.rect(0,0,W,70,'F');
        doc.setFillColor(...purple); doc.roundedRect(40,20,210,18,9,9,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
        doc.text(C.fmtDateLong(day).toUpperCase(),52,32);
        doc.setFillColor(...pink); doc.roundedRect(40,46,100,16,8,8,'F');
        doc.setFontSize(9); doc.setTextColor(255,255,255); doc.text('Cierre diario',52,57);
        let y=88;
        y=section('Mis actividades del día · autoevaluación',y);
        const maryN=C.consolidatedNote(day,'Mary');
        const maryActs=C.linesToBullets(d.activities.Mary);
        const actsH = Math.max(maryActs.length,1)*12 + 28;
        card(40,y,W-80,actsH);
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text('Mary',55,y+16);
        let ly=y+30; doc.setFont('helvetica','normal'); doc.setFontSize(9);
        if(maryActs.length){
          maryActs.forEach(function(a){
            const lines=doc.splitTextToSize('• '+a, W-110);
            doc.setTextColor(...text); doc.text(lines,55,ly); ly+=lines.length*12;
          });
        } else { doc.setTextColor(...muted); doc.text('• Sin actividades registradas',55,ly); }
        y += actsH + 8;
        doc.setFillColor(...lilac); doc.roundedRect(40,y,100,34,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(...muted); doc.text('AUTOEVAL.',50,y+12);
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(...purple);
        doc.text(maryN.total!=null?maryN.total.toFixed(1).replace('.',','):'—',50,y+28);
        if(maryN.prod!=null){
          doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...text);
          doc.text('P '+maryN.prod.toFixed(1).replace('.',',')+'   ·   Pr '+(maryN.proact!=null?maryN.proact.toFixed(1).replace('.',','):'0')+'   ·   D -'+(maryN.disc!=null?maryN.disc.toFixed(1).replace('.',','):'0'),150,y+22);
        }
        doc.setFillColor(...pink); doc.roundedRect(W-150,y,90,34,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(255,255,255); doc.text('TIEMPO',W-138,y+12);
        doc.setFont('helvetica','bold'); doc.setFontSize(13);
        doc.text(d.hoursMary!==''&&d.hoursMary!=null?(d.hoursMary+' h'):'—',W-138,y+28);
        if(d.hoursPending!==''&&d.hoursPending!=null && String(d.hoursPending).trim()!==''){
          y+=42;
          doc.setFillColor(252,231,243); doc.setDrawColor(244,114,182);
          doc.roundedRect(40,y,W-80,22,11,11,'FD');
          doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(80,40,70);
          doc.text('Horas pendientes por recuperar:  '+d.hoursPending+' h',55,y+14);
          y+=38;
        } else { y+=46; }
        y=section('Actividades del equipo',y);
        ['Laura','Valery'].forEach(function(p){
          const cn=C.consolidatedNote(day,p); const acts=C.linesToBullets(d.activities[p]);
          const h=Math.min(36+Math.max(acts.length,1)*12+8,130);
          card(40,y,W-80,h);
          doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text(p,55,y+16);
          let yy=y+28; doc.setFont('helvetica','normal'); doc.setFontSize(9);
          if(cn.absent){ doc.setTextColor(...muted); doc.text('• '+C.statusLabel(cn.status),55,yy); }
          else if(acts.length){ acts.slice(0,6).forEach(function(a){ const lines=doc.splitTextToSize('• '+a,W-170); doc.setTextColor(...text); doc.text(lines,55,yy); yy+=lines.length*11; }); }
          else { doc.setTextColor(...muted); doc.text('• Sin información registrada',55,yy); }
          doc.setFillColor(...lilac); doc.roundedRect(W-145,y+10,85,36,8,8,'F');
          doc.setFontSize(6); doc.setTextColor(...muted); doc.text('NOTA DADA POR MARY',W-138,y+20);
          doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...purple);
          doc.text(cn.total!=null?cn.total.toFixed(1).replace('.',','):'—',W-138,y+35);
          if(cn.prod!=null){
            doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...muted);
            doc.text('P'+cn.prod.toFixed(1).replace('.',',')+' Pr'+(cn.proact!=null?cn.proact.toFixed(1).replace('.',','):'0')+' D-'+(cn.disc!=null?cn.disc.toFixed(1).replace('.',','):'0'),W-138,y+44);
          }
          y+=h+8; if(y>720){ doc.addPage(); pageHeader(); y=40; }
        });
        if(y>620){ doc.addPage(); pageHeader(); y=40; }
        y=section('Notas que doy yo (Mary) · desglose',y);
        const body=C.PEOPLE.map(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent) return [p,'—','—','—',C.statusLabel(cn.status)];
          return [p, cn.prod!=null?cn.prod.toFixed(1).replace('.',','):'—', cn.proact!=null?cn.proact.toFixed(1).replace('.',','):'0,0', cn.disc!=null&&cn.disc>0?('-'+cn.disc.toFixed(1).replace('.',',')):'0,0', cn.total!=null?cn.total.toFixed(1).replace('.',','):'—'];
        });
        doc.autoTable({ startY:y, head:[['Colaboradora','Productividad','Proactividad','Descuentos','Nota final']], body:body, theme:'grid', styles:{fontSize:9,cellPadding:5,textColor:text}, headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold',fontSize:8}, alternateRowStyles:{fillColor:[252,250,255]}, columnStyles:{4:{fontStyle:'bold',fontSize:11,textColor:purple}}, margin:{left:40,right:40} });
        y=doc.lastAutoTable.finalY+14;
        if(y>650){ doc.addPage(); pageHeader(); y=40; }
        y=section('Notas del equipo · día (matriz)',y);
        const matrixBody=C.PEOPLE.map(function(person){
          const sc=C.dayScores(day, person);
          function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1).replace('.',','); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return C.statusLabel(st); return '—'; }
          return [person, fWho('Mary'), fWho('Laura'), fWho('Valery'), sc.avg==null?'—':sc.avg.toFixed(1).replace('.',',')];
        });
        doc.autoTable({ startY:y, head:[['Evaluada','Mary','Laura','Valery','Prom. día']], body:matrixBody, theme:'grid', styles:{fontSize:9,cellPadding:5,textColor:text}, headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold',fontSize:8}, alternateRowStyles:{fillColor:[252,250,255]}, columnStyles:{0:{fontStyle:'bold'},4:{fontStyle:'bold',fontSize:10,textColor:purple}}, margin:{left:40,right:40} });
        y=doc.lastAutoTable.finalY+6;
        doc.setFontSize(7); doc.setTextColor(...muted);
        doc.text('Celda = nota que dio esa persona (columnas) a la evaluada (filas).',40,y);
        y+=14;
        y=section('Descuentos del día',y);
        C.PEOPLE.forEach(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent){ doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': '+C.statusLabel(cn.status),50,y); y+=13; return; }
          if(cn.discounts&&cn.discounts.length){
            cn.discounts.forEach(function(x){
              var amt=Math.abs(C.num(x.amount));
              doc.setFontSize(9); doc.setTextColor(...pink); doc.setFont('helvetica','bold');
              doc.text('-'+amt.toFixed(1).replace('.',','),50,y);
              doc.setFont('helvetica','normal'); doc.setTextColor(...text);
              doc.text(p+' · '+cleanNote(x.reason||''),78,y); y+=13;
            });
          } else { doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': sin descuentos',50,y); y+=13; }
        });
        y+=8;
        if(y>680){ doc.addPage(); pageHeader(); y=40; }
        y=section('Estado de pendientes abiertos',y);
        (store.openPendientesMaster||[]).filter(function(p){ return p.status!=='cerrado'&&(p.title||'').trim(); }).forEach(function(p){
          if(y>755){ doc.addPage(); pageHeader(); y=40; }
          var st=p.status||'pendiente';
          var stColor = st==='en_espera'?purple:(st==='en_proceso'?pink:(st==='sin_novedades'?muted:[140,100,180]));
          var title = cleanNote(p.title||'');
          var stLab = C.openStatusLabel(st);
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...text);
          doc.text('• '+title,50,y);
          var tw=Math.min(doc.getTextWidth('• '+title)+6, W-160);
          doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...stColor);
          doc.text(stLab, 50+tw, y);
          y+=13;
          var note = cleanNote(p.note);
          if(note){
            doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...muted);
            var lines=doc.splitTextToSize(note, W-110);
            for(var li=0; li<lines.length; li++){ doc.text(String(lines[li]), 58, y); y+=11; }
            y+=4;
          } else { y+=4; }
        });
        y+=6; y=section('Pendientes de mañana · equipo',y);
        C.PEOPLE.forEach(function(p){
          const pend=C.linesToBullets(d.pendientesManana[p]); if(!pend.length) return;
          if(y>760){ doc.addPage(); pageHeader(); y=40; }
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...text); doc.text(p+':',50,y); y+=12;
          doc.setFont('helvetica','normal');
          pend.forEach(function(x){ doc.text('• '+cleanNote(x),58,y); y+=12; });
        });
        doc.setFontSize(8); doc.setTextColor(...muted);
        doc.text('Cierre diario · '+day+' · Nota = productividad + proactividad − descuentos',40,820);
        doc.save('cierre_diario_'+day+'.pdf');
      } catch(err){ console.error(err); alert('Error PDF diario'); }
    });
  };
  function fmtRangeES(from, to){
    var months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    try{
      var d1=new Date(from+'T12:00:00'), d2=new Date(to+'T12:00:00');
      if(d1.getMonth()===d2.getMonth()) return d1.getDate()+' al '+d2.getDate()+' de '+months[d1.getMonth()];
      return d1.getDate()+' de '+months[d1.getMonth()]+' al '+d2.getDate()+' de '+months[d2.getMonth()];
    }catch(e){ return from+' → '+to; }
  }
  function fmtDayShort(iso){
    var months=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    try{
      var d=new Date(iso+'T12:00:00');
      return d.getDate()+' '+months[d.getMonth()];
    }catch(e){ return iso.slice(5); }
  }
  function avgOfDays(C, days, person){
    var sum=0,n=0;
    days.forEach(function(day){ var sc=C.dayScores(day,person); if(sc.avg!=null){ sum+=sc.avg; n++; } });
    return n?sum/n:null;
  }
  function drawWeekBlock(doc, C, days, title, y, W, colors){
    var purple=colors.purple, pink=colors.pink, lilac=colors.lilac, text=colors.text, muted=colors.muted;
    function section(str,y){ doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...purple); doc.text(str,40,y); return y+14; }
    if(y>40){ y+=6; }
    y=section(title,y);
    var store=C.getStore();
    C.PEOPLE.forEach(function(person){
      if(y>640){ doc.addPage(); doc.setFillColor(...lilac); doc.rect(0,0,W,26,'F'); doc.setFillColor(...pink); doc.roundedRect(40,7,110,13,6,6,'F'); doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text('CIERRE SEMANAL',52,16); y=40; }
      var body=days.map(function(day){
        var sc=C.dayScores(day,person);
        function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1).replace('.',','); var st=sc._status&&sc._status[who]; if(st&&st!=='ok') return C.statusLabel(st); return '—'; }
        return [fmtDayShort(day), fWho('Mary'), fWho('Laura'), fWho('Valery'), sc.avg==null?'—':sc.avg.toFixed(1).replace('.',',')];
      });
      var avg=avgOfDays(C,days,person);
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...text);
      doc.text(person,40,y); y+=4;
      doc.autoTable({
        startY:y,
        head:[['Día','Mary','Laura','Valery','Prom.']],
        body:body,
        theme:'grid',
        styles:{fontSize:8,cellPadding:4,textColor:text},
        headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold',fontSize:8},
        alternateRowStyles:{fillColor:[252,250,255]},
        columnStyles:{4:{fontStyle:'bold',textColor:purple}},
        margin:{left:40,right:40}
      });
      y=doc.lastAutoTable.finalY+10;
      var b = person==='Mary'?C.bonoMary(avg):C.bonoLV(avg);
      var cur = person==='Mary'?'$':'R$';
      var bw=(W-80-16)/3;
      doc.setFillColor(...lilac); doc.roundedRect(40,y,bw,42,10,10,'F');
      doc.setFontSize(7); doc.setTextColor(...muted); doc.text('PROMEDIO',50,y+14);
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...purple);
      doc.text(avg==null?'—':avg.toFixed(2).replace('.',','),50,y+32);
      doc.setFillColor(252,231,243); doc.roundedRect(40+bw+8,y,bw,42,10,10,'F');
      doc.setFontSize(7); doc.setTextColor(80,40,70); doc.text('BONO · '+b.label,50+bw+8,y+14);
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...pink);
      doc.text('+'+cur+b.bonus,50+bw+8,y+32);
      doc.setFillColor(...pink); doc.roundedRect(40+2*(bw+8),y,bw,42,10,10,'F');
      doc.setFontSize(7); doc.setTextColor(255,255,255); doc.text('TOTAL A PAGAR',50+2*(bw+8),y+14);
      doc.setFont('helvetica','bold'); doc.setFontSize(14);
      doc.text(cur+b.total,50+2*(bw+8),y+32);
      y+=54;
    });
    if(y>700){ doc.addPage(); y=40; }
    y=section('Horas Mary · detalle',y);
    var hoursRows=[];
    var hoursSum=0;
    days.forEach(function(day){
      var d=store.days[day];
      var h=(d&&d.hoursMary!==''&&d.hoursMary!=null)?C.num(d.hoursMary):null;
      if(h!=null) hoursSum+=h;
      hoursRows.push([fmtDayShort(day), h==null?'—':(h+' h')]);
    });
    hoursRows.push(['TOTAL', hoursSum.toFixed(1).replace('.',',')+' h']);
    doc.autoTable({
      startY:y,
      head:[['Día','Horas']],
      body:hoursRows,
      theme:'grid',
      styles:{fontSize:9,cellPadding:5,textColor:text},
      headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[252,250,255]},
      columnStyles:{1:{fontStyle:'bold'}},
      margin:{left:40,right:W/2}
    });
    y=doc.lastAutoTable.finalY+16;
    return y;
  }
  window.exportPDFSemana = function(){
    go(function(C){
      const from=document.getElementById('range-from').value;
      const to=document.getElementById('range-to').value;
      const days=C.daysInRange(from,to);
      try {
        const { jsPDF } = window.jspdf;
        const doc=new jsPDF({unit:'pt',format:'a4'});
        const W=doc.internal.pageSize.getWidth();
        const pink=[236,72,153], purple=[124,58,160], lilac=[248,244,255];
        const text=[35,28,48], muted=[110,95,125];
        const colors={pink:pink,purple:purple,lilac:lilac,text:text,muted:muted};
        doc.setFillColor(...lilac); doc.rect(0,0,W,70,'F');
        doc.setFillColor(...purple); doc.roundedRect(40,18,Math.min(280,W-80),18,9,9,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
        doc.text(('Semana del '+fmtRangeES(from,to)).toUpperCase(),52,30);
        doc.setFillColor(...pink); doc.roundedRect(40,44,120,16,8,8,'F');
        doc.setFontSize(9); doc.setTextColor(255,255,255); doc.text('Cierre semanal',52,55);
        var y=88;
        y=drawWeekBlock(doc,C,days,'Resumen de la semana',y,W,colors);
        doc.setFontSize(8); doc.setTextColor(...muted);
        doc.text('Cierre semanal · '+fmtRangeES(from,to)+' · Bono según promedio del período',40,820);
        doc.save('cierre_semanal_'+from+'_'+to+'.pdf');
      } catch(err){ console.error(err); alert('Error PDF semanal'); }
    });
  };
  window.exportPDFQuincena = function(){
    go(function(C){
      const from=document.getElementById('range-from').value;
      const to=document.getElementById('range-to').value;
      const days=C.daysInRange(from,to);
      try {
        const { jsPDF } = window.jspdf;
        const doc=new jsPDF({unit:'pt',format:'a4'});
        const W=doc.internal.pageSize.getWidth();
        const pink=[236,72,153], purple=[124,58,160], lilac=[248,244,255];
        const text=[35,28,48], muted=[110,95,125];
        const colors={pink:pink,purple:purple,lilac:lilac,text:text,muted:muted};
        var weeks=[];
        for(var i=0;i<days.length;i+=7){ weeks.push(days.slice(i,i+7)); }
        if(!weeks.length) weeks=[days];
        doc.setFillColor(...lilac); doc.rect(0,0,W,70,'F');
        doc.setFillColor(...purple); doc.roundedRect(40,18,Math.min(300,W-80),18,9,9,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
        doc.text(('Quincena del '+fmtRangeES(from,to)).toUpperCase(),52,30);
        doc.setFillColor(...pink); doc.roundedRect(40,44,120,16,8,8,'F');
        doc.setFontSize(9); doc.setTextColor(255,255,255); doc.text('Cierre quincenal',52,55);
        var y=88;
        var weekBonuses={Mary:[],Laura:[],Valery:[]};
        weeks.forEach(function(wdays, idx){
          if(y>100){ doc.addPage(); doc.setFillColor(...lilac); doc.rect(0,0,W,26,'F'); doc.setFillColor(...pink); doc.roundedRect(40,7,120,13,6,6,'F'); doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text('CIERRE QUINCENAL',52,16); y=40; }
          var wFrom=wdays[0], wTo=wdays[wdays.length-1];
          y=drawWeekBlock(doc,C,wdays,'Semana '+(idx+1)+' · '+fmtRangeES(wFrom,wTo),y,W,colors);
          C.PEOPLE.forEach(function(person){
            var avg=avgOfDays(C,wdays,person);
            var b=person==='Mary'?C.bonoMary(avg):C.bonoLV(avg);
            weekBonuses[person].push({avg:avg,bonus:b.bonus,total:b.total,label:b.label});
          });
        });
        if(y>620){ doc.addPage(); y=40; }
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...purple);
        doc.text('Total quincena (semana 1 + semana 2)',40,y); y+=16;
        C.PEOPLE.forEach(function(person){
          var list=weekBonuses[person]||[];
          var sumBonus=0, sumTotal=0;
          list.forEach(function(x){ sumBonus+=x.bonus; sumTotal+=x.total; });
          var cur=person==='Mary'?'$':'R$';
          doc.setFillColor(255,255,255); doc.setDrawColor(230,220,245);
          doc.roundedRect(40,y,W-80,52,10,10,'FD');
          doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text);
          doc.text(person,55,y+16);
          doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...muted);
          var detail=list.map(function(x,i){ return 'S'+(i+1)+': prom '+(x.avg==null?'—':x.avg.toFixed(2).replace('.',','))+' · bono +'+cur+x.bonus; }).join('   |   ');
          doc.text(detail,55,y+30);
          doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...pink);
          doc.text('Bonos: +'+cur+sumBonus+'   ·   Total a pagar: '+cur+sumTotal,55,y+46);
          y+=62;
        });
        doc.setFontSize(8); doc.setTextColor(...muted);
        doc.text('Cierre quincenal · '+fmtRangeES(from,to)+' · Cada semana calcula su propio bono; el total suma ambas',40,820);
        doc.save('cierre_quincenal_'+from+'_'+to+'.pdf');
      } catch(err){ console.error(err); alert('Error PDF quincenal'); }
    });
  };
})();

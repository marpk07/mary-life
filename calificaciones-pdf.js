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
        const purple=[124,58,160], purpleSoft=[167,139,250], lilac=[245,243,255], text=[35,28,48], muted=[110,95,125];
        function card(x,y,w,h){ doc.setFillColor(255,255,255); doc.setDrawColor(220,210,240); doc.roundedRect(x,y,w,h,10,10,'FD'); }
        function section(str,y){ doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...purple); doc.text(str,40,y); return y+14; }
        function pageHeader(){
          doc.setFillColor(...lilac); doc.rect(0,0,W,28,'F');
          doc.setFillColor(...purple); doc.roundedRect(40,8,120,14,7,7,'F');
          doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
          doc.text('CIERRE DIARIO',50,18);
        }
        doc.setFillColor(...lilac); doc.rect(0,0,W,70,'F');
        doc.setFillColor(...purple); doc.roundedRect(40,22,200,18,9,9,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
        doc.text(C.fmtDateLong(day).toUpperCase(),50,34);
        doc.setFontSize(18); doc.setTextColor(...text); doc.text('Cierre diario',40,58);
        let y=90;
        y=section('Mis actividades del día · autoevaluación',y);
        const maryN=C.consolidatedNote(day,'Mary');
        const maryActs=C.linesToBullets(d.activities.Mary);
        const cardH=Math.min(40+Math.max(maryActs.length,1)*14+55,230);
        card(40,y,W-80,cardH);
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text('Mary',55,y+18);
        let ly=y+32; doc.setFont('helvetica','normal'); doc.setFontSize(9);
        if(maryActs.length){ maryActs.forEach(function(a){ const lines=doc.splitTextToSize('• '+a,W-180); doc.setTextColor(...text); doc.text(lines,55,ly); ly+=lines.length*12; }); }
        else { doc.setTextColor(...muted); doc.text('• Sin actividades registradas',55,ly); }
        doc.setFillColor(...lilac); doc.roundedRect(W-150,y+12,90,36,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(...muted); doc.text('AUTOEVAL.',W-140,y+24);
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(...purple);
        doc.text(maryN.total!=null?maryN.total.toFixed(1).replace('.',','):'—',W-140,y+42);
        doc.setFontSize(8); doc.setTextColor(...muted); doc.text('/10',W-100,y+42);
        if(maryN.prod!=null){
          doc.setFontSize(7); doc.setTextColor(...muted);
          doc.text('P '+maryN.prod.toFixed(1).replace('.',',')+' · Pr '+(maryN.proact!=null?maryN.proact.toFixed(1).replace('.',','):'0')+' · D -'+(maryN.disc!=null?maryN.disc.toFixed(1).replace('.',','):'0'),W-150,y+52);
        }
        doc.setFillColor(...purple); doc.roundedRect(W-150,y+58,90,28,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(255,255,255); doc.text('TIEMPO',W-140,y+70);
        doc.setFont('helvetica','bold'); doc.setFontSize(12);
        doc.text(d.hoursMary!==''&&d.hoursMary!=null?('≈ '+d.hoursMary+' h'):'—',W-140,y+82);
        y+=cardH+12;
        y=section('Actividades del equipo',y);
        ['Laura','Valery'].forEach(function(p){
          const cn=C.consolidatedNote(day,p); const acts=C.linesToBullets(d.activities[p]);
          const h=Math.min(42+Math.max(acts.length,1)*13+12,150);
          card(40,y,W-80,h);
          doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text(p,55,y+16);
          let yy=y+28; doc.setFont('helvetica','normal'); doc.setFontSize(9);
          if(cn.absent){ doc.setTextColor(...muted); doc.text('• '+C.statusLabel(cn.status),55,yy); }
          else if(acts.length){ acts.slice(0,6).forEach(function(a){ const lines=doc.splitTextToSize('• '+a,W-180); doc.setTextColor(...text); doc.text(lines,55,yy); yy+=lines.length*11; }); }
          else { doc.setTextColor(...muted); doc.text('• Sin información registrada',55,yy); }
          doc.setFillColor(...lilac); doc.roundedRect(W-140,y+10,80,38,8,8,'F');
          doc.setFontSize(7); doc.setTextColor(...muted); doc.text('NOTA MARY',W-132,y+22);
          doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...purple);
          doc.text(cn.total!=null?cn.total.toFixed(1).replace('.',','):'—',W-132,y+36);
          if(cn.prod!=null){
            doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...muted);
            doc.text('P'+cn.prod.toFixed(1).replace('.',',')+' Pr'+(cn.proact!=null?cn.proact.toFixed(1).replace('.',','):'0')+' D-'+(cn.disc!=null?cn.disc.toFixed(1).replace('.',','):'0'),W-132,y+46);
          }
          y+=h+10; if(y>700){ doc.addPage(); pageHeader(); y=40; }
        });
        if(y>480){ doc.addPage(); pageHeader(); y=40; }
        y=section('Notas del equipo · día (matriz)',y);
        const matrixBody=C.PEOPLE.map(function(person){
          const sc=C.dayScores(day, person);
          function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1).replace('.',','); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return C.statusLabel(st); return '—'; }
          return [person, fWho('Mary'), fWho('Laura'), fWho('Valery'), sc.avg==null?'—':sc.avg.toFixed(1).replace('.',',')];
        });
        doc.autoTable({ startY:y, head:[['Evaluada','Mary','Laura','Valery','Prom. día']], body:matrixBody, theme:'grid', styles:{fontSize:9,cellPadding:6,textColor:text}, headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold',fontSize:9}, alternateRowStyles:{fillColor:[252,250,255]}, columnStyles:{0:{fontStyle:'bold'},4:{fontStyle:'bold',fontSize:10,textColor:purple}}, margin:{left:40,right:40} });
        y=doc.lastAutoTable.finalY+8;
        doc.setFontSize(7); doc.setTextColor(...muted);
        doc.text('Cada celda = nota que dio esa persona (columnas) a la evaluada (filas). Prom. = promedio del día.',40,y);
        y+=16;
        y=section('Notas que doy yo (Mary) · desglose',y);
        const body=C.PEOPLE.map(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent) return [p,'—','—','—',C.statusLabel(cn.status)];
          return [p, cn.prod!=null?cn.prod.toFixed(1).replace('.',','):'—', cn.proact!=null?cn.proact.toFixed(1).replace('.',','):'0,0', cn.disc!=null&&cn.disc>0?('-'+cn.disc.toFixed(1).replace('.',',')):'0,0', cn.total!=null?cn.total.toFixed(1).replace('.',','):'—'];
        });
        doc.autoTable({ startY:y, head:[['Colaboradora','Productividad','Proactividad','Descuentos','Nota final']], body:body, theme:'grid', styles:{fontSize:9,cellPadding:6,textColor:text}, headStyles:{fillColor:lilac,textColor:purple,fontStyle:'bold',fontSize:9}, alternateRowStyles:{fillColor:[252,250,255]}, columnStyles:{4:{fontStyle:'bold',fontSize:11,textColor:purple}}, margin:{left:40,right:40} });
        y=doc.lastAutoTable.finalY+16;
        y=section('Descuentos del día',y);
        C.PEOPLE.forEach(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent){ doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': '+C.statusLabel(cn.status),50,y); y+=14; return; }
          if(cn.discounts&&cn.discounts.length){ cn.discounts.forEach(function(x){ var amt=Math.abs(C.num(x.amount)); doc.setFontSize(9); doc.setTextColor(...purple); doc.setFont('helvetica','bold'); doc.text('-'+amt.toFixed(1).replace('.',','),50,y); doc.setFont('helvetica','normal'); doc.setTextColor(...text); doc.text(p+' · '+(x.reason||''),78,y); y+=13; }); }
          else { doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': sin descuentos',50,y); y+=13; }
        });
        y+=10; if(y>680){ doc.addPage(); pageHeader(); y=40; }
        y=section('Estado de pendientes abiertos',y);
        (store.openPendientesMaster||[]).filter(p=>p.status!=='cerrado'&&(p.title||'').trim()).forEach(function(p){
          if(y>750){ doc.addPage(); pageHeader(); y=40; }
          var st=p.status||'pendiente';
          var stColor = st==='en_espera'?purpleSoft:(st==='en_proceso'?[124,58,160]:(st==='sin_novedades'?muted:[140,100,180]));
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...text);
          doc.text('• '+(p.title||''),50,y);
          var tw=doc.getTextWidth('• '+(p.title||''))+6;
          doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...stColor);
          doc.text(C.openStatusLabel(st),50+tw,y);
          y+=12;
          if(p.note&&String(p.note).trim()){
            doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...muted);
            var lines=doc.splitTextToSize(String(p.note).trim(),W-100);
            doc.text(lines,58,y); y+=lines.length*11+2;
          } else { y+=2; }
        });
        y+=12; y=section('Pendientes de mañana · equipo',y);
        C.PEOPLE.forEach(function(p){
          const pend=C.linesToBullets(d.pendientesManana[p]); if(!pend.length) return;
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...text); doc.text(p+':',50,y); y+=12;
          doc.setFont('helvetica','normal'); pend.forEach(function(x){ doc.text('• '+x,58,y); y+=12; });
        });
        if(d.hoursPending!==''&&d.hoursPending!=null){
          y+=10; doc.setFillColor(...purple); doc.roundedRect(40,y,W-80,36,10,10,'F');
          doc.setTextColor(255,255,255); doc.setFontSize(9); doc.text('Horas pendientes por recuperar',55,y+14);
          doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text(d.hoursPending+' h',55,y+30);
        }
        doc.setFontSize(8); doc.setTextColor(...muted);
        doc.text('Cierre diario · '+day+' · Nota = productividad + proactividad − descuentos',40,820);
        doc.save('cierre_diario_'+day+'.pdf');
      } catch(err){ console.error(err); alert('Error PDF diario'); }
    });
  };
  window.exportPDFSemana = function(){
    go(function(C){
      const from=document.getElementById('range-from').value;
      const to=document.getElementById('range-to').value;
      const days=C.daysInRange(from,to);
      const store=C.getStore();
      try {
        const { jsPDF } = window.jspdf;
        const doc=new jsPDF({unit:'pt',format:'a4'});
        const text=[40,30,50], purple=[124,58,160];
        doc.setFontSize(16); doc.setTextColor(...text); doc.text('Cierre semanal / período',40,40);
        doc.setFontSize(10); doc.setTextColor(100); doc.text(from+' → '+to,40,56);
        let y=70;
        C.PEOPLE.forEach(function(person){
          const body=days.map(function(day){
            const sc=C.dayScores(day,person);
            function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(2); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return C.statusLabel(st); return '—'; }
            return [day.slice(5),fWho('Mary'),fWho('Laura'),fWho('Valery'),sc.avg==null?'—':sc.avg.toFixed(2)];
          });
          let sum=0,n=0; days.forEach(d=>{ const sc=C.dayScores(d,person); if(sc.avg!=null){sum+=sc.avg;n++;}});
          const avg=n?sum/n:null;
          doc.setFontSize(12); doc.setTextColor(...purple); doc.text(person+' · promedio '+(avg==null?'—':avg.toFixed(2)),40,y); y+=6;
          doc.autoTable({startY:y,head:[['Día','Mary','Laura','Valery','Prom.']],body:body,styles:{fontSize:8},headStyles:{fillColor:[245,243,255],textColor:purple},margin:{left:40,right:40}});
          y=doc.lastAutoTable.finalY+8;
          if(person==='Mary'){ const b=C.bonoMary(avg); doc.setFontSize(10); doc.setTextColor(...text); doc.text('Bono: +$'+b.bonus+' · Total: $'+b.total+' USD (base $25)',40,y); }
          else { const b=C.bonoLV(avg); doc.setFontSize(10); doc.setTextColor(...text); doc.text('Bono: +R$'+b.bonus+' · Total: R$'+b.total+' (base R$150)',40,y); }
          y+=22; if(y>700){ doc.addPage(); y=40; }
        });
        let hoursSum=0; days.forEach(function(day){ const d=store.days[day]; if(d&&d.hoursMary!==''&&d.hoursMary!=null) hoursSum+=C.num(d.hoursMary); });
        doc.setFontSize(11); doc.text('Horas Mary en el período: '+hoursSum.toFixed(1)+' h',40,y);
        doc.save('cierre_semanal_'+from+'_'+to+'.pdf');
      } catch(err){ console.error(err); alert('Error PDF semanal'); }
    });
  };
  window.exportPDFQuincena = function(){ window.exportPDFSemana(); };
})();

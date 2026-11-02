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
        const pink=[236,72,153], purple=[167,139,250], soft=[255,241,247], text=[40,30,50], muted=[120,100,130];
        function card(x,y,w,h){ doc.setFillColor(255,255,255); doc.setDrawColor(255,220,235); doc.roundedRect(x,y,w,h,10,10,'FD'); }
        function section(str,y){ doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...pink); doc.text(str,40,y); return y+14; }
        doc.setFillColor(...soft); doc.rect(0,0,W,70,'F');
        doc.setFillColor(...pink); doc.roundedRect(40,22,200,18,9,9,'F');
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
        doc.text(C.fmtDateLong(day).toUpperCase(),50,34);
        doc.setFontSize(18); doc.setTextColor(...text); doc.text('Cierre diario',40,58);
        let y=90;
        y=section('Mis actividades del día',y);
        const maryN=C.consolidatedNote(day,'Mary');
        const maryActs=C.linesToBullets(d.activities.Mary);
        const cardH=Math.min(40+Math.max(maryActs.length,1)*14+50,220);
        card(40,y,W-80,cardH);
        doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text('Mary',55,y+18);
        let ly=y+32; doc.setFont('helvetica','normal'); doc.setFontSize(9);
        if(maryActs.length){ maryActs.forEach(function(a){ const lines=doc.splitTextToSize('• '+a,W-180); doc.text(lines,55,ly); ly+=lines.length*12; }); }
        else { doc.setTextColor(...muted); doc.text('• Sin actividades registradas',55,ly); }
        doc.setFillColor(255,245,250); doc.roundedRect(W-150,y+12,90,36,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(...muted); doc.text('NOTA FINAL',W-140,y+24);
        doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(...pink);
        doc.text(maryN.total!=null?maryN.total.toFixed(1).replace('.',','):'—',W-140,y+42);
        doc.setFontSize(8); doc.setTextColor(...muted); doc.text('/10',W-100,y+42);
        doc.setFillColor(124,58,120); doc.roundedRect(W-150,y+54,90,28,8,8,'F');
        doc.setFontSize(7); doc.setTextColor(255,255,255); doc.text('TIEMPO',W-140,y+66);
        doc.setFont('helvetica','bold'); doc.setFontSize(12);
        doc.text(d.hoursMary!==''&&d.hoursMary!=null?('≈ '+d.hoursMary+' h'):'—',W-140,y+78);
        y+=cardH+12;
        y=section('Actividades del equipo',y);
        ['Laura','Valery'].forEach(function(p){
          const cn=C.consolidatedNote(day,p); const acts=C.linesToBullets(d.activities[p]);
          const h=Math.min(36+Math.max(acts.length,1)*13+10,140);
          card(40,y,W-80,h);
          doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...text); doc.text(p,55,y+16);
          let yy=y+28; doc.setFont('helvetica','normal'); doc.setFontSize(9);
          if(cn.absent){ doc.setTextColor(...muted); doc.text('• '+C.statusLabel(cn.status),55,yy); }
          else if(acts.length){ acts.slice(0,6).forEach(function(a){ const lines=doc.splitTextToSize('• '+a,W-180); doc.setTextColor(...text); doc.text(lines,55,yy); yy+=lines.length*11; }); }
          else { doc.setTextColor(...muted); doc.text('• Sin información registrada',55,yy); }
          doc.setFillColor(255,245,250); doc.roundedRect(W-140,y+10,80,32,8,8,'F');
          doc.setFontSize(7); doc.setTextColor(...muted); doc.text('NOTA FINAL',W-132,y+22);
          doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...pink);
          doc.text(cn.total!=null?cn.total.toFixed(1).replace('.',','):'—',W-132,y+36);
          y+=h+10; if(y>700){ doc.addPage(); y=40; }
        });
        if(y>500){ doc.addPage(); y=40; }
        y=section('Notas del día · Calificaciones',y);
        const body=C.PEOPLE.map(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent) return [p,'—','—','—',C.statusLabel(cn.status)];
          return [p, cn.prod!=null?cn.prod.toFixed(1).replace('.',','):'—', cn.proact!=null?cn.proact.toFixed(1).replace('.',','):'0,0', cn.disc!=null&&cn.disc>0?('-'+cn.disc.toFixed(1).replace('.',',')):'0,0', cn.total!=null?cn.total.toFixed(1).replace('.',','):'—'];
        });
        doc.autoTable({ startY:y, head:[['Colaboradora','Productividad','Proactividad','Descuentos','Nota final']], body:body, theme:'grid', styles:{fontSize:9,cellPadding:6,textColor:text}, headStyles:{fillColor:[255,241,247],textColor:pink,fontStyle:'bold'}, alternateRowStyles:{fillColor:[255,250,252]}, margin:{left:40,right:40} });
        y=doc.lastAutoTable.finalY+18;
        y=section('Descuentos del día',y);
        C.PEOPLE.forEach(function(p){
          const cn=C.consolidatedNote(day,p);
          if(cn.absent){ doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': '+C.statusLabel(cn.status),50,y); y+=14; return; }
          if(cn.discounts&&cn.discounts.length){ cn.discounts.forEach(function(x){ doc.setFontSize(9); doc.setTextColor(...pink); doc.text('−'+Math.abs(C.num(x.amount)).toFixed(1),50,y); doc.setTextColor(...text); doc.text(p+' · '+(x.reason||''),80,y); y+=13; }); }
          else { doc.setFontSize(9); doc.setTextColor(...muted); doc.text(p+': sin descuentos',50,y); y+=13; }
        });
        y+=10; if(y>680){ doc.addPage(); y=40; }
        y=section('Estado de pendientes abiertos',y);
        (store.openPendientesMaster||[]).filter(p=>p.status!=='cerrado'&&(p.title||'').trim()).forEach(function(p){
          doc.setFontSize(9); doc.setTextColor(...text);
          const lines=doc.splitTextToSize('• '+p.title+' — '+C.openStatusLabel(p.status)+(p.note?(' · '+p.note):''),W-90);
          doc.text(lines,50,y); y+=lines.length*12; if(y>750){ doc.addPage(); y=40; }
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
        const text=[40,30,50], pink=[236,72,153];
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
          doc.setFontSize(12); doc.setTextColor(...pink); doc.text(person+' · promedio '+(avg==null?'—':avg.toFixed(2)),40,y); y+=6;
          doc.autoTable({startY:y,head:[['Día','Mary','Laura','Valery','Prom.']],body:body,styles:{fontSize:8},headStyles:{fillColor:[255,241,247],textColor:pink},margin:{left:40,right:40}});
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

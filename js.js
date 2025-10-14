
    const STORAGE_KEY = 'pushup_sessions_v1';
    const sessEl = document.getElementById('sessionsCount');
    const maxEl = document.getElementById('currentMax');
    const repsInput = document.getElementById('repsInput');
    const recordBtn = document.getElementById('recordBtn');
    const testBtn = document.getElementById('testBtn');
    const resetBtn = document.getElementById('resetBtn');
    const exportBtn = document.getElementById('exportBtn');
    const suggestBtn = document.getElementById('suggestBtn');
    const downloadPlan = document.getElementById('downloadPlan');
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    function loadSessions() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
    }
    function saveSessions(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    function addSession(reps) {
      if (!Number.isFinite(reps) || reps < 1) return false;
      const s = loadSessions();
      s.push({ reps: Math.round(reps), at: new Date().toISOString() });
      saveSessions(s);
      render();
      return true;
    }

    function resetData() {
      if (confirm('Reset all saved pushup data?')) { localStorage.removeItem(STORAGE_KEY); render(); }
    }

    function exportCSV() {
      const s = loadSessions();
      if (!s.length) return alert('No data to export.');
      const rows = ['date,reps', ...s.map(it => `${it.at},${it.reps}`)];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'pushup_progress.csv'; a.click();
      URL.revokeObjectURL(url);
    }

    function render() {
      const s = loadSessions();
      sessEl.textContent = s.length;
      const max = s.length ? Math.max(...s.map(x => x.reps)) : 0;
      maxEl.textContent = max || '—';
      drawChart(s);
    }

    function drawChart(data) {
      const w = canvas.width = canvas.clientWidth * devicePixelRatio;
      const h = canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      ctx.save(); ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      if (!data.length) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '13px Poppins'; ctx.fillText('No data yet — record a set to start.', 12, 22); ctx.restore(); return; }
      const vals = data.map(d => d.reps);
      const maxVal = Math.max(...vals) + 2;
      const padding = 12;
      const chartW = canvas.clientWidth - padding * 2;
      const chartH = canvas.clientHeight - padding * 2;
      ctx.strokeStyle = 'rgba(160,32,240,0.3)'; ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((pt, idx) => {
        const x = padding + (chartW * (idx / (data.length - 1 || 1)));
        const y = padding + chartH * (1 - (pt.reps / maxVal));
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    }

    recordBtn.onclick = () => {
      const v = Number(repsInput.value);
      if (!v || v < 1) return alert('Enter a number of reps (1 or more).');
      addSession(v);
      repsInput.value = '';
    };
    testBtn.onclick = () => {
      const n = prompt('Enter your max pushups:');
      if (n === null) return;
      const val = Number(n);
      if (!val || val < 1) return alert('Please enter a valid number.');
      addSession(val);
      alert('Recorded successfully!');
    };
    resetBtn.onclick = resetData;
    exportBtn.onclick = exportCSV;
    suggestBtn.onclick = () => {
      const s = loadSessions();
      const max = s.length ? Math.max(...s.map(x => x.reps)) : 0;
      let msg = '';
      if (max <= 1) msg = 'Try 3 sets of incline pushups — 6 each.';
      else if (max <= 3) msg = '3 sets of knee pushups — 5–8 reps.';
      else if (max <= 8) msg = '3 sets of full pushups — 4–8 reps.';
      else msg = '3 sets at 70% of your max, finish with planks.';
      alert(msg);
    };
    downloadPlan.onclick = () => {
      const text = `8-Week Push-Up Plan\n\nWeeks 1-2: Incline/Knee Pushups (3x per week)\nWeeks 3-4: Mix Knee/Full + Negatives\nWeeks 5-6: Focus Full Pushups\nWeeks 7-8: Add Tempo & Finishers`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'pushup_plan.txt'; a.click(); URL.revokeObjectURL(url);
    };

    repsInput.addEventListener('keydown', e => { if (e.key === 'Enter') recordBtn.click(); });

    render();
(function () {
  const STORAGE_KEY = 'gamejam_submission_id';
  let submissionId = sessionStorage.getItem(STORAGE_KEY) || null;

  const steps = { 1: document.getElementById('step-1'), 2: document.getElementById('step-2'), 3: document.getElementById('step-3') };
  const done = document.getElementById('step-done');
  const tracker = document.getElementById('tracker');

  function showStep(n) {
    Object.values(steps).forEach((el) => (el.style.display = 'none'));
    done.style.display = 'none';
    if (n === 'done') {
      done.style.display = 'block';
    } else {
      steps[n].style.display = 'block';
    }
    updateTracker(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateTracker(n) {
    const dots = tracker.querySelectorAll('.tracker-step');
    const lines = tracker.querySelectorAll('.tracker-line');
    const current = n === 'done' ? 4 : n;
    dots.forEach((dot) => {
      const step = parseInt(dot.dataset.step, 10);
      dot.classList.remove('done', 'current');
      if (step < current) dot.classList.add('done');
      else if (step === current) dot.classList.add('current');
    });
    lines.forEach((line, i) => {
      line.classList.toggle('filled', i + 1 < current);
    });
  }

  function setError(field, show) {
    field.classList.toggle('error', show);
    const msg = field.querySelector('.error-msg');
    if (msg) msg.style.display = show ? 'block' : 'none';
  }

  function validateRequired(form, names) {
    let valid = true;
    names.forEach((name) => {
      const el = form.querySelector(`[name="${name}"]`);
      const field = el.closest('.field');
      let value = '';
      if (el.type === 'radio') {
        const checked = form.querySelector(`[name="${name}"]:checked`);
        value = checked ? checked.value : '';
      } else {
        value = el.value.trim();
      }
      if (!value) {
        setError(field, true);
        valid = false;
      } else {
        setError(field, false);
      }
    });
    return valid;
  }

  // Radio-card visual selection
  document.querySelectorAll('.radio-grid').forEach((grid) => {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.radio-card');
      if (!card) return;
      grid.querySelectorAll('.radio-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input').checked = true;
    });
  });

  async function postJSON(url, method, body) {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'خطایی رخ داد.');
    return data;
  }

  // ----- Step 1 -----
  document.getElementById('form-1').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateRequired(form, ['full_name', 'email', 'phone', 'city'])) return;

    const payload = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value.trim(),
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const data = await postJSON('/api/submissions', 'POST', payload);
      submissionId = data.id;
      sessionStorage.setItem(STORAGE_KEY, submissionId);
      showStep(2);
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ----- Step 2 -----
  document.getElementById('back-to-1').addEventListener('click', () => showStep(1));
  document.getElementById('form-2').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateRequired(form, ['experience_level', 'focus_area', 'target_platform', 'project_summary'])) return;

    const payload = {
      experience_level: form.experience_level.value,
      focus_area: form.focus_area.value,
      target_platform: form.target_platform.value,
      project_summary: form.project_summary.value.trim(),
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await postJSON(`/api/submissions/${submissionId}/step2`, 'PUT', payload);
      showStep(3);
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ----- Step 3 -----
  document.getElementById('back-to-2').addEventListener('click', () => showStep(2));
  document.getElementById('form-3').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateRequired(form, ['idea_name', 'genre', 'timeline'])) return;

    const payload = {
      idea_name: form.idea_name.value.trim(),
      genre: form.genre.value,
      timeline: form.timeline.value,
      portfolio_link: form.portfolio_link.value.trim(),
      extra_notes: form.extra_notes.value.trim(),
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await postJSON(`/api/submissions/${submissionId}/step3`, 'PUT', payload);
      sessionStorage.removeItem(STORAGE_KEY);
      showStep('done');
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  showStep(1);
})();

(function () {
  const STATUS_LABEL = {
    step1: 'در حال تکمیل — مرحله ۱',
    step2: 'در حال تکمیل — مرحله ۲',
    completed: 'تکمیل‌شده',
  };
  const STATUS_CLASS = { step1: 'status-step1', step2: 'status-step2', completed: 'status-completed' };

  const EXPERIENCE_LABEL = { beginner: 'تازه‌کار', intermediate: 'متوسط', advanced: 'پیشرفته', pro: 'حرفه‌ای' };
  const FOCUS_LABEL = { '2d': '۲بعدی', '2.5d': '۲.۵بعدی', '3d': '۳بعدی', vr: 'واقعیت مجازی' };
  const PLATFORM_LABEL = { android: 'اندروید', ios: 'iOS', desktop: 'دسکتاپ', web: 'وب', multi: 'چندپلتفرمی' };
  const GENRE_LABEL = { action: 'اکشن', puzzle: 'پازل', platformer: 'پلتفرمر', arcade: 'آرکید', strategy: 'استراتژی', other: 'سایر' };
  const TIMELINE_LABEL = { '1m': 'کمتر از ۱ ماه', '3m': '۱ تا ۳ ماه', '6m': '۳ تا ۶ ماه', '12m': 'بیش از ۶ ماه' };

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function fieldHTML(label, value) {
    const v = value ? value : '—';
    return `<div class="record-field"><div class="k">${label}</div><div class="v ${value ? '' : 'empty'}">${v}</div></div>`;
  }

  function renderRecord(r) {
    const fields = [];
    fields.push(fieldHTML('ایمیل', r.email));
    fields.push(fieldHTML('تماس', r.phone));
    fields.push(fieldHTML('شهر', r.city));
    if (r.experience_level) fields.push(fieldHTML('تجربه', EXPERIENCE_LABEL[r.experience_level] || r.experience_level));
    if (r.focus_area) fields.push(fieldHTML('حوزه', FOCUS_LABEL[r.focus_area] || r.focus_area));
    if (r.target_platform) fields.push(fieldHTML('پلتفرم هدف', PLATFORM_LABEL[r.target_platform] || r.target_platform));
    if (r.idea_name) fields.push(fieldHTML('نام پروژه', r.idea_name));
    if (r.genre) fields.push(fieldHTML('ژانر', GENRE_LABEL[r.genre] || r.genre));
    if (r.timeline) fields.push(fieldHTML('بازه زمانی', TIMELINE_LABEL[r.timeline] || r.timeline));
    if (r.portfolio_link) fields.push(fieldHTML('نمونه‌کار', `<a href="${r.portfolio_link}" target="_blank" rel="noopener">مشاهده لینک</a>`));

    const notes = [r.project_summary, r.extra_notes].filter(Boolean).join(' — ');

    return `
      <div class="record">
        <div class="record-top">
          <div>
            <div class="record-name">${r.full_name || 'بدون نام'}</div>
            <div class="record-meta">ثبت شده در ${fmtDate(r.created_at)} · آخرین به‌روزرسانی ${fmtDate(r.updated_at)}</div>
          </div>
          <span class="status-pill ${STATUS_CLASS[r.status] || ''}">${STATUS_LABEL[r.status] || r.status}</span>
        </div>
        <div class="record-grid">${fields.join('')}</div>
        ${notes ? `<div class="record-meta" style="margin-top:14px; line-height:1.7;">${notes}</div>` : ''}
      </div>
    `;
  }

  async function load() {
    const container = document.getElementById('records');
    try {
      const res = await fetch('/api/submissions');
      const rows = await res.json();
      if (!rows.length) {
        container.outerHTML = `<div class="empty-state">هنوز هیچ ثبت‌نامی وجود ندارد. <a href="form.html">اولین ثبت‌نام رو شروع کنید ←</a></div>`;
        return;
      }
      container.innerHTML = rows.map(renderRecord).join('');
    } catch (err) {
      container.innerHTML = `<div class="empty-state">خطا در دریافت اطلاعات از سرور.</div>`;
    }
  }

  load();
})();

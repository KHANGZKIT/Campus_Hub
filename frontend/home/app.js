// Demo JS nhỏ gọn: toggle menu mobile + fake load news từ array (có thể thay bằng API sau này)
(function () {
    const btnMenu = document.getElementById('btnMenu');
    const nav = document.querySelector('.nav');
    btnMenu?.addEventListener('click', () => {
        const visible = getComputedStyle(nav).display !== 'none';
        nav.style.display = visible ? 'none' : 'flex';
    });

    // (Tuỳ chọn) Render news từ mảng — sau thay bằng fetch('/api/announcements')
    const newsData = [
        { date: '2024-04-24', title: 'Thông báo nghỉ học ngày 30/4', link: '#' },
        { date: '2024-04-21', title: 'Giờ mở cửa thư viện tuần này', link: '#' },
        { date: '2024-04-18', title: 'Cập nhật đăng ký học phần', link: '#' },
    ];
    const ul = document.querySelector('.news');
    if (ul && ul.children.length <= 3) {
        ul.innerHTML = newsData.map(n => `
      <li>
        <time>${formatVN(n.date)}</time>
        <div>
          <a href="${n.link}">${escapeHtml(n.title)}</a>
          <div><a class="link" href="${n.link}">Xem chi tiết</a></div>
        </div>
      </li>`).join('');
    }

    function formatVN(iso) {
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
    }
    function escapeHtml(s) { return s.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m])); }
})();

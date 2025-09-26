// ===== CONFIG =====
const API_BASE = localStorage.getItem('API_URL') || 'http://localhost:5000/api';
const TOKEN = () => localStorage.getItem('token'); // dán JWT vào đây qua nút "Dán token"
const USE_CLIENT_FILTER = true; // lọc q/capacity ở FE nếu BE chưa hỗ trợ query

// ===== UTIL =====
const $ = (s, el = document) => el.querySelector(s);
const byId = id => document.getElementById(id);
const fmtDateInput = d => {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toISO = (dateStr, timeStr) => {
    // Gộp thành ISO UTC (phù hợp Prisma DateTime)
    // '2025-09-25','08:00' -> new Date(...).toISOString()
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return d.toISOString();
};
const unwrap = (data) => data?.data ?? data?.items ?? data ?? [];

// ===== INIT FILTERS =====
byId('date').value = fmtDateInput(new Date());

// ===== API WRAPPER =====
async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { 'Content-Type': 'application/json', ...(TOKEN() ? { Authorization: `Bearer ${TOKEN()}` } : {}) },
        ...options
    });
    if (!res.ok) {
        let msg = '';
        try { msg = await res.text(); } catch { }
        throw new Error(msg || res.statusText);
    }
    try { return await res.json(); } catch { return {}; }
}

// ===== ROOMS (Public) =====
async function fetchRoomsFromApi() {
    // Nếu BE có validateQuery(listRoomsQuerySchema) dùng q & capacity_min:
    // const qs = new URLSearchParams({ q, capacity_min }).toString()
    // return unwrap(await api('/rooms' + (qs?`?${qs}`:'')));
    return unwrap(await api('/rooms')); // đơn giản: lấy tất cả, lọc ở FE
}

// ===== BOOKINGS (Auth) =====
async function createBooking({ roomId, startsAt, endsAt, people, note }) {
    // POST /api/bookings (auth) — body theo Prisma
    const payload = { roomId, startsAt, endsAt, people, note };
    return await api('/bookings', { method: 'POST', body: JSON.stringify(payload) });
}
async function fetchMyBookings() {
    // GET /api/bookings/my (auth)
    return unwrap(await api('/bookings/my'));
}
async function cancelBooking(id) {
    // PATCH /api/bookings/:id/cancel (auth)
    return await api(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({}) });
}

// ===== UI ROOMS =====
const elRooms = byId('rooms');
const elRoomsEmpty = byId('roomsEmpty');
let allRooms = [];

function applyClientFilter(list) {
    const capMin = Number(byId('capMin').value || 0);
    const keyword = byId('keyword').value.trim().toLowerCase();
    return list.filter(r => {
        const okCap = capMin ? (Number(r.capacity || 0) >= capMin) : true;
        const okKw = keyword ? ((r.name || '').toLowerCase().includes(keyword)) : true;
        return okCap && okKw;
    });
}

async function loadRooms() {
    elRooms.innerHTML = '';
    elRoomsEmpty.style.display = 'none';

    if (!allRooms.length) {
        try {
            allRooms = await fetchRoomsFromApi();
        } catch (e) {
            alert('Không tải được danh sách phòng: ' + e.message);
            return;
        }
    }

    const rooms = USE_CLIENT_FILTER ? applyClientFilter(allRooms) : allRooms;
    if (!rooms.length) { elRoomsEmpty.style.display = 'block'; return; }

    const date = byId('date').value;
    const start = byId('start').value;
    const end = byId('end').value;

    for (const r of rooms) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
      <h4 class="room-title">${r.name}</h4>
      <div class="meta">
        <span class="badge">Sức chứa: ${r.capacity ?? '-'}</span>
        <span class="badge success">Có thể đặt</span>
      </div>
      <p class="muted" style="margin:6px 0 0">${r.description || 'Phòng tự học yên tĩnh.'}</p>
      <footer>
        <small class="muted">${date} • ${start}–${end}</small>
        <div style="display:flex;gap:8px">
          <button class="btn" data-act="detail">Chi tiết</button>
          <button class="btn primary" data-act="book">Đặt phòng</button>
        </div>
      </footer>`;
        card.querySelector('[data-act="detail"]').addEventListener('click', () => alert(JSON.stringify(r, null, 2)));
        card.querySelector('[data-act="book"]').addEventListener('click', () => openBooking(r));
        elRooms.appendChild(card);
    }
}

// ===== UI MY BOOKINGS =====
const elMy = byId('myBookings');
const elMyEmpty = byId('myEmpty');

async function loadMyBookings() {
    elMy.innerHTML = '';
    let list = [];
    try { list = await fetchMyBookings(); } catch (e) { /* chưa có token */ }
    if (!list.length) { elMyEmpty.style.display = 'block'; return; }
    elMyEmpty.style.display = 'none';

    list.forEach(b => {
        const roomName = b.room?.name || b.roomName || `Room #${b.roomId}`;
        const starts = (b.startsAt ?? b.start ?? b.start_time ?? '').toString();
        const ends = (b.endsAt ?? b.end ?? b.end_time ?? '').toString();

        // Hiển thị gọn HH:mm & YYYY-MM-DD nếu nhận ISO
        const hhmm = iso => {
            if (!iso) return '';
            const d = new Date(iso);
            return isNaN(d) ? iso.slice(11, 16) : d.toISOString().slice(11, 16);
        };
        const ymd = iso => {
            if (!iso) return '';
            const d = new Date(iso);
            return isNaN(d) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
        };

        const li = document.createElement('li');
        li.innerHTML = `
      <div>
        <strong>${roomName}</strong>
        <div class="muted">${ymd(starts)} • ${hhmm(starts)}–${hhmm(ends)}</div>
      </div>
      <div style="display:flex;gap:8px">
        <span class="chip">${b.status || 'approved'}</span>
        <button class="btn" data-cancel="${b.id}">Hủy</button>
      </div>`;
        li.querySelector('[data-cancel]').addEventListener('click', async () => {
            if (confirm('Hủy đặt phòng này?')) {
                try { await cancelBooking(b.id); } catch (e) { alert('Hủy lỗi: ' + e.message); }
                await loadMyBookings();
            }
        });
        elMy.appendChild(li);
    });
}

// ===== BOOKING MODAL =====
const dlg = byId('dlg');
const state = { room: null };
function openBooking(room) {
    state.room = room;
    byId('dlgTitle').textContent = `Đặt phòng ${room.name}`;
    byId('dlgRoom').value = room.name;
    byId('dlgDate').value = byId('date').value;
    byId('dlgStart').value = byId('start').value;
    byId('dlgEnd').value = byId('end').value;
    dlg.showModal();
}
byId('dlgClose').addEventListener('click', () => dlg.close());
byId('dlgCancel').addEventListener('click', () => dlg.close());
byId('dlgSubmit').addEventListener('click', async () => {
    if (!TOKEN()) { alert('Cần dán JWT vào localStorage.token'); return; }
    const date = byId('dlgDate').value;
    const start = byId('dlgStart').value;
    const end = byId('dlgEnd').value;

    const payload = {
        roomId: state.room.id,
        startsAt: toISO(date, start),
        endsAt: toISO(date, end),
        people: Number(byId('dlgPeople').value) || 1,
        note: byId('dlgNote').value || ''
    };

    try {
        await createBooking(payload);
        dlg.close();
        alert('Đã tạo đặt phòng!');
        await loadMyBookings();
    } catch (e) {
        alert('Lỗi đặt phòng: ' + e.message);
    }
});

// ===== EVENTS =====
byId('btnSearch').addEventListener('click', async () => {
    // làm tươi danh sách từ API mỗi lần tìm
    allRooms = [];
    await loadRooms();
});
byId('btnClear').addEventListener('click', () => {
    byId('capMin').value = ''; byId('keyword').value = '';
    loadRooms();
});

// Auth (demo)
function refreshAuthUI() {
    const logged = !!TOKEN();
    byId('btnLogin').style.display = logged ? 'none' : 'inline-block';
    byId('btnLogout')?.style && (byId('btnLogout').style.display = logged ? 'inline-block' : 'none');
}
byId('btnLogin').addEventListener('click', () => {
    const t = prompt('Dán JWT của bạn (Authorization: Bearer <token>):', '');
    if (t) { localStorage.setItem('token', t); refreshAuthUI(); loadMyBookings(); }
});
const btnLogout = byId('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token'); refreshAuthUI(); loadMyBookings();
    });
}

// ===== BOOT =====
(async function boot() {
    byId('date').value = fmtDateInput(new Date());
    refreshAuthUI();
    await loadRooms();
    await loadMyBookings();
})();

// frontend/lib/api.js
(function (global) {
    const BASE_URL = (global.ENV && global.ENV.API_BASE_URL) || 'http://localhost:5000/api';

    function getToken() {
        return localStorage.getItem('accessToken');
    }

    async function request(path, { method = 'GET', headers = {}, body } = {}) {
        const h = { ...headers };

        // Chỉ set Content-Type khi có body
        let payload;
        if (body !== undefined) {
            h['Content-Type'] = 'application/json';
            payload = JSON.stringify(body);
        }

        // Gắn Bearer token nếu có
        const token = getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;

        let res;
        try {
            res = await fetch(`${BASE_URL}${path}`, {
                method,
                headers: h,
                body: payload,
                mode: 'cors',
            });
        } catch (networkErr) {
            // Lỗi mạng/CORS (không tới được server)
            const err = { status: 0, message: 'Network/CORS error', error: networkErr, method, path };
            console.error('[API NETWORK ERROR]', err);
            throw err;
        }

        // Đọc body an toàn (có thể rỗng 204/201)
        let data = null;
        let rawText = '';
        try {
            rawText = await res.text();
            if (rawText) data = JSON.parse(rawText);
        } catch {
            data = { raw: rawText }; // không phải JSON
        }

        // 401 → clear token
        if (res.status === 401) {
            localStorage.removeItem('accessToken');
        }

        // Không OK → ném lỗi có thông tin
        if (!res.ok) {
            const msg = (data && data.message) || res.statusText || `HTTP ${res.status}`;
            const err = {
                status: res.status,
                message: msg,
                data,
                method,
                path,
            };
            console.warn('[API ERROR]', err);
            throw err;
        }

        // OK
        return data;
    }

    global.API = {
        get: (p) => request(p, { method: 'GET' }),
        post: (p, b) => request(p, { method: 'POST', body: b }),
        patch: (p, b) => request(p, { method: 'PATCH', body: b }),
        del: (p) => request(p, { method: 'DELETE' }),
    };
})(window);

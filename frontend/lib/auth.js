// frontend/lib/auth.js
(function (global) {
    async function login(email, password) {
        const data = await API.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        return data;
    }
    async function me() {
        return API.get('/auth/me'); // { id,email,roles,... }
    }
    function logout() {
        localStorage.removeItem('accessToken');
        location.href = '../registerlogin/index.html';
    }
    function hasRole(profile, roles) {
        return Array.isArray(profile?.roles) && profile.roles.some(r => roles.includes(r));
    }
    function isAuthed() {
        return !!localStorage.getItem('accessToken');
    }
    global.Auth = { login, me, logout, hasRole, isAuthed };
})(window);

const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const loginTitle = document.querySelector(".title-login");
const registerTitle = document.querySelector(".title-register");
const signUpBtn = document.querySelector("#SignUpBtn");
const signInBtn = document.querySelector("#SignInBtn");

function loginFunction() {
    loginForm.style.left = "50%";
    loginForm.style.opacity = 1;
    registerForm.style.left = "150%";
    registerForm.style.opacity = 0;
    wrapper.style.height = "500px";
    loginTitle.style.top = "50%";
    loginTitle.style.opacity = 1;
    registerTitle.style.top = "50px";
    registerTitle.style.opacity = 0;
}

function registerFunction() {
    loginForm.style.left = "-50%";
    loginForm.style.opacity = 0;
    registerForm.style.left = "50%";
    registerForm.style.opacity = 1;
    wrapper.style.height = "580px";
    loginTitle.style.top = "-60px";
    loginTitle.style.opacity = 0;
    registerTitle.style.top = "50%";
    registerTitle.style.opacity = 1;
}

// nếu HTML dùng onclick="loginFunction()/registerFunction()" thì cần export ra global
window.loginFunction = loginFunction;
window.registerFunction = registerFunction;

// ====== Gọi API đăng nhập/đăng ký ======
document.getElementById('SignInBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('log-email').value.trim();
    const password = document.getElementById('log-pass').value;

    try {
        await Auth.login(email, password);          // lưu token
        const me = await Auth.me();                 // lấy role
        if (Auth.hasRole(me, ['admin', 'staff'])) {
            location.href = '/frontend/admin/dashboard.html';
        } else {
            location.href = '/frontend/home/homepage.html';
        }
    } catch (err) {
        alert(err?.data?.message || 'Đăng nhập thất bại');
    }
});

document.getElementById('SignUpBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-pass').value;
    const agree = document.getElementById('agree').checked;
    if (!agree) return alert('Bạn phải đồng ý điều khoản');

    // 👇 gửi cả fullName và name để khớp mọi schema phổ biến
    const body = { email, password, fullName, name: fullName };
    console.log('[REGISTER BODY]', body);

    try {
        await API.post('/auth/register', body);
        await Auth.login(email, password);
        const me = await Auth.me();
        if (Auth.hasRole(me, ['admin', 'staff'])) {
            location.href = '/frontend/admin/dashboard.html';
        } else {
            location.href = '/frontend/home/homepage.html';
        }
    } catch (err) {
        console.warn('[REGISTER FAIL]', err.data?.errors || err.data || err);
        alert(err?.data?.message || 'Đăng ký thất bại');
    }
});

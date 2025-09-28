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

const toggleLog = document.getElementById('matLog');
const contentLog = document.getElementById('log-pass');

toggleLog.addEventListener('click', () =>{
    if(contentLog.type === "password")
    {
        contentLog.type = "text";
        toggleLog.classList.remove('bx-show');
        toggleLog.classList.add('bx-hide');
    }
    else{
        contentLog.type = "password";
        toggleLog.classList.remove('bx-hide');
        toggleLog.classList.add('bx-show');
    }
});


const toggleReg = document.getElementById('matReg');
const contentReg = document.getElementById('reg-pass');
toggleReg.addEventListener('click', () =>{
    if(contentReg.type === "password")
    {
        contentReg.type = "text";
        toggleReg.classList.remove('bx-show');
        toggleReg.classList.add('bx-hide');
    }
    else{
        contentReg.type = "password";
        toggleReg.classList.remove('bx-hide');
        toggleReg.classList.add('bx-show');
    }
});
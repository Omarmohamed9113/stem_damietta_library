// 1. رسالة اختبار (إذا ظهرت لك على الموقع، فالكود يعمل 100%)
alert("تم تحديث الموقع بنجاح والكود يعمل الآن!");

// 2. التهيئة والربط مع Supabase
const supabase = window.supabase;
const supabaseUrl = 'https://lqnqqzsjlntjkxqoxkyp.supabase.co';
const supabaseAnonKey = 'sb_publishable_yQj1w7ZDSr1EmndXpta6Bw_nPNxaNs0';

const db = supabase.createClient(supabaseUrl, supabaseAnonKey);
console.log("تم الربط بنجاح مع قاعدة بيانات مكتبة STEM!");

const allowedDomain = '@stemdamietta.moe.edu.eg';

// 3. التحكم في الأزرار مباشرة (بدون انتظار)
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');

if (showLoginBtn && showRegisterBtn) {
    showLoginBtn.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        authMessage.innerText = '';
    });

    showRegisterBtn.addEventListener('click', () => {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        authMessage.innerText = '';
    });
}

// تسجيل حساب جديد
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (!email.endsWith(allowedDomain)) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'عذراً! يجب استخدام إيميل مدرسة STEM Damietta.';
            return;
        }

        signupBtn.innerText = 'جاري التسجيل...';
        
        const { data, error } = await db.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
        });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'خطأ: ' + error.message;
        } else {
            authMessage.style.color = 'green';
            authMessage.innerText = 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.';
            document.getElementById('registerForm').reset();
        }
        signupBtn.innerText = 'Create Account';
    });
}

// تسجيل الدخول
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email.endsWith(allowedDomain)) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'عذراً! يجب استخدام إيميل مدرسة STEM Damietta.';
            return;
        }

        loginBtn.innerText = 'جاري الدخول...';

        const { data, error } = await db.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'الإيميل أو كلمة المرور غير صحيحة.';
            loginBtn.innerText = 'Login';
        }
    });
}

// مراقبة حالة الدخول (لإظهار وإخفاء المكتبة)
db.auth.onAuthStateChange((event, session) => {
    const authSection = document.getElementById('authSection');
    const libraryDashboard = document.getElementById('libraryDashboard');
    const userInfoBadge = document.getElementById('userInfoBadge');
    const logoutBtn = document.getElementById('logoutBtn');

    if (session) {
        authSection.classList.add('hidden');
        libraryDashboard.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        userInfoBadge.classList.remove('hidden');
        userInfoBadge.innerText = '👤 ' + session.user.email.split('@')[0];
    } else {
        if(authSection) authSection.classList.remove('hidden');
        if(libraryDashboard) libraryDashboard.classList.add('hidden');
        if(logoutBtn) logoutBtn.classList.add('hidden');
        if(userInfoBadge) userInfoBadge.classList.add('hidden');
    }
});

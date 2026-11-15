console.log("🚀 جاري بدء تشغيل الموقع...");

// 1. الاتصال بقاعدة البيانات
const supabaseUrl = 'https://lqnqqzsjlntjkxqoxkyp.supabase.co';
const supabaseKey = 'sb_publishable_yQj1w7ZDSr1EmndXpta6Bw_nPNxaNs0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const allowedDomain = '@stemdamietta.moe.edu.eg';

// ننتظر حتى تحمل عناصر HTML ثم نشغل الأزرار
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ تم تحميل واجهة الموقع بنجاح.");

    // تعريف العناصر
    const authSection = document.getElementById('authSection');
    const libraryDashboard = document.getElementById('libraryDashboard');
    const authMessage = document.getElementById('authMessage');
    
    // أزرار التبديل بين الدخول والتسجيل
    document.getElementById('showLoginBtn').addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        authMessage.innerText = '';
    });

    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        authMessage.innerText = '';
    });

    // 2. كود إنشاء الحساب
    document.getElementById('signupBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (!email.endsWith(allowedDomain)) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'عذراً! يجب استخدام إيميل مدرسة STEM Damietta.';
            return;
        }

        authMessage.style.color = 'blue';
        authMessage.innerText = 'جاري التسجيل...';

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.innerText = error.message;
        } else {
            authMessage.style.color = 'green';
            authMessage.innerText = 'تم إنشاء الحساب! يمكنك الآن تسجيل الدخول.';
            document.getElementById('registerForm').reset();
        }
    });

    // 3. كود تسجيل الدخول
    document.getElementById('loginBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email.endsWith(allowedDomain)) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'عذراً! يجب استخدام إيميل مدرسة STEM Damietta.';
            return;
        }

        authMessage.style.color = 'blue';
        authMessage.innerText = 'جاري الدخول...';

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            authMessage.style.color = 'red';
            authMessage.innerText = 'الإيميل أو كلمة المرور غير صحيحة.';
        }
    });

    // 4. كود تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    // 5. مراقبة حالة المستخدم (من مسجل دخوله ومن لا)
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            // إخفاء صفحة الدخول وفتح المكتبة
            authSection.classList.add('hidden');
            libraryDashboard.classList.remove('hidden');
            document.getElementById('logoutBtn').classList.remove('hidden');
            document.getElementById('userInfoBadge').classList.remove('hidden');
            document.getElementById('userInfoBadge').innerText = '👤 ' + session.user.email.split('@')[0];
        } else {
            // العكس
            authSection.classList.remove('hidden');
            libraryDashboard.classList.add('hidden');
            document.getElementById('logoutBtn').classList.add('hidden');
            document.getElementById('userInfoBadge').classList.add('hidden');
        }
    });

    // 6. التحكم في نافذة رفع الكتب
    document.getElementById('openAddEbookModal').addEventListener('click', () => {
        document.getElementById('ebookModal').classList.remove('hidden');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('ebookModal').classList.add('hidden');
    });

    // 7. رفع ملف الـ PDF لقاعدة البيانات
    document.getElementById('uploadEbookBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const file = document.getElementById('ebFile').files[0];
        if (!file) return alert("اختر ملف PDF أولاً");

        const btn = document.getElementById('uploadEbookBtn');
        btn.innerText = "جاري الرفع...";
        btn.disabled = true;

        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('books').upload(fileName, file);

        if (error) {
            alert("خطأ في الرفع: " + error.message);
        } else {
            alert("تم رفع الكتاب بنجاح!");
            document.getElementById('ebookModal').classList.add('hidden');
            document.getElementById('addEbookForm').reset();
        }

        btn.innerText = "Upload Book";
        btn.disabled = false;
    });
});

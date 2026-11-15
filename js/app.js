// ==========================================
// 1. التهيئة والربط مع Supabase
// ==========================================
// استدعاء مكتبة Supabase التي تم تحميلها في ملف HTML
const supabase = window.supabase;

const supabaseUrl = 'https://lqnqqzsjlntjkxqoxkyp.supabase.co';
const supabaseAnonKey = 'sb_publishable_yQj1w7ZDSr1EmndXpta6Bw_nPNxaNs0';

const db = supabase.createClient(supabaseUrl, supabaseAnonKey);
console.log("تم الربط بنجاح مع قاعدة بيانات مكتبة STEM!");

const allowedDomain = '@stemdamietta.moe.edu.eg';

// ==========================================
// 2. التحكم في واجهة المستخدم (التنقل بين الصفحات)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // عناصر تبويبات الدخول والتسجيل
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');

    // التبديل بين نموذج الدخول والتسجيل
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

    // ==========================================
    // 3. نظام التسجيل والدخول
    // ==========================================
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
                options: {
                    data: { full_name: name } // حفظ اسم الطالب
                }
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
            // في حالة النجاح، سيتم التقاط التغيير بواسطة onAuthStateChange بالأسفل
        });
    }

    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await db.auth.signOut();
            window.location.reload(); // إعادة تحميل الصفحة للعودة لشاشة الدخول
        });
    }

    // ==========================================
    // 4. مراقبة حالة الدخول (لإظهار وإخفاء المكتبة)
    // ==========================================
    db.auth.onAuthStateChange((event, session) => {
        const authSection = document.getElementById('authSection');
        const libraryDashboard = document.getElementById('libraryDashboard');
        const userInfoBadge = document.getElementById('userInfoBadge');
        const logoutBtn = document.getElementById('logoutBtn');

        if (session) {
            // المستخدم مسجل دخوله: إخفاء شاشة الدخول وإظهار المكتبة
            authSection.classList.add('hidden');
            libraryDashboard.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            userInfoBadge.classList.remove('hidden');
            
            // عرض اسم أو إيميل المستخدم في الشريط العلوي
            const userEmail = session.user.email;
            userInfoBadge.innerText = '👤 ' + userEmail.split('@')[0]; // عرض الاسم الأول من الإيميل
        } else {
            // المستخدم غير مسجل
            authSection.classList.remove('hidden');
            libraryDashboard.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            userInfoBadge.classList.add('hidden');
        }
    });

    // ==========================================
    // 5. رفع الكتب الإلكترونية (PDF)
    // ==========================================
    const uploadEbookBtn = document.getElementById('uploadEbookBtn');
    if (uploadEbookBtn) {
        uploadEbookBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('ebFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('يرجى اختيار ملف الـ PDF أولاً.');
                return;
            }

            uploadEbookBtn.innerText = 'جاري الرفع... الرجاء الانتظار';
            uploadEbookBtn.disabled = true;

            // توليد اسم فريد للملف لمنع تكرار الأسماء
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // الرفع إلى Supabase Storage (مجلد books)
            const { data, error } = await db.storage
                .from('books')
                .upload(fileName, file);

            if (error) {
                alert('حدث خطأ أثناء الرفع: ' + error.message);
            } else {
                // استخراج الرابط المباشر للملف
                const { data: publicUrlData } = db.storage.from('books').getPublicUrl(fileName);
                const bookUrl = publicUrlData.publicUrl;
                
                alert('تم رفع الكتاب بنجاح! الرابط: ' + bookUrl);
                
                // تنظيف النموذج وإغلاق النافذة
                document.getElementById('addEbookForm').reset();
                document.getElementById('ebookModal').classList.add('hidden');
                
                // *هنا لاحقاً يمكننا إضافة كود لحفظ بيانات الكتاب في جدول قواعد البيانات*
            }

            uploadEbookBtn.innerText = 'Upload Book';
            uploadEbookBtn.disabled = false;
        });
    }

    // كود بسيط لفتح وإغلاق نافذة رفع الكتاب
    const openAddEbookModal = document.getElementById('openAddEbookModal');
    const ebookModal = document.getElementById('ebookModal');
    const closeButtons = document.querySelectorAll('.close-modal');

    if (openAddEbookModal) {
        openAddEbookModal.addEventListener('click', () => {
            ebookModal.classList.remove('hidden');
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-close');
            document.getElementById(modalId).classList.add('hidden');
        });
    });
});
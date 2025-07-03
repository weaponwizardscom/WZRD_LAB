document.addEventListener("DOMContentLoaded", () => {
    // Sprawdź, czy Firebase jest dostępne
    if (!window.firebaseAuth) {
        console.error("Firebase nie zostało zainicjowane!");
        return;
    }

    // Korzystaj z gotowych obiektów udostępnionych przez firebase-init.js
    const auth = window.firebaseAuth;
    const db = window.firebaseDb;
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // === MANIFEST ZASOBÓW DO PRELOADOWANIA ===
    const ASSET_MANIFEST = [
        'img/other/logo.png', 'img/other/icon_pistol.png', 'img/other/icon_rifle.png', 'img/other/icon_shotgun.png',
        'img/glock17.png', 'img/cz_texture.png', 'img/sig_texture.png',
        'img/t1.png', 'img/t2.png', 'img/t3.png', 'img/t4.png', 'img/t5.png', 'img/t6.png', 'img/t7.png',
        'img/cz1.png', 'img/cz2.png', 'img/cz3.png', 'img/cz4.png',
        'img/other/camo_alpha.jpeg', 'img/other/camo_charlie.jpeg',
        'g17.svg', 'sig.svg', 'cz.svg'
    ];

    // === TŁUMACZENIA ===
    const translations = {
        pl: {
            login_tab: "Logowanie", register_tab: "Rejestracja", welcome_back: "Witaj z powrotem!",
            create_account: "Stwórz konto", or_divider: "LUB", login_button: "Zaloguj się",
            register_button: "Zarejestruj się", google_login_button: "Zaloguj się z Google",
            choose_weapon: "WYBIERZ RODZAJ BRONI", email_placeholder: "E-mail", password_placeholder: "Hasło",
            name_placeholder: "Imię", password_min_char_placeholder: "Hasło (min. 6 znaków)",
            phone_optional_placeholder: "Telefon (opcjonalnie)", invalid_credentials_error: "Nieprawidłowy e-mail lub hasło.",
            forgot_password: "Zapomniałeś hasła?",
            password_reset_prompt: "Podaj swój adres e-mail, aby zresetować hasło:",
            password_reset_success: "Link do resetu hasła został wysłany na Twój e-mail.",
            password_reset_error: "Błąd: Nie udało się wysłać linku. Sprawdź adres e-mail."
        },
        en: {
            login_tab: "Login", register_tab: "Register", welcome_back: "Welcome back!",
            create_account: "Create Account", or_divider: "OR", login_button: "Log In",
            register_button: "Register", google_login_button: "Sign in with Google",
            choose_weapon: "CHOOSE YOUR WEAPON", email_placeholder: "E-mail", password_placeholder: "Password",
            name_placeholder: "Name", password_min_char_placeholder: "Password (min. 6 characters)",
            phone_optional_placeholder: "Phone (optional)", invalid_credentials_error: "Invalid email or password.",
            forgot_password: "Forgot password?",
            password_reset_prompt: "Enter your e-mail address to reset your password:",
            password_reset_success: "A password reset link has been sent to your e-mail.",
            password_reset_error: "Error: Could not send the link. Check the e-mail address."
        }
    };

    // === ELEMENTY DOM ===
    const assetPreloader = document.getElementById('asset-preloader');
    const langPreloader = document.getElementById('lang-preloader');
    const mainContent = document.getElementById('main-content');
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const errorMsg = document.getElementById('auth-error-msg');
    const langPlBtn = document.getElementById('pl-lang');
    const langEnBtn = document.getElementById('en-lang');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    let currentLang = localStorage.getItem('lang') || 'pl';

    // === FUNKCJE ===
    function preloadAssets(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                const fileExtension = url.split('.').pop().toLowerCase();
                if (['png', 'jpeg', 'jpg', 'gif'].includes(fileExtension)) {
                    const img = new Image(); img.src = url; img.onload = resolve; img.onerror = resolve;
                } else if (fileExtension === 'svg') {
                    fetch(url, { cache: 'force-cache' }).then(() => resolve()).catch(() => resolve());
                } else { resolve(); }
            });
        });
        return Promise.all(promises);
    }
    
    function translatePage(lang) {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.dataset.translate;
            if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
        });
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.dataset.translatePlaceholder;
            if (translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
        });
        document.documentElement.lang = lang;
        langPlBtn.classList.toggle('active', lang === 'pl');
        langEnBtn.classList.toggle('active', lang === 'en');
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        translatePage(lang);
        if (!auth.currentUser) {
            langPreloader.classList.add('hidden');
            authModal.classList.remove('hidden');
        }
    }

    // === INICJALIZACJA I LOGIKA PRZEPŁYWU ===
    translatePage(currentLang);
    langPlBtn.addEventListener('click', () => setLanguage('pl'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));
    const assetLoadingPromise = preloadAssets(ASSET_MANIFEST);

    auth.onAuthStateChanged(async user => {
        await assetLoadingPromise;
        assetPreloader.classList.add('hidden');

        if (user) {
            langPreloader.classList.add('hidden');
            authModal.classList.add('hidden');
            mainContent.classList.remove('hidden');
        } else {
            langPreloader.classList.remove('hidden');
        }
    });

    // === LOGIKA FORMULARZY I ODZYSKIWANIA HASŁA ===
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active'); tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
        errorMsg.textContent = '';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active'); tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
        errorMsg.textContent = '';
    });

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt(translations[currentLang].password_reset_prompt);
        if (email) {
            auth.languageCode = currentLang;
            const actionCodeSettings = {
                url: `https://wzrd-lab.web.app/action.html?lang=${currentLang}`,
            };
            auth.sendPasswordResetEmail(email, actionCodeSettings)
                .then(() => {
                    alert(translations[currentLang].password_reset_success);
                })
                .catch((error) => {
                    console.error("Błąd resetowania hasła:", error);
                    alert(translations[currentLang].password_reset_error);
                });
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                return user.updateProfile({ displayName: name })
                    .then(() => db.collection('users').doc(user.uid).set({
                        name: name, email: email, phone: phone,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
            })
            .catch(error => { errorMsg.textContent = error.message; });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                errorMsg.textContent = translations[currentLang].invalid_credentials_error;
            });
    });

    // ZAKTUALIZOWANA LOGIKA LOGOWANIA GOOGLE
    googleLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider)
            .then(result => {
                // Sprawdź, czy to nowy użytkownik i stwórz dla niego wpis w bazie danych
                if (result.additionalUserInfo.isNewUser) {
                    const user = result.user;
                    return db.collection('users').doc(user.uid).set({
                        name: user.displayName,
                        email: user.email,
                        phone: user.phoneNumber || '',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .catch(error => { 
                console.error("Błąd logowania Google:", error);
                errorMsg.textContent = error.message; 
            });
    });
});
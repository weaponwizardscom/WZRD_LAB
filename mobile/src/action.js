document.addEventListener('DOMContentLoaded', () => {
    // Sprawdź, czy Firebase zostało poprawnie zainicjowane przez firebase-init.js
    if (!window.firebaseAuth) {
        console.error("Firebase nie zostało zainicjowane!");
        document.body.innerHTML = '<h1>Błąd krytyczny aplikacji</h1>';
        return;
    }
    const auth = window.firebaseAuth;

    const translations = {
        pl: {
            verifying: "Weryfikacja...", reset_title: "Resetuj hasło", for_user: "dla",
            new_password_placeholder: "Nowe hasło", save_password_btn: "Zapisz nowe hasło",
            success_msg: "Hasło zostało zmienione! Za chwilę nastąpi przekierowanie...",
            error_invalid_link: "Błąd: Nieprawidłowy lub wygasły link do resetowania hasła.",
            error_generic: "Błąd: Nie udało się zresetować hasła. Spróbuj ponownie.",
            error_no_code: "Błąd: Brak kodu akcji w adresie URL."
        },
        en: {
            verifying: "Verifying...", reset_title: "Reset password", for_user: "for",
            new_password_placeholder: "New password", save_password_btn: "Save new password",
            success_msg: "Password changed successfully! Redirecting shortly...",
            error_invalid_link: "Error: Invalid or expired password reset link.",
            error_generic: "Error: Could not reset password. Please try again.",
            error_no_code: "Error: Missing action code in URL."
        }
    };

    const loadingView = document.getElementById('loading-view');
    const resetView = document.getElementById('reset-view');
    const userEmailEl = document.getElementById('user-email');
    const resetForm = document.getElementById('reset-form');
    const newPasswordEl = document.getElementById('new-password');
    const messageDisplay = document.getElementById('message-display');

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const actionCode = params.get('oobCode');
    const lang = params.get('lang') || 'pl';

    // Tłumaczenie strony
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if(translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
    });
     document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.dataset.translatePlaceholder;
        if(translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
    });

    if (mode === 'resetPassword' && actionCode) {
        auth.verifyPasswordResetCode(actionCode).then(email => {
            userEmailEl.textContent = email;
            loadingView.classList.add('hidden');
            resetView.classList.remove('hidden');
        }).catch(error => {
            loadingView.classList.add('hidden');
            messageDisplay.textContent = translations[lang].error_invalid_link;
            messageDisplay.classList.add('error');
        });

        resetForm.addEventListener('submit', e => {
            e.preventDefault();
            const newPassword = newPasswordEl.value;
            auth.confirmPasswordReset(actionCode, newPassword).then(() => {
                resetView.classList.add('hidden');
                messageDisplay.textContent = translations[lang].success_msg;
                messageDisplay.classList.add('success');
                setTimeout(() => { window.location.href = 'index.html'; }, 3000);
            }).catch(error => {
                messageDisplay.textContent = translations[lang].error_generic;
                messageDisplay.classList.add('error');
            });
        });
    } else {
        loadingView.classList.add('hidden');
        messageDisplay.textContent = translations[lang].error_no_code;
        messageDisplay.classList.add('error');
    }
});
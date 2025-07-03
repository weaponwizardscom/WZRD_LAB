document.addEventListener('DOMContentLoaded', () => {
    if (!window.firebaseAuth || !window.firebaseDb) {
        console.error("Firebase nie zostało zainicjowane!");
        return;
    }

    const auth = window.firebaseAuth;
    const db = window.firebaseDb;
    
    const translations = {
        pl: {
            my_profile: "Mój Profil", logout: "Wyloguj", your_data: "Twoje dane", name_label: "Imię / Nazwa",
            email_label: "E-mail", phone_label: "Telefon", save_changes: "Zapisz zmiany",
            details_update_success: "Dane zaktualizowane pomyślnie!", details_update_error: "Wystąpił błąd podczas zapisu zmian.",
            change_password_title: "Zmiana hasła", new_password_label: "Nowe hasło", change_password_btn: "Zmień hasło",
            password_update_success: "Hasło zostało zmienione pomyślnie.",
            password_update_error_reauth: "Błąd: Ta operacja wymaga niedawnego zalogowania. Wyloguj się i zaloguj ponownie.",
            password_update_error_generic: "Wystąpił błąd. Spróbuj ponownie.",
            return_btn: "Powrót",
            reauth_title: "Potwierdź swoją tożsamość", reauth_prompt: "Aby kontynuować, wpisz swoje obecne hasło.",
            password_label: "Obecne hasło", confirm_btn: "Potwierdź", cancel_btn: "Anuluj",
            reauth_wrong_password_error: "Nieprawidłowe hasło. Spróbuj ponownie."
        },
        en: {
            my_profile: "My Profile", logout: "Logout", your_data: "Your Data", name_label: "Name / Nickname",
            email_label: "E-mail", phone_label: "Phone", save_changes: "Save Changes",
            details_update_success: "Details updated successfully!", details_update_error: "An error occurred while saving changes.",
            change_password_title: "Change Password", new_password_label: "New Password", change_password_btn: "Change Password",
            password_update_success: "Password changed successfully.",
            password_update_error_reauth: "Error: This operation requires a recent login. Please log out and log in again.",
            password_update_error_generic: "An error occurred. Please try again.",
            return_btn: "Return",
            reauth_title: "Confirm Your Identity", reauth_prompt: "To continue, please enter your current password.",
            password_label: "Current password", confirm_btn: "Confirm", cancel_btn: "Cancel",
            reauth_wrong_password_error: "Incorrect password. Please try again."
        }
    };
    
    let currentLang = localStorage.getItem('lang') || 'pl';
    
    function translatePage(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.dataset.translate;
            if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
        });
    }

    translatePage(currentLang);

    // Elementy UI
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const newPasswordInput = document.getElementById('profile-new-password');
    const detailsForm = document.getElementById('update-details-form');
    const passwordForm = document.getElementById('update-password-form');
    const detailsMessage = document.getElementById('details-message');
    const passwordMessage = document.getElementById('password-message');
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutBtn = document.getElementById('logout-btn');
    const returnBtn = document.getElementById('return-btn');
    const reauthModal = document.getElementById('reauth-modal');
    const reauthForm = document.getElementById('reauth-form');
    const reauthPasswordInput = document.getElementById('reauth-password');
    const reauthCancelBtn = document.getElementById('reauth-cancel-btn');
    const reauthMessage = document.getElementById('reauth-message');

    let currentUser = null;

    // DODANA OBSŁUGA PRZYCISKU "POWRÓT"
    if(returnBtn) {
        returnBtn.addEventListener('click', () => {
            history.back();
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            translatePage(currentLang);
            if (userNameDisplay) userNameDisplay.textContent = user.displayName;
            if (logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());
            nameInput.value = user.displayName || '';
            emailInput.value = user.email || '';
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().phone) {
                    phoneInput.value = doc.data().phone;
                }
            });
        }
    });

    detailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        detailsMessage.textContent = '';
        detailsMessage.className = 'message';
        const newName = nameInput.value;
        const newPhone = phoneInput.value;
        const profileUpdatePromise = currentUser.updateProfile({ displayName: newName });
        const firestoreUpdatePromise = db.collection('users').doc(currentUser.uid).set({ name: newName, phone: newPhone }, { merge: true });

        Promise.all([profileUpdatePromise, firestoreUpdatePromise]).then(() => {
            detailsMessage.textContent = translations[currentLang].details_update_success;
            detailsMessage.classList.add('success');
            if (userNameDisplay) userNameDisplay.textContent = newName;
        }).catch(error => {
            console.error("Błąd aktualizacji danych:", error);
            detailsMessage.textContent = translations[currentLang].details_update_error;
            detailsMessage.classList.add('error');
        });
    });

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        passwordMessage.textContent = '';
        const newPassword = newPasswordInput.value;

        currentUser.updatePassword(newPassword).then(() => {
            passwordMessage.textContent = translations[currentLang].password_update_success;
            passwordMessage.classList.add('success');
            passwordForm.reset();
        }).catch(error => {
            console.error("Błąd zmiany hasła:", error);
            if (error.code === 'auth/requires-recent-login') {
                reauthModal.classList.remove('hidden');
                handleReauthentication(newPassword); 
            } else {
                passwordMessage.textContent = translations[currentLang].password_update_error_generic;
                passwordMessage.classList.add('error');
            }
        });
    });

    function handleReauthentication(newPasswordToSet) {
        const reauthHandler = (e) => {
            e.preventDefault();
            reauthMessage.textContent = '';
            const currentPassword = reauthPasswordInput.value;
            if (!currentPassword) return;
            
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);

            currentUser.reauthenticateWithCredential(credential).then(() => {
                return currentUser.updatePassword(newPasswordToSet);
            }).then(() => {
                reauthModal.classList.add('hidden');
                reauthForm.reset();
                passwordMessage.textContent = translations[currentLang].password_update_success;
                passwordMessage.classList.add('success');
                passwordForm.reset();
            }).catch(error => {
                console.error("Błąd podczas re-autentykacji:", error);
                if (error.code === 'auth/wrong-password') {
                     reauthMessage.textContent = translations[currentLang].reauth_wrong_password_error;
                } else {
                     reauthMessage.textContent = translations[currentLang].password_update_error_generic;
                }
                reauthMessage.classList.add('error');
            });
        };
        
        reauthForm.onsubmit = reauthHandler;
        
        reauthCancelBtn.onclick = () => {
            reauthModal.classList.add('hidden');
            reauthForm.reset();
            reauthMessage.textContent = '';
            reauthForm.onsubmit = null; 
        };
    }
});
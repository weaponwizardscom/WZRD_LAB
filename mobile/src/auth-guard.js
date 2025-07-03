(function() {
    // Sprawdź, czy Firebase zostało poprawnie zainicjowane przez firebase-init.js
    if (!window.firebaseAuth) {
        console.error("Firebase nie zostało zainicjowane! Upewnij się, że plik firebase-init.js jest wczytywany jako pierwszy.");
        return;
    }

    // Na tych stronach strażnik nie powinien działać
    const noAuthPages = ['action.html', 'index.html'];
    if (noAuthPages.some(page => window.location.pathname.includes(page))) {
        return;
    }

    window.firebaseAuth.onAuthStateChanged(user => {
        if (!user) {
            console.log("Brak autoryzacji, przekierowanie na stronę logowania...");
            window.location.href = 'index.html';
        } else {
            // Odkryj widoczne elementy po zalogowaniu
            document.getElementById('app-header')?.classList.remove('hidden');
            document.getElementById('configurator-wrapper')?.classList.remove('hidden');
            document.getElementById('profile-page')?.classList.remove('hidden');
        }
    });
})();
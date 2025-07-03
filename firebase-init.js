// Ten plik jest jedynym miejscem, w którym inicjalizujemy Firebase.
// Musi być wczytywany jako pierwszy na każdej stronie, która korzysta z Firebase.

const firebaseConfig = {
    apiKey: "AIzaSyDwD0-oaR0jPmYj1mDdjC2Pk3GJ4q7R7D8",
    authDomain: "wzrd-lab.firebaseapp.com",
    projectId: "wzrd-lab",
    storageBucket: "wzrd-lab.appspot.com",
    messagingSenderId: "933427311495",
    appId: "1:933427311495:web:a0c9faf6297fb5454e9922",
    measurementId: "G-SL7Y1KPZSW"
};

// Inicjalizuj Firebase tylko raz
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Udostępnij usługi Firebase globalnie dla innych skryptów
window.firebaseAuth = firebase.auth();
window.firebaseDb = firebase.firestore();
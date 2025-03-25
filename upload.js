// 🔥 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB72joHBItSh5Qm87-iRej4Ase0iydIKSE",
    authDomain: "ai-attendance-tracker.firebaseapp.com",
    projectId: "ai-attendance-tracker",
    storageBucket: "ai-attendance-tracker.firebasestorage.app",
    messagingSenderId: "156412303712",
    appId: "1:156412303712:web:4812643621461fbb3c6605",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

// 📤 Upload Image to Firebase Storage
function uploadImage() {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload!");
        return;
    }

    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`uploads/${fileName}`);

    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(url => {
        document.getElementById("uploadStatus").innerText = "✅ Upload Successful!";
        extractTextFromImage(url);
        
        // Save file info to Firestore
        return db.collection("uploads").add({
            fileName: file.name,
            fileURL: url,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(error => {
        console.error("Upload Error:", error);
        document.getElementById("uploadStatus").innerText = "❌ Upload Failed!";
    });
}

// 🔍 Extract text using Tesseract.js (OCR)
function extractTextFromImage(imageURL) {
    document.getElementById("extractedText").innerText = "Extracting text...";

    Tesseract.recognize(imageURL, 'eng', {
        logger: m => console.log(m)
    }).then(({ data: { text } }) => {
        document.getElementById("extractedText").innerText = text;
    }).catch(error => {
        console.error("Text Extraction Error:", error);
        document.getElementById("extractedText").innerText = "❌ Text extraction failed!";
    });
}

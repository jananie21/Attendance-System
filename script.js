const signUpButton=document.getElementById('signUpButton');
const signInButton=document.getElementById('signInButton');
const signInForm=document.getElementById('signIn');
const signUpForm=document.getElementById('signup');

signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
})
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
})

document.addEventListener("DOMContentLoaded", function () {
    // Toggle department menu on click
    document.querySelector(".toggle-dropdown").addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".dropdown-menu").classList.toggle("show-dropdown");
    });

    // Toggle submenu (years) on click
    document.querySelectorAll(".toggle-submenu").forEach(function (dept) {
        dept.addEventListener("click", function (event) {
            event.preventDefault();
            let submenu = this.nextElementSibling;
            if (submenu.classList.contains("show-submenu")) {
                submenu.classList.remove("show-submenu");
            } else {
                document.querySelectorAll(".sub-menu").forEach(menu => menu.classList.remove("show-submenu"));
                submenu.classList.add("show-submenu");
            }
        });
    });

    // Close menus when clicking outside
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown")) {
            document.querySelector(".dropdown-menu").classList.remove("show-dropdown");
            document.querySelectorAll(".sub-menu").forEach(menu => menu.classList.remove("show-submenu"));
        }
    });
});


// Handle File Upload
document.querySelectorAll(".file-upload").forEach(input => {
    input.addEventListener("change", function () {
        let file = this.files[0];
        if (file) {
            alert(`File "${file.name}" uploaded for ${this.dataset.year}`);
        }
    });
});


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB72joHBItSh5Qm87-iRej4Ase0iydIKSE",
    authDomain: "ai-attendance-tracker.firebaseapp.com",
    projectId: "ai-attendance-tracker",
    storageBucket: "ai-attendance-tracker.firebasestorage.app",
    messagingSenderId: "156412303712",
    appId: "1:156412303712:web:4812643621461fbb3c6605",
}

// ✅ Load Uploaded Files from Firestore
function loadUploadedFiles() {
    db.collection("uploads").orderBy("uploadedAt", "desc").onSnapshot(snapshot => {
        const fileList = document.getElementById("file-list");
        if (fileList) {
            fileList.innerHTML = "";
            snapshot.forEach(doc => {
                const data = doc.data();
                fileList.innerHTML += `<li>
                    <a href="${data.fileURL}" target="_blank">${data.fileName}</a> - ${data.department} (${data.year})
                </li>`;
            });
        }
    });
}

// ✅ Call this function when the page loads
window.onload = () => {
    loadUploadedFiles();
};

// Register User
document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("users").doc(user.uid).set({
                username: username,
                email: email,
                phone: phone,
                uid: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("✅ Registration Successful!");
            window.location.href = "login.html"; // Redirect to login page
        })
        .catch((error) => {
            console.error("❌ Error:", error.message);
            alert("Error: " + error.message);
        });
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login User
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("✅ Login Successful!");
            window.location.href = "dashboard.html"; // Redirect to dashboard or homepage
        })
        .catch((error) => {
            console.error("❌ Error:", error.message);
            alert("Error: " + error.message);
        });
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

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

// Extract text using Tesseract.js
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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC_a-rbF2wvc1AIec0SbxTrLDMSWfWWjmM",
    authDomain: "big-money-app-c1594.firebaseapp.com",
    projectId: "big-money-app-c1594",
    storageBucket: "big-money-app-c1594.appspot.com",
    messagingSenderId: "137032507234",
    appId: "1:137032507234:web:6f7b6c05c6479591b9963b",
    measurementId: "G-19GL1SMB17"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show signup form
function showSignup() {
    document.getElementById('signup-container').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'none';
}

// Show login form
function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard-container').style.display = 'none';
}

// Show dashboard
function showDashboard(user) {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('signup-btn').style.display = 'none';

    if (user) {
        document.getElementById('user-display-name').innerText = `Hello, ${user.displayName}`;
        document.getElementById('user-display-name').style.display = 'block';
    }

    loadTransactions();
}

// Sign up function
function signup() {
    var email = document.getElementById("signup-email").value;
    var password = document.getElementById("signup-password").value;
    var displayName = document.getElementById("signup-displayName").value;

    // Form validation
    if (email === "" || password === "" || displayName === "") {
        alert("All fields are required.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            user.updateProfile({
                displayName: displayName
            }).then(() => {
                alert("User signed up and display name set!");
                showDashboard(user);
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Signup Error", errorCode, errorMessage);
            alert(errorMessage);
        });
}

// Login function
function login() {
    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    // Form validation
    if (email === "" || password === "") {
        alert("All fields are required.");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            alert("User logged in!");
            showDashboard(user);
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error("Login Error", errorCode, errorMessage);
            alert(errorMessage);
        });
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        alert("User logged out!");
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('signup-btn').style.display = 'block';
        document.getElementById('user-display-name').style.display = 'none';
        showLogin();
    }).catch((error) => {
        console.error("Logout Error", error);
        alert("Error logging out");
    });
}

// Add transaction function
function addTransaction() {
    var transactionName = document.getElementById("transaction-name").value;
    var transactionAmount = document.getElementById("transaction-amount").value;

    // Form validation
    if (transactionName === "" || transactionAmount === "") {
        alert("All fields are required.");
        return;
    }

    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("transactions").add({
            uid: user.uid,
            name: transactionName,
            amount: transactionAmount,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Transaction added!");
            loadTransactions();
            showTransactionContainer();
        }).catch((error) => {
            console.error("Error adding transaction", error);
            alert("Error adding transaction");
        });
    } else {
        alert("No user is logged in");
    }
}

// Show transaction container function
function showTransactionContainer() {
    document.getElementById("transaction-display-container").style.display = 'block';
}

// Load transactions function
function loadTransactions() {
    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("transactions")
            .where("uid", "==", user.uid)
            .orderBy("timestamp", "desc")
            .onSnapshot((snapshot) => {
                var transactionList = document.getElementById("transaction-list");
                transactionList.innerHTML = "";
                snapshot.forEach((doc) => {
                    var transaction = doc.data();
                    
                    // Create list item
                    var li = document.createElement("li");
                    li.classList.add("transaction-item");
                    
                    // Create transaction name element
                    var nameSpan = document.createElement("span");
                    nameSpan.classList.add("transaction-name");
                    nameSpan.innerText = transaction.name;
                    
                    // Create transaction amount element
                    var amountSpan = document.createElement("span");
                    amountSpan.classList.add("transaction-amount");
                    amountSpan.innerText = `$${transaction.amount}`;
                    
                    // Create delete button
                    var deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("delete-btn");
                    deleteBtn.innerText = "x";
                    deleteBtn.onclick = () => deleteTransaction(doc.id);
                    
                    // Append elements
                    li.appendChild(nameSpan);
                    li.appendChild(amountSpan);
                    li.appendChild(deleteBtn);
                    transactionList.appendChild(li);
                });
            });
    }
}

// Delete transaction function
function deleteTransaction(transactionId) {
    db.collection("transactions").doc(transactionId).delete()
        .then(() => {
            alert("Transaction deleted!");
            loadTransactions(); // Refresh the transaction list
        })
        .catch((error) => {
            console.error("Error deleting transaction", error);
            alert("Error deleting transaction");
        });
}

// Event listeners
document.getElementById("signup-btn").addEventListener("click", showSignup);
document.getElementById("login-btn").addEventListener("click", showLogin);
document.getElementById("signup-action").addEventListener("click", signup);
document.getElementById("login-action").addEventListener("click", login);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("add-transaction-btn").addEventListener("click", addTransaction);

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        showDashboard(user);
    } else {
        showLogin();
    }
});

///// User Authentication /////

const auth = firebase.auth();

const whenSignedIn = document.querySelectorAll('#whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const userDetails = document.getElementById('userDetails');


const provider = new firebase.auth.GoogleAuthProvider();

/// Sign in event handlers

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        whenSignedIn.forEach(element => element.hidden = false );
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
    } else {
        // not signed in
        whenSignedIn.forEach(element => element.hidden = true );
        whenSignedOut.hidden = false;
        userDetails.innerHTML = '';
    }
});



///// Firestore /////

const db = firebase.firestore();

const messageList = document.getElementById('messagesList');
const createMessage = document.getElementById('createMessage');
const message = document.getElementById('message-input')


let messageRef;
let unsubscribe;

auth.onAuthStateChanged(user => {

    if (user) {

        // Database Reference
        messageRef = db.collection('messages')

        createMessage.onclick = () => {

            // const { serverTimestamp } = firebase.firestore.FieldValue;
            const time = new Date()
            messageRef.add({
                uid: user.uid,
                idDisplayName: user.displayName,
                name: message.value,
                createdAt: time.toUTCString()
            });
        }


        // Query
        unsubscribe = messageRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt') // Requires a query
            .onSnapshot(querySnapshot => {
                
                // Map results to an array of li elements

                const items = querySnapshot.docs.map(doc => {

                    return `<li>
                    <span class="message">${doc.data().name}</span>
                    <span class="username">${doc.data().idDisplayName}</span>
                    <span class="time">${doc.data().createdAt}</span>
                    </li>`

                });

                messageList.innerHTML = items.join('');

            });



    } else {
        // Unsubscribe when the user signs out
        unsubscribe && unsubscribe();
    }
});
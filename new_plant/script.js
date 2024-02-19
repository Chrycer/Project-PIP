import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyApqiMjGkNaQnoeVASloczRfwdHagBHF5o",
    authDomain: "trial-a7bdc.firebaseapp.com",
    databaseURL: "https://trial-a7bdc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "trial-a7bdc",
    storageBucket: "trial-a7bdc.appspot.com",
    messagingSenderId: "833064067627",
    appId: "1:833064067627:web:43e612fa1ec9deffcd406e",
    measurementId: "G-R80B8NX211"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();
const storage = getStorage();

var plantName = document.getElementById("plantName");
var plantSciName = document.getElementById("plantSciName");
var plantColor = document.getElementById("plantColor");
var plantImages = document.getElementById("plantImages");

function addData() {
    var currentTime = new Date().toISOString();
    uploadFiles().then(imageUrls => {
        set(ref(db, plantSciName.value + "/" + plantName.value), {
            name: plantName.value,
            sciname: plantSciName.value,
            color: plantColor.value,
            images: imageUrls,
            timeCreated: currentTime,
            timeModified: currentTime
        }).then(() => {
            alert("Success");
            plantName.value = "";
            plantSciName.value = "";
            plantColor.value = "";
            plantImages.value = null;            
        }).catch((error) => {
            console.error("Error adding document: ", error);
            alert("Failed");
        });
    }).catch(error => {
        console.error("Error uploading files: ", error);
        alert("Failed to upload files");
    });
}

function uploadFiles() {
    const images = plantImages.files;
    const promises = [];

    for (let i = 0; i < images.length; ++i) {
        const image = images[i];
        const imageName = plantSciName.value + '_' + i; 
        const metaData = {
            contentType: image.type
        };

        const storageRef = sRef(storage, plantSciName.value + "/" + plantName.value + "/" + i);
        const uploadTask = uploadBytesResumable(storageRef, image, metaData);

        promises.push(new Promise((resolve, reject) => {
            uploadTask.then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        }));
    }
    return Promise.all(promises);
}

document.querySelector('.head').addEventListener('click', function(event) {
    event.stopPropagation();
    window.location.href = "../../homepage/index.html";
})

document.querySelector('.bottom-page').addEventListener('click', function(event){
    event.stopPropagation();
    addData();
});
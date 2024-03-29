
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, onValue , child , get , remove} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage, ref as firebaseStorageRef, deleteObject , listAll} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


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
const databaseRef = ref(db);
const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('query');

var searchInput = document.getElementById('searchInput');
var autofill = document.getElementById('suggestionsList');
var searchButton = document.getElementById("search-button");
var homepage = document.getElementById('website-name');
var imageCarousel = document.getElementById('image-carousel');

function main() {
    document.title = `${query} | Project PIP`;
    searchInput.value = query;
    autofill.style.display = 'none';
    document.querySelector('.suggestions').style.border = 'none';  

    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value.trim();
        updateSuggestions(query);
    });

    document.querySelector('.wrapper').addEventListener('click', function(event){
        event.stopPropagation();
        buttonClick(event.target);
    });

    searchButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        buttonClick(searchButton);
    });

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchButton.click();
        }
    });

    displayResult(query);
}

function updateSuggestions(query) {
    onValue(databaseRef, (snapshot) => {
        var suggestionsList = [];

        snapshot.forEach((childSnapshot) => {
            const database = childSnapshot.val();
            if (typeof database === 'object' && database !== null) {
                for (var data in database) {
                    if (typeof database[data] === 'object' && database[data] !== null) {
                        for (var key in database[data]) {
                            var value = database[data][key];  
                            if (typeof value === 'string') {
                                if (value.toLowerCase().includes(query.toLowerCase()) && query !== '') {
                                    if (!suggestionsList.includes(value)) {
                                        suggestionsList.push(value);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        suggestionsList.sort();
        suggestionsList = suggestionsList.slice(0,5);

        autofill.innerHTML = '';
        
        if (suggestionsList.length > 0) {
            suggestionsList.forEach((suggestion) => {
                var li = document.createElement('li');
                var text = document.createTextNode(suggestion);
                li.appendChild(text);
                li.addEventListener('click', function() {
                    searchInput.value = suggestion;
                    buttonClick(searchButton);
                });
                autofill.appendChild(li);
            });

            autofill.style.display = 'block';
            document.querySelector('.suggestions').style.border = '1px solid rgba(255, 255, 255, 0.01)';
        } else {
            autofill.style.display = 'none';
            document.querySelector('.suggestions').style.border = 'none';
        }
    });
}

function buttonClick(target) {
    if (target === searchButton) {
        let query = searchInput.value.trim();
        if (query !== '') {
            let searchResultsURL = `../../search_results/index.html?query=${encodeURIComponent(query)}`;
            window.location.href = searchResultsURL;
        }
    } else if (target === homepage) {
        window.location.href = "../../homepage/index.html";
    }
}

function displayResult(query) {
    var imagesContainer = document.querySelector('.images-container'); // Get the images container

    onValue(databaseRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const database = childSnapshot.val();
            if (typeof database === 'object' && database !== null) {
                for (var data in database) {
                    if (data.toLowerCase() === query.toLowerCase()) { 
                        const details = database[data];
                        for (var description in details) {
                            if (description === 'images' && details[description] !== null) {
                                // Loop through the images array
                                details[description].forEach((imageSrc) => {
                                    // Create an img element
                                    var img = document.createElement('img');
                                    // Set the src attribute to the image source
                                    img.src = imageSrc;
                                    // Append the image to the images container
                                    imagesContainer.appendChild(img);
                                });
                            } else {
                                var ele = document.getElementsByClassName(description);
                                var detailVar = document.createElement('div');
                                detailVar.classList.add('detail');
                                detailVar.textContent = details[description];
                                for (var i = 0; i < ele.length; i++) {
                                    ele[i].appendChild(detailVar);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        });
    }); 
}

function deleteData(query) {
    // Construct the reference to the specific data you want to delete in the database
    const dataRef = ref(db, "Homo sapiens/" + query); // Assuming 'query' is the path to the data you want to delete

    // Remove the data from the database
    remove(dataRef)
        .then(() => {
            console.log("Data deleted successfully");

            // Construct the reference to the corresponding file in Firebase Storage
            const storageReference = firebaseStorageRef(storage, "Homo sapiens/" + query); // Update 'path/to/file' with the correct file path

            listAll(storageReference)
                .then((res) => {
                    res.items.forEach((itemRef) => {
                        // Delete each file in the directory
                        deleteObject(itemRef)
                            .then(() => {
                                console.log("File deleted successfully");
                            })
                            .catch((error) => {
                                console.error("Error deleting file: ", error);
                            });
                    });
                })
                .catch((error) => {
                    console.error("Error listing files: ", error);
                });

            // Delete the file from Firebase Storage

        })
        .catch((error) => {
            console.error("Error deleting data: ", error);
        });
}


document.getElementById('delete').addEventListener('click', function() {
    deleteData(query); // Assuming 'query' contains the path to the data you want to delete
});


main()
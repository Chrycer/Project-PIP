
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

var searchInput = document.getElementById("searchInput");
var searchButton = document.getElementById("search-button");
var new_plant = document.getElementById("new-plant");
var autofill = document.getElementById('suggestionsList');

function main() {
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
}

function buttonClick(target) {
    if (target === searchButton) {
        let query = searchInput.value.trim();
        if (query !== '') {            let searchResultsURL = `../../search_results/index.html?query=${encodeURIComponent(query)}`;
            window.location.href = searchResultsURL;
        }
    } else if (target === new_plant) {
        window.location.href = "../../new_plant/index.html";
    }
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
        suggestionsList = suggestionsList.slice(0,6);

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

main()
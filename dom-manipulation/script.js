// Base URL for the mock API
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Replace with your mock API endpoint

// Function to load quotes from localStorage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        return JSON.parse(storedQuotes);
    }
    return [
        { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
        { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
        { text: "Good things come to those who wait, but better things come to those who go out and get them.", category: "Success" }
    ];
}

// Function to save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load last selected category from localStorage
function loadLastSelectedCategory() {
    return localStorage.getItem('selectedCategory') || 'all';
}

// Function to save last selected category to localStorage
function saveLastSelectedCategory(category) {
    localStorage.setItem('selectedCategory', category);
}

// Function to show a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const filteredQuotes = filterQuotesArray();
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for the selected category.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `"${quote.text}" - ${quote.category}`;
}

// Function to create the form for adding new quotes
function createAddQuoteForm() {
    const quoteForm = document.createElement('div');
    quoteForm.id = 'quoteForm';
    
    const newQuoteTextInput = document.createElement('input');
    newQuoteTextInput.id = 'newQuoteText';
    newQuoteTextInput.type = 'text';
    newQuoteTextInput.placeholder = 'Enter a new quote';
    
    const newQuoteCategoryInput = document.createElement('input');
    newQuoteCategoryInput.id = 'newQuoteCategory';
    newQuoteCategoryInput.type = 'text';
    newQuoteCategoryInput.placeholder = 'Enter quote category';
    
    const addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = 'Add Quote';
    addQuoteButton.onclick = addQuote;
    
    quoteForm.appendChild(newQuoteTextInput);
    quoteForm.appendChild(newQuoteCategoryInput);
    quoteForm.appendChild(addQuoteButton);
    
    document.body.appendChild(quoteForm);
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        updateCategoryFilterOptions();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('New quote added successfully!');
    } else {
        alert('Please enter both quote text and category.');
    }
}

// Function to export quotes to JSON
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const exportFileDefaultName = 'quotes.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement); // Required for FF
    linkElement.click();
    linkElement.remove();
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      updateCategoryFilterOptions();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to get unique categories from quotes using map()
function getUniqueCategories() {
    const categories = quotes.map(quote => quote.category);
    const uniqueCategories = Array.from(new Set(categories));
    return uniqueCategories;
}

// Function to update category filter options
function updateCategoryFilterOptions() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    populateCategories();
    categoryFilter.value = selectedCategory;
}

// Function to populate category options in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = getUniqueCategories();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes array based on selected category
function filterQuotesArray() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    if (selectedCategory === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === selectedCategory);
}

// Function to filter quotes and display the first matching quote
function filterQuotes() {
    saveLastSelectedCategory(document.getElementById('categoryFilter').value);
    showRandomQuote();
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch quotes from the server.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching quotes from the server:', error);
        return [];
    }
}

// Function to post updated quotes to the server
async function postQuotesToServer(quotes) {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quotes)
        });

        if (response.ok) {
            console.log('Quotes successfully updated on the server.');
        } else {
            console.error('Failed to update quotes on the server.');
        }
    } catch (error) {
        console.error('Error updating quotes on the server:', error);
    }
}

// Function to synchronize local quotes with the server
async function syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    if (serverQuotes.length > 0) {
        if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
            notifyConflict();
        }
        // Simple conflict resolution: server data takes precedence
        quotes = serverQuotes;
        saveQuotes();
        updateCategoryFilterOptions();
        showRandomQuote();
    } else {
        alert('No new data from the server.');
    }
}

// Function to notify users of conflicts
function notifyConflict() {
    alert('Data conflict detected. Server data has been prioritized.');
}

// Initial quotes array
let quotes = loadQuotes();

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Create the form for adding new quotes
createAddQuoteForm();

// Populate category filter options
populateCategories();

// Set last selected category
document.getElementById('categoryFilter').value = loadLastSelectedCategory();

// Load initial random quote on page load
showRandomQuote();

// Set up periodic syncing with the server every 5 minutes
setInterval(syncWithServer, 5 * 60 * 1000);

// Sync with the server on page load
window.addEventListener('load', async () => {
    await syncWithServer();
});

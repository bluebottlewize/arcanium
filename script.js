console.log('Happy developing ✨')

const googleAutocompleteAPI = 'https://cors-anywhere.herokuapp.com/https://suggestqueries.google.com/complete/search?client=firefox&q=';

let urlMap = new Map([
    ["github", "https://www.github.com"],
    ["youtube", "https://www.youtube.com"],
    ["gpt", "https://chat.openai.com/"],
]);

const overlay = document.querySelector('#overlay');
const qaoverlay = document.querySelector('#quickaccess-container');
const queryoverlay = document.querySelector('#query-container');
const quickaccess = document.querySelector('#quickaccess');
const quickaccessSuggestion = document.querySelector('#quickaccess-suggestion');

const search = document.querySelector('#search');
const searchBox = document.querySelector('#search-box');
const searchinput = document.querySelector('#search-input');
const bookmarklist = document.querySelector('#bookmark-list');
const suggestionslist = document.querySelector('#suggestions-list');
const addbookmarks = document.querySelector('#bookmark-add-container');
const keyinput = document.querySelector('#keyword-input');
const urlinput = document.querySelector('#url-input');

const NONE_ACTIVE = 0;
const QUICKACCESS_FRAGMENT = 1;
const SEARCH_FRAGMENT = 2;
const BOOKMARK_FRAGMENT = 3;

let activeFragment = SEARCH_FRAGMENT;

let isOverlayActive = false;
let isQuickAccessOverlayActive = false;
let isQueryOverlayActive = false;
let isDialogActive = false;

// util functions

function isValidHttpUrl(query)
{
    let url;

    try
    {
        url = new URL(query);
    } catch (_)
    {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function isValidDomain(query)
{
    const urlRegex = /^(((http|https):\/\/|)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?)$/;
    return urlRegex.test(query);
}

function searchDuckDuckGo(query)
{
    if (isValidHttpUrl(query))
    {
        window.location.href = query;
    }
    else if (isValidDomain(query))
    {
        window.location.href = "https://" + query;
    }
    else
    {
        window.location.href = "https://duckduckgo.com/?q=" + query;
    }
}

function searchGoogle(query)
{
    if (isValidHttpUrl(query))
    {
        window.location.href = query;
    }
    else if (isValidDomain(query))
    {
        window.location.href = "https://" + query;
    }
    else
    {
        window.location.href = "https://google.com/search?q=" + query;
    }
}

function findKeyStartingWith(input)
{
    if (!input)
    {
        return input;
    }

    for (let [key, value] of urlMap)
    {
        if (key.toLowerCase().startsWith(input.toLowerCase()))
        {
            return key;
        }
    }
    return null;
}

function storeUrls()
{
    let mapArray = Array.from(urlMap);
    localStorage.setItem('urls', JSON.stringify(mapArray));
}

function getUrls()
{
    let storedMap = localStorage.getItem('urls');

    if (storedMap)
    {
        let mapArray = JSON.parse(storedMap);
        urlMap = new Map(mapArray);
    }
}

function getSuggestions(query)
{
    fetch(googleAutocompleteAPI + query)
        .then(response =>
        {
            if (!response.ok)
            {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data =>
        {
            console.log(data);
            showSearchSuggestions(data["1"]);
        })
        .catch(error =>
        {
            console.error('Error:', error);
        });
}

function clearBookmarkList()
{
    while (bookmarklist.lastElementChild)
    {
        bookmarklist.removeChild(bookmarklist.lastElementChild);
    }
}

function clearSearchSuggestionsList()
{
    searchBox.classList.remove('suggestions-active');

    while (suggestionslist.lastElementChild)
    {
        suggestionslist.removeChild(suggestionslist.lastElementChild);
    }
}

function showFilteredBookmarks(filter)
{
    const result = [];
    urlMap.forEach((value, key) =>
    {
        if (key.startsWith(filter))
        {
            result.push({key, value});
        }
    });

    console.log(result);

    clearBookmarkList();

    let listItemTemplate = document.querySelector("#list-item-template");
    console.log(listItemTemplate);


    result.forEach((element, index) =>
    {
        let listItemClone = listItemTemplate.content.cloneNode(true);

        const itemTitle = listItemClone.querySelector(".bookmark-title");
        itemTitle.innerText = element.key;

        const itemLink = listItemClone.querySelector(".bookmark-link");
        itemLink.innerText = element.value;

        // Append the cloned list item to the <ul>
        bookmarklist.appendChild(listItemClone);
    });
}

function showSearchSuggestions(suggestions)
{
    clearSearchSuggestionsList();

    let searchItemTemplate = document.querySelector("#search-item-template");
    console.log(searchItemTemplate);

    console.log(suggestions);

    if (suggestions.length === 0)
    {
        return;
    }

    suggestions.forEach((element, index) =>
    {
        let searchItemClone = searchItemTemplate.content.cloneNode(true);

        const suggestionItem = searchItemClone.querySelector(".search-suggestion");
        suggestionItem.innerText = element;
        suggestionItem.setAttribute("data-suggestion", element);

        suggestionslist.appendChild(searchItemClone);
    });

    searchBox.classList.add('suggestions-active');
}

getUrls();

quickaccess.focus();

function closeEverything()
{
    isOverlayActive = false;
    isQueryOverlayActive = false;
    isQuickAccessOverlayActive = false;
    isDialogActive = false;

    overlay.classList.remove("active");
    qaoverlay.classList.remove("active");
    queryoverlay.classList.remove("active");
    search.classList.remove("active");
    addbookmarks.classList.remove("active");
    bookmarklist.classList.remove("active");

    searchinput.value = "";
    quickaccess.value = "";
    quickaccessSuggestion.value = "";
    keyinput.value = "";
    urlinput.value = "";

    quickaccess.style.textIndent = "0ch";

    clearBookmarkList();

    activeFragment = NONE_ACTIVE;
    searchinput.focus();
}

function openSearch()
{
    isOverlayActive = true;
    isQueryOverlayActive = true;
    activeFragment = SEARCH_FRAGMENT;

    overlay.classList.add("active");
    search.classList.add("active");

    searchinput.focus();
    console.log(event.key);
}

function openBookmarkList()
{
    isDialogActive = true;
    activeFragment = BOOKMARK_FRAGMENT;

    overlay.classList.add("active");
    addbookmarks.classList.add("active");
    bookmarklist.classList.add("active");

    showFilteredBookmarks("");

    keyinput.focus();
}

function openQuickAccess()
{
    isOverlayActive = true;
    isQuickAccessOverlayActive = true;
    activeFragment = QUICKACCESS_FRAGMENT;

    overlay.classList.add("active");
    console.log(event.key);

    quickaccess.value = "";
    quickaccess.focus();
}

function saveBookmark()
{
    let key = keyinput.value;
    let url = urlinput.value;

    if (key && url)
    {
        urlMap.set(key, url);
    }

    storeUrls();
}

document.addEventListener("keydown", function (event)
{
    if (event.key === "Escape")
    {
        closeEverything();
        return;
    }

    if (activeFragment === NONE_ACTIVE)
    {
        if (event.key.length === 1 && event.key === "/" && document.activeElement.value.length === 0)
        {
            closeEverything();
            openQuickAccess();
        }
        else if (event.key.length === 1)
        {
            openSearch();
        }
        else if (event.ctrlKey && event.key === "Alt")
        {
            openBookmarkList();
        }
    }
    else if (activeFragment === QUICKACCESS_FRAGMENT)
    {
        if (event.key === "Enter")
        {
            let query = findKeyStartingWith(quickaccess.value.substring(1));

            console.log(query);

            if (query != null)
            {
                closeEverything();
                window.location.href = urlMap.get(query);
            }
            else
            {
                closeEverything();
            }

            quickaccess.value = "";
        }
    }
    else if (activeFragment === SEARCH_FRAGMENT)
    {
        if (event.key === "/" && document.activeElement.value.length === 0)
        {
            closeEverything();
            openQuickAccess();
        }
        else if (event.ctrlKey && event.key === "Enter")
        {
            let query = searchinput.value;
            console.log(query);
            closeEverything();
            searchGoogle(query);
        }
        else if (event.key === "Enter")
        {
            let query = searchinput.value;
            console.log(query);
            closeEverything();
            searchDuckDuckGo(query);
        }
    }
    else if (activeFragment === BOOKMARK_FRAGMENT)
    {
        if (event.key === "Enter")
        {
            saveBookmark();
            closeEverything();
        }
    }
});

quickaccess.addEventListener("input", function ()
{
    let qa = quickaccess.value.trim().replace(/\s+/g, "");
    quickaccess.value = quickaccess.value.toLowerCase();

    if (quickaccess.value.length === 0)
    {
        closeEverything();
        return;
    }
    else if (quickaccess.value.length < 2)
    {
        quickaccessSuggestion.value = "";
        quickaccess.style.textIndent = "0ch";
        return;
    }

    console.log();

    let result = findKeyStartingWith(qa.substring(1));

    if (result == null)
    {
        quickaccessSuggestion.value = "";
        quickaccess.style.textIndent = "0ch";
        return;
    }

    quickaccessSuggestion.value = "/" + findKeyStartingWith(qa.substring(1));
    quickaccess.style.textIndent = "-" + (quickaccessSuggestion.value.length - quickaccess.value.length) + "ch";
});

keyinput.addEventListener('input', function ()
{
    showFilteredBookmarks(keyinput.value);
});

window.onload = function ()
{
    isOverlayActive = true;
    isQueryOverlayActive = true;

    overlay.classList.add("active");
    search.classList.add("active");

    searchinput.focus();
    console.log(event.key);
}

// todo add search suggestion
// todo add settings page

searchinput.addEventListener("input", function ()
{
    console.log(searchinput.value);
    getSuggestions(searchinput.value);
});

document.body.addEventListener("click", (event) =>
{
    let query;
    if (event.target.matches(".search-suggestion"))
    {
        query = event.target.getAttribute('data-suggestion');
        closeEverything();
        searchDuckDuckGo(query);
    }
    else if (event.target.matches(".search-item"))
    {
        query = event.target.querySelector('.search-suggestion').getAttribute('data-suggestion');
        closeEverything();
        searchDuckDuckGo(query);
    }
});
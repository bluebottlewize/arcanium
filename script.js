console.log('Happy developing ✨')

let urlMap = new Map([
    ["github", "https://www.github.com"],
    ["youtube", "https://www.youtube.com"],
    ["gpt", "https://chat.openai.com/"],
]);

// util functions

function findKeyStartingWith(input, map)
{
    for (let [key, value] of map)
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

function clearBookmarkList()
{
    while (bookmarklist.lastElementChild)
    {
        bookmarklist.removeChild(bookmarklist.lastElementChild);
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



    result.forEach((element, index) => {
        let listItemClone = listItemTemplate.content.cloneNode(true);

        const itemTitle = listItemClone.querySelector(".bookmark-title");
        itemTitle.innerText = element.key;

        const itemLink = listItemClone.querySelector(".bookmark-link");
        itemLink.innerText = element.value;

        // Append the cloned list item to the <ul>
        bookmarklist.appendChild(listItemClone);
    });
}

getUrls();

const overlay = document.querySelector('#overlay');
const qaoverlay = document.querySelector('#quickaccess-container');
const queryoverlay = document.querySelector('#query-container');
const quickaccess = document.querySelector('#quickaccess');
const searchbox = document.querySelector('#search-box');
const searchinput = document.querySelector('#search-input');
const bookmarklist = document.querySelector('#bookmark-list');
const dialog = document.querySelector('#dialog');
const keyinput = document.querySelector('#keyword-input');
const urlinput = document.querySelector('#url-input');


let isOverlayActive = false;
let isQuickAccessOverlayActive = false;
let isQueryOverlayActive = false;
let isDialogActive = false;

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
    searchbox.classList.remove("active");
    dialog.classList.remove("active");
    bookmarklist.classList.remove("active");
    searchinput.value = "";
    quickaccess.value = "";
    keyinput.value = "";
    urlinput.value = "";

    clearBookmarkList();

    quickaccess.focus();
}

document.addEventListener("keydown", function (event)
{
    if (isOverlayActive && !isDialogActive)
    {
        if (event.key === "Escape")
        {
            closeEverything();
        }
        if (event.ctrlKey && event.key === "Enter")
        {
            let query = searchinput.value;
            console.log(query);
            closeEverything();
            window.location.href = "https://google.com/search?q=" + query;
        }
        else if (event.key === "Enter")
        {
            if (isQuickAccessOverlayActive)
            {
                let query = findKeyStartingWith(quickaccess.value, urlMap);

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
            else if (isQueryOverlayActive)
            {
                let query = searchinput.value;
                console.log(query);
                closeEverything();
                window.location.href = "https://duckduckgo.com/?q=" + query;
            }

            quickaccess.focus();
        }
        else if (isQuickAccessOverlayActive)
        {
            quickaccess.focus();
        }
    }
    else if (!isOverlayActive && !isDialogActive)
    {
        if (event.key.length === 1)
        {
            isOverlayActive = true;
            isQuickAccessOverlayActive = true;

            overlay.classList.add("active");
            console.log(event.key);
        }
        else if (event.key === "Shift")
        {
            isOverlayActive = true;
            isQueryOverlayActive = true;

            overlay.classList.add("active");
            searchbox.classList.add("active");

            searchinput.focus();
            console.log(event.key);
        }
        else if (event.ctrlKey && event.key === "Alt")
        {
            isDialogActive = true;

            overlay.classList.add("active");
            dialog.classList.add("active");
            bookmarklist.classList.add("active");

            showFilteredBookmarks("");

            keyinput.focus();
        }
    }
    else if (isDialogActive)
    {
        if (event.key === "Enter")
        {
            let key = keyinput.value;
            let url = urlinput.value;

            if (key && url)
            {
                urlMap.set(key, url);
            }

            storeUrls();

            closeEverything();
        }
        else if (event.key === "Escape")
        {
            closeEverything();
        }
    }

    const key = event.keyCode || event.which;

    // if (key < 65 || (key > 65 + 26 && key < 97) || key > 97 + 26)
    // {
    //     if (event.preventDefault) event.preventDefault();
    // }
});

keyinput.addEventListener('input', function ()
{
    showFilteredBookmarks(keyinput.value);
});

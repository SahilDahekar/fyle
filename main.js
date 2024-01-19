//Comment this import and define your own variable with github access token
// eg: const TOKEN = "<YOUR_TOKEN>";
import { TOKEN } from './config.js';

//Base urls for github api
const USER_URL = 'https://api.github.com/users/SahilDahekar';
const BASE_URL = `${USER_URL}/repos`;

//Global variables
let currentPage = 1;
let perPage = 10;
let totalPages = 1;
let headerLinks;
let userInfo;

// Fetch repository data
const fetchData = async () => {
    try {
        const response = await fetch(`${BASE_URL}?per_page=${perPage}&page=${currentPage}`, {
            headers: {
                'Authorization': `token ${TOKEN}`,
            },
        });
        headerLinks = await getHeaderLinks(response.headers.get('link'));
        totalPages = headerLinks.last || (headerLinks.prev ? headerLinks.prev + 1 : 1);

        const data = await response.json();
        const repoState = await Promise.all(data.map(async (repo) => {
            const languages = await getLanguages(repo.languages_url);
            return {
                name: repo.name,
                description: repo.description,
                languages: languages,
            };
        }));

        return repoState;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Fetch user information
const fetchUserInfo = async () => {
    try {
        const response = await fetch(USER_URL, {
            headers: {
                'Authorization': `token ${TOKEN}`,
            },
        });
        const data = await response.json();
        return {
            name: data.name || 'No Name',
            bio: data.bio || 'No Bio',
            location: data.location || 'No Location',
            twitter_username: data.twitter_username || 'No Twitter ID',
            github: data.html_url,
            avatar: data.avatar_url,
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
};

// Fetch programming languages of a repository
const getLanguages = async (url) => {
    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `token ${TOKEN}`,
            },
        });
        const data = await res.json();
        const languageKeys = Object.keys(data);

        if (languageKeys.length > 3) {
            return languageKeys.slice(0, 3).concat([`+${languageKeys.length - 3} more`]);
        } else {
            return languageKeys;
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
        return [];
    }
};

// Parse GitHub header links to get pagination information
const getHeaderLinks = async (headerString) => {
    const urlPattern = /<([^>]+)>;\s*rel="([^"]+)"/g;

    const links = {};
    let match;

    while ((match = urlPattern.exec(headerString)) !== null) {
        const url = match[1];
        const rel = match[2];
        const pageNumberMatch = url.match(/&page=(\d+)/);
        if (pageNumberMatch) {
            links[rel] = parseInt(pageNumberMatch[1], 10);
        }
    }

    return links;
};

// Render user and repository data on the page
const render = async () => {
    try {
        renderLoadingState();
        if (!userInfo) {
            userInfo = await fetchUserInfo();
        }

        // Select HTML elements
        const name = document.querySelector('#name');
        const bio = document.querySelector('#bio');
        const location = document.querySelector('#location');
        const twitter_username = document.querySelector('#twitter_username');
        const avatar = document.querySelector('#avatar');
        const repos = document.querySelector('#repos');
        const github = document.querySelector('#github');

        // Update user information on the page
        name.textContent = userInfo.name;
        bio.textContent = userInfo.bio;
        location.textContent = `📍 ${userInfo.location}`;
        twitter_username.innerHTML = `🐦 <a href="https://twitter.com/${userInfo.twitter_username}" target="_blank">${userInfo.twitter_username}</a>`;
        avatar.src = userInfo.avatar;
        github.innerHTML = `🔗 <a href="${userInfo.github}" target="_blank">${userInfo.github}</a>`;

        // Fetch and render repository data
        const data = await fetchData();
        const repo_data = data.map(
            (item) => `
            <div class="repo-item">
                <div>
                    <h4 class="repo-item-title">${item.name}</h4>
                    <p class="repo-item-des">${item.description || 'No description'}</p>
                </div>
                <ul class="repo-item-lang">
                ${(Array.isArray(item.languages) && item.languages.length !== 0)
                    ? item.languages.map((lang) => `<li class="badge">${lang}</li>`).join('')
                    : '<li class="badge">No languages</li>'}
                </ul>
            </div>
        `
        ).join('');

        // Update repository data on the page
        repos.innerHTML = repo_data;

        // Update pagination buttons on the page
        updatePaginationButtons();
    } catch (error) {
        console.error('Error rendering data:', error);
    }
};

// Update pagination buttons based on current page and total pages
const updatePaginationButtons = () => {
    const paginationContainer = document.querySelector('.pagination-container');
    const pageButtonsContainer = paginationContainer.querySelector('.page-buttons');
    const prevBtn = paginationContainer.querySelector('#prev-btn');
    const nextBtn = paginationContainer.querySelector('#next-btn');

    // Clear existing page buttons
    pageButtonsContainer.innerHTML = '';

    const maxButtonsToShow = 4; // Total number of buttons to show
    const halfButtonsToShow = Math.floor(maxButtonsToShow / 2);

    // Calculate the range based on the current page and total pages
    let startRange = Math.max(1, currentPage - halfButtonsToShow);
    let endRange = Math.min(totalPages, startRange + maxButtonsToShow - 1);

    // Adjust the range if it exceeds the total pages
    startRange = Math.max(1, endRange - maxButtonsToShow + 1);

    const shouldSkipLeft = currentPage > halfButtonsToShow + 1;
    const shouldSkipRight = currentPage < totalPages - halfButtonsToShow;

    // Create and append new page buttons
    for (let i = startRange; i <= endRange; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'page_no');
        button.textContent = i;
        button.addEventListener('click', () => onPageButtonClick(i));
        pageButtonsContainer.appendChild(button);
    }

    // Disable or enable previous button based on current page
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => onPageButtonClick(headerLinks?.prev));

    // Disable or enable next button based on current page
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => onPageButtonClick(headerLinks?.next));

    // Add skip buttons for long pagination sequences
    if (shouldSkipLeft) {
        const prevSkipButton = document.createElement('button');
        prevSkipButton.classList.add('btn', 'page_no');
        prevSkipButton.textContent = '<';
        prevSkipButton.addEventListener('click', () => onPrevSetButtonClick());
        pageButtonsContainer.insertBefore(prevSkipButton, pageButtonsContainer.firstChild);
    }

    if (shouldSkipRight) {
        const nextSkipButton = document.createElement('button');
        nextSkipButton.classList.add('btn', 'page_no');
        nextSkipButton.textContent = '>';
        nextSkipButton.addEventListener('click', () => onNextSetButtonClick());
        pageButtonsContainer.appendChild(nextSkipButton);
    }

    // Highlight the active page button
    const allButtons = pageButtonsContainer.querySelectorAll('.page_no');
    allButtons.forEach((button) => {
        button.classList.remove('active');
        if (parseInt(button.textContent) === currentPage) {
            button.classList.add('active');
        }
    });
};

// Handle click event for previous set of pagination buttons
const onPrevSetButtonClick = () => {
    const maxButtonsToShow = 5; // Total number of buttons to show
    const moveAmount = maxButtonsToShow - 2;

    // Move to the previous set of page numbers
    const newEndRange = Math.max(1, currentPage - moveAmount);
    const newStartRange = Math.max(1, newEndRange - maxButtonsToShow + 1);

    currentPage = newStartRange; // Update current page to the start of the new set
    render();
};

// Handle click event for next set of pagination buttons
const onNextSetButtonClick = () => {
    const maxButtonsToShow = 5; // Total number of buttons to show
    const moveAmount = maxButtonsToShow - 2;

    // Move to the next set of page numbers
    const newStartRange = Math.min(totalPages, currentPage + moveAmount);

    currentPage = newStartRange; // Update current page to the start of the new set
    render();
};

// Handle click event for individual page buttons
const onPageButtonClick = (page) => {
    currentPage = page;
    render();
};

// Change the number of repositories displayed per page
const changePerPage = (perP) => {
    perPage = parseInt(perP, 10);
    currentPage = 1;
    render();
};

// Render a loading state while data is being fetched
const renderLoadingState = () => {
    const reposContainer = document.querySelector('#repos');
    reposContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
};

// Wait for the DOM to be fully loaded before rendering
document.addEventListener('DOMContentLoaded', async () => {
    const perPageSelect = document.querySelector('#perPageSelect');
    perPageSelect.addEventListener('change', (e) => {
        return changePerPage(e.target.value);
    });
    await render();
});

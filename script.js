// Global variables
let allSuperheroes = [];
let displayedSuperheroes = [];
let currentPage = 1;
let pageSize = 20;
let isLoading = false;
let currentSortColumn = 'name';
let currentSortOrder = 'asc';

// DOM elements
const searchBar = document.getElementById('searchBar');
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
const alignmentFilter = document.getElementById('alignmentFilter');
const genderFilter = document.getElementById('genderFilter');
const publisherFilter = document.getElementById('publisherFilter');
const superheroTableBody = document.getElementById('superheroTableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const darkModeToggle = document.getElementById('darkModeToggle');
const backToTopBtn = document.getElementById('backToTop');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageIndicator = document.getElementById('currentPageIndicator');
const superheroTable = document.getElementById('superheroTable');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');

// Fetch superheroes data
async function fetchSuperheroes() {
    isLoading = true;
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json');
        if (!response.ok) {
            throw new Error('Failed to fetch superheroes data');
        }
        allSuperheroes = await response.json();
        populatePublisherFilter();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Failed to load superheroes. Please try again later.';
        errorMessage.classList.remove('hidden');
    } finally {
        isLoading = false;
        loadingIndicator.classList.add('hidden');
    }
}

// Populate publisher filter
function populatePublisherFilter() {
    const publishers = [...new Set(allSuperheroes.map(hero => hero.biography.publisher).filter(Boolean))];
    publishers.sort();
    publisherFilter.innerHTML = '<option value="">All</option>' + 
        publishers.map(publisher => `<option value="${publisher}">${publisher}</option>`).join('');
}

// Apply filters and sort
function applyFiltersAndSort() {
    const searchTerm = searchBar.value.toLowerCase();
    const alignment = alignmentFilter.value;
    const gender = genderFilter.value;
    const publisher = publisherFilter.value;

    displayedSuperheroes = allSuperheroes.filter(hero => {
        return hero.name.toLowerCase().includes(searchTerm) &&
               (!alignment || hero.biography.alignment === alignment) &&
               (!gender || hero.appearance.gender === gender) &&
               (!publisher || hero.biography.publisher === publisher);
    });

    sortSuperheroes();
    updateURL();
    renderTable();
}

// Sort superheroes
function sortSuperheroes() {
    displayedSuperheroes.sort((a, b) => {
        let valueA = getNestedProperty(a, currentSortColumn);
        let valueB = getNestedProperty(b, currentSortColumn);

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return currentSortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}

// Get nested property
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => (current && current[key] !== undefined) ? current[key] : null, obj);
}

// Render table
function renderTable() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageHeroes = pageSize === 'all' ? displayedSuperheroes : displayedSuperheroes.slice(startIndex, endIndex);

    superheroTableBody.innerHTML = pageHeroes.map(hero => `
        <tr data-id="${hero.id}">
            <td><img src="${hero.images.xs}" alt="${hero.name}" class="superhero-icon"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName || '-'}</td>
            <td>${hero.powerstats.intelligence}</td>
            <td>${hero.powerstats.strength}</td>
            <td>${hero.powerstats.speed}</td>
            <td>${hero.powerstats.durability}</td>
            <td>${hero.powerstats.power}</td>
            <td>${hero.powerstats.combat}</td>
            <td>${hero.appearance.race || '-'}</td>
            <td>${hero.appearance.gender}</td>
            <td>${hero.appearance.height[1]}</td>
            <td>${hero.appearance.weight[1]}</td>
            <td>${hero.biography.placeOfBirth || '-'}</td>
            <td>${hero.biography.alignment}</td>
        </tr>
    `).join('');

    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(displayedSuperheroes.length / pageSize);
    currentPageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || pageSize === 'all';
    paginationControls.classList.toggle('hidden', pageSize === 'all' || totalPages === 1);
}

// Show hero details
function showHeroDetails(heroId) {
    const hero = allSuperheroes.find(h => h.id === heroId);
    if (!hero) return;

    detailContent.innerHTML = `
        <img src="${hero.images.lg}" alt="${hero.name}">
        <h2>${hero.name}</h2>
        <p><strong>Full Name:</strong> ${hero.biography.fullName || '-'}</p>
        <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
        <p><strong>Gender:</strong> ${hero.appearance.gender}</p>
        <p><strong>Race:</strong> ${hero.appearance.race || '-'}</p>
        <p><strong>Height:</strong> ${hero.appearance.height[1]}</p>
        <p><strong>Weight:</strong> ${hero.appearance.weight[1]}</p>
        <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth || '-'}</p>
        <p><strong>Publisher:</strong> ${hero.biography.publisher || '-'}</p>
        <h3>Powerstats</h3>
        <p>Intelligence: ${hero.powerstats.intelligence}</p>
        <p>Strength: ${hero.powerstats.strength}</p>
        <p>Speed: ${hero.powerstats.speed}</p>
        <p>Durability: ${hero.powerstats.durability}</p>
        <p>Power: ${hero.powerstats.power}</p>
        <p>Combat: ${hero.powerstats.combat}</p>
    `;

    detailModal.style.display = 'block';
    updateURL(heroId);
}

// Update URL
function updateURL(heroId = null) {
    const params = new URLSearchParams();
    if (searchBar.value) params.set('search', searchBar.value);
    if (alignmentFilter.value) params.set('alignment', alignmentFilter.value);
    if (genderFilter.value) params.set('gender', genderFilter.value);
    if (publisherFilter.value) params.set('publisher', publisherFilter.value);
    params.set('sort', currentSortColumn);
    params.set('order', currentSortOrder);
    params.set('page', currentPage);
    params.set('pageSize', pageSize);
    if (heroId) params.set('heroId', heroId);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.pushState(null, '', newUrl);
}

// Load state from URL
function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    searchBar.value = params.get('search') || '';
    alignmentFilter.value = params.get('alignment') || '';
    genderFilter.value = params.get('gender') || '';
    publisherFilter.value = params.get('publisher') || '';
    currentSortColumn = params.get('sort') || 'name';
    currentSortOrder = params.get('order') || 'asc';
    currentPage = parseInt(params.get('page')) || 1;
    pageSize = params.get('pageSize') || '20';
    pageSizeSelect.value = pageSize;

    const heroId = params.get('heroId');
    if (heroId) {
        showHeroDetails(parseInt(heroId));
    }

    applyFiltersAndSort();
}

// Event listeners
searchBar.addEventListener('input', () => {
    currentPage = 1;
    applyFiltersAndSort();
});

filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
});

alignmentFilter.addEventListener('change', applyFiltersAndSort);
genderFilter.addEventListener('change', applyFiltersAndSort);
publisherFilter.addEventListener('change', applyFiltersAndSort);

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 300);
});

pageSizeSelect.addEventListener('change', () => {
    pageSize = pageSizeSelect.value;
    currentPage = 1;
    applyFiltersAndSort();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        updateURL();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(displayedSuperheroes.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        updateURL();
    }
});

superheroTable.addEventListener('click', (e) => {
    const headerCell = e.target.closest('th');
    if (headerCell && headerCell.dataset.sort) {
        const newSortColumn = headerCell.dataset.sort;
        if (newSortColumn === currentSortColumn) {
            currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = newSortColumn;
            currentSortOrder = 'asc';
        }
        sortSuperheroes();
        renderTable();
        updateURL();
    }
});

superheroTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row) {
        const heroId = parseInt(row.dataset.id);
        showHeroDetails(heroId);
    }
});

detailModal.querySelector('.close').addEventListener('click', () => {
    detailModal.style.display = 'none';
    updateURL();
});

window.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        detailModal.style.display = 'none';
        updateURL();
    }
});

// Initialize
fetchSuperheroes().then(() => {
    loadStateFromURL();
});
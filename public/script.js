let heroes = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'name';
let sortOrder = 'asc';
let searchTerm = '';

function fetchHeroes() {
  fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(data => {
      heroes = data;
      updateURL();
      renderTable();
    });
}

function renderTable() {
  const filteredHeroes = filterHeroes();
  const sortedHeroes = sortHeroes(filteredHeroes);
  const paginatedHeroes = paginateHeroes(sortedHeroes);

  const tableBody = document.querySelector('tbody');
  tableBody.innerHTML = '';

  paginatedHeroes.forEach(hero => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${hero.images.xs}" alt="${hero.name}" width="50"></td>
      <td>${hero.name}</td>
      <td>${hero.biography.fullName}</td>
      <td>${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join(', ')}</td>
      <td>${hero.appearance.race || 'Unknown'}</td>
      <td>${hero.appearance.gender}</td>
      <td>${hero.appearance.height[1]}</td>
      <td>${hero.appearance.weight[1]}</td>
      <td>${hero.biography.placeOfBirth}</td>
      <td>${hero.biography.alignment}</td>
    `;
    row.addEventListener('click', () => showHeroDetails(hero));
    tableBody.appendChild(row);
  });

  updatePagination();
}

function filterHeroes() {
  return heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

function sortHeroes(heroes) {
  return heroes.sort((a, b) => {
    let valueA = getNestedProperty(a, sortColumn);
    let valueB = getNestedProperty(b, sortColumn);

    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;

    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function paginateHeroes(heroes) {
    if (pageSize === 'all') {
        return heroes;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return heroes.slice(startIndex, startIndex + pageSize);
}

function updatePagination() {
  const totalPages = Math.ceil(filterHeroes().length / pageSize);
  document.getElementById('currentPage').textContent = `Page ${currentPage} of ${totalPages}`;
}

function showHeroDetails(hero) {
  const modal = document.getElementById('heroModal');
  const details = document.getElementById('heroDetails');
  details.innerHTML = `
    <h2>${hero.name}</h2>
    <img src="${hero.images.md}" alt="${hero.name}">
    <p>Full Name: ${hero.biography.fullName}</p>
    <p>Powerstats: ${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
    <p>Race: ${hero.appearance.race || 'Unknown'}</p>
    <p>Gender: ${hero.appearance.gender}</p>
    <p>Height: ${hero.appearance.height[1]}</p>
    <p>Weight: ${hero.appearance.weight[1]}</p>
    <p>Place of Birth: ${hero.biography.placeOfBirth}</p>
    <p>Alignment: ${hero.biography.alignment}</p>
  `;
  modal.style.display = 'block';
}

function updateURL() {
  const params = new URLSearchParams();
  params.set('page', currentPage);
  params.set('pageSize', pageSize);
  params.set('sort', sortColumn);
  params.set('order', sortOrder);
  params.set('search', searchTerm);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  currentPage = parseInt(params.get('page')) || 1;
  pageSize = parseInt(params.get('pageSize')) || 20;
  sortColumn = params.get('sort') || 'name';
  sortOrder = params.get('order') || 'asc';
  searchTerm = params.get('search') || '';
  
  document.getElementById('pageSize').value = pageSize;
  document.getElementById('searchInput').value = searchTerm;
}

document.addEventListener('DOMContentLoaded', () => {
  loadFromURL();
  fetchHeroes();

  document.getElementById('pageSize').addEventListener('change', (e) => {
    pageSize = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    updateURL();
    renderTable();
});

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    currentPage = 1;
    updateURL();
    renderTable();
  });

  document.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.column;
      if (sortColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortOrder = 'asc';
      }
      updateURL();
      renderTable();
    });
  });

  document.querySelector('.pagination').addEventListener('click', (e) => {
    if (e.target.classList.contains('prev') && currentPage > 1) {
      currentPage--;
    } else if (e.target.classList.contains('next') && currentPage < Math.ceil(filterHeroes().length / pageSize)) {
      currentPage++;
    }
    updateURL();
    renderTable();
  });

  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('heroModal').style.display = 'none';
  });
});
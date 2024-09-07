let heroes = [];
let filteredHeroes = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'name';
let sortDirection = 'asc';

const heroTable = document.getElementById('heroTable');
const tableBody = heroTable.querySelector('tbody');
const searchInput = document.getElementById('search');
const pageSizeSelect = document.getElementById('pageSize');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const modal = document.getElementById('heroModal');
const modalContent = document.querySelector('.modal-content');
const closeModal = document.querySelector('.close');

// Fetch data from API
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then(response => response.json())
  .then(data => {
    heroes = data;
    filteredHeroes = [...heroes];
    renderTable();
    updatePagination();
  });

// Search functionality
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm) ||
    hero.biography.fullName.toLowerCase().includes(searchTerm)
  );
  currentPage = 1;
  renderTable();
  updatePagination();
});

// Sorting functionality
heroTable.querySelector('thead').addEventListener('click', (e) => {
  const th = e.target.closest('th');
  if (!th) return;
  
  const column = th.dataset.sort;
  if (column === sortColumn) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  
  sortHeroes();
  renderTable();
});

// Pagination
pageSizeSelect.addEventListener('change', () => {
  pageSize = pageSizeSelect.value === 'all' ? filteredHeroes.length : Number(pageSizeSelect.value);
  currentPage = 1;
  renderTable();
  updatePagination();
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
    updatePagination();
  }
});

nextPageBtn.addEventListener('click', () => {
  const maxPage = Math.ceil(filteredHeroes.length / pageSize);
  if (currentPage < maxPage) {
    currentPage++;
    renderTable();
    updatePagination();
  }
});

// Modal functionality
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

function sortHeroes() {
  filteredHeroes.sort((a, b) => {
    let valueA, valueB;
    
    switch(sortColumn) {
      case 'name':
      case 'fullName':
      case 'race':
      case 'gender':
      case 'placeOfBirth':
      case 'alignment':
        valueA = a[sortColumn === 'fullName' ? 'biography' : sortColumn === 'race' || sortColumn === 'gender' ? 'appearance' : sortColumn][sortColumn === 'fullName' ? 'fullName' : sortColumn] || '';
        valueB = b[sortColumn === 'fullName' ? 'biography' : sortColumn === 'race' || sortColumn === 'gender' ? 'appearance' : sortColumn][sortColumn === 'fullName' ? 'fullName' : sortColumn] || '';
        break;
      case 'powerstats':
        valueA = Object.values(a.powerstats).reduce((sum, stat) => sum + stat, 0);
        valueB = Object.values(b.powerstats).reduce((sum, stat) => sum + stat, 0);
        break;
      case 'height':
      case 'weight':
        valueA = parseFloat(a.appearance[sortColumn][1]) || 0;
        valueB = parseFloat(b.appearance[sortColumn][1]) || 0;
        break;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

function renderTable() {
  sortHeroes();
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageHeroes = filteredHeroes.slice(start, end);
  
  tableBody.innerHTML = '';
  pageHeroes.forEach(hero => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${hero.images.xs}" alt="${hero.name}" width="30" height="30"> ${hero.name}</td>
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
}

function updatePagination() {
  const maxPage = Math.ceil(filteredHeroes.length / pageSize);
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === maxPage;
  currentPageSpan.textContent = `Page ${currentPage} of ${maxPage}`;
}

function showHeroDetails(hero) {
  modal.style.display = 'block';
  modalContent.querySelector('#heroDetails').innerHTML = `
    <h2>${hero.name}</h2>
    <img src="${hero.images.lg}" alt="${hero.name}">
    <p><strong>Full Name:</strong> ${hero.biography.fullName}</p>
    <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth}</p>
    <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
    <p><strong>First Appearance:</strong> ${hero.biography.firstAppearance}</p>
    <p><strong>Publisher:</strong> ${hero.biography.publisher}</p>
    <p><strong>Powerstats:</strong> ${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
  `;
}

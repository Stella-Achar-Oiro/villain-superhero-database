let heroes = [];
let sortColumn = 'name';
let sortDirection = 'asc';
let searchTerm = '';
let currentPage = 1;
let pageSize = 20;

const loadData = (data) => {
  heroes = data;
  renderTable();
  setupPagination();
  updateURL();
};

const renderTable = () => {
  const tableBody = document.getElementById('heroesTableBody');
  
  const filteredHeroes = filterHeroes();
  const sortedHeroes = sortHeroes(filteredHeroes);
  const paginatedHeroes = paginateHeroes(sortedHeroes);
  
  tableBody.innerHTML = '';
  
  paginatedHeroes.forEach(hero => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${hero.images.xs}" alt="${hero.name}" width="50" height="50"></td>
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
};

const filterHeroes = () => {
  const searchField = document.getElementById('searchField').value;
  return heroes.filter(hero => {
    if (searchTerm === '') return true;
    if (searchField === 'all') {
      return Object.values(hero).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      const value = searchField === 'fullName' ? hero.biography.fullName : hero[searchField];
      return typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });
};

const sortHeroes = (heroesToSort) => {
  return heroesToSort.sort((a, b) => {
    let valueA, valueB;
    
    switch(sortColumn) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'fullName':
        valueA = a.biography.fullName.toLowerCase();
        valueB = b.biography.fullName.toLowerCase();
        break;
      case 'race':
        valueA = (a.appearance.race || '').toLowerCase();
        valueB = (b.appearance.race || '').toLowerCase();
        break;
      case 'gender':
        valueA = a.appearance.gender.toLowerCase();
        valueB = b.appearance.gender.toLowerCase();
        break;
      case 'height':
        valueA = parseFloat(a.appearance.height[1]);
        valueB = parseFloat(b.appearance.height[1]);
        break;
      case 'weight':
        valueA = parseFloat(a.appearance.weight[1]);
        valueB = parseFloat(b.appearance.weight[1]);
        break;
      case 'placeOfBirth':
        valueA = a.biography.placeOfBirth.toLowerCase();
        valueB = b.biography.placeOfBirth.toLowerCase();
        break;
      case 'alignment':
        valueA = a.biography.alignment.toLowerCase();
        valueB = b.biography.alignment.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (valueA === valueB) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;
    
    return (valueA > valueB ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1);
  });
};

const paginateHeroes = (sortedHeroes) => {
  if (pageSize === 'all') return sortedHeroes;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return sortedHeroes.slice(start, end);
};

const setupPagination = () => {
  const paginationContainer = document.getElementById('pagination');
  const filteredHeroes = filterHeroes();
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredHeroes.length / pageSize);
  
  paginationContainer.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    if (i === currentPage) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      currentPage = i;
      renderTable();
      setupPagination();
      updateURL();
    });
    paginationContainer.appendChild(button);
  }
};

const showHeroDetails = (hero) => {
  const modal = document.getElementById('heroModal');
  const heroDetails = document.getElementById('heroDetails');
  
  heroDetails.innerHTML = `
    <h2>${hero.name}</h2>
    <img src="${hero.images.md}" alt="${hero.name}">
    <p><strong>Full Name:</strong> ${hero.biography.fullName}</p>
    <p><strong>Alias:</strong> ${hero.biography.aliases.join(', ')}</p>
    <p><strong>Publisher:</strong> ${hero.biography.publisher}</p>
    <p><strong>First Appearance:</strong> ${hero.biography.firstAppearance}</p>
    <p><strong>Powerstats:</strong> ${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
    <p><strong>Race:</strong> ${hero.appearance.race || 'Unknown'}</p>
    <p><strong>Gender:</strong> ${hero.appearance.gender}</p>
    <p><strong>Height:</strong> ${hero.appearance.height.join(', ')}</p>
    <p><strong>Weight:</strong> ${hero.appearance.weight.join(', ')}</p>
    <p><strong>Eye Color:</strong> ${hero.appearance.eyeColor}</p>
    <p><strong>Hair Color:</strong> ${hero.appearance.hairColor}</p>
    <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth}</p>
    <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
    <p><strong>Occupation:</strong> ${hero.work.occupation}</p>
    <p><strong>Base:</strong> ${hero.work.base}</p>
    <p><strong>Group Affiliation:</strong> ${hero.connections.groupAffiliation}</p>
    <p><strong>Relatives:</strong> ${hero.connections.relatives}</p>
  `;
  
  modal.style.display = 'block';
};

const updateURL = () => {
  const params = new URLSearchParams({
    sort: sortColumn,
    direction: sortDirection,
    search: searchTerm,
    page: currentPage,
    pageSize: pageSize
  });
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
};

const loadFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  sortColumn = params.get('sort') || 'name';
  sortDirection = params.get('direction') || 'asc';
  searchTerm = params.get('search') || '';
  currentPage = parseInt(params.get('page')) || 1;
  pageSize = params.get('pageSize') || '20';

  document.getElementById('search').value = searchTerm;
  document.getElementById('pageSize').value = pageSize;
};

// Event Listeners
document.getElementById('search').addEventListener('input', (event) => {
  searchTerm = event.target.value;
  currentPage = 1;
  renderTable();
  setupPagination();
  updateURL();
});

document.getElementById('searchField').addEventListener('change', () => {
  renderTable();
  setupPagination();
  updateURL();
});

document.getElementById('pageSize').addEventListener('change', (event) => {
  pageSize = event.target.value;
  currentPage = 1;
  renderTable();
  setupPagination();
  updateURL();
});

document.querySelectorAll('th').forEach(th => {
  th.addEventListener('click', () => {
    const sortKey = th.dataset.sort;
    if (sortColumn === sortKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = sortKey;
      sortDirection = 'asc';
    }
    renderTable();
    updateURL();
  });
});

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('heroModal').style.display = 'none';
});

// Initial load
loadFromURL();
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then((response) => response.json())
  .then(loadData);
let heroes = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'name';
let sortDirection = 'asc';

const loadData = (data) => {
  heroes = data;
  renderTable();
  setupPagination();
  updateURL();
};

const renderTable = () => {
  const tableBody = document.getElementById('heroesTableBody');
  const searchTerm = document.getElementById('search').value.toLowerCase();
  
  const filteredHeroes = heroes.filter(hero =>
    hero.name.toLowerCase().includes(searchTerm) ||
    hero.biography.fullName.toLowerCase().includes(searchTerm)
  );
  
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

const sortHeroes = (heroesToSort) => {
  return heroesToSort.sort((a, b) => {
    let valueA, valueB;
    
    switch(sortColumn) {
      case 'name':
      case 'fullName':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
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
  const start = (currentPage - 1) * pageSize;
  const end = pageSize === 'all' ? sortedHeroes.length : start + pageSize;
  return sortedHeroes.slice(start, end);
};

const setupPagination = () => {
  const paginationContainer = document.getElementById('pagination');
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(heroes.length / pageSize);
  
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
    <img src="${hero.images.md}" alt="${hero.name}" width="200">
    <p><strong>Full Name:</strong> ${hero.biography.fullName}</p>
    <p><strong>Alias:</strong> ${hero.biography.aliases.join(', ')}</p>
    <p><strong>Publisher:</strong> ${hero.biography.publisher}</p>
    <p><strong>First Appearance:</strong> ${hero.biography.firstAppearance}</p>
    <p><strong>Powerstats:</strong> ${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
    <p><strong>Race:</strong> ${hero.appearance.race || 'Unknown'}</p>
    <p><strong>Gender:</strong> ${hero.appearance.gender}</p>
    <p><strong>Height:</strong> ${hero.appearance.height.join(', ')}</p>
    <p><strong>Weight:</strong> ${hero.appearance.weight.join(', ')}</p>
    <p><strong>Place of Birth:</strong> ${hero.biography.placeOfBirth}</p>
    <p><strong>Alignment:</strong> ${hero.biography.alignment}</p>
  `;
  
  modal.style.display = 'block';
};

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('heroModal').style.display = 'none';
});

const updateURL = () => {
  const queryString = `?page=${currentPage}&size=${pageSize}&sort=${sortColumn}&direction=${sortDirection}`;
  window.history.replaceState(null, '', queryString);
};

// Initial Fetch
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then((response) => response.json())
  .then(loadData);

// Event Listeners
document.getElementById('search').addEventListener('input', () => {
  currentPage = 1;
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
    setupPagination();
    updateURL();
  });
});

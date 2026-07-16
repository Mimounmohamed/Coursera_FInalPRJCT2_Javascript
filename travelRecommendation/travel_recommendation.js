let travelData = null;

fetch('travel_recommendation_api.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    travelData = data;
    console.log('Data loaded:', travelData);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

document.getElementById('search-btn').addEventListener('click', function() {
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();

  if (!keyword || !travelData) {
    return;
  }

  let results = [];

  if (keyword.includes('beach')) {
    results = travelData.beaches;
  }
  else if (keyword.includes('temple')) {
    results = travelData.temples;
  }
  else {
    travelData.countries.forEach(country => {
      if (country.name.toLowerCase().includes(keyword)) {
        results = results.concat(country.cities);
      }
    });

    if (results.length === 0) {
      travelData.countries.forEach(country => {
        country.cities.forEach(city => {
          if (city.name.toLowerCase().includes(keyword)) {
            results.push(city);
          }
        });
      });
    }
  }

  document.querySelector('.hero-content').style.display = 'none';
  displayResults(results);
});

document.getElementById('reset-btn').addEventListener('click', function() {
  document.getElementById('search-input').value = '';
  document.getElementById('results-container').innerHTML = '';
  document.querySelector('.hero-content').style.display = 'block';
});

function displayResults(results) {
  const container = document.getElementById('results-container');
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<p class="no-results">No results found. Try a different keyword.</p>';
    return;
  }

  const title = document.createElement('h2');
  title.className = 'results-title';
  title.textContent = 'Search Results';
  container.appendChild(title);

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'cards-wrapper';

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    `;
    cardsWrapper.appendChild(card);
  });

  container.appendChild(cardsWrapper);
}
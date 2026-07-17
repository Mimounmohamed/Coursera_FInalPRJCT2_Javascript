let travelData = null;

const cityTimeZones = {
  "Sydney, Australia": "Australia/Sydney",
  "Melbourne, Australia": "Australia/Melbourne",
  "Tokyo, Japan": "Asia/Tokyo",
  "Kyoto, Japan": "Asia/Tokyo",
  "Rio de Janeiro, Brazil": "America/Sao_Paulo",
  "São Paulo, Brazil": "America/Sao_Paulo",
  "Angkor Wat, Cambodia": "Asia/Phnom_Penh",
  "Taj Mahal, India": "Asia/Kolkata",
  "Bora Bora, French Polynesia": "Pacific/Tahiti",
  "Copacabana Beach, Brazil": "America/Sao_Paulo"
};

function getLocalTime(cityName) {
  const timeZone = cityTimeZones[cityName];
  if (!timeZone) {
    return null;
  }
  const options = {
    timeZone: timeZone,
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  return new Date().toLocaleTimeString('en-US', options);
}

// Fetch and store the data once when the page loads
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

// Search button click handler
document.getElementById('search-btn').addEventListener('click', function() {
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();

  if (!keyword || !travelData) {
    return;
  }

  const results = getSearchResults(keyword);

  document.querySelector('.hero-content').style.display = 'none';
  displayResults(results);
});

// Reset button click handler
document.getElementById('reset-btn').addEventListener('click', function() {
  document.getElementById('search-input').value = '';
  document.getElementById('results-container').innerHTML = '';
  document.querySelector('.hero-content').style.display = 'block';
});

// Generic search across every keyword in the JSON: category names,
// country names, and city names all match, singular or plural, any case.
function getSearchResults(keyword) {
  let results = [];

  // Category-level keywords
  if (keyword.includes('beach')) {
    results = results.concat(travelData.beaches);
  }
  if (keyword.includes('temple')) {
    results = results.concat(travelData.temples);
  }
  if (keyword.includes('countr')) { // matches "country" and "countries"
    travelData.countries.forEach(country => {
      results = results.concat(country.cities);
    });
  }

  // If no category matched yet, try matching a specific country name
  if (results.length === 0) {
    travelData.countries.forEach(country => {
      if (country.name.toLowerCase().includes(keyword)) {
        results = results.concat(country.cities);
      }
    });
  }

  // If still nothing, try matching individual city names
  if (results.length === 0) {
    travelData.countries.forEach(country => {
      country.cities.forEach(city => {
        if (city.name.toLowerCase().includes(keyword)) {
          results.push(city);
        }
      });
    });
  }

  // If still nothing, try matching individual temple or beach names directly
  if (results.length === 0) {
    travelData.temples.forEach(temple => {
      if (temple.name.toLowerCase().includes(keyword)) {
        results.push(temple);
      }
    });
    travelData.beaches.forEach(beach => {
      if (beach.name.toLowerCase().includes(keyword)) {
        results.push(beach);
      }
    });
  }

  // Remove duplicates in case a keyword matched more than one rule
  const uniqueResults = [];
  const seenNames = new Set();
  results.forEach(item => {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueResults.push(item);
    }
  });

  return uniqueResults;
}

// Render result cards in a responsive grid
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
    const localTime = getLocalTime(item.name);
    const timeHtml = localTime
      ? `<p class="local-time">🕒 Local time: ${localTime}</p>`
      : '';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      ${timeHtml}
    `;
    cardsWrapper.appendChild(card);
  });

  container.appendChild(cardsWrapper);
}
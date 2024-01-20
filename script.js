document.addEventListener('DOMContentLoaded', function () {
  const slidesContainer = document.querySelector('.slides');
  let currentPage = 1;
  const repositoriesPerPage = 10; 
  let totalPages = 1;
  
  function createRepositoryElement(repoData) {
    const repoElement = document.createElement('div');
    repoElement.className = 'repository';

    repoElement.innerHTML = `
      <h1 class="repository-name">${repoData.name}</h1>
      <h5 class="repository-description">${repoData.description || 'No description available'}</h5>
      <div class="topics">
        <button class="topic">${repoData.language || 'Unknown'}</button>
      </div>
    `;

    return repoElement;
  }

  function showRepositories(page) {
    const startIndex = (page - 1) * repositoriesPerPage;
    const endIndex = startIndex + repositoriesPerPage;

    slidesContainer.innerHTML = '';

    for (let i = startIndex; i < Math.min(endIndex, repositoriesData.length); i++) {
      const repoData = repositoriesData[i];
      const repoElement = createRepositoryElement(repoData);
      
      if (i % repositoriesPerPage === 0) {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        slidesContainer.appendChild(slideElement);
      }

      const currentSlide = slidesContainer.lastElementChild;
      currentSlide.appendChild(repoElement);
    }
  }

  function createPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const span = document.createElement('span');
      span.innerText = i;
      span.addEventListener('click', () => {
        currentPage = i;
        showRepositories(currentPage);
        updatePagination();
      });
      paginationContainer.appendChild(span);
    }

    updatePagination();
  }

  function updatePagination() {
    const paginationSpans = document.getElementById('pagination').querySelectorAll('span');
    paginationSpans.forEach((span, index) => {
      span.classList.toggle('active', index + 1 === currentPage);
    });
  }

  function navigatePage(direction) {
    const newPage = currentPage + direction;

    if (newPage > totalPages) {
      currentPage = 1; 
    } else if (newPage < 1) {
      currentPage = totalPages;
    } else {
      currentPage = newPage;
    }

    showRepositories(currentPage);
    updatePagination();
  }

  document.querySelector('.next').addEventListener('click', () => navigatePage(1));
  document.querySelector('.prev').addEventListener('click', () => navigatePage(-1));

  document.getElementById('submit-link').addEventListener('click', async function () {
    const githubLink = document.getElementById('github-link').value;

    if (githubLink.startsWith('https://github.com/')) {
      const username = extractUsernameFromLink(githubLink);
      if (username) {
        await fetchDataFromGitHub(username);
      } else {
        alert('Invalid GitHub link. Please enter a valid link.');
      }
    } else {
      alert('Invalid GitHub link. Please enter a valid link.');
    }
  });

  async function fetchDataFromGitHub(username) {
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);

      if (!userResponse.ok) {
        throw new Error('User not found on GitHub');
      }

      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories data from GitHub');
      }

      const [userData, userRepos] = await Promise.all([userResponse.json(), reposResponse.json()]);
      displayUserData(userData, userRepos);

      // Hide the user input section
      document.getElementById('user-input').style.display = 'none';
    } catch (error) {
      console.error(error.message);
      if (error.message === 'User not found on GitHub') {
        alert('User not found on GitHub. Please enter a valid username.');
      } else {
        alert('Failed to fetch data from GitHub. Please try again.');
      }
    }
  }

  function displayUserData(userData, userRepos) {
    const usernameElement = document.querySelector('.username');
    const actualNameElement = document.querySelector('.actual-name');
    const userBioElement = document.querySelector('.userbio');
    const locationElement = document.querySelector('.homelocation');
    const githubLinkElement = document.querySelector('.github-link');
    const userAvatar = document.getElementById('user-avatar');
    const socialMediaContainer = document.querySelector('.usersocialmedia');
    const vcardDetails = document.querySelectorAll('.vcard-details li');
  
    usernameElement.textContent = userData.login || '';
    actualNameElement.textContent = userData.name || '';
    userBioElement.textContent = userData.bio || 'No bio available';
  
    if (userData.location) {
      locationElement.style.display = 'flex';
      locationElement.querySelector('h1').textContent = userData.location;
    } else {
      locationElement.style.display = 'none';
    }
  
    githubLinkElement.querySelector('h1').textContent = userData.html_url || 'GitHub link not available';
  
    userAvatar.src = userData.avatar_url || 'https://placekitten.com/200/200';
    userAvatar.alt = userData.login;
  
    vcardDetails.forEach(detail => {
      const label = detail.querySelector('.p-label').textContent.trim();
      const value = detail.querySelector('.p-org, .p-location').textContent.trim();
  
      if (label.toLowerCase().includes('twitter') || label.toLowerCase().includes('linkedin') || label.toLowerCase().includes('instagram')) {
        const socialMediaLink = createSocialMediaLink(label.toLowerCase(), value);
        socialMediaContainer.appendChild(socialMediaLink);
      }
    });
  
    if (socialMediaContainer.children.length === 0) {
      socialMediaContainer.textContent = 'No social media links available';
    }
  
    repositoriesData = [];
  
    if (Array.isArray(userRepos)) {
      userRepos.forEach(repo => {
        const repoData = {
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Unknown',
        };
        repositoriesData.push(repoData);
      });
    }
  
    showRepositories(1);
    totalPages = Math.ceil(repositoriesData.length / repositoriesPerPage);
    createPagination();
    document.getElementById('main-container').style.display = 'block';
  }
  
  function extractUsernameFromLink(link) {
    const parts = link.split('/');
    return parts.length >= 4 ? parts[3] : null;
  }
});

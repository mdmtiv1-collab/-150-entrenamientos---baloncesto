// =============================================================================
// BasketballPro Members Area - Spanish Version
// Dynamic Loading of Spanish Translations
// =============================================================================

let categories = [];

// DOM Elements
const sidebarNav = document.getElementById('sidebar-nav');
const exerciseList = document.getElementById('exercise-list');
const videoTitle = document.getElementById('video-title');
const videoDifficulty = document.getElementById('video-difficulty');
const videoDuration = document.getElementById('video-duration');
const videoDesc = document.getElementById('video-desc');
const instructionList = document.getElementById('instruction-list');
const completeBtn = document.getElementById('complete-btn');
const progressText = document.getElementById('progress-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const videoPlaceholder = document.getElementById('video-placeholder');
const videoPlayer = document.getElementById('video-player');
const videoIframe = document.getElementById('video-iframe');

// App State
let currentCategoryId = "arremesso";
let currentExerciseId = "arr_1";
let completedExercises = JSON.parse(localStorage.getItem('completedExercises_es')) || JSON.parse(localStorage.getItem('completedExercises')) || [];

// Initialization
async function init() {
  try {
    // Show loading text in UI
    videoTitle.textContent = "Cargando entrenamientos...";
    
    // Fetch all categories data in parallel
    const [arremesso, resistencia, passe, drible, velocidade, defesa] = await Promise.all([
      fetch('data/arremesso.json').then(r => r.json()),
      fetch('data/resistencia.json').then(r => r.json()),
      fetch('data/passe.json').then(r => r.json()),
      fetch('data/drible.json').then(r => r.json()),
      fetch('data/velocidade.json').then(r => r.json()),
      fetch('data/defesa.json').then(r => r.json())
    ]);

    categories = [
      { id: "arremesso", title: "Ejercicios de Tiro", emoji: "🏀", exercises: arremesso },
      { id: "resistencia", title: "Resistencia y Físico", emoji: "🏃‍♂️", exercises: resistencia },
      { id: "passe", title: "Ejercicios de Pase", emoji: "🏀", exercises: passe },
      { id: "drible", title: "Dribling y Control", emoji: "👟", exercises: drible },
      { id: "velocidade", title: "Velocidad y Agilidad", emoji: "⚡", exercises: velocidade },
      { id: "defesa", title: "Sistemas de Defensa", emoji: "🛡️", exercises: defesa }
    ];

    renderCategories();
    renderExercises(currentCategoryId);
    loadExercise(currentCategoryId, currentExerciseId);
    updateProgress();
  } catch (error) {
    console.error("Error cargando los entrenamientos:", error);
    videoTitle.textContent = "Error cargando la lista. Intente recargar la página.";
  }
}

// Render the Sidebar Categories
function renderCategories() {
  sidebarNav.innerHTML = '';
  categories.forEach(cat => {
    const completedInCat = cat.exercises.filter(ex => completedExercises.includes(ex.id)).length;
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat.id === currentCategoryId ? 'active' : ''}`;
    btn.onclick = () => selectCategory(cat.id);
    btn.innerHTML = `
      <span>${cat.emoji} ${cat.title}</span>
      <span class="category-count" id="count-${cat.id}">${completedInCat}/${cat.exercises.length}</span>
    `;
    sidebarNav.appendChild(btn);
  });
}

// Render the Exercise List for a specific category
function renderExercises(categoryId) {
  exerciseList.innerHTML = '';
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;

  category.exercises.forEach(ex => {
    const isCompleted = completedExercises.includes(ex.id);
    const card = document.createElement('div');
    card.className = `exercise-card ${ex.id === currentExerciseId ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    card.onclick = () => selectExercise(ex.id);
    card.innerHTML = `
      <div class="card-status-icon">✓</div>
      <div class="card-info">
        <h4 class="card-title">${ex.title}</h4>
        <span class="card-meta">${ex.difficulty} • ${ex.duration}</span>
      </div>
    `;
    exerciseList.appendChild(card);
  });
}

// Load detailed information of a selected exercise
function loadExercise(categoryId, exerciseId) {
  const category = categories.find(c => c.id === categoryId);
  const exercise = category?.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  currentExerciseId = exerciseId;

  // Update detail view texts
  videoTitle.textContent = exercise.title;
  videoDifficulty.textContent = exercise.difficulty;
  videoDuration.textContent = exercise.duration;
  videoDesc.textContent = exercise.desc;

  // Reset player preview states
  videoPlaceholder.style.display = 'flex';
  videoPlayer.style.display = 'none';
  videoIframe.style.display = 'none';
  videoPlayer.src = '';
  videoIframe.src = '';

  // Get YouTube ID
  const youtubeId = exercise.youtubeId;

  // Set background for placeholder
  videoPlaceholder.style.background = `url('https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg') center/cover no-repeat`;

  // Set external link
  const extLink = document.getElementById('external-video-link');
  if (extLink) {
    extLink.href = `https://www.youtube.com/watch?v=${youtubeId}`;
    extLink.textContent = `Ver "${exercise.title.replace(/^\d+\.\s*/, '')}" en YouTube ↗`;
  }
  
  // Render step-by-step instructions
  instructionList.innerHTML = '';
  exercise.steps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    instructionList.appendChild(li);
  });

  // Highlight selected item in list
  document.querySelectorAll('.exercise-card').forEach(card => {
    card.classList.remove('active');
  });
  const activeCard = Array.from(exerciseList.children).find((_, idx) => category.exercises[idx].id === exerciseId);
  if (activeCard) {
    activeCard.classList.add('active');
  }

  // Update the complete button state
  const isCompleted = completedExercises.includes(exerciseId);
  if (isCompleted) {
    completeBtn.classList.add('completed');
    completeBtn.innerHTML = `<span>✓ Entrenamiento Completado</span>`;
  } else {
    completeBtn.classList.remove('completed');
    completeBtn.innerHTML = `<span>Marcar como Completado</span>`;
  }
}

// Select a Category from sidebar
function selectCategory(categoryId) {
  currentCategoryId = categoryId;
  const category = categories.find(c => c.id === categoryId);
  const firstExerciseId = category.exercises[0].id;
  
  renderCategories();
  renderExercises(categoryId);
  selectExercise(firstExerciseId);
}

// Select an Exercise from playlist
function selectExercise(exerciseId) {
  currentExerciseId = exerciseId;
  loadExercise(currentCategoryId, exerciseId);
}

// Toggle completion state of exercise
function toggleComplete() {
  const index = completedExercises.indexOf(currentExerciseId);
  if (index > -1) {
    // Remove completion
    completedExercises.splice(index, 1);
  } else {
    // Complete exercise
    completedExercises.push(currentExerciseId);
  }

  // Save to LocalStorage
  localStorage.setItem('completedExercises_es', JSON.stringify(completedExercises));

  // Rerender state
  updateProgress();
  renderCategories();
  renderExercises(currentCategoryId);
  loadExercise(currentCategoryId, currentExerciseId);
}

// Update top global progress bar and category counters
function updateProgress() {
  const total = 150;
  const completed = completedExercises.length;
  const percentage = Math.round((completed / total) * 100);

  progressText.innerHTML = `Progreso del Entrenamiento: <span>${completed} de ${total}</span> (${percentage}%)`;
  progressBarFill.style.width = `${percentage}%`;
}

// Play educational YouTube video lesson when clicked
function playVideo() {
  const category = categories.find(c => c.id === currentCategoryId);
  const exercise = category?.exercises.find(ex => ex.id === currentExerciseId);
  if (!exercise) return;

  const youtubeId = exercise.youtubeId;
  videoPlaceholder.style.display = 'none';
  videoIframe.style.display = 'block';
  videoIframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

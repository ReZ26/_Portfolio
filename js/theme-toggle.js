// ===== Theme Toggle (for future use) =====
document.addEventListener('DOMContentLoaded', function() {
  const htmlElement = document.documentElement;
  
  // Check for saved theme preference, default to light
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);
});


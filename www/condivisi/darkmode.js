const toggle = document.getElementById('darkModeToggle');

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  toggle.checked = true;
}

toggle.addEventListener('change', () => {
  const dark = toggle.checked;
  document.body.classList.toggle('dark-mode', dark);
  localStorage.setItem('darkMode', dark ? 'enabled' : 'disabled');
});
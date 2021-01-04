/* dark mode: on load and on change listener */
const darkModeClass = 'dark-mode';
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  document.body.classList.add(darkModeClass);
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', e => {
    const classFunc = e.matches ? 'add' : 'remove';
    document.body.classList[classFunc](darkModeClass);
  });

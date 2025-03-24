// Load theme immediately
(function() {
    const savedTheme = localStorage.getItem('preferred-theme') || 'light-blue';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();
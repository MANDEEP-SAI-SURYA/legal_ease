document.addEventListener('DOMContentLoaded', function() {
    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const serviceFilter = document.getElementById('serviceFilter');
    const orgCards = document.querySelectorAll('.org-card');
    
    function filterOrganizations() {
        const searchText = searchInput.value.toLowerCase();
        const serviceValue = serviceFilter.value;
        
        orgCards.forEach(card => {
            const orgName = card.querySelector('h4').textContent.toLowerCase();
            const orgDescription = card.querySelector('.org-description').textContent.toLowerCase();
            const orgServices = card.getAttribute('data-services').toLowerCase();
            
            const matchesSearch = orgName.includes(searchText) || orgDescription.includes(searchText);
            const matchesService = serviceValue === '' || orgServices.includes(serviceValue.toLowerCase());
            
            if (matchesSearch && matchesService) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update result count
        const visibleCards = document.querySelectorAll('.org-card[style="display: block"]').length;
        document.querySelector('.result-count').textContent = `${visibleCards} organizations found`;
    }
    
    searchInput.addEventListener('input', filterOrganizations);
    serviceFilter.addEventListener('change', filterOrganizations);
    
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});
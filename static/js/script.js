
document.addEventListener('DOMContentLoaded', function() {
    
    const isLoggedIn = checkAuthStatus(); 
    
    if (isLoggedIn) {
        
        document.getElementById('dashboard-link').style.display = 'inline-block';
        document.getElementById('lawyers-link').style.display = 'inline-block';
    } else {
        
        document.getElementById('dashboard-link').style.display = 'none';
        document.getElementById('lawyers-link').style.display = 'none';
    }
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
});

function checkAuthStatus() {
    return false; 
}


window.addEventListener('scroll', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    const windowHeight = window.innerHeight;
    
    featureCards.forEach(card => {
        const cardPosition = card.getBoundingClientRect().top;
        if (cardPosition < windowHeight - 100) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});


function initFeatureAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    });
}


initFeatureAnimations();
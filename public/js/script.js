// Function to detect if the website is in desktop mode
function isDesktopMode() {
    return window.innerWidth >= 600; // Define desktop mode as screen width >= 600px
}

// Function to fetch the list of image filenames from the server
async function fetchImageList() {
    try {
        console.log("Fetching image list from /api/images...");
        const response = await fetch('/api/images');
        const images = await response.json();
        console.log(`Received ${images.length} images from the API:`, images);
        return images.map(filename => '/images/' + encodeURIComponent(filename));
    } catch (error) {
        console.error('Error fetching image list:', error);
        return [];
    }
}

// Function to preload an image and get its dimensions
function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            console.log(`Successfully preloaded image: ${src}`);
            resolve({
                src: src,
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            });
        };

        img.onerror = (e) => {
            console.error(`Failed to preload image: ${src}`, e);
            resolve(null); // Continue with other images
        };

        img.src = src;
    });
}

// Function to create a placeholder element
function createPlaceholder(aspectRatio, img) {
    const placeholder = document.createElement('div');
    placeholder.classList.add('image-placeholder');
    placeholder.style.position = 'relative';
    placeholder.style.width = '100%';
    placeholder.style.overflow = 'hidden';
    placeholder.style.paddingTop = `${(1 / aspectRatio) * 100}%`; // Maintain aspect ratio

    // Style the img to fit inside the placeholder
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    // Initially hide the image
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease-in-out';

    // Append img to the placeholder
    placeholder.appendChild(img);

    return placeholder;
}

// Initialize Intersection Observer for lazy loading images
const observerOptions = {
    root: null,
    rootMargin: '0px 0px 300px 0px', // Load images 300px before they enter the viewport
    threshold: 0.01
};

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src; // Start loading the image
            observer.unobserve(img); // Stop observing once the image has started loading
        }
    });
}, observerOptions);

// Function to fetch the list of image filenames from the server
async function fetchImageList() {
    try {
        const response = await fetch('/api/images');
        const images = await response.json();
        return images.map((filename) => '/images/' + encodeURIComponent(filename));
    } catch (error) {
        console.error('Error fetching image list:', error);
        return [];
    }
}

// Function to preload an image and get its aspect ratio
function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ src, aspectRatio: img.naturalWidth / img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// Function to calculate the number of columns based on screen width
function getColumnCount() {
    const width = window.innerWidth;
    if (width < 600) return 2; // 2 columns for small screens
    if (width < 1200) return 3; // 3 columns for medium screens
    return 4; // 4 columns for large screens
}

// Function to create columns dynamically
function createColumns(container, columnCount) {
    container.innerHTML = ''; // Clear existing columns
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'gallery-column';
        container.appendChild(column);
        columns.push(column);
    }
    return columns;
}

// Function to distribute and display images
async function displayGalleryImages() {
    const images = await fetchImageList();
    const galleryContainer = document.querySelector('.gallery-container');
    const columnCount = getColumnCount();
    const columns = createColumns(galleryContainer, columnCount);

    const columnHeights = new Array(columnCount).fill(0); // Track column heights

    for (const src of images) {
        const imageData = await preloadImage(src);
        if (imageData) {
            const img = document.createElement('img');
            img.src = imageData.src;
            img.className = 'gallery-image';

            // Find the shortest column and append the image
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            columns[shortestColumnIndex].appendChild(img);

            // Update the column height based on the image aspect ratio
            columnHeights[shortestColumnIndex] += columns[shortestColumnIndex].offsetWidth / imageData.aspectRatio;
        }
    }
}

// Recalculate and render gallery on window resize
window.addEventListener('resize', () => {
    displayGalleryImages();
});

// Initialize gallery
document.addEventListener('DOMContentLoaded', () => {
    displayGalleryImages();
});




// Function to animate the numbers in the statistics section
function animateNumbers() {
    const counters = document.querySelectorAll('.stat-number');
    const duration = 1000; // Duration for the count-up animation (1 second)

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target'); // Get the target value
        const start = 0;
        const updateInterval = 20; // Update every 20ms
        const totalSteps = duration / updateInterval; // Total steps for the animation
        const increment = target / totalSteps; // Increment value for each step

        let currentCount = start;

        const updateCount = () => {
            currentCount += increment;

            if (currentCount < target) {
                counter.innerText = Math.ceil(currentCount);
                setTimeout(updateCount, updateInterval); // Continue updating
            } else {
                counter.innerText = target; // Set to target value when done
            }
        };

        updateCount(); // Start the count-up animation
    });
}

// Function to check if statistics section is in view and trigger the count-up
function checkStatsVisibilityMobile() {
    const statsSection = document.querySelector('.statistics-section.mobile-view');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the section is visible
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers(); // Start the animation
                observer.unobserve(entry.target); // Stop observing once animation starts
            }
        });
    }, observerOptions);

    statsObserver.observe(statsSection); // Observe the statistics section
}

function checkStatsVisibilityDesktop() {
    const statsSection = document.querySelector('.statistics-section.desktop-view')
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the section is visible
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers(); // Start the animation
                observer.unobserve(entry.target); // Stop observing once animation starts
            }
        });
    }, observerOptions);

    statsObserver.observe(statsSection); // Observe the statistics section
}


// Animate Navbar on Page Load
window.addEventListener('load', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.add('navbar-visible');
});

// Intersection Observer for Hero Text
const heroTextObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('hero-text-visible');
            observer.unobserve(entry.target);  // Stop observing once animated
        }
    });
}, { threshold: 0.1 });

// Target hero text and observe
const heroText = document.querySelector('.hero-text');
heroText.classList.add('hero-text-hidden');
heroTextObserver.observe(heroText);

// Apply initial navbar-hidden class
document.querySelector('.navbar').classList.add('navbar-hidden');


// Intersection Observer for Hero Section Images
const heroImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate the large image
            const largeImage = document.querySelector('.large-image');
            largeImage.classList.add('visible');
            
            // Animate the small images one by one
            const smallImages = document.querySelectorAll('.small-image');
            smallImages.forEach((img, index) => {
                setTimeout(() => {
                    img.classList.add('visible');
                }, index * 300); // Delay each small image by 300ms
            });
            
            observer.unobserve(entry.target);  // Stop observing once animated
        }
    });
}, { threshold: 0.2 }); // Trigger animation when 20% of the hero section is visible

// Observe the hero section images
const heroSection = document.querySelector('.hero-section');
heroImageObserver.observe(heroSection);

// Intersection Observer for Floating and Fading In Text
const textFadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);  // Stop observing once animated
        }
    });
}, { threshold: 0.1 });

// Select all text elements below the hero section
const textElements = document.querySelectorAll('.float-fade-in-left');

// Apply observer to each text element
textElements.forEach(element => {
    textFadeObserver.observe(element);
});


// Initialize functionality based on mode
function initializePage() {
    if (isDesktopMode()) {
        console.log("Initializing desktop mode...");
        checkStatsVisibilityDesktop(); // Initialize animation observer
    } else {
        console.log("Initializing mobile mode...");
        checkStatsVisibilityMobile();
        // Add additional functionality for mobile mode if needed
    }
}

// Event listener for resizing the window to reinitialize
window.addEventListener('resize', () => {
    initializePage();
    console.log("Window resized. Reinitialized page.");
});

// Initial page load
initializePage();
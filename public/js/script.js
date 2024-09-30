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

// Function to display gallery images
async function displayGalleryImages() {
    console.log("Starting to display gallery images...");

    const images = await fetchImageList();
    const leftColumn = document.getElementById('left-column');
    const rightColumn = document.getElementById('right-column');

    let leftHeight = 0;
    let rightHeight = 0;

    console.log("Preloading images...");
    const preloadedImages = await Promise.all(images.map(src => preloadImage(src)));

    console.log("Appending images to the gallery...");
    preloadedImages.forEach((imageData, index) => {
        if (imageData) {
            const { src, width, height, aspectRatio } = imageData;
            const img = document.createElement('img');
            img.dataset.src = src; // Use data-src for lazy loading
            img.alt = `Image ${index + 1}`;
            img.width = width;
            img.height = height;
            img.classList.add('gallery-image');

            // Create a placeholder and append img to it
            const placeholder = createPlaceholder(aspectRatio, img);

            // Choose which column to append to
            const column = leftHeight <= rightHeight ? leftColumn : rightColumn;

            // Append placeholder (which contains img) to the column
            column.appendChild(placeholder);

            // Observe the image for lazy loading
            imageObserver.observe(img);

            // When image loads, show it
            img.onload = () => {
                img.style.opacity = '1'; // Fade in the image
                console.log(`Image loaded and displayed: ${src}`);
            };

            // Update the column height
            const adjustedHeight = column.clientWidth / aspectRatio;
            if (column === leftColumn) {
                leftHeight += adjustedHeight;
            } else {
                rightHeight += adjustedHeight;
            }
        } else {
            console.error(`Image ${index + 1} failed to load and was not appended.`);
        }
    });

    console.log("Finished appending all images.");
}

displayGalleryImages();


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
function checkStatsVisibility() {
    const statsSection = document.querySelector('.statistics-section');
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

checkStatsVisibility(); // Initialize the visibility check

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

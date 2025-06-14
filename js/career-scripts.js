/*
  Archivo: career-scripts.js
  Descripción: Scripts específicos para las páginas de carreras en UNIREM.
  Maneja componentes interactivos como el carrusel Swiper para el plan de estudios
  y la funcionalidad de acordeón para las preguntas frecuentes (FAQ).
  Este script se carga DESPUÉS del script.js general.
*/

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // ==       SWIPER CAROUSEL (CURRICULUM)      ==
    // =============================================
    const curriculumCarouselElement = document.getElementById('curriculum-carousel-swiper');
    const curriculumTabsNav = document.getElementById('curriculum-tabs-nav');
    let curriculumSwiper = null; // Variable to hold the Swiper instance

    if (curriculumCarouselElement && typeof Swiper !== 'undefined') {
        // Initialize Swiper
        curriculumSwiper = new Swiper(curriculumCarouselElement, {
            loop: false, // Usually false for a plan of study
            slidesPerView: 1, // Show one slide at a time
            spaceBetween: 30, // Space between slides (if needed)
            speed: 600, // Transition speed

            // If you have many slides, consider using 'auto' height or fixed height
            // autoHeight: true,

            // Pagination dots
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },

            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            // Optional: Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },

            // Optional: Breakpoints for responsiveness (adjust based on your needs)
            // breakpoints: {
            //     768: {
            //         slidesPerView: 2,
            //         spaceBetween: 20,
            //     },
            //     1024: {
            //         slidesPerView: 3,
            //         spaceBetween: 30,
            //     },
            // },

            // Watch for visibility to activate animations (if using CSS transitions)
            watchSlidesVisibility: true,
            watchSlidesProgress: true,

            // Events
             on: {
                 slideChange: function () {
                     // Update active tab button when slide changes
                     if (curriculumTabsNav) {
                         const buttons = curriculumTabsNav.querySelectorAll('.tab-button');
                         buttons.forEach((button, index) => {
                             // Remove active class from all buttons
                             button.classList.remove('active');
                             // Add active class to the button corresponding to the current slide index
                             if (index === this.activeIndex) {
                                 button.classList.add('active');
                             }
                         });
                     }
                 },
                 // Optional: Adjust tabs scroll if they overflow horizontally
                 // init: function() { ... },
                 // resize: function() { ... }
             }
        });

        // Connect tab buttons to Swiper slides
        if (curriculumTabsNav) {
            const buttons = curriculumTabsNav.querySelectorAll('.tab-button');
            buttons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    // Slide to the corresponding index
                    curriculumSwiper.slideTo(index);

                    // Manually update active class on buttons (redundant due to slideChange event, but safe)
                    buttons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        }

    } else {
         console.warn("Swiper element or library not found for curriculum carousel.");
    }

    // =============================================
    // ==           FAQ ACCORDION LOGIC           ==
    // =============================================
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionButton = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            // Initially set aria-expanded to false and hide the answer
            if (questionButton) {
                questionButton.setAttribute('aria-expanded', 'false');
            }
            if (answer) {
                // Use 'display: none' initially via CSS.
                // We'll toggle 'display: block' or similar, or animate height.
                // A simple display toggle is easiest for basic accordion.
                answer.style.display = 'none'; // Ensure hidden on load
            }


            if (questionButton && answer) {
                questionButton.addEventListener('click', () => {
                    const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

                    // Close all other open FAQ items in the same container
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) { // Don't close the current item
                            const otherButton = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherButton && otherAnswer && otherButton.getAttribute('aria-expanded') === 'true') {
                                otherButton.setAttribute('aria-expanded', 'false');
                                otherAnswer.style.display = 'none'; // Or animate height close
                            }
                        }
                    });

                    // Toggle the clicked item
                    questionButton.setAttribute('aria-expanded', !isExpanded);
                    if (isExpanded) {
                        answer.style.display = 'none'; // Or animate height close
                    } else {
                        answer.style.display = 'block'; // Or animate height open
                    }
                });
            }
        });
    } else {
         console.warn("FAQ items not found.");
    }

    // =============================================
    // ==  OTHER PAGE-SPECIFIC COMPONENTS HERE    ==
    // =============================================
    // Add JavaScript for other components if needed, e.g.,
    // - Another Swiper instance for testimonials or gallery
    // - Lightbox functionality for gallery images
    // - Form validation (though often handled by backend or separate form library)

    // Example: Swiper for Testimonials (if uncommented in HTML)
    /*
    const testimonialsCarouselElement = document.getElementById('testimonials-carousel-swiper'); // Assuming you add this ID
    if (testimonialsCarouselElement && typeof Swiper !== 'undefined') {
         const testimonialsSwiper = new Swiper(testimonialsCarouselElement, {
              loop: true, // Testimonials often loop
              slidesPerView: 1,
              spaceBetween: 30,
              grabCursor: true, // Indicates it's draggable
              pagination: {
                   el: '.swiper-pagination',
                   clickable: true,
              },
              breakpoints: { // Show more slides on larger screens
                  768: {
                       slidesPerView: 2,
                       spaceBetween: 20,
                  },
                  1024: {
                       slidesPerView: 3,
                       spaceBetween: 30,
                  },
             },
         });
    } else {
         console.warn("Swiper element or library not found for testimonials carousel.");
    }
    */


}); // End of DOMContentLoaded
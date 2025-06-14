document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // ==           MENÚ MÓVIL SUPERIOR           ==
    // =============================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const isExpanded = navLinksContainer.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            // Prevenir scroll del body cuando el menú está abierto
            document.body.style.overflow = isExpanded ? 'hidden' : '';
            // Si se cierra el menú, cerrar también los dropdowns abiertos
            if (!isExpanded) {
                closeAllMobileDropdowns();
            }
        });

        // Cerrar menú si se hace click en un link (que no sea dropdown trigger) o sublink
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const listItem = link.closest('li');
                // Check if the link is the main trigger for a dropdown
                const isDropdownTrigger = listItem && listItem.classList.contains('has-dropdown') && link.parentElement === listItem;
                const isInDropdownMenu = link.closest('.dropdown-menu');

                // Close if it's a normal link (not a trigger) AND the menu is active on mobile
                // Also specifically check if it's inside a dropdown or an anchor link (#)
                if (!isDropdownTrigger && navLinksContainer.classList.contains('active')) {
                    const href = link.getAttribute('href');
                     // Close if it's a link *within* a dropdown or a section anchor link
                    if (isInDropdownMenu || (href && href.startsWith('#'))) {
                         closeMobileNav();
                    }
                    // Note: This logic might need refinement if you have links that go to OTHER pages
                    // from the mobile menu but should still close the menu.
                }
            });
        });


        // Manejar apertura/cierre de dropdowns en móvil
        const dropdownTriggers = navLinksContainer.querySelectorAll('.has-dropdown > a');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const href = trigger.getAttribute('href');
                const isPlaceholderLink = !href || href === '#' || href === '#!';

                // Only handle dropdown toggle behavior if the menu is in mobile 'active' state
                // OR if the link is just a placeholder ('#')
                if (navLinksContainer.classList.contains('active') || isPlaceholderLink) {
                     if (isPlaceholderLink) {
                        e.preventDefault(); // Prevent default link behavior for '#'
                     }
                    const parentLi = trigger.parentElement;
                    const isOpen = parentLi.classList.contains('open');

                    // Close other open dropdowns in mobile view
                    if (navLinksContainer.classList.contains('active')) {
                         closeAllMobileDropdowns(parentLi); // Close others, keeping this one open if it's the target
                    }

                    parentLi.classList.toggle('open');
                    trigger.setAttribute('aria-expanded', !isOpen); // Toggle aria-expanded state
                }
            });
        });

        // Function to close the mobile navigation
        function closeMobileNav() {
             // Add a slight delay to allow smooth scroll if clicking an anchor link
             setTimeout(() => {
                 navLinksContainer.classList.remove('active');
                 menuToggle.classList.remove('active');
                 menuToggle.setAttribute('aria-expanded', 'false');
                 document.body.style.overflow = ''; // Restore body scroll
                 closeAllMobileDropdowns(); // Ensure all dropdowns are closed
             }, 100);
        }

        // Function to close all dropdown menus in the mobile nav
        function closeAllMobileDropdowns(keepOpenLi = null) {
            navLinksContainer.querySelectorAll('.has-dropdown').forEach(li => {
                 if (li !== keepOpenLi) {
                    li.classList.remove('open');
                    const directLink = li.querySelector(':scope > a');
                    if (directLink) {
                       directLink.setAttribute('aria-expanded', 'false'); // Set aria-expanded to false
                    }
                 }
            });
        }
         // Ensure dropdowns are closed on page load if the mobile menu is not active
         // This prevents dropdowns staying open if the window is resized from mobile to desktop
         if (!navLinksContainer.classList.contains('active')) {
             closeAllMobileDropdowns();
         }
    }


    // =============================================
    // ==     NAVBAR SUPERIOR (OCULTAR/MOSTRAR)   ==
    // =============================================
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        let lastScrollTop = 0;
        const delta = 15; // How many pixels buffer before triggering hide/show
        const navbarHeight = navbar.offsetHeight;
        let didScroll;

        // Set a flag when the user scrolls
        window.addEventListener('scroll', () => {
            didScroll = true;
        }, { passive: true }); // Use passive for performance

        // Check scroll position periodically
        setInterval(() => {
            if (didScroll) {
                hasScrolled();
                didScroll = false;
            }
        }, 250); // Check every 250ms

        function hasScrolled() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Make sure they scroll more than delta
            if (Math.abs(lastScrollTop - scrollTop) <= delta) {
                return;
            }

            // If current position > last position and scrolled past the navbar height, hide the navbar
            if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
                navbar.classList.add('navbar--hidden');
            } else {
                // If scrolling up or near the top, show the navbar
                if (scrollTop < lastScrollTop || scrollTop <= delta) {
                     navbar.classList.remove('navbar--hidden');
                }
            }
            // Update last scroll position, clamp at 0
            lastScrollTop = Math.max(0, scrollTop);
        }
         // Initial check on load in case the page is loaded scrolled down
         if (window.pageYOffset > navbar.offsetHeight + delta) {
             // Add a slight delay to avoid a flicker on some browsers
             setTimeout(() => {
                navbar.classList.add('navbar--hidden');
             }, 100);
         } else {
             navbar.classList.remove('navbar--hidden');
         }
    }


    // =============================================
    // ==    NAVEGACIÓN VERTICAL TIMELINE LOGIC   ==
    // =============================================
    const timelineNav = document.getElementById('timeline-nav');
    const timelineNavLinks = timelineNav ? timelineNav.querySelectorAll('ul > li > a') : [];
    // Select sections, header, and footer that have an ID
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');

    if (timelineNav && timelineNavLinks.length > 0 && sections.length > 0) {
        // Observer options: root (viewport), margin (adjust trigger point), threshold (percentage visible)
        const observerOptions = {
            root: null, // Use the viewport as the root
            rootMargin: '-40% 0px -60% 0px', // Top 40% and bottom 60% of viewport don't trigger
            threshold: 0 // Trigger as soon as 1 pixel enters/leaves the margin
        };

        let currentActiveSectionId = null;
        // Use a Set to keep track of intersecting sections (handles multiple intersections)
        const intersectingSections = new Set();

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            // Update the set of intersecting sections
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                     intersectingSections.add(entry.target.id);
                } else {
                     intersectingSections.delete(entry.target.id);
                }
            });

            let activeSectionId = null;
            const sectionsArray = Array.from(sections); // Convert NodeList to Array

            // Determine the currently most relevant section:
            // 1. If any section is intersecting, find the one whose *top* edge is closest to the top of the viewport
            //    (or just inside the active zone defined by rootMargin). Sorting by top position works.
            // 2. If no section is intersecting the active zone, find the closest section *above* the active zone.
            // 3. If scrolled almost to the very top, always show 'inicio'.

            if (intersectingSections.size > 0) {
                 // Sort intersecting sections by their distance from the viewport top
                 const sortedIntersecting = Array.from(intersectingSections)
                    .map(id => ({
                        id: id,
                        top: document.getElementById(id).getBoundingClientRect().top
                    }))
                    // Sort by distance from the activation point (e.g., 40% from top, defined by rootMargin)
                    // A more complex sort might consider which section is *most* centered,
                    // but sorting by top position is simpler and often effective.
                    .sort((a, b) => a.top - b.top);

                activeSectionId = sortedIntersecting[0].id;

            } else {
                 // No sections are intersecting the active zone. Find the closest section *above* the active zone.
                 let closestSectionAbove = null;
                 let minDistance = Infinity;
                 // Define the top edge of the "activation zone" in viewport coordinates (relative to viewport top)
                 const viewportActivationTop = window.innerHeight * 0.4; // Corresponds to the -40% rootMargin

                 sectionsArray.forEach(section => {
                     const rect = section.getBoundingClientRect();
                     // Check if the section's bottom edge is above the activation top line
                     if (rect.bottom < viewportActivationTop) {
                         const distance = viewportActivationTop - rect.bottom; // Distance from section bottom to activation line
                         if (distance < minDistance) {
                             minDistance = distance;
                             closestSectionAbove = section;
                         }
                     }
                 });
                 // If a section was found above, use its ID, otherwise default to 'inicio'
                 activeSectionId = closestSectionAbove ? closestSectionAbove.id : 'inicio';
            }

            // Edge case: If very close to the absolute top of the page, force 'inicio'
            // (This handles scrolling back up into the rootMargin top area or past it)
            if (window.pageYOffset < window.innerHeight * 0.3) { // Adjust 0.3 as needed
                 activeSectionId = 'inicio';
            }


            // Update the active link in the timeline navigation if the active section has changed
            if (activeSectionId && activeSectionId !== currentActiveSectionId) {
                currentActiveSectionId = activeSectionId;
                timelineNavLinks.forEach(link => {
                    if (link.dataset.section === activeSectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }

            // Logic to show/hide the timeline navigation itself
            const heroSection = document.getElementById('inicio');
            const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
            const footerSection = document.getElementById('footer-section');
            const footerRect = footerSection ? footerSection.getBoundingClientRect() : null;

            // Show nav when scrolled past a certain point in the hero, hide when footer is near
            const showNavThreshold = window.innerHeight * 0.7; // Show when hero is 70% or less visible
            const hideNavThreshold = footerRect ? footerRect.top - window.innerHeight * 0.2 : Infinity; // Hide when footer is near the bottom

            if (heroRect && heroRect.bottom < showNavThreshold && window.pageYOffset < hideNavThreshold) {
                timelineNav.classList.add('visible');
            } else {
                timelineNav.classList.remove('visible');
            }


        }, observerOptions);

        // Start observing all section elements
        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        // Add click handlers for smooth scrolling
        timelineNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href') || `#${link.dataset.section}`;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    let offset = 0;
                    const topNavbar = document.getElementById('main-navbar');
                    // Calculate offset if the top navbar is sticky and visible
                    // Check computed style position because 'sticky' can behave like 'static' when not scrolled
                    const navbarComputedStyle = getComputedStyle(topNavbar);
                    if (topNavbar && navbarComputedStyle.position === 'fixed' || navbarComputedStyle.position === 'sticky' && !topNavbar.classList.contains('navbar--hidden') && targetId !== '#inicio') {
                         offset = topNavbar.offsetHeight;
                    }

                    // Calculate target position relative to the document, then subtract offset
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Set the initial active state on page load
         if (window.pageYOffset < window.innerHeight * 0.3) { // If near the top on load
             const inicioLink = timelineNav.querySelector('a[data-section="inicio"]');
             if (inicioLink) {
                 // Remove active from all then add to inicio
                 timelineNavLinks.forEach(l => l.classList.remove('active'));
                 inicioLink.classList.add('active');
                 currentActiveSectionId = 'inicio'; // Set initial active ID
             }
         } else {
            // For pages loaded with a hash in the URL, trigger an initial check
            // This handles cases where the user loads directly into a section deep in the page
             // A small delay might be needed to ensure the observer has run at least once
             setTimeout(() => {
                 // Manually trigger check if not at the very top
                 const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                 if (scrollTop > 0) {
                     // This will implicitly happen as the observer runs on load,
                     // but we can force an update check if needed.
                     // The observer callback handles setting the correct active link based on initial scroll.
                 }
             }, 100); // Small delay
         }

    } else {
         // If timeline nav or sections are missing, hide the nav completely
         if(timelineNav) timelineNav.style.display = 'none';
    }


    // =============================================
    // == LÓGICA DEL SELECTOR DE BACHILLERATOS    ==
    // =============================================
    const btnPrepa = document.getElementById('btn-prepa');
    const btnBachillerato = document.getElementById('btn-bachillerato');
    const contentSlider = document.querySelector('.content-slider');

    if (btnPrepa && btnBachillerato && contentSlider) {
        // Function to update button classes
        function updateActiveButton(activeButton) {
            btnPrepa.classList.remove('active');
            btnBachillerato.classList.remove('active');
            activeButton.classList.add('active');
        }

        // Add event listeners to buttons
        btnPrepa.addEventListener('click', () => {
            contentSlider.classList.remove('show-bachillerato'); // Remove class to show Prepa
            updateActiveButton(btnPrepa);
        });

        btnBachillerato.addEventListener('click', () => {
            contentSlider.classList.add('show-bachillerato'); // Add class to show Bachillerato
            updateActiveButton(btnBachillerato);
        });

        // Set initial state on page load (show Prepa by default)
        contentSlider.classList.remove('show-bachillerato');
        updateActiveButton(btnPrepa);
    }


     // =============================================
     // == ANIMACIÓN ON SCROLL PARA CAMPUS ITEMS   ==
     // =============================================
     const campusItems = document.querySelectorAll('#campus-life .campus-item');

     if (campusItems.length > 0) {
         const fadeInObserver = new IntersectionObserver((entries, observer) => {
             entries.forEach(entry => {
                 if (entry.isIntersecting) {
                     // Add the class to activate the CSS animation/transition
                     entry.target.classList.add('is-visible');
                     // Optional: Stop observing once the element has appeared (if you only want the animation once)
                     // observer.unobserve(entry.target);
                 }
                 // Optional: If you want the animation to reset on exit/re-entry (comment out the unobserve line above)
                 // else {
                 //     entry.target.classList.remove('is-visible');
                 // }
             });
         }, {
             root: null, // Use the viewport as the root
             rootMargin: '0px', // No margin
             threshold: 0.2 // Trigger when 20% of the element is visible
         });

         // Observe each campus item
         campusItems.forEach(item => {
             // Ensure the initial state is set by CSS, remove the JS class before observing
             item.classList.remove('is-visible');
             fadeInObserver.observe(item);
         });
     }

     // =============================================
     // == ANIMACIÓN ON SCROLL FOR SPLIT SECTIONS  ==
     // =============================================
     // Select the split sections you want to animate (QuiÃ©nes Somos)
     const splitSections = document.querySelectorAll('#quienes-somos .split-section');

      if (splitSections.length > 0) {
          const splitObserver = new IntersectionObserver((entries, observer) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      // Add classes to trigger animations defined in CSS
                      const splitContent = entry.target.querySelector('.split-content');
                      const splitImage = entry.target.querySelector('.split-image');

                      if (splitContent) splitContent.style.opacity = 1; // CSS handles the transform animation
                      if (splitImage) splitImage.style.opacity = 1; // CSS handles the transform animation and delay

                      // Stop observing once visible (if you only want animation once)
                       observer.unobserve(entry.target);
                  }
              });
          }, {
              root: null,
              rootMargin: '0px',
              threshold: 0.1 // Trigger when 10% of the section is visible
          });

          splitSections.forEach(section => {
              // Reset opacity before observing to ensure animation runs
              const splitContent = section.querySelector('.split-content');
              const splitImage = section.querySelector('.split-image');
              if (splitContent) splitContent.style.opacity = 0;
              if (splitImage) splitImage.style.opacity = 0;

              splitObserver.observe(section);
          });
      }



}); // End of DOMContentLoaded

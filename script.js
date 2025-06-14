document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // ==           MENÚ MÓVIL SUPERIOR           ==
    // =============================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = navLinksContainer.classList.contains('active');
            // Toggle active class on menu container and button
            navLinksContainer.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Update aria-expanded attribute for accessibility
            menuToggle.setAttribute('aria-expanded', !isExpanded);

            // Prevent scroll on body when menu is open
            document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';

            // If menu is closed, ensure all mobile dropdowns are also closed
            if (!navLinksContainer.classList.contains('active')) {
                closeAllMobileDropdowns();
            }
        });

        // Add click listener to the document to close the menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideNavbar = navbar.contains(event.target);
            const isMenuOpen = navLinksContainer.classList.contains('active');

            // If menu is open and the click is outside the navbar/menu
            if (isMenuOpen && !isClickInsideNavbar) {
                 closeMobileNav();
            }
        });


        // Close menu when clicking a link (unless it's a dropdown toggle)
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const listItem = link.closest('li');
                // Check if it's a direct link within a top-level li AND that li is a dropdown parent
                const isDropdownTrigger = listItem && listItem.classList.contains('has-dropdown') && link.parentElement === listItem;
                const isInDropdownMenu = link.closest('.dropdown-menu');

                 // Close the mobile nav if:
                 // 1. The menu is active (open)
                 // 2. The clicked link is NOT a top-level dropdown trigger
                 // 3. The link has an href starting with # (internal link on the same page) OR is inside a dropdown menu
                 const href = link.getAttribute('href');
                if (navLinksContainer.classList.contains('active') && !isDropdownTrigger) {
                     if ((href && href.startsWith('#')) || isInDropdownMenu) {
                         closeMobileNav();
                     }
                    // If it's an external link or a link to another page (e.g., inscripciones.html),
                    // browser navigation will happen, so no need to explicitly close the menu here.
                }
            });
        });

        // Handle click on dropdown triggers in mobile view
        const dropdownTriggers = navLinksContainer.querySelectorAll('.has-dropdown > a');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                // Only handle this with JS if the mobile menu is active
                if (navLinksContainer.classList.contains('active')) {
                    // Prevent default link behavior for dropdown triggers if they have an '#' href
                    // If they have a real page link (e.g., about-us.html), let it navigate but still toggle dropdown state visually first
                     if (trigger.getAttribute('href') && trigger.getAttribute('href').startsWith('#')) {
                         e.preventDefault();
                     }

                    const parentLi = trigger.parentElement;
                    const isOpen = parentLi.classList.contains('open');

                    // Close other open dropdowns if desired (optional, but good UX)
                    closeAllMobileDropdowns(parentLi);

                    // Toggle the 'open' class on the parent li
                    parentLi.classList.toggle('open');
                    // Update aria-expanded
                    trigger.setAttribute('aria-expanded', !isOpen);
                }
                 // In Desktop, CSS :hover and :focus-within handle dropdowns, no JS needed for opening/closing.
            });
        });

        // Helper function to close the mobile navigation
        function closeMobileNav() {
             navLinksContainer.classList.remove('active');
             menuToggle.classList.remove('active');
             menuToggle.setAttribute('aria-expanded', 'false');
             document.body.style.overflow = ''; // Restore body scroll
             closeAllMobileDropdowns(); // Ensure all dropdowns are closed when main menu closes
        }

        // Helper function to close all mobile dropdowns
        function closeAllMobileDropdowns(keepOpenLi = null) {
            navLinksContainer.querySelectorAll('.has-dropdown').forEach(li => {
                 // Close only if it's not the one we want to keep open (if specified)
                 if (li !== keepOpenLi) {
                    li.classList.remove('open');
                    // Ensure the direct <a> child has the correct aria-expanded state
                    const directLink = li.querySelector(':scope > a');
                    if (directLink) {
                       directLink.setAttribute('aria-expanded', 'false');
                    }
                 }
            });
        }
    }


    // =============================================
    // ==     NAVBAR SUPERIOR (OCULTAR/MOSTRAR)   ==
    // =============================================
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        let lastScrollTop = 0;
        const delta = 15; // Umbral de scroll más generoso para evitar parpadeos
        const navbarHeight = navbar.offsetHeight;
        let didScroll; // Flag para optimizar

        // Using passive listener for better performance
        window.addEventListener('scroll', () => {
            didScroll = true;
        }, { passive: true });

        // Check for scroll events periodically
        setInterval(() => {
            if (didScroll) {
                hasScrolled();
                didScroll = false;
            }
        }, 200); // Check less frequently

        function hasScrolled() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Make sure they scroll more than delta
            if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

            // If they scrolled down and are past the navbar
            if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
                // Hide navbar
                navbar.classList.add('navbar--hidden');
            } else {
                // If they scrolled up or are at the top
                if (scrollTop < lastScrollTop || scrollTop <= delta) {
                     navbar.classList.remove('navbar--hidden');
                }
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        }
    }

    // =============================================
    // ==       TYPED.JS (EFECTO ESCRITURA)       ==
    // =============================================
    // REMOVED: Typed.js initialization is now handled inline in Index.html
    // to provide page-specific strings more easily.


    // =============================================
    // ==    NAVEGACIÓN VERTICAL TIMELINE LOGIC   ==
    // =============================================
    const timelineNav = document.getElementById('timeline-nav');
    // Only proceed if timeline nav exists (it's hidden on smaller screens via CSS)
    if (timelineNav) {
        const timelineNavLinks = timelineNav.querySelectorAll('ul li a');
        // Use header, section, and footer elements with IDs
        const sections = document.querySelectorAll('header[id], section[id], footer[id]');

        if (timelineNavLinks.length > 0 && sections.length > 0) {

            // Intersection Observer for section visibility
            // rootMargin: defines the area within the viewport where intersection is checked.
            // '-40% 0px -60% 0px' creates a horizontal band in the middle of the viewport.
            // An element is considered 'intersecting' when its *border box* crosses this band.
            // We set thresholds to 0, meaning any intersection with the band triggers the callback.
            // This approach activates the link when the section is roughly centered vertically.
            const observerOptions = {
                root: null, // Use the viewport as the root
                rootMargin: '-40% 0px -60% 0px',
                threshold: 0
            };

            let currentActiveSectionId = null; // To track the currently active section ID

            const sectionObserver = new IntersectionObserver((entries, observer) => {
                 let activeEntry = null;

                 // Find the entry that is currently intersecting within the rootMargin
                 // If multiple intersect, the order in entries isn't guaranteed to be scroll order,
                 // but checking for intersection within the *specific* rootMargin band should
                 // give us the primary section the user is looking at.
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                          // Prioritize if multiple sections overlap slightly in the viewport
                          // (e.g., a short section between two longer ones)
                         if (!activeEntry || entry.intersectionRatio > activeEntry.intersectionRatio) {
                             activeEntry = entry;
                         }
                     }
                 });

                 let nextActiveSectionId = null;
                 if (activeEntry) {
                     nextActiveSectionId = activeEntry.target.id;
                 } else {
                    // Fallback: If no section is strictly intersecting the rootMargin band,
                    // find the closest section *above* the band. This handles cases where
                    // the user scrolls to a point between sections.
                    let closestSectionAbove = null;
                    let minDistance = Infinity;
                    const rootMarginTop = window.innerHeight * 0.4; // Top edge of the activation band

                    sections.forEach(section => {
                         const rect = section.getBoundingClientRect();
                         if (rect.bottom < rootMarginTop) { // Section is above the top of the band
                             const distance = Math.abs(rect.bottom - rootMarginTop);
                             if (distance < minDistance) {
                                 minDistance = distance;
                                 closestSectionAbove = section;
                             }
                         }
                    });
                    // If a closest section above is found, make it active. Otherwise, default to 'inicio'.
                    nextActiveSectionId = closestSectionAbove ? closestSectionAbove.id : 'inicio';
                 }

                // Special case: Ensure 'inicio' is active when at the very top of the page
                if (window.pageYOffset < window.innerHeight * 0.5 && nextActiveSectionId !== 'inicio') {
                    nextActiveSectionId = 'inicio';
                }


                // Update active class only if the active section has changed
                if (nextActiveSectionId && nextActiveSectionId !== currentActiveSectionId) {
                    currentActiveSectionId = nextActiveSectionId;
                    timelineNavLinks.forEach(link => {
                        // Use dataset.section attribute from the HTML
                        if (link.dataset.section === currentActiveSectionId) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }

                // Logic to show/hide the timeline nav based on hero section visibility
                const heroSection = document.getElementById('inicio');
                const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
                // Show the nav when the bottom of the hero is approximately 70% up from the viewport bottom
                // (i.e., 30% down from the viewport top)
                const showNavThreshold = window.innerHeight * 0.3; // Adjust threshold as needed
                 if (heroRect && heroRect.bottom <= showNavThreshold) { // Use <= to show it as soon as hero bottom passes the threshold
                     timelineNav.classList.add('visible');
                 } else {
                     timelineNav.classList.remove('visible');
                      // Optional: Reset active state if the nav is hidden (could be jarring)
                      // timelineNavLinks.forEach(link => link.classList.remove('active'));
                      // currentActiveSectionId = null;
                 }


            }, observerOptions);

            // Start observing each section
            sections.forEach(section => {
                sectionObserver.observe(section);
            });

            // Add smooth scroll behavior to timeline links
            timelineNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href'); // e.g., '#inicio'
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        let offset = 0;
                        const topNavbar = document.getElementById('main-navbar');

                        // Account for the sticky navbar height if it's visible
                        // We check if the navbar is sticky AND not hidden
                        const isNavbarStickyAndVisible = topNavbar &&
                                                         getComputedStyle(topNavbar).position === 'sticky' &&
                                                         !topNavbar.classList.contains('navbar--hidden');

                         if (isNavbarStickyAndVisible) {
                             offset = topNavbar.offsetHeight;
                         }

                        // Calculate the target scroll position minus the offset
                        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - offset;

                        // Perform smooth scroll
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Update the active class immediately on click for visual feedback
                         timelineNavLinks.forEach(l => l.classList.remove('active'));
                         link.classList.add('active');
                         // Also update the tracking variable
                         currentActiveSectionId = link.dataset.section;
                    }
                });
            });
        } else {
             // If timeline nav exists but has no links or no sections found, hide it
             if(timelineNav) timelineNav.style.display = 'none';
             console.warn("Timeline navigation or sections not found. Timeline nav hidden.");
        }
    }


    // =============================================
    // ==          REVEAL ON SCROLL LOGIC         ==
    // =============================================
    // Select elements that should animate into view
    const elementsToReveal = document.querySelectorAll('.animate-on-scroll');

    if (elementsToReveal.length > 0) {
        // Options for the Intersection Observer
        const revealObserverOptions = {
            root: null, // Use the viewport
            rootMargin: '0px', // Start observing as soon as element enters viewport
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        // Create the observer
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the element is intersecting (visible)
                if (entry.isIntersecting) {
                    // Add the class to trigger the transition/animation
                    entry.target.classList.add('visible-element');
                    // Stop observing the element after it's animated
                    observer.unobserve(entry.target);
                }
            });
        }, revealObserverOptions);

        // Observe each element selected
        elementsToReveal.forEach(element => {
            revealObserver.observe(element);
        });
    }


}); // End of DOMContentLoaded
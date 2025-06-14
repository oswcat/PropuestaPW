
document.addEventListener('DOMContentLoaded', () => {
    
    // =============================================
    // ==     FUNCIONALIDAD GALERÍA COMUNIDAD     ==
    // =============================================
    const collageGrid = document.querySelector('.collage-grid');
    const collageItems = document.querySelectorAll('.collage-item'); // Necesario para los clics
    const modalOverlay = document.getElementById('collage-modal');
    
    // --- INICIALIZACIÓN DE MASONRY ---
    if (collageGrid && typeof Masonry !== 'undefined' && typeof imagesLoaded !== 'undefined') {
        // Inicializa Masonry después de que todas las imágenes dentro del grid hayan cargado
        imagesLoaded(collageGrid, function() {
            const msnry = new Masonry(collageGrid, {
                itemSelector: '.collage-item',
                // columnWidth: 200, // Ejemplo: si todos tus items base son de 200px
                // O usa un elemento "sizer" para responsividad:
                // columnWidth: '.grid-sizer', // Necesitarías <div class="grid-sizer"></div> en tu HTML
                // O si todos los .collage-item tienen el mismo ancho base:
                columnWidth: '.collage-item', // Masonry tomará el ancho del primer .collage-item
                gutter: 10, // Espacio horizontal entre ítems
                percentPosition: true, // Usa porcentajes para el posicionamiento (bueno para responsive)
                // fitWidth: true, // Descomenta si quieres que el grid se centre si es más angosto que el contenedor
            });
            console.log('Masonry inicializado');
        });
    } else if (collageGrid) {
        console.warn('Masonry o imagesLoaded no están definidos. El layout del collage podría no ser óptimo.');
    }

    // --- LÓGICA DEL MODAL (SIN CAMBIOS SIGNIFICATIVOS) ---
    if (collageItems.length > 0 && modalOverlay) {
        const modalImage = document.getElementById('collage-modal-image');
        const modalDescription = document.getElementById('collage-modal-description');
        const closeModalButton = modalOverlay.querySelector('.collage-modal-close');

        collageItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgElement = item.querySelector('img');
                if (!imgElement) return;

                const imgSrc = imgElement.src;
                const imgAlt = imgElement.alt;
                const description = item.dataset.description || "No hay descripción disponible.";

                if(modalImage) modalImage.src = imgSrc;
                if(modalImage) modalImage.alt = imgAlt;
                if(modalDescription) modalDescription.textContent = description;
                
                modalOverlay.classList.add('visible');
                document.body.style.overflow = 'hidden'; 
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    item.click();
                }
            });
        });

        function closeModal() {
            modalOverlay.classList.remove('visible');
            document.body.style.overflow = ''; 
        }

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalOverlay.classList.contains('visible')) {
                closeModal();
            }
        });
    }

    // =============================================
    // ==   FUNCIONALIDAD CARTELERA EVENTOS (MODAL) ==
    // =============================================
    // ... (el código de la cartelera de eventos de la respuesta anterior va aquí, sin cambios) ...
    const eventPosters = document.querySelectorAll('.event-poster');
    const eventModalOverlay = document.getElementById('event-modal');

    if (eventPosters.length > 0 && eventModalOverlay) {
        const eventModalImage = document.getElementById('event-modal-image');
        const eventModalTitle = document.getElementById('event-modal-title');
        // ... (resto de las variables del modal de eventos)
        const eventModalDate = document.getElementById('event-modal-date');
        const eventModalDescription = document.getElementById('event-modal-description');
        const eventModalLugar = document.getElementById('event-modal-lugar');
        const eventModalHorario = document.getElementById('event-modal-horario');
        const eventModalExtra = document.getElementById('event-modal-extra');
        const eventModalLink = document.getElementById('event-modal-link');
        const eventCloseModalButton = eventModalOverlay.querySelector('.event-modal-close');

        const lugarContainer = document.getElementById('event-modal-lugar-container');
        const horarioContainer = document.getElementById('event-modal-horario-container');
        const extraContainer = document.getElementById('event-modal-extra-container');


        eventPosters.forEach(poster => {
            poster.addEventListener('click', () => {
                const data = poster.dataset;

                if(eventModalImage) eventModalImage.src = data.eventImage || '';
                if(eventModalImage) eventModalImage.alt = "Poster de " + (data.eventTitle || 'Evento');
                if(eventModalTitle) eventModalTitle.textContent = data.eventTitle || 'Título no disponible';
                if(eventModalDate) eventModalDate.textContent = data.eventDate || '';
                if(eventModalDescription) eventModalDescription.textContent = data.eventDescription || 'Descripción no disponible.';
                
                if (data.eventLugar && eventModalLugar && lugarContainer) {
                    eventModalLugar.textContent = data.eventLugar;
                    lugarContainer.style.display = 'flex';
                } else if (lugarContainer) {
                    lugarContainer.style.display = 'none';
                }

                if (data.eventHorario && eventModalHorario && horarioContainer) {
                    eventModalHorario.textContent = data.eventHorario;
                    horarioContainer.style.display = 'flex';
                } else if (horarioContainer) {
                    horarioContainer.style.display = 'none';
                }
                
                if (data.eventExtra && eventModalExtra && extraContainer) {
                    eventModalExtra.textContent = data.eventExtra;
                    extraContainer.style.display = 'flex'; 
                } else if (extraContainer) {
                    extraContainer.style.display = 'none';
                }

                if (data.eventLink && data.eventLinkText && eventModalLink) {
                    eventModalLink.href = data.eventLink;
                    eventModalLink.textContent = data.eventLinkText;
                    eventModalLink.style.display = 'inline-block';
                } else if (eventModalLink) {
                    eventModalLink.style.display = 'none';
                }

                eventModalOverlay.classList.add('visible');
                document.body.style.overflow = 'hidden';
            });

            poster.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    poster.click();
                }
            });
        });

        function closeEventModal() {
            eventModalOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        if (eventCloseModalButton) {
            eventCloseModalButton.addEventListener('click', closeEventModal);
        }

        eventModalOverlay.addEventListener('click', (event) => {
            if (event.target === eventModalOverlay) {
                closeEventModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && eventModalOverlay.classList.contains('visible')) {
                closeEventModal();
            }
        });
    }

}); // Fin de DOMContentLoaded

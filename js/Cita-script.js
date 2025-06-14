// Cita-script.js
// ==========================================================================
// LÓGICA DEL FRONTEND (VERSIÓN FINAL CON MAPA MEJORADO Y CONFETI)
// ==========================================================================

const PROXY_WORKER_URL = 'https://unirem-proxy-mk2.oswaldomartinezalvarez.workers.dev/';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const slotsPane = document.getElementById('slots-pane');
    const successPane = document.getElementById('booking-success-animation');
    const successIcon = successPane ? successPane.querySelector('.success-icon') : null;
    const monthYearDisplay = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarGrid = document.querySelector('.calendar-grid');
    const selectedDateDisplay = document.querySelector('.selected-date-display');
    const timeSlotsContainer = document.querySelector('.time-slots');
    const bookingForm = document.getElementById('booking-form');
    const bookingFormStatus = document.getElementById('booking-form-status');
    const confirmBtn = document.getElementById('btn-confirmar');
    const confirmBtnText = document.getElementById('btn-confirmar-text');
    const confirmBtnIcon = confirmBtn ? confirmBtn.querySelector('i') : null;

    // --- CONSTANTES DE UI ---
    const DAY_NAMES_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // --- ESTADO DE LA APLICACIÓN ---
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let formInteractionStarted = false;
    let isExploding = false;

    // --- FUNCIÓN PARA LA ANIMACIÓN DE CONFETI ---
    function triggerConfettiAnimation() {
        if (isExploding || typeof confetti === 'undefined') return;
        isExploding = true;
        
        if (successIcon) {
            successIcon.classList.add('animate__rubberBand');
        }

        const defaults = { particleCount: 200, spread: 90, origin: { y: 0.6 } };
        const fire = (particleRatio, opts) => {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(defaults.particleCount * particleRatio),
            }));
        };

        setTimeout(() => fire(0.25, { spread: 26, startVelocity: 55 }), 0);
        setTimeout(() => fire(0.2, { spread: 60 }), 50);
        setTimeout(() => fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 }), 100);
        setTimeout(() => fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 }), 150);
        setTimeout(() => fire(0.1, { spread: 120, startVelocity: 45 }), 200);

        setTimeout(() => {
            if (successIcon) successIcon.classList.remove('animate__rubberBand');
            isExploding = false;
        }, 1000);
    }
    
    // --- RENDERIZADO Y UI ---
    function renderCalendar(year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay();
        monthYearDisplay.textContent = `${MONTH_NAMES[month]} ${year}`;
        while (calendarGrid.children.length > 7) calendarGrid.removeChild(calendarGrid.lastChild);
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = lastDayOfPrevMonth - (firstDayOfWeek - 1) + i;
            dayElement.classList.add('day', 'outside-month');
            calendarGrid.appendChild(dayElement);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.classList.add('day', 'current-month');
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayElement.dataset.date = fullDate;
            const dateToCompare = new Date(year, month, day);
            if (dateToCompare < today) dayElement.classList.add('past-day');
            else dayElement.classList.add('available');
            if (selectedDate === fullDate) dayElement.classList.add('selected');
            calendarGrid.appendChild(dayElement);
        }
        const totalDaysRendered = firstDayOfWeek + lastDayOfMonth;
        const remainingCells = (totalDaysRendered > 35) ? 42 - totalDaysRendered : 35 - totalDaysRendered;
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('day', 'outside-month');
            calendarGrid.appendChild(dayElement);
        }
        const todayForNav = new Date();
        todayForNav.setDate(1);
        todayForNav.setHours(0, 0, 0, 0);
        if (prevMonthBtn) prevMonthBtn.disabled = (firstDayOfMonth <= todayForNav);
    }

    async function fetchAndRenderTimeSlots(dateString) {
        selectedDateDisplay.textContent = 'Cargando horarios...';
        timeSlotsContainer.innerHTML = '<div class="spinner-center"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>';
        bookingForm.classList.add('is-hidden');
        confirmBtn.disabled = true;
        displayFormStatus('');
        selectedTime = null;
        try {
            const response = await fetch(`${PROXY_WORKER_URL}?action=getSlots&date=${dateString}`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const slotsData = await response.json();
            if (slotsData.error) throw new Error(slotsData.error);
            const dateObj = new Date(dateString + 'T00:00:00Z');
            selectedDateDisplay.textContent = `${DAY_NAMES_LONG[dateObj.getUTCDay()]}, ${dateObj.getUTCDate()} de ${MONTH_NAMES[dateObj.getUTCMonth()]}`;
            renderSlotsBasedOnData(slotsData, dateString);
            updateCalendarDayStates(dateString, slotsData);
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            selectedDateDisplay.textContent = 'Error al Cargar';
            timeSlotsContainer.innerHTML = `<div class="no-date-selected">${error.message}</div>`;
        }
        updateConfirmButton();
    }

    function updateCalendarDayStates(dateString, slotsData) {
        const dayElement = calendarGrid.querySelector(`.day[data-date="${dateString}"]`);
        if (!dayElement) return;
        const totalAvailableSlots = slotsData.reduce((acc, slot) => {
            const useDetailedSlots = typeof slot.totalSlots === 'number' && typeof slot.bookedSlots === 'number';
            return acc + (useDetailedSlots ? (slot.totalSlots - slot.bookedSlots) : (slot.isAvailable ? 1 : 0));
        }, 0);
        dayElement.classList.remove('full', 'available');
        if (totalAvailableSlots === 0 && slotsData.length > 0) dayElement.classList.add('full');
        else dayElement.classList.add('available');
    }

    function renderSlotsBasedOnData(slotsData, dateString) {
        timeSlotsContainer.innerHTML = '';
        timeSlotsContainer.classList.remove('has-message');
        selectedTime = null;
        if (!slotsData || slotsData.length === 0) {
            timeSlotsContainer.innerHTML = '<div class="no-date-selected">No hay horarios disponibles para esta fecha.</div>';
            timeSlotsContainer.classList.add('has-message');
            bookingForm.classList.add('is-hidden');
            return;
        }
        const now = new Date();
        const isToday = (dateString === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
        let availableSlotsExist = false;
        slotsData.forEach(slotInfo => {
            const useDetailedSlots = typeof slotInfo.totalSlots === 'number' && typeof slotInfo.bookedSlots === 'number';
            const remainingSlots = useDetailedSlots ? (slotInfo.totalSlots - slotInfo.bookedSlots) : (slotInfo.isAvailable ? 1 : 0);
            let isAvailableForBooking = remainingSlots > 0;
            const timeSlotElement = document.createElement('button');
            timeSlotElement.classList.add('time-slot');
            timeSlotElement.dataset.time = slotInfo.time;
            const timeTextSpan = document.createElement('span');
            timeTextSpan.className = 'slot-time';
            timeTextSpan.textContent = slotInfo.time;
            const availabilityTextSpan = document.createElement('span');
            availabilityTextSpan.className = 'slot-availability';
            timeSlotElement.appendChild(timeTextSpan);
            timeSlotElement.appendChild(availabilityTextSpan);
            if (isToday && isAvailableForBooking) {
                const [h, m] = slotInfo.time.split(':').map(Number);
                if (new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m) < now) isAvailableForBooking = false;
            }
            if (!isAvailableForBooking) {
                timeSlotElement.classList.add('disabled');
                timeSlotElement.disabled = true;
                availabilityTextSpan.textContent = "No disponible";
            } else {
                availableSlotsExist = true;
                if (remainingSlots === 1) {
                    timeSlotElement.classList.add('low-availability');
                    availabilityTextSpan.textContent = "¡Último lugar!";
                } else {
                    availabilityTextSpan.textContent = 'Disponible';
                }
            }
            timeSlotsContainer.appendChild(timeSlotElement);
        });
        if (availableSlotsExist) bookingForm.classList.remove('is-hidden');
        else {
            bookingForm.classList.add('is-hidden');
            timeSlotsContainer.innerHTML = '<div class="no-date-selected">No hay horarios disponibles para esta fecha.</div>';
            timeSlotsContainer.classList.add('has-message');
        }
    }

    function handleDayClick(event) {
        const clickedDay = event.target.closest('.day.available:not(.past-day):not(.full)');
        if (!clickedDay || clickedDay.classList.contains('selected')) return;
        const previouslySelectedDay = calendarGrid.querySelector('.day.selected');
        if (previouslySelectedDay) previouslySelectedDay.classList.remove('selected');
        clickedDay.classList.add('selected');
        selectedDate = clickedDay.dataset.date;
        fetchAndRenderTimeSlots(selectedDate);
    }

    function handleTimeSlotClick(event) {
        const clickedTimeSlot = event.target.closest('.time-slot:not(.disabled)');
        if (!clickedTimeSlot || clickedTimeSlot.classList.contains('selected')) return;
        const previouslySelectedTime = timeSlotsContainer.querySelector('.time-slot.selected');
        if (previouslySelectedTime) previouslySelectedTime.classList.remove('selected');
        clickedTimeSlot.classList.add('selected');
        selectedTime = clickedTimeSlot.dataset.time;
        updateConfirmButton();
    }

    function getValidationState() {
        if (!bookingForm) return { ready: false, message: "Error de formulario" };
        const validations = {
            date: selectedDate !== null,
            time: selectedTime !== null,
            name: bookingForm.nombre.value.trim().length > 2,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email.value.trim()),
            phone: bookingForm.telefono.value.trim().length > 7,
            oferta: bookingForm.oferta_educativa.value !== '',
            modalidad: bookingForm.modalidad_contacto.value !== '',
        };
        if (!validations.date) return { ready: false, message: "Selecciona una Fecha" };
        if (!validations.time) return { ready: false, message: "Elige un Horario" };
        if (bookingForm.classList.contains('is-hidden')) return { ready: false, message: "Elige un Horario" };
        if (!validations.name) return { ready: false, message: "Completa tu Nombre" };
        if (!validations.email) return { ready: false, message: "Ingresa un Email Válido" };
        if (!validations.phone) return { ready: false, message: "Completa tu Teléfono" };
        if (!validations.oferta) return { ready: false, message: "Elige una Oferta Educativa" };
        if (!validations.modalidad) return { ready: false, message: "Elige una Modalidad" };
        return { ready: true, message: "Confirmar mi Cita" };
    }

    function updateConfirmButton() {
        if (!confirmBtn || !confirmBtnText) return;
        const state = getValidationState();
        confirmBtn.disabled = !state.ready;
        confirmBtnText.textContent = state.message;
    }

    function handleFormInteraction() {
        if (!formInteractionStarted) formInteractionStarted = true;
        updateConfirmButton();
    }

    async function handleConfirmSubmit(event) {
        event.preventDefault();
        if (confirmBtn.disabled) return;
        const validation = getValidationState();
        if (!validation.ready) {
            displayFormStatus(validation.message, false);
            return;
        }
        const bookingData = {
            form_source: bookingForm.form_source.value,
            fecha_reserva: selectedDate,
            hora_reserva: selectedTime,
            nombre: bookingForm.nombre.value.trim(),
            email: bookingForm.email.value.trim(),
            telefono: bookingForm.telefono.value.trim(),
            oferta_educativa: bookingForm.oferta_educativa.value,
            modalidad_contacto: bookingForm.modalidad_contacto.value
        };
        sendBookingData(bookingData);
    }
    
    async function sendBookingData(bookingData) {
        confirmBtn.disabled = true;
        confirmBtnText.textContent = 'Enviando...';
        confirmBtnIcon?.classList.add('fa-spin');
        displayFormStatus('');
        try {
            const response = await fetch(PROXY_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Error del servidor.');
            
            slotsPane.classList.add('is-hidden');
            successPane.classList.remove('is-hidden');
            triggerConfettiAnimation();
            
            setTimeout(resetFormAndCalendar, 6000);

        } catch (error) {
            console.error('Error al enviar datos:', error);
            displayFormStatus(error.message, false);
            confirmBtn.disabled = false;
            confirmBtnIcon?.classList.remove('fa-spin');
            updateConfirmButton();
        }
    }

    function resetFormAndCalendar() {
        successPane.classList.add('is-hidden');
        slotsPane.classList.remove('is-hidden');
        
        bookingForm.classList.add('is-hidden');
        bookingForm.reset();
        selectedDate = null;
        selectedTime = null;
        formInteractionStarted = false;
        
        const prevSelDay = calendarGrid.querySelector('.day.selected');
        if (prevSelDay) prevSelDay.classList.remove('selected');
        
        selectedDateDisplay.textContent = '';
        timeSlotsContainer.innerHTML = '<div class="no-date-selected">Selecciona una fecha en el calendario.</div>';
        timeSlotsContainer.classList.add('has-message');
        
        displayFormStatus('');
        confirmBtnIcon?.classList.remove('fa-spin');
        currentDate = new Date();
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        updateConfirmButton();
    }

    function displayFormStatus(message, isSuccess = false) {
        if (!bookingFormStatus) return;
        bookingFormStatus.className = 'form-status';
        if (message) {
            bookingFormStatus.textContent = message;
            bookingFormStatus.classList.add(isSuccess ? 'success' : 'error', 'visible');
        }
    }

    // --- INICIALIZACIÓN Y LISTENERS ---
    prevMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    nextMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    calendarGrid?.addEventListener('click', handleDayClick);
    timeSlotsContainer?.addEventListener('click', handleTimeSlotClick);
    bookingForm?.addEventListener('input', handleFormInteraction);
    bookingForm?.addEventListener('submit', handleConfirmSubmit);
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    timeSlotsContainer.innerHTML = '<div class="no-date-selected">Selecciona una fecha en el calendario.</div>';
    timeSlotsContainer.classList.add('has-message');
    updateConfirmButton();
});
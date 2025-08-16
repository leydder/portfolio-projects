// Clase principal para gestionar citas
class AppointmentManager {
    constructor() {
        this.appointments = [];
        this.currentDate = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        this.loadAppointmentsFromStorage();
        this.setupEventListeners();
        this.setCurrentDate();
        this.displayAppointments();
        this.setupTouchSupport();
    }

    setupEventListeners() {
        // Formulario para nueva cita
        document.getElementById('new-appointment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAppointment();
        });

        // Botón para cargar citas
        document.getElementById('load-appointments').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loadAppointmentsForDate();
        });

        // Cambio de fecha
        document.getElementById('appointment-date').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.displayAppointments();
        });

        // Modal
        const modal = document.getElementById('edit-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Formulario de edición
        document.getElementById('edit-appointment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAppointment();
        });

        // Botón de eliminar
        document.getElementById('delete-appointment').addEventListener('click', () => {
            this.deleteAppointment();
        });
    }

    setCurrentDate() {
        document.getElementById('appointment-date').value = this.currentDate;
    }

    // Generar ID único para las citas
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Agregar nueva cita
    addAppointment() {
        const time = document.getElementById('appointment-time').value;
        const name = document.getElementById('appointment-name').value;
        const phone = document.getElementById('appointment-phone').value;
        const notes = document.getElementById('appointment-notes').value;

        if (!time || !name || !phone) {
            this.showMessage('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        // Verificar si ya existe una cita a esa hora en esa fecha
        const existingAppointment = this.appointments.find(apt => 
            apt.date === this.currentDate && apt.time === time
        );

        if (existingAppointment) {
            this.showMessage('Ya existe una cita programada a esa hora en esta fecha', 'error');
            return;
        }

        const appointment = {
            id: this.generateId(),
            date: this.currentDate,
            time: time,
            name: name,
            phone: phone,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.saveAppointmentsToStorage();
        this.displayAppointments();
        this.clearForm();
        this.showMessage('Cita agregada exitosamente', 'success');
    }

    // Editar cita
    editAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return;

        // Llenar el formulario de edición
        document.getElementById('edit-appointment-id').value = appointment.id;
        document.getElementById('edit-appointment-date').value = appointment.date;
        document.getElementById('edit-appointment-time').value = appointment.time;
        document.getElementById('edit-appointment-name').value = appointment.name;
        document.getElementById('edit-appointment-phone').value = appointment.phone;
        document.getElementById('edit-appointment-notes').value = appointment.notes;

        // Mostrar modal
        document.getElementById('edit-modal').style.display = 'block';
    }

    // Actualizar cita
    updateAppointment() {
        const appointmentId = document.getElementById('edit-appointment-id').value;
        const date = document.getElementById('edit-appointment-date').value;
        const time = document.getElementById('edit-appointment-time').value;
        const name = document.getElementById('edit-appointment-name').value;
        const phone = document.getElementById('edit-appointment-phone').value;
        const notes = document.getElementById('edit-appointment-notes').value;

        if (!date || !time || !name || !phone) {
            this.showMessage('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        // Verificar si ya existe otra cita a esa hora en esa fecha (excluyendo la actual)
        const existingAppointment = this.appointments.find(apt => 
            apt.id !== appointmentId && apt.date === date && apt.time === time
        );

        if (existingAppointment) {
            this.showMessage('Ya existe otra cita programada a esa hora en esa fecha', 'error');
            return;
        }

        const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
        if (appointmentIndex !== -1) {
            this.appointments[appointmentIndex] = {
                ...this.appointments[appointmentIndex],
                date: date,
                time: time,
                name: name,
                phone: phone,
                notes: notes,
                updatedAt: new Date().toISOString()
            };

            this.saveAppointmentsToStorage();
            this.displayAppointments();
            this.closeModal();
            this.showMessage('Cita actualizada exitosamente', 'success');
        }
    }

    // Eliminar cita
    deleteAppointment() {
        const appointmentId = document.getElementById('edit-appointment-id').value;
        
        if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            this.appointments = this.appointments.filter(apt => apt.id !== appointmentId);
            this.saveAppointmentsToStorage();
            this.displayAppointments();
            this.closeModal();
            this.showMessage('Cita eliminada exitosamente', 'success');
        }
    }

    // Reprogramar cita (cambiar fecha y/o hora)
    rescheduleAppointment(appointmentId, newDate, newTime) {
        const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
        if (appointmentIndex !== -1) {
            // Verificar si ya existe una cita a esa hora en esa fecha
            const existingAppointment = this.appointments.find(apt => 
                apt.id !== appointmentId && apt.date === newDate && apt.time === newTime
            );

            if (existingAppointment) {
                this.showMessage('Ya existe una cita programada a esa hora en esa fecha', 'error');
                return false;
            }

            this.appointments[appointmentIndex] = {
                ...this.appointments[appointmentIndex],
                date: newDate,
                time: newTime,
                updatedAt: new Date().toISOString()
            };

            this.saveAppointmentsToStorage();
            this.displayAppointments();
            return true;
        }
        return false;
    }

    // Mostrar citas para la fecha seleccionada
    displayAppointments() {
        const container = document.getElementById('appointments-container');
        const dateAppointments = this.appointments.filter(apt => apt.date === this.currentDate);

        if (dateAppointments.length === 0) {
            container.innerHTML = '<p class="no-appointments">No hay citas programadas para esta fecha</p>';
            return;
        }

        // Ordenar citas por hora
        dateAppointments.sort((a, b) => a.time.localeCompare(b.time));

        container.innerHTML = dateAppointments.map(appointment => `
            <div class="appointment-item" data-id="${appointment.id}">
                <div class="appointment-header">
                    <div class="appointment-time">${this.formatTime(appointment.time)}</div>
                    <div class="appointment-actions">
                        <button class="btn btn-edit" onclick="appointmentManager.editAppointment('${appointment.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
                <div class="appointment-details">
                    <div class="appointment-detail">
                        <strong>Cliente:</strong>
                        <span>${appointment.name}</span>
                    </div>
                    <div class="appointment-detail">
                        <strong>Teléfono:</strong>
                        <span>${appointment.phone}</span>
                    </div>
                </div>
                ${appointment.notes ? `
                    <div class="appointment-notes">
                        <strong>Notas:</strong> ${appointment.notes}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Cargar citas para una fecha específica
    loadAppointmentsForDate() {
        const selectedDate = document.getElementById('appointment-date').value;
        if (selectedDate) {
            this.currentDate = selectedDate;
            this.displayAppointments();
        }
    }

    // Formatear hora para mostrar
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Limpiar formulario
    clearForm() {
        document.getElementById('new-appointment-form').reset();
        document.getElementById('appointment-time').value = '';
    }

    // Cerrar modal
    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        document.getElementById('edit-appointment-form').reset();
    }

    // Mostrar mensajes
    showMessage(message, type = 'info') {
        // Remover mensajes anteriores
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type === 'success' ? 'success-message' : 'error-message'}`;
        messageDiv.textContent = message;

        // Insertar mensaje después del header
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(messageDiv, header.nextSibling);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Guardar citas en localStorage
    saveAppointmentsToStorage() {
        try {
            localStorage.setItem('appointments', JSON.stringify(this.appointments));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    // Cargar citas desde localStorage
    loadAppointmentsFromStorage() {
        try {
            const stored = localStorage.getItem('appointments');
            if (stored) {
                this.appointments = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error al cargar desde localStorage:', error);
            this.appointments = [];
        }
    }

    // Exportar citas a JSON
    exportToJSON() {
        const dataStr = JSON.stringify(this.appointments, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `citas_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Importar citas desde JSON
    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedAppointments = JSON.parse(e.target.result);
                if (Array.isArray(importedAppointments)) {
                    this.appointments = importedAppointments;
                    this.saveAppointmentsToStorage();
                    this.displayAppointments();
                    this.showMessage('Citas importadas exitosamente', 'success');
                } else {
                    this.showMessage('Formato de archivo inválido', 'error');
                }
            } catch (error) {
                this.showMessage('Error al importar el archivo', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar la aplicación cuando se carga la página
let appointmentManager;

document.addEventListener('DOMContentLoaded', () => {
    appointmentManager = new AppointmentManager();
    
    // Agregar funcionalidad de exportar/importar
    addExportImportButtons();
});

// Función para agregar botones de exportar/importar
function addExportImportButtons() {
    const header = document.querySelector('.header');
    
    const exportImportDiv = document.createElement('div');
    exportImportDiv.style.textAlign = 'center';
    exportImportDiv.style.marginTop = '20px';
    
    exportImportDiv.innerHTML = `
        <button class="btn btn-primary" onclick="appointmentManager.exportToJSON()" style="margin-right: 10px;">
            <i class="fas fa-download"></i> Exportar Citas
        </button>
        <label for="import-file" class="btn btn-primary" style="cursor: pointer;">
            <i class="fas fa-upload"></i> Importar Citas
        </label>
        <input type="file" id="import-file" accept=".json" style="display: none;" onchange="handleFileImport(this)">
    `;
    
    header.appendChild(exportImportDiv);
}

// Función para manejar la importación de archivos
function handleFileImport(input) {
    const file = input.files[0];
    if (file) {
        appointmentManager.importFromJSON(file);
        input.value = ''; // Limpiar input
    }
}

    // Configurar soporte para dispositivos táctiles
    setupTouchSupport() {
        // Detectar si es un dispositivo táctil
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (this.isTouchDevice) {
            // Agregar clases CSS para dispositivos táctiles
            document.body.classList.add('touch-device');
            
            // Optimizar eventos para dispositivos táctiles
            this.optimizeForTouch();
        }
    }

    // Optimizar la interfaz para dispositivos táctiles
    optimizeForTouch() {
        // Aumentar el tamaño de los elementos táctiles
        const touchElements = document.querySelectorAll('.btn, input, textarea, select');
        touchElements.forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
        
        // Agregar indicadores visuales para elementos táctiles
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
        });
        
        // Agregar indicador visual de modo táctil
        this.addTouchIndicator();
    }
    
    // Agregar indicador visual de modo táctil
    addTouchIndicator() {
        const header = document.querySelector('.header');
        const touchIndicator = document.createElement('div');
        touchIndicator.className = 'touch-indicator';
        touchIndicator.innerHTML = '<i class="fas fa-mobile-alt"></i> Modo Táctil';
        touchIndicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            backdrop-filter: blur(10px);
        `;
        
        header.style.position = 'relative';
        header.appendChild(touchIndicator);
    }

    // Función global para acceder al manager desde la consola del navegador
    window.appointmentManager = appointmentManager; 
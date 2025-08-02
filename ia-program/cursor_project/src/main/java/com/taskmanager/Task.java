package com.taskmanager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Clase que representa una tarea en el sistema de gestión
 */
public class Task {
    private String id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public enum Priority {
        ALTA("Alta"), MEDIA("Media"), BAJA("Baja");

        private final String displayName;

        Priority(String displayName) {
            this.displayName = displayName;
        }

        @Override
        public String toString() {
            return displayName;
        }
    }

    public enum Status {
        PENDIENTE("Pendiente"), EN_PROGRESO("En Progreso"), COMPLETADA("Completada");

        private final String displayName;

        Status(String displayName) {
            this.displayName = displayName;
        }

        @Override
        public String toString() {
            return displayName;
        }
    }

    public Task() {
        this.createdAt = LocalDateTime.now();
        this.status = Status.PENDIENTE;
    }

    public Task(String title, String description, Priority priority, LocalDateTime dueDate) {
        this();
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
        if (status == Status.COMPLETADA && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    /**
     * Verifica si la tarea está vencida
     */
    public boolean isOverdue() {
        return dueDate != null && LocalDateTime.now().isAfter(dueDate)
                && status != Status.COMPLETADA;
    }

    /**
     * Obtiene el color de prioridad para la interfaz
     */
    public java.awt.Color getPriorityColor() {
        if (priority == null)
            return java.awt.Color.GRAY;

        return switch (priority) {
            case ALTA -> new java.awt.Color(220, 53, 69); // Rojo
            case MEDIA -> new java.awt.Color(255, 193, 7); // Amarillo
            case BAJA -> new java.awt.Color(40, 167, 69); // Verde
        };
    }

    @Override
    public String toString() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dueDateStr = dueDate != null ? dueDate.format(formatter) : "Sin fecha";
        return String.format("%s - %s (%s) - Vence: %s", title, priority, status, dueDateStr);
    }
}

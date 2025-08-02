package com.taskmanager;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.swing.table.AbstractTableModel;

/**
 * Modelo de tabla personalizado para mostrar las tareas
 */
public class TaskTableModel extends AbstractTableModel {
    private final List<Task> tasks;
    private final String[] columnNames =
            {"Título", "Descripción", "Prioridad", "Estado", "Vence", "Creada"};
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public TaskTableModel() {
        this.tasks = new ArrayList<>();
    }

    public void setTasks(List<Task> tasks) {
        this.tasks.clear();
        this.tasks.addAll(tasks);
        fireTableDataChanged();
    }

    public Task getTaskAt(int row) {
        if (row >= 0 && row < tasks.size()) {
            return tasks.get(row);
        }
        return null;
    }

    @Override
    public int getRowCount() {
        return tasks.size();
    }

    @Override
    public int getColumnCount() {
        return columnNames.length;
    }

    @Override
    public String getColumnName(int column) {
        return columnNames[column];
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        if (rowIndex >= tasks.size()) {
            return null;
        }

        Task task = tasks.get(rowIndex);
        return switch (columnIndex) {
            case 0 -> task.getTitle();
            case 1 -> task.getDescription();
            case 2 -> task.getPriority();
            case 3 -> task.getStatus();
            case 4 -> task.getDueDate() != null ? task.getDueDate().format(dateFormatter)
                    : "Sin fecha";
            case 5 -> task.getCreatedAt().format(dateFormatter);
            default -> null;
        };
    }

    @Override
    public Class<?> getColumnClass(int columnIndex) {
        return switch (columnIndex) {
            case 2 -> Task.Priority.class;
            case 3 -> Task.Status.class;
            default -> String.class;
        };
    }

    @Override
    public boolean isCellEditable(int rowIndex, int columnIndex) {
        return false; // La tabla no es editable directamente
    }

    public void addTask(Task task) {
        tasks.add(task);
        fireTableRowsInserted(tasks.size() - 1, tasks.size() - 1);
    }

    public void removeTask(int row) {
        if (row >= 0 && row < tasks.size()) {
            tasks.remove(row);
            fireTableRowsDeleted(row, row);
        }
    }

    public void updateTask(int row, Task task) {
        if (row >= 0 && row < tasks.size()) {
            tasks.set(row, task);
            fireTableRowsUpdated(row, row);
        }
    }

    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks);
    }

    public void clear() {
        tasks.clear();
        fireTableDataChanged();
    }
}

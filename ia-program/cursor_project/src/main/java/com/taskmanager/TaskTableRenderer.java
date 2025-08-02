package com.taskmanager;

import java.awt.Color;
import java.awt.Component;
import java.awt.Font;
import java.time.format.DateTimeFormatter;
import javax.swing.JLabel;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;

/**
 * Renderizador personalizado para la tabla de tareas
 */
public class TaskTableRenderer extends DefaultTableCellRenderer {
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected,
            boolean hasFocus, int row, int column) {
        Component component = super.getTableCellRendererComponent(table, value, isSelected,
                hasFocus, row, column);

        if (component instanceof JLabel) {
            JLabel label = (JLabel) component;

            // Obtener la tarea de esta fila
            TaskTableModel model = (TaskTableModel) table.getModel();
            Task task = model.getTaskAt(row);

            if (task != null) {
                // Configurar colores según el estado y prioridad
                if (isSelected) {
                    label.setBackground(table.getSelectionBackground());
                    label.setForeground(table.getSelectionForeground());
                } else {
                    label.setBackground(Color.WHITE);

                    // Color del texto según el estado
                    if (task.getStatus() == Task.Status.COMPLETADA) {
                        label.setForeground(new Color(128, 128, 128)); // Gris para tareas
                                                                       // completadas
                    } else if (task.isOverdue()) {
                        label.setForeground(new Color(220, 53, 69)); // Rojo para tareas vencidas
                    } else {
                        label.setForeground(Color.BLACK);
                    }
                }

                // Configurar fuente según la prioridad
                if (task.getPriority() == Task.Priority.ALTA) {
                    label.setFont(label.getFont().deriveFont(Font.BOLD));
                } else {
                    label.setFont(label.getFont().deriveFont(Font.PLAIN));
                }

                // Configurar el texto según la columna
                if (column == 2) { // Columna de prioridad
                    label.setText(value.toString());
                    label.setForeground(task.getPriorityColor());
                } else if (column == 3) { // Columna de estado
                    label.setText(value.toString());
                    Color statusColor = switch (task.getStatus()) {
                        case PENDIENTE -> new Color(230, 126, 34);
                        case EN_PROGRESO -> new Color(241, 196, 15);
                        case COMPLETADA -> new Color(46, 204, 113);
                    };
                    label.setForeground(statusColor);
                } else if (column == 4) { // Columna de fecha de vencimiento
                    if (task.getDueDate() != null) {
                        label.setText(task.getDueDate().format(dateFormatter));
                        if (task.isOverdue()) {
                            label.setForeground(new Color(220, 53, 69));
                        }
                    } else {
                        label.setText("Sin fecha");
                        label.setForeground(Color.GRAY);
                    }
                } else if (column == 5) { // Columna de fecha de creación
                    label.setText(task.getCreatedAt().format(dateFormatter));
                }
            }
        }

        return component;
    }
}

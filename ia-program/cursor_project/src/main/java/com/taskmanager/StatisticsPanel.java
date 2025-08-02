package com.taskmanager;

import java.awt.Color;
import java.awt.Component;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.Map;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

/**
 * Panel que muestra estadísticas de las tareas
 */
public class StatisticsPanel extends JPanel {
    private final TaskManager taskManager;
    private JLabel totalLabel, pendingLabel, inProgressLabel, completedLabel, overdueLabel,
            dueTodayLabel;

    public StatisticsPanel(TaskManager taskManager) {
        this.taskManager = taskManager;
        initializeComponents();
        updateStatistics();
    }

    private void initializeComponents() {
        setLayout(new GridLayout(2, 3, 10, 10));
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        setBackground(new Color(248, 249, 250));

        // Crear tarjetas de estadísticas
        add(createStatCard("Total de Tareas", "0", new Color(52, 152, 219)));
        add(createStatCard("Pendientes", "0", new Color(230, 126, 34)));
        add(createStatCard("En Progreso", "0", new Color(241, 196, 15)));
        add(createStatCard("Completadas", "0", new Color(46, 204, 113)));
        add(createStatCard("Vencidas", "0", new Color(231, 76, 60)));
        add(createStatCard("Vencen Hoy", "0", new Color(155, 89, 182)));
    }

    private JPanel createStatCard(String title, String value, Color color) {
        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createLineBorder(color, 2),
                BorderFactory.createEmptyBorder(15, 15, 15, 15)));

        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        titleLabel.setForeground(Color.GRAY);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel valueLabel = new JLabel(value);
        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        valueLabel.setForeground(color);
        valueLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        card.add(titleLabel);
        card.add(Box.createVerticalStrut(5));
        card.add(valueLabel);

        return card;
    }

    public void updateStatistics() {
        Map<String, Object> stats = taskManager.getTaskStatistics();

        SwingUtilities.invokeLater(() -> {
            // Actualizar valores en las tarjetas
            Component[] components = getComponents();
            if (components.length >= 6) {
                updateCardValue(components[0], String.valueOf(stats.get("total")));
                updateCardValue(components[1], String.valueOf(stats.get("pendientes")));
                updateCardValue(components[2], String.valueOf(stats.get("enProgreso")));
                updateCardValue(components[3], String.valueOf(stats.get("completadas")));
                updateCardValue(components[4], String.valueOf(stats.get("vencidas")));
                updateCardValue(components[5], String.valueOf(stats.get("vencenHoy")));
            }
        });
    }

    private void updateCardValue(Component card, String value) {
        if (card instanceof JPanel) {
            JPanel panel = (JPanel) card;
            for (Component comp : panel.getComponents()) {
                if (comp instanceof JLabel) {
                    JLabel label = (JLabel) comp;
                    if (label.getFont().isBold()) {
                        label.setText(value);
                        break;
                    }
                }
            }
        }
    }
}

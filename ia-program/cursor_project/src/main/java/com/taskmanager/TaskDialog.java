package com.taskmanager;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.border.EmptyBorder;

/**
 * Diálogo para crear o editar tareas
 */
public class TaskDialog extends JDialog {
    private JTextField titleField;
    private JTextArea descriptionArea;
    private JComboBox<Task.Priority> priorityCombo;
    private JComboBox<Task.Status> statusCombo;
    private JTextField dueDateField;
    private JTextField dueTimeField;
    private boolean confirmed = false;
    private Task task;

    public TaskDialog(JFrame parent, String title, Task task) {
        super(parent, title, true);
        this.task = task;
        initializeComponents();
        if (task != null) {
            loadTaskData();
        }
        pack();
        setLocationRelativeTo(parent);
    }

    private void initializeComponents() {
        setLayout(new BorderLayout());
        setPreferredSize(new Dimension(500, 400));

        // Panel principal
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));

        // Título
        JLabel titleLabel = new JLabel("Título:");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));
        titleField = new JTextField(30);
        titleField.setMaximumSize(new Dimension(400, 30));

        // Descripción
        JLabel descLabel = new JLabel("Descripción:");
        descLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));
        descriptionArea = new JTextArea(4, 30);
        descriptionArea.setLineWrap(true);
        descriptionArea.setWrapStyleWord(true);
        JScrollPane descScrollPane = new JScrollPane(descriptionArea);
        descScrollPane.setMaximumSize(new Dimension(400, 100));

        // Prioridad
        JLabel priorityLabel = new JLabel("Prioridad:");
        priorityLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));
        priorityCombo = new JComboBox<>(Task.Priority.values());
        priorityCombo.setMaximumSize(new Dimension(400, 30));

        // Estado
        JLabel statusLabel = new JLabel("Estado:");
        statusLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));
        statusCombo = new JComboBox<>(Task.Status.values());
        statusCombo.setMaximumSize(new Dimension(400, 30));

        // Fecha de vencimiento
        JLabel dueDateLabel = new JLabel("Fecha de vencimiento:");
        dueDateLabel.setFont(new Font("Segoe UI", Font.BOLD, 12));

        JPanel dateTimePanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        dueDateField = new JTextField(10);
        dueDateField.setToolTipText("Formato: dd/MM/yyyy");
        dueTimeField = new JTextField(8);
        dueTimeField.setToolTipText("Formato: HH:mm");

        dateTimePanel.add(dueDateField);
        dateTimePanel.add(new JLabel("Hora:"));
        dateTimePanel.add(dueTimeField);
        dateTimePanel.setMaximumSize(new Dimension(400, 30));

        // Agregar componentes al panel principal
        mainPanel.add(titleLabel);
        mainPanel.add(Box.createVerticalStrut(5));
        mainPanel.add(titleField);
        mainPanel.add(Box.createVerticalStrut(15));

        mainPanel.add(descLabel);
        mainPanel.add(Box.createVerticalStrut(5));
        mainPanel.add(descScrollPane);
        mainPanel.add(Box.createVerticalStrut(15));

        mainPanel.add(priorityLabel);
        mainPanel.add(Box.createVerticalStrut(5));
        mainPanel.add(priorityCombo);
        mainPanel.add(Box.createVerticalStrut(15));

        mainPanel.add(statusLabel);
        mainPanel.add(Box.createVerticalStrut(5));
        mainPanel.add(statusCombo);
        mainPanel.add(Box.createVerticalStrut(15));

        mainPanel.add(dueDateLabel);
        mainPanel.add(Box.createVerticalStrut(5));
        mainPanel.add(dateTimePanel);

        // Panel de botones
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        JButton saveButton = new JButton("Guardar");
        JButton cancelButton = new JButton("Cancelar");

        saveButton.setBackground(new Color(46, 204, 113));
        saveButton.setForeground(Color.WHITE);
        saveButton.setFocusPainted(false);
        saveButton.setFont(new Font("Segoe UI", Font.BOLD, 12));

        cancelButton.setBackground(new Color(231, 76, 60));
        cancelButton.setForeground(Color.WHITE);
        cancelButton.setFocusPainted(false);
        cancelButton.setFont(new Font("Segoe UI", Font.BOLD, 12));

        saveButton.addActionListener(e -> {
            if (validateInput()) {
                confirmed = true;
                dispose();
            }
        });

        cancelButton.addActionListener(e -> dispose());

        buttonPanel.add(saveButton);
        buttonPanel.add(cancelButton);

        add(mainPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
    }

    private void loadTaskData() {
        titleField.setText(task.getTitle());
        descriptionArea.setText(task.getDescription());
        priorityCombo.setSelectedItem(task.getPriority());
        statusCombo.setSelectedItem(task.getStatus());

        if (task.getDueDate() != null) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            dueDateField.setText(task.getDueDate().format(dateFormatter));
            dueTimeField.setText(task.getDueDate().format(timeFormatter));
        }
    }

    private boolean validateInput() {
        if (titleField.getText().trim().isEmpty()) {
            JOptionPane.showMessageDialog(this, "El título es obligatorio", "Error",
                    JOptionPane.ERROR_MESSAGE);
            return false;
        }

        // Validar fecha si se proporcionó
        if (!dueDateField.getText().trim().isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                LocalDateTime.parse(
                        dueDateField.getText().trim() + " " + dueTimeField.getText().trim(),
                        formatter);
            } catch (Exception e) {
                JOptionPane.showMessageDialog(this,
                        "Formato de fecha inválido. Use dd/MM/yyyy HH:mm", "Error",
                        JOptionPane.ERROR_MESSAGE);
                return false;
            }
        }

        return true;
    }

    public boolean isConfirmed() {
        return confirmed;
    }

    public String getTitle() {
        return titleField.getText().trim();
    }

    public String getDescription() {
        return descriptionArea.getText().trim();
    }

    public Task.Priority getPriority() {
        return (Task.Priority) priorityCombo.getSelectedItem();
    }

    public Task.Status getStatus() {
        return (Task.Status) statusCombo.getSelectedItem();
    }

    public LocalDateTime getDueDate() {
        String dateStr = dueDateField.getText().trim();
        String timeStr = dueTimeField.getText().trim();

        if (dateStr.isEmpty()) {
            return null;
        }

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            return LocalDateTime.parse(dateStr + " " + timeStr, formatter);
        } catch (Exception e) {
            return null;
        }
    }
}

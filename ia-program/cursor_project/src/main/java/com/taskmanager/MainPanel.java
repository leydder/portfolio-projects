package com.taskmanager;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FlowLayout;
import java.util.List;
import java.util.stream.Collectors;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingUtilities;
import javax.swing.table.TableRowSorter;

/**
 * Panel principal de la aplicación que contiene la tabla de tareas y controles
 */
public class MainPanel extends JPanel {
    private final TaskManager taskManager;
    private final TaskTableModel tableModel;
    private final JTable taskTable;
    private final JTextField searchField;
    private final JComboBox<String> filterCombo;
    private final JComboBox<String> priorityFilterCombo;
    private final StatisticsPanel statisticsPanel;

    public MainPanel(TaskManager taskManager) {
        this.taskManager = taskManager;
        this.tableModel = new TaskTableModel();
        this.taskTable = new JTable(tableModel);
        this.searchField = new JTextField(20);
        this.filterCombo = new JComboBox<>(new String[] {"Todas", "Pendientes", "En Progreso",
                "Completadas", "Vencidas", "Vencen Hoy"});
        this.priorityFilterCombo = new JComboBox<>(new String[] {"Todas las Prioridades", "Alta", "Media", "Baja"});
        this.statisticsPanel = new StatisticsPanel(taskManager);

        initializeComponents();
        loadTasks();
    }

    private void initializeComponents() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Panel superior con estadísticas
        add(statisticsPanel, BorderLayout.NORTH);

        // Panel central con tabla y controles
        JPanel centerPanel = new JPanel(new BorderLayout());

        // Panel de controles
        JPanel controlPanel = createControlPanel();
        centerPanel.add(controlPanel, BorderLayout.NORTH);

        // Configurar tabla
        setupTable();
        JScrollPane scrollPane = new JScrollPane(taskTable);
        centerPanel.add(scrollPane, BorderLayout.CENTER);

        add(centerPanel, BorderLayout.CENTER);
    }

    private JPanel createControlPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(0, 0, 10, 0));

        // Panel izquierdo con búsqueda y filtros
        JPanel leftPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));

        JLabel searchLabel = new JLabel("Buscar:");
        searchField.setToolTipText("Buscar por título o descripción");
        searchField.addActionListener(e -> performSearch());

        JButton searchButton = new JButton("Buscar");
        searchButton.setBackground(new Color(52, 152, 219));
        searchButton.setForeground(Color.WHITE);
        searchButton.setFocusPainted(false);
        searchButton.addActionListener(e -> performSearch());

        JLabel filterLabel = new JLabel("Estado:");
        filterCombo.addActionListener(e -> applyFilter());

        JLabel priorityFilterLabel = new JLabel("Prioridad:");
        priorityFilterCombo.addActionListener(e -> applyFilter());

        leftPanel.add(searchLabel);
        leftPanel.add(searchField);
        leftPanel.add(searchButton);
        leftPanel.add(Box.createHorizontalStrut(20));
        leftPanel.add(filterLabel);
        leftPanel.add(filterCombo);
        leftPanel.add(Box.createHorizontalStrut(10));
        leftPanel.add(priorityFilterLabel);
        leftPanel.add(priorityFilterCombo);

        // Panel derecho con botones de acción
        JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));

        JButton addButton = new JButton("Nueva Tarea");
        addButton.setBackground(new Color(46, 204, 113));
        addButton.setForeground(Color.WHITE);
        addButton.setFocusPainted(false);
        addButton.addActionListener(e -> addNewTask());

        JButton editButton = new JButton("Editar");
        editButton.setBackground(new Color(241, 196, 15));
        editButton.setForeground(Color.WHITE);
        editButton.setFocusPainted(false);
        editButton.addActionListener(e -> editSelectedTask());

        JButton deleteButton = new JButton("Eliminar");
        deleteButton.setBackground(new Color(231, 76, 60));
        deleteButton.setForeground(Color.WHITE);
        deleteButton.setFocusPainted(false);
        deleteButton.addActionListener(e -> deleteSelectedTask());

        JButton refreshButton = new JButton("Actualizar");
        refreshButton.setBackground(new Color(155, 89, 182));
        refreshButton.setForeground(Color.WHITE);
        refreshButton.setFocusPainted(false);
        refreshButton.addActionListener(e -> refreshTasks());

        rightPanel.add(addButton);
        rightPanel.add(editButton);
        rightPanel.add(deleteButton);
        rightPanel.add(refreshButton);

        panel.add(leftPanel, BorderLayout.WEST);
        panel.add(rightPanel, BorderLayout.EAST);

        return panel;
    }

    private void setupTable() {
        // Configurar renderizador personalizado
        taskTable.setDefaultRenderer(Object.class, new TaskTableRenderer());

        // Configurar sorter para permitir ordenamiento
        TableRowSorter<TaskTableModel> sorter = new TableRowSorter<>(tableModel);
        taskTable.setRowSorter(sorter);

        // Configurar selección
        taskTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        // Configurar columnas
        taskTable.getColumnModel().getColumn(0).setPreferredWidth(200); // Título
        taskTable.getColumnModel().getColumn(1).setPreferredWidth(300); // Descripción
        taskTable.getColumnModel().getColumn(2).setPreferredWidth(80); // Prioridad
        taskTable.getColumnModel().getColumn(3).setPreferredWidth(100); // Estado
        taskTable.getColumnModel().getColumn(4).setPreferredWidth(120); // Vence
        taskTable.getColumnModel().getColumn(5).setPreferredWidth(120); // Creada

        // Configurar altura de filas
        taskTable.setRowHeight(25);
    }

    private void performSearch() {
        String query = searchField.getText().trim();
        if (query.isEmpty()) {
            loadTasks();
        } else {
            List<Task> results = taskManager.searchTasks(query);
            tableModel.setTasks(results);
        }
        statisticsPanel.updateStatistics();
    }

    private void applyFilter() {
        String selectedStatusFilter = (String) filterCombo.getSelectedItem();
        String selectedPriorityFilter = (String) priorityFilterCombo.getSelectedItem();
        
        // Primero aplicar filtro por estado
        List<Task> filteredTasks = switch (selectedStatusFilter) {
            case "Pendientes" -> taskManager.getTasksByStatus(Task.Status.PENDIENTE);
            case "En Progreso" -> taskManager.getTasksByStatus(Task.Status.EN_PROGRESO);
            case "Completadas" -> taskManager.getTasksByStatus(Task.Status.COMPLETADA);
            case "Vencidas" -> taskManager.getOverdueTasks();
            case "Vencen Hoy" -> taskManager.getTasksDueToday();
            default -> taskManager.getAllTasks();
        };
        
        // Luego aplicar filtro por prioridad si no es "Todas las Prioridades"
        if (!"Todas las Prioridades".equals(selectedPriorityFilter)) {
            Task.Priority priority = switch (selectedPriorityFilter) {
                case "Alta" -> Task.Priority.ALTA;
                case "Media" -> Task.Priority.MEDIA;
                case "Baja" -> Task.Priority.BAJA;
                default -> null;
            };
            
            if (priority != null) {
                filteredTasks = filteredTasks.stream()
                    .filter(task -> task.getPriority() == priority)
                    .collect(Collectors.toList());
            }
        }
        
        tableModel.setTasks(filteredTasks);
        statisticsPanel.updateStatistics();
    }

    private void addNewTask() {
        TaskDialog dialog = new TaskDialog((JFrame) SwingUtilities.getWindowAncestor(this),
                "Nueva Tarea", null);
        dialog.setVisible(true);

        if (dialog.isConfirmed()) {
            Task newTask = taskManager.createTask(dialog.getTitle(), dialog.getDescription(),
                    dialog.getPriority(), dialog.getDueDate());
            loadTasks();
            statisticsPanel.updateStatistics();
        }
    }

    private void editSelectedTask() {
        int selectedRow = taskTable.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione una tarea para editar", "Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        int modelRow = taskTable.convertRowIndexToModel(selectedRow);
        Task task = tableModel.getTaskAt(modelRow);

        if (task != null) {
            TaskDialog dialog = new TaskDialog((JFrame) SwingUtilities.getWindowAncestor(this),
                    "Editar Tarea", task);
            dialog.setVisible(true);

            if (dialog.isConfirmed()) {
                taskManager.updateTask(task.getId(), dialog.getTitle(), dialog.getDescription(),
                        dialog.getPriority(), dialog.getDueDate(), dialog.getStatus());
                loadTasks();
                statisticsPanel.updateStatistics();
            }
        }
    }

    private void deleteSelectedTask() {
        int selectedRow = taskTable.getSelectedRow();
        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Seleccione una tarea para eliminar", "Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        int modelRow = taskTable.convertRowIndexToModel(selectedRow);
        Task task = tableModel.getTaskAt(modelRow);

        if (task != null) {
            int confirm = JOptionPane.showConfirmDialog(this,
                    "¿Está seguro de que desea eliminar la tarea '" + task.getTitle() + "'?",
                    "Confirmar eliminación", JOptionPane.YES_NO_OPTION);

            if (confirm == JOptionPane.YES_OPTION) {
                taskManager.deleteTask(task.getId());
                loadTasks();
                statisticsPanel.updateStatistics();
            }
        }
    }

    private void refreshTasks() {
        loadTasks();
        statisticsPanel.updateStatistics();
    }

    public void loadTasks() {
        List<Task> tasks = taskManager.getAllTasks();
        tableModel.setTasks(tasks);
    }
}

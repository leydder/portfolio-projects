package com.taskmanager;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.util.Map;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.KeyStroke;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import com.formdev.flatlaf.FlatLightLaf;

/**
 * Aplicación principal de gestión de tareas
 */
public class TaskManagerApp extends JFrame {
    private final TaskManager taskManager;
    private final MainPanel mainPanel;

    public TaskManagerApp() {
        this.taskManager = new TaskManager();
        this.mainPanel = new MainPanel(taskManager);

        initializeFrame();
        setupMenuBar();
    }

    private void initializeFrame() {
        setTitle("Gestor de Tareas - Aplicación de Escritorio");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1200, 800);
        setLocationRelativeTo(null);
        setResizable(true);

        // Configurar el contenido principal
        setContentPane(mainPanel);

        // Configurar icono de la aplicación
        try {
            setIconImage(createDefaultIcon());
        } catch (Exception e) {
            // Ignorar si no se puede cargar el icono
        }
    }

    private void setupMenuBar() {
        JMenuBar menuBar = new JMenuBar();

        // Menú Archivo
        JMenu fileMenu = new JMenu("Archivo");
        fileMenu.setMnemonic('A');

        JMenuItem newTaskItem = new JMenuItem("Nueva Tarea");
        newTaskItem.setAccelerator(KeyStroke.getKeyStroke("ctrl N"));
        newTaskItem.addActionListener(e -> showNewTaskDialog());

        JMenuItem exitItem = new JMenuItem("Salir");
        exitItem.setAccelerator(KeyStroke.getKeyStroke("ctrl Q"));
        exitItem.addActionListener(e -> System.exit(0));

        fileMenu.add(newTaskItem);
        fileMenu.addSeparator();
        fileMenu.add(exitItem);

        // Menú Ver
        JMenu viewMenu = new JMenu("Ver");
        viewMenu.setMnemonic('V');

        JMenuItem refreshItem = new JMenuItem("Actualizar");
        refreshItem.setAccelerator(KeyStroke.getKeyStroke("F5"));
        refreshItem.addActionListener(e -> mainPanel.loadTasks());

        JMenuItem statisticsItem = new JMenuItem("Estadísticas");
        statisticsItem.setAccelerator(KeyStroke.getKeyStroke("ctrl S"));
        statisticsItem.addActionListener(e -> showStatistics());

        viewMenu.add(refreshItem);
        viewMenu.add(statisticsItem);

        // Menú Ayuda
        JMenu helpMenu = new JMenu("Ayuda");
        helpMenu.setMnemonic('Y');

        JMenuItem aboutItem = new JMenuItem("Acerca de");
        aboutItem.addActionListener(e -> showAboutDialog());

        helpMenu.add(aboutItem);

        menuBar.add(fileMenu);
        menuBar.add(viewMenu);
        menuBar.add(helpMenu);

        setJMenuBar(menuBar);
    }

    private void showNewTaskDialog() {
        TaskDialog dialog = new TaskDialog(this, "Nueva Tarea", null);
        dialog.setVisible(true);

        if (dialog.isConfirmed()) {
            Task newTask = taskManager.createTask(dialog.getTitle(), dialog.getDescription(),
                    dialog.getPriority(), dialog.getDueDate());
            mainPanel.loadTasks();
        }
    }

    private void showStatistics() {
        Map<String, Object> stats = taskManager.getTaskStatistics();

        StringBuilder message = new StringBuilder();
        message.append("Estadísticas de Tareas\n\n");
        message.append("Total de tareas: ").append(stats.get("total")).append("\n");
        message.append("Pendientes: ").append(stats.get("pendientes")).append("\n");
        message.append("En progreso: ").append(stats.get("enProgreso")).append("\n");
        message.append("Completadas: ").append(stats.get("completadas")).append("\n");
        message.append("Vencidas: ").append(stats.get("vencidas")).append("\n");
        message.append("Vencen hoy: ").append(stats.get("vencenHoy"));

        JOptionPane.showMessageDialog(this, message.toString(), "Estadísticas",
                JOptionPane.INFORMATION_MESSAGE);
    }

    private void showAboutDialog() {
        String aboutMessage = """
                Gestor de Tareas v1.0

                Una aplicación de escritorio completa para gestionar tareas con prioridades.

                Características:
                • Gestión completa de tareas (CRUD)
                • Sistema de prioridades (Alta, Media, Baja)
                • Estados de tareas (Pendiente, En Progreso, Completada)
                • Fechas de vencimiento opcionales
                • Búsqueda y filtrado de tareas
                • Estadísticas en tiempo real
                • Persistencia de datos en JSON
                • Interfaz moderna y intuitiva

                Desarrollado en Java con Swing
                """;

        JOptionPane.showMessageDialog(this, aboutMessage, "Acerca de",
                JOptionPane.INFORMATION_MESSAGE);
    }

    private Image createDefaultIcon() {
        // Crear un icono simple programáticamente
        BufferedImage icon = new BufferedImage(32, 32, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = icon.createGraphics();

        // Dibujar un icono simple de tarea
        g2d.setColor(new Color(52, 152, 219));
        g2d.fillRect(4, 4, 24, 24);
        g2d.setColor(Color.WHITE);
        g2d.fillRect(8, 8, 16, 16);
        g2d.setColor(new Color(52, 152, 219));
        g2d.fillRect(10, 10, 12, 12);

        g2d.dispose();
        return icon;
    }

    public static void main(String[] args) {
        // Configurar el look and feel moderno
        try {
            UIManager.setLookAndFeel(new FlatLightLaf());
        } catch (Exception e) {
            System.err.println("Error al configurar el look and feel: " + e.getMessage());
        }

        // Configurar el manejo de errores no capturados
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            System.err.println("Error no capturado en el hilo " + thread.getName() + ": "
                    + throwable.getMessage());
            throwable.printStackTrace();
        });

        // Ejecutar la aplicación en el EDT
        SwingUtilities.invokeLater(() -> {
            try {
                TaskManagerApp app = new TaskManagerApp();
                app.setVisible(true);

                // Mostrar mensaje de bienvenida
                SwingUtilities.invokeLater(() -> {
                    JOptionPane.showMessageDialog(app, "¡Bienvenido al Gestor de Tareas!\n\n"
                            + "Use los botones en la parte superior para:\n"
                            + "• Crear nuevas tareas\n" + "• Editar tareas existentes\n"
                            + "• Eliminar tareas\n" + "• Buscar y filtrar tareas\n\n"
                            + "Los datos se guardan automáticamente en el archivo 'tasks.json'",
                            "Bienvenido", JOptionPane.INFORMATION_MESSAGE);
                });

            } catch (Exception e) {
                System.err.println("Error al iniciar la aplicación: " + e.getMessage());
                e.printStackTrace();
                JOptionPane.showMessageDialog(null,
                        "Error al iniciar la aplicación: " + e.getMessage(), "Error",
                        JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        });
    }
}

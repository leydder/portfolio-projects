package com.taskmanager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

/**
 * Gestor principal de tareas que maneja todas las operaciones CRUD
 */
public class TaskManager {
    private static final String DATA_FILE = "tasks.json";
    private final Map<String, Task> tasks;
    private final Gson gson;

    public TaskManager() {
        this.tasks = new ConcurrentHashMap<>();
        this.gson = new GsonBuilder().setPrettyPrinting()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter()).create();
        loadTasks();
    }

    /**
     * Crea una nueva tarea
     */
    public Task createTask(String title, String description, Task.Priority priority,
            LocalDateTime dueDate) {
        Task task = new Task(title, description, priority, dueDate);
        task.setId(generateId());
        tasks.put(task.getId(), task);
        saveTasks();
        return task;
    }

    /**
     * Actualiza una tarea existente
     */
    public boolean updateTask(String id, String title, String description, Task.Priority priority,
            LocalDateTime dueDate, Task.Status status) {
        Task task = tasks.get(id);
        if (task != null) {
            task.setTitle(title);
            task.setDescription(description);
            task.setPriority(priority);
            task.setDueDate(dueDate);
            task.setStatus(status);
            saveTasks();
            return true;
        }
        return false;
    }

    /**
     * Elimina una tarea
     */
    public boolean deleteTask(String id) {
        Task removed = tasks.remove(id);
        if (removed != null) {
            saveTasks();
            return true;
        }
        return false;
    }

    /**
     * Obtiene una tarea por ID
     */
    public Task getTask(String id) {
        return tasks.get(id);
    }

    /**
     * Obtiene todas las tareas
     */
    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks.values());
    }

    /**
     * Filtra tareas por estado
     */
    public List<Task> getTasksByStatus(Task.Status status) {
        return tasks.values().stream().filter(task -> task.getStatus() == status)
                .collect(Collectors.toList());
    }

    /**
     * Filtra tareas por prioridad
     */
    public List<Task> getTasksByPriority(Task.Priority priority) {
        return tasks.values().stream().filter(task -> task.getPriority() == priority)
                .collect(Collectors.toList());
    }

    /**
     * Busca tareas por título o descripción
     */
    public List<Task> searchTasks(String query) {
        String lowerQuery = query.toLowerCase();
        return tasks.values().stream()
                .filter(task -> task.getTitle().toLowerCase().contains(lowerQuery)
                        || task.getDescription().toLowerCase().contains(lowerQuery))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene tareas vencidas
     */
    public List<Task> getOverdueTasks() {
        return tasks.values().stream().filter(Task::isOverdue).collect(Collectors.toList());
    }

    /**
     * Obtiene tareas que vencen hoy
     */
    public List<Task> getTasksDueToday() {
        LocalDateTime today = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        return tasks.values().stream()
                .filter(task -> task.getDueDate() != null && !task.getDueDate().isBefore(startOfDay)
                        && !task.getDueDate().isAfter(today)
                        && task.getStatus() != Task.Status.COMPLETADA)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas de tareas
     */
    public Map<String, Object> getTaskStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", tasks.size());
        stats.put("pendientes", getTasksByStatus(Task.Status.PENDIENTE).size());
        stats.put("enProgreso", getTasksByStatus(Task.Status.EN_PROGRESO).size());
        stats.put("completadas", getTasksByStatus(Task.Status.COMPLETADA).size());
        stats.put("vencidas", getOverdueTasks().size());
        stats.put("vencenHoy", getTasksDueToday().size());

        return stats;
    }

    /**
     * Genera un ID único para las tareas
     */
    private String generateId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Guarda las tareas en el archivo JSON
     */
    private void saveTasks() {
        try (Writer writer =
                new OutputStreamWriter(new FileOutputStream(DATA_FILE), StandardCharsets.UTF_8)) {
            gson.toJson(new ArrayList<>(tasks.values()), writer);
        } catch (IOException e) {
            System.err.println("Error al guardar las tareas: " + e.getMessage());
        }
    }

    /**
     * Carga las tareas desde el archivo JSON
     */
    private void loadTasks() {
        File file = new File(DATA_FILE);
        if (!file.exists()) {
            return;
        }

        try (Reader reader =
                new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8)) {
            List<Task> taskList = gson.fromJson(reader, new TypeToken<List<Task>>() {}.getType());
            if (taskList != null) {
                for (Task task : taskList) {
                    tasks.put(task.getId(), task);
                }
            }
        } catch (IOException e) {
            System.err.println("Error al cargar las tareas: " + e.getMessage());
        }
    }

    /**
     * Adaptador para serializar/deserializar LocalDateTime
     */
    private static class LocalDateTimeAdapter
            implements com.google.gson.JsonSerializer<LocalDateTime>,
            com.google.gson.JsonDeserializer<LocalDateTime> {

        private static final DateTimeFormatter FORMATTER =
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        @Override
        public com.google.gson.JsonElement serialize(LocalDateTime src,
                java.lang.reflect.Type typeOfSrc,
                com.google.gson.JsonSerializationContext context) {
            return new com.google.gson.JsonPrimitive(FORMATTER.format(src));
        }

        @Override
        public LocalDateTime deserialize(com.google.gson.JsonElement json,
                java.lang.reflect.Type typeOfT,
                com.google.gson.JsonDeserializationContext context) {
            return LocalDateTime.parse(json.getAsString(), FORMATTER);
        }
    }
}

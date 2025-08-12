package zona_fit.conexion;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

public class Conexion {
    private static final Properties properties = new Properties();
    private static boolean propertiesLoaded = false;
    
    private static void loadProperties() {
        if (!propertiesLoaded) {
            try (InputStream input = Conexion.class.getClassLoader().getResourceAsStream("database.properties")) {
                if (input != null) {
                    properties.load(input);
                    propertiesLoaded = true;
                } else {
                    // Fallback configuration if properties file is not found
                    properties.setProperty("db.url", "jdbc:mysql://localhost:3306/zona_fit_db");
                    properties.setProperty("db.username", "root");
                    properties.setProperty("db.password", "Isabella2305");
                    properties.setProperty("db.driver", "com.mysql.cj.jdbc.Driver");
                    System.err.println("Warning: database.properties not found, using fallback configuration");
                }
            } catch (IOException e) {
                System.err.println("Error loading database properties: " + e.getMessage());
                // Fallback configuration
                properties.setProperty("db.url", "jdbc:mysql://localhost:3306/zona_fit_db");
                properties.setProperty("db.username", "root");
                properties.setProperty("db.password", "Isabella2305");
                properties.setProperty("db.driver", "com.mysql.cj.jdbc.Driver");
            }
        }
    }
    
    public static Connection getConexion() {
        loadProperties();
        Connection conexion = null;
        
        try {
            // Intentar cargar el driver directamente
            try {
                Class.forName(properties.getProperty("db.driver"));
            } catch (ClassNotFoundException e) {
                // Si falla, intentar con el driver legacy
                try {
                    Class.forName("com.mysql.jdbc.Driver");
                } catch (ClassNotFoundException e2) {
                    System.err.println("No se pudo cargar ningún driver de MySQL");
                    e2.printStackTrace();
                    return null;
                }
            }
            
            conexion = DriverManager.getConnection(
                properties.getProperty("db.url"),
                properties.getProperty("db.username"),
                properties.getProperty("db.password")
            );
        } catch (Exception e) {
            System.err.println("Error al conectarnos a la BD: " + e.getMessage());
            e.printStackTrace();
        }
        return conexion;
    }

    public static void main(String[] args) {
        var conexion = Conexion.getConexion();
        if (conexion != null) {
            System.out.println("Conexión exitosa: " + conexion);
            try {
                conexion.close();
            } catch (Exception e) {
                System.err.println("Error al cerrar la conexión: " + e.getMessage());
            }
        } else {
            System.out.println("Error al conectarse");
        }
    }
}

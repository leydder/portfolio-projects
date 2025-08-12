package zona_fit;

import zona_fit.datos.ClienteDAO;
import zona_fit.datos.IClienteDAO;
import zona_fit.dominio.Cliente;

import java.util.List;
import java.util.Scanner;

public class ZonaFitApp {
    private static final IClienteDAO clienteDAO = new ClienteDAO();
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        boolean salir = false;
        
        System.out.println("=== BIENVENIDO A ZONA FIT ===");
        System.out.println("Sistema de Gestión de Clientes\n");
        
        while (!salir) {
            mostrarMenu();
            int opcion = leerOpcion();
            
            switch (opcion) {
                case 1 -> listarClientes();
                case 2 -> agregarCliente();
                case 3 -> modificarCliente();
                case 4 -> eliminarCliente();
                case 5 -> {
                    System.out.println("¡Gracias por usar Zona Fit!");
                    salir = true;
                }
                default -> System.out.println("❌ Opción inválida. Por favor seleccione una opción del 1 al 5.");
            }
            
            if (!salir) {
                System.out.println("\nPresione Enter para continuar...");
                scanner.nextLine();
            }
        }
        
        scanner.close();
    }
    
    private static void mostrarMenu() {
        System.out.println("\n" + "=".repeat(40));
        System.out.println("           MENÚ PRINCIPAL");
        System.out.println("=".repeat(40));
        System.out.println("1. 📋 Listar clientes");
        System.out.println("2. ➕ Agregar cliente");
        System.out.println("3. ✏️  Modificar cliente");
        System.out.println("4. 🗑️  Eliminar cliente");
        System.out.println("5. 🚪 Salir");
        System.out.println("=".repeat(40));
        System.out.print("Seleccione una opción: ");
    }
    
    private static int leerOpcion() {
        try {
            String input = scanner.nextLine().trim();
            if (input.isEmpty()) {
                return -1;
            }
            int opcion = Integer.parseInt(input);
            return opcion;
        } catch (NumberFormatException e) {
            return -1; // Opción inválida
        }
    }
    
    private static void listarClientes() {
        System.out.println("\n📋 === LISTA DE CLIENTES ===");
        List<Cliente> clientes = clienteDAO.listarClientes();
        
        if (clientes.isEmpty()) {
            System.out.println("No hay clientes registrados.");
        } else {
            System.out.println("Total de clientes: " + clientes.size());
            System.out.println("-".repeat(80));
            System.out.printf("%-5s %-20s %-20s %-10s%n", "ID", "NOMBRE", "APELLIDO", "MEMBRESÍA");
            System.out.println("-".repeat(80));
            
            for (Cliente cliente : clientes) {
                System.out.printf("%-5d %-20s %-20s $%-9d%n", 
                    cliente.getId(), 
                    cliente.getNombre(), 
                    cliente.getApellido(), 
                    cliente.getMembresia());
            }
        }
    }
    
    private static void agregarCliente() {
        System.out.println("\n➕ === AGREGAR NUEVO CLIENTE ===");
        
        try {
            System.out.print("Ingrese el nombre: ");
            String nombre = scanner.nextLine().trim();
            
            if (nombre.isEmpty()) {
                System.out.println("❌ El nombre no puede estar vacío.");
                return;
            }
            
            if (nombre.length() > 50) {
                System.out.println("❌ El nombre no puede tener más de 50 caracteres.");
                return;
            }
            
            System.out.print("Ingrese el apellido: ");
            String apellido = scanner.nextLine().trim();
            
            if (apellido.isEmpty()) {
                System.out.println("❌ El apellido no puede estar vacío.");
                return;
            }
            
            if (apellido.length() > 50) {
                System.out.println("❌ El apellido no puede tener más de 50 caracteres.");
                return;
            }
            
            System.out.print("Ingrese el valor de la membresía: $");
            int membresia = Integer.parseInt(scanner.nextLine().trim());
            
            if (membresia <= 0) {
                System.out.println("❌ El valor de la membresía debe ser mayor a 0.");
                return;
            }
            
            if (membresia > 999999) {
                System.out.println("❌ El valor de la membresía no puede ser mayor a $999,999.");
                return;
            }
            
            Cliente nuevoCliente = new Cliente(nombre, apellido, membresia);
            
            if (clienteDAO.agregarCliente(nuevoCliente)) {
                System.out.println("✅ Cliente agregado exitosamente:");
                System.out.println("   Nombre: " + nombre + " " + apellido);
                System.out.println("   Membresía: $" + membresia);
            } else {
                System.out.println("❌ Error al agregar el cliente. Verifique que el valor de membresía sea único.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("❌ Error: El valor de la membresía debe ser un número válido.");
        }
    }
    
    private static void modificarCliente() {
        System.out.println("\n✏️ === MODIFICAR CLIENTE ===");
        
        try {
            System.out.print("Ingrese el ID del cliente a modificar: ");
            int id = Integer.parseInt(scanner.nextLine().trim());
            
            Cliente cliente = new Cliente();
            cliente.setId(id);
            
            if (!clienteDAO.buscarClientePorId(cliente)) {
                System.out.println("❌ No se encontró un cliente con ID: " + id);
                return;
            }
            
            System.out.println("Cliente encontrado:");
            System.out.println("   ID: " + cliente.getId());
            System.out.println("   Nombre actual: " + cliente.getNombre());
            System.out.println("   Apellido actual: " + cliente.getApellido());
            System.out.println("   Membresía actual: $" + cliente.getMembresia());
            System.out.println();
            
            System.out.print("Nuevo nombre (Enter para mantener actual): ");
            String nuevoNombre = scanner.nextLine().trim();
            if (!nuevoNombre.isEmpty()) {
                if (nuevoNombre.length() > 50) {
                    System.out.println("❌ El nombre no puede tener más de 50 caracteres.");
                    return;
                }
                cliente.setNombre(nuevoNombre);
            }
            
            System.out.print("Nuevo apellido (Enter para mantener actual): ");
            String nuevoApellido = scanner.nextLine().trim();
            if (!nuevoApellido.isEmpty()) {
                if (nuevoApellido.length() > 50) {
                    System.out.println("❌ El apellido no puede tener más de 50 caracteres.");
                    return;
                }
                cliente.setApellido(nuevoApellido);
            }
            
            System.out.print("Nueva membresía (Enter para mantener actual): $");
            String nuevaMembresiaStr = scanner.nextLine().trim();
            if (!nuevaMembresiaStr.isEmpty()) {
                int nuevaMembresia = Integer.parseInt(nuevaMembresiaStr);
                if (nuevaMembresia <= 0) {
                    System.out.println("❌ El valor de la membresía debe ser mayor a 0.");
                    return;
                }
                if (nuevaMembresia > 999999) {
                    System.out.println("❌ El valor de la membresía no puede ser mayor a $999,999.");
                    return;
                }
                cliente.setMembresia(nuevaMembresia);
            }
            
            if (clienteDAO.modificarCliente(cliente)) {
                System.out.println("✅ Cliente modificado exitosamente:");
                System.out.println("   " + cliente);
            } else {
                System.out.println("❌ Error al modificar el cliente.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("❌ Error: Ingrese valores numéricos válidos.");
        }
    }
    
    private static void eliminarCliente() {
        System.out.println("\n🗑️ === ELIMINAR CLIENTE ===");
        
        try {
            System.out.print("Ingrese el ID del cliente a eliminar: ");
            int id = Integer.parseInt(scanner.nextLine().trim());
            
            Cliente cliente = new Cliente();
            cliente.setId(id);
            
            if (!clienteDAO.buscarClientePorId(cliente)) {
                System.out.println("❌ No se encontró un cliente con ID: " + id);
                return;
            }
            
            System.out.println("Cliente encontrado:");
            System.out.println("   " + cliente);
            System.out.print("\n¿Está seguro que desea eliminar este cliente? (S/N): ");
            
            String confirmacion = scanner.nextLine().trim().toLowerCase();
            
            if (confirmacion.equals("s") || confirmacion.equals("si")) {
                if (clienteDAO.eliminarCliente(cliente)) {
                    System.out.println("✅ Cliente eliminado exitosamente.");
                } else {
                    System.out.println("❌ Error al eliminar el cliente.");
                }
            } else {
                System.out.println("ℹ️ Operación cancelada.");
            }
            
        } catch (NumberFormatException e) {
            System.out.println("❌ Error: El ID debe ser un número válido.");
        }
    }
}

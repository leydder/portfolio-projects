package Ventas;

import java.util.Scanner;

public class PruebaVentas {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Orden orden = new Orden();
        int opcion;

        System.out.println("*** Sistema de Ventas ***");

        do {
            mostrarMenu();
            System.out.print("Seleccione una opción: ");
            opcion = scanner.nextInt();
            scanner.nextLine(); // Consumir el salto de línea

            switch (opcion) {
                case 1:
                    agregarProductoConsola(scanner, orden);
                    break;
                case 2:
                    orden.mostrarOrden();
                    break;
                case 3:
                    System.out.println("¡Gracias por usar el Sistema de Ventas!");
                    break;
                default:
                    System.out.println("Opción inválida. Intente nuevamente.");
            }
            System.out.println();
        } while (opcion != 3);

        scanner.close();
    }

    private static void mostrarMenu() {
        System.out.println("\n=== MENÚ PRINCIPAL ===");
        System.out.println("1. Agregar producto");
        System.out.println("2. Mostrar orden actual");
        System.out.println("3. Salir");
    }

    private static void agregarProductoConsola(Scanner scanner, Orden orden) {
        System.out.print("Ingrese el nombre del producto: ");
        String nombre = scanner.nextLine();

        System.out.print("Ingrese el precio del producto: $");
        double precio = scanner.nextDouble();
        scanner.nextLine(); // Consumir el salto de línea

        if (precio <= 0) {
            System.out.println("Error: El precio debe ser mayor a 0.");
            return;
        }

        Producto producto = new Producto(nombre, precio);
        orden.agregarProducto(producto);
        System.out.println("Producto agregado exitosamente: " + producto.getNombre() + " - $" + producto.getPrecio());
    }
}

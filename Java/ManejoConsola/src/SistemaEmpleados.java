import java.util.Scanner;

public class SistemaEmpleados {
    public static void main(String[] args) {
        System.out.println("** Sistema de empleados");

        var consola =  new Scanner(System.in);

        // Nombre del empleado
        System.out.print("Digite el nombre del empleado: ");
        var nombreEmpleado =  consola.nextLine();
        System.out.print("Digite la edad del empleado: ");
        var edadEmpleado = Integer.parseInt(consola.nextLine());
        System.out.print("Digite el sueldo del empleado: ");
        var sueldoEmpleado =  Double.parseDouble(consola.nextLine());

        System.out.print("Es Jefe el empleado ?  True / false: ");
        var esJefe =  Boolean.parseBoolean(consola.nextLine());

        System.out.println("\nDatos del Empleado");
        System.out.println("Nombre del empleado: " + nombreEmpleado);
        System.out.println("Edad del empleado:  " + edadEmpleado  + "Años");
        System.out.println("Sueldo del empleado" + sueldoEmpleado);
        System.out.println("es Jefe de Departamento: " + esJefe);
    }
}

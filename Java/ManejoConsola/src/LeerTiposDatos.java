import java.util.Scanner;

public class LeerTiposDatos {
    public static void main(String[] args) {
        // Leer distintos tipos de datos

         var consola =  new Scanner(System.in);
        System.out.print("Digite su edad: ");
        var edad = consola.nextInt();
        System.out.println("edad: " + edad);

        // leer valor tipo doubble

        System.out.print("Digita tu altura: ");
        var altura =  consola.nextDouble();
        System.out.println("altura = " + altura);
        
        //consumimos el caracter de salto de linea
        consola.nextLine();
        // Leer tipo string
        System.out.print("Digita el nombre = " );
        var nombre = consola.nextLine();
        System.out.println("nombre = " + nombre);

    }
}

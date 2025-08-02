import java.util.Scanner;

public class SistemaAutenticacion {
    public static void main(String[] args) {
        System.out.println("*** Sistema de Autenticacion");

        var consola =  new Scanner(System.in);

        final var USUARIO_VALIDO =  "admin";
        final var PASSWORD_VALIDO = "123";

        System.out.print("cual es tu usuario?: ");
        var usuarioIngresado =  consola.nextLine();

        System.out.print("Cual es tu paasword? : ");
        var passwordIngresado = consola.nextLine();

        var sonDatosCorrectos =  usuarioIngresado.equals(USUARIO_VALIDO) && passwordIngresado.equals(PASSWORD_VALIDO);
        System.out.println("los datos son correctos: " +sonDatosCorrectos);

    }
}

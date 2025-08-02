import java.util.Scanner;

public class ValorPositivo {
    public static void main(String[] args) {
        System.out.println("*** Validar si un numero es positivo  ***");

        var consola = new Scanner(System.in);

        System.out.print("digite un numero: ");
        var valor = Integer.parseInt(consola.nextLine());

        if (valor >0){
            System.out.println("El numero es positivo: " + valor);
        } else if (valor < 0) {
            System.out.println("el valor es negativo: " + valor);

        }
        else System.out.print("el valor es cero: " + valor);
    }

}

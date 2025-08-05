import java.util.Scanner;

public class PromedioClasificaciones {
    public static void main(String[] args) {
        System.out.println("*** Promedio de Calificaciones ***");
        var consola =  new Scanner(System.in);
        System.out.print("Cuantas calificaciones desea agregar? : ");
        var totalCalificaciones = Integer.parseInt(consola.nextLine());

       // Creamos el arreglo
        var calificaciones =  new int [totalCalificaciones];
        // solictar los valores de cada nota

        for (var i=0; i< totalCalificaciones ; i++) {
            System.out.print("Calificacion ["  + i + "] = ");
            calificaciones[i] =  Integer.parseInt(consola.next());
        }
        // obtener el promedio
        var sumaCalificaciones = 0;
        for(var i= 0; i< totalCalificaciones; i++) {
            sumaCalificaciones += calificaciones[i]; // sumaPromedios = sumaPromedios + calificaciones[i]
        }
        var promedio =  sumaCalificaciones / totalCalificaciones;
        System.out.println("\nPromedio de las calificaciones: " + promedio);

    }
}

public class comparacionCadenas {
    public static void main(String[] args) {
        var cadena1 = "Java";
        var cadena2 = "Java";
        var cadena3 = new String("Java");

//  comparacion en referencia
        System.out.print("la cadena 1 es igual en referencia a la cadena 2: ");
        System.out.println(cadena1==cadena2); // True por que esta igual referencia

        System.out.print("la cadena 1 es igual en contenido a la cadena 3: ");
        System.out.println(cadena1== cadena3); // False por que esta diferente referencia

// comparacion en contenido
        System.out.print("la cadena 1 es igual en referencia a la cadena 3: ");
        System.out.println(cadena1.equals(cadena3));

    }
}

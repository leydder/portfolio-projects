public class IndicesCadena {
    public static void main(String[] args) {
        System.out.println("Recuperar el indice de una cadena");
        var cadena1 = "Hola Mundo";

        var primerCaracter = cadena1.charAt(0); // Trae el caracter H
        System.out.println("primerCaracter: " + primerCaracter);
        
        var ultimoCaracter =  cadena1.charAt(9); // Trae el ultimo caracter
        System.out.println("ultimoCaracter = " + ultimoCaracter);
        
        var letraM = cadena1.charAt(5);
        System.out.println("primerCaracSegPalabra = " + letraM);
    }
}

public class MetodosCadenas {
    public static void main(String[] args) {
        // Metodo de cadenas
        var cadena1 = "Hola Mundo";

        // Obtener el largo de una cadena
        var longitud = cadena1.length();
        System.out.println("longitud = " + longitud);

        // Reemplazar caracteres
        var nuevaCadena = cadena1.replace('o','a');
        System.out.println("nuevaCadena = " + nuevaCadena);

        // Convertir a mayusculas
        var mayusculas = cadena1.toUpperCase();
        System.out.println("mayusculas = " + mayusculas);

        // Convertir a minusculas
        System.out.println("minusculas = " + cadena1.toLowerCase());

        // Eliminar espacios al inicio y al final
        var cadena2 = " Leo Reyes    ";
        System.out.println("cadena2 con espacios = " + cadena2);
        System.out.println("cadena2 sin espacios = " + cadena2.trim());


        // Generar una subcadena

       var subcadena =  cadena1.substring(0,4);
        System.out.println(subcadena);

        // Generar segunda subcadena
        var subcadena2 =  cadena1.substring(5);
        System.out.println(subcadena2);

        // buscar subcadenas indexof - devuelve el indice de la primera cadena que encuentre

        var indice1 = cadena1.indexOf("Hola");
        System.out.println(indice1);

        // buscar ultima cadena que aparece lastindexof
        var indice2 = cadena1.lastIndexOf("Mundo");
        System.out.println(indice2);

        // Reemplazar  subcadenas, reemplazar munfo por a todos

        var subcadenaReemplaza =  cadena1.replace("Mundo", "a todos");
        System.out.println(subcadenaReemplaza);

        // concatenar cadenas usando concat

        var cadena3 = cadena1.concat(" ").concat("A todos");
        System.out.println(cadena3);

        var cadena4 =  "un placer conocerlos";
        System.out.println(cadena4);

        // concatenas usando Stringbuilder
        var constructorCadenas = new StringBuilder();
        /*constructorCadenas.append(cadena3);
        constructorCadenas.append(" ");
        constructorCadenas.append(cadena4);*/

        constructorCadenas.append(cadena3).append(" ").append(cadena4);
         var resulConcatenaString = constructorCadenas.toString();
        System.out.println("Resultado con StringBuilder: " + resulConcatenaString);

        // usando stringbuffer

        var stringBuffer =  new StringBuffer();
        stringBuffer.append(cadena3).append(" ").append(cadena4);
        var resultadoString =  stringBuffer.toString();
        System.out.println("Resultado con StringBuffer: " + stringBuffer);

        // usando join

        var resultadoJoin = String.join(" - ",cadena3,cadena4);
        System.out.println("Resultado usando Join: " + resultadoJoin);

    }
}

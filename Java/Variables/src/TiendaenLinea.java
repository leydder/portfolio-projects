public class TiendaenLinea {
    public static void main(String[] args) {
        System.out.println("*** Tienda en Linea - Detalle del producto");
        String nombreProducto = "Celular";
        int precio = 2500;
        int cantidadDisponible = 45;
        boolean estaDisponible = true;
        System.out.println("el nombre del Producto es = " + nombreProducto);
        System.out.println("el precio es = " + precio);
        System.out.println("La cantidad Disponible es = " + cantidadDisponible);
        System.out.println("esta Disponible? = " + estaDisponible);

        System.out.println();
        nombreProducto = "Computador";
        precio = 45000;
        cantidadDisponible = 0;
        estaDisponible = false;
        System.out.println("el nombre del Producto es = " + nombreProducto);
        System.out.println("el precio es = " + precio);
        System.out.println("La cantidad Disponible es = " + cantidadDisponible);
        System.out.println("esta Disponible? = " + estaDisponible);
    }
}

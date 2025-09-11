package gm.inventarios;

import gm.inventarios.modelo.Producto;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventariosApplication {

	public static void main(String[] args) {

		SpringApplication.run(InventariosApplication.class, args);

		// Prueba de Loombok
		Producto producto = new Producto();
		producto.setDescripcion("Blusa roja S");
		producto.setPrecio(100.0);
		producto.setExistencia(50);

		// Imprimir el objet usando toString
		System.out.println(producto);


	}

}

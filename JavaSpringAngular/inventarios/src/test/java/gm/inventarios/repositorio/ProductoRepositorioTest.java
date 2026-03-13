package gm.inventarios.repositorio;

import gm.inventarios.modelo.Producto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class ProductoRepositorioTest {

    @Autowired
    private ProductoRepositorio repositorio;

    // -------------------------------------------------------
    // save
    // -------------------------------------------------------
    @Nested
    @DisplayName("save")
    class Save {

        @Test
        @DisplayName("asigna un id autogenerado al guardar un producto válido")
        void asignaIdAlGuardarProductoValido() {
            Producto producto = new Producto(null, "Monitor", 300.0, 20);

            Producto guardado = repositorio.save(producto);

            assertThat(guardado.getIdProducto()).isNotNull().isPositive();
        }

        @Test
        @DisplayName("permite guardar dos productos con la misma descripción (sin restricción única)")
        void permiteDuplicadosEnDescripcion() {
            Producto p1 = new Producto(null, "Teclado", 50.0, 10);
            Producto p2 = new Producto(null, "Teclado", 60.0, 5);

            Producto guardado1 = repositorio.save(p1);
            Producto guardado2 = repositorio.save(p2);

            assertThat(guardado1.getIdProducto()).isNotEqualTo(guardado2.getIdProducto());
            assertThat(guardado1.getDescripcion()).isEqualTo(guardado2.getDescripcion());
        }

        @Test
        @DisplayName("actualiza el producto cuando ya tiene id (merge)")
        void actualizaProductoExistente() {
            Producto original = repositorio.save(new Producto(null, "Audífonos", 80.0, 15));
            original.setPrecio(90.0);

            Producto actualizado = repositorio.save(original);

            assertThat(actualizado.getIdProducto()).isEqualTo(original.getIdProducto());
            assertThat(actualizado.getPrecio()).isEqualTo(90.0);
        }
    }

    // -------------------------------------------------------
    // findById
    // -------------------------------------------------------
    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("retorna el producto cuando el id existe")
        void retornaProductoCuandoExiste() {
            Producto guardado = repositorio.save(new Producto(null, "Webcam", 120.0, 8));

            Optional<Producto> resultado = repositorio.findById(guardado.getIdProducto());

            assertThat(resultado).isPresent();
            assertThat(resultado.get().getDescripcion()).isEqualTo("Webcam");
        }

        @Test
        @DisplayName("retorna Optional vacío cuando el id no existe")
        void retornaOptionalVacioCuandoNoExiste() {
            Optional<Producto> resultado = repositorio.findById(9999);

            assertThat(resultado).isEmpty();
        }

        @Test
        @DisplayName("retorna Optional vacío para un id negativo que no existe")
        void retornaOptionalVacioCuandoIdEsNegativo() {
            Optional<Producto> resultado = repositorio.findById(-1);

            assertThat(resultado).isEmpty();
        }
    }

    // -------------------------------------------------------
    // findAll
    // -------------------------------------------------------
    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("retorna lista vacía cuando no hay productos")
        void retornaListaVaciaSinDatos() {
            List<Producto> resultado = repositorio.findAll();

            assertThat(resultado).isEmpty();
        }

        @Test
        @DisplayName("retorna todos los productos guardados")
        void retornaTodosLosProductos() {
            repositorio.save(new Producto(null, "Impresora", 200.0, 3));
            repositorio.save(new Producto(null, "Escáner", 150.0, 7));

            List<Producto> resultado = repositorio.findAll();

            assertThat(resultado).hasSize(2);
            assertThat(resultado).extracting(Producto::getDescripcion)
                    .containsExactlyInAnyOrder("Impresora", "Escáner");
        }
    }

    // -------------------------------------------------------
    // deleteById
    // -------------------------------------------------------
    @Nested
    @DisplayName("deleteById")
    class DeleteById {

        @Test
        @DisplayName("elimina el producto cuando el id existe")
        void eliminaProductoCuandoExiste() {
            Producto guardado = repositorio.save(new Producto(null, "USB Hub", 35.0, 25));
            Integer id = guardado.getIdProducto();

            repositorio.deleteById(id);

            assertThat(repositorio.findById(id)).isEmpty();
        }

        @Test
        @DisplayName("la lista queda vacía después de eliminar el único producto")
        void listaVaciaTrasBorrarUnico() {
            Producto guardado = repositorio.save(new Producto(null, "Cable HDMI", 15.0, 100));

            repositorio.deleteById(guardado.getIdProducto());

            assertThat(repositorio.findAll()).isEmpty();
        }

        @Test
        @DisplayName("no elimina otros productos al borrar uno específico")
        void noAfectaOtrosProductos() {
            Producto p1 = repositorio.save(new Producto(null, "Disco SSD", 120.0, 12));
            Producto p2 = repositorio.save(new Producto(null, "RAM 16GB", 80.0, 20));

            repositorio.deleteById(p1.getIdProducto());

            assertThat(repositorio.findById(p2.getIdProducto())).isPresent();
            assertThat(repositorio.findAll()).hasSize(1);
        }
    }
}
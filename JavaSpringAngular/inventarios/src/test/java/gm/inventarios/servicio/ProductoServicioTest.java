package gm.inventarios.servicio;

import gm.inventarios.modelo.Producto;
import gm.inventarios.repositorio.ProductoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServicioTest {

    @Mock
    private ProductoRepositorio repositorio;

    @InjectMocks
    private ProductoServicio servicio;

    private Producto productoValido;

    @BeforeEach
    void setUp() {
        productoValido = new Producto(1, "Laptop", 1500.0, 10);
    }

    // -------------------------------------------------------
    // listarProductos
    // -------------------------------------------------------
    @Nested
    @DisplayName("listarProductos")
    class ListarProductos {

        @Test
        @DisplayName("retorna todos los productos cuando hay datos")
        void retornaListaConProductos() {
            Producto otro = new Producto(2, "Mouse", 25.0, 50);
            when(repositorio.findAll()).thenReturn(List.of(productoValido, otro));

            List<Producto> resultado = servicio.listarProductos();

            assertThat(resultado).hasSize(2);
            assertThat(resultado).extracting(Producto::getDescripcion)
                    .containsExactly("Laptop", "Mouse");
        }

        @Test
        @DisplayName("retorna lista vacía cuando no hay productos")
        void retornaListaVaciaWhenSinProductos() {
            when(repositorio.findAll()).thenReturn(Collections.emptyList());

            List<Producto> resultado = servicio.listarProductos();

            assertThat(resultado).isEmpty();
        }
    }

    // -------------------------------------------------------
    // buscarProductoPorId
    // -------------------------------------------------------
    @Nested
    @DisplayName("buscarProductoPorId")
    class BuscarProductoPorId {

        @Test
        @DisplayName("retorna el producto cuando el id existe")
        void retornaProductoCuandoExiste() {
            when(repositorio.findById(1)).thenReturn(Optional.of(productoValido));

            Producto resultado = servicio.buscarProductoPorId(1);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getIdProducto()).isEqualTo(1);
            assertThat(resultado.getDescripcion()).isEqualTo("Laptop");
        }

        @Test
        @DisplayName("retorna null cuando el id no existe")
        void retornaNullCuandoNoExiste() {
            when(repositorio.findById(999)).thenReturn(Optional.empty());

            Producto resultado = servicio.buscarProductoPorId(999);

            assertThat(resultado).isNull();
        }

        @Test
        @DisplayName("retorna null cuando el id es negativo")
        void retornaNullCuandoIdEsNegativo() {
            when(repositorio.findById(-1)).thenReturn(Optional.empty());

            Producto resultado = servicio.buscarProductoPorId(-1);

            assertThat(resultado).isNull();
        }
    }

    // -------------------------------------------------------
    // guardarProducto
    // -------------------------------------------------------
    @Nested
    @DisplayName("guardarProducto")
    class GuardarProducto {

        @Test
        @DisplayName("guarda y retorna el producto con id asignado")
        void guardaProductoValido() {
            when(repositorio.save(any(Producto.class))).thenReturn(productoValido);

            Producto resultado = servicio.guardarProducto(productoValido);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getIdProducto()).isEqualTo(1);
            verify(repositorio, times(1)).save(productoValido);
        }

        @Test
        @DisplayName("permite guardar dos productos con la misma descripción (no hay restricción única)")
        void permiteDuplicadosDeDescripcion() {
            Producto duplicado = new Producto(2, "Laptop", 1500.0, 10);
            when(repositorio.save(productoValido)).thenReturn(productoValido);
            when(repositorio.save(duplicado)).thenReturn(duplicado);

            Producto p1 = servicio.guardarProducto(productoValido);
            Producto p2 = servicio.guardarProducto(duplicado);

            assertThat(p1.getDescripcion()).isEqualTo(p2.getDescripcion());
            assertThat(p1.getIdProducto()).isNotEqualTo(p2.getIdProducto());
            verify(repositorio, times(2)).save(any(Producto.class));
        }
    }

    // -------------------------------------------------------
    // eliminarProductoPorId
    // -------------------------------------------------------
    @Nested
    @DisplayName("eliminarProductoPorId")
    class EliminarProductoPorId {

        @Test
        @DisplayName("llama a deleteById con el id correcto")
        void llamaDeleteByIdCuandoExiste() {
            doNothing().when(repositorio).deleteById(1);

            servicio.eliminarProductoPorId(1);

            verify(repositorio, times(1)).deleteById(1);
        }

        @Test
        @DisplayName("no llama a deleteById mas de una vez")
        void noLlamaDeleteByIdMasDeUnaVez() {
            doNothing().when(repositorio).deleteById(anyInt());

            servicio.eliminarProductoPorId(1);

            verify(repositorio, never()).deleteById(2);
            verify(repositorio, times(1)).deleteById(1);
        }
    }
}
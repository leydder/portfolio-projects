package gm.inventarios.controlador;

import com.fasterxml.jackson.databind.ObjectMapper;
import gm.inventarios.modelo.Producto;
import gm.inventarios.servicio.ProductoServicio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoControlador.class)
class ProductoControladorTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoServicio productoServicio;

    @Autowired
    private ObjectMapper objectMapper;

    private Producto productoValido;

    @BeforeEach
    void setUp() {
        productoValido = new Producto(1, "Laptop", 1500.0, 10);
    }

    // -------------------------------------------------------
    // GET /inventario-app/productos
    // -------------------------------------------------------
    @Nested
    @DisplayName("GET /productos")
    class GetProductos {

        @Test
        @DisplayName("retorna 200 con lista de productos")
        void retorna200ConListaDeProductos() throws Exception {
            when(productoServicio.listarProductos())
                    .thenReturn(List.of(productoValido, new Producto(2, "Mouse", 25.0, 50)));

            mockMvc.perform(get("/inventario-app/productos"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].descripcion").value("Laptop"))
                    .andExpect(jsonPath("$[1].descripcion").value("Mouse"));
        }

        @Test
        @DisplayName("retorna 200 con lista vacía cuando no hay productos")
        void retorna200ConListaVacia() throws Exception {
            when(productoServicio.listarProductos()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/inventario-app/productos"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    // -------------------------------------------------------
    // GET /inventario-app/productos/{id}
    // -------------------------------------------------------
    @Nested
    @DisplayName("GET /productos/{id}")
    class GetProductoPorId {

        @Test
        @DisplayName("retorna 200 con el producto cuando el id existe")
        void retorna200CuandoExiste() throws Exception {
            when(productoServicio.buscarProductoPorId(1)).thenReturn(productoValido);

            mockMvc.perform(get("/inventario-app/productos/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.idProducto").value(1))
                    .andExpect(jsonPath("$.descripcion").value("Laptop"))
                    .andExpect(jsonPath("$.precio").value(1500.0));
        }

        @Test
        @DisplayName("retorna 404 cuando el id no existe")
        void retorna404CuandoNoExiste() throws Exception {
            when(productoServicio.buscarProductoPorId(999)).thenReturn(null);

            mockMvc.perform(get("/inventario-app/productos/999"))
                    .andExpect(status().isNotFound());
        }
    }

    // -------------------------------------------------------
    // POST /inventario-app/productos
    // -------------------------------------------------------
    @Nested
    @DisplayName("POST /productos")
    class PostProducto {

        @Test
        @DisplayName("retorna 200 con el producto guardado cuando los datos son válidos")
        void retorna200ConProductoGuardado() throws Exception {
            Producto nuevo = new Producto(null, "Teclado", 75.0, 30);
            when(productoServicio.guardarProducto(any(Producto.class))).thenReturn(productoValido);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(nuevo)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.idProducto").value(1));
        }

        @Test
        @DisplayName("retorna 400 cuando la descripción es null")
        void retorna400CuandoDescripcionEsNull() throws Exception {
            Producto invalido = new Producto(null, null, 100.0, 5);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.descripcion").exists());
        }

        @Test
        @DisplayName("retorna 400 cuando la descripción está vacía")
        void retorna400CuandoDescripcionEstaVacia() throws Exception {
            Producto invalido = new Producto(null, "   ", 100.0, 5);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.descripcion").exists());
        }

        @Test
        @DisplayName("retorna 400 cuando el precio es cero")
        void retorna400CuandoPrecioEsCero() throws Exception {
            Producto invalido = new Producto(null, "Producto", 0.0, 5);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.precio").exists());
        }

        @Test
        @DisplayName("retorna 400 cuando el precio es negativo")
        void retorna400CuandoPrecioEsNegativo() throws Exception {
            Producto invalido = new Producto(null, "Producto", -50.0, 5);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.precio").exists());
        }

        @Test
        @DisplayName("retorna 400 cuando la existencia es negativa")
        void retorna400CuandoExistenciaEsNegativa() throws Exception {
            Producto invalido = new Producto(null, "Producto", 100.0, -1);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.existencia").exists());
        }

        @Test
        @DisplayName("retorna 400 cuando múltiples campos son inválidos")
        void retorna400CuandoMultiplesCamposInvalidos() throws Exception {
            Producto invalido = new Producto(null, "", -10.0, -5);

            mockMvc.perform(post("/inventario-app/productos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.descripcion").exists())
                    .andExpect(jsonPath("$.precio").exists())
                    .andExpect(jsonPath("$.existencia").exists());
        }
    }

    // -------------------------------------------------------
    // PUT /inventario-app/productos/{id}
    // -------------------------------------------------------
    @Nested
    @DisplayName("PUT /productos/{id}")
    class PutProducto {

        @Test
        @DisplayName("retorna 200 con el producto actualizado cuando el id existe")
        void retorna200CuandoExisteYDatosValidos() throws Exception {
            Producto actualizado = new Producto(1, "Laptop Pro", 2000.0, 5);
            when(productoServicio.buscarProductoPorId(1)).thenReturn(productoValido);
            when(productoServicio.guardarProducto(any(Producto.class))).thenReturn(actualizado);

            mockMvc.perform(put("/inventario-app/productos/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(actualizado)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.descripcion").value("Laptop Pro"))
                    .andExpect(jsonPath("$.precio").value(2000.0));
        }

        @Test
        @DisplayName("retorna 404 cuando el id no existe")
        void retorna404CuandoNoExiste() throws Exception {
            when(productoServicio.buscarProductoPorId(999)).thenReturn(null);

            mockMvc.perform(put("/inventario-app/productos/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(productoValido)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("retorna 400 cuando los datos del cuerpo son inválidos")
        void retorna400CuandoDatosInvalidos() throws Exception {
            when(productoServicio.buscarProductoPorId(1)).thenReturn(productoValido);
            Producto invalido = new Producto(1, null, -10.0, -1);

            mockMvc.perform(put("/inventario-app/productos/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido)))
                    .andExpect(status().isBadRequest());
        }
    }

    // -------------------------------------------------------
    // DELETE /inventario-app/productos/{id}
    // -------------------------------------------------------
    @Nested
    @DisplayName("DELETE /productos/{id}")
    class DeleteProducto {

        @Test
        @DisplayName("retorna 204 cuando el id existe")
        void retorna204CuandoExiste() throws Exception {
            when(productoServicio.buscarProductoPorId(1)).thenReturn(productoValido);
            doNothing().when(productoServicio).eliminarProductoPorId(1);

            mockMvc.perform(delete("/inventario-app/productos/1"))
                    .andExpect(status().isNoContent());

            verify(productoServicio, times(1)).eliminarProductoPorId(1);
        }

        @Test
        @DisplayName("retorna 404 cuando el id no existe")
        void retorna404CuandoNoExiste() throws Exception {
            when(productoServicio.buscarProductoPorId(999)).thenReturn(null);

            mockMvc.perform(delete("/inventario-app/productos/999"))
                    .andExpect(status().isNotFound());

            verify(productoServicio, never()).eliminarProductoPorId(anyInt());
        }
    }
}
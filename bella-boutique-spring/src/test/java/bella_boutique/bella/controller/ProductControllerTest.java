package bella_boutique.bella.controller;

import bella_boutique.bella.dto.ProductRequestDTO;
import bella_boutique.bella.dto.ProductResponseDTO;
import bella_boutique.bella.exception.GlobalExceptionHandler;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.security.JwtUtil;
import bella_boutique.bella.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {ProductController.class, GlobalExceptionHandler.class})
@WithMockUser
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private ProductResponseDTO productResponse;

    @BeforeEach
    void setUp() {
        productResponse = new ProductResponseDTO();
        productResponse.setId(1L);
        productResponse.setName("Camiseta");
        productResponse.setPrice(new BigDecimal("29.99"));
        productResponse.setStock(10);
    }

    @Test
    void findAll_retorna200ConLista() throws Exception {
        when(productService.findAll()).thenReturn(List.of(productResponse));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Camiseta"));
    }

    @Test
    void findById_retorna200ConProducto() throws Exception {
        when(productService.findById(1L)).thenReturn(productResponse);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Camiseta"));
    }

    @Test
    void findById_inexistente_retorna404ConBodyJSON() throws Exception {
        when(productService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Producto con ID 99 no encontrado"));

        mockMvc.perform(get("/api/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Producto con ID 99 no encontrado"));
    }

    @Test
    void findById_idNegativo_retorna400() throws Exception {
        mockMvc.perform(get("/api/products/-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_retorna201ConProductoCreado() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO();
        request.setReferenceNumber("REF-001");
        request.setName("Camiseta");
        request.setPrice(new BigDecimal("29.99"));
        request.setStock(10);

        when(productService.create(any(ProductRequestDTO.class))).thenReturn(productResponse);

        mockMvc.perform(post("/api/products").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Camiseta"));
    }

    @Test
    void create_bodyInvalido_retorna400() throws Exception {
        ProductRequestDTO request = new ProductRequestDTO();
        // sin name ni price — inválido

        mockMvc.perform(post("/api/products").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

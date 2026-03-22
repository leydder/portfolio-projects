package leydder.com.inventory.exception;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Integer id) {
        super("Producto no encontrado con id: " + id);
    }
}

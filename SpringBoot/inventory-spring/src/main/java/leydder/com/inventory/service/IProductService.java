package leydder.com.inventory.service;

import leydder.com.inventory.model.Product;

import java.util.List;

public interface IProductService {
    List<Product> showProducts();
    Product searchProductById(Integer productId);

    void saveProduct(Product product);

    void deleteProductById(Integer productId);
}

package leydder.com.inventory.service;

import leydder.com.inventory.model.Product;
import leydder.com.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import leydder.com.inventory.exception.ProductNotFoundException;

import java.util.List;
@Service
public class ProductoService implements IProductService {

    @Autowired
    private ProductRepository productRepository;
    @Override
    public List<Product> showProducts() {
        return this.productRepository.findAll();
    }

    @Override
    public Product searchProductById(Integer productId) {
        return this.productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
    }

    @Override
    public void saveProduct(Product product) {
    this.productRepository.save(product);
    }

    @Override
    public void deleteProductById(Integer productId) {
        this.productRepository.deleteById(productId);
    }
}

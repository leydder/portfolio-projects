package leydder.com.inventory.service;

import leydder.com.inventory.exception.ProductNotFoundException;
import leydder.com.inventory.model.Product;
import leydder.com.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService implements IProductService {

    private final ProductRepository productRepository;

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
        searchProductById(productId);
        this.productRepository.deleteById(productId);
    }
}
package bella_boutique.bella.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Archivos subidos
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);

        // Frontend SPA: si el archivo existe en static lo sirve, si no devuelve index.html
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        return (requested.exists() && requested.isReadable())
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}
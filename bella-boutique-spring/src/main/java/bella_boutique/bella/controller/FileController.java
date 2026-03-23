package bella_boutique.bella.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        // Crea la carpeta uploads si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Genera nombre único para evitar colisiones
        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        String url = "/uploads/" + filename;
        return ResponseEntity.ok(Map.of("url", url));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
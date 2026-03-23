package bella_boutique.bella.controller;

import bella_boutique.bella.dto.AuthRequestDTO;
import bella_boutique.bella.model.User;
import bella_boutique.bella.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody AuthRequestDTO dto,
                                       @RequestParam(defaultValue = "USER") String role) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(dto, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
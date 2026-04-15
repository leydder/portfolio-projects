package bella_boutique.bella.security;

import bella_boutique.bella.model.Role;
import bella_boutique.bella.model.User;
import bella_boutique.bella.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("darsy roa")) {
            User admin = new User();
            admin.setUsername("darsy roa");
            admin.setPassword(passwordEncoder.encode("Isabella2023"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Usuario admin creado con credenciales por defecto");
        }
    }
}
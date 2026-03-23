package bella_boutique.bella.service;

import bella_boutique.bella.dto.AuthRequestDTO;
import bella_boutique.bella.model.User;

import java.util.List;

public interface UserService {
    User create(AuthRequestDTO dto, String role);
    List<User> findAll();
    void delete(Long id);
    void changePassword(Long id, String newPassword);
}
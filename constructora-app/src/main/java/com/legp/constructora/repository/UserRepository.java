package com.legp.constructora.repository;

import com.legp.constructora.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}

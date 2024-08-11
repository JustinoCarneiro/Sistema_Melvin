package br.com.melvin.sistema.security.model;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "users")
@Entity(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class User implements UserDetails{
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String login;
    private String password;
    private UserRole role;

    public User(String login, String password, UserRole role){
        this.login = login;
        this.password = password;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if     (this.role == UserRole.COOR)     return List.of( new SimpleGrantedAuthority("ROLE_COOR"));
        else if(this.role == UserRole.PROF)     return List.of(new SimpleGrantedAuthority("ROLE_PROF"));
        else if(this.role == UserRole.AUX)      return List.of(new SimpleGrantedAuthority("ROLE_AUX")); 
        else if(this.role == UserRole.COZI)     return List.of(new SimpleGrantedAuthority("ROLE_COZI"));
        else if(this.role == UserRole.ADM)      return List.of(new SimpleGrantedAuthority("ROLE_ADM"));
        else if(this.role == UserRole.MARK)     return List.of(new SimpleGrantedAuthority("ROLE_MARK"));
        else if(this.role == UserRole.ZELA)     return List.of(new SimpleGrantedAuthority("ROLE_ZELA"));
        else                                    return List.of(new SimpleGrantedAuthority("ROLE_DIRE"));
    }

    @Override
    public String getPassword() {
        return password;
    }
    @Override
    public String getUsername() {
        return login;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    }
}

package com.agentgate.identity.infrastructure;

import com.agentgate.common.AgentGateProperties;
import com.agentgate.common.error.ProblemDetailsAccessDeniedHandler;
import com.agentgate.common.error.ProblemDetailsAuthenticationEntryPoint;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.UUID;

@Configuration
@EnableMethodSecurity
public class IdentitySecurityConfiguration {

    @Bean
    PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }

    @Bean
    UserDetailsService adminUserDetailsService(AgentGateProperties properties, PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(User.withUsername(properties.adminUsername())
                .password(encoder.encode(properties.adminPassword()))
                .roles("ADMIN", "APPROVER")
                .build());
    }


/** Loads a persistent RSA key pair from base64-encoded DER environment variables. */
@Bean
KeyPair jwtKeyPair(AgentGateProperties properties) {
    try {
        byte[] privateDer = Base64.getDecoder()
                .decode(properties.jwtPrivateKeyBase64());

        byte[] publicDer = Base64.getDecoder()
                .decode(properties.jwtPublicKeyBase64());

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        RSAPrivateKey privateKey = (RSAPrivateKey) keyFactory.generatePrivate(
                new PKCS8EncodedKeySpec(privateDer));

        RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(
                new X509EncodedKeySpec(publicDer));

        if (!privateKey.getModulus().equals(publicKey.getModulus())
                || publicKey.getModulus().bitLength() < 2048) {
            throw new IllegalArgumentException(
                    "RSA keys do not match or are smaller than 2048 bits");
        }

        return new KeyPair(publicKey, privateKey);

    } catch (Exception exception) {
        throw new IllegalStateException(
                "JWT RSA key configuration is invalid. Check JWT_PRIVATE_KEY_BASE64 and JWT_PUBLIC_KEY_BASE64.",
                exception);
    }
}


    @Bean
    JWKSource<SecurityContext> jwkSource(KeyPair jwtKeyPair) {
        RSAKey rsaKey = new RSAKey.Builder((RSAPublicKey) jwtKeyPair.getPublic())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS256)
                .privateKey((RSAPrivateKey) jwtKeyPair.getPrivate())
                .keyID(UUID.nameUUIDFromBytes(jwtKeyPair.getPublic().getEncoded()).toString())
                .build();
        return new ImmutableJWKSet<>(new JWKSet(rsaKey));
    }

    @Bean
    JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) { return new NimbusJwtEncoder(jwkSource); }

    @Bean
    JwtDecoder jwtDecoder(KeyPair jwtKeyPair, AgentGateProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey((RSAPublicKey) jwtKeyPair.getPublic()).build();
        OAuth2TokenValidator<org.springframework.security.oauth2.jwt.Jwt> validator =
                JwtValidators.createDefaultWithIssuer(properties.issuer());
        decoder.setJwtValidator(validator);
        return decoder;
    }

    @Bean
    AuthorizationServerSettings authorizationServerSettings(AgentGateProperties properties) {
        return AuthorizationServerSettings.builder().issuer(properties.issuer()).build();
    }

    @Bean
    @Order(1)
    SecurityFilterChain authorizationServerSecurity(HttpSecurity http,
            ProblemDetailsAuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        http.oauth2AuthorizationServer(authorizationServer ->
                http.securityMatcher(authorizationServer.getEndpointsMatcher()));
        http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(authenticationEntryPoint));
        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain mcpSecurity(HttpSecurity http,
            ProblemDetailsAuthenticationEntryPoint authenticationEntryPoint,
            ProblemDetailsAccessDeniedHandler accessDeniedHandler) throws Exception {
        http.securityMatcher("/mcp", "/mcp/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().hasAuthority("SCOPE_tools:invoke"))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    @Order(3)
    SecurityFilterChain adminApiSecurity(HttpSecurity http,
            ProblemDetailsAuthenticationEntryPoint authenticationEntryPoint,
            ProblemDetailsAccessDeniedHandler accessDeniedHandler) throws Exception {
        http.securityMatcher("/api/v1/**")
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/approvals/**").hasRole("APPROVER")
                .anyRequest().hasRole("ADMIN"))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    @Order(4)
    SecurityFilterChain defaultSecurity(HttpSecurity http,
            ProblemDetailsAuthenticationEntryPoint authenticationEntryPoint,
            ProblemDetailsAccessDeniedHandler accessDeniedHandler) throws Exception {
        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .httpBasic(Customizer.withDefaults())
            .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()));
        return http.build();
    }
}

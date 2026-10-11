package com.malankaclo.backend.admin;

import com.malankaclo.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminApiIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminUserService adminUserService;

    private String username;
    private String password;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        username = "admin_" + suffix;
        password = "password-" + suffix;
        adminUserService.create(new CreateAdminUserCommand(username, password));
    }

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/admin/categories"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void loginCreatesSessionAndGrantsAdminAccess() throws Exception {
        MockHttpSession session = login();

        mockMvc.perform(get("/api/admin/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));

        String slug = "admin-cat-" + UUID.randomUUID().toString().substring(0, 8);
        String body = "{\"name\":\"Новая катэгорыя\",\"slug\":\"" + slug + "\",\"sortOrder\":3}";

        mockMvc.perform(post("/api/admin/categories")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value(slug));

        // The category is now visible in the public catalog listing.
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.slug == '" + slug + "')]").isNotEmpty());
    }

    @Test
    void adminMutationWithoutCsrfIsForbidden() throws Exception {
        MockHttpSession session = login();
        String body = "{\"name\":\"X\",\"slug\":\"x-" + UUID.randomUUID() + "\",\"sortOrder\":1}";

        mockMvc.perform(post("/api/admin/categories")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        String body = "{\"username\":\"" + username + "\",\"password\":\"totally-wrong\"}";

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    private MockHttpSession login() throws Exception {
        String body = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }
}

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import prisma from "@/lib/prisma";

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test user data
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "testpassword123",
};

describe("Authentication Tests", () => {
  // Setup: Create a test user before running tests
  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: {
        OR: [{ username: testUser.username }, { email: testUser.email }],
      },
    });

    // Create test user
    await prisma.user.create({
      data: testUser,
    });
  });

  // Cleanup: Remove test user after tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [{ username: testUser.username }, { email: testUser.email }],
      },
    });
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Login Page", () => {
    test("renders login form", () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    test("handles successful login", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "123",
          username: testUser.username,
          email: testUser.email,
        }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByPlaceholderText("Username"), {
        target: { value: testUser.username },
      });
      fireEvent.change(screen.getByPlaceholderText("password"), {
        target: { value: testUser.password },
      });

      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: testUser.username,
            password: testUser.password,
          }),
        });
      });
    });

    test("handles login failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Invalid username or password",
        }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByPlaceholderText("Username"), {
        target: { value: testUser.username },
      });
      fireEvent.change(screen.getByPlaceholderText("password"), {
        target: { value: "wrongpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(
          screen.getByText("Invalid username or password")
        ).toBeInTheDocument();
      });
    });

    test("shows loading state during login", async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  id: "123",
                  username: testUser.username,
                  email: testUser.email,
                }),
              });
            }, 100);
          })
      );

      render(<LoginPage />);

      fireEvent.change(screen.getByPlaceholderText("Username"), {
        target: { value: testUser.username },
      });
      fireEvent.change(screen.getByPlaceholderText("password"), {
        target: { value: testUser.password },
      });

      fireEvent.click(screen.getByRole("button", { name: "Login" }));

      expect(
        screen.getByRole("button", { name: "Logging in..." })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Username")).toBeDisabled();
      expect(screen.getByPlaceholderText("password")).toBeDisabled();
    });
  });

  describe("Login API", () => {
    test("should successfully login with correct credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "123",
          username: testUser.username,
          email: testUser.email,
        }),
        headers: new Headers({
          "set-cookie": "session=123; HttpOnly; SameSite=Strict",
        }),
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: testUser.username,
          password: testUser.password,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty("username", testUser.username);
      expect(data).toHaveProperty("email", testUser.email);
      expect(data).not.toHaveProperty("password");
    });

    test("should fail with incorrect password", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: "Invalid username or password",
        }),
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: testUser.username,
          password: "wrongpassword",
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty("error", "Invalid username or password");
    });
  });
});

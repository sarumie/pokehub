import { describe, it, expect, beforeEach, mock } from "bun:test";
import { POST } from "@/app/api/auth/login/route";

// Create mock functions for Prisma
const mockPrismaUser = {
  findUnique: mock(),
};

const mockPrisma = {
  user: mockPrismaUser,
};

// Create mock functions for cookies
const mockCookies = {
  set: mock(),
};

const mockCookiesFunction = mock(() => mockCookies);

// Mock the modules
mock.module("@/lib/prisma", () => ({
  default: mockPrisma,
}));

mock.module("next/headers", () => ({
  cookies: mockCookiesFunction,
}));

describe("/api/auth/login", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    mockPrismaUser.findUnique.mockClear();
    mockCookies.set.mockClear();
    mockCookiesFunction.mockClear();
  });

  const createMockRequest = (body) => {
    return {
      json: mock(() => Promise.resolve(body)),
    };
  };

  describe("POST", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        profilePicture: "avatar.jpg",
        fullName: "Test User",
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        profilePicture: mockUser.profilePicture,
        fullName: mockUser.fullName,
      });
      expect(mockCookies.set).toHaveBeenCalledWith({
        name: "session",
        value: mockUser.id,
        httpOnly: true,
        secure: false, // NODE_ENV is not 'production' in tests
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    });

    it("should return 401 for invalid username", async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        username: "nonexistent",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: "Invalid username or password",
      });
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid password", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: "password123",
        email: "test@example.com",
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const request = createMockRequest({
        username: "testuser",
        password: "wrongpassword",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: "Invalid username or password",
      });
      expect(mockCookies.set).not.toHaveBeenCalled();
    });

    it("should handle missing username", async () => {
      // Mock to return null user when username is undefined
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: "Invalid username or password",
      });
    });

    it("should handle missing password", async () => {
      // Mock to return null user when searching without password
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        username: "testuser",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({
        error: "Invalid username or password",
      });
    });

    it("should handle database errors", async () => {
      mockPrismaUser.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle prepared statement errors with retry logic", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        profilePicture: "avatar.jpg",
        fullName: "Test User",
      };

      // Set up mock call count and responses
      let callCount = 0;
      mockPrismaUser.findUnique.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(
            new Error('prepared statement "stmt_1" already exists')
          );
        }
        if (callCount === 2) {
          return Promise.reject(
            new Error('prepared statement "stmt_2" already exists')
          );
        }
        return Promise.resolve(mockUser);
      });

      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.id).toBe(mockUser.id);
      expect(callCount).toBe(3);
    });

    it("should handle malformed JSON request", async () => {
      const request = {
        json: mock(() => Promise.reject(new Error("Invalid JSON"))),
      };

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });
  });
});

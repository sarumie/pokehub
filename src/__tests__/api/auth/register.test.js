import { describe, it, expect, beforeEach, mock } from "bun:test";
import { POST } from "@/app/api/auth/register/route";

// Create mock functions for Prisma
const mockPrismaUser = {
  findFirst: mock(),
  create: mock(),
};

const mockPrisma = {
  user: mockPrismaUser,
};

// Mock the modules
mock.module("@/lib/prisma", () => ({
  default: mockPrisma,
}));

describe("/api/auth/register", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    mockPrismaUser.findFirst.mockClear();
    mockPrismaUser.create.mockClear();
  });

  const createMockRequest = (body) => {
    return {
      json: mock(() => Promise.resolve(body)),
    };
  };

  describe("POST", () => {
    it("should successfully register a new user", async () => {
      const newUserData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const createdUser = {
        id: "user-456",
        ...newUserData,
      };

      mockPrismaUser.findFirst.mockResolvedValue(null); // No existing user
      mockPrismaUser.create.mockResolvedValue(createdUser);

      const request = createMockRequest(newUserData);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        message: "Registration successful",
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
        },
      });

      expect(mockPrismaUser.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: newUserData.username },
            { email: newUserData.email },
          ],
        },
      });

      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: newUserData,
      });
    });

    it("should return 400 if username already exists", async () => {
      const existingUser = {
        id: "user-123",
        username: "existinguser",
        email: "different@example.com",
        password: "password123",
      };

      mockPrismaUser.findFirst.mockResolvedValue(existingUser);

      const request = createMockRequest({
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Username already exists",
      });
      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });

    it("should return 400 if email already exists", async () => {
      const existingUser = {
        id: "user-123",
        username: "differentuser",
        email: "existing@example.com",
        password: "password123",
      };

      mockPrismaUser.findFirst.mockResolvedValue(existingUser);

      const request = createMockRequest({
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Email already exists",
      });
      expect(mockPrismaUser.create).not.toHaveBeenCalled();
    });

    it("should handle missing username", async () => {
      const request = createMockRequest({
        email: "test@example.com",
        password: "password123",
      });

      // The API will likely throw an error when trying to find user with undefined username
      mockPrismaUser.findFirst.mockRejectedValue(new Error("Missing username"));

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle missing email", async () => {
      const request = createMockRequest({
        username: "testuser",
        password: "password123",
      });

      mockPrismaUser.findFirst.mockRejectedValue(new Error("Missing email"));

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle missing password", async () => {
      const request = createMockRequest({
        username: "testuser",
        email: "test@example.com",
      });

      mockPrismaUser.findFirst.mockResolvedValue(null);
      mockPrismaUser.create.mockRejectedValue(new Error("Missing password"));

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle database connection errors during user lookup", async () => {
      mockPrismaUser.findFirst.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createMockRequest({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });

    it("should handle database errors during user creation", async () => {
      mockPrismaUser.findFirst.mockResolvedValue(null); // No existing user
      mockPrismaUser.create.mockRejectedValue(
        new Error("Database constraint violation")
      );

      const request = createMockRequest({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
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

    it("should handle empty request body", async () => {
      const request = createMockRequest({});

      mockPrismaUser.findFirst.mockRejectedValue(
        new Error("Missing required fields")
      );

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal server error",
      });
    });
  });
});

import { describe, it, expect, beforeEach, mock } from "bun:test";
import { GET, POST, PUT, DELETE } from "@/app/api/cart/route";

// Create mock functions for Prisma
const mockPrismaCart = {
  findMany: mock(),
  findFirst: mock(),
  create: mock(),
  update: mock(),
  delete: mock(),
  findUnique: mock(),
};

const mockPrismaListing = {
  findUnique: mock(),
};

const mockPrisma = {
  cart: mockPrismaCart,
  listing: mockPrismaListing,
};

// Mock the modules
mock.module("@/lib/prisma", () => ({
  default: mockPrisma,
}));

describe("/api/cart", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    mockPrismaCart.findMany.mockClear();
    mockPrismaCart.findFirst.mockClear();
    mockPrismaCart.create.mockClear();
    mockPrismaCart.update.mockClear();
    mockPrismaCart.delete.mockClear();
    mockPrismaCart.findUnique.mockClear();
    mockPrismaListing.findUnique.mockClear();
  });

  const createMockRequest = (body = null, searchParams = {}) => {
    const url = new URL("http://localhost/api/cart");
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const request = {
      url: url.toString(),
    };

    if (body) {
      request.json = mock(() => Promise.resolve(body));
    }

    return request;
  };

  describe("GET", () => {
    it("should successfully fetch cart items for a user", async () => {
      const mockCartItems = [
        {
          id: "cart-1",
          idUser: "user-123",
          idListings: "listing-1",
          quantity: 2,
          totalPrice: 100,
          createdAt: new Date(),
          listing: {
            name: "Pikachu Card",
            pictUrl: "pikachu.jpg",
            price: 50,
            stock: 10,
            seller: {
              id: "seller-1",
              username: "pokeseller",
              profilePicture: "seller.jpg",
            },
          },
        },
      ];

      mockPrismaCart.findMany.mockResolvedValue(mockCartItems);

      const request = createMockRequest(null, { userId: "user-123" });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockCartItems);
      expect(mockPrismaCart.findMany).toHaveBeenCalledWith({
        where: { idUser: "user-123" },
        include: {
          listing: {
            select: {
              name: true,
              pictUrl: true,
              price: true,
              stock: true,
              seller: {
                select: {
                  id: true,
                  username: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return 400 if userId is missing", async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "User ID is required",
      });
      expect(mockPrismaCart.findMany).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockPrismaCart.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createMockRequest(null, { userId: "user-123" });

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("POST", () => {
    it("should successfully add new item to cart", async () => {
      const mockListing = {
        id: "listing-1",
        name: "Charizard Card",
        price: 150,
        stock: 5,
      };

      const mockCartItem = {
        id: "cart-1",
        idUser: "user-123",
        idListings: "listing-1",
        quantity: 1,
        totalPrice: 150,
      };

      mockPrismaListing.findUnique.mockResolvedValue(mockListing);
      mockPrismaCart.findFirst.mockResolvedValue(null); // No existing cart item
      mockPrismaCart.create.mockResolvedValue(mockCartItem);

      const request = createMockRequest({
        userId: "user-123",
        listingId: "listing-1",
        quantity: 1,
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockCartItem);
      expect(mockPrismaCart.create).toHaveBeenCalledWith({
        data: {
          idUser: "user-123",
          idListings: "listing-1",
          quantity: 1,
          totalPrice: 150,
        },
      });
    });

    it("should update existing cart item quantity", async () => {
      const mockListing = {
        id: "listing-1",
        name: "Charizard Card",
        price: 150,
        stock: 5,
      };

      const existingCartItem = {
        id: "cart-1",
        idUser: "user-123",
        idListings: "listing-1",
        quantity: 1,
        totalPrice: 150,
      };

      const updatedCartItem = {
        ...existingCartItem,
        quantity: 3,
        totalPrice: 450,
      };

      mockPrismaListing.findUnique.mockResolvedValue(mockListing);
      mockPrismaCart.findFirst.mockResolvedValue(existingCartItem);
      mockPrismaCart.update.mockResolvedValue(updatedCartItem);

      const request = createMockRequest({
        userId: "user-123",
        listingId: "listing-1",
        quantity: 3,
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(updatedCartItem);
      expect(mockPrismaCart.update).toHaveBeenCalledWith({
        where: { id: existingCartItem.id },
        data: {
          quantity: 3,
          totalPrice: 450,
        },
      });
    });

    it("should return 400 for missing required fields", async () => {
      const request = createMockRequest({
        userId: "user-123",
        // Missing listingId and quantity
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Missing required fields",
      });
    });

    it("should return 404 if listing not found", async () => {
      mockPrismaListing.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        userId: "user-123",
        listingId: "nonexistent-listing",
        quantity: 1,
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        error: "Listing not found",
      });
    });

    it("should handle database errors", async () => {
      mockPrismaListing.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const request = createMockRequest({
        userId: "user-123",
        listingId: "listing-1",
        quantity: 1,
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("PUT", () => {
    it("should successfully update cart item quantity", async () => {
      const mockCartItem = {
        id: "cart-1",
        idUser: "user-123",
        idListings: "listing-1",
        quantity: 2,
        totalPrice: 300,
        listing: {
          price: 150,
        },
      };

      const updatedCartItem = {
        ...mockCartItem,
        quantity: 3,
        totalPrice: 450,
        listing: {
          name: "Charizard Card",
          pictUrl: "charizard.jpg",
          price: 150,
          stock: 5,
          seller: {
            id: "seller-1",
            username: "pokeseller",
            profilePicture: "seller.jpg",
          },
        },
      };

      mockPrismaCart.findUnique.mockResolvedValue(mockCartItem);
      mockPrismaCart.update.mockResolvedValue(updatedCartItem);

      const request = createMockRequest({
        cartItemId: "cart-1",
        quantity: 3,
      });

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(updatedCartItem);
      expect(mockPrismaCart.update).toHaveBeenCalledWith({
        where: { id: "cart-1" },
        data: {
          quantity: 3,
          totalPrice: 450,
        },
        include: {
          listing: {
            select: {
              name: true,
              pictUrl: true,
              price: true,
              stock: true,
              seller: {
                select: {
                  id: true,
                  username: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      });
    });

    it("should return 400 for invalid cart item ID or quantity", async () => {
      const request = createMockRequest({
        cartItemId: "",
        quantity: 0,
      });

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Invalid cart item ID or quantity",
      });
    });

    it("should return 404 if cart item not found", async () => {
      mockPrismaCart.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        cartItemId: "nonexistent-cart",
        quantity: 2,
      });

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toEqual({
        error: "Cart item not found",
      });
    });

    it("should handle database errors", async () => {
      mockPrismaCart.findUnique.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest({
        cartItemId: "cart-1",
        quantity: 2,
      });

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal Server Error",
      });
    });
  });

  describe("DELETE", () => {
    it("should successfully delete cart item", async () => {
      mockPrismaCart.delete.mockResolvedValue({});

      const request = createMockRequest(null, { cartItemId: "cart-1" });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        message: "Cart item deleted successfully",
      });
      expect(mockPrismaCart.delete).toHaveBeenCalledWith({
        where: { id: "cart-1" },
      });
    });

    it("should return 400 if cart item ID is missing", async () => {
      const request = createMockRequest();

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Cart item ID is required",
      });
      expect(mockPrismaCart.delete).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockPrismaCart.delete.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest(null, { cartItemId: "cart-1" });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal Server Error",
      });
    });

    it("should handle non-existent cart item deletion", async () => {
      mockPrismaCart.delete.mockRejectedValue(
        new Error("Record to delete does not exist")
      );

      const request = createMockRequest(null, {
        cartItemId: "nonexistent-cart",
      });

      const response = await DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: "Internal Server Error",
      });
    });
  });
});

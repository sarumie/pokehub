import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

import { POST } from "@/app/api/cart/create-cart/route";
import { POST as POST2 } from "@/app/api/cart/add-to-cart/route";
import { GET } from "@/app/api/cart/get-cart/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import { cookies } from "next/headers";

jest.mock("@/env", () => ({
  env: {
    EMAIL_USER: "test@example.com",
    EMAIL_PASSWORD: "test-password",
    CLERK_SIGNING_SECRET: "test-secret",
    REDIS_URL: "redis://localhost:6379",
    NEXT_PUBLIC_AUTHORIZATION_TOKEN: "test-token",
  },
}));

jest.mock("@/lib/redis", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: null })),
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("mock-create-cart route", () => {
  function createRequest(body: object, headers: Record<string, string> = {}) {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 1
  test("The create-cart route should create a sessionId and save it to the cookies as cartSessionId.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.cart.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({
      id: "dkjhfnskghriu39430087",
    });

    const req = createRequest(
      {
        productId: "123",
        quantity: 1,
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );

    const res = await POST(req);

    const cookie = res.cookies.get("cartSessionId");
    expect(cookie).toBeTruthy();
  });

  // Test 2
  test("If the route fails to create the sessionId it should return a 400 error.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.cart.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({
      id: "dkjhfnskghriu39430087",
    });

    const req = createRequest({
      productId: "123",
      quantity: 2,
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 3
  test("The error message should be 'Error: Failed to create sessionId'.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.cart.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });
    (prisma.cartItem.create as jest.Mock).mockResolvedValue({
      id: "dkjhfnskghriu39430087",
    });

    const req = createRequest({
      productId: "123",
      quantity: 1,
    });
    const res = await POST(req);

    expect(res.statusText).toBe("Error: Failed to create sessionId");
  });
});

describe("mock-get-cart route", () => {
  function createRequest(
    searchParams?: Record<string, string>,
    headers: Record<string, string> = {}
  ) {
    const params = new URLSearchParams(searchParams).toString();
    const url = `http://localhost/api/cart/get-cart${
      params ? `?${params}` : ""
    }`;
    return {
      url,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof GET>[0];
  }

  // Test 4
  test("In the get-cart route it should accesss the cartSessionId as cartSessionId in the cookies.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-197.0.156.72" }),
    });

    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest({});

    const res = await GET(req);
    
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
  });

  // Test 5
  test("If it does not find a cartSessionId it should return a 404 error.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest({});

    const res = await GET(req);

    expect(res.status).toBe(404);
  });

  // Test 6
  test("The error message should be 'No sessionId found'.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest({});

    const res = await GET(req);

    expect(res.statusText).toBe("No sessionId found");
  });
});

describe("mock-add-to-cart route", () => {
  function createRequest(body: object, headers: Record<string, string> = {}) {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof POST2>[0];
  }

  // Test 7
  test("In the add-to-cart route it should access the cartSessionId as cartSessionId.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-197.0.156.72" }),
    });

    (prisma.cart.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest(
      {
        productId: "123",
        quantity: 2,
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );
    const res = await POST(req);

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("cartSessionId");
  });
});

describe("mock-create-cart route", () => {
  function createRequest(body: object, headers: Record<string, string> = {}) {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 8
  test("In the create-cart route it should access the cartSessionId as cartSessionId.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-197.0.156.72" }),
    });

    (prisma.cart.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest(
      {
        productId: "123",
        quantity: 1,
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );
    const res = await POST(req);

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("cartSessionId");
  });
});
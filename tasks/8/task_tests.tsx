import { POST } from "@/app/api/wishlist/add-to-wishlist/route";
import { GET } from "@/app/api/wishlist/get-wishlist/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import { addDays } from "date-fns";
import { cookies, headers } from "next/headers";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    wishlist: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    wishlistItem: {
      create: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("mock-add-to-wishlist route", () => {
  function createRequest(body: object, headers: Record<string, string> = {}) {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 1
  test("The add-to-wishlist route should create a sessionId and save it to the cookies as wishlistSessionId.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-123" }),
    });

    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dkjhfnskghriu39430087",
      expiresAt: addDays(new Date(), 30),
    });

    const req = createRequest(
      {
        productId: "123",
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );

    const res = await POST(req);

    const cookie = res.cookies.get("wishlistSessionId");
    expect(cookie).toBeTruthy();
  });

  // Test 2
  test("If the route fails to create the sessionId it should return a 400 error.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dkjhfnskghriu39430087",
    });
    const req = createRequest({
      productId: "123",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 3
  test("The error message should be 'Error: Failed to create sessionId'.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dksgnfjn49854y9whunkfjdsmdjfb4",
    });

    const req = createRequest({
      productId: "123",
    });
    const res = await POST(req);

    expect(res.statusText).toBe("Error: Failed to create sessionId");
  });
});

describe("mock-get-wishlist route", () => {
  function createRequest(searchParams?: Record<string, string>) {
    const params = new URLSearchParams(searchParams).toString();
    const url = `http://localhost/api/wishlist/get-wishlist${
      params ? `?${params}` : ""
    }`;
    return {
      url,
    } as unknown as Parameters<typeof GET>[0];
  }

  // Test 4
  test("In the get-wishlist route it should accesss the wishlistSessionId as wishlistSessionId in the cookies.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-123" }),
    });

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest({});

    const res = await GET(req);


    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("wishlistSessionId");
    
  });

  // Test 5
  test("If it does not find a wishlistSessionId it should return a 404 error.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
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

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest({});

    const res = await GET(req);

    expect(res.statusText).toBe("No sessionId found");
  });
});

describe("mock-add-to-wishlist route", () => {
  function createRequest(body: object, headers: Record<string, string> = {}) {
    return {
      json: async () => body,
      headers: {
        get: (key: string) => headers[key.toLowerCase()] ?? null,
      },
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 7
  test("In the add-to-wishlist route it should access the wishlistSessionId as wishlistSessionId.", async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "user-123" }),
    });

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dkvnsfgkj0340349809680n",
    });

    const req = createRequest(
      {
        productId: "123",
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );
    const res = await POST(req);

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("wishlistSessionId");
  });
});
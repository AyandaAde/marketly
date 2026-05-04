import { POST } from "@/app/api/add-to-wishlist/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { addDays } from "date-fns";

jest.mock("@/env", () => ({
  env: {
    OPENAI_API_KEY: "ewknoi302j984dkjshfnk3847249h",
  },
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: null, isLoaded: true }),
  useAuth: () => ({ userId: null, isLoaded: true, isSignedIn: false }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    wishlist: {
      create: jest.fn(),
    },
    wishlistItem: {
      create: jest.fn(),
    },
  },
}));

const cookie: Record<string, string> = {};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => {
      if (cookie[name]) {
        return { value: cookie[name] };
      }
      return undefined;
    }),
    set: jest.fn((options: { name: string; value: string }) => {
      cookie[options.name] = options.value;
    }),
  })),
}));

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    responses: {
      create: jest.fn().mockResolvedValue({
        output_text: JSON.stringify({
          category: "general-consultation",
        }),
      }),
    },
  }));
});

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: "sdknskfn39481379",
    }),
  }),
}));

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
  test("The system should get the user's ip address.", async () => {
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "dksgnfjn49854y9whunkfjdsmdjfb4",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dkdkjgnsjrfenowiu3084130473",
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
    const body = await res.json();
    expect(body).toHaveProperty("ip", "197.0.156.72");
  });

  // Test 2
  test("If the system fails to get the user's ip address it should return a 400 error.", async () => {
    const req = createRequest({
      productId: "123",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // Test 3
  test("The error message should say 'Error getting user's IP address'.", async () => {
    const req = createRequest({
      productId: "123",
    });

    const res = await POST(req);
    expect(res.statusText).toBe("Error getting user's IP address");
  });

  // Test 4
  test("The system should use a hash function to create the sessionId.", async () => {
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "dksgnfjn49854y9whunkfjdsmdjfb4",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dkdkjgnsjrfenowiu3084130473",
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
    const body = await res.json();

    expect(body).toHaveProperty("hashedAndSalted");
    expect(typeof body.hashedAndSalted).toBe("string");
    expect(body.hashedAndSalted.length).toBeGreaterThan(20);
  });

  // Test 5
  test("The route should save the sessionId to the user's cookies.", async () => {
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "dksgnfjn49854y9whunkfjdsmdjfb4",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dkdkjgnsjrfenowiu3084130473",
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
    expect(cookie).toContain("sessionId");

    const session = cookie?.match(/sessionId=([^;]+)/);
    const returnedSessionId = session![1];

    expect(returnedSessionId).toBeDefined();
    expect(typeof returnedSessionId).toBe("string");
    expect(returnedSessionId.length).toBeGreaterThan(0);
  });

  // Test 6
  test("The sessionId should contain the last three characters of the current timestamp.", async () => {
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "djhgnfdkjghiuy47564y7oehsufd",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dngblskdgnsldjfhwo548o93u9749",
    });

    const beforePost = Date.now();
    const req = createRequest(
      {
        productId: "123",
      },
      {
        "x-forwarded-for": "197.0.156.72",
      }
    );

    const res = await POST(req);

    const afterPost = Date.now();

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    expect(cookie).toContain("sessionId");

    const session = cookie?.match(/sessionId=([^;]+)/);
    const returnedSessionId = session![1];

    const min = beforePost.toString(36).slice(-3);
    const max = afterPost.toString(36).slice(-3);

    const sessionIdTimestampPart = returnedSessionId.slice(-3);
    const sessionTimestamp = parseInt(sessionIdTimestampPart, 36);
    const minNum = parseInt(min, 36);
    const maxNum = parseInt(max, 36);

    expect(sessionTimestamp).toBeGreaterThanOrEqual(minNum);
    expect(sessionTimestamp).toBeLessThanOrEqual(maxNum);
  });

  // Test 7
  test("The route should save the sesssionId expiry to the database.", async () => {
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
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

    await POST(req);

    expect(prisma.wishlist.create).toHaveBeenCalledTimes(1);

    const callArgs = (prisma.wishlist.create as jest.Mock).mock.calls[0][0];
    const actualSessionId = callArgs.data.sessionId;
    const actualSessionExpiry = callArgs.data.sessionExpiry;

    // Verify sessionId is a string and has expected structure (20 chars + 3 char timestamp)
    expect(actualSessionId).toBeDefined();
    expect(typeof actualSessionId).toBe("string");
    expect(actualSessionId.length).toBeGreaterThan(0);

    const expectedExpiry = addDays(new Date(), 30);
    const timeDiff = Math.abs(
      actualSessionExpiry.getTime() - expectedExpiry.getTime()
    );
    expect(timeDiff).toBeLessThan(10000);

    expect(prisma.wishlist.create).toHaveBeenCalledTimes(1);
    expect(prisma.wishlist.create).toHaveBeenCalledWith({
      data: {
        sessionId: actualSessionId,
        sessionExpiry: expect.any(Date),
      },
    });
  });
});
import { DELETE } from "@/app/api/wishlist/delete-from-wishlist/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    wishlist: {
      findUnique: jest.fn(),
    },
    wishlistItem: {
      delete: jest.fn(),
    },
  },
}));

const cookie: Record<string, string> = {};

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name: string) => {
        if (cookie[name]) {
          return { value: cookie[name] };
        }
        return undefined;
      }),
      set: jest.fn((options: { name: string; value: string }) => {
        cookie[options.name] = options.value;
      }),
    })
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("mock-delete-from-wishlist route", () => {
  function createRequest(body: object, cookies: Record<string, string> = {}) {
    return {
      json: async () => body,
    } as unknown as Parameters<typeof DELETE>[0];
  }

  // Test 1
  test("The system should send the user's userId to the backend.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dcsnjfkdsjhieur983475487594",
    });
    (prisma.wishlistItem.delete as jest.Mock).mockResolvedValue({
      id: "dmfsndfeluj843379u09",
    });
    const req = createRequest({
        userId: "user_ijsniudhfnsdi38794832",
        productId: "123",
    });

    const res = await DELETE(req);
    const data = await res.json();
    expect(data).toHaveProperty("userId", "user_ijsniudhfnsdi38794832");
  });

  // Test 2
  test("If there is no userId or sessionId in the backend it should return a 400 error.", async () => {
    const req = createRequest({
      data: {
        productId: "123",
      },
    });

    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  // Test 3
  test("The error message should be 'No sessionId found'", async () => {
    const req = createRequest({
      productId: "123",
    });

    const res = await DELETE(req);
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeFalsy();

    expect(res.statusText).toBe("No sessionId found");
  });

  // Test 4
  test("The system should delete the wishlistItem.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dcsnjfkdsjhieur983475487594",
    });
    (prisma.wishlistItem.delete as jest.Mock).mockResolvedValue({
      id: "dmfsndfeluj843379u09",
    });
    const req = createRequest({
      userId: "user_dkjbfuhnksduy734948e4",
      productId: "123",
    });

    await DELETE(req);

    expect(prisma.wishlistItem.delete).toHaveBeenCalledTimes(1);
    expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
      where: {
        wishlistId_productId: {
          wishlistId: "dcsnjfkdsjhieur983475487594",
          productId: "123",
        },
      },
    });
  });

  // Test 5
  test("If the system fails to delete the item it should return a 500 error.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    const req = createRequest({
      userId: "user_dkjbfuhnksduy734948e4",
      productId: "123",
    });

    const res = await DELETE(req);

    expect(res.status).toBe(500);
  });

  // Test 6
  test("The error message should be 'Internal server error'.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    const req = createRequest({
      userId: "user_dkjbfuhnksduy734948e4",
      productId: "123",
    });

    const res = await DELETE(req);

    expect(res.statusText).toBe("Internal server error");
  });

  // Test 7
  test("If the system succeeds it should return a 200 status.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dcsnjfkdsjhieur983475487594",
    });
    (prisma.wishlistItem.delete as jest.Mock).mockResolvedValue({
      id: "dmfsndfeluj843379u09",
    });
    const req = createRequest({
      userId: "user_dkjbfuhnksduy734948e4",
      productId: "123",
    });

    const res = await DELETE(req);

    expect(res.status).toBe(200);
  });

  // Test 9
  test("The status message should be 'Successfully deleted item from wishlist'", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dcsnjfkdsjhieur983475487594",
    });
    (prisma.wishlistItem.delete as jest.Mock).mockResolvedValue({
      id: "dmfsndfeluj843379u09",
    });
    const req = createRequest({
      userId: "user_dkjbfuhnksduy734948e4",
      productId: "123",
    });

    const res = await DELETE(req);

    expect(res.statusText).toBe("Successfully deleted item from wishlist");
  });
});
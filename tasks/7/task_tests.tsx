import { GET } from "@/app/api/wishlist/get-wishlist/route";
import { POST } from "@/app/api/wishlist/add-to-wishlist/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import { cookies } from "next/headers";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    wishlist: {
      create: jest.fn(),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        return Promise.resolve({
          id: "dmsndjfnskjd98345947575",
          wishListItems: include?.wishListItems
            ? [
                {
                  id: "sdjfnskjhdsfgw475492874",
                  productId: "123",
                  wishlistId: "dmsndjfnskjd98345947575",
                },
              ]
            : undefined,
        });
      }),
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

describe("mock-get-wishlist route", () => {
  function createRequest(searchParams?: Record<string, string>) {
    const params = new URLSearchParams(searchParams).toString();
    const url = `http://localhost/api/get-wishlist${
      params ? `?${params}` : ""
    }`;
    return {
      url,
    } as unknown as Parameters<typeof GET>[0];
  }

  // Test 1
  test("The get-whislit route should return the wishlistItems.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dmsndjfnskjd98345947575",
      wishListItems: [
        {
          id: "sdjfnskjhdsfgw475492874",
          productId: "123",
          wishlistId: "dmsndjfnskjd98345947575",
        },
      ],
    });

    const req = createRequest({
      userId: "user_asjkahfdjfhai3894738",
    });

    await GET(req);

    expect(prisma.wishlist.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
      where: {
        userId: "user_asjkahfdjfhai3894738",
      },
      include: {
        wishListItems: true,
      },
    });
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

  // Test 2
  test("The add-to-wishlist route should check whether a wishlist exists.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dmsndjfnskjd98345947575",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dmsndjfnskjd98345947575",
    });

    const req = createRequest({
      userId: "user_asjkahfdjfhai3894738",
      productId: "123",
    });

    await POST(req);

    expect(prisma.wishlist.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
      where: {
        userId: "user_asjkahfdjfhai3894738",
      },
    });
  });

  // Test 3
  test("If the wishlist exists it should add the item to the wishlist.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      id: "dmsndjfnskjd98345947575",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "dmsndjfnskjd98345947575",
    });

    const req = createRequest({
      userId: "user_asjkahfdjfhai3894738",
      productId: "123",
    });

    await POST(req);

    expect(prisma.wishlist.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
      where: {
        userId: "user_asjkahfdjfhai3894738",
      },
    });
    expect(prisma.wishlistItem.create).toHaveBeenCalledTimes(1);
    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: {
        wishlistId: "dmsndjfnskjd98345947575",
        productId: "123",
      },
    });
  });

  // Test 4
  test("If the wishlist doesn't exists it should create the wishlist and add the item to the wishlist. ", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "djskndhrisukt4854954",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "djkfjhgfujhri854795384",
    });
    const req = createRequest({
      userId: "user_djkinisudhfwni384972384",
      productId: "123",
    });

    await POST(req);

    expect(prisma.wishlist.create).toHaveBeenCalledTimes(1);
    expect(prisma.wishlist.create).toHaveBeenCalledWith({
      data: {
        userId: "user_djkinisudhfwni384972384",
      },
    });
    expect(prisma.wishlistItem.create).toHaveBeenCalledTimes(1);
    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: {
        wishlistId: "djskndhrisukt4854954",
        productId: "123",
      },
    });
  });

  // Test 5
  test("If the route fails to add the item to the wishlist it should return a 500 error. ", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );
    (prisma.wishlist.create as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );

    const req = createRequest({
      userId: "user_djkinisudhfwni384972384",
      productId: "123",
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });

  // Test 6
  test("The error message should be 'Internal server error'", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );
    (prisma.wishlist.create as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );

    const req = createRequest({
      userId: "user_djkinisudhfwni384972384",
      productId: "123",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Internal server error");
  });

  // Test 7
  test("If the route succeeds it should return a 200 status.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "djskndhrisukt4854954",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "djkfjhgfujhri854795384",
    });
    const req = createRequest({
      userId: "user_djkinisudhfwni384972384",
      productId: "123",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  // Test 8
  test("The success message should be 'Successfully added item to wishlist'.", async () => {
    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.wishlist.create as jest.Mock).mockResolvedValue({
      id: "djskndhrisukt4854954",
    });
    (prisma.wishlistItem.create as jest.Mock).mockResolvedValue({
      id: "djkfjhgfujhri854795384",
    });
    const req = createRequest({
      userId: "user_djkinisudhfwni384972384",
      productId: "123",
    });

    const res = await POST(req);
    expect(res.statusText).toBe("Successfully added item to wishlist");
  });
});
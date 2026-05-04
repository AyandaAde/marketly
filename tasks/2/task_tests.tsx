import { POST, openai } from "@/app/api/match-with-consultant/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import OpenAI from "openai";

jest.mock("@/env", () => ({
  env: {
    OPENAI_API_KEY: "test-api-key",
  },
}));

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    consultant: {
      findMany: jest.fn(),
    },
  },
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("mock-match-with-consultant route", () => {
  function createRequest(body: object) {
    return {
      json: async () => body,
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 1
  test("If no inquiry is present the route should return a 400 error.", async () => {
    const req = createRequest({
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 2
  test("The error message should say 'Error: Missing requirement inquiry'.", async () => {
    const req = createRequest({
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement inquiry");
  });

  // Test 3
  test("The enpoint must use AI to match the user with a consultant.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockResolvedValue([
      {
        expertise: [
          {
            title: "Technology & Software Development",
            value: "technology-and-software-development",
          },
          { title: "SEO", value: "seo" },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          { title: "Other", value: "other" },
        ],
        id: "693fe461238099a934c383f1",
        image: "/images/james-richardson.jpg",
        name: "Mr.Jamees R",
        email: "james@email.com",
        title: "Consultant",
        initials: "JR",
        location: "British Columbia, Canada",
      },
    ]);

    const req = createRequest({
      inquiry: "I'd like to get a site made.",
      email: "jason.c@email.com",
    });

    await POST(req);

    expect((openai as any).responses.create).toHaveBeenCalledTimes(1);
  });

  // Test 4
  test("If the route successfully matches the user with a consultant it should return a 200 status.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockResolvedValue([
      {
        expertise: [
          {
            title: "Technology & Software Development",
            value: "technology-and-software-development",
          },
          { title: "SEO", value: "seo" },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          { title: "Other", value: "other" },
        ],
        id: "693fe461238099a934c383f1",
        image: "/images/james-richardson.jpg",
        name: "Mr.Jamees R",
        email: "james@email.com",
        title: "Consultant",
        initials: "JR",
        location: "British Columbia, Canada",
      },
    ]);
    const req = createRequest({
      inquiry: "I'd like to get a site made.",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect((openai as any).responses.create).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
  });

  // Test 5
  test("The status message should be 'Successfully matched with consultant'.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockResolvedValue([
      {
        expertise: [
          {
            title: "Technology & Software Development",
            value: "technology-and-software-development",
          },
          { title: "SEO", value: "seo" },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          { title: "Other", value: "other" },
        ],
        id: "693fe461238099a934c383f1",
        image: "/images/james-richardson.jpg",
        name: "Mr.Jamees R",
        email: "james@email.com",
        title: "Consultant",
        initials: "JR",
        location: "British Columbia, Canada",
      },
    ]);
    const req = createRequest({
      inquiry: "I'd like to get a site made.",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Successfully matched with consultant");
  });

  // Test 6
  test("If the route fails to match the user with a consultant it should return a 500 status.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );

    const req = createRequest({
      inquiry: "I'd like to get a site made.",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });

  // Test 7
  test("The status message should be 'Internal server error'.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );

    const req = createRequest({
      inquiry: "I'd like to get a site made.",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Internal server error");
  });
});
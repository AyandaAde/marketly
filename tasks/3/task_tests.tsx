import { POST, openai } from "@/app/api/match-with-consultant/route";
import { prisma } from "@/lib/db/prisma";
import "@testing-library/jest-dom";
import nodemailer from "nodemailer";

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

describe("mock-match-with-consultant route", () => {
  function createRequest(body: object) {
    return {
      json: async () => body,
    } as unknown as Parameters<typeof POST>[0];
  }

  // Test 1
  test("If there is no email in the body of the request the endpoint must return a 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 2
  test("The error message must say 'Missing requirement user email'.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement user email");
  });

  // Test 3
  test("If there is no inquiry in the body of the request the endpoint must return a 400 error. ", async () => {
    const req = createRequest({
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 4
  test("The error message must say 'Missing requirement inquiry'.", async () => {
    const req = createRequest({
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement inquiry");
  });

  // Test 5
  test("The endpoint must send an email to the consultant once the user is matched with a consultant.", async () => {
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
    const transport = nodemailer.createTransport();
    expect(transport.sendMail).toHaveBeenCalledTimes(1);
  });

  // Test 6
  test("If the endpoint manages to send an email to the consultant it must return a 200 status.", async () => {
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
    const transport = nodemailer.createTransport();
    expect(transport.sendMail).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
  });

  // Test 7
  test("The status message must say 'Successfully matched with consultant.'", async () => {

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
    const transport = nodemailer.createTransport();
    expect(transport.sendMail).toHaveBeenCalledTimes(1);

    expect(res.statusText).toBe("Successfully matched with consultant");
  });

  // Test 8
  test("If the endpoint fails to match a user with a consultant it should return a 500 error.", async () => {
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

  // Test 9
  test("The error message must say 'Internal server error.'", async () => {
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
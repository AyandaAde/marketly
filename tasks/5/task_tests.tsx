import { POST } from "@/app/api/match-with-consultant/route";
import { prisma } from "@/lib/db/prisma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import nodemailer from "nodemailer";

jest.mock("@/env", () => ({
  env: {
    OPENAI_API_KEY: "ewknoi302j984dkjshfnk3847249h",
  },
}));

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

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
    consultant: {
      findMany: jest.fn(),
    },
    individual: {
      findUnique: jest.fn(),
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
  test("If no firstName is passed to the backend it should throw 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 2
  test("The error message should be 'Error: Missing requirement first name.'", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement first name");
  });

  // Test 3
  test("If no lastName is passed to the backend it should throw 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 4
  test("The error message should be 'Error: Missing requirement last name.'", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement last name");
  });

  // Test 5
  test("If no email is passed to the backend it should throw 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 6
  test("The error message should be 'Error: Missing requirement email.'", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement email");
  });

  // Test 7
  test("The email in the route should match the user's email in the database.", async () => {
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
    (prisma.individual.findUnique as jest.Mock).mockResolvedValue({
      id: "jxskgwdsiukfewjh32482u48293",
      email: "jason.c@email.com",
      firstName: "Jason",
      lastName: "Clark",
    });

    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    await POST(req);

    const transport = nodemailer.createTransport();

    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining("jason.c@email.com"),
      })
    );
  });

  // Test 8
  test("The firstName in the route should match the user's firstName.", async () => {
    (prisma.individual.findUnique as jest.Mock).mockResolvedValue({
      id: "jxskgwdsiukfewjh32482u48293",
      email: "jason.c@email.com",
      firstName: "Jason",
      lastName: "Clark",
    });

    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    await POST(req);
    const transport = nodemailer.createTransport();
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining("Jason"),
      })
    );
  });

  // Test 9
  test("The lastName in the route should match the user's lastName.", async () => {
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
    (prisma.individual.findUnique as jest.Mock).mockResolvedValue({
      id: "jxskgwdsiukfewjh32482u48293",
      email: "jason.c@email.com",
      firstName: "Jason",
      lastName: "Clark",
    });

    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    await POST(req);

    const transport = nodemailer.createTransport();

    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining("Clark"),
      })
    );
  });
});
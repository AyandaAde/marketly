import { POST } from "@/app/api/match-with-consultant/route";
import { MatchWithConsultantModal } from "@/components/matchWithConsultantModal";
import { prisma } from "@/lib/db/prisma";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OpenAI from "openai";

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
  test("The system should throw an error if no firstName or lastName are present in the form.", async () => {
    renderWithQueryClient(
      <MatchWithConsultantModal inquiry="I have an inquiry." />
    );

    await userEvent.click(screen.getByText("Match with the Best Consultant"));
    await userEvent.click(screen.getByText("Submit Inquiry"));

    expect(screen.getByText("Please enter a first name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a last name.")).toBeInTheDocument();
  });

  // Test 2
  test("If no firstName is passed to the backend it should throw 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 3
  test("The error message should be 'Error: Missing requirement first name.'", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement first name");
  });

  // Test 4
  test("If no lastName is passed to the backend it should throw 400 error.", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  // Test 5
  test("The error message should be 'Error: Missing requirement last name.'", async () => {
    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.statusText).toBe("Error: Missing requirement last name");
  });

  // Test 6
  test("If the route succeeds in sending an email to the consultant it should return a 200 status.", async () => {
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
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  // Test 7
  test("If the route fails to send an email to the consultant it should return a 500 status.", async () => {
    (prisma.consultant.findMany as jest.Mock).mockRejectedValue(
      new Error("Internal server error.")
    );

    const req = createRequest({
      inquiry: "I have an inquiry.",
      firstName: "Jason",
      lastName: "Clark",
      email: "jason.c@email.com",
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
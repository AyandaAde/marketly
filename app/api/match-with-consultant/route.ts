import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { inquiry } = await req.json();

    if (!inquiry) {
      throw new Error("Internal server error");
    }

    const consultants = [
      {
        id: "1",
        image: "/images/james-richardson.jpg",
        name: "Mr.Jamees R",
        email: "james@email.com",
        title: "Consultant",
        expertise: [
          {
            title: "Technology & Software Development",
            value: "technology-and-software-development",
          },
          {
            title: "SEO",
            value: "seo",
          },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          {
            title: "Other",
            value: "other",
          },
        ],
        initials: "JR",
        location: "British Columbia, Canada",
      },
      {
        id: "2",
        image: "/images/lola-dam.jpg",
        name: "Ms.Lola D",
        email: "lola@email.com",
        title: "Consultant",
        expertise: [
          {
            title: "SEO",
            value: "seo",
          },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          {
            title: "Other",
            value: "other",
          },
        ],
        initials: "LD",
        location: "New York, United States",
      },
      {
        id: "3",
        image: "/images/joseph-gonzalez.jpg",
        name: "Mr.Joseph G",
        email: "joseph@email.com",
        title: "Consultant",
        expertise: [
          {
            title: "Marketing & Brand Development",
            value: "marketing-and-brand-development",
          },
          { title: "General Consultation", value: "general-consultation" },
          {
            title: "Partnership Opportunity",
            value: "partnership-opportunity",
          },
          {
            title: "Other",
            value: "other",
          },
        ],
        initials: "JG",
        location: "British Columbia, Canada",
      },
    ];

    const consultant = consultants.find((consultant) =>
      consultant.expertise.some((expertise) =>
        inquiry.toLowerCase().includes(expertise.value)
      )
    );

    if (!consultant) {
      return new NextResponse(JSON.stringify(consultants[0]), { status: 200 });
    }

    return new NextResponse(JSON.stringify(consultant), { status: 200 });
  } catch (error) {
    console.error("Error matching with consultant", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

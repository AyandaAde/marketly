import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const consultants = [
    {
      id: "1",
      image: "/images/james-richardson.jpg",
      name: "Mr.Jamees R",
      title: "Consultant",
      expertise: [
        {
          title: "Technology & Software Development",
          value: "technology-and-software-development",
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

  try {
    const consultant = consultants.find((consultant) => consultant.id === id);

    return new NextResponse(JSON.stringify(consultant), { status: 200 });
  } catch (error) {
    console.error("Error finding consultant", error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}

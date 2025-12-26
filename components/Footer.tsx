import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 md:py-12">
            <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row md:justify-between">
                    <Link href={"/"} className="ml-5 rounded-xl">
                        <Image
                            src={"/images/marketly-logo-2.png"}
                            width={200}
                            height={200}
                            alt="KondarSoft logo"
                            className="w-50 rounded-lg"
                        />
                    </Link>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <Link href="https://www.kondarsoft.com/en/page/Terms_of_Services" className="hover:underline">
                        Terms
                    </Link>
                    <Link href="https://www.kondarsoft.com/en/page/privacy_policy" className="hover:underline">
                        Privacy
                    </Link>
                    <Link href="/contact" className="hover:underline">
                        Contact
                    </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Marketly Ltd. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function page() {
  return <AuthenticateWithRedirectCallback />;
}
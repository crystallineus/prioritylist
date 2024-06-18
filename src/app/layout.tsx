import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Link, Navbar, NavbarContent, NavbarItem, NextUIProvider } from "@nextui-org/react";
import { ScrollToTopButton } from "~/app/_components/scroll-top-button";

export const metadata = {
  title: "Priotity Lis By Crystalline",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <Navbar shouldHideOnScroll>
            <NavbarContent>
              <NavbarItem>
                <Link color="foreground" href="/">
                  <p className="text-lg font-semibold">Home</p>
                </Link>
              </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
              <ScrollToTopButton />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </NavbarContent >
          </Navbar>
          <NextUIProvider>
            <TRPCReactProvider>
              {children}
            </TRPCReactProvider>
          </NextUIProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


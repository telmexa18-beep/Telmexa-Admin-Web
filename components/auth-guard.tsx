"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("isAdminLogged") === "true";
      if (!isLogged && pathname !== "/login") {
        router.replace("/login");
      }
      if (isLogged && pathname === "/login") {
        router.replace("/");
      }
    }
  }, [pathname, router]);
  return <>{children}</>;
}

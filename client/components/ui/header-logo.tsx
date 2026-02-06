import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HeaderLogoProps = {
  className?: string;
  href?: string;
  priority?: boolean;
};

export function HeaderLogo({ className, href = "/", priority = false }: HeaderLogoProps) {
  return (
    <Link href={href as any} aria-label="home" className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="御典"
        width={140}
        height={36}
        className="h-12 w-auto"
        priority={priority}
      />
    </Link>
  );
}

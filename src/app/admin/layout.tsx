import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Software Factories",
  robots: { index: false, follow: false },
};

// Every admin page checks the session itself (requireAdminPage); this layout only frames them.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="px-5 pt-10 pb-16 sm:px-14">{children}</div>;
}

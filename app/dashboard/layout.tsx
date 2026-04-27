import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // flex-col on mobile → sidebar becomes a top bar
    // flex-row on sm+   → sidebar sits on the left
    <div className="flex flex-col sm:flex-row h-screen overflow-hidden bg-white">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}

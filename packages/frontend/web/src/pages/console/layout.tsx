// import { DashboardBreadcrumb } from "@/components/layout/dashboard/breadcrumb";
// import { DashboardSidebar } from "@/components/layout/dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* <DashboardSidebar /> */}
      <SidebarInset>
        {/* <DashboardBreadcrumb /> */}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

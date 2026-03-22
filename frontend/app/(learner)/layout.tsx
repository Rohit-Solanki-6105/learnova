import { Navbar } from "@/components/Navbar";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}

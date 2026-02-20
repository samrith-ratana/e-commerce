import CreatePostForm from "@/components/CreatePostForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SellPage() {
  // In a real app, you'd get the token from cookies or a session
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  // Redirect if not logged in
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <CreatePostForm token={token} />
    </div>
  );
}
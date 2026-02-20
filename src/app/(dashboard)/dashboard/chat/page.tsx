import { requireCurrentUser } from "@/lib/auth/currentUser";
import UserChatPanel from "@/components/UserChatPanel";

export default async function DashboardChatPage() {
  const user = await requireCurrentUser("/dashboard/chat");

  return (
    <div className="h-[calc(100svh-8rem)] min-h-[520px]">
      <UserChatPanel currentUserId={user.id} />
    </div>
  );
}


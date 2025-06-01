import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useHC } from "@/lib/hono-swr";
import { userClient } from "@/lib/api-client";

export default function Chat() {
  const { data: conversations } = useHC(userClient.chat.conversation.$get, {});
  console.log(conversations);
  return (
    // Wrap with ChatMessageList
    <ChatMessageList>
      <ChatBubble variant="sent">
        <ChatBubbleAvatar fallback="US" />
        <ChatBubbleMessage variant="sent">
          Hello, how has your day been? I hope you are doing well.
        </ChatBubbleMessage>
      </ChatBubble>
      <ChatBubble variant="received">
        <ChatBubbleAvatar fallback="AI" />
        <ChatBubbleMessage variant="received">
          Hi, I am doing well, thank you for asking. How can I help you today?
        </ChatBubbleMessage>
      </ChatBubble>
      <ChatBubble variant="received">
        <ChatBubbleAvatar fallback="AI" />
        <ChatBubbleMessage isLoading />
      </ChatBubble>
    </ChatMessageList>
  );
}

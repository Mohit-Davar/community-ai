import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, StopCircle } from "lucide-react"
import { useChatStore } from "@/lib/store/chatStore"
import { integrationModes } from "@/lib/constants/chat"

export function MessageInput() {
  const { input, setInput, sendMessage, status, selectedMode } = useChatStore();
  const currentMode = integrationModes.find((m) => m.id === selectedMode);
  const currentModeName = currentMode?.name;

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    sendMessage();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-4 dark:border-gray-700 border-t">
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${currentModeName || "the assistant"}...`}
              disabled={status !== "ready"}
              autoFocus
            />
          </div>

          {status === "streaming" ? (
            <Button type="button" variant="outline" size="icon" onClick={() => { }}>
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || status !== "ready"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
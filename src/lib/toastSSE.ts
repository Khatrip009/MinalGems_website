import { toast } from "react-hot-toast";
import { startEventStream } from "./events";

export function startRealtimeToasts() {
  return startEventStream((msg) => {
    if (msg.type === "notification") {
      toast(msg.title || "New update", { icon: "🔔" });
    }
  });
}

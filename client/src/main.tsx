import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TokenProvider } from "./hooks/use-token-auth";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import "./index.css";

// Add custom styles that match design reference
const style = document.createElement("style");
style.innerHTML = `
  .chat-bubble-user {
    border-radius: 18px 18px 4px 18px;
  }
  
  .chat-bubble-tutor {
    border-radius: 18px 18px 18px 4px;
  }
  
  .recording-pulse {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    animation: recording-pulse 2s infinite;
  }
  
  @keyframes recording-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }
  
  @keyframes audio-wave {
    0% {
      height: 5px;
    }
    100% {
      height: 25px;
    }
  }
`;
document.head.appendChild(style);

// Add Google Fonts
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TokenProvider>
      <App />
      <Toaster />
    </TokenProvider>
  </QueryClientProvider>
);

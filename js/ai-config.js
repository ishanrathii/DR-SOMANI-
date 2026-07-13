// Dr Somani's Homoeopathy — AI assistant configuration
// ------------------------------------------------------
// After you deploy the backend (ai/worker.js) to Cloudflare Workers,
// paste its URL below between the quotes, then commit + push.
// Until this is filled in, the chat opens in "setup mode" and points
// patients to WhatsApp instead.
//
// Example: endpoint: "https://dr-somani-ai.yourname.workers.dev"

window.SOMANI_AI = {
  endpoint: "",              // <-- paste your Cloudflare Worker URL here
  whatsapp: "919834172124",  // clinic WhatsApp number (no +, no spaces)
  assistantName: "Sanjeevani",
};

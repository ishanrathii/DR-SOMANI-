// ============================================================
// Online consultation settings — edit the values, commit, push.
// Leave any value as "" to keep that feature hidden / fall back to WhatsApp.
// ============================================================
window.SOMANI_ONLINE = {
  whatsapp: "919834172124",

  // A video-call room link the patient can join. e.g. a Google Meet link
  // "https://meet.google.com/abc-defg-hij" or a Zoom personal room.
  // Empty "" => the "Start video call" button opens WhatsApp instead.
  videoLink: "",

  // Your UPI ID enables the "Pay fee via UPI" button (opens the patient's UPI
  // app on mobile). e.g. "kushalsomani@okhdfcbank". Empty "" => button hidden.
  upiId: "",
  upiName: "Dr Somani's Homoeopathy",

  // Optional consultation fee in INR, e.g. "500". Shown on the pay button.
  fee: "",

  // Optional consultation timings, e.g. "Mon–Sat, 10am–7pm".
  // Empty "" => a neutral "request your preferred slot" message is shown.
  timings: "",
};

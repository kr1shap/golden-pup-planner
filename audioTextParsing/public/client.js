const audioPlayer   = document.getElementById("audioPlayer");
const recordButton  = document.getElementById("recordButton");
const sendButton    = document.getElementById("sendButton");
const statusMessage = document.getElementById("statusMessage");

let mediaRecorder, audioChunks = [], audioBlob, recording = false;

async function startRecording() {
  if (recording) {
    mediaRecorder.stop();
    recording = false;
    recordButton.textContent = "Start Recording";
    sendButton.disabled = false;
    statusMessage.textContent = "Recording stopped. Ready to send.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioPlayer.src = URL.createObjectURL(audioBlob);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    recording = true;
    recordButton.textContent = "Stop Recording";
    sendButton.disabled = true;
    statusMessage.textContent = "Recording... Speak now.";
  } catch (err) {
    console.error("Mic error:", err);
    statusMessage.textContent = "ERROR: microphone permission/device.";
  }
}

recordButton.addEventListener("click", startRecording);

sendButton.addEventListener("click", async () => {
  if (!audioBlob) return;
  statusMessage.textContent = "Sending...";
  const buf = await audioBlob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));

  const r = await fetch("/forward", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_base64: base64, mime: "audio/webm" })
  });

  statusMessage.textContent = r.ok ? "Sent!" : "Send failed.";
});

const form = document.getElementById("registration-form");
const button = document.getElementById("submit-button");
const message = document.getElementById("message");
const ticket = document.getElementById("ticket");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "message";
  button.disabled = true;
  button.textContent = "Submitting…";
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Registration could not be completed.");

    form.hidden = true;
    ticket.hidden = false;
    document.getElementById("registration-id").textContent = result.registration_id;
    const qr = document.getElementById("qrcode");
    qr.innerHTML = "";
    if (window.QRCode) {
      new QRCode(qr, {text: result.qr_token, width: 190, height: 190, correctLevel: QRCode.CorrectLevel.M});
    } else {
      qr.textContent = "QR library unavailable. Save your registration reference: " + result.registration_id;
    }
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
    button.disabled = false;
    button.textContent = "Submit registration";
  }
});
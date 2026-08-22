(() => {
  "use strict";

  // После публикации Telegram Worker вставьте сюда его адрес с /submit.
  const TELEGRAM_ENDPOINT = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/submit";
  const SITE_NAME = "CNPC CFA Partner";

  const form = document.querySelector("#applicationForm");
  const message = document.querySelector("#formMessage");

  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  if (!form || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const button = form.querySelector("button[type='submit']");
    const originalButtonText = button.innerHTML;
    const formData = new FormData(form);

    button.disabled = true;
    button.textContent = "Отправляем…";
    message.classList.remove("success");

    try {
      if (TELEGRAM_ENDPOINT.includes("YOUR-WORKER")) {
        throw new Error("Telegram Worker URL is not configured");
      }

      const response = await fetch(TELEGRAM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          site: SITE_NAME,
          name: formData.get("name"),
          contact: formData.get("contact"),
          email: formData.get("email"),
          experience: formData.get("experience"),
          income: formData.get("income"),
          consent: formData.get("consent") === "yes",
          website: formData.get("website"),
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Telegram submission failed");
      }

      form.reset();
      message.textContent = "Спасибо! Заявка отправлена в Telegram. Мы свяжемся с вами.";
      message.classList.add("success");
    } catch (error) {
      const endpointMissing = TELEGRAM_ENDPOINT.includes("YOUR-WORKER");
      message.textContent = endpointMissing
        ? "Укажите адрес Telegram Worker в файле script.js."
        : "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

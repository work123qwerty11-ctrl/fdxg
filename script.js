@@ -1,8 +1,9 @@
(() => {
  "use strict";

  // После публикации Telegram Worker вставьте сюда его адрес с /submit.
  const TELEGRAM_ENDPOINT = "https://calm-band-0308.work123qwerty11.workers.dev/submit";
  const TELEGRAM_ENDPOINT =
    "https://calm-band-0308.work123qwerty11.workers.dev/submit";

  const SITE_NAME = "CNPC CFA Partner";

  const form = document.querySelector("#applicationForm");
@@ -11,8 +12,11 @@
  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== item) other.open = false;
        if (other !== item) {
          other.open = false;
        }
      });
    });
  });
@@ -28,48 +32,79 @@
    const originalButtonText = button.innerHTML;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("contact") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const experience = String(
      formData.get("experience") || ""
    ).trim();
    const income = String(formData.get("income") || "").trim();

    button.disabled = true;
    button.textContent = "Отправляем…";

    message.textContent = "Отправляем заявку…";
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
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          source: SITE_NAME,

          contact: phone,
          site: SITE_NAME,
          name: formData.get("name"),
          contact: formData.get("contact"),
          email: formData.get("email"),
          experience: formData.get("experience"),
          income: formData.get("income"),
          experience: experience,
          income: income,
          consent: formData.get("consent") === "yes",
          website: formData.get("website"),
          website: formData.get("website") || "",
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
          submittedAt: new Date().toISOString()
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Telegram submission failed");
      const responseText = await response.text();

      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          // Worker может вернуть обычный текст.
        }
      }

      if (
        !response.ok ||
        result.ok === false ||
        result.success === false ||
        result.error
      ) {
        throw new Error(
          result.error || responseText || "Ошибка отправки"
        );
      }

      form.reset();
      message.textContent = "Спасибо! Заявка отправлена в Telegram. Мы свяжемся с вами.";

      message.textContent =
        "Спасибо! Заявка отправлена в Telegram. Мы свяжемся с вами.";

      message.classList.add("success");
    } catch (error) {
      const endpointMissing = TELEGRAM_ENDPOINT.includes("YOUR-WORKER");
      message.textContent = endpointMissing
        ? "Укажите адрес Telegram Worker в файле script.js."
        : "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";
      console.error("Ошибка отправки формы:", error);

      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;

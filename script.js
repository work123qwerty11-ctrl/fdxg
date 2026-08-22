(() => {
  "use strict";

  const TELEGRAM_ENDPOINT =
    "https://calm-band-0308.work123qwerty11.workers.dev/submit";

  const SITE_NAME = "CNPC CFA Partner";

  const form = document.querySelector("#applicationForm");
  const message = document.querySelector("#formMessage");

  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== item) {
          other.open = false;
        }
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
      const response = await fetch(TELEGRAM_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: name,
          phone: phone,
          email: email,
          source: SITE_NAME,

          contact: phone,
          site: SITE_NAME,
          experience: experience,
          income: income,
          consent: formData.get("consent") === "yes",
          website: formData.get("website") || "",
          page: window.location.href,
          submittedAt: new Date().toISOString()
        })
      });

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

      message.textContent =
        "Спасибо! Заявка отправлена в Telegram. Мы свяжемся с вами.";

      message.classList.add("success");
    } catch (error) {
      console.error("Ошибка отправки формы:", error);

      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

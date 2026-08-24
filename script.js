(() => {
  "use strict";

  const FORM_ENDPOINT =
    "https://calm-band-0308.work123qwerty11.workers.dev/";

  const form = document.querySelector("#applicationForm");
  const message = document.querySelector("#formMessage");
  const contactDateSelect = document.querySelector("#contactDate");

  // =========================
  // ДАТЫ
  // =========================

  if (contactDateSelect) {
    const dayFormatter = new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });

    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const value =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

      const label = dayFormatter.format(date);

      const option = document.createElement("option");

      option.value = value;
      option.textContent =
        label.charAt(0).toUpperCase() + label.slice(1);

      contactDateSelect.appendChild(option);
    }
  }

  // =========================
  // FAQ
  // =========================

  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document
        .querySelectorAll(".faq-list details")
        .forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
    });
  });

  // =========================
  // ФОРМА
  // =========================

  if (!form || !message) {
    console.error("Форма #applicationForm или #formMessage не найдена.");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (!button) {
      console.error("Кнопка отправки формы не найдена.");
      return;
    }

    const originalButtonText = button.innerHTML;

    button.disabled = true;
    button.textContent = "Отправляем…";

    message.textContent = "";
    message.classList.remove("success");

    try {
      const formData = new FormData(form);

      // Отправляем форму в Cloudflare Worker
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      console.log("Ответ Cloudflare:", response.status, responseText);

      if (!response.ok) {
        throw new Error(
          "Cloudflare Worker вернул ошибку " + response.status
        );
      }

      // Успешно
      form.reset();

      message.textContent =
        "Спасибо! Заявка отправлена. Мы свяжемся с вами.";

      message.classList.add("success");

    } catch (error) {
      console.error("Ошибка отправки:", error);

      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";

      message.classList.remove("success");

    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

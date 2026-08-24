(() => {
  "use strict";

  // Адрес Cloudflare Worker
  const TELEGRAM_ENDPOINT =
    "https://calm-band-0308.work123qwerty11.workers.dev/submit";

  const SITE_NAME = "CNPC CFA Partner";

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

    for (let i = 1; i <= 14; i += 1) {
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

      document.querySelectorAll(".faq-list details").forEach((other) => {
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
    console.error(
      "Не найдена форма #applicationForm или сообщение #formMessage."
    );
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (!button) {
      console.error("Не найдена кнопка отправки формы.");
      return;
    }

    const originalButtonText = button.innerHTML;
    const formData = new FormData(form);

    // Получаем данные формы
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("contact") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const experience = String(
      formData.get("experience") || ""
    ).trim();
    const income = String(
      formData.get("income") || ""
    ).trim();

    const contactDate = String(
      formData.get("contact_date") || ""
    ).trim();

    const contactTime = String(
      formData.get("contact_time") || ""
    ).trim();

    const website = String(
      formData.get("website") || ""
    ).trim();

    const consent =
      formData.get("consent") === "yes" ||
      formData.get("consent") === "on";

    // =========================
    // СОСТОЯНИЕ КНОПКИ
    // =========================

    button.disabled = true;
    button.textContent = "Отправляем…";

    message.textContent = "Отправляем заявку…";
    message.classList.remove("success");

    try {
      // =========================
      // ОТПРАВКА В CLOUDFLARE
      // =========================

      const response = await fetch(TELEGRAM_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          // Основные поля
          name: name,
          contact: phone,
          email: email,

          // Дополнительные поля
          experience: experience,
          income: income,
          contact_date: contactDate,
          contact_time: contactTime,

          // Согласие
          consent: consent,

          // Служебная информация
          source: SITE_NAME,
          site: SITE_NAME,
          website: website,
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
      });

      // =========================
      // ЧИТАЕМ ОТВЕТ WORKER
      // =========================

      const responseText = await response.text();

      console.log(
        "Cloudflare Worker:",
        response.status,
        responseText
      );

      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          console.warn(
            "Worker вернул не JSON:",
            responseText
          );
        }
      }

      // Worker должен вернуть HTTP 200
      if (!response.ok) {
        throw new Error(
          result.error ||
            responseText ||
            `Ошибка Worker: ${response.status}`
        );
      }

      // Если Worker явно сообщил об ошибке
      if (
        result.ok === false ||
        result.success === false ||
        result.error
      ) {
        throw new Error(
          result.error || "Worker не принял заявку"
        );
      }

      // =========================
      // УСПЕШНО
      // =========================

      form.reset();

      message.textContent =
        "Спасибо! Заявка отправлена. Мы свяжемся с вами.";

      message.classList.add("success");

    } catch (error) {
      console.error(
        "Ошибка отправки заявки:",
        error
      );

      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";

      message.classList.remove("success");

    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

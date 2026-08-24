(() => {
  "use strict";

  // Cloudflare Worker, который принимает заявку
  // и отправляет её в Telegram.
  const FORM_ENDPOINT =
    "https://calm-band-0308.work123qwerty11.workers.dev/";

  const form = document.querySelector("#applicationForm");
  const message = document.querySelector("#formMessage");
  const contactDateSelect = document.querySelector("#contactDate");

  // Заполняем список дат: следующие 14 дней
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

      const value = date.toISOString().slice(0, 10);
      const label = dayFormatter.format(date);

      const option = document.createElement("option");
      option.value = value;
      option.textContent =
        label.charAt(0).toUpperCase() + label.slice(1);

      contactDateSelect.appendChild(option);
    }
  }

  // FAQ: открываем только один вопрос одновременно
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

  // Если формы нет — прекращаем выполнение
  if (!form || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Проверяем обязательные поля
    if (!form.reportValidity()) {
      return;
    }

    const button = form.querySelector("button[type='submit']");

    if (!button) return;

    const originalButtonText = button.innerHTML;

    // Блокируем кнопку на время отправки
    button.disabled = true;
    button.textContent = "Отправляем…";

    // Убираем старые сообщения
    message.textContent = "";
    message.classList.remove("success");

    try {
      // Отправляем данные на Cloudflare Worker
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
      });

      // Если Cloudflare Worker вернул ошибку
      if (!response.ok) {
        throw new Error(
          `Ошибка отправки: ${response.status}`
        );
      }

      // Успешная отправка
      form.reset();

      message.textContent =
        "Спасибо! Заявка отправлена. Мы свяжемся с вами.";

      message.classList.add("success");

    } catch (error) {
      console.error("Ошибка отправки формы:", error);

      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";

      message.classList.remove("success");

    } finally {
      // Возвращаем кнопку в исходное состояние
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

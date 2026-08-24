(() => {
  "use strict";

  // Заявки уходят в Telegram через Bot API.
  // 1) Создайте бота через @BotFather, получите TELEGRAM_BOT_TOKEN.
  // 2) Напишите боту в личку (или добавьте в группу) и узнайте CHAT_ID,
  //    например через https://api.telegram.org/bot<TOKEN>/getUpdates
  // 3) Впишите оба значения ниже.
  const TELEGRAM_BOT_TOKEN = "";
  const TELEGRAM_CHAT_ID = "";

  const form = document.querySelector("#applicationForm");
  const message = document.querySelector("#formMessage");
  const contactDateSelect = document.querySelector("#contactDate");

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
      option.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      contactDateSelect.appendChild(option);
    }
  }


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
    button.disabled = true;
    button.textContent = "Отправляем…";

    try {
      if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        message.textContent =
          "Форма заполнена. Чтобы получать заявки в Telegram, укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в файле script.js.";
        message.classList.add("success");
        return;
      }

      const data = new FormData(form);
      const fields = {
        name: "Имя",
        contact: "Телефон/Telegram",
        email: "Email",
        experience: "Опыт",
        income: "Желаемый доход",
        contact_date: "Дата связи",
        contact_time: "Время связи",
      };

      const lines = ["🆕 Новая заявка — CNPC"];
      for (const [key, label] of Object.entries(fields)) {
        const value = data.get(key);
        if (value) lines.push(`${label}: ${value}`);
      }
      const text = lines.join("\n");

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
          }),
        }
      );

      if (!response.ok) throw new Error("Telegram send failed");

      form.reset();
      message.textContent = "Спасибо! Заявка отправлена. Мы свяжемся с вами.";
      message.classList.add("success");
    } catch (error) {
      message.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.";
      message.classList.remove("success");
    } finally {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
  });
})();

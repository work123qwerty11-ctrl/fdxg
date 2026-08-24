(() => {
  "use strict";

  // Вставьте сюда URL обработчика формы, например Formspree:
  // const FORM_ENDPOINT = "https://formspree.io/f/your-form-id";
  const FORM_ENDPOINT = "";

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
    button.disabled = true;
    button.textContent = "Отправляем…";

    try {
      if (!FORM_ENDPOINT) {
        message.textContent =
          "Форма заполнена. Чтобы получать заявки, укажите FORM_ENDPOINT в файле script.js.";
        message.classList.add("success");
        return;
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

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

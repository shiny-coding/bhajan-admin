export function getFormDataWithDisabled(form: HTMLFormElement): FormData {
  // Temporarily enable disabled fields
  const disabledElements = Array.from(
    form.querySelectorAll(':disabled')
  ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

  disabledElements.forEach((el) => (el.disabled = false));

  // Get form data
  const formData = new FormData(form);

  // Re-disable fields
  disabledElements.forEach((el) => (el.disabled = true));

  return formData;
}
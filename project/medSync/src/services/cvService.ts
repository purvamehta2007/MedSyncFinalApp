export async function detectMedicine(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/scan", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.medicine;
}
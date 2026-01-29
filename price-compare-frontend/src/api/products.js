
export async function getProducts() {
  const response = await fetch("http://127.0.0.1:8000/products");
  return response.json();
}


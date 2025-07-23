export const submitVC = async (vc) => {
  const res = await fetch("http://localhost:3002/verify-vc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vc }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "🚫 VC submission failed");
  }

  return result;
};
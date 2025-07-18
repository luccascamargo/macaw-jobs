async function createBoard(title: string, userId: string) {
  const res = await fetch("/api/boards", {
    method: "POST",
    body: JSON.stringify({ title, userId }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
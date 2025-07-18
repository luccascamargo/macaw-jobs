async function createColumn(title: string, boardId: string, order = 0) {
    const res = await fetch("/api/columns", {
      method: "POST",
      body: JSON.stringify({ title, boardId, order }),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }
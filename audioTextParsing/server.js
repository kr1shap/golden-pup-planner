import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// serve the client files
app.use(express.static("public"));

// example API (adjust/replace with your real endpoint)
app.post("/forward", async (req, res) => {
  // do server work here; you can use `fetch` directly in Node 22
  res.json({ ok: true });
});

const PORT = 3000; // pick a port not used by anything else
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));

import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import cors from "cors";

const app = express();

app.use(cors());

// 🔥 ENDPOINT PRINCIPAL
app.get("/eventos", async (req, res) => {
  try {
    const html = await fetch("https://la14hd.com/eventos/").then(r => r.text());
    const $ = cheerio.load(html);

    let eventos = [];

    $(".card").each((i, el) => {

      let texto = $(el).find("h5").text().trim();
      let horaRaw = $(el).find(".badge").text().trim();

      if (!texto || !horaRaw) return;

      // 🧠 convertir hora (ej: 01:00 p.m.)
      let fecha = new Date();
      let match = horaRaw.match(/(\d+):(\d+)\s*(a|p)\.?m/i);

      if (match) {
        let h = parseInt(match[1]);
        let m = parseInt(match[2]);

        if (match[3].toLowerCase() === "p" && h !== 12) h += 12;
        if (match[3].toLowerCase() === "a" && h === 12) h = 0;

        fecha.setHours(h, m, 0, 0);
      }

      // 🎯 LOGO AUTOMÁTICO
      let logo = "https://i.imgur.com/ltvvJIQ.png";

      if (texto.toLowerCase().includes("libertadores"))
        logo = "https://i.imgur.com/NPNpKyZ.png";
      else if (texto.toLowerCase().includes("sudamericana"))
        logo = "https://i.imgur.com/Wd3aZZv.png";
      else if (texto.toLowerCase().includes("champions"))
        logo = "https://i.imgur.com/EtazmuU.png";
      else if (texto.toLowerCase().includes("europa"))
        logo = "https://i.imgur.com/P3htWtk.png";

      eventos.push({
        hora: fecha.toISOString(),
        texto,
        logo,
        duracion: 120
      });

    });

    res.json(eventos);

  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

// PUERTO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor listo en puerto " + PORT));

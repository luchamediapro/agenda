import fetch from "node-fetch";
import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const html = await fetch("https://la14hd.com/eventos/").then(r => r.text());
    const $ = cheerio.load(html);

    let eventos = [];

    $(".card").each((i, el) => {

      let texto = $(el).find("h5").text().trim();
      let horaRaw = $(el).find(".badge").text().trim();

      if (!texto || !horaRaw) return;

      let fecha = new Date();
      let match = horaRaw.match(/(\d+):(\d+)\s*(a|p)\.?m/i);

      if (match) {
        let h = parseInt(match[1]);
        let m = parseInt(match[2]);

        if (match[3].toLowerCase() === "p" && h !== 12) h += 12;
        if (match[3].toLowerCase() === "a" && h === 12) h = 0;

        fecha.setHours(h, m, 0, 0);
      }

      // logos simples automáticos
      let logo = "https://i.imgur.com/ltvvJIQ.png";

      if (texto.toLowerCase().includes("libertadores"))
        logo = "https://i.imgur.com/NPNpKyZ.png";
      else if (texto.toLowerCase().includes("sudamericana"))
        logo = "https://i.imgur.com/Wd3aZZv.png";
      else if (texto.toLowerCase().includes("champions"))
        logo = "https://i.imgur.com/EtazmuU.png";

      eventos.push({
        hora: fecha.toISOString(),
        texto,
        logo,
        duracion: 120
      });

    });

    res.status(200).json(eventos);

  } catch (err) {
    res.status(500).json([]);
  }
}

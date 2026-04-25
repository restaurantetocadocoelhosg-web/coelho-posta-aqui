const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '50mb' }));

// ── Separa o nome do prato em duas linhas elegantes ───────────────────────────
function separarPrato(prato) {
  const palavras = prato.trim().split(/\s+/);

  if (palavras.length === 1) {
    return { linha1: palavras[0], linha2: '' };
  }

  // Preposições e artigos que ficam na segunda linha
  const preps = ['de', 'do', 'da', 'dos', 'das', 'com', 'ao', 'à', 'a', 'e', 'no', 'na', 'nos', 'nas', 'em'];

  for (let i = 1; i < palavras.length; i++) {
    if (preps.includes(palavras[i].toLowerCase())) {
      return {
        linha1: palavras.slice(0, i).join(' '),
        linha2: palavras.slice(i).join(' ')
      };
    }
  }

  const meio = Math.ceil(palavras.length / 2);
  return {
    linha1: palavras.slice(0, meio).join(' '),
    linha2: palavras.slice(meio).join(' ')
  };
}

// ── Capitaliza elegantemente ──────────────────────────────────────────────────
function capitalizar(texto) {
  const preps = ['de', 'do', 'da', 'dos', 'das', 'com', 'ao', 'à', 'a', 'e', 'no', 'na', 'nos', 'nas', 'em'];
  return texto.split(' ').map((p, i) => {
    if (i > 0 && preps.includes(p.toLowerCase())) return p.toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  }).join(' ');
}

// ── Gera o HTML do poster minimalista ─────────────────────────────────────────
function gerarHTML({ prato, foto_base64, foto_mime, posicao }) {
  const pratoFormatado = capitalizar(prato);
  const { linha1, linha2 } = separarPrato(pratoFormatado);

  const fotoSrc = foto_base64
    ? `data:${foto_mime || 'image/jpeg'};base64,${foto_base64}`
    : '';

  const posicoes = {
    'top-right':    { top: '6%',  right: '6%',  left: 'auto', textAlign: 'right', gradPos: '85% 15%' },
    'top-left':     { top: '6%',  right: 'auto', left: '6%',  textAlign: 'left',  gradPos: '15% 15%' },
    'center-right': { top: '30%', right: '6%',  left: 'auto', textAlign: 'right', gradPos: '85% 35%' },
    'bottom-right': { top: '60%', right: '6%',  left: 'auto', textAlign: 'right', gradPos: '85% 65%' },
    'bottom-left':  { top: '60%', right: 'auto', left: '6%',  textAlign: 'left',  gradPos: '15% 65%' },
  };

  const pos = posicoes[posicao] || posicoes['top-right'];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    position: relative;
    background: #000;
  }

  .foto {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
  }
  .foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(
      ellipse at ${pos.gradPos},
      rgba(0,0,0,0.5) 0%,
      rgba(0,0,0,0.15) 45%,
      transparent 65%
    );
    z-index: 1;
  }

  .nome-prato {
    position: absolute;
    top: ${pos.top};
    left: ${pos.left};
    right: ${pos.right};
    text-align: ${pos.textAlign};
    z-index: 10;
    max-width: 70%;
  }

  .linha1 {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 128px;
    color: #f0e2c4;
    line-height: 1.05;
    text-shadow:
      0 2px 20px rgba(0,0,0,0.8),
      0 6px 40px rgba(0,0,0,0.5),
      0 0 80px rgba(0,0,0,0.3);
    letter-spacing: 1px;
  }
  .linha1.longa { font-size: 100px; }
  .linha1.muito-longa { font-size: 80px; }

  .linha2 {
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    font-weight: 300;
    font-size: 76px;
    color: #e0d0aa;
    line-height: 1.15;
    text-shadow:
      0 2px 15px rgba(0,0,0,0.8),
      0 4px 30px rgba(0,0,0,0.5);
    letter-spacing: 8px;
    margin-top: 0;
  }
  .linha2.longa { font-size: 60px; }

</style>
</head>
<body>

  <div class="foto">
    ${fotoSrc ? `<img src="${fotoSrc}" />` : ''}
  </div>

  <div class="overlay"></div>

  <div class="nome-prato">
    <div class="linha1 ${linha1.length > 10 ? (linha1.length > 16 ? 'muito-longa' : 'longa') : ''}">${linha1}</div>
    ${linha2 ? `<div class="linha2 ${linha2.length > 14 ? 'longa' : ''}">${linha2}</div>` : ''}
  </div>

</body>
</html>`;
}

// ── Rota principal ────────────────────────────────────────────────────────────
app.post('/poster', async (req, res) => {
  const { prato, foto_base64, foto_mime, posicao } = req.body;

  if (!prato) return res.status(400).json({ error: 'prato é obrigatório' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const pos = posicao || ['top-right', 'top-left', 'center-right'][Math.floor(Math.random() * 3)];

    const html = gerarHTML({ prato, foto_base64, foto_mime, posicao: pos });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1500);

    const png = await page.screenshot({ type: 'png', fullPage: false });

    res.set('Content-Type', 'image/png');
    res.send(png);

    console.log(`[Coelho API v2] ✅ Poster: ${prato} | Pos: ${pos}`);
  } catch (err) {
    console.error('[Coelho API v2] ❌', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Coelho Poster API v2' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Coelho API v2] Porta ${PORT}`));

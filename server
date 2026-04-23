const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '50mb' }));

// ── Paletas de cor ────────────────────────────────────────────────────────────
const PALETAS = {
  olive: {
    bgTop: '#3d4a2a',
    bgTopGrad: 'linear-gradient(180deg, #2e3a1e 0%, #4a5c2e 40%, #3d4a2a 100%)',
    bgBottom: '#6b2d2d',
    textoTitulo: '#ffffff',
    textoHeadline: '#d4af37',
    textoBarra: '#f5e6c8',
  },
  burgundo: {
    bgTop: '#3d0e0e',
    bgTopGrad: 'linear-gradient(180deg, #2a0808 0%, #5c1a1a 40%, #3d0e0e 100%)',
    bgBottom: '#2a4a1e',
    textoTitulo: '#d4af37',
    textoHeadline: '#d4af37',
    textoBarra: '#f5e6c8',
  },
  ambar: {
    bgTop: '#2a1f0a',
    bgTopGrad: 'linear-gradient(180deg, #1a1205 0%, #3d2e0e 40%, #2a1f0a 100%)',
    bgBottom: '#5c2d00',
    textoTitulo: '#ffffff',
    textoHeadline: '#d4af37',
    textoBarra: '#f5e6c8',
  }
};

// ── Taglines automáticas ──────────────────────────────────────────────────────
function gerarTagline(prato) {
  const p = prato.toLowerCase();
  if (p.includes('camarão') || p.includes('camarao')) return 'Cremoso, reconfortante e cheio de sabor.';
  if (p.includes('arroz')) return 'Cremoso, suave e irresistível.';
  if (p.includes('costela')) return 'Macia, suculenta e cheia de sabor.';
  if (p.includes('frango')) return 'Temperado, suculento e feito com carinho.';
  if (p.includes('peixe') || p.includes('bacalhau')) return 'Fresquinho, saboroso e especial.';
  if (p.includes('feijão') || p.includes('feijoada')) return 'Encorpado, saboroso e irresistível.';
  if (p.includes('massa') || p.includes('macarrão')) return 'Al dente, saboroso e cremoso.';
  return 'Feito com carinho e ingredientes selecionados.';
}

// ── Gera o HTML do poster ─────────────────────────────────────────────────────
function gerarHTML({ prato, headline, foto_base64, foto_mime, paleta_nome }) {
  const paleta = PALETAS[paleta_nome] || PALETAS.burgundo;
  const tagline = gerarTagline(prato);
  const fotoSrc = foto_base64
    ? `data:${foto_mime || 'image/jpeg'};base64,${foto_base64}`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    font-family: 'Georgia', 'Times New Roman', serif;
    background: ${paleta.bgTopGrad};
    position: relative;
  }

  /* ── FOTO DE FUNDO ── */
  .foto-fundo {
    position: absolute;
    top: 380px;
    left: 0; right: 0;
    height: 1100px;
    overflow: hidden;
  }
  .foto-fundo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .foto-fundo::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(to bottom, ${paleta.bgTop}, transparent);
  }
  .foto-fundo::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 300px;
    background: linear-gradient(to top, ${paleta.bgBottom}ee, transparent);
    z-index: 1;
  }

  /* ── LOGO ── */
  .logo {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    height: 120px;
    background: #5c0a0a;
    border: 4px solid #d4af37;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .logo-coelho {
    font-size: 32px;
    margin-bottom: 2px;
  }
  .logo-restaurante {
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: 22px;
    color: #f5e6c8;
    letter-spacing: 1px;
  }
  .logo-nome {
    font-size: 11px;
    color: #d4af37;
    letter-spacing: 3px;
    font-weight: bold;
    text-transform: uppercase;
  }

  /* ── ORNAMENTOS DE CANTO ── */
  .corner { position: absolute; z-index: 10; color: #d4af37; font-size: 28px; opacity: 0.7; }
  .corner-tl { top: 180px; left: 30px; }
  .corner-tr { top: 180px; right: 30px; transform: scaleX(-1); }
  .corner-bl { bottom: 175px; left: 30px; transform: scaleY(-1); }
  .corner-br { bottom: 175px; right: 30px; transform: scale(-1); }

  /* ── TEXTO SUPERIOR ── */
  .area-texto {
    position: absolute;
    top: 180px;
    left: 0; right: 0;
    text-align: center;
    z-index: 10;
    padding: 0 60px;
  }

  .divisor {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .divisor-linha {
    width: 60px;
    height: 1px;
    background: #d4af37;
    opacity: 0.7;
  }
  .divisor-icone { color: #d4af37; font-size: 14px; }

  .headline {
    font-size: 28px;
    color: ${paleta.textoHeadline};
    letter-spacing: 6px;
    text-transform: uppercase;
    font-weight: normal;
    margin-bottom: 16px;
  }

  .nome-prato {
    font-size: 120px;
    color: ${paleta.textoTitulo};
    font-weight: bold;
    line-height: 1.0;
    text-transform: uppercase;
    margin-bottom: 20px;
    text-shadow: 2px 4px 12px rgba(0,0,0,0.6);
    letter-spacing: -2px;
  }
  .nome-prato.longo { font-size: 90px; }
  .nome-prato.muito-longo { font-size: 72px; }

  .tagline {
    font-size: 26px;
    color: #d4c5a0;
    font-style: italic;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .ornamento-meio {
    color: #d4af37;
    font-size: 20px;
    opacity: 0.8;
  }

  /* ── BADGE LATERAL ── */
  .badge {
    position: absolute;
    right: 50px;
    top: 850px;
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, #c9a227 0%, #8b6914 100%);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 20;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    border: 2px solid #f0d060;
    text-align: center;
    padding: 20px;
  }
  .badge-texto {
    font-size: 17px;
    color: #2a1a00;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }
  .badge-icon { font-size: 22px; margin-bottom: 6px; }

  /* ── BARRA INFERIOR ── */
  .barra {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 200px;
    background: ${paleta.bgBottom};
    z-index: 15;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .barra-colunas {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
  }

  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .col-icon { font-size: 34px; color: ${paleta.textoBarra}; opacity: 0.9; }

  .col-texto {
    font-size: 18px;
    color: ${paleta.textoBarra};
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    line-height: 1.4;
    font-weight: bold;
  }

  .separador {
    width: 1px;
    height: 80px;
    background: #d4af37;
    opacity: 0.5;
  }

  .barra-footer {
    text-align: center;
    color: #d4af37;
    font-size: 20px;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding-bottom: 12px;
    font-style: italic;
  }

  .barra-topo-linha {
    height: 2px;
    background: linear-gradient(to right, transparent, #d4af37, transparent);
    margin-bottom: 4px;
  }
</style>
</head>
<body>

  <!-- Foto de fundo -->
  ${fotoSrc ? `<div class="foto-fundo"><img src="${fotoSrc}" /></div>` : ''}

  <!-- Logo -->
  <div class="logo">
    <div class="logo-coelho">🐰</div>
    <div class="logo-restaurante">Restaurante</div>
    <div class="logo-nome">Toca do Coelho</div>
  </div>

  <!-- Ornamentos de canto -->
  <div class="corner corner-tl">✦</div>
  <div class="corner corner-tr">✦</div>
  <div class="corner corner-bl">✦</div>
  <div class="corner corner-br">✦</div>

  <!-- Área de texto principal -->
  <div class="area-texto">
    <div class="divisor">
      <div class="divisor-linha"></div>
      <div class="divisor-icone">❧</div>
      <div class="headline">${headline}</div>
      <div class="divisor-icone">❧</div>
      <div class="divisor-linha"></div>
    </div>

    <div class="nome-prato ${prato.length > 14 ? (prato.length > 20 ? 'muito-longo' : 'longo') : ''}">
      ${prato}
    </div>

    <div class="tagline">${tagline}</div>
    <div class="ornamento-meio">— ✦ —</div>
  </div>

  <!-- Badge ingredientes -->
  <div class="badge">
    <div class="badge-icon">🌿</div>
    <div class="badge-texto">Ingredientes\nSelecionados</div>
  </div>

  <!-- Barra inferior -->
  <div class="barra">
    <div class="barra-topo-linha"></div>
    <div class="barra-colunas">
      <div class="col">
        <div class="col-icon">🌿</div>
        <div class="col-texto">Ingredientes<br>de Qualidade</div>
      </div>
      <div class="separador"></div>
      <div class="col">
        <div class="col-icon">👨‍🍳</div>
        <div class="col-texto">Preparado<br>com Carinho</div>
      </div>
      <div class="separador"></div>
      <div class="col">
        <div class="col-icon">❤️</div>
        <div class="col-texto">Sabor que<br>Acolhe</div>
      </div>
    </div>
    <div class="barra-footer">→ Venha Experimentar! ←</div>
  </div>

</body>
</html>`;
}

// ── Rota principal ────────────────────────────────────────────────────────────
app.post('/poster', async (req, res) => {
  const { prato, headline, foto_base64, foto_mime, paleta } = req.body;

  if (!prato) return res.status(400).json({ error: 'prato é obrigatório' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const html = gerarHTML({ prato, headline: headline || 'ESPECIAL NO BUFFET', foto_base64, foto_mime, paleta_nome: paleta || 'burgundo' });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Aguarda imagem carregar
    await page.waitForTimeout(500);

    const png = await page.screenshot({ type: 'png', fullPage: false });

    res.set('Content-Type', 'image/png');
    res.send(png);

    console.log(`[Coelho API] ✅ Poster gerado: ${prato}`);
  } catch (err) {
    console.error('[Coelho API] ❌ Erro:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Coelho Poster API' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Coelho API] Rodando na porta ${PORT}`));

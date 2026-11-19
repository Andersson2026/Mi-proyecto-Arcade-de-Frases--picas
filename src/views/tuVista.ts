import { Frase, Categoria } from '../models/tuEntidad';

export class ArcadeView {
  private container: HTMLElement;

  constructor(rootId: string) {
    const el = document.getElementById(rootId);
    if (!el) throw new Error(`No se encontró el elemento #${rootId}`);
    this.container = el;
  }

  renderEstructuraBase(): void {
    this.container.innerHTML = `
      <div class="arcade-grid">
        <!-- Panel Izquierdo: Formulario y Votación -->
        <section class="panel">
          <h2 class="cyan-title"> INSERT COIN (NUEVA FRASE)</h2>
          <form id="form-frase" class="form-group">
            <input
              type="text"
              id="input-texto"
              placeholder='Ej: "¡Es peligroso ir solo!"'
              maxlength="140"
              required
            />
            <div class="form-row">
              <input
                type="text"
                id="input-autor"
                placeholder="Juego, Película o Meme..."
                maxlength="60"
                required
              />
              <select id="select-categoria">
                <option value="Videojuegos"> Videojuegos</option>
                <option value="Películas"> Películas</option>
                <option value="Memes"> Memes</option>
              </select>
            </div>
            <button type="submit" class="btn-add">+ REGISTRAR FRASE</button>
          </form>

          <h2 class="cyan-title"> ARENA DE VOTACIÓN</h2>
          <div id="lista-frases" class="scroll-list"></div>
        </section>

        <!-- Panel Derecho: Leaderboard Top 10 -->
        <aside class="panel panel-top">
          <h2 class="yellow-title"> TOP 10 HIGH SCORES </h2>
          <div id="lista-top10"></div>
        </aside>
      </div>
    `;
  }

  renderListas(todas: Frase[], top10: Frase[]): void {
    const listaEl = document.getElementById('lista-frases');
    const topEl = document.getElementById('lista-top10');
    const totalVotosEl = document.getElementById('total-votos');
    if (!listaEl || !topEl) return;

    // Actualizar marcador 1UP en el HUD superior
    if (totalVotosEl) {
      const sumaVotos = todas.reduce((acc, f) => acc + f.votos, 0);
      totalVotosEl.textContent = String(sumaVotos).padStart(6, '0');
    }

    // Renderizar lista de votación
    listaEl.innerHTML = todas
      .map(
        (f) => `
        <article class="frase-card">
          <div class="frase-content">
            <p class="frase-texto">"${this.escaparHTML(f.texto)}"</p>
            <div class="frase-meta">
              <span class="badge badge-${this.normalizarClase(f.categoria)}">${f.categoria}</span>
              <span class="autor-nombre">${this.escaparHTML(f.autor)}</span>
            </div>
          </div>
          <div class="frase-actions">
            <button class="btn-vote" data-id="${f.id}" title="Votar por esta frase">
              ▲ +1<br /><span>(${f.votos})</span>
            </button>
            <button class="btn-edit" data-id="${f.id}" aria-label="Editar frase">EDITAR</button>
            <button class="btn-delete" data-id="${f.id}" aria-label="Eliminar frase">ELIMINAR</button>
          </div>
        </article>
      `
      )
      .join('');

    // Renderizar Top 10 High Scores
    topEl.innerHTML = top10
      .map((f, idx) => {
        const medallas = ['1', '2', '3'];
        const rango = medallas[idx] || `#${idx + 1}`;
        const clasePodio = idx < 3 ? `podio-${idx + 1}` : '';

        return `
          <div class="top-item ${clasePodio}">
            <div class="top-info">
              <span class="rank-num">${rango}</span>
              <div>
                <div class="top-texto">"${this.escaparHTML(f.texto)}"</div>
                <small>${this.escaparHTML(f.autor)} • ${f.categoria}</small>
              </div>
            </div>
            <div class="score">${f.votos} PTS</div>
          </div>
        `;
      })
      .join('');
  }

  bindVotar(handler: (id: number) => void): void {
    const listaEl = document.getElementById('lista-frases');
    listaEl?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.btn-vote') as HTMLButtonElement | null;
      if (btn && btn.dataset.id) {
        handler(Number(btn.dataset.id));
      }
    });
  }

  bindEditar(handler: (id: number) => void): void {
    const listaEl = document.getElementById('lista-frases');
    listaEl?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.btn-edit') as HTMLButtonElement | null;
      if (btn?.dataset.id) handler(Number(btn.dataset.id));
    });
  }

  bindEliminar(handler: (id: number) => void): void {
    const listaEl = document.getElementById('lista-frases');
    listaEl?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.btn-delete') as HTMLButtonElement | null;
      if (btn?.dataset.id) handler(Number(btn.dataset.id));
    });
  }

  solicitarEdicion(frase: Frase): { texto: string; autor: string; categoria: Categoria } | null {
    const texto = window.prompt('Editar frase:', frase.texto);
    if (texto === null) return null;

    const autor = window.prompt('Editar juego, película o meme:', frase.autor);
    if (autor === null) return null;

    const categoria = window.prompt(
      'Categoría (Videojuegos, Películas o Memes):',
      frase.categoria
    );
    if (categoria === null) return null;

    const categorias: Categoria[] = ['Videojuegos', 'Películas', 'Memes'];
    const categoriaValida = categorias.find((opcion) => opcion.toLowerCase() === categoria.trim().toLowerCase());
    if (!texto.trim() || !autor.trim() || !categoriaValida) {
      window.alert('Escribe una frase, un autor y una categoría válida.');
      return null;
    }

    return { texto: texto.trim(), autor: autor.trim(), categoria: categoriaValida };
  }

  confirmarEliminacion(frase: Frase): boolean {
    return window.confirm(`¿Eliminar la frase "${frase.texto}"?`);
  }

  bindAgregar(handler: (texto: string, autor: string, categoria: Categoria) => void): void {
    const form = document.getElementById('form-frase') as HTMLFormElement | null;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const textoInput = document.getElementById('input-texto') as HTMLInputElement;
      const autorInput = document.getElementById('input-autor') as HTMLInputElement;
      const catSelect = document.getElementById('select-categoria') as HTMLSelectElement;

      if (textoInput.value.trim() && autorInput.value.trim()) {
        handler(textoInput.value, autorInput.value, catSelect.value as Categoria);
        textoInput.value = '';
        autorInput.value = '';
      }
    });
  }

  private normalizarClase(cat: string): string {
    return cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private escaparHTML(str: string): string {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m));
  }
}

import { FraseModel, Categoria } from '../models/tuEntidad';
import { ArcadeView } from '../views/tuVista';

export class ArcadeController {
  private model: FraseModel;
  private view: ArcadeView;

  constructor(model: FraseModel, view: ArcadeView) {
    this.model = model;
    this.view = view;
  }

  async iniciar(): Promise<void> {
    this.view.renderEstructuraBase();

    // Conectar eventos de la vista con métodos del controlador
    this.view.bindVotar((id) => this.manejarVoto(id));
    this.view.bindAgregar((texto, autor, cat) => this.manejarNuevaFrase(texto, autor, cat));
    this.view.bindEditar((id) => this.manejarEdicion(id));
    this.view.bindEliminar((id) => this.manejarEliminacion(id));

    await this.actualizarPantalla();
  }

  private async manejarVoto(id: number): Promise<void> {
    await this.model.votar(id);
    await this.actualizarPantalla();
  }

  private async manejarNuevaFrase(texto: string, autor: string, categoria: Categoria): Promise<void> {
    await this.model.agregar(texto, autor, categoria);
    await this.actualizarPantalla();
  }

  private async manejarEdicion(id: number): Promise<void> {
    const frase = (await this.model.obtenerTodas()).find((item) => item.id === id);
    if (!frase) return;

    const cambios = this.view.solicitarEdicion(frase);
    if (!cambios) return;

    await this.model.actualizar(id, cambios.texto, cambios.autor, cambios.categoria);
    await this.actualizarPantalla();
  }

  private async manejarEliminacion(id: number): Promise<void> {
    const frase = (await this.model.obtenerTodas()).find((item) => item.id === id);
    if (!frase || !this.view.confirmarEliminacion(frase)) return;

    await this.model.eliminar(id);
    await this.actualizarPantalla();
  }

  private async actualizarPantalla(): Promise<void> {
    const [todas, top10] = await Promise.all([
      this.model.obtenerTodas(),
      this.model.obtenerTop10()
    ]);
    this.view.renderListas(todas, top10);
  }
}

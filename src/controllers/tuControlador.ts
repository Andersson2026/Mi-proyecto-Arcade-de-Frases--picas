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

  private async actualizarPantalla(): Promise<void> {
    const [todas, top10] = await Promise.all([
      this.model.obtenerTodas(),
      this.model.obtenerTop10()
    ]);
    this.view.renderListas(todas, top10);
  }
}
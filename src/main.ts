import { FraseModel } from './models/tuEntidad';
import { ArcadeView } from './views/tuVista';
import { ArcadeController } from './controllers/tuControlador';

async function iniciarAplicacion(): Promise<void> {
  const model = new FraseModel();
  const view = new ArcadeView('app');
  const controller = new ArcadeController(model, view);

  await controller.iniciar();
}

void iniciarAplicacion().catch((error: unknown) => {
  console.error('No se pudo iniciar la aplicación:', error);
  const app = document.getElementById('app');
  if (!app) return;

  const mensaje = document.createElement('p');
  mensaje.setAttribute('role', 'alert');
  mensaje.textContent = `No se pudo cargar el juego: ${
    error instanceof Error ? error.message : String(error)
  }`;
  app.replaceChildren(mensaje);
});
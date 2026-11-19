import { getDatabase, guardarEnStorage } from '../db/database';

export type Categoria = 'Videojuegos' | 'Películas' | 'Memes';

export interface Frase {
  id: number;
  texto: string;
  autor: string;
  categoria: Categoria;
  votos: number;
}

export class FraseModel {
  // Obtener todas las frases ordenadas por las más recientes
  async obtenerTodas(): Promise<Frase[]> {
    const db = await getDatabase();
    const res = db.exec('SELECT id, texto, autor, categoria, votos FROM frases ORDER BY id DESC');
    return this.mapearResultados(res);
  }

  // Obtener el Top 10 de las más votadas
  async obtenerTop10(): Promise<Frase[]> {
    const db = await getDatabase();
    const res = db.exec(
      'SELECT id, texto, autor, categoria, votos FROM frases ORDER BY votos DESC, id ASC LIMIT 10'
    );
    return this.mapearResultados(res);
  }

  // Sumar +1 voto
  async votar(id: number): Promise<void> {
    const db = await getDatabase();
    db.run('UPDATE frases SET votos = votos + 1 WHERE id = ?', [id]);
    guardarEnStorage();
  }

  // Agregar nueva frase
  async agregar(texto: string, autor: string, categoria: Categoria): Promise<void> {
    const db = await getDatabase();
    db.run(
      'INSERT INTO frases (texto, autor, categoria, votos) VALUES (?, ?, ?, 1)',
      [texto.trim(), autor.trim(), categoria]
    );
    guardarEnStorage();
  }

  private mapearResultados(res: any[]): Frase[] {
    if (!res.length) return [];
    const values = res[0].values;
    return values.map((row: any[]) => ({
      id: Number(row[0]),
      texto: String(row[1]),
      autor: String(row[2]),
      categoria: row[3] as Categoria,
      votos: Number(row[4])
    }));
  }
}
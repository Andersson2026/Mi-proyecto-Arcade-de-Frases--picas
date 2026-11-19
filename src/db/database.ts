import initSqlJs, { type Database } from 'sql.js';
// @ts-expect-error Vite processes static ?url imports, but may not be declared in this project.
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const STORAGE_KEY = 'arcade_frases_sqlite_db';
let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: () => wasmUrl
  });

  // Cargar base de datos guardada si existe
  const savedDb = localStorage.getItem(STORAGE_KEY);
  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    dbInstance = new SQL.Database(uint8Array);
  } else {
    dbInstance = new SQL.Database();
  }

  crearTablasEInicializar(dbInstance);
  guardarEnStorage();
  return dbInstance;
}

export function guardarEnStorage(): void {
  if (!dbInstance) return;
  const data = dbInstance.export();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(data)));
}

function crearTablasEInicializar(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS frases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT NOT NULL,
      autor TEXT NOT NULL,
      categoria TEXT NOT NULL,
      votos INTEGER DEFAULT 0
    );
  `);

  const iniciales = [
    ["¡Es peligroso ir solo! Toma esto.", "The Legend of Zelda", "Videojuegos", 15],
    ["Yo soy tu padre.", "Star Wars: El Imperio Contraataca", "Películas", 22],
    ["¡It's over 9000!", "Dragon Ball Z", "Memes", 30],
    ["La guerra. La guerra no cambia nunca.", "Fallout", "Videojuegos", 18],
    ["Hasta la vista, baby.", "Terminator 2", "Películas", 25],
    ["Ah shit, here we go again.", "GTA: San Andreas", "Memes", 28],
    ["¡Get over here!", "Mortal Kombat", "Videojuegos", 19],
    ["Que la Fuerza te acompañe.", "Star Wars", "Películas", 21],
    ["¡F en el chat!", "Call of Duty / Internet", "Memes", 14],
    ["The cake is a lie.", "Portal", "Videojuegos", 17],
    ["¡Wakanda por siempre!", "Black Panther", "Películas", 12]
  ];

  const existentes = new Set(
    db.exec('SELECT texto, autor FROM frases')[0]?.values.map((row) => `${row[0]}\0${row[1]}`) ?? []
  );
  const stmt = db.prepare('INSERT INTO frases (texto, autor, categoria, votos) VALUES (?, ?, ?, ?)');
  for (const frase of iniciales) {
    if (existentes.has(`${frase[0]}\0${frase[1]}`)) continue;
    stmt.run(frase);
  }
  stmt.free();
}
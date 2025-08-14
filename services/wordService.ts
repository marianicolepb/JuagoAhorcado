import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Word } from '@/types/game';

export class WordService {
  private static wordsCollection = collection(db, 'words');

  // Palabras predefinidas para inicializar la base de datos
  private static defaultWords: Omit<Word, 'id'>[] = [
    // Fácil
    { word: 'casa', category: 'objetos', difficulty: 'easy', hint: 'Lugar donde vives' },
    { word: 'perro', category: 'animales', difficulty: 'easy', hint: 'Mejor amigo del hombre' },
    { word: 'agua', category: 'naturaleza', difficulty: 'easy', hint: 'Líquido vital' },
    { word: 'sol', category: 'naturaleza', difficulty: 'easy', hint: 'Estrella que nos da luz' },
    { word: 'mesa', category: 'objetos', difficulty: 'easy', hint: 'Mueble para comer' },
    { word: 'libro', category: 'objetos', difficulty: 'easy', hint: 'Se usa para leer' },
    { word: 'gato', category: 'animales', difficulty: 'easy', hint: 'Mascota que maúlla' },
    { word: 'flor', category: 'naturaleza', difficulty: 'easy', hint: 'Parte colorida de las plantas' },
    
    // Medio
    { word: 'computadora', category: 'tecnologia', difficulty: 'medium', hint: 'Máquina para trabajar y jugar' },
    { word: 'elefante', category: 'animales', difficulty: 'medium', hint: 'Animal grande con trompa' },
    { word: 'montaña', category: 'naturaleza', difficulty: 'medium', hint: 'Elevación natural del terreno' },
    { word: 'hospital', category: 'lugares', difficulty: 'medium', hint: 'Lugar donde curan enfermos' },
    { word: 'guitarra', category: 'musica', difficulty: 'medium', hint: 'Instrumento de cuerdas' },
    { word: 'biblioteca', category: 'lugares', difficulty: 'medium', hint: 'Lugar lleno de libros' },
    { word: 'mariposa', category: 'animales', difficulty: 'medium', hint: 'Insecto con alas coloridas' },
    { word: 'chocolate', category: 'comida', difficulty: 'medium', hint: 'Dulce favorito de muchos' },
    
    // Difícil
    { word: 'refrigerador', category: 'electrodomesticos', difficulty: 'hard', hint: 'Mantiene la comida fría' },
    { word: 'arquitectura', category: 'profesiones', difficulty: 'hard', hint: 'Arte de diseñar edificios' },
    { word: 'democracia', category: 'politica', difficulty: 'hard', hint: 'Sistema de gobierno del pueblo' },
    { word: 'fotosintesis', category: 'ciencia', difficulty: 'hard', hint: 'Proceso de las plantas con luz' },
    { word: 'paleontologia', category: 'ciencia', difficulty: 'hard', hint: 'Estudio de fósiles antiguos' },
    { word: 'psicologia', category: 'ciencia', difficulty: 'hard', hint: 'Estudio de la mente humana' },
    { word: 'extraordinario', category: 'adjetivos', difficulty: 'hard', hint: 'Algo muy especial o raro' },
    { word: 'responsabilidad', category: 'valores', difficulty: 'hard', hint: 'Cumplir con tus deberes' }
  ];

  // Inicializar palabras en la base de datos
  static async initializeWords(): Promise<void> {
    try {
      // Verificar si ya hay palabras
      const existingWords = await getDocs(this.wordsCollection);
      
      if (existingWords.empty) {
        console.log('Inicializando palabras en la base de datos...');
        
        // Agregar todas las palabras predefinidas
        const promises = this.defaultWords.map(word => 
          addDoc(this.wordsCollection, word)
        );
        
        await Promise.all(promises);
        console.log(`${this.defaultWords.length} palabras agregadas a la base de datos`);
      }
    } catch (error) {
      console.error('Error inicializando palabras:', error);
    }
  }

  // Obtener palabra aleatoria por dificultad
  static async getRandomWord(difficulty?: 'easy' | 'medium' | 'hard'): Promise<Word | null> {
    try {
      let q = query(this.wordsCollection);
      
      if (difficulty) {
        q = query(this.wordsCollection, where('difficulty', '==', difficulty));
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const words = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Word[];
      
      // Seleccionar palabra aleatoria
      const randomIndex = Math.floor(Math.random() * words.length);
      return words[randomIndex];
      
    } catch (error) {
      console.error('Error obteniendo palabra:', error);
      return null;
    }
  }

  // Obtener palabras por categoría
  static async getWordsByCategory(category: string): Promise<Word[]> {
    try {
      const q = query(this.wordsCollection, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Word[];
      
    } catch (error) {
      console.error('Error obteniendo palabras por categoría:', error);
      return [];
    }
  }

  // Obtener todas las categorías disponibles
  static async getCategories(): Promise<string[]> {
    try {
      const querySnapshot = await getDocs(this.wordsCollection);
      const categories = new Set<string>();
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        categories.add(data.category);
      });
      
      return Array.from(categories);
      
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }
}
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

  // Base de datos expandida con 45 palabras organizadas por dificultad real
  private static defaultWords: Omit<Word, 'id'>[] = [
    // Fácil (3-5 letras)
    { word: 'casa', category: 'objetos', difficulty: 'easy', hint: 'Construcción donde vive una familia' },
    { word: 'perro', category: 'animales', difficulty: 'easy', hint: 'Animal doméstico fiel y leal al hombre' },
    { word: 'agua', category: 'naturaleza', difficulty: 'easy', hint: 'Líquido transparente esencial para la vida' },
    { word: 'sol', category: 'naturaleza', difficulty: 'easy', hint: 'Estrella que ilumina y calienta la Tierra' },
    { word: 'mesa', category: 'objetos', difficulty: 'easy', hint: 'Mueble plano con patas para comer o trabajar' },
    { word: 'libro', category: 'objetos', difficulty: 'easy', hint: 'Conjunto de páginas con texto para leer' },
    { word: 'gato', category: 'animales', difficulty: 'easy', hint: 'Felino doméstico que maúlla y ronronea' },
    { word: 'flor', category: 'naturaleza', difficulty: 'easy', hint: 'Parte colorida y aromática de las plantas' },
    { word: 'pan', category: 'comida', difficulty: 'easy', hint: 'Alimento básico hecho con harina y agua' },
    { word: 'mar', category: 'naturaleza', difficulty: 'easy', hint: 'Gran extensión de agua salada' },
    { word: 'ojo', category: 'cuerpo', difficulty: 'easy', hint: 'Órgano de la vista en los seres vivos' },
    { word: 'pie', category: 'cuerpo', difficulty: 'easy', hint: 'Extremidad inferior para caminar' },
    { word: 'luz', category: 'naturaleza', difficulty: 'easy', hint: 'Energía que permite ver las cosas' },
    { word: 'niño', category: 'personas', difficulty: 'easy', hint: 'Persona de corta edad' },
    { word: 'amor', category: 'emociones', difficulty: 'easy', hint: 'Sentimiento profundo de cariño' },
    
    // Medio (6-8 letras)
    { word: 'elefante', category: 'animales', difficulty: 'medium', hint: 'Mamífero gigante con trompa larga y orejas grandes' },
    { word: 'montaña', category: 'naturaleza', difficulty: 'medium', hint: 'Elevación natural muy alta del terreno' },
    { word: 'hospital', category: 'lugares', difficulty: 'medium', hint: 'Edificio donde atienden a los enfermos' },
    { word: 'guitarra', category: 'objetos', difficulty: 'medium', hint: 'Instrumento musical de seis cuerdas' },
    { word: 'mariposa', category: 'animales', difficulty: 'medium', hint: 'Insecto volador con alas coloridas y delicadas' },
    { word: 'chocolate', category: 'comida', difficulty: 'medium', hint: 'Dulce hecho con cacao, muy popular' },
    { word: 'ventana', category: 'objetos', difficulty: 'medium', hint: 'Abertura en la pared para ver afuera' },
    { word: 'escuela', category: 'lugares', difficulty: 'medium', hint: 'Lugar donde los niños van a aprender' },
    { word: 'corazón', category: 'cuerpo', difficulty: 'medium', hint: 'Órgano que bombea sangre por el cuerpo' },
    { word: 'planeta', category: 'naturaleza', difficulty: 'medium', hint: 'Cuerpo celeste que orbita una estrella' },
    { word: 'familia', category: 'personas', difficulty: 'medium', hint: 'Grupo de personas unidas por parentesco' },
    { word: 'jardín', category: 'lugares', difficulty: 'medium', hint: 'Espacio con plantas y flores cultivadas' },
    { word: 'teléfono', category: 'objetos', difficulty: 'medium', hint: 'Aparato para comunicarse a distancia' },
    { word: 'película', category: 'entretenimiento', difficulty: 'medium', hint: 'Historia filmada para ver en cine' },
    { word: 'español', category: 'idiomas', difficulty: 'medium', hint: 'Idioma que se habla en España y América' },
    
    // Difícil (9+ letras)
    { word: 'refrigerador', category: 'objetos', difficulty: 'hard', hint: 'Electrodoméstico que mantiene los alimentos fríos' },
    { word: 'arquitectura', category: 'profesiones', difficulty: 'hard', hint: 'Arte y ciencia de diseñar y construir edificios' },
    { word: 'democracia', category: 'política', difficulty: 'hard', hint: 'Sistema de gobierno donde el pueblo elige' },
    { word: 'fotosíntesis', category: 'ciencia', difficulty: 'hard', hint: 'Proceso donde las plantas producen alimento con luz' },
    { word: 'paleontología', category: 'ciencia', difficulty: 'hard', hint: 'Ciencia que estudia fósiles de seres antiguos' },
    { word: 'psicología', category: 'ciencia', difficulty: 'hard', hint: 'Ciencia que estudia la mente y comportamiento' },
    { word: 'extraordinario', category: 'adjetivos', difficulty: 'hard', hint: 'Algo que sale de lo común, muy especial' },
    { word: 'responsabilidad', category: 'valores', difficulty: 'hard', hint: 'Obligación de responder por los propios actos' },
    { word: 'computadora', category: 'objetos', difficulty: 'hard', hint: 'Máquina electrónica para procesar información' },
    { word: 'biblioteca', category: 'lugares', difficulty: 'hard', hint: 'Lugar donde se guardan y consultan libros' },
    { word: 'universidad', category: 'lugares', difficulty: 'hard', hint: 'Institución de educación superior' },
    { word: 'investigación', category: 'ciencia', difficulty: 'hard', hint: 'Proceso de búsqueda de conocimiento nuevo' },
    { word: 'comunicación', category: 'conceptos', difficulty: 'hard', hint: 'Intercambio de información entre personas' },
    { word: 'transformación', category: 'conceptos', difficulty: 'hard', hint: 'Cambio completo de forma o naturaleza' },
    { word: 'biodiversidad', category: 'naturaleza', difficulty: 'hard', hint: 'Variedad de vida en el planeta Tierra' },
    { word: 'programación', category: 'profesiones', difficulty: 'hard', hint: 'Arte de crear instrucciones para computadoras' },
    { word: 'matemáticas', category: 'ciencia', difficulty: 'hard', hint: 'Ciencia que estudia números, formas y patrones' }
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
  static async getRandomWord(difficulty?: 'easy' | 'medium' | 'hard', category?: string): Promise<Word | null> {
    try {
      const conditions = [];
      
      if (difficulty) {
        conditions.push(where('difficulty', '==', difficulty));
      }
      
      if (category && category !== 'todas') {
        conditions.push(where('category', '==', category));
      }
      
      const q = conditions.length > 0 
        ? query(this.wordsCollection, ...conditions)
        : query(this.wordsCollection);
      
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
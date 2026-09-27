import type { CategoriaId, Faq } from './categorias';

export interface Dato { valor: string; etiqueta: string }
export interface Spec { clave: string; valor: string }
export interface Bloque { titulo: string; texto: string }
export interface Modelo { nombre: string; detalle: string }

/** Iconos disponibles para "Para quién es" (símbolos del sprite: i-uso-*) */
export type IconoUso =
  | 'consulta' | 'domicilio' | 'campo' | 'deporte' | 'dolor' | 'ecoguiado' | 'msk' | 'urgencias'
  | 'mujer' | 'cardio' | 'vascular' | 'rehab' | 'estetica' | 'movilidad' | 'radiologia' | 'cabina';

export interface Producto {
  slug: string;
  nombre: string;
  marca: string;
  categoria: CategoriaId;
  /** Otras categorías en las que también aparece (página de categoría y filtro) */
  tambienEn?: CategoriaId[];
  /** Tipo de equipo en minúsculas, para alt, títulos y textos: "ecógrafo portátil" */
  tipo: string;
  /** Solo ecografía: formato para el selector de la página pilar */
  formato?: 'inalambrico' | 'portatil' | 'carro';
  destacado: boolean;
  orden: number;
  /** Una línea */
  resumen: string;
  /** Complemento de "Ideal para..." */
  idealPara: string;
  descripcion: string;
  /** 2 a 4, con valor y etiqueta */
  datosClave: Dato[];
  caracteristicas: Bloque[];
  especificaciones: Spec[];
  /** Aplicaciones o indicaciones que recoge el catálogo del fabricante */
  usos: string[];
  /** 3 usos con icono para "Para quién es" */
  paraQuien: { icono: IconoUso; texto: string }[];
  incluye: string[];
  normativa: string;
  modelos?: Modelo[];
  /** Nombres de archivo sin extensión en src/assets/productos (o "fotos/..." en src/assets/fotos) */
  imagenes: string[];
  /** Página del PDF del catálogo ADC | VytalGroup 2026 donde aparece */
  paginaCatalogo?: number;
  /** Fuente de los datos si no es el catálogo: "la web oficial de EDAN (edan.com)" */
  fuente?: string;
  /** Códigos CRM del catálogo */
  codigos: string[];
  relacionados: string[];
  /** Tiene ficha propia */
  ficha: boolean;
  /** Preguntas propias del equipo; la ficha las completa con las comunes (garantía, precio y envío) */
  faqs?: Faq[];
  /** Nota del catálogo que acompaña al equipo */
  nota?: string;
  seoTitle?: string;
  seoDescription?: string;
}

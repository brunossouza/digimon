export interface DigimonList {
  content: Digomon[];
  pageable: Pageable;
}

export interface Digomon {
  id: number;
  name: string;
  href: string;
  image: string;
}

export interface Pageable {
  currentPage: number;
  elementsOnPage: number;
  totalElements: number;
  totalPages: number;
  previousPage: string;
  nextPage: string;
}

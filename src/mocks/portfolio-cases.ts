import type { PortfolioCase } from '@/types/entities';

// Demo records and placeholder images; replace with published portfolio data.
export const portfolioCases: PortfolioCase[] = [
  {
    id: 'mock-portfolio-1',
    petName: 'Milo',
    species: 'dog',
    breedRu: 'Той-пудель',
    breedSr: 'Toj pudla',
    descriptionRu: 'Пример ухода за кудрявой шерстью: купание, сушка и аккуратная стрижка.',
    descriptionSr: 'Primer nege kovrdžave dlake: kupanje, sušenje i uredno šišanje.',
    imageAfterUrl: '/images/portfolio-placeholder.svg',
    isPublished: true,
    sortOrder: 1,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'mock-portfolio-2',
    petName: 'Luna',
    species: 'cat',
    breedRu: 'Мейн-кун',
    breedSr: 'Mejn kun',
    descriptionRu: 'Пример ухода за длинной шерстью: бережное вычёсывание и удаление отмершего подшёрстка.',
    descriptionSr: 'Primer nege duge dlake: nežno četkanje i uklanjanje odumrle poddlake.',
    imageAfterUrl: '/images/portfolio-placeholder.svg',
    isPublished: true,
    sortOrder: 2,
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'mock-portfolio-3',
    petName: 'Bobi',
    species: 'dog',
    breedRu: 'Шпиц',
    breedSr: 'Špic',
    descriptionRu: 'Пример комплексного ухода: купание, вычёсывание и оформление силуэта.',
    descriptionSr: 'Primer kompletne nege: kupanje, četkanje i oblikovanje siluete.',
    imageAfterUrl: '/images/portfolio-placeholder.svg',
    isPublished: true,
    sortOrder: 3,
    createdAt: '2026-09-03T10:00:00Z',
  },
];

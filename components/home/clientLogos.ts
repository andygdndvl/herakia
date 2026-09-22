// Les trois clients que le site peut justifier — source unique, partagée par le
// bandeau `TrustedBy` et la bande de preuve du hero (`HeroProof`). `scale`
// rattrape les marges internes très différentes des fichiers fournis : chaque
// logo est posé dans une boîte `object-contain`, puis remis à l'échelle à l'œil
// pour que les trois pèsent optiquement pareil.
export const clientLogos = [
  { name: 'IPSSI', src: '/logos/ipssi.png', width: 592, height: 158, scale: 0.85 },
  { name: 'Jean Louis David', src: '/logos/jean-louis-david.png', width: 1913, height: 228, scale: 1.15 },
  { name: 'Privilux Riviera', src: '/logos/privilux-riviera.png', width: 788, height: 567, scale: 1 },
] as const;

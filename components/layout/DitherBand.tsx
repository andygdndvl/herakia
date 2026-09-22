type DitherBandProps = {
  /** Couleur d'arrivée : `light` entre dans un îlot ivoire, `dark` en sort. */
  to: 'light' | 'dark';
};

/**
 * Jointure tramée entre le thème sombre et un îlot ivoire.
 *
 * Toute la trame vit dans `.dither-band` (`app/globals.css`) : un seul endroit
 * de vérité, un seul jeu de rangées, la sortie d'îlot n'étant que la même
 * trame retournée. Le composant ne fait que poser la bande dans le flux, entre
 * deux sections.
 *
 * Purement décoratif : aucun contenu, `aria-hidden`, rien d'animé, aucune
 * dépendance au défilement ni au JS — le mouvement réduit n'y change rien.
 */
export function DitherBand({ to }: DitherBandProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`dither-band${to === 'dark' ? ' dither-band--to-dark' : ''}`}
    />
  );
}

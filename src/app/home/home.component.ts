import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // État des versions
  versions = [
    { number: '5.5', active: false, title : "Clair de lune en rêve", selected: false},
    { number: '5.6', active: false, title : "Jour du retour des flammes", selected: false},
    { number: '5.7', active: false, title : "L'espace-temps qui est vôtre", selected: false},
    { number: '5.8', active: true, title : "Été de plomb à la station", selected: true},
    { number: '6.0', active: false, title: "Ballet parmi marées enneigées et bosquets givrés", selected: false}
  ];

  // Versions visibles dans le carrousel (toujours 3)
  visibleVersions: any[] = [];

  // Index de la version actuellement sélectionnée
  selectedIndex: number = 0;

  // Propriétés pour l'animation du titre
  activeVersionTitle: string = '';
  titleAnimating: boolean = false;

  // ... autres propriétés existantes

  ngOnInit(): void {
    // Initialiser la position du carrousel
    this.initializeCarousel();
    this.updateActiveVersionTitle();
  }

  /**
   * Initialise le carrousel avec la version active au centre
   */
  private initializeCarousel(): void {
    // Trouver l'index de la version sélectionnée
    this.selectedIndex = this.versions.findIndex(v => v.selected);
    if (this.selectedIndex === -1) {
      this.selectedIndex = this.versions.findIndex(v => v.active);
    }
    
    // Mettre à jour les versions visibles
    this.updateVisibleVersions();
  }

  /**
   * Met à jour les 3 versions visibles avec la version sélectionnée au centre
   */
  private updateVisibleVersions(): void {
    const totalVersions = this.versions.length;
    this.visibleVersions = [];

    // Calculer les indices pour avoir 3 versions centrées sur la sélectionnée
    for (let i = -1; i <= 1; i++) {
      let index = this.selectedIndex + i;
      
      // Gestion circulaire (optionnel, supprimez si vous ne voulez pas)
      if (index < 0) {
        index = totalVersions + index;
      } else if (index >= totalVersions) {
        index = index - totalVersions;
      }
      
      // Si pas de gestion circulaire, utilisez ceci à la place :
      // if (index >= 0 && index < totalVersions) {
      //   this.visibleVersions.push({ ...this.versions[index], position: i });
      // }
      
      if (index >= 0 && index < totalVersions) {
        this.visibleVersions.push({ 
          ...this.versions[index], 
          position: i,  // -1 (gauche), 0 (centre), 1 (droite)
          isCenter: i === 0
        });
      }
    }
  }

  /**
   * Met à jour le titre de la version active
   */
  private updateActiveVersionTitle(): void {
    const activeVersion = this.versions.find(v => v.active);
    this.activeVersionTitle = activeVersion ? activeVersion.title : '';
  }

  /**
   * Sélectionne une version et met à jour le carrousel
   */
  selectVersion(selectedVersion: string): void {
    // Trouver l'index de la version cliquée
    const clickedIndex = this.versions.findIndex(v => v.number === selectedVersion);
    if (clickedIndex === -1) return;

    // Déterminer le nouvel index sélectionné basé sur la position cliquée
    const clickedVersionInVisible = this.visibleVersions.find(v => v.number === selectedVersion);
    if (!clickedVersionInVisible) return;

    const newSelectedIndex = this.selectedIndex + clickedVersionInVisible.position;
    
    // Vérifier les limites
    if (newSelectedIndex >= 0 && newSelectedIndex < this.versions.length) {
      this.selectedIndex = newSelectedIndex;
    }

    // Mettre à jour les états
    this.versions.forEach((version, index) => {
      version.selected = index === this.selectedIndex;
      if (version.selected) {
        version.active = true;
      }
    });

    // Commencer l'animation du titre si la version active a changé
    if (this.versions[this.selectedIndex].active) {
      this.animateTitle();
    }

    // Mettre à jour les versions visibles
    this.updateVisibleVersions();

    // Animation du numéro de version sélectionné
    this.animateSelectedVersion(selectedVersion);
  }

  /**
   * Anime le changement de titre
   */
  private animateTitle(): void {
    this.titleAnimating = true;
    
    setTimeout(() => {
      this.updateActiveVersionTitle();
      this.titleAnimating = false;
    }, 150);
  }

  /**
   * Anime la version sélectionnée
   */
  private animateSelectedVersion(selectedVersion: string): void {
    const versionElements = this.elementRef.nativeElement.querySelectorAll('.version-number');
    versionElements.forEach((element: HTMLElement) => {
      if (element.textContent?.trim() === selectedVersion) {
        this.renderer.setStyle(element, 'animation', 'pulse 0.5s ease');
        setTimeout(() => {
          this.renderer.removeStyle(element, 'animation');
        }, 500);
      }
    });
  }

  // Données statistiques (exemple)
  stats = [
    { number: 42, label: 'Personnages' },
    { number: 156, label: 'Armes' },
    { number: 7, label: 'Événements actifs' }
  ];

  // Actions rapides
  quickActions = [
    { icon: '📊', label: 'Mes stats' },
    { icon: '⭐', label: 'Wishlist' },
    { icon: '📅', label: 'Planning' },
    { icon: '🎯', label: 'Objectifs' }
  ];

  private particles: HTMLElement[] = [];
  private animationFrame: number = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    // Créer les particules après que la vue soit initialisée
    this.createBackgroundParticles();
    
    // Animation séquentielle des éléments
    this.animateElements();
  }

  ngOnDestroy(): void {
    // Nettoyer les animations
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.cleanupParticles();
  }

  /**
   * Crée le système de particules d'arrière-plan
   */
  private createBackgroundParticles(): void {
    const container = this.elementRef.nativeElement;
    const particleCount = 20;

    // Créer le container de particules
    const particlesContainer = this.renderer.createElement('div');
    this.renderer.addClass(particlesContainer, 'background-particles');
    this.renderer.setStyle(particlesContainer, 'position', 'fixed');
    this.renderer.setStyle(particlesContainer, 'top', '0');
    this.renderer.setStyle(particlesContainer, 'left', '0');
    this.renderer.setStyle(particlesContainer, 'width', '100%');
    this.renderer.setStyle(particlesContainer, 'height', '100%');
    this.renderer.setStyle(particlesContainer, 'pointer-events', 'none');
    this.renderer.setStyle(particlesContainer, 'z-index', '-1');

    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
      const particle = this.renderer.createElement('div');
      this.renderer.addClass(particle, 'particle');
      
      // Styles de base
      this.renderer.setStyle(particle, 'position', 'absolute');
      this.renderer.setStyle(particle, 'width', '2px');
      this.renderer.setStyle(particle, 'height', '2px');
      this.renderer.setStyle(particle, 'background', 'rgba(255, 215, 0, 0.3)');
      this.renderer.setStyle(particle, 'border-radius', '50%');
      
      // Position aléatoire
      this.renderer.setStyle(particle, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(particle, 'top', `${Math.random() * 100}%`);
      
      // Animation
      const animationDelay = Math.random() * 3;
      const animationDuration = 2 + Math.random() * 3;
      this.renderer.setStyle(particle, 'animation', `twinkle ${animationDuration}s ease-in-out infinite ${animationDelay}s`);
      
      this.renderer.appendChild(particlesContainer, particle);
      this.particles.push(particle);
    }

    this.renderer.appendChild(container, particlesContainer);
  }

  /**
   * Animation séquentielle des éléments au chargement
   */
  private animateElements(): void {
    const blackDivs = this.elementRef.nativeElement.querySelectorAll('.black_div');
    blackDivs.forEach((element: HTMLElement, index: number) => {
      this.renderer.setStyle(element, 'animation-delay', `${index * 0.2}s`);
    });
  }

  /**
   * Nettoie les particules
   */
  private cleanupParticles(): void {
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        this.renderer.removeChild(particle.parentNode, particle);
      }
    });
    this.particles = [];
  }

  /**
   * Gestion des actions rapides
   */
  onQuickAction(action: string): void {
    console.log(`Action sélectionnée: ${action}`);
    // Ici vous pouvez ajouter la logique de navigation ou d'action
    // Par exemple:
    // this.router.navigate(['/stats']) pour "Mes stats"
  }

  /**
   * Animation au clic sur les cartes statistiques
   */
  onStatCardClick(stat: any): void {
    console.log(`Statistique cliquée: ${stat.label}`);
    // Navigation vers la section détaillée
  }

  /**
   * Effet de parallaxe au scroll (optionnel)
   * Vous pouvez l'appeler avec un @HostListener('window:scroll')
   */
  onScroll(): void {
    const scrolled = window.pageYOffset;
    this.particles.forEach(particle => {
      const speed = 0.5;
      this.renderer.setStyle(particle, 'transform', `translateY(${scrolled * speed}px)`);
    });
  }
}
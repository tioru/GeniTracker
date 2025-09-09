import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

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

  // Index de la version actuellement sélectionnée
  selectedIndex: number = 0;

  // Propriétés pour l'animation du titre
  activeVersionTitle: string = '';
  titleAnimating: boolean = false;

  async ngOnInit() {
    // Initialiser la position du carrousel
    this.initializeCarousel();
    this.updateActiveVersionTitle();

    await document.fonts.ready;

    setTimeout(() => {
      this.titleAnimating = true;
    }, 200);
  }

  public navigateTo(route: string): void {
    // Logique de navigation ici, par exemple en utilisant le Router d'Angular
    this.router.navigateByUrl(route)
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
  }

  /**
   * Met à jour le titre de la version active
   */
  private updateActiveVersionTitle(): void {
    const activeVersion = this.versions.find(v => v.active);
    this.activeVersionTitle = activeVersion ? activeVersion.title : '';
  }

  private particles: HTMLElement[] = [];
  private animationFrame: number = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    // Nettoyer les animations
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.cleanupParticles();
  }

  private createBackgroundParticles(): void {
    const particlesContainer = this.elementRef.nativeElement.querySelector('.background-particles');
    if (!particlesContainer) return;
    
    const particleCount = 10;
    const delayBetweenParticles = 600;

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        this.createSingleParticle(particlesContainer, i);
      }, delayBetweenParticles);
    }
  }

  private createSingleParticle(container: HTMLElement, index: number): void {
    const particleSize = 2 + Math.random() * (5 - 2);

    const particle = this.renderer.createElement('div');
    this.renderer.addClass(particle, 'particle');

    this.renderer.setStyle(particle, 'width', `${particleSize}px`);
    this.renderer.setStyle(particle, 'height', `${particleSize}px`);

    // Position de départ : en bas de la page avec position horizontale aléatoire
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;

    this.renderer.setStyle(particle, 'left', `${startX}%`);
    this.renderer.setStyle(particle, 'top', `${startY}vh`);

    // Variations aléatoires pour chaque particule
    const animationDuration = 2 + Math.random() * 3; // 2 - 5 secondes
    this.renderer.setStyle(particle, 'animation-duration', `${animationDuration}s`);

    this.renderer.appendChild(container, particle);
    this.particles.push(particle);

    // Programmer la suppression et recréation après l'animation
    setTimeout(() => {
      this.removeAndRecreateParticle(container, particle, index);
    }, animationDuration * 1000);
  }

  private removeAndRecreateParticle(container: HTMLElement, particle: HTMLElement, particleIndex: number): void {
    this.removeParticle(particle);

    const recreateDelay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      this.createSingleParticle(container, particleIndex);
    }, recreateDelay);
  }

  private removeParticle(particle: HTMLElement): void {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
      if (particle.parentNode) {
        this.renderer.removeChild(particle.parentNode, particle);
      }
    }
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

  private container: HTMLElement | null = null;
  private innerContainer: HTMLElement | null = null;

  private pressed = false;
  private startX = 0;
  private x = 0;

  ngAfterViewInit(): void {

    this.setupCurrentVersion();

    // Créer les particules après que la vue soit initialisée
    this.createBackgroundParticles();

    // Initialiser les containers pour le drag
    this.container = document.querySelector(".container");
    this.innerContainer = document.querySelector(".versions-container");

    if (this.container && this.innerContainer) {
      this.container.addEventListener("mousedown", (e: MouseEvent) => {
        this.pressed = true;
        this.startX = e.offsetX - this.innerContainer!.offsetLeft;
        this.container!.style.cursor = "grabbing";
      });

      this.container.addEventListener("mouseenter", () => {
        this.container!.style.cursor = "grab";
      });

      this.container.addEventListener("mouseup", () => {
        this.container!.style.cursor = "grab";
        this.pressed = false;
        this.centerVersionAfterMouseReleases();
      });

      this.container.addEventListener("mousemove", (e: MouseEvent) => {
        if (!this.pressed) return;
        e.preventDefault();

        this.x = e.offsetX;
        this.innerContainer!.style.left = `${this.x - this.startX}px`;
      });
    }
  }

  private centerVersionAfterMouseReleases(): void {
    this.innerContainer = document.querySelector(".versions-container");
    if (!this.innerContainer) return;

    const versionElements = this.innerContainer.querySelectorAll('.version-number');

    console.log(versionElements);
  }

  private setupCurrentVersion(): void {
    this.selectedIndex = this.versions.findIndex(v => v.selected);

    // Si aucune version n'est sélectionnée, sélectionner la première version
    if (this.selectedIndex === -1) {
      
    }
  }
}
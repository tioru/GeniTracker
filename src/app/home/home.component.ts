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
  
  public versions = [
    { number: '5.0', active: false, title : "Fleurs radieuses lors d'un périple sous le soleil brûlant", selected: false},
    { number: '5.1', active: false, title : "L'arc-en-ciel voué à brûler", selected: false},
    { number: '5.2', active: false, title : "Broderie d'esprit et de flamme", selected: false},
    { number: '5.3', active: false, title : "Ode à la résurrection incandescente", selected: false},
    { number: '5.4', active: false, title : "Clair de lune en rêve", selected: false},
    { number: '5.5', active: false, title : "Jour du retour des flammes", selected: false},
    { number: '5.6', active: false, title : "Paralogisme", selected: false},
    { number: '5.7', active: false, title : "L'espace-temps qui est vôtre", selected: false},
    { number: '5.8', active: false, title : "Été de plomb à la station", selected: false},
    { number: '6.0', active: true, title: "Ballet parmi marées enneigées et bosquets givrés", selected: true}
  ];

  // Index de la version actuellement sélectionnée
  selectedIndex: number = 0;

  // Propriétés pour l'animation du titre
  activeVersionTitle: string = '';
  titleAnimating: boolean = false;

  private container: HTMLElement | null = null;
  private innerContainer: HTMLElement | null = null;

  private pressed = false;
  private startX = 0;
  private x = 0;

  private particles: HTMLElement[] = [];
  private animationFrame: number = 0;

  private itemWidth = 0;
  private itemSpacing = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.titleAnimating = true;
    }, 200);
  }

  public navigateTo(route: string): void {
    this.router.navigateByUrl(route)
  }

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

    const startX = Math.random() * 100;
    const startY = Math.random() * 100;

    this.renderer.setStyle(particle, 'left', `${startX}%`);
    this.renderer.setStyle(particle, 'top', `${startY}vh`);

    const animationDuration = 2 + Math.random() * 3; // 2 - 5 secondes
    this.renderer.setStyle(particle, 'animation-duration', `${animationDuration}s`);

    this.renderer.appendChild(container, particle);
    this.particles.push(particle);

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

  private cleanupParticles(): void {
    this.particles.forEach(particle => {
      if (particle.parentNode) {
        this.renderer.removeChild(particle.parentNode, particle);
      }
    });
    this.particles = [];
  }

  ngAfterViewInit(): void {

    this.createBackgroundParticles();

    this.container = document.querySelector(".container");
    this.innerContainer = document.querySelector(".versions-container");

    this.calculateDimensions();

    this.initializePosition();
    
    // Listener for mouse up event to stop dragging
    document.addEventListener("mouseup", () => {
      this.pressed = false;
      //this.snapToNearest();
    });

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
        //this.snapToNearest();
      });

      this.container.addEventListener("mousemove", (e: MouseEvent) => {
        if (!this.pressed) return;
        e.preventDefault();

        this.x = e.offsetX;
        this.innerContainer!.style.left = `${this.x - this.startX}px`;

        this.checkBoundary();
      });
    }
  }

  private checkBoundary() {
    if (!this.container || !this.innerContainer) return;

    var computedStyle = getComputedStyle(this.container);
    const currentLeft = parseInt(this.innerContainer.style.left) || 0;
    const containerWidth = this.container.offsetWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
    const containerCenter = containerWidth / 2;
    const itemTotalWidth = this.itemWidth + this.itemSpacing;  

    // Limite droite : premier élément centré (index 0)
    const rightLimit = containerCenter + 6;

    // Limite gauche : dernier élément centré (index max)
    const lastIndex = this.versions.length - 1;

    const leftLimit = containerCenter - (lastIndex * itemTotalWidth) - (this.itemWidth / 2);

    // Appliquer les limites
    if (currentLeft > rightLimit) {
      this.innerContainer.style.left = `${rightLimit}px`;
    }

    if (currentLeft < leftLimit) {
      this.innerContainer.style.left = `${leftLimit}px`;
    }
  }

private calculateDimensions(): void {
  if (!this.innerContainer) return;
  
  // Sélecteur pour vos éléments de version - À ADAPTER selon votre HTML
  const versionElements = this.innerContainer.querySelectorAll('.version-number'); // Changez le sélecteur !

  if (versionElements.length >= 2) {
    const firstElement = versionElements[0] as HTMLElement;
    const secondElement = versionElements[1] as HTMLElement;
    
    // Calculer la largeur d'un élément
    this.itemWidth = firstElement.offsetWidth;
    
    // Calculer l'espacement entre deux éléments
    const firstRect = firstElement.getBoundingClientRect();
    const secondRect = secondElement.getBoundingClientRect();
    this.itemSpacing = secondRect.left - firstRect.right;
    
    console.log(`Dimensions calculées: largeur=${this.itemWidth}px, espacement=${this.itemSpacing}px`);
  } else {
    console.warn('Pas assez d\'éléments trouvés pour calculer les dimensions');
  }
}

/**
 * Initialise la position du carrousel sur l'élément sélectionné
 */
private initializePosition(): void {
  if (!this.container || !this.innerContainer) return;
  
  const containerCenter = this.container.offsetWidth / 2;
  const selectedIndex = this.versions.findIndex(v => v.selected || v.active);
  const targetPosition = containerCenter - (selectedIndex * (this.itemWidth + this.itemSpacing)) - (this.itemWidth / 2);
  
  this.innerContainer.style.left = `${targetPosition}px`;
}

/*private snapToNearest(): void {
  if (!this.container || !this.innerContainer) return;
  
  const containerCenter = this.container.offsetWidth / 2;
  const currentLeft = parseInt(this.innerContainer.style.left) || 0;
  const itemTotalWidth = this.itemWidth + this.itemSpacing;
  
  // Calculer l'index le plus proche
  const nearestIndex = Math.round((containerCenter - currentLeft - (this.itemWidth / 2)) / itemTotalWidth);
  const clampedIndex = Math.max(0, Math.min(this.versions.length - 1, nearestIndex));
  
  // Position cible
  const targetPosition = containerCenter - (clampedIndex * itemTotalWidth) - (this.itemWidth / 2);
  
  // Animation simple
  this.animateToPosition(targetPosition);
}

private animateToPosition(targetPosition: number): void {
  if (!this.innerContainer) return;
  
  const startPosition = parseInt(this.innerContainer.style.left) || 0;
  const distance = targetPosition - startPosition;
  const duration = 300;
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress * (2 - progress); // Simple easing
    
    this.innerContainer!.style.left = `${startPosition + (distance * eased)}px`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
  }*/
}
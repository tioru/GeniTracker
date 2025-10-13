import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { animations } from '../animation';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: animations
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
    { number: 'Luna I', active: true, title: "Ballet parmi marées enneigées et bosquets givrés", selected: true},
    { number: 'Luna II', active: false, title: "Élégie sous la lune évanescente", selected: false}
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

  private leftBoundary = 0;
  private rightBoundary = 0;

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
    window.addEventListener('resize', () => {
      this.calculateDimensions();
      this.checkBoundary();
    });

    this.createBackgroundParticles();

    this.container = document.querySelector(".container");
    this.innerContainer = document.querySelector(".innerContainer");

    this.calculateDimensions();

    this.initializePosition();
    
    document.addEventListener("mouseup", () => {
      this.pressed = false;
      this.snapToNearest();
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
    if (!this.innerContainer) return;

    const currentLeft = parseInt(this.innerContainer.style.left) || 0;

    if (currentLeft > this.leftBoundary) {
      this.innerContainer.style.left = `${this.leftBoundary}px`;
    }

    if (currentLeft < this.rightBoundary) {
      this.innerContainer.style.left = `${this.rightBoundary}px`;
    }
  }

  private calculateDimensions(): void {
    if (!this.innerContainer) return;

    const versionElements = this.innerContainer.querySelectorAll('.version-number');

    const firstElement = versionElements[0] as HTMLElement;
    const secondElement = versionElements[1] as HTMLElement;

    this.itemWidth = firstElement.offsetWidth;

    const firstRect = firstElement.getBoundingClientRect();
    const secondRect = secondElement.getBoundingClientRect();

    this.itemSpacing = secondRect.left - firstRect.right;

    this.leftBoundary = (this.container!.offsetWidth / 2) - (this.itemWidth / 2);
    this.rightBoundary = this.leftBoundary - this.innerContainer.offsetWidth + this.itemWidth;    
  }

  private initializePosition(): void {
    if (!this.innerContainer) return;

    this.selectedIndex = this.versions.findIndex(v => v.selected);

    if (this.selectedIndex === -1) this.selectedIndex = 0;

    const targetPosition = this.leftBoundary - (this.itemWidth * this.selectedIndex) - (this.itemSpacing * this.selectedIndex);

    this.innerContainer.style.left = `${targetPosition}px`;

    this.updateActiveVersionTitle();
  }

  private updateActiveVersionTitle(): void {
    const titleContainer = document.querySelectorAll(".active_version_title_container");

    const titleElement = titleContainer[0] as HTMLElement;

    if (!titleElement) return;

    this.selectedIndex = this.versions.findIndex(v => v.selected);

    if (this.selectedIndex === -1) this.selectedIndex = 0;

    titleElement!.style.transform = 'translateY(20px)';
    titleElement!.style.opacity = '0';

    setTimeout(() => {
      this.activeVersionTitle = this.versions[this.selectedIndex].title;
      titleElement!.style.transform = 'translateY(0)';
      titleElement!.style.opacity = '1';
    }, 400);
  }

  private snapToNearest(): void {
    if (!this.innerContainer) return;

    const currentLeft = parseInt(this.innerContainer.style.left) || 0;

    this.versions.forEach(v => v.selected = false);
    
    for (let i = 0; i < this.versions.length; i++) {
      let firstElement = this.leftBoundary - (this.itemWidth * i) - (this.itemSpacing * i);
      
      let secondElement = this.leftBoundary - (this.itemWidth * (i + 1)) - (this.itemSpacing * (i + 1));

      if (currentLeft < firstElement && currentLeft > secondElement) {
        let offsetfirstElement = firstElement - currentLeft

        let offsetsecondElement = secondElement - currentLeft

        if(offsetfirstElement < offsetsecondElement * -1) {
          this.innerContainer.style.left = `${firstElement}px`;
          this.versions[i].selected = true;
          if (this.activeVersionTitle !== this.versions[i].title) {
            this.updateActiveVersionTitle();
            this.innerContainer!.style.transition = 'all 0.4s ease';
            setTimeout(() => {
              this.innerContainer!.style.transition = '';
            }, 500);
          }
        }
        else {
          this.innerContainer.style.left = `${secondElement}px`;
          this.versions[i+1].selected = true;
          if (this.activeVersionTitle !== this.versions[i+1].title) {
            this.updateActiveVersionTitle();
            this.innerContainer!.style.transition = 'all 0.4s ease';
            setTimeout(() => {
              this.innerContainer!.style.transition = '';
            }, 500);
          }
        }
      } else {
        this.innerContainer!.style.transition = 'all 0.4s ease';
        setTimeout(() => {
          this.innerContainer!.style.transition = '';
        }, 500);
      }
    }
  }
}
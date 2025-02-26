import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  // Datos generales
  title = 'Te Amo Mi Amor';
  partnerName: string = 'Mi Ranita';
  startDate: Date = new Date('2024-05-21'); // Fecha de inicio: 21 de mayo de 2024
  
  // Medidor de amor
  loveLevel: number = 0;
  maxWidth: number = 0;
  animationInterval: any;
  isInfinite: boolean = true;
  
  // Aniversario
  relationshipDays: number = 0;
  relationshipMonths: number = 0;
  nextAnniversaryDate: Date = new Date();
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  
  // Hitos
  milestones: { days: number, text: string }[] = [
    { days: 1, text: 'primer día juntos' },
    { days: 7, text: 'una semana de amor' },
    { days: 30, text: 'un mes enamorados' },
    { days: 100, text: '100 días de felicidad' },
    { days: 180, text: '6 meses construyendo recuerdos' },
    { days: 365, text: 'un año de amor incondicional' }
  ];
  reachedMilestones: { days: number, text: string }[] = [];
  nextMilestone: { days: number, text: string } | null = null;
  
  
  // Próximos aniversarios importantes
  upcomingAnniversaries: { date: Date, description: string }[] = [];
  
  // Razones
  reasons: string[] = [
    'Tu sonrisa ilumina hasta mi día más oscuro',
    'Tu forma única de ver el mundo me inspira cada día',
    'Cuando estoy contigo me siento completo y en paz',
    'Eres mi mejor amiga, mi confidente y mi compañera de vida',
    'Me haces querer ser mejor persona cada día',
    'Tu valentía y fortaleza me dejan sin palabras',
    'El sonido de tu risa es mi melodía favorita',
    'Tu corazón generoso hace del mundo un lugar mejor',
    'Porque junto a ti, hasta lo ordinario se vuelve extraordinario'
  ];
  
  // Canción
  song = {
    title: 'La que me gusta',
    artist: 'Los Amigos Invisibles',
    spotifyId: '1TdaQqgKRbiFdO15q1kv6e', 
    cover: 'https://i.scdn.co/image/ab67616d0000b273a26e7b5997e5ed5acdc9c1a7'
  };
  
  // Frases románticas aleatorias
  romanticPhrases: string[] = [
    "Cada día te amo más que ayer y menos que mañana",
    "Contigo, el amor no es un destino, es un viaje que disfruto cada día",
    "Mi corazón late con tu nombre en cada latido",
    "Cuando te miro, veo mi futuro reflejado en tus ojos",
    "Eres el sueño que nunca supe que tenía",
    "Tu amor me ha enseñado a creer en lo imposible",
    "A tu lado, las estrellas brillan más intensamente",
    "Enamorarme de ti fue como descubrir colores que nunca había visto",
    "Cada momento a tu lado es un tesoro que guardo en mi corazón",
    "El universo conspiró para unirnos, y yo le agradezco por ello cada día"
  ];
  currentPhrase: string = '';
  
  // Tablero de dibujo
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  flowerTypes = ['rose', 'tulip', 'daisy', 'sunflower', 'heart', 'doubleHeart', 'heartBouquet', 'colorfulFlower'];
  context: CanvasRenderingContext2D | null = null;
  
  // Variables para soporte PWA
  isOnline: boolean = navigator.onLine;
  deferredPrompt: any;
  showInstallButton: boolean = false;
  
  constructor(private swUpdate: SwUpdate) {
    // Detectar si la app puede ser instalada
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir que Chrome muestre automáticamente el prompt
      e.preventDefault();
      // Guardar el evento para poder usarlo después
      this.deferredPrompt = e;
      // Mostrar el botón de instalación
      this.showInstallButton = true;
    });
  }

  ngOnInit(): void {
    // Asignar una frase aleatoria inicial
    this.changeRandomPhrase();
    
    // Calcular días y meses de relación
    this.calculateRelationshipTime();
    
    // Calcular fecha del próximo aniversario mensual
    this.calculateNextAnniversary();
    
    // Actualizar el contador cada segundo
    interval(1000)
      .pipe(
        map(() => {
          this.calculateTimeRemaining();
        })
      )
      .subscribe();
    
    // Calcular hitos alcanzados y próximo hito
    this.calculateMilestones();
    
    // Calcular próximos aniversarios importantes
    this.calculateUpcomingAnniversaries();
    
    // Cambiar la frase romántica cada 10 segundos
    interval(10000)
      .subscribe(() => {
        this.changeRandomPhrase();
      });
      
    // Añadir detectores de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Configurar actualizaciones del Service Worker
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          if (confirm('Hay una nueva versión disponible. ¿Quieres actualizar?')) {
            window.location.reload();
          }
        });
    }
  }
  
  ngAfterViewInit(): void {
    // Iniciar medidor de amor
    setTimeout(() => {
      this.startLoveMeter();
    }, 500);
    
    // Inicializar canvas para dibujo
    this.initCanvas();
    
    // Dibujar una flor aleatoria al inicio para que no esté vacío
    setTimeout(() => {
      this.drawRandomFlower();
    }, 1000);
  }
  
  // Método para obtener frase aleatoria
  changeRandomPhrase(): void {
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * this.romanticPhrases.length);
    } while (this.romanticPhrases[newIndex] === this.currentPhrase && this.romanticPhrases.length > 1);
    
    this.currentPhrase = this.romanticPhrases[newIndex];
  }
  
  // Método seguro para calcular días al próximo hito
  getDaysToNextMilestone(): number {
    if (this.nextMilestone && this.nextMilestone.days) {
      return this.nextMilestone.days - this.relationshipDays;
    }
    return 0;
  }
  
  // Calcular tiempo de relación
  calculateRelationshipTime(): void {
    const today = new Date();
    const startDate = new Date(this.startDate);
    
    // Calcular días
    const timeDiff = Math.abs(today.getTime() - startDate.getTime());
    this.relationshipDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Calcular meses
    let months = (today.getFullYear() - startDate.getFullYear()) * 12;
    months += today.getMonth() - startDate.getMonth();
    
    // Ajustar para día del mes
    if (today.getDate() < startDate.getDate()) {
      months--;
    }
    
    this.relationshipMonths = Math.max(0, months); // Asegurar que no sea negativo
  }
  
  // Calcular próximo aniversario mensual (día 20 de cada mes)
  calculateNextAnniversary(): void {
    const today = new Date();
    
    // Crear fecha para el día 20 del mes actual
    let nextAniv = new Date(today.getFullYear(), today.getMonth(), 20);
    
    // Si ya pasó el día 20 de este mes, ir al próximo mes
    if (today.getDate() > 20) {
      nextAniv.setMonth(nextAniv.getMonth() + 1);
    }
    
    this.nextAnniversaryDate = nextAniv;
  }
  
  // Calcular aniversarios importantes
  calculateUpcomingAnniversaries(): void {
    const startDate = new Date(this.startDate);
    this.upcomingAnniversaries = [];
    
    // Añadir aniversarios de 6 meses, 1 año y otros aniversarios importantes
    // 6 meses
    const sixMonths = new Date(startDate);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    this.upcomingAnniversaries.push({
      date: sixMonths,
      description: '6 meses juntos'
    });
    
    // 1 año
    const oneYear = new Date(startDate);
    oneYear.setFullYear(oneYear.getFullYear() + 1); // 20 de mayo de 2025
    this.upcomingAnniversaries.push({
      date: oneYear,
      description: 'Nuestro primer aniversario'
    });
    
    // Filtrar solo los aniversarios futuros y ordenarlos
    const today = new Date();
    this.upcomingAnniversaries = this.upcomingAnniversaries
      .filter(anniv => anniv.date > today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  calculateTimeRemaining(): void {
    const now = new Date().getTime();
    const targetDate = this.nextAnniversaryDate.getTime();
    
    const timeRemaining = targetDate - now;
    
    if (timeRemaining > 0) {
      this.days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    } else {
      // Recalcular el próximo aniversario si ya pasó
      this.calculateNextAnniversary();
    }
  }

  calculateMilestones(): void {
    // Separar hitos alcanzados y próximo hito
    this.reachedMilestones = this.milestones.filter(milestone => milestone.days <= this.relationshipDays)
                                 .sort((a, b) => b.days - a.days);
    
    const upcomingMilestones = this.milestones.filter(milestone => milestone.days > this.relationshipDays)
                                  .sort((a, b) => a.days - b.days);
    
    this.nextMilestone = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;
  }
  
  // Formatear fecha en español
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }
  
  // Métodos de medidor de amor
  startLoveMeter(): void {
    const meter = document.querySelector('.love-meter-fill') as HTMLElement;
    const container = document.querySelector('.love-meter-container') as HTMLElement;
    
    if (meter && container) {
      this.maxWidth = container.offsetWidth;
      
      let width = 0;
      let direction = 1;
      
      this.animationInterval = setInterval(() => {
        if (this.isInfinite) {
          // Para el modo infinito, hacer un bucle de ida y vuelta
          if (width >= this.maxWidth) {
            // Cambiar dirección y añadir más capacidad al medidor
            direction = -1;
            this.maxWidth += 50; // Incrementar el máximo
            container.style.width = `${this.maxWidth}px`;
          } else if (width <= 0) {
            direction = 1;
          }
          
          width += direction * 2;
          this.loveLevel = Math.floor((width / this.maxWidth) * 100);
          meter.style.width = `${width}px`;
        } else {
          // Modo normal: crecer hasta el 100%
          if (width < this.maxWidth) {
            width += 2;
            this.loveLevel = Math.floor((width / this.maxWidth) * 100);
            meter.style.width = `${width}px`;
          } else {
            clearInterval(this.animationInterval);
          }
        }
      }, 20);
    }
  }

  toggleInfinite(): void {
    this.isInfinite = !this.isInfinite;
    clearInterval(this.animationInterval);
    this.startLoveMeter();
  }
  
  // Métodos de dibujo de flores
  initCanvas(): void {
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.context = canvas.getContext('2d');
      
      // Ajustar tamaño del canvas
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }
  
  resizeCanvas(): void {
    if (this.canvasRef && this.context) {
      const canvas = this.canvasRef.nativeElement;
      const container = canvas.parentElement as HTMLElement;
      
      canvas.width = container.clientWidth;
      canvas.height = 300; // Altura fija o ajustar según necesidad
      
      // Limpiar canvas
      this.context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  drawRandomFlower(): void {
    if (!this.context || !this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Elegir tipo de flor aleatoria
    const flowerType = this.flowerTypes[Math.floor(Math.random() * this.flowerTypes.length)];
    
    // Posición aleatoria en el canvas (con margen para que no quede cortada)
    const maxX = canvas.width - 100;
    const maxY = canvas.height - 100;
    const x = Math.random() * (maxX - 100) + 100;
    const y = Math.random() * (maxY - 100) + 50;
    
    // Dibujar según el tipo de flor
    switch (flowerType) {
      case 'rose':
        this.drawRose(x, y);
        break;
      case 'tulip':
        this.drawTulip(x, y);
        break;
      case 'daisy':
        this.drawDaisy(x, y);
        break;
      case 'sunflower':
        this.drawSunflower(x, y);
        break;
      case 'heart':
        this.drawHeart(x, y);
        break;
      case 'doubleHeart':
        this.drawDoubleHeart(x, y);
        break;
      case 'heartBouquet':
        this.drawHeartBouquet(x, y);
        break;
      case 'colorfulFlower':
        this.drawColorfulFlower(x, y);
        break;
    }
  }
  
  drawRose(x: number, y: number): void {
    if (!this.context) return;
    
    // Tallo
    this.context.beginPath();
    this.context.moveTo(x, y);
    this.context.lineTo(x, y + 120);
    this.context.lineWidth = 5;
    this.context.strokeStyle = '#2E8B57';
    this.context.stroke();
    
    // Hoja
    this.context.beginPath();
    this.context.ellipse(x + 15, y + 80, 15, 7, Math.PI / 4, 0, 2 * Math.PI);
    this.context.fillStyle = '#3CB371';
    this.context.fill();
    
    // Flor (pétalos concéntricos)
    const colors = ['#FF6B6B', '#FF5252', '#FF4141'];
    for (let i = 0; i < colors.length; i++) {
      const size = 30 - i * 6;
      this.context.beginPath();
      this.context.arc(x, y, size, 0, 2 * Math.PI);
      this.context.fillStyle = colors[i];
      this.context.fill();
    }
  }
  
  drawTulip(x: number, y: number): void {
    if (!this.context) return;
    
    // Tallo
    this.context.beginPath();
    this.context.moveTo(x, y + 50);
    this.context.lineTo(x, y + 130);
    this.context.lineWidth = 5;
    this.context.strokeStyle = '#2E8B57';
    this.context.stroke();
    
    // Hoja
    this.context.beginPath();
    this.context.ellipse(x + 15, y + 80, 20, 8, Math.PI / 5, 0, 2 * Math.PI);
    this.context.fillStyle = '#3CB371';
    this.context.fill();
    
    // Flor (forma de tulipán)
    this.context.beginPath();
    this.context.moveTo(x - 20, y + 50);
    this.context.bezierCurveTo(x - 20, y, x + 20, y, x + 20, y + 50);
    this.context.bezierCurveTo(x + 20, y + 70, x - 20, y + 70, x - 20, y + 50);
    this.context.fillStyle = '#FF69B4';
    this.context.fill();
  }
  
  drawDaisy(x: number, y: number): void {
    if (!this.context) return;
    
    // Tallo
    this.context.beginPath();
    this.context.moveTo(x, y);
    this.context.lineTo(x, y + 120);
    this.context.lineWidth = 4;
    this.context.strokeStyle = '#2E8B57';
    this.context.stroke();
    
    // Pétalos
    const petalCount = 12;
    const petalLength = 25;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 2 * Math.PI) / petalCount;
      const x1 = x + petalLength * Math.cos(angle);
      const y1 = y + petalLength * Math.sin(angle);
      
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.lineTo(x1, y1);
      this.context.lineWidth = 8;
      this.context.strokeStyle = 'white';
      this.context.lineCap = 'round';
      this.context.stroke();
    }
    
    // Centro
    this.context.beginPath();
    this.context.arc(x, y, 10, 0, 2 * Math.PI);
    this.context.fillStyle = '#FFD700';
    this.context.fill();
  }
  
  drawSunflower(x: number, y: number): void {
    if (!this.context) return;
    
    // Tallo
    this.context.beginPath();
    this.context.moveTo(x, y + 40);
    this.context.lineTo(x, y + 150);
    this.context.lineWidth = 7;
    this.context.strokeStyle = '#2E8B57';
    this.context.stroke();
    
    // Hojas
    this.context.beginPath();
    this.context.ellipse(x + 20, y + 90, 20, 10, Math.PI / 5, 0, 2 * Math.PI);
    this.context.fillStyle = '#3CB371';
    this.context.fill();
    
    this.context.beginPath();
    this.context.ellipse(x - 20, y + 110, 20, 10, -Math.PI / 5, 0, 2 * Math.PI);
    this.context.fillStyle = '#3CB371';
    this.context.fill();
    
    // Pétalos
    const petalCount = 16;
    const innerRadius = 15;
    const outerRadius = 40;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 2 * Math.PI) / petalCount;
      const startX = x + innerRadius * Math.cos(angle);
      const startY = y + innerRadius * Math.sin(angle);
      const endX = x + outerRadius * Math.cos(angle);
      const endY = y + outerRadius * Math.sin(angle);
      
      this.context.beginPath();
      this.context.moveTo(startX, startY);
      this.context.lineTo(endX, endY);
      this.context.lineWidth = 15;
      this.context.strokeStyle = '#FFD700';
      this.context.lineCap = 'round';
      this.context.stroke();
    }
    
    // Centro
    this.context.beginPath();
    this.context.arc(x, y, 20, 0, 2 * Math.PI);
    this.context.fillStyle = '#8B4513';
    this.context.fill();
  }
  
  // Dibujar un corazón
  drawHeart(x: number, y: number): void {
    if (!this.context) return;
    
    const size = 40;
    
    this.context.beginPath();
    this.context.moveTo(x, y + size * 0.3);
    this.context.bezierCurveTo(
      x, y, 
      x - size, y, 
      x - size, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x - size, y + size * 0.6, 
      x, y + size, 
      x, y + size
    );
    this.context.bezierCurveTo(
      x, y + size, 
      x + size, y + size * 0.6, 
      x + size, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x + size, y, 
      x, y, 
      x, y + size * 0.3
    );
    
    // Gradiente para el corazón
    const gradient = this.context.createLinearGradient(
      x - size, y, 
      x + size, y + size
    );
    gradient.addColorStop(0, '#ff6b8b');
    gradient.addColorStop(0.5, '#ff1493');
    gradient.addColorStop(1, '#ff0066');
    
    this.context.fillStyle = gradient;
    this.context.fill();
    
    // Añadir un brillo al corazón
    this.context.beginPath();
    this.context.arc(x - size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.context.fill();
  }
  
  // Dibujar corazones dobles (tú y yo)
  drawDoubleHeart(x: number, y: number): void {
    if (!this.context) return;
    
    const size = 30;
    
    // Primer corazón (izquierda)
    this.context.beginPath();
    this.context.moveTo(x - size, y + size * 0.3);
    this.context.bezierCurveTo(
      x - size, y, 
      x - size - size, y, 
      x - size - size, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x - size - size, y + size * 0.6, 
      x - size, y + size, 
      x - size, y + size
    );
    this.context.bezierCurveTo(
      x - size, y + size, 
      x, y + size * 0.6, 
      x, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x, y, 
      x - size, y, 
      x - size, y + size * 0.3
    );
    
    // Gradiente para el primer corazón
    const gradient1 = this.context.createLinearGradient(
      x - size - size, y, 
      x, y + size
    );
    gradient1.addColorStop(0, '#5d8aa8'); // Azul para "él"
    gradient1.addColorStop(0.5, '#4169e1');
    gradient1.addColorStop(1, '#0047ab');
    
    this.context.fillStyle = gradient1;
    this.context.fill();
    
    // Segundo corazón (derecha)
    this.context.beginPath();
    this.context.moveTo(x + size, y + size * 0.3);
    this.context.bezierCurveTo(
      x + size, y, 
      x, y, 
      x, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x, y + size * 0.6, 
      x + size, y + size, 
      x + size, y + size
    );
    this.context.bezierCurveTo(
      x + size, y + size, 
      x + size + size, y + size * 0.6, 
      x + size + size, y + size * 0.3
    );
    this.context.bezierCurveTo(
      x + size + size, y, 
      x + size, y, 
      x + size, y + size * 0.3
    );
    
    // Gradiente para el segundo corazón
    const gradient2 = this.context.createLinearGradient(
      x, y, 
      x + size + size, y + size
    );
    gradient2.addColorStop(0, '#ff6b8b'); // Rosa para "ella"
    gradient2.addColorStop(0.5, '#ff1493');
    gradient2.addColorStop(1, '#ff0066');
    
    this.context.fillStyle = gradient2;
    this.context.fill();
    
    // Añadir brillos
    this.context.beginPath();
    this.context.arc(x - size - size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.context.fill();
    
    this.context.beginPath();
    this.context.arc(x + size + size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.context.fill();
    
    // Texto pequeño de "Tú y Yo"
    this.context.font = '14px Arial';
    this.context.fillStyle = 'black';
    this.context.textAlign = 'center';
    this.context.fillText('Tú y Yo', x, y + size * 1.5);
  }
  
  // Método para dibujar un ramo de corazones
  drawHeartBouquet(x: number, y: number): void {
    if (!this.context) return;
    
    // Dibujar tallo
    this.context.beginPath();
    this.context.moveTo(x, y + 50);
    this.context.lineTo(x, y + 150);
    this.context.lineWidth = 6;
    this.context.strokeStyle = '#2E8B57';
    this.context.stroke();
    
// Dibujar hojas
this.context.beginPath();
this.context.ellipse(x + 15, y + 100, 20, 10, Math.PI / 6, 0, 2 * Math.PI);
this.context.fillStyle = '#3CB371';
this.context.fill();

this.context.beginPath();
this.context.ellipse(x - 15, y + 120, 18, 8, -Math.PI / 6, 0, 2 * Math.PI);
this.context.fillStyle = '#3CB371';
this.context.fill();

// Dibujar varios corazones pequeños como un ramo
const heartPositions = [
  { dx: 0, dy: 0, size: 20, color: ['#ff4d6d', '#ff758f'] },
  { dx: -25, dy: 20, size: 15, color: ['#ff7096', '#ff1493'] },
  { dx: 20, dy: 10, size: 18, color: ['#d62976', '#fa7e1e'] },
  { dx: -15, dy: -15, size: 14, color: ['#ff6b8b', '#ff0066'] },
  { dx: 25, dy: -5, size: 16, color: ['#ff85a1', '#ff0a54'] }
];

// Dibujar cada corazón
for (const heart of heartPositions) {
  this.drawHeartWithColor(x + heart.dx, y + heart.dy, heart.size, heart.color);
}

// Añadir un lazo
this.drawBow(x, y + 60);
}

// Método auxiliar para dibujar un corazón con color personalizado
drawHeartWithColor(x: number, y: number, size: number, colorStops: string[]): void {
if (!this.context) return;

this.context.beginPath();
this.context.moveTo(x, y + size * 0.3);
this.context.bezierCurveTo(
  x, y, 
  x - size, y, 
  x - size, y + size * 0.3
);
this.context.bezierCurveTo(
  x - size, y + size * 0.6, 
  x, y + size, 
  x, y + size
);
this.context.bezierCurveTo(
  x, y + size, 
  x + size, y + size * 0.6, 
  x + size, y + size * 0.3
);
this.context.bezierCurveTo(
  x + size, y, 
  x, y, 
  x, y + size * 0.3
);

// Gradiente para el corazón
const gradient = this.context.createLinearGradient(
  x - size, y, 
  x + size, y + size
);
gradient.addColorStop(0, colorStops[0]);
gradient.addColorStop(1, colorStops[1]);

this.context.fillStyle = gradient;
this.context.fill();

// Añadir un brillo al corazón
this.context.beginPath();
this.context.arc(x - size * 0.3, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
this.context.fillStyle = 'rgba(255, 255, 255, 0.8)';
this.context.fill();
}

// Método para dibujar un lazo
drawBow(x: number, y: number): void {
if (!this.context) return;

// Lazo - centro
this.context.beginPath();
this.context.arc(x, y, 5, 0, Math.PI * 2);
this.context.fillStyle = '#ff1493';
this.context.fill();

// Lazo - lado izquierdo
this.context.beginPath();
this.context.ellipse(x - 10, y, 10, 15, Math.PI / 4, 0, Math.PI * 2);
this.context.fillStyle = '#ff1493';
this.context.fill();

// Lazo - lado derecho
this.context.beginPath();
this.context.ellipse(x + 10, y, 10, 15, -Math.PI / 4, 0, Math.PI * 2);
this.context.fillStyle = '#ff1493';
this.context.fill();

// Lazo - cintas
this.context.beginPath();
this.context.moveTo(x - 5, y + 5);
this.context.quadraticCurveTo(x - 10, y + 15, x - 20, y + 20);
this.context.lineWidth = 3;
this.context.strokeStyle = '#ff1493';
this.context.stroke();

this.context.beginPath();
this.context.moveTo(x + 5, y + 5);
this.context.quadraticCurveTo(x + 10, y + 15, x + 20, y + 20);
this.context.lineWidth = 3;
this.context.strokeStyle = '#ff1493';
this.context.stroke();
}

// Dibujar una flor colorida
drawColorfulFlower(x: number, y: number): void {
if (!this.context) return;

// Tallo
this.context.beginPath();
this.context.moveTo(x, y + 30);
this.context.lineTo(x, y + 140);
this.context.lineWidth = 6;
this.context.strokeStyle = '#2E8B57';
this.context.stroke();

// Hojas
this.context.beginPath();
this.context.ellipse(x + 20, y + 90, 20, 10, Math.PI / 5, 0, 2 * Math.PI);
this.context.fillStyle = '#3CB371';
this.context.fill();

this.context.beginPath();
this.context.ellipse(x - 15, y + 70, 18, 8, -Math.PI / 4, 0, 2 * Math.PI);
this.context.fillStyle = '#3CB371';
this.context.fill();

// Pétalos coloridos
const petalCount = 8;
const petalLength = 30;
const colors = [
  '#FF9AA2', // Rosa suave
  '#FFB7B2', // Coral
  '#FFDAC1', // Melocotón
  '#E2F0CB', // Verde menta
  '#B5EAD7', // Menta
  '#C7CEEA', // Lavanda
  '#9ADCFF', // Azul claro
  '#FFC6FF'  // Rosa
];

for (let i = 0; i < petalCount; i++) {
  const angle = (i * 2 * Math.PI) / petalCount;
  const x1 = x + petalLength * Math.cos(angle);
  const y1 = y + petalLength * Math.sin(angle);
  
  // Dibujar pétalo
  this.context.beginPath();
  this.context.moveTo(x, y);
  
  // Crear un pétalo con curvas
  const cp1x = x + (petalLength * 0.7) * Math.cos(angle - 0.2);
  const cp1y = y + (petalLength * 0.7) * Math.sin(angle - 0.2);
  const cp2x = x + (petalLength * 0.7) * Math.cos(angle + 0.2);
  const cp2y = y + (petalLength * 0.7) * Math.sin(angle + 0.2);
  
  this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x1, y1);
  this.context.bezierCurveTo(cp2x, cp2y, cp1x, cp1y, x, y);
  
  // Colorear pétalo
  this.context.fillStyle = colors[i % colors.length];
  this.context.fill();
  
  // Borde del pétalo
  this.context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  this.context.lineWidth = 1;
  this.context.stroke();
}

// Centro de la flor
const centerGradient = this.context.createRadialGradient(x, y, 0, x, y, 12);
centerGradient.addColorStop(0, '#FFEB3B'); // Amarillo
centerGradient.addColorStop(1, '#FFC107'); // Ámbar

this.context.beginPath();
this.context.arc(x, y, 12, 0, 2 * Math.PI);
this.context.fillStyle = centerGradient;
this.context.fill();

// Detalles del centro
for (let i = 0; i < 12; i++) {
  const angle = (i * 2 * Math.PI) / 12;
  const dotX = x + 6 * Math.cos(angle);
  const dotY = y + 6 * Math.sin(angle);
  
  this.context.beginPath();
  this.context.arc(dotX, dotY, 1.5, 0, 2 * Math.PI);
  this.context.fillStyle = '#8B4513'; // Marrón
  this.context.fill();
}
}

// Manejar errores de carga de imágenes
handleImageError(event: any): void {
const imgElement = event.target;
imgElement.src = 'assets/images/placeholder-image.jpg'; // Imagen de respaldo
}

// Método para instalar la PWA
installApp(): void {
if (!this.deferredPrompt) return;

this.showInstallButton = false;
this.deferredPrompt.prompt();

this.deferredPrompt.userChoice.then((choiceResult: any) => {
  if (choiceResult.outcome === 'accepted') {
    console.log('Usuario aceptó instalar la app');
  } else {
    console.log('Usuario rechazó instalar la app');
  }
  this.deferredPrompt = null;
});
}
}
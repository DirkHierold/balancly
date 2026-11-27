# Browser-Spiel Präferenzen

Diese Datei dokumentiert Dirk's Präferenzen für Browser-Spiele, um konsistente UX/UI bei zukünftigen Projekten sicherzustellen.

## UI/UX Design Principles

### Theme System
- **Stil**: shadcn/ui inspiriert (clean, modern, minimalistisch)
- **Light/Dark Mode**: Immer implementieren mit CSS Custom Properties
- **Farbschema**:
  - Light: Weiß (#ffffff) / Schwarz (#000000)
  - Dark: Fast-Schwarz (#09090b) / Weiß (#fafafa)
  - Keine grellen, ablenkenden Hintergrundfarben
- **Transition**: 0.3s smooth zwischen Themes

### Layout & Structure
- **Header**:
  - Titel links, Theme Toggle rechts
  - Border-bottom mit theme-aware Farbe
  - Margin-bottom für Abstand zum Spielbereich
- **Typography**: System Fonts bevorzugen
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Icons**: Inline SVG, Lucide-React Stil
- **Emojis**: NICHT verwenden außer explizit gewünscht

### Score Display
- **Position**: Bottom center, fixed
- **Style**:
  - Backdrop-filter blur(8px) für Lesbarkeit
  - Semi-transparent background (rgba mit 0.8 alpha)
  - Theme-aware Farben
- **z-index Layering**:
  - Während Gameplay: **HINTER** Spielelementen (z-index: 1)
  - Bei Game Over: **VOR** Spielelementen (z-index: 10)
- **Implementation**: HTML Overlay (nicht auf Canvas gezeichnet)

### Visual Hierarchy (z-index)
Strikte Hierarchie einhalten:
```
Ebene 0: Container Background
Ebene 1: Scores (während Gameplay)
Ebene 2: Canvas / Game Area
Ebene 3: UI Controls (Buttons)
Ebene 10+: Modal Content (Game Over, etc.)
```

**WICHTIG**: Scores müssen direktes Child vom Game Container sein, NICHT vom UI Container!

## Gameplay Balance

### Physics & Movement
- **Bounce Dämpfung**:
  - Restitution coefficient: 0.8 (80%)
  - Ball verliert 20% Geschwindigkeit bei Wandkontakt
  - Keine 100% elastischen Stöße
- **Rotation**:
  - Realistische 3D-Ball-Rotation basierend auf Bewegungsrichtung
  - Rotation dots nur auf beweglichen Objekten
  - Statische Objekte (Targets) ohne Rotation-Indicators

### Object Sizing
- **Präferenz**: Eher kleinere Objekte für mehr Manövrierraum
- **Beispiel Balancly**: Radius 18 statt 25 (28% kleiner)
- **Grund**: Mehr Platz zum Ausweichen, faireres Gameplay

### Speed Balancing
- **Player**:
  - Maximum Speed: 400 px/s
  - Acceleration-based movement (gradual)
- **Enemies**:
  - LANGSAMER als Player-Maximum
  - Range: 30-80 px/s (Balancly Beispiel)
  - Player muss Chance haben auszuweichen
- **Regel**: Enemies dürfen NICHT schneller sein als erreichbare Player-Geschwindigkeit

### Visual Design
- **Faces/Expressions**: Keine Gesichter auf Spielobjekten
- **Movement Indicators**:
  - Rotation dots auf beweglichen Objekten (Player, Enemies)
  - Plain Appearance auf statischen Objekten (Targets)
- **Color Coding**: Eindeutig und konsistent
  - Player: Eine Farbe
  - Enemies: Andere Farbe
  - Targets: Kann mit Player übereinstimmen

## Mobile Optimization (Kritisch!)

### iOS Permissions
**REIHENFOLGE IST ENTSCHEIDEND:**
1. **Device Orientation ZUERST** anfordern
2. **Wake Lock DANACH** anfordern (non-blocking, kein await)

```javascript
// ✅ CORRECT:
await orientationController.requestPermission();
this.requestWakeLock(); // No await

// ❌ WRONG:
await this.requestWakeLock(); // Blockiert nachfolgende Permission!
await orientationController.requestPermission();
```

**Grund**: iOS Safari erlaubt nur EINE Permission-Anfrage pro User Interaction. Wake Lock "verbraucht" den Click Event.

### Wake Lock
- **Ziel**: Bildschirm bleibt an während Gameplay
- **Implementation**:
  - Anfordern beim Spielstart (Play Button)
  - Re-acquire bei visibility change
  - Non-blocking Request (kein await beim Start)

### Touch Handling
```css
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}
```

### Viewport
```html
<meta name="viewport"
      content="width=device-width, initial-scale=1.0,
               user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### Orientation Lock
```javascript
// Landscape bevorzugen für Spiele
if ('orientation' in screen && 'lock' in screen.orientation) {
  await screen.orientation.lock('landscape');
}
```

## Technical Architecture

### Canvas Background
**NICHT auf Canvas zeichnen!**
- Canvas mit `ctx.clearRect()` transparent halten
- Background via CSS auf Container-Element
- **Vorteil**: Theme-switching ohne Canvas-Neuzeichnung

```javascript
// ✅ CORRECT:
ctx.clearRect(0, 0, width, height);

// ❌ WRONG:
ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, width, height);
```

```css
/* Container trägt Background */
#app {
  background-color: var(--canvas-bg);
}
```

### DOM Structure für z-index
```html
<div id="app">
  <canvas id="gameCanvas"></canvas>     <!-- z-index: 2 -->
  <div id="scoreContainer"></div>       <!-- z-index: 1 -->
  <div id="ui">                          <!-- z-index: 3 -->
    <button id="playButton"></button>
    <button id="newGameButton"></button>
  </div>
</div>
```

**KRITISCH**: scoreContainer NICHT in #ui verschachteln! Sonst kann z-index nicht unter Canvas sein.

### Score Rendering
**Präferenz**: HTML Overlay (NICHT Canvas Text)

**Vorteile**:
- CSS Styling & Theming
- Accessibility
- Einfacher zu warten
- Backdrop-filter blur möglich

**Nachteile**:
- z-index Management notwendig (aber lösbar)

### Code Quality Standards
- TypeScript strict mode
- **KEINE `any` types** (siehe globale CLAUDE.md)
- Clean, eleganter Code
- State-of-the-art Patterns
- Kommentare nur wo nötig (selbsterklärender Code bevorzugt)

## Best Practices Summary

### Do's ✅
- Light/Dark Theme System mit CSS Variables
- Clean, minimalistisches Design (shadcn/ui Stil)
- Scores in HTML mit Backdrop-blur
- Canvas transparent, Background in CSS
- Kleinere Objekte für besseres Gameplay
- Enemies langsamer als Player
- Bounce Dämpfung (restitution < 1.0)
- Wake Lock für Mobile
- Orientation Permission ZUERST anfordern
- z-index Hierarchie beachten

### Don'ts ❌
- Keine Emojis (außer explizit gewünscht)
- Keine grellen Hintergrundfarben
- Keine Gesichter auf Spielobjekten
- Kein Canvas Background Drawing (CSS nutzen!)
- Keine Scores in #ui Container
- Keine zu schnellen Enemies
- Keine 100% elastischen Bounces
- Nicht Wake Lock vor Orientation anfordern
- Keine `any` types

## Referenz-Implementierung
Siehe Balancly Projekt für vollständiges Beispiel aller Konzepte.

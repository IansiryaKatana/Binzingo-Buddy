# Binzingo Cardy UI/UX Guidelines

## 🎯 Design System Overview

This document outlines the approved UI/UX guidelines for Binzingo Cardy, ensuring consistency across all pages and components.

## 📱 Mobile-First Design Principles

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Mobile Responsiveness Standards
- **Font Sizes**: 12px-16px for titles to body text on mobile
- **Padding**: 14px (`mobile-padding` class) for all page content on mobile
- **Touch Targets**: Minimum 44px for interactive elements
- **Grid Layouts**: Single column on mobile, responsive grids on larger screens

## 🎨 Visual Design System

### Color Palette
```css
/* Casino Theme Colors */
--poker-felt: 142 69% 24%
--gold-accent: 45 93% 47%
--gold-accent-dark: 45 93% 35%
--navy-deep: 215 25% 8%
--navy-card: 215 20% 12%
--emerald-bright: 142 76% 36%
--winner-glow: 142 100% 50%
```

### Typography Scale
```css
/* Mobile-first typography */
text-xs: 12px/16px
text-sm: 14px/20px
text-base: 16px/24px
text-lg: 18px/28px
text-xl: 20px/28px
text-2xl: 24px/32px
text-3xl: 30px/36px
```

### iOS Aesthetic Classes
```css
.ios-card {
  @apply bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg;
}

.ios-button {
  @apply bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-200;
}

.ios-input {
  @apply bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-inner focus:bg-white/20 focus:border-white/40 transition-all duration-200;
}
```

## 🏗️ Component Architecture

### Standard Page Layout
All pages (except homepage and active game) must use `StandardPageLayout`:

```tsx
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";

export default function YourPage() {
  const isMobile = useIsMobile();
  
  return (
    <StandardPageLayout
      title="Page Title"
      showBackButton={true}
      backPath="/"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-6xl mx-auto">
        {/* Your page content */}
      </div>
    </StandardPageLayout>
  );
}
```

### Standard Top Bar
The `StandardTopBar` provides consistent navigation:
- **Back button** on the far left
- **Profile management** and **help icon** on the far right
- **Full width** design
- **Responsive sizing** for mobile

## 📐 Layout Guidelines

### Container Structure
```tsx
// Main container
<div className="max-w-6xl mx-auto">
  
  // Section headers
  <div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
    <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
      Section Title
    </h1>
    <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
      Section description
    </p>
  </div>
  
  // Content cards
  <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
    {/* Card content */}
  </Card>
  
</div>
```

### Grid Systems
```tsx
// Mobile-first responsive grids
<div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
  {/* Grid items */}
</div>
```

### Button Standards
```tsx
// Primary buttons
<Button
  variant="casino"
  className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
>
  Primary Action
</Button>

// Secondary buttons
<Button
  variant="outline"
  className="w-full ios-button text-white border-white/30"
>
  Secondary Action
</Button>
```

## 🎭 Background System

### Homepage Background
- **Image**: `casino-hero-bg.jpg`
- **Usage**: All pages except homepage and active game
- **Overlay**: `bg-black/60` for text readability

### Background Implementation
```tsx
// In StandardPageLayout
{useHomepageBackground && (
  <div className="absolute inset-0 -z-10">
    <img
      src={heroImage}
      alt="Casino Background"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/60"></div>
  </div>
)}
```

## 📱 Mobile-Specific Guidelines

### Responsive Patterns
```tsx
// Icon sizing
<Icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />

// Text sizing
<h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>

// Spacing
<div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>

// Padding
<div className={`${isMobile ? 'p-4' : 'p-6'}`}>
```

### Mobile Navigation
- **Back button**: Always visible, left-aligned
- **Profile/Help**: Right-aligned, icon-only on mobile
- **Touch targets**: Minimum 44px height
- **Swipe gestures**: Consider for future enhancements

## 🎨 Component Standards

### Cards
```tsx
<Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white`}>
    Card Title
  </h3>
  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
    Card content
  </p>
</Card>
```

### Forms
```tsx
<Input
  className="ios-input text-white placeholder-white/50"
  placeholder="Enter value"
/>

<Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white`}>
  Field Label
</Label>
```

### Badges
```tsx
<Badge className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} bg-emerald-bright/20 text-emerald-bright`}>
  Status
</Badge>
```

## 🎯 Animation & Transitions

### Standard Transitions
```css
/* Smooth transitions */
transition-all duration-300

/* Hover effects */
hover:scale-105
hover:bg-white/30

/* Loading states */
animate-spin
animate-pulse
```

### Micro-interactions
- **Card hover**: Scale 105% with shadow enhancement
- **Button press**: Subtle scale and color change
- **Loading states**: Smooth spinners and skeleton screens

## 🧩 Component Library

### Required Imports
```tsx
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
```

### Icon Standards
- **Size**: `w-4 h-4` on mobile, `w-5 h-5` on desktop
- **Color**: `text-white`, `text-gold`, or `text-emerald-bright`
- **Spacing**: `mr-2` for inline icons

## 📋 Checklist for New Pages

### ✅ Required Elements
- [ ] Use `StandardPageLayout` wrapper
- [ ] Import and use `useIsMobile` hook
- [ ] Apply mobile-first responsive design
- [ ] Use `ios-card`, `ios-button`, `ios-input` classes
- [ ] Implement proper mobile padding (14px)
- [ ] Use responsive font sizes (12px-16px on mobile)
- [ ] Include back button and profile management
- [ ] Apply homepage background (if applicable)
- [ ] Test on mobile and desktop viewports

### ✅ Design Consistency
- [ ] Follow casino color palette
- [ ] Use consistent spacing patterns
- [ ] Apply proper visual hierarchy
- [ ] Include appropriate hover states
- [ ] Ensure touch-friendly interactions
- [ ] Maintain iOS aesthetic throughout

### ✅ Accessibility
- [ ] Proper color contrast ratios
- [ ] Semantic HTML structure
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Focus indicators

## 🚀 Implementation Examples

### Basic Page Template
```tsx
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamplePage() {
  const isMobile = useIsMobile();
  
  return (
    <StandardPageLayout
      title="Example Page"
      showBackButton={true}
      backPath="/"
      showHelp={true}
      showProfile={true}
      showGameInvitations={true}
      useHomepageBackground={true}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
            Page Title
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            Page description
          </p>
        </div>
        
        <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-4`}>
            Section Title
          </h2>
          
          <Button
            variant="casino"
            className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
          >
            Action Button
          </Button>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
```

## 📝 Notes

- **Always test** on both mobile and desktop viewports
- **Maintain consistency** with existing pages
- **Follow the casino theme** while ensuring modern UX
- **Prioritize mobile experience** in all design decisions
- **Use semantic HTML** for better accessibility
- **Keep animations subtle** and purposeful

---

*This document should be referenced for all new page development to ensure consistency across the Binzingo Cardy application.*

# 🚀 Developer Quick Reference - Binzingo Cardy UI

## 📱 Essential Imports
```tsx
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
```

## 🏗️ Page Structure Template
```tsx
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
        {/* Your content */}
      </div>
    </StandardPageLayout>
  );
}
```

## 📐 Responsive Patterns
```tsx
// Text sizing
className={`${isMobile ? 'text-sm' : 'text-base'}`}

// Spacing
className={`${isMobile ? 'mb-4' : 'mb-6'}`}

// Padding
className={`${isMobile ? 'p-4' : 'p-6'}`}

// Icons
className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}

// Grids
className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}
```

## 🎨 Styling Classes
```tsx
// Cards
className="ios-card"

// Buttons
className="ios-button text-white border-white/30"

// Inputs
className="ios-input text-white placeholder-white/50"

// Mobile padding
className="mobile-padding"
```

## 🎯 Button Standards
```tsx
// Primary
<Button variant="casino" className="w-full bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg">
  Primary Action
</Button>

// Secondary
<Button variant="outline" className="w-full ios-button text-white border-white/30">
  Secondary Action
</Button>
```

## 🎨 Color Classes
```tsx
text-white          // Primary text
text-white/80       // Secondary text
text-white/70       // Muted text
text-gold           // Accent color
text-emerald-bright // Success color
bg-gold             // Primary background
bg-emerald-bright/20 // Success background
```

## 📱 Mobile Guidelines
- **Font sizes**: 12px-16px on mobile
- **Padding**: 14px for page content
- **Touch targets**: Minimum 44px
- **Grid**: Single column on mobile
- **Icons**: w-4 h-4 on mobile, w-5 h-5 on desktop

## ✅ Checklist
- [ ] Use `StandardPageLayout`
- [ ] Import `useIsMobile`
- [ ] Apply responsive patterns
- [ ] Use `ios-*` classes
- [ ] Test mobile/desktop
- [ ] Follow casino theme
- [ ] Include proper navigation

## 🎪 Background
- **Homepage**: `casino-hero-bg.jpg` with `bg-black/60` overlay
- **All other pages**: Use `useHomepageBackground={true}` in `StandardPageLayout`

## 🔧 Common Patterns
```tsx
// Section header
<div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
  <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
    Title
  </h1>
  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
    Description
  </p>
</div>

// Content card
<Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
  {/* Content */}
</Card>

// Form field
<div>
  <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white mb-2 block`}>
    Label
  </Label>
  <Input className="ios-input text-white placeholder-white/50" />
</div>
```

---
*Keep this reference handy for consistent UI development!*

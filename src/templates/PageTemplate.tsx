/**
 * Standard Page Template for Binzingo Cardy
 * 
 * This template follows all approved UI/UX guidelines:
 * - Mobile-first responsive design
 * - iOS aesthetic styling
 * - Standard page layout
 * - Casino theme consistency
 * 
 * Copy this template and modify as needed for new pages.
 */

import { StandardPageLayout } from "@/components/StandardPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  // Add your required icons here
  Home,
  Settings,
  User
} from "lucide-react";

export default function PageTemplate() {
  const isMobile = useIsMobile();
  
  // Your page logic here
  const handleAction = () => {
    // Your action logic
  };
  
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
        {/* Page Header */}
        <div className={`${isMobile ? 'mb-4' : 'mb-6'} text-center`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
            Page Title
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-white/80`}>
            Page description goes here
          </p>
        </div>

        {/* Main Content Card */}
        <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-4`}>
            Section Title
          </h2>
          
          {/* Form Example */}
          <div className="space-y-4 mb-6">
            <div>
              <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white mb-2 block`}>
                Field Label
              </Label>
              <Input
                className="ios-input text-white placeholder-white/50"
                placeholder="Enter value"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleAction}
              variant="casino"
              className={`w-full ${isMobile ? 'text-base py-3' : 'text-lg py-4'} bg-gold hover:bg-gold-dark text-black font-semibold rounded-xl shadow-lg`}
            >
              Primary Action
            </Button>
            
            <Button
              variant="outline"
              className="w-full ios-button text-white border-white/30"
            >
              Secondary Action
            </Button>
          </div>
        </Card>

        {/* Additional Content Sections */}
        <div className={`${isMobile ? 'mt-4' : 'mt-6'}`}>
          <Card className={`${isMobile ? 'p-4' : 'p-6'} ios-card`}>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white mb-3`}>
              Additional Section
            </h3>
            
            {/* Grid Example */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
              <div className={`${isMobile ? 'p-3' : 'p-4'} bg-white/10 border border-white/20 rounded-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <Home className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gold`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white`}>
                    Feature 1
                  </span>
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                  Feature description
                </p>
              </div>
              
              <div className={`${isMobile ? 'p-3' : 'p-4'} bg-white/10 border border-white/20 rounded-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gold`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white`}>
                    Feature 2
                  </span>
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70`}>
                  Feature description
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status/Info Section */}
        <div className={`${isMobile ? 'mt-4' : 'mt-6'} text-center`}>
          <Badge className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm'} bg-emerald-bright/20 text-emerald-bright`}>
            Status Information
          </Badge>
        </div>
      </div>
    </StandardPageLayout>
  );
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Copy this template file
 * 2. Rename the file to match your page name
 * 3. Update the component name and export
 * 4. Modify the StandardPageLayout props as needed:
 *    - title: Page title shown in top bar
 *    - showBackButton: Show/hide back button
 *    - backPath: Where back button navigates to
 *    - showHelp: Show/hide help button
 *    - showProfile: Show/hide profile button
 *    - showGameInvitations: Show/hide game invitations
 *    - useHomepageBackground: Use casino background
 * 
 * 5. Replace placeholder content with your actual content
 * 6. Add any required imports for icons or components
 * 7. Implement your page logic in the component
 * 8. Test on both mobile and desktop viewports
 * 
 * RESPONSIVE PATTERNS:
 * - Use isMobile ? 'mobile-class' : 'desktop-class' for responsive styling
 * - Mobile font sizes: 12px-16px range
 * - Mobile padding: 14px (use mobile-padding class)
 * - Mobile grid: single column, desktop: multi-column
 * - Mobile icons: w-4 h-4, desktop: w-5 h-5
 * 
 * STYLING CLASSES:
 * - ios-card: Glass morphism card styling
 * - ios-button: iOS-style button with backdrop blur
 * - ios-input: iOS-style input with backdrop blur
 * - mobile-padding: 14px padding for mobile
 * 
 * COLOR CLASSES:
 * - text-white: Primary text color
 * - text-white/80: Secondary text color
 * - text-white/70: Muted text color
 * - text-gold: Accent color for highlights
 * - text-emerald-bright: Success/positive color
 * - bg-gold: Primary button background
 * - bg-emerald-bright/20: Success badge background
 */

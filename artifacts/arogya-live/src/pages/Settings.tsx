import { useAppSettings } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, Type, Palette, Globe } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, fontSize, setFontSize, highContrast, setHighContrast } = useAppSettings();
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            {t("settings")}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your app preferences and accessibility options.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-500" />
              Language Preference
            </CardTitle>
            <CardDescription>Select your preferred language for the interface.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={language} onValueChange={setLanguage} className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-background transition-colors">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en" className="flex-1 cursor-pointer font-medium">English</Label>
              </div>
              <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-background transition-colors">
                <RadioGroupItem value="hi" id="lang-hi" />
                <Label htmlFor="lang-hi" className="flex-1 cursor-pointer font-medium font-['Noto_Sans_Devanagari']">हिन्दी (Hindi)</Label>
              </div>
              <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-background transition-colors">
                <RadioGroupItem value="bn" id="lang-bn" />
                <Label htmlFor="lang-bn" className="flex-1 cursor-pointer font-medium font-['Noto_Sans_Bengali']">বাংলা (Bengali)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-500" />
              Accessibility
            </CardTitle>
            <CardDescription>Adjust visual settings for better readability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast" className="text-base font-medium">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">Increases contrast between text and backgrounds.</p>
              </div>
              <Switch 
                id="high-contrast" 
                checked={highContrast} 
                onCheckedChange={setHighContrast}
                data-testid="switch-high-contrast"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" /> Base Font Size
                </Label>
                <span className="font-mono text-primary font-bold">{fontSize}px</span>
              </div>
              <Slider 
                value={[fontSize]} 
                min={14} 
                max={24} 
                step={1} 
                onValueChange={(vals) => setFontSize(vals[0])}
                className="py-4"
                data-testid="slider-font-size"
              />
              <div className="flex justify-between text-xs text-muted-foreground uppercase font-bold tracking-wider">
                <span>A (14px)</span>
                <span>Default (16px)</span>
                <span className="text-base">A (24px)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, User, FileText, ShoppingCart, Calculator, Send, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProposalFormData } from "@/types/proposal-form";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
}

interface ProposalFormWizardProps {
  onComplete: (data: ProposalFormData) => void;
  onSaveDraft: (data: Partial<ProposalFormData>) => void;
  initialData?: Partial<ProposalFormData>;
}

const ProposalFormWizard: React.FC<ProposalFormWizardProps> = ({
  onComplete,
  onSaveDraft,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ProposalFormData>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: Step[] = [
    {
      id: 'customer',
      title: 'Müşteri Bilgileri',
      description: 'Teklif edilecek müşteriyi seçin',
      icon: User,
      required: true
    },
    {
      id: 'basic',
      title: 'Temel Bilgiler',
      description: 'Teklif başlığı ve detayları',
      icon: FileText,
      required: true
    },
    {
      id: 'items',
      title: 'Ürün/Hizmetler',
      description: 'Teklif kalemlerini ekleyin',
      icon: ShoppingCart,
      required: true
    },
    {
      id: 'totals',
      title: 'Hesaplamalar',
      description: 'İndirim ve vergi ayarları',
      icon: Calculator,
      required: false
    },
    {
      id: 'review',
      title: 'Önizleme',
      description: 'Teklifinizi kontrol edin',
      icon: Send,
      required: false
    }
  ];

  const updateFormData = (updates: Partial<ProposalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    
    switch (step.id) {
      case 'customer':
        return !!formData.customer_id;
      case 'basic':
        return !!formData.title && !!formData.valid_until;
      case 'items':
        return formData.items && formData.items.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to earlier steps or completed steps
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (stepIndex < currentStep) return 'completed';
    return 'pending';
  };

  const progress = ((completedSteps.size + (validateStep(currentStep) ? 1 : 0)) / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Yeni Teklif Oluştur</h1>
          <Badge variant="outline" className="text-sm">
            {completedSteps.size + 1} / {steps.length} Adım
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-6" />
        
        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStep && !completedSteps.has(index)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                    "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    status === 'active' && "bg-primary/10 border border-primary/20",
                    status === 'completed' && "bg-green-50 border border-green-200"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    status === 'completed' && "bg-green-500 border-green-500 text-white",
                    status === 'active' && "bg-primary border-primary text-white",
                    status === 'pending' && "border-muted-foreground/30"
                  )}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      status === 'active' && "text-primary",
                      status === 'completed' && "text-green-600"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
            </div>
            <div>
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Content Rendering */}
          {currentStep === 0 && (
            <CustomerSelectionStep
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 2 && (
            <ItemsStep
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 3 && (
            <TotalsStep
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
          
          {currentStep === 4 && (
            <ReviewStep
              formData={formData}
              onUpdate={updateFormData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Önceki
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onSaveDraft(formData)}
            className="gap-2"
          >
            Taslak Kaydet
          </Button>
          
          {currentStep === (steps.length - 1) ? (
            <Button
              onClick={() => onComplete(formData as ProposalFormData)}
              disabled={!validateStep(currentStep)}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Teklifi Oluştur
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="gap-2"
            >
              Sonraki
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step Components
const CustomerSelectionStep: React.FC<{
  formData: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}> = ({ formData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Müşteri Seçimi</h3>
        <p className="text-blue-700 text-sm">
          Teklif edilecek müşteriyi seçin veya yeni müşteri ekleyin
        </p>
      </div>
      
      {/* Customer selection component would go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Müşteri/Firma</Label>
          <Input
            placeholder="Müşteri seçin..."
            value={formData.customer_id || ''}
            onChange={(e) => onUpdate({ customer_id: e.target.value })}
          />
        </div>
        <div>
          <Label>İletişim Kişisi</Label>
          <Input placeholder="İletişim kişisi" />
        </div>
      </div>
    </div>
  );
};

const BasicInfoStep: React.FC<{
  formData: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}> = ({ formData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Teklif Başlığı *</Label>
            <Input
              placeholder="Teklif başlığını girin"
              value={formData.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Geçerlilik Tarihi *</Label>
            <Input
              type="date"
              value={formData.valid_until || ''}
              onChange={(e) => onUpdate({ valid_until: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Açıklama</Label>
            <Textarea
              placeholder="Teklif açıklaması"
              value={formData.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemsStep: React.FC<{
  formData: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}> = ({ formData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-900 mb-2">Teklif Kalemleri</h3>
        <p className="text-amber-700 text-sm">
          Müşteriye teklif edilecek ürün ve hizmetleri ekleyin
        </p>
      </div>
      
      {/* Items management component would go here */}
      <div className="min-h-[300px] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground">Teklif kalemleri buraya eklenecek</p>
        </div>
      </div>
    </div>
  );
};

const TotalsStep: React.FC<{
  formData: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}> = ({ formData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">İndirim Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Genel İndirim (%)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.discounts || ''}
                onChange={(e) => onUpdate({ discounts: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vergi Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>KDV Oranı (%)</Label>
              <Input
                type="number"
                placeholder="20"
                defaultValue="20"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{
  formData: Partial<ProposalFormData>;
  onUpdate: (data: Partial<ProposalFormData>) => void;
}> = ({ formData, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Teklif Özeti</h3>
        <p className="text-green-700 text-sm">
          Teklifinizi son kez kontrol edin ve gönderin
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teklif Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Başlık:</span>
              <span className="font-medium">{formData.title || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Müşteri:</span>
              <span className="font-medium">{formData.customer_id || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Geçerlilik:</span>
              <span className="font-medium">{formData.valid_until || '-'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toplam Hesaplamalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span className="font-medium">₺0,00</span>
            </div>
            <div className="flex justify-between">
              <span>İndirim:</span>
              <span className="font-medium">₺0,00</span>
            </div>
            <div className="flex justify-between">
              <span>KDV:</span>
              <span className="font-medium">₺0,00</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Genel Toplam:</span>
              <span>₺0,00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalFormWizard;
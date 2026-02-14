import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, Upload, Check, AlertCircle, Info } from 'lucide-react';

export function ProfilePictureDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Navigate to Profile',
      description: 'Go to the Profile page from the dashboard or navigation menu',
      icon: <Info className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Click Camera Icon',
      description: 'Click the camera button on your profile picture',
      icon: <Camera className="w-5 h-5" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Select Image',
      description: 'Choose an image file from your device (max 5MB)',
      icon: <Upload className="w-5 h-5" />,
      color: 'bg-orange-500',
    },
    {
      title: 'Auto-Save Complete',
      description: 'Your profile picture is automatically saved to the cloud',
      icon: <Check className="w-5 h-5" />,
      color: 'bg-green-500',
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-[#2D6A4F] mb-6">Profile Picture Upload Flow</h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`relative flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer ${
              index === currentStep
                ? 'bg-[#2D6A4F]/10 border-2 border-[#2D6A4F]'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentStep(index)}
          >
            {/* Step Number */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                index <= currentStep ? step.color : 'bg-gray-400'
              }`}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-gray-800">{step.title}</h4>
                {index === currentStep && (
                  <Badge className="bg-[#2D6A4F] text-white text-xs">Current</Badge>
                )}
                {index < currentStep && (
                  <Badge className="bg-green-500 text-white text-xs">Complete</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-[27px] top-[60px] w-0.5 h-8 ${
                  index < currentStep ? step.color : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Features List */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600 mb-3">✨ Features included:</p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Automatic saving</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>File validation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Size limit (5MB)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Error handling</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Loading indicators</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Secure storage</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            <span className="font-medium">Pro Tip:</span> Use a square image (1:1 ratio) for best
            results. Recommended size: 500x500px or smaller.
          </p>
        </div>
      </div>
    </Card>
  );
}

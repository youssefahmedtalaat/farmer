import { Card } from './ui/card';
import { Camera, Check, Upload, Shield } from 'lucide-react';

export function ProfilePictureGuide() {
  return (
    <Card className="p-6 bg-gradient-to-br from-[#2D6A4F]/5 to-[#95D5B2]/5 border-[#2D6A4F]/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-[#2D6A4F] rounded-lg flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-[#2D6A4F] mb-1">Profile Picture Upload</h3>
          <p className="text-gray-600 text-sm">
            Your profile picture is automatically saved when you upload it
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Instant Upload:</span> Click the camera icon and select
              your image
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Auto-Save:</span> Your photo is saved automatically to
              the cloud
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Supported Formats:</span> JPG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Secure Storage:</span> Your images are encrypted and
              stored securely
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#2D6A4F]/10">
        <p className="text-xs text-gray-500">
          💡 <span className="font-medium">Tip:</span> Use a clear photo of yourself or your farm
          logo for best results
        </p>
      </div>
    </Card>
  );
}

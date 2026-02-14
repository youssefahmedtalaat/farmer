import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { User, Mail, Phone, MapPin, Camera, Save, Building2, Loader2 } from 'lucide-react';
import { notify } from '../utils/notifications';
import { profileApi, activitiesApi } from '../utils/api';
import { ProfilePictureGuide } from '../components/ProfilePictureGuide';
import { useLanguage } from '../utils/language';
import { toast } from 'sonner@2.0.3';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../utils/auth';

export function Profile() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    farmName: '',
    farmSize: '',
    location: '',
    address: '',
    bio: '',
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response: any = await profileApi.get();
      if (response.profile) {
        setFormData({
          fullName: response.profile.fullName || '',
          email: response.profile.email || '',
          phone: response.profile.phone || '',
          farmName: response.profile.farmName || '',
          farmSize: response.profile.farmSize || '',
          location: response.profile.location || '',
          address: response.profile.address || '',
          bio: response.profile.bio || '',
        });
        setProfileImage(response.profile.profileImage || '');
      }
    } catch (error: any) {
      notify.error('Failed to Load Profile', 'Could not retrieve your profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error('Image Too Large', 'Profile picture must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        notify.error('Invalid File Type', 'Please select a valid image file');
        return;
      }

      setIsUploadingImage(true);
      const previousImage = profileImage; // Save for rollback

      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setProfileImage(imageData); // Optimistically update UI

        // Save profile picture immediately to backend
        try {
          await profileApi.update({
            profileImage: imageData,
          });
          
          notify.profile.pictureUpdated();

          // Log activity
          try {
            await activitiesApi.log({
              action: 'Profile picture updated',
              detail: `Image size: ${(file.size / 1024).toFixed(2)} KB`,
            });
          } catch (activityError) {
            // Activity logging failed, but continue
          }
        } catch (error: any) {
          notify.profile.error('Failed to save profile picture');
          // Revert the image on error
          setProfileImage(previousImage);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Validate required fields
    if (!formData.fullName.trim()) {
      notify.error('Missing Information', 'Full name is required');
      setIsSaving(false);
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      notify.error('Invalid Email', 'Please enter a valid email address');
      setIsSaving(false);
      return;
    }

    // Save to backend
    try {
      await profileApi.update({
        ...formData,
        profileImage,
      });

      toast.success('Profile updated successfully!', {
        description: 'Your information has been saved.',
      });

      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset form data to original values
    toast.info('Changes discarded');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <DashboardLayout hideSidebar={true}>
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#2D6A4F] animate-spin" />
                <span className="ml-3 text-gray-600">{t('profile.loading')}</span>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideSidebar={true}>
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#2D6A4F] mb-2">{t('profile.title')}</h1>
          <p className="text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-8 mb-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-[#2D6A4F]/20">
                <AvatarImage src={profileImage} alt={formData.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] text-white text-3xl">
                  {getInitials(formData.fullName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay when uploading */}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleImageClick}
                      disabled={isUploadingImage}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 text-white rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Change profile picture"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('profile.changePhoto')}</p>
                    <p className="text-xs text-gray-400">{t('profile.maxSize')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-[#2D6A4F] mb-1">{formData.fullName}</h2>
              <p className="text-gray-600 mb-3">{formData.farmName}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-full text-sm">
                  <Building2 className="w-4 h-4" />
                  {formData.farmSize} {t('profile.acres')}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#74C0FC]/10 text-[#74C0FC] rounded-full text-sm">
                  <MapPin className="w-4 h-4" />
                  {formData.location}
                </span>
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white transition-all duration-300"
              >
                {t('profile.editProfile')}
              </Button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.fullName')}
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.phone')}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Farm Name */}
              <div>
                <Label htmlFor="farmName" className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.farmName')}
                </Label>
                <Input
                  id="farmName"
                  value={formData.farmName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Farm Size */}
              <div>
                <Label htmlFor="farmSize" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.farmSize')}
                </Label>
                <Input
                  id="farmSize"
                  type="number"
                  value={formData.farmSize}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                  {t('profile.fields.location')}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                {t('profile.fields.address')}
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="mb-2 block">
                {t('profile.fields.bio')}
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder={t('profile.fields.bioPlaceholder')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
              >
                {t('profile.cancel')}
              </Button>
            </div>
          )}
        </Card>

        {/* Profile Picture Guide */}
        <div className="mb-6">
          <ProfilePictureGuide />
        </div>

        {/* Additional Info - Only show for non-admin users */}
        {!isAdmin && (
          <Card className="p-6">
            <h3 className="text-[#2D6A4F] mb-4">{t('profile.accountSettings')}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between py-2 border-b">
                <span>{t('profile.accountStatus')}</span>
                <span className="text-green-600">{t('profile.active')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>{t('profile.memberSince')}</span>
                <span className="text-gray-800">January 2024</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>{t('profile.subscriptionPlan')}</span>
                <span className="text-[#2D6A4F]">{t('profile.proPlan')}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>{t('profile.twoFactor')}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-gray-300 text-gray-400 cursor-not-allowed text-xs"
                      >
                        {t('profile.enable')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Two-Factor Authentication coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

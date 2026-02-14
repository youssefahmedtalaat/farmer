import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sprout, Package, Trash2 } from 'lucide-react';
import { cropsApi, activitiesApi } from '../utils/api';
import { notify } from '../utils/notifications';
import { useLanguage } from '../utils/language';

interface Crop {
  id: string;
  name: string;
  quantity: string;
  stock: number;
  status: string;
}

interface EditCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropUpdated: () => void;
  crop: Crop | null;
}

export function EditCropDialog({ open, onOpenChange, onCropUpdated, crop }: EditCropDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    quantityUnit: 'tons',
    stock: 100,
    status: 'Good',
  });

  // Parse quantity string (e.g., "2.5 tons" -> { value: "2.5", unit: "tons" })
  const parseQuantity = (quantity: string) => {
    if (!quantity) return { value: '', unit: 'tons' };
    
    const units = ['tons', 'kg', 'lbs', 'bushels'];
    for (const unit of units) {
      if (quantity.toLowerCase().includes(unit)) {
        const value = quantity.replace(new RegExp(`\\s*${unit}`, 'i'), '').trim();
        return { value, unit };
      }
    }
    // If no unit found, assume it's just a number
    return { value: quantity.trim(), unit: 'tons' };
  };

  // Load crop data when dialog opens
  useEffect(() => {
    if (open && crop) {
      const parsed = parseQuantity(crop.quantity);
      setFormData({
        name: crop.name || '',
        quantity: parsed.value,
        quantityUnit: parsed.unit,
        stock: crop.stock || 100,
        status: crop.status || 'Good',
      });
    }
  }, [open, crop]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      notify.error(t('addCrop.error.missingName'), t('addCrop.error.missingName'));
      return false;
    }
    
    if (!formData.quantity.trim()) {
      notify.error(t('addCrop.error.missingQuantity'), t('addCrop.error.missingQuantity'));
      return false;
    }

    const quantityNum = parseFloat(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      notify.error(t('addCrop.error.invalidQuantity'), t('addCrop.error.invalidQuantity'));
      return false;
    }

    if (formData.stock < 0 || formData.stock > 100) {
      notify.error(t('addCrop.error.invalidStock'), t('addCrop.error.invalidStock'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !crop) return;

    setIsSubmitting(true);

    try {
      // Determine status based on stock level
      let status = 'Good';
      if (formData.stock <= 25) {
        status = 'Critical';
      } else if (formData.stock <= 50) {
        status = 'Low';
      }

      const cropData = {
        name: formData.name.trim(),
        quantity: `${formData.quantity} ${formData.quantityUnit}`,
        stock: formData.stock,
        status: status,
      };

      // Update crop in database
      await cropsApi.update(crop.id, cropData);

      // Log activity
      await activitiesApi.log({
        action: 'Crop updated',
        detail: `${cropData.name} - ${cropData.quantity} (${cropData.stock}%)`,
      });

      // Show success notification
      notify.success(t('crops.cropUpdated'), `${t('crops.cropUpdatedDesc')} ${cropData.name}`);

      // Close dialog and refresh crops
      onOpenChange(false);
      onCropUpdated();
      // Dispatch event to notify all components
      window.dispatchEvent(new CustomEvent('cropsUpdated'));

    } catch (error: any) {
      // Handle subscription errors
      if (error.message && (error.message.includes('subscription') || error.message.includes('trial') || error.message.includes('expired'))) {
        notify.error('Subscription Required', error.message);
        // Optionally redirect to subscription page after a delay
        setTimeout(() => {
          window.location.href = '/subscription';
        }, 2000);
      } else if (error.message && error.message.includes('already exists')) {
        // Handle duplicate crop error
        notify.error(t('addCrop.error.duplicate'), t('addCrop.error.duplicate'));
      } else {
        notify.error(t('crops.updateError'), error.message || t('crops.updateError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!crop || !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);

    try {
      // Delete crop from database
      await cropsApi.delete(crop.id);

      // Log activity
      await activitiesApi.log({
        action: 'Crop deleted',
        detail: `${crop.name} - ${crop.quantity}`,
      });

      // Show success notification
      notify.crop.deleted(crop.name);

      // Close dialog and refresh crops
      onOpenChange(false);
      onCropUpdated();
      // Dispatch event to notify all components
      window.dispatchEvent(new CustomEvent('cropsUpdated'));

    } catch (error: any) {
      // Handle subscription errors
      if (error.message && (error.message.includes('subscription') || error.message.includes('trial') || error.message.includes('expired'))) {
        notify.error('Subscription Required', error.message);
        // Optionally redirect to subscription page after a delay
        setTimeout(() => {
          window.location.href = '/subscription';
        }, 2000);
      } else {
        notify.error(t('crops.deleteError') || 'Failed to delete crop', error.message || t('crops.deleteError') || 'Failed to delete crop');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Determine stock color
  const getStockColor = () => {
    if (formData.stock <= 25) return 'text-red-600';
    if (formData.stock <= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  if (!crop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#2D6A4F] flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            {t('crops.editCrop')}
          </DialogTitle>
          <DialogDescription>
            {t('crops.editCropDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Crop Name */}
          <div>
            <Label htmlFor="editCropName">{t('addCrop.cropName')} {t('addCrop.required')}</Label>
            <Input
              id="editCropName"
              placeholder={t('addCrop.cropNamePlaceholder')}
              className="mt-1"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="editQuantity">{t('addCrop.quantity')} {t('addCrop.required')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="editQuantity"
                type="number"
                step="0.1"
                min="0"
                placeholder={t('addCrop.quantityPlaceholder')}
                className="flex-1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                disabled={isSubmitting}
              />
              <Select
                value={formData.quantityUnit}
                onValueChange={(value) => handleInputChange('quantityUnit', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tons">{t('addCrop.unit.tons')}</SelectItem>
                  <SelectItem value="kg">{t('addCrop.unit.kg')}</SelectItem>
                  <SelectItem value="lbs">{t('addCrop.unit.lbs')}</SelectItem>
                  <SelectItem value="bushels">{t('addCrop.unit.bushels')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Level */}
          <div>
            <Label htmlFor="editStock" className="flex items-center justify-between">
              <span>{t('addCrop.stockLevel')} {t('addCrop.required')}</span>
              <span className={`text-sm ${getStockColor()}`}>
                {formData.stock}%
              </span>
            </Label>
            <Input
              id="editStock"
              type="range"
              min="0"
              max="100"
              step="5"
              className="mt-2"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('addCrop.empty')}</span>
              <span>{t('addCrop.full')}</span>
            </div>
          </div>

          {/* Status Preview */}
          <div className="bg-[#2D6A4F]/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#2D6A4F]" />
              <p className="text-sm text-gray-700">{t('addCrop.preview')}</p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                {t('addCrop.previewCrop')}: <strong>{formData.name || t('addCrop.notSpecified')}</strong>
              </p>
              <p>
                {t('addCrop.previewAmount')}: <strong>{formData.quantity ? `${formData.quantity} ${t(`addCrop.unit.${formData.quantityUnit}`)}` : t('addCrop.notSpecified')}</strong>
              </p>
              <p>
                {t('addCrop.previewStatus')}:{' '}
                <strong className={getStockColor()}>
                  {formData.stock <= 25 ? t('addCrop.status.critical') : formData.stock <= 50 ? t('addCrop.status.low') : t('addCrop.status.good')}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900 mb-3 font-medium">
                {t('crops.confirmDelete') || 'Are you sure you want to delete this crop?'}
              </p>
              <p className="text-xs text-red-700 mb-3">
                {t('crops.deleteWarning') || 'This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-full"
                >
                  {t('addCrop.cancel')}
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                >
                  {isDeleting ? t('crops.deleting') || 'Deleting...' : t('crops.confirmDeleteButton') || 'Yes, Delete'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || isDeleting}
                className="flex-1 rounded-full"
              >
                {t('addCrop.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isDeleting}
                className="flex-1 bg-[#2D6A4F] hover:bg-[#2D6A4F]/90 rounded-full"
              >
                {isSubmitting ? t('crops.updating') : t('crops.saveChanges')}
              </Button>
            </div>
          )}
          
          {!showDeleteConfirm && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('crops.deleteCrop') || 'Delete Crop'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


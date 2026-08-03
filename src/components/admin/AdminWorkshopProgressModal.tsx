import React, { useState } from 'react';
import { Order, WorkshopProgressStage } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  Loader2,
  Hammer,
  Wrench,
  Paintbrush,
  Truck,
  Sparkles
} from 'lucide-react';

interface AdminWorkshopProgressModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderProgress: (orderId: string, updatedProgress: WorkshopProgressStage[]) => Promise<void>;
}

export const AdminWorkshopProgressModal: React.FC<AdminWorkshopProgressModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrderProgress,
}) => {
  const [selectedStageKey, setSelectedStageKey] = useState<
    'RAW_METAL_FORGING' | 'LATHE_PRECISION_ALIGNMENT' | 'ANTI_RUST_PRIMER' | 'READY_FOR_LOADING'
  >('RAW_METAL_FORGING');

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [stageNotes, setStageNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !order) return null;

  const defaultStages: Array<{
    key: 'RAW_METAL_FORGING' | 'LATHE_PRECISION_ALIGNMENT' | 'ANTI_RUST_PRIMER' | 'READY_FOR_LOADING';
    title: string;
    description: string;
    icon: any;
  }> = [
    {
      key: 'RAW_METAL_FORGING',
      title: '1. Raw Metal Forging & Cutting',
      description: 'Forging raw steel channels, angle irons, and pipe cutting at workshop.',
      icon: Hammer,
    },
    {
      key: 'LATHE_PRECISION_ALIGNMENT',
      title: '2. Lathe Machine Precision Alignment',
      description: 'Shaft turning, bush fitting, and precision machining on lathe equipment.',
      icon: Wrench,
    },
    {
      key: 'ANTI_RUST_PRIMER',
      title: '3. Anti-Rust Red Oxide Primer Spray',
      description: 'Applying anti-corrosion red oxide primer and quality finish coat.',
      icon: Paintbrush,
    },
    {
      key: 'READY_FOR_LOADING',
      title: '4. Ready for Vehicle Loading & Dispatch',
      description: 'Final quality inspection complete. Ready for tractor/truck loading.',
      icon: Truck,
    },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const file = files[0];
      const url = await uploadToCloudinary(file);
      setUploadedPhotos((prev) => [...prev, url]);
    } catch (err) {
      alert('Failed uploading photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const existingProgress = order.workshopProgress || [];

      const currentStageMeta = defaultStages.find((s) => s.key === selectedStageKey)!;

      const updatedProgressList: WorkshopProgressStage[] = defaultStages.map((sMeta) => {
        const existing = existingProgress.find((p) => p.stage === sMeta.key);
        if (sMeta.key === selectedStageKey) {
          return {
            stage: sMeta.key,
            title: sMeta.title,
            description: stageNotes.trim() || sMeta.description,
            photos: Array.from(new Set([...(existing?.photos || []), ...uploadedPhotos])),
            completedAt: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            isCurrent: true,
          };
        }
        return (
          existing || {
            stage: sMeta.key,
            title: sMeta.title,
            description: sMeta.description,
            photos: [],
            isCurrent: false,
          }
        );
      });

      await onUpdateOrderProgress(order.id, updatedProgressList);
      alert(`Live workshop photo & progress updated for Order #${order.orderNumber}!`);
      onClose();
    } catch (err) {
      console.error('Error saving workshop progress:', err);
      alert('Failed saving progress update.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-[26px] max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 my-auto flex flex-col">
        
        {/* Header */}
        <div className="bg-[#111111] text-white p-4 sm:p-5 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30 font-black">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white">
                Upload Live Workshop Progress Photo
              </h3>
              <p className="text-[10px] font-mono text-gray-400">
                Order #{order.orderNumber} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveProgress} className="p-5 space-y-5 text-xs font-sans">
          
          {/* Step 1: Select Stage */}
          <div className="space-y-2">
            <label className="font-heading font-extrabold text-[#111111] uppercase tracking-wider block">
              1. Select Workshop Crafting Stage
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {defaultStages.map((s) => {
                const IconComponent = s.icon;
                const isSelected = selectedStageKey === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedStageKey(s.key)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <IconComponent size={18} className={isSelected ? 'text-[#F97316]' : 'text-gray-500'} />
                    <div className="min-w-0">
                      <h4 className="font-heading font-black text-xs leading-snug truncate">{s.title}</h4>
                      <p className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Upload Photo */}
          <div className="space-y-2">
            <label className="font-heading font-extrabold text-[#111111] uppercase tracking-wider block">
              2. Upload Workshop Photo (Cloudinary)
            </label>

            <div className="flex items-center gap-3">
              <label className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-heading font-extrabold text-xs px-4 py-3 rounded-2xl border border-gray-300 cursor-pointer flex items-center gap-2 transition-colors">
                {isUploading ? <Loader2 size={18} className="animate-spin text-[#F97316]" /> : <Upload size={18} className="text-[#F97316]" />}
                <span>{isUploading ? 'Uploading to Server...' : 'Choose Photo from Camera / Gallery'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {uploadedPhotos.length > 0 && (
                <span className="text-emerald-700 font-mono font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 size={16} /> {uploadedPhotos.length} photo(s) selected
                </span>
              )}
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Custom Notes */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700 block">Stage Progress Notes (Optional):</label>
            <input
              type="text"
              placeholder="e.g. Forged using 16 gauge steel pipe. Lathe turning completed by Senior Machinist."
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-2/3 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Publish Live Progress Photo →
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

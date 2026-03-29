import { useState, useRef, useCallback } from "react";
import { Search, Upload, Camera, X, Loader as Loader2, Sparkles } from "lucide-react";
import { searchDrug, extractDrugFromImage, getAvailableDrugs } from "../services/drugInfoService";
import type { DrugInfo } from "../services/drugInfoService";

interface MedicineScannerProps {
  onDrugFound: (drugInfo: DrugInfo) => void;
  onSearching: (isSearching: boolean) => void;
}

export function MedicineScanner({ onDrugFound, onSearching }: MedicineScannerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const availableDrugs = getAvailableDrugs();

  const filteredSuggestions = searchQuery
    ? availableDrugs.filter((drug) =>
        drug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setError(null);
      setIsProcessing(true);
      onSearching(true);

      try {
        const result = await searchDrug(query);
        if (result) {
          onDrugFound(result);
        } else {
          setError(`No information found for "${query}". Try searching for common medicines like Paracetamol, Ibuprofen, or Aspirin.`);
        }
      } catch {
        setError("Failed to search for drug information. Please try again.");
      } finally {
        setIsProcessing(false);
        onSearching(false);
      }
    },
    [onDrugFound, onSearching]
  );

  const handleSuggestionClick = (drug: string) => {
    setSearchQuery(drug);
    setShowSuggestions(false);
    handleSearch(drug);
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process image
    setError(null);
    setIsProcessing(true);
    onSearching(true);

    try {
      const extractedName = await extractDrugFromImage(file);
      if (extractedName) {
        setSearchQuery(extractedName);
        const result = await searchDrug(extractedName);
        if (result) {
          onDrugFound(result);
        } else {
          setError("Could not identify the medicine from the image. Please try entering the name manually.");
        }
      } else {
        setError("Could not read the medicine name from the image. Please try again with a clearer image or enter the name manually.");
      }
    } catch {
      setError("Failed to process the image. Please try again.");
    } finally {
      setIsProcessing(false);
      onSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Medicine Scanner</h2>
          <p className="text-sm text-gray-600">Search by name or scan medicine image</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowSuggestions(false);
                handleSearch(searchQuery);
              }
            }}
            placeholder="Enter medicine name (e.g., Paracetamol, Ibuprofen)"
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isProcessing}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {filteredSuggestions.map((drug) => (
              <button
                key={drug}
                type="button"
                onClick={() => handleSuggestionClick(drug)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{drug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={() => handleSearch(searchQuery)}
        disabled={!searchQuery.trim() || isProcessing}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-4 rounded-xl transition-colors text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Medicine
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-gray-500">or scan an image</span>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Medicine preview"
              className="w-full h-48 object-contain bg-gray-50 rounded-xl"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="w-6 h-6 text-gray-600" />
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Camera className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Upload or take a photo
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Available Medicines Hint */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 font-medium mb-2">
          Available in demo database:
        </p>
        <div className="flex flex-wrap gap-2">
          {availableDrugs.map((drug) => (
            <button
              key={drug}
              onClick={() => handleSuggestionClick(drug)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {drug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

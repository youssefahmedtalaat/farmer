import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { EgyptFarmMap, farms } from '../components/EgyptFarmMap';
import { Search, Filter, MapPin, Sprout, TrendingUp, Users, Navigation } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../utils/language';
import { DashboardLayout } from '../components/DashboardLayout';

// Use the farms from the map component for consistency
const featuredFarms = [
  {
    ...farms[0], // Nile Delta Farms
    distance: '12 km',
    rating: 4.8,
  },
  {
    ...farms[1], // Cairo Green Valley
    distance: '8 km',
    rating: 4.9,
  },
  {
    ...farms[2], // Alexandria Coastal Farm
    distance: '25 km',
    rating: 4.6,
  },
  {
    ...farms[3], // Fayoum Oasis Agriculture
    distance: '45 km',
    rating: 4.7,
  },
  {
    ...farms[5], // Luxor Agricultural Hub
    distance: '220 km',
    rating: 4.8,
  },
  {
    ...farms[6], // Minya Organic Collective
    distance: '180 km',
    rating: 4.9,
  },
];

interface ExploreFarmsProps {
  withoutLayout?: boolean;
}

export function ExploreFarms({ withoutLayout = false }: ExploreFarmsProps = {}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [highlightedFarmId, setHighlightedFarmId] = useState<number | null>(null);
  const [showAllFarms, setShowAllFarms] = useState(false);
  
  const INITIAL_FARMS_DISPLAY = 3;

  // Reset showAllFarms when filters change
  useEffect(() => {
    setShowAllFarms(false);
  }, [searchQuery, filterType, filterRegion]);

  const handleGetDirections = (farmId: number, farmName: string) => {
    try {
      setHighlightedFarmId(farmId);
      toast.success(`${t('explore.showingDirectionsTo')} ${farmName}`, {
        description: t('explore.checkMapRoute'),
        duration: 3000,
      });
    } catch (error) {
      // Silently handle errors (likely from browser extensions)
      console.debug('Toast notification error (likely from browser extension):', error);
    }
  };

  // Region mapping from filter values to actual region names
  const regionMap: Record<string, string> = {
    'delta': 'Delta',
    'cairo': 'Cairo',
    'alexandria': 'Alexandria',
    'fayoum': 'Fayoum',
    'aswan': 'Aswan',
    'luxor': 'Luxor',
    'minya': 'Minya',
    'ismailia': 'Ismailia',
    'sohag': 'Sohag',
    'port said': 'Port Said',
  };

  // Filter featured farms based on search query, type, and region
  const filteredFarms = featuredFarms.filter((farm) => {
    // Search filter - search by name, crops, or region
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !searchLower ||
      farm.name.toLowerCase().includes(searchLower) ||
      farm.crops.some(crop => crop.toLowerCase().includes(searchLower)) ||
      farm.region.toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = filterType === 'all' || farm.type === filterType;

    // Region filter
    const matchesRegion = 
      filterRegion === 'all' || 
      farm.region.toLowerCase() === filterRegion.toLowerCase() ||
      farm.region === regionMap[filterRegion.toLowerCase()];

    return matchesSearch && matchesType && matchesRegion;
  });

  const content = (
    <div className={withoutLayout ? "" : "py-8"}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[#2D6A4F]">{t('explore.title')}</h1>
                <p className="text-gray-600">{t('explore.subtitle')}</p>
              </div>
            </div>
            {highlightedFarmId && (
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    setHighlightedFarmId(null);
                    toast.info(t('explore.directionsCleared'));
                  } catch (error) {
                    // Silently handle errors (likely from browser extensions)
                    console.debug('Toast notification error (likely from browser extension):', error);
                    setHighlightedFarmId(null);
                  }
                }}
                className="rounded-full"
              >
                {t('explore.clearDirections')}
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t('explore.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder={t('explore.farmType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allTypes')}</SelectItem>
                <SelectItem value="organic">{t('explore.organic')}</SelectItem>
                <SelectItem value="conventional">{t('explore.conventional')}</SelectItem>
                <SelectItem value="mixed">{t('explore.mixed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder={t('explore.region')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explore.allRegions')}</SelectItem>
                <SelectItem value="delta">{t('explore.delta')}</SelectItem>
                <SelectItem value="cairo">{t('explore.cairo')}</SelectItem>
                <SelectItem value="alexandria">{t('explore.alexandria')}</SelectItem>
                <SelectItem value="fayoum">{t('explore.fayoum')}</SelectItem>
                <SelectItem value="aswan">{t('explore.aswan')}</SelectItem>
                <SelectItem value="luxor">{t('explore.luxor')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <EgyptFarmMap highlightedFarmId={highlightedFarmId} />
          </div>

          {/* Featured Farms List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#2D6A4F]">{t('explore.featuredFarms')}</h2>
              {(searchQuery || filterType !== 'all' || filterRegion !== 'all') && (
                <span className="text-sm text-gray-500">
                  {filteredFarms.length} {filteredFarms.length === 1 ? t('explore.farmCount') : t('explore.farmCountPlural')}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {filteredFarms.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 mb-2">{t('explore.noFarmsFound')}</p>
                  <p className="text-sm text-gray-400">
                    {t('explore.tryDifferentFilters')}
                  </p>
                </Card>
              ) : (
                (showAllFarms ? filteredFarms : filteredFarms.slice(0, INITIAL_FARMS_DISPLAY)).map((farm) => (
                <Card key={farm.id} className="p-4 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-[#2D6A4F] mb-1">{farm.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{farm.region}</span>
                        <span>•</span>
                        <span>{farm.distance}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-700">{farm.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {farm.crops.slice(0, 2).map((crop) => (
                      <Badge
                        key={crop}
                        variant="outline"
                        className="text-xs bg-[#2D6A4F]/5"
                      >
                        {crop}
                      </Badge>
                    ))}
                    {farm.crops.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        +{farm.crops.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{farm.farmers} {t('explore.farmers')}</span>
                    </div>
                    <Badge
                      className={
                        farm.type === 'organic'
                          ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                          : farm.type === 'conventional'
                          ? 'bg-[#BC6C25]/10 text-[#BC6C25]'
                          : 'bg-[#74C0FC]/10 text-[#74C0FC]'
                      }
                    >
                      {t(`explore.${farm.type}`)}
                    </Badge>
                  </div>

                  <Button
                    className={`w-full mt-3 rounded-full transition-all ${
                      highlightedFarmId === farm.id
                        ? 'bg-[#74C0FC] hover:bg-[#74C0FC]/90'
                        : 'bg-[#2D6A4F] hover:bg-[#2D6A4F]/90'
                    }`}
                    size="sm"
                    onClick={() => handleGetDirections(farm.id, farm.name)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {highlightedFarmId === farm.id ? t('explore.showingRoute') : t('explore.getDirections')}
                  </Button>
                </Card>
                ))
              )}
            </div>

            {/* See All / Show Less Button */}
            {filteredFarms.length > INITIAL_FARMS_DISPLAY && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllFarms(!showAllFarms)}
                  className="rounded-full w-full"
                >
                  {showAllFarms ? t('explore.showLess') : t('explore.seeAll')}
                </Button>
              </div>
            )}

            {/* Stats Summary */}
            <Card className="p-4 mt-6 bg-gradient-to-br from-[#2D6A4F] to-[#95D5B2] text-white">
              <h3 className="text-white mb-3">{t('explore.networkStats')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{t('explore.activeFarms')}</span>
                  <span className="text-white">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{t('explore.totalFarmers')}</span>
                  <span className="text-white">3,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{t('explore.regionsCovered')}</span>
                  <span className="text-white">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">{t('explore.avgGrowth')}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-white">+28%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-[#2D6A4F]/10 rounded-xl flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <h3 className="text-[#2D6A4F] mb-2">{t('explore.learnFromOthers')}</h3>
            <p className="text-gray-600 text-sm">
              {t('explore.learnFromOthersDesc')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-[#74C0FC]/10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#74C0FC]" />
            </div>
            <h3 className="text-[#2D6A4F] mb-2">{t('explore.buildNetwork')}</h3>
            <p className="text-gray-600 text-sm">
              {t('explore.buildNetworkDesc')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-[#BC6C25]/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#BC6C25]" />
            </div>
            <h3 className="text-[#2D6A4F] mb-2">{t('explore.shareSuccess')}</h3>
            <p className="text-gray-600 text-sm">
              {t('explore.shareSuccessDesc')}
            </p>
          </Card>
        </div>
      </div>
  );

  if (withoutLayout) {
    return content;
  }

  return (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  );
}

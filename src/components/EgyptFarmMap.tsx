import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { MapPin, Sprout, TrendingUp, Users, Navigation2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../utils/language';

export interface Farm {
  id: number;
  name: string;
  x: number; // SVG coordinates
  y: number;
  lat: number; // Real geographic coordinates
  lng: number;
  crops: string[];
  size: string;
  farmers: number;
  avgYield: string;
  type: 'organic' | 'conventional' | 'mixed';
  region: string;
}

export const farms: Farm[] = [
  {
    id: 1,
    name: 'Nile Delta Farms',
    x: 420,
    y: 180,
    lat: 30.8,
    lng: 31.2,
    crops: ['Rice', 'Cotton', 'Wheat'],
    size: '500 hectares',
    farmers: 45,
    avgYield: '+25%',
    type: 'conventional',
    region: 'Delta',
  },
  {
    id: 2,
    name: 'Cairo Green Valley',
    x: 410,
    y: 220,
    lat: 30.0444,
    lng: 31.2357,
    crops: ['Vegetables', 'Fruits'],
    size: '200 hectares',
    farmers: 28,
    avgYield: '+30%',
    type: 'organic',
    region: 'Cairo',
  },
  {
    id: 3,
    name: 'Alexandria Coastal Farm',
    x: 350,
    y: 160,
    lat: 31.2,
    lng: 29.9,
    crops: ['Olives', 'Grapes', 'Citrus'],
    size: '350 hectares',
    farmers: 35,
    avgYield: '+22%',
    type: 'mixed',
    region: 'Alexandria',
  },
  {
    id: 4,
    name: 'Fayoum Oasis Agriculture',
    x: 380,
    y: 270,
    lat: 29.3,
    lng: 30.8,
    crops: ['Dates', 'Wheat', 'Vegetables'],
    size: '420 hectares',
    farmers: 52,
    avgYield: '+28%',
    type: 'conventional',
    region: 'Fayoum',
  },
  {
    id: 5,
    name: 'Aswan Valley Farms',
    x: 440,
    y: 520,
    lat: 24.0889,
    lng: 32.8998,
    crops: ['Sugar Cane', 'Corn', 'Vegetables'],
    size: '600 hectares',
    farmers: 68,
    avgYield: '+32%',
    type: 'conventional',
    region: 'Aswan',
  },
  {
    id: 6,
    name: 'Luxor Agricultural Hub',
    x: 450,
    y: 450,
    lat: 25.6872,
    lng: 32.6396,
    crops: ['Wheat', 'Corn', 'Vegetables'],
    size: '380 hectares',
    farmers: 42,
    avgYield: '+26%',
    type: 'mixed',
    region: 'Luxor',
  },
  {
    id: 7,
    name: 'Minya Organic Collective',
    x: 410,
    y: 340,
    lat: 28.0871,
    lng: 30.7618,
    crops: ['Organic Vegetables', 'Herbs'],
    size: '250 hectares',
    farmers: 30,
    avgYield: '+35%',
    type: 'organic',
    region: 'Minya',
  },
  {
    id: 8,
    name: 'Ismailia Desert Farm',
    x: 460,
    y: 200,
    lat: 30.6,
    lng: 32.2,
    crops: ['Tomatoes', 'Peppers', 'Melons'],
    size: '180 hectares',
    farmers: 22,
    avgYield: '+24%',
    type: 'conventional',
    region: 'Ismailia',
  },
  {
    id: 9,
    name: 'Sohag Nile Farms',
    x: 430,
    y: 400,
    lat: 26.5569,
    lng: 31.6948,
    crops: ['Sugar Cane', 'Wheat', 'Corn'],
    size: '450 hectares',
    farmers: 55,
    avgYield: '+27%',
    type: 'conventional',
    region: 'Sohag',
  },
  {
    id: 10,
    name: 'Port Said Fresh Produce',
    x: 450,
    y: 155,
    lat: 31.2653,
    lng: 32.3019,
    crops: ['Vegetables', 'Melons'],
    size: '150 hectares',
    farmers: 18,
    avgYield: '+23%',
    type: 'mixed',
    region: 'Port Said',
  },
];

export function EgyptFarmMap({ highlightedFarmId }: { highlightedFarmId?: number | null }) {
  const { t } = useLanguage();
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Update selected farm when highlightedFarmId changes
  useEffect(() => {
    if (highlightedFarmId) {
      setSelectedFarm(highlightedFarmId);
      // Scroll map into view
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedFarmId]);

  const getMarkerColor = (type: Farm['type']) => {
    switch (type) {
      case 'organic':
        return '#2D6A4F';
      case 'conventional':
        return '#BC6C25';
      case 'mixed':
        return '#74C0FC';
      default:
        return '#95D5B2';
    }
  };

  return (
    <div ref={mapRef}>
      <Card className="p-6">
        <div className="mb-4">
        <h3 className="text-[#2D6A4F] mb-2">{t('exploreFarms.mapTitle')}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {highlightedFarmId ? (
            <span className="flex items-center gap-2">
              <Navigation2 className="w-4 h-4 text-[#2D6A4F]" />
              {t('exploreFarms.showingDirections')} {farms.find(f => f.id === highlightedFarmId)?.name}
            </span>
          ) : (
            t('exploreFarms.hoverInfo')
          )}
        </p>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2D6A4F]" />
            <span className="text-gray-600">{t('exploreFarms.organic')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#BC6C25]" />
            <span className="text-gray-600">{t('exploreFarms.conventional')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#74C0FC]" />
            <span className="text-gray-600">{t('exploreFarms.mixed')}</span>
          </div>
        </div>
      </div>

      {/* Map with OpenStreetMap Background */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ height: '600px' }}>
        {/* Map Background - Embedded OpenStreetMap */}
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=24.0,22.0,37.0,32.0&layer=mapnik&marker=30.0444,31.2357"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          title="Egypt Map Background"
          loading="lazy"
          allowFullScreen
        />

        {/* SVG Overlay with Egypt outline and Nile River */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid meet"
        >
            {/* Egypt Map Outline - Simplified SVG path */}
            <path
              d="M 350 140 L 480 140 L 490 150 L 500 155 L 505 165 L 500 175 L 490 185 L 485 195 L 485 210 L 480 220 L 475 230 L 470 245 L 468 260 L 465 280 L 463 300 L 461 320 L 460 340 L 458 360 L 456 380 L 455 400 L 453 420 L 452 440 L 451 460 L 450 480 L 448 500 L 447 520 L 445 540 L 440 545 L 435 545 L 430 542 L 425 538 L 420 535 L 415 530 L 412 525 L 410 518 L 408 510 L 406 500 L 404 490 L 402 480 L 400 470 L 398 460 L 396 450 L 394 440 L 392 430 L 390 420 L 388 410 L 386 400 L 384 390 L 382 380 L 380 370 L 378 360 L 376 350 L 374 340 L 372 330 L 370 320 L 368 310 L 366 300 L 364 290 L 362 280 L 360 270 L 358 260 L 356 250 L 354 240 L 352 230 L 350 220 L 348 210 L 346 200 L 344 190 L 342 180 L 340 170 L 338 160 L 340 155 L 345 150 L 350 140 Z"
              fill="#2D6A4F"
              fillOpacity="0.15"
              stroke="#2D6A4F"
              strokeWidth="3"
              className="transition-all duration-300"
              style={{ pointerEvents: 'none' }}
            />

            {/* Nile River - Simplified representation */}
            <path
              d="M 420 150 Q 415 200, 410 250 T 405 350 T 408 450 T 415 530"
              fill="none"
              stroke="#74C0FC"
              strokeWidth="4"
              strokeOpacity="0.5"
              style={{ pointerEvents: 'none' }}
            />

            {/* Direction path - shown when a farm is highlighted */}
            {highlightedFarmId && (() => {
              const targetFarm = farms.find(f => f.id === highlightedFarmId);
              if (!targetFarm) return null;
              
              // Start point (your location - near Cairo)
              const startX = 410;
              const startY = 220;
              
              return (
                <g style={{ pointerEvents: 'none' }}>
                  {/* Animated path from your location to target farm */}
                  <motion.path
                    d={`M ${startX} ${startY} L ${targetFarm.x} ${targetFarm.y}`}
                    stroke="#2D6A4F"
                    strokeWidth="4"
                    strokeDasharray="10,5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {/* Starting point marker (your location) */}
                  <circle
                    cx={startX}
                    cy={startY}
                    r={10}
                    fill="#74C0FC"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <text
                    x={startX}
                    y={startY - 15}
                    textAnchor="middle"
                    className="text-xs"
                    fill="#2D6A4F"
                    fontWeight="bold"
                  >
                    You
                  </text>
                </g>
              );
            })()}

            {/* Farm Markers */}
            {farms.map((farm) => {
              const isHighlighted = highlightedFarmId === farm.id;
              return (
              <g key={farm.id} style={{ pointerEvents: 'auto' }}>
                <HoverCard openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setSelectedFarm(farm.id)}
                      onMouseLeave={() => !isHighlighted ? setSelectedFarm(null) : undefined}
                    >
                      {/* Outer pulse effect when selected or highlighted */}
                      {(selectedFarm === farm.id || isHighlighted) && (
                        <motion.circle
                          cx={farm.x}
                          cy={farm.y}
                          r={20}
                          fill={getMarkerColor(farm.type)}
                          fillOpacity="0.3"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                        />
                      )}

                      {/* Main marker circle */}
                      <circle
                        cx={farm.x}
                        cy={farm.y}
                        r={(selectedFarm === farm.id || isHighlighted) ? 14 : 10}
                        fill={getMarkerColor(farm.type)}
                        className="transition-all duration-200"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                        }}
                      />

                      {/* Inner white circle */}
                      <circle
                        cx={farm.x}
                        cy={farm.y}
                        r={(selectedFarm === farm.id || isHighlighted) ? 6 : 4}
                        fill="white"
                        className="transition-all duration-200"
                      />

                      {/* Direction icon for highlighted farm */}
                      {isHighlighted && (
                        <g transform={`translate(${farm.x - 6}, ${farm.y - 22})`}>
                          <motion.path
                            d="M6 2L2 6L6 10L6 7L10 7L10 5L6 5L6 2Z"
                            fill="#2D6A4F"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          />
                        </g>
                      )}

                      {/* Marker pin shape */}
                      <path
                        d={`M ${farm.x} ${farm.y + 10} L ${farm.x - 4} ${farm.y + 16} L ${farm.x + 4} ${farm.y + 16} Z`}
                        fill={getMarkerColor(farm.type)}
                        className="transition-all duration-200"
                      />
                    </g>
                  </HoverCardTrigger>

                  <HoverCardContent
                    className="w-80 p-0 overflow-hidden"
                    side="top"
                    align="center"
                  >
                    <div className="relative">
                      {/* Header with gradient */}
                      <div
                        className="p-4 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${getMarkerColor(farm.type)}, ${getMarkerColor(farm.type)}dd)`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white mb-1">{farm.name}</h4>
                            <p className="text-white/80 text-sm">{farm.region} Region</p>
                          </div>
                          <MapPin className="w-5 h-5 text-white/80" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        {/* Crops */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                            <span className="text-sm text-gray-600">Main Crops</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {farm.crops.map((crop) => (
                              <Badge
                                key={crop}
                                variant="outline"
                                className="text-xs bg-[#2D6A4F]/5"
                              >
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="text-sm text-gray-900">{farm.size}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Farmers</p>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#2D6A4F]" />
                              <p className="text-sm text-gray-900">{farm.farmers}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Avg Yield</p>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              <p className="text-sm text-green-600">{farm.avgYield}</p>
                            </div>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="pt-2">
                          <Badge
                            style={{ backgroundColor: `${getMarkerColor(farm.type)}20`, color: getMarkerColor(farm.type) }}
                          >
                            {farm.type.charAt(0).toUpperCase() + farm.type.slice(1)} Farm
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </g>
            );
            })}
        </svg>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-sm z-30">
          {farms.length} Farms
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-[#2D6A4F]/5 rounded-lg">
          <p className="text-sm text-gray-600">Total Farmers</p>
          <p className="text-gray-900">
            {farms.reduce((sum, farm) => sum + farm.farmers, 0)}
          </p>
        </div>
        <div className="text-center p-3 bg-[#BC6C25]/5 rounded-lg">
          <p className="text-sm text-gray-600">Total Area</p>
          <p className="text-gray-900">
            {farms.reduce((sum, farm) => sum + parseInt(farm.size), 0)} ha
          </p>
        </div>
        <div className="text-center p-3 bg-[#74C0FC]/5 rounded-lg">
          <p className="text-sm text-gray-600">Regions</p>
          <p className="text-gray-900">
            {new Set(farms.map((f) => f.region)).size}
          </p>
        </div>
      </div>
      </Card>
    </div>
  );
}

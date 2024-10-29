/* eslint-disable @typescript-eslint/no-explicit-any */
// 如果某些情况下确实需要使用 any

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { 
  Sun, 
  Moon,
  Cloud, 
  CloudSun,
  CloudMoon,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudLightning,
  CloudFog,
  Wind, 
  Droplets, 
  MapPin, 
  X 
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_TOKEN = 'cKdiNIJd3JWMfvHy'

const weatherBackgrounds = {
  'CLEAR_DAY': 'from-yellow-200 to-orange-300',
  'CLEAR_NIGHT': 'from-indigo-800 to-purple-900',
  'PARTLY_CLOUDY_DAY': 'from-blue-200 to-gray-300',
  'PARTLY_CLOUDY_NIGHT': 'from-gray-700 to-gray-900',
  'CLOUDY': 'from-gray-300 to-gray-400',
  'LIGHT_RAIN': 'from-blue-200 to-gray-300',
  'MODERATE_RAIN': 'from-blue-300 to-gray-400',
  'HEAVY_RAIN': 'from-blue-400 to-gray-600',
  'STORM_RAIN': 'from-purple-300 to-gray-500',
}

// 义天气状况类型
type WeatherSkycon = 'CLEAR_DAY' | 'CLEAR_NIGHT' | 'PARTLY_CLOUDY_DAY' | 
  'PARTLY_CLOUDY_NIGHT' | 'CLOUDY' | 'LIGHT_RAIN' | 'MODERATE_RAIN' | 
  'HEAVY_RAIN' | 'STORM_RAIN' | 'FOG'

// 定义城市坐标映射（使用 GCJ-02 坐标系）
const CITY_COORDS = {
  // 直辖市
  '北京': '116.3972,39.9075',
  '上海': '121.4737,31.2304',
  '天津': '117.1878,39.1405',
  '重庆': '106.5516,29.5630',
  
  // 河北省
  '石家庄': '114.5149,38.0428',
  '唐山': '118.1754,39.6350',
  '秦皇岛': '119.5874,39.9451',
  '邯郸': '114.5391,36.6256',
  '保定': '115.4820,38.8676',
  '廊坊': '116.6837,39.5376',
  
  // 山西
  '': '112.5489,37.8706',
  '大同': '113.3001,40.0768',
  '运城': '111.0074,35.0280',
  '长治': '113.1163,36.1954',
  
  // 内蒙古
  '呼和浩特': '111.7518,40.8418',
  '包头': '109.8405,40.6582',
  '鄂尔多斯': '109.7815,39.6082',
  
  // 辽宁省
  '沈阳': '123.4315,41.8057',
  '大连': '121.6147,38.9140',
  '鞍山': '122.9946,41.1106',
  '抚顺': '123.9213,41.8657',
  
  // 吉林省
  '长春': '125.3245,43.8868',
  '吉���': '126.5530,43.8437',
  '延边': '129.5091,42.9048',
  
  // 黑龙江省
  '哈尔滨': '126.5420,45.8089',
  '大庆': '125.1037,46.5907',
  '齐齐哈尔': '123.9182,47.3540',
  
  // 江苏省
  '南京': '118.7969,32.0603',
  '苏州': '120.5853,31.2989',
  '无锡': '120.3119,31.4912',
  '常州': '119.9746,31.8122',
  '南通': '120.8647,32.0162',
  '扬州': '119.4142,32.3936',
  
  // 浙江省
  '杭州': '120.1551,30.2741',
  '宁波': '121.5440,29.8683',
  '温州': '120.6990,27.9943',
  '嘉兴': '120.7585,30.7539',
  '绍兴': '120.5802,30.0302',
  
  // 安徽省
  '合肥': '117.2272,31.8206',
  '芜湖': '118.3762,31.3263',
  '蚌埠': '117.3889,32.9162',
  
  // 福建省
  '福州': '119.2965,26.0745',
  '厦门': '118.0894,24.4798',
  '泉州': '118.5894,24.9089',
  
  // 江西省
  '南昌': '115.8581,28.6832',
  '赣': '114.9359,25.8452',
  '九江': '116.0019,29.7051',
  
  // 山东省
  '济南': '117.1205,36.6511',
  '青岛': '120.3826,36.0671',
  '烟台': '121.4479,37.4638',
  '威海': '122.1200,37.5129',
  '潍坊': '119.1618,36.3427',
  
  // 河南省
  '郑州': '113.6254,34.7466',
  '洛阳': '112.4540,34.6197',
  '开封': '114.3412,34.7971',
  '新乡': '113.9268,35.3030',
  '商丘': '115.6505,34.4371',  // 添加商丘
  
  // 湖北省
  '武汉': '114.3054,30.5928',
  '宜昌': '111.2864,30.6915',
  '襄阳': '112.1448,32.0425',
  
  // 湖南省
  '长沙': '112.9388,28.2280',
  '株洲': '113.1339,27.8275',
  '湘潭': '112.9447,27.8302',
  '衡阳': '112.5720,26.8946',
  
  // 广东省
  '广州': '113.2644,23.1291',
  '深圳': '114.0579,22.5431',
  '珠海': '113.5762,22.2706',
  '佛山': '113.1228,23.0288',
  '东莞': '113.7518,23.0202',
  '中山': '113.3926,22.5170',
  
  // 广西壮族自治区
  '南宁': '108.3200,22.8200',
  '桂林': '110.2993,25.2742',
  '北海': '109.1192,21.4859',
  
  // 海南省
  '海口': '110.3294,20.0225',
  '三亚': '109.5087,18.2478',
  
  // 四川省
  '成都': '104.0668,30.5728',
  '绵阳': '104.6796,31.4674',
  '乐山': '103.7615,29.5820',
  '遂宁': '105.5933,30.5333',
  
  // 贵州省
  '贵阳': '106.6302,26.6477',
  '遵义': '106.9273,27.7250',
  
  // 云南省
  '昆明': '102.8329,24.8801',
  '大理': '100.2196,25.5916',
  '丽江': '100.2271,26.8721',
  
  // 西藏自治区
  '拉萨': '91.1409,29.6456',
  '日喀则': '88.8851,29.2675',
  
  // 陕西省
  '西安': '108.9402,34.3416',
  '宝鸡': '107.2377,34.3623',
  '咸阳': '108.7053,34.3336',
  
  // 甘肃省
  '兰州': '103.8343,36.0611',
  '嘉峪关': '98.2773,39.7865',
  
  // 青海省
  '西宁': '101.7787,36.6170',
  '格尔木': '94.9282,36.4065',
  
  // 宁夏回族自治区
  '银川': '106.2309,38.4872',
  '石嘴山': '106.3833,39.0201',
  
  // 新疆维吾尔自治区
  '乌鲁木齐': '87.6168,43.8256',
  '克拉玛依': '84.8739,45.5959',
  '喀什': '75.9892,39.4677',
  '伊犁': '81.3179,43.9219'
} as const

// 创建固定的默认数据，使用 PARTLY_CLOUDY_DAY 作为默认天气状况
const getDefaultWeatherData = (baseTemp = 22): WeatherData => ({
  realtime: {
    temperature: baseTemp,
    humidity: 0.45,
    skycon: 'PARTLY_CLOUDY_DAY' as WeatherSkycon,
    wind: { 
      speed: 12,
      direction: 180  // 添加风向
    },
    pressure: 1013.25,    // 添加气压
    apparent_temperature: baseTemp + 1,  // 添加体感温度
    visibility: 10,  // 添加能见度
    cloudrate: 0.5,   // 添加云量
    precipitation: {    // 添加降水信息
      local: {
        intensity: 0
      },
      nearest: {
        distance: 1000,
        intensity: 0
      }
    },
    air_quality: { 
      aqi: { chn: 45 },
      description: { chn: '优' },
      pm25: 15,     // 添加 PM2.5
      pm10: 30,     // 添加 PM10
      o3: 50,       // 添加臭氧
      no2: 25,      // 添加二氧化氮
      so2: 10,      // 添加二氧化硫
      co: 0.8       // 添加一氧化碳
    },
    life_index: { 
      ultraviolet: { index: 2, desc: '较弱' },
      comfort: { index: 3, desc: '舒适' }  // 添加舒适度指数
    }
  },
  daily: {
    temperature: Array(7).fill(null).map((_, i) => ({  // 从15改为7
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      max: baseTemp + 3,
      min: baseTemp - 3
    })),
    skycon: Array(7).fill(null).map(() => ({ value: 'PARTLY_CLOUDY_DAY' as WeatherSkycon }))  // 从15改为7
  },
  hourly: {
    temperature: Array(48).fill(null).map((_, i) => ({ 
      datetime: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(), 
      value: baseTemp + (Math.sin(i / 12) * 3)
    })),
    skycon: Array(48).fill(null).map(() => ({
      datetime: new Date().toISOString(),
      value: 'PARTLY_CLOUDY_DAY' as WeatherSkycon
    }))
  },
  alert: { 
    content: [] 
  },
  api_version: '1.0',
  api_status: 'ok',
  lang: 'zh_CN',
  unit: 'metric',
  timezone: 'Asia/Shanghai',
  server_time: Math.floor(Date.now() / 1000),
  location: [116.3972, 39.9075],
  forecast_keypoint: '今日天气晴朗，适合外出活动'
})

// 添加风力等级计算函数
const getWindLevel = (speed: number): string => {
  if (speed < 1) return '0级 无风'
  if (speed < 6) return '1-2级 轻风'
  if (speed < 12) return '3级 微风'
  if (speed < 19) return '4级 和风'
  if (speed < 28) return '5级 劲'
  if (speed < 38) return '6级 强风'
  if (speed < 49) return '7级 疾风'
  if (speed < 61) return '8级 大风'
  if (speed < 74) return '9级 烈风'
  if (speed < 88) return '10级 狂风'
  if (speed < 102) return '11级 暴风'
  return '12级以上 台风'
}

// 添加紫外线等级判断函数
const getUVLevelColor = (index: number): string => {
  if (index <= 2) return 'text-green-600'  // 较弱
  if (index <= 4) return 'text-yellow-600' // 中等
  if (index <= 6) return 'text-orange-600' // 较强
  if (index <= 9) return 'text-red-600'    // 很强
  return 'text-purple-600'                 // 极强
}

// 将 CITY_GROUPS 移到组件外部
const CITY_GROUPS = {
  '直辖市': ['北京', '上海', '天津', '重庆'],
  '华北地区': ['石家庄', '唐山', '秦皇岛', '太原', '大同', '呼和浩特', '包头'],
  '东北地区': ['沈阳', '大连', '长春', '吉林', '哈尔滨', '大庆'],
  '华东地区': ['南京', '苏州', '杭州', '宁波', '合肥', '福州', '厦门', '南昌', '济南', '青岛'],
  '中南地区': ['郑州', '商丘', '武汉', '长沙', '广州', '深圳', '南宁', '海口'],
  '西南地区': ['成都', '遂宁', '贵阳', '昆明', '拉萨'],
  '西北地区': ['西安', '��州', '西宁', '银川', '乌鲁木齐']
} as const;

// 在文件开头添加一个检查函数
const getStoredCities = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('favoriteCities')
    return saved ? JSON.parse(saved) : ['北京', '上海', '广州']
  }
  return ['北京', '上海', '广州']
}

export function WeatherAppComponent() {
  const [city, setCity] = useState({ name: '北京', coords: '116.3972,39.9075' })
  const [weather, setWeather] = useState(() => getDefaultWeatherData())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])
  const [debugMode, setDebugMode] = useState(false)
  const [beijingSelectCount, setBeijingSelectCount] = useState(0)
  const [formattedTime, setFormattedTime] = useState<string>('')
  const [favoriteCities, setFavoriteCities] = useState<string[]>([])
  const [showAlert, setShowAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  // 添加一个 useEffect 来处理 localStorage
  useEffect(() => {
    setFavoriteCities(getStoredCities())
  }, [])

  // 添加搜索处理函数
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // 从所有城市组中搜索匹配的城市
    const results = Object.values(CITY_GROUPS)
      .flat()
      .filter(city => city.includes(query))
      .slice(0, 5) // 限制显示前5个结果
    
    setSearchResults(results)
  }

  // 修改添加收藏城市的函数
  const addFavoriteCity = useCallback((cityName: string) => {
    if (!favoriteCities.includes(cityName)) {
      const newFavorites = [...favoriteCities, cityName]
      setFavoriteCities(newFavorites)
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteCities', JSON.stringify(newFavorites))
      }
      
      setShowAlert({
        show: true,
        message: `已将${cityName}添加到收藏`,
        type: 'success'
      })
      setTimeout(() => {
        setShowAlert(prev => ({...prev, show: false}))
      }, 2000)
    }
  }, [favoriteCities])

  // 修改删除收藏城市的函数
  const removeFavoriteCity = useCallback((cityName: string) => {
    const newFavorites = favoriteCities.filter(c => c !== cityName)
    setFavoriteCities(newFavorites)
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteCities', JSON.stringify(newFavorites))
    }
    
    setShowAlert({
      show: true,
      message: `已将${cityName}从收藏中移除`,
      type: 'success'
    })
    setTimeout(() => {
      setShowAlert(prev => ({...prev, show: false}))
    }, 2000)
  }, [favoriteCities])

  // 将 fetchWeather 移到 useEffect 外部或使用 useCallback
  const fetchWeather = useCallback(async (coords: string) => {
    setLoading(true)
    setError(null)
    setDebugInfo([])
    
    const MAX_RETRY = 3
    let retryCount = 0
    
    while (retryCount <= MAX_RETRY) {
      try {
        const apiUrl = `/api?coords=${coords}`
        
        setDebugInfo(prev => [...prev, {
          type: 'info',
          message: `开始请求天气数据 (尝试 ${retryCount + 1}/${MAX_RETRY + 1})`,
          details: {
            url: apiUrl,
            coords,
            timestamp: new Date().toISOString(),
            city: city.name
          }
        }])

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.status === 'ok' && data.result) {
          const result: WeatherData = {
            ...data.result,
            api_version: data.api_version,
            api_status: data.api_status,
            lang: data.lang,
            unit: data.unit,
            timezone: data.timezone,
            server_time: data.server_time,
            location: data.location,
            forecast_keypoint: data.result.forecast_keypoint
          }
          
          setWeather(result)
          setDebugInfo(prev => [...prev, {
            type: 'info',
            message: '功获取天气数据',
            details: { timestamp: new Date().toISOString() }
          }])
          break
        } else {
          throw new Error(data.error || '天气数据格式错误')
        }
      } catch (err) {
        retryCount++
        if (retryCount > MAX_RETRY) {
          const errorMessage = err instanceof Error ? err.message : '未知错误'
          handleError(errorMessage)
          break
        }
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, retryCount * retryCount * 1000))
      } finally {
        setLoading(false)
      }
    }
  }, [city.name]) // 添加依赖

  // 然后更新 useEffect
  useEffect(() => {
    fetchWeather(city.coords)
  }, [city, fetchWeather]) // 添加 fetchWeather 作为依赖

  useEffect(() => {
    if (weather.server_time) {
      setFormattedTime(formatTime(weather.server_time))
    }
  }, [weather.server_time])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCity({ name: '当前位置', coords: `${longitude},${latitude}` })
        },
        () => {
          setError('无法获取您的位置')
        }
      )
    } else {
      setError('您的浏览器不支持地理定位')
    }
  }

  const getWeatherIcon = (condition: WeatherSkycon | undefined) => {
    if (!condition) return <Cloud className="w-12 h-12 text-gray-400" />
    
    switch (condition) {
      case 'CLEAR_DAY': 
        return <Sun className="w-12 h-12 text-yellow-400" />
      case 'CLEAR_NIGHT': 
        return <Moon className="w-12 h-12 text-yellow-200" />
      case 'PARTLY_CLOUDY_DAY':
        return <CloudSun className="w-12 h-12 text-gray-400" />
      case 'PARTLY_CLOUDY_NIGHT':
        return <CloudMoon className="w-12 h-12 text-gray-400" />
      case 'CLOUDY':
        return <Cloud className="w-12 h-12 text-gray-500" />
      case 'LIGHT_RAIN':
        return <CloudDrizzle className="w-12 h-12 text-blue-400" />
      case 'MODERATE_RAIN':
        return <CloudRain className="w-12 h-12 text-blue-500" />
      case 'HEAVY_RAIN':
        return <CloudRainWind className="w-12 h-12 text-blue-600" />
      case 'STORM_RAIN':
        return <CloudLightning className="w-12 h-12 text-purple-500" />
      case 'FOG':
        return <CloudFog className="w-12 h-12 text-gray-400" />
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />
    }
  }

  const getBackgroundColor = () => {
    // 总是返回默认的蓝紫渐变
    return 'from-blue-100 to-purple-100'
  }

  const handleCityChange = (value: string) => {
    const coords = CITY_COORDS[value as keyof typeof CITY_COORDS]
    if (!coords) {
      setError('不支持的城市')
      return
    }
    
    // 自动将选的城市添加到收藏列表
    if (!favoriteCities.includes(value)) {
      const newFavorites = [...favoriteCities, value]
      setFavoriteCities(newFavorites)
      localStorage.setItem('favoriteCities', JSON.stringify(newFavorites))
      
      setShowAlert({
        show: true,
        message: `已将${value}添加到收藏`,
        type: 'success'
      })
      setTimeout(() => {
        setShowAlert(prev => ({...prev, show: false}))
      }, 2000)
    }
    
    // 检查是否选择北京（保持原有的调试模式逻辑）
    if (value === '北京') {
      const newCount = beijingSelectCount + 1
      setBeijingSelectCount(newCount)
      
      if (newCount >= 3) {
        setDebugMode(true)
      }
    } else {
      setBeijingSelectCount(0)  // 修复：使用 setBeijingSelectCount 而不是 beijingSelectCount
    }
    
    setCity({ name: value, coords })
  }

  // 在误处中也使用固定的默认数据
  const handleError = (errorMessage: string) => {
    setError(`获取天气数据失败: ${errorMessage}`)
    setWeather(getDefaultWeatherData())  // 直接使用默认数据即可，不要保持天气状况
  }

  // 修复天气状况显示部分
  const getWeatherStatus = () => {
    const mainWeather = skyconToChinese[weather.daily.skycon[0]?.value || 'CLOUDY'];
    const allWeathers = Array.from(new Set(weather.daily.skycon.map(d => skyconToChinese[d.value])));
    return {
      main: mainWeather,
      all: allWeathers.join('、')
    };
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBackgroundColor()} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-6 max-w-[1600px]"> {/* 增加最大宽度限制 */}
        {/* 添加提示组件 */}
        {showAlert.show && (
          <div className="fixed top-4 right-4 z-50">
            <Alert variant={showAlert.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{showAlert.type === 'success' ? '成功' : '错误'}</AlertTitle>
              <AlertDescription>
                {showAlert.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="bg-white/80 backdrop-blur-md">
          <CardContent className="p-4 md:p-6"> {/* 响应式内边距 */}
            {/* 城市选择部分 */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {/* 添加搜索框 */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="搜索城市..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-[180px]"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border z-50">
                      {searchResults.map((cityName) => (
                        <button
                          key={cityName}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                          onClick={() => {
                            handleCityChange(cityName)
                            setSearchQuery('')
                            setSearchResults([])
                          }}
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Select onValueChange={handleCityChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={city.name || "选择城市"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(CITY_GROUPS).map(([group, cities]) => (
                      <SelectGroup key={group}>
                        <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                          {group}
                        </SelectLabel>
                        {cities.map(cityName => (
                          <SelectItem 
                            key={cityName} 
                            value={cityName}
                          >
                            <div className="flex items-center w-full">
                              <span>{cityName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={getLocation} variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  定位
                </Button>
              </div>

              {/* 收藏的城市快速切换栏 */}
              {favoriteCities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {favoriteCities.map((cityName) => (
                    <Button
                      key={cityName}
                      variant={cityName === city.name ? "secondary" : "outline"}
                      size="sm"
                      className="group relative"
                      onClick={() => handleCityChange(cityName)}
                    >
                      {cityName}
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFavoriteCity(cityName)
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* 当前天气部分 - 改为网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
              {/* 基本天气信息 - 占5列 */}
              <div className="md:col-span-5">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{city.name}</h2>
                    <div className="flex items-center gap-4">
                      <p className="text-6xl font-bold">{Math.round(weather.realtime.temperature)}°C</p>
                      <div className="scale-100">  {/* 调整图标大小 */}
                        {getWeatherIcon(weather.realtime.skycon)}
                      </div>
                    </div>
                    <p className="text-xl text-gray-600 mt-2">{skyconToChinese[weather.realtime.skycon]}</p>
                    
                    {/* 添加今明后三天温度范围 */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8">今天</span>
                        <span className="text-sm font-medium w-20">
                          {Math.round(weather.daily.temperature[0].min)}° ~ {Math.round(weather.daily.temperature[0].max)}°
                        </span>
                        <span className="text-sm text-gray-500">{skyconToChinese[weather.daily.skycon[0]?.value || 'CLOUDY']}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8">明天</span>
                        <span className="text-sm font-medium w-20">
                          {Math.round(weather.daily.temperature[1].min)}° ~ {Math.round(weather.daily.temperature[1].max)}°
                        </span>
                        <span className="text-sm text-gray-500">{skyconToChinese[weather.daily.skycon[1]?.value || 'CLOUDY']}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8">后天</span>
                        <span className="text-sm font-medium w-20">
                          {Math.round(weather.daily.temperature[2].min)}° ~ {Math.round(weather.daily.temperature[2].max)}°
                        </span>
                        <span className="text-sm text-gray-500">{skyconToChinese[weather.daily.skycon[2]?.value || 'CLOUDY']}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <Droplets className="w-4 h-4 mr-1" />
                      <span className="mr-4">{Math.round(weather.realtime.humidity * 100)}%</span>
                      <Wind className="w-4 h-4 mr-1" />
                      <span>{Math.round(weather.realtime.wind.speed)} km/h</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getWindLevel(weather.realtime.wind.speed)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 空气质量和其他指数 - 占7列 */}
              <div className="md:col-span-7 grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <h4 className="font-semibold">空气质量</h4>
                  <p className="text-2xl font-bold">{weather.realtime.air_quality.aqi.chn}</p>
                  <p className="text-sm text-gray-600">{weather.realtime.air_quality.description.chn}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <h4 className="font-semibold">紫外线指数</h4>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold ${getUVLevelColor(weather.realtime.life_index.ultraviolet.index)}`}>
                      {weather.realtime.life_index.ultraviolet.index}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({weather.realtime.life_index.ultraviolet.desc})
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <h4 className="font-semibold">体感温度</h4>
                  <p className="text-2xl font-bold">{Math.round(weather.realtime.apparent_temperature)}°C</p>
                  <p className="text-sm text-gray-600">舒适度: {weather.realtime.life_index.comfort.desc}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <h4 className="font-semibold">能见度</h4>
                  <p className="text-2xl font-bold">{weather.realtime.visibility} km</p>
                  <p className="text-sm text-gray-600">云量: {Math.round(weather.realtime.cloudrate * 100)}%</p>
                </div>
              </div>
            </div>

            {/* 24小时预报部分 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">24小时预报</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* 天气图标和信息条 */}
                  <div className="flex mb-6">
                    {weather.hourly.temperature.slice(0, 24).map((hour, index) => {
                      const date = new Date(hour.datetime);
                      const isNewDay = date.getHours() === 0;
                      return (
                        <div 
                          key={index} 
                          className={`flex-1 ${isNewDay ? 'border-l border-gray-300' : ''}`}
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-gray-600">
                              {isNewDay ? `${date.getMonth() + 1}/${date.getDate()}` : ''}
                              {date.getHours()}:00
                            </p>
                            <p className="text-sm font-semibold">{Math.round(hour.value)}°</p>
                            <div className="scale-75 my-1">
                              {getWeatherIcon(weather.hourly.skycon?.[index]?.value)}
                            </div>
                            <p className="text-xs text-gray-600">
                              {skyconToChinese[weather.hourly.skycon?.[index]?.value || 'CLOUDY']}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 温度折线图 */}
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart 
                      data={weather.hourly.temperature.slice(0, 24)}
                      margin={{ top: 20, right: 10, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="datetime" 
                        tickFormatter={(time: string) => {
                          const date = new Date(time);
                          return date.getHours() === 0 ? 
                            `${date.getMonth() + 1}/${date.getDate()}` : 
                            `${date.getHours()}时`;
                        }}
                        interval={3}
                        axisLine={{ strokeWidth: 1 }}
                        tick={{ fontSize: 11 }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        hide  // 隐藏Y轴
                        domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 2)]}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const date = new Date(label);
                            const hourData = weather.hourly.skycon?.[payload[0].payload.index];
                            return (
                              <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg text-sm">
                                <p className="font-semibold">
                                  {date.toLocaleString('zh-CN', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: false
                                  })}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="scale-50">
                                    {getWeatherIcon(hourData?.value)}
                                  </div>
                                  <div>
                                    <p className="text-base font-bold">{Math.round(payload[0].value as number)}°C</p>
                                    <p className="text-xs text-gray-600">
                                      {skyconToChinese[hourData?.value || 'CLOUDY']}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        label={{  // 添加数据点标签
                          position: 'top',
                          formatter: (value: number) => `${Math.round(value)}°`,
                          fontSize: 11,
                          fill: '#666'
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 7天预报部分 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* 温度折图 */}
              <div className="bg-blue-50/50 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">7天预报</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart 
                      data={weather.daily.temperature}
                      margin={{ top: 20, right: 10, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date: string) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        tick={{ fontSize: 11 }}
                        interval={0}  // 添加这行，强制显示所有刻度
                        axisLine={{ strokeWidth: 1 }}
                        padding={{ left: 0, right: 0 }}  // 改padding
                      />
                      <YAxis 
                        hide  // 隐藏Y轴
                        domain={[(dataMin: number) => Math.floor(dataMin - 3), (dataMax: number) => Math.ceil(dataMax + 3)]}
                      />
                      <Tooltip 
                        labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          weekday: 'short'
                        })} 
                        formatter={(value: number) => [`${Math.round(value)}°C`, '温度']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="max" 
                        stroke="#ff7300" 
                        name="最高温"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        label={{
                          position: 'top',
                          formatter: (value: number) => `${Math.round(value)}°`,
                          fontSize: 11,
                          offset: 10
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="min" 
                        stroke="#0088aa" 
                        name="最低温"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        label={{
                          position: 'bottom',
                          formatter: (value: number) => `${Math.round(value)}°`,
                          fontSize: 11,
                          offset: 10
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 添每日详细天气信息 */}
              <div className="bg-blue-50/50 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">未来天气</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {weather.daily.temperature.map((day, index) => {
                    const date = new Date(day.date);
                    const skycon = weather.daily.skycon[index]?.value;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-blue-100/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-14 text-sm">
                            <div className="font-medium">
                              {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                            </div>
                            <div className="text-gray-500">
                              {`${date.getMonth() + 1}/${date.getDate()}`}
                            </div>
                          </div>
                          <div className="scale-75">
                            {getWeatherIcon(skycon)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-orange-500 font-medium">{Math.round(day.max)}°</span>
                            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"></div>
                            <span className="text-blue-500 font-medium">{Math.round(day.min)}°</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {skyconToChinese[skycon || 'CLOUDY']}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 添加天气趋势分析 */}
              <div className="lg:col-span-2 bg-blue-50/50 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">天气趋势分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2">温度趋势</h4>
                    <p className="text-sm text-gray-600">
                      未来7天最高温度{Math.round(Math.max(...weather.daily.temperature.map(d => d.max)))}°C，
                      最低温度{Math.round(Math.min(...weather.daily.temperature.map(d => d.min)))}°C，
                      温差{Math.round(Math.max(...weather.daily.temperature.map(d => d.max)) - Math.min(...weather.daily.temperature.map(d => d.min)))}°C。
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2">天气状况</h4>
                    <p className="text-sm text-gray-600">
                      主要天气为{getWeatherStatus().main}，
                      期间可能出现{getWeatherStatus().all}。
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2">生活建议</h4>
                    <p className="text-sm text-gray-600">
                      {weather.daily.temperature[0].max > 28 ? '注意防暑降温，' : 
                       weather.daily.temperature[0].min < 12 ? '注意保暖，' : '温度适宜，'}
                      建议合理安排户外活动。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 预警信息部分 */}
            {weather.alert && weather.alert.content && weather.alert.content.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">气象灾害预警</h3>
                <div className="space-y-4">
                  {weather.alert.content.map((alert, index) => (
                    <div 
                      key={index} 
                      className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-orange-800">
                          {alert.title}
                        </h4>
                        <span className="text-sm text-gray-500" suppressHydrationWarning>
                          {new Date(alert.pubTime).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Shanghai'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">{alert.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">发布单位：</span>
                          <span className="text-gray-700">{alert.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">预警状态：</span>
                          <span className={`${
                            alert.status === 'active' 
                              ? 'text-green-600' 
                              : 'text-gray-600'
                          }`}>
                            {alert.status === 'active' ? '生效中' : '已解除'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">预警地区：</span>
                          <span className="text-gray-700">{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">预警代码：</span>
                          <span className="text-gray-700">{alert.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 添加天气提示 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">天气提示</h3>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/80 rounded-full">
                      <Sun className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">今日天气提示</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {weather.forecast_keypoint?.split('，').map((text, index, array) => (
                          <span key={index} className="inline-flex items-center">
                            <span>{text}</span>
                            {index < array.length - 1 && (
                              <span className="mx-2 text-gray-400">•</span>
                            )}
                          </span>
                        )) || '暂无天气提示'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 添基本信息卡片 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold">基本信息</h4>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm">
                      <span className="text-gray-600">时区：</span>
                      {weather.timezone || 'Asia/Shanghai'}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">API版本：</span>
                      {weather.api_version || '1.0'}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">API状态：</span>
                      {weather.api_status || 'ok'}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">更新时间：</span>
                      {formattedTime || '未知'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold">位置信息</h4>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm">
                      <span className="text-gray-600">经度：</span>
                      {weather.location?.[0].toFixed(4)}°
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">纬：</span>
                      {weather.location?.[1].toFixed(4)}°
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">更新时间：</span>
                      {formattedTime || '未知'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 添加分钟级降水预报 */}
            {weather.minutely && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">分钟级降水预报</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">降水概率</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {weather.minutely.probability.map((prob, index) => (
                          <div key={index} className="bg-white/50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600">{index * 30}分钟后</p>
                            <p className="text-lg font-bold">{Math.round(prob * 100)}%</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{weather.minutely.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">降强度</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={weather.minutely.precipitation_2h.map((value, index) => ({
                          time: index,
                          value: value
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            tickFormatter={(value) => `${value}分钟`}
                            interval={29}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(label) => `${label}分钟后`}
                            formatter={(value: number) => [
                              `${value.toFixed(3)} mm/h`,
                              '降水强度'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* 添加 API 信息 */}
            <div className="mt-8 text-xs text-gray-500">
              <p>API 版本: {weather.api_version}</p>
              <p>API 状态: {weather.api_status}</p>
            </div>

            {/* 修改调试信息显示条件 */}
            {debugMode && debugInfo.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">调试信息</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDebugMode(false)
                      setBeijingSelectCount(0)
                    }}
                  >
                    关闭调试模式
                  </Button>
                </div>
                <div className="space-y-2">
                  {debugInfo.map((info, index) => (
                    <Alert key={index} variant={info.type === 'error' ? 'destructive' : 'default'}>
                      <AlertTitle>{info.type === 'error' ? '错误' : '信息'}</AlertTitle>
                      <AlertDescription>
                        <p>{info.message}</p>
                        {info.details && (
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                            {JSON.stringify(info.details, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const skyconToChinese: Record<WeatherSkycon | string, string> = {
  'CLEAR_DAY': '晴天',
  'CLEAR_NIGHT': '晴夜',
  'PARTLY_CLOUDY_DAY': '多云',
  'PARTLY_CLOUDY_NIGHT': '多云',
  'CLOUDY': '阴',
  'LIGHT_HAZE': '轻度雾霾',
  'MODERATE_HAZE': '中度雾霾',
  'HEAVY_HAZE': '重度雾霾',
  'LIGHT_RAIN': '小雨',
  'MODERATE_RAIN': '中雨',
  'HEAVY_RAIN': '大雨',
  'STORM_RAIN': '暴雨',
  'LIGHT_SNOW': '小雪',
  'MODERATE_SNOW': '中雪',
  'HEAVY_SNOW': '大雪',
  'STORM_SNOW': '暴雪',
  'FOG': '雾'
}

// 在文件开头添加新的类型定义
type DebugInfo = {
  type: 'info' | 'error'
  message: string
  details?: Record<string, unknown>
}

// 更新 WeatherData 类型定义，添加更实况数据字段
type WeatherData = {
  realtime: {
    temperature: number
    humidity: number
    skycon: WeatherSkycon
    wind: { 
      speed: number
      direction: number  // 添加风向
    }
    pressure: number    // 添加气压
    apparent_temperature: number  // 添加体感温度
    visibility: number  // 添加能见度
    cloudrate: number   // 添加云量
    precipitation: {    // 添加降水信息
      local: {
        intensity: number
      }
      nearest: {
        distance: number
        intensity: number
      }
    }
    air_quality: { 
      aqi: { chn: number }
      description: { chn: string }
      pm25: number     // 添加 PM2.5
      pm10: number     // 添加 PM10
      o3: number       // 添加臭氧
      no2: number      // 添加二氧化氮
      so2: number      // 添加二氧化硫
      co: number       // 添加一氧化碳
    }
    life_index: { 
      ultraviolet: { index: number; desc: string }
      comfort: { index: number; desc: string }  // 添加舒适度指数
    }
  }
  daily: {
    temperature: Array<{ date: string; max: number; min: number }>
    skycon: Array<{ value: WeatherSkycon }>
  }
  hourly: {
    temperature: Array<{ datetime: string; value: number }>
    skycon: Array<{ datetime: string; value: WeatherSkycon }>  // 添加 skycon
  }
  alert: { 
    content: Array<{
      title: string
      description: string
      code: string  // 预警代码
      location: string  // 预警地区
      source: string   // 发布单位
      status: string   // 预警状态：active 或 inactive
      pubTime: string  // 发布时间
      latlon: [number, number]  // 位置坐标
    }> 
  }
  minutely?: {
    status: string
    datasource: string
    precipitation_2h: number[]
    precipitation: number[]
    probability: number[]
    description: string
  }
  // 添加 API 相关字段
  api_version?: string
  api_status?: string
  lang?: string
  unit?: string
  timezone?: string
  server_time?: number
  location?: [number, number]
  forecast_keypoint?: string
}

// 添加 formatTime 函数的定义（之前可能漏掉了）
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  })
}


import { NextResponse } from 'next/server'

const API_TOKEN = 'cKdiNIJd3JWMfvHy'

// 添加 CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coords = searchParams.get('coords')
    
    if (!coords) {
      return NextResponse.json(
        { error: '缺少坐标参数' }, 
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    const apiUrl = `https://api.caiyunapp.com/v2.6/${API_TOKEN}/${coords}/weather?alert=true&dailysteps=15&hourlysteps=24`
    
    console.log('Requesting weather data from:', apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, { 
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=300', // 缓存5分钟
      }
    })
    
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取天气数据失败' },
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
}

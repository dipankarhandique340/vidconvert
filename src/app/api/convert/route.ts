import { NextRequest, NextResponse } from "next/server"
import * as githubService from "@/lib/github-service"

export async function POST(req: NextRequest) {
  try {
    const { inputFile, outputFolder, apiKey } = await req.json()

    if (!inputFile || !outputFolder || !apiKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const conversionId = await githubService.startVideoConversion({
      inputFile,
      outputFolder,
      apiKey
    })

    return NextResponse.json({ conversionId })
  } catch (error) {
    console.error("Error starting conversion:", error)
    return NextResponse.json(
      { error: "Failed to start conversion" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const conversionId = url.searchParams.get("id")
    const apiKey = url.searchParams.get("apiKey")

    if (!conversionId || !apiKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const status = await githubService.checkConversionStatus(conversionId, apiKey)

    return NextResponse.json({ status })
  } catch (error) {
    console.error("Error checking conversion status:", error)
    return NextResponse.json(
      { error: "Failed to check conversion status" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const conversionId = url.searchParams.get("id")
    const apiKey = url.searchParams.get("apiKey")

    if (!conversionId || !apiKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const success = await githubService.cancelConversion(conversionId, apiKey)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error canceling conversion:", error)
    return NextResponse.json(
      { error: "Failed to cancel conversion" },
      { status: 500 }
    )
  }
}

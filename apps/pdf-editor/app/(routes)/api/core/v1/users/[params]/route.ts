import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"

export const PATCH = createRouteHandler({ isPublic: true }, async (req, { params }: { params: Promise<{ params: string }> }) => {
    const { params: paramValue } = await params
    return NextResponse.json({
        data: {
            param: paramValue,
        },
        error: null,
    }, { status: 200 })
})

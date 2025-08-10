import "server-only"
import { NextRequest } from "next/server"
import { User, Session } from "@/lib/auth/auth";

export interface ServiceContext extends NextRequest {
    user: User; 
    session: Session['session']    
}
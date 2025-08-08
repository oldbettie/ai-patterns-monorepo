// @feature:allow-list @domain:database @backend
// @summary: Seed script for preset allow list configurations
import { db, presetAllowLists } from './schemas'
import { eq } from 'drizzle-orm'

const PRESET_CONFIGURATIONS = [
  {
    id: 'privacy-first-preset',
    modeName: 'privacy-first',
    applications: [
      'Windows Update',
      'Microsoft Defender', 
      'macOS Software Update',
      'System Preferences',
      'Banking Apps',
      'Antivirus Software'
    ],
    description: 'Privacy-first configuration with minimal VPN bypasses for essential system updates and security applications only.',
  },
  {
    id: 'gaming-optimized-preset',
    modeName: 'gaming-optimized',
    applications: [
      'Steam',
      'Epic Games Launcher',
      'Discord',
      'Twitch',
      'Xbox Live',
      'PlayStation Network',
      'Origin',
      'Ubisoft Connect',
      'Battle.net',
      'GeForce Experience',
      'AMD Radeon Software',
      'OBS Studio',
      'Streamlabs'
    ],
    description: 'Gaming-optimized configuration that bypasses VPN for gaming platforms, voice chat, and streaming applications to minimize latency.',
  },
  {
    id: 'balanced-preset',
    modeName: 'balanced',
    applications: [
      'Steam',
      'Discord',
      'Zoom',
      'Microsoft Teams',
      'Slack',
      'Netflix',
      'YouTube',
      'Spotify',
      'Apple Music',
      'Skype',
      'WhatsApp Desktop',
      'Telegram Desktop',
      'Dropbox',
      'Google Drive',
      'OneDrive'
    ],
    description: 'Balanced configuration that allows common productivity, entertainment, and communication applications to bypass VPN for optimal performance.',
  },
] as const

export async function seedPresetAllowLists() {
  console.log('🌱 Seeding preset allow list configurations...')

  try {
    for (const preset of PRESET_CONFIGURATIONS) {
      // Check if preset already exists
      const existingPreset = await db
        .select()
        .from(presetAllowLists)
        .where(eq(presetAllowLists.modeName, preset.modeName))
        .limit(1)

      if (existingPreset.length > 0) {
        console.log(`📄 Preset '${preset.modeName}' already exists, updating...`)
        
        // Update existing preset
        await db
          .update(presetAllowLists)
          .set({
            applications: JSON.stringify(preset.applications),
            description: preset.description,
            isActive: true,
          })
          .where(eq(presetAllowLists.modeName, preset.modeName))
      } else {
        console.log(`➕ Creating new preset '${preset.modeName}'...`)
        
        // Create new preset
        await db
          .insert(presetAllowLists)
          .values({
            id: preset.id,
            modeName: preset.modeName,
            applications: JSON.stringify(preset.applications),
            description: preset.description,
            isActive: true,
          })
      }
    }

    console.log('✅ Preset allow list configurations seeded successfully!')
    
    // Log summary of seeded presets
    const allPresets = await db.select().from(presetAllowLists)
    console.log(`📊 Total presets in database: ${allPresets.length}`)
    
    allPresets.forEach(preset => {
      const apps = JSON.parse(preset.applications) as string[]
      console.log(`   • ${preset.modeName}: ${apps.length} applications`)
    })

  } catch (error) {
    console.error('❌ Error seeding preset allow list configurations:', error)
    throw error
  }
}

// Allow script to be run directly
if (require.main === module) {
  seedPresetAllowLists()
    .then(() => {
      console.log('🎉 Seed operation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed operation failed:', error)
      process.exit(1)
    })
}
export function generateProofId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PRF-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function sha256(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export function scoreToColor(score: number): string {
  if (score >= 80) return '#00FF87'
  if (score >= 60) return '#FFAA00'
  if (score >= 40) return '#FF8800'
  return '#FF4444'
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return 'Vérifié'
  if (score >= 60) return 'Probable'
  if (score >= 40) return 'Incertain'
  return 'Suspect'
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '...' : str
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function extractVideoFrame(
  videoFile: File
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const url = URL.createObjectURL(videoFile)
    video.src = url
    video.crossOrigin = 'anonymous'
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(5, video.duration / 4)
    })
    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) return reject(new Error('Frame extraction failed'))
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve({ base64: result.split(',')[1], mimeType: 'image/jpeg' })
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.85
      )
    })
    video.addEventListener('error', reject)
    video.load()
  })
}

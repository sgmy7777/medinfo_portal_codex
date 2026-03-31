export async function GET() {
  return new Response(
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: eecf50ee95b0c8c5</body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}

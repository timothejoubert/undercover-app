export default defineEventHandler(async (event) => {
    const body = await readBody<{ playerName: string, roomCode: string }>(event)
    const name = body.playerName?.trim()
    const code = body.roomCode?.trim().toUpperCase()

    if (!name || name.length < 2 || name.length > 24) {
        throw createError({ statusCode: 400, message: 'Prénom invalide (2-24 caractères)' })
    }
    if (!code || code.length !== 6) {
        throw createError({ statusCode: 400, message: 'Code invalide (6 caractères)' })
    }

    const supabase = useSupabaseAdmin(event)

    const { data: room } = await supabase
        .from('rooms')
        .select('id, status')
        .eq('code', code)
        .maybeSingle()

    if (!room) {
        throw createError({ statusCode: 404, message: 'Room introuvable — vérifie le code' })
    }
    if (room.status !== 'lobby') {
        throw createError({ statusCode: 409, message: 'La partie a déjà commencé' })
    }

    const { count } = await supabase
        .from('players')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', room.id)

    if ((count ?? 0) >= 12) {
        throw createError({ statusCode: 409, message: 'La room est complète (12 joueurs max)' })
    }

    const playerId = crypto.randomUUID()

    const { error: playerError } = await supabase
        .from('players')
        .insert({ id: playerId, room_id: room.id, name, is_alive: true })

    if (playerError) {
        console.error('[room/join] players insert:', playerError)
        throw createError({ statusCode: 500, message: playerError.message })
    }

    return { roomCode: code, playerId }
})

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ playerName: string }>(event)
    const name = body.playerName?.trim()

    if (!name || name.length < 2 || name.length > 24) {
        throw createError({ statusCode: 400, message: 'Prénom invalide (2-24 caractères)' })
    }

    const supabase = useSupabaseAdmin(event)

    let code = ''
    for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = Array.from(
            { length: 6 },
            () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
        ).join('')

        const { data } = await supabase
            .from('rooms')
            .select('id')
            .eq('code', candidate)
            .maybeSingle()

        if (!data) {
            code = candidate
            break
        }
    }

    if (!code) {
        throw createError({ statusCode: 500, message: 'Impossible de générer un code unique' })
    }

    const playerId = crypto.randomUUID()
    const roomId = crypto.randomUUID()

    const { error: roomError } = await supabase
        .from('rooms')
        .insert({
            id: roomId,
            code,
            host_id: playerId,
            status: 'lobby',
            options: {},
            word_pair: null,
        })

    if (roomError) {
        console.error('[room/create] rooms insert:', roomError)
        throw createError({ statusCode: 500, message: roomError.message })
    }

    const { error: playerError } = await supabase
        .from('players')
        .insert({ id: playerId, room_id: roomId, name, is_alive: true })

    if (playerError) {
        console.error('[room/create] players insert:', playerError)
        await supabase.from('rooms').delete().eq('id', roomId)
        throw createError({ statusCode: 500, message: playerError.message })
    }

    return { roomCode: code, playerId }
})

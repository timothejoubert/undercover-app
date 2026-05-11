export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code')?.toUpperCase()
    const playerId = getQuery(event).playerId as string

    if (!code || !playerId) {
        throw createError({ statusCode: 400, message: 'Paramètres manquants' })
    }

    const supabase = useSupabaseAdmin(event)

    const { data: player } = await supabase
        .from('players')
        .select('id, name, role, word, room_id')
        .eq('id', playerId)
        .maybeSingle()

    if (!player) {
        throw createError({ statusCode: 404, message: 'Joueur introuvable' })
    }

    // Vérifie que le joueur appartient bien à cette room
    const { data: room } = await supabase
        .from('rooms')
        .select('id, status')
        .eq('code', code)
        .eq('id', player.room_id)
        .maybeSingle()

    if (!room) {
        throw createError({ statusCode: 403, message: 'Joueur non autorisé dans cette room' })
    }
    if (room.status === 'lobby') {
        throw createError({ statusCode: 409, message: 'La partie n\'a pas encore commencé' })
    }

    return { role: player.role, word: player.word, name: player.name }
})

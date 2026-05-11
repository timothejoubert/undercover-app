export default defineEventHandler(async (event) => {
    const code = getRouterParam(event, 'code')?.toUpperCase()

    if (!code || code.length !== 6) {
        throw createError({ statusCode: 400, message: 'Code invalide' })
    }

    const supabase = useSupabaseAdmin(event)

    const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle()

    if (!room) {
        throw createError({ statusCode: 404, message: 'Room introuvable' })
    }

    const { data: players } = await supabase
        .from('players')
        .select('id, name, is_alive, joined_at')
        .eq('room_id', room.id)
        .order('joined_at')

    return {
        room,
        players: players ?? [],
    }
})

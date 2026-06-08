type PlayerRole = 'civil' | 'undercover'

const WORD_PAIRS = [
    { civil: 'Chat', undercover: 'Tigre' },
    { civil: 'Plage', undercover: 'Piscine' },
    { civil: 'Cola', undercover: 'Pepsi' },
    { civil: 'Voiture', undercover: 'Moto' },
    { civil: 'Pizza', undercover: 'Tarte' },
    { civil: 'Château', undercover: 'Palais' },
    { civil: 'Médecin', undercover: 'Infirmier' },
    { civil: 'Guitare', undercover: 'Violon' },
]

export default defineEventHandler(async (event) => {
    const body = await readBody<{ playerId: string, roomCode: string }>(event)
    const { playerId, roomCode } = body

    if (!playerId || !roomCode) {
        throw createError({ statusCode: 400, message: 'Paramètres manquants' })
    }

    const supabase = useSupabaseAdmin(event)

    const { data: room } = await supabase
        .from('rooms')
        .select('id, host_id, status')
        .eq('code', roomCode.toUpperCase())
        .maybeSingle()

    if (!room) {
        throw createError({ statusCode: 404, message: 'Room introuvable' })
    }
    if (room.host_id !== playerId) {
        throw createError({ statusCode: 403, message: 'Seul l\'hôte peut démarrer la partie' })
    }
    if (room.status !== 'lobby') {
        throw createError({ statusCode: 409, message: 'La partie a déjà commencé' })
    }

    const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)

    if (!players || players.length < 1) {
        throw createError({ statusCode: 400, message: 'Aucun joueur dans la room' })
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const undercoverCount = players.length >= 7 ? 2 : 1
    const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]

    for (const [index, player] of shuffled.entries()) {
        const role: PlayerRole = index < undercoverCount ? 'undercover' : 'civil'
        const word = role === 'undercover' ? wordPair.undercover : wordPair.civil
        await supabase.from('players').update({ role, word }).eq('id', player.id)
    }

    await supabase
        .from('rooms')
        .update({ status: 'playing', word_pair: wordPair })
        .eq('id', room.id)

    await supabase
        .from('rounds')
        .insert({ id: crypto.randomUUID(), room_id: room.id, number: 1, status: 'describing' })

    return { ok: true }
})

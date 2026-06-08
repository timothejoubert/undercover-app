import type { Role, Player, Room } from '~/types/game'

// ─── Word bank ────────────────────────────────────────────────────────────────
const WORD_PAIRS: Array<{ civil: string, undercover: string }> = [
    { civil: 'Chat', undercover: 'Tigre' },
    { civil: 'Plage', undercover: 'Piscine' },
    { civil: 'Cola', undercover: 'Pepsi' },
    { civil: 'Voiture', undercover: 'Moto' },
    { civil: 'Pizza', undercover: 'Tarte' },
    { civil: 'Château', undercover: 'Palais' },
    { civil: 'Médecin', undercover: 'Infirmier' },
    { civil: 'Guitare', undercover: 'Violon' },
    { civil: 'Cinéma', undercover: 'Théâtre' },
    { civil: 'Café', undercover: 'Thé' },
    { civil: 'Ski', undercover: 'Snowboard' },
    { civil: 'Jungle', undercover: 'Forêt' },
    { civil: 'Requin', undercover: 'Dauphin' },
    { civil: 'Prison', undercover: 'Hôpital' },
    { civil: 'Crayon', undercover: 'Stylo' },
    { civil: 'Montagne', undercover: 'Colline' },
    { civil: 'Boulanger', undercover: 'Pâtissier' },
    { civil: 'Lion', undercover: 'Panthère' },
    { civil: 'Avion', undercover: 'Hélicoptère' },
    { civil: 'Fantôme', undercover: 'Zombie' },
]

const STORAGE_KEY = 'undercover:game'

function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Phase 2: move to server route
function assignRoles(players: Player[]): Player[] {
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const undercoverCount = players.length >= 7 ? 2 : 1
    const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]!

    const assignments = new Map<string, { role: Role, word: string }>()
    shuffled.forEach((player, i) => {
        const role: Role = i < undercoverCount ? 'undercover' : 'civil'
        assignments.set(player.id, {
            role,
            word: role === 'undercover' ? wordPair.undercover : wordPair.civil,
        })
    })

    return players.map(player => ({
        ...player,
        ...assignments.get(player.id)!,
        hasSeenWord: false,
    }))
}

// ─── Composable ───────────────────────────────────────────────────────────────
export function useGame() {
    const room = useState<Room | null>('game:room', () => null)
    const players = useState<Player[]>('game:players', () => [])
    const myPlayerId = useState('game:myPlayerId', () => '')
    const currentRound = useState('game:round', () => 1)
    // Phase 2: replace with Supabase tables
    const descriptions = useState<Array<{ playerId: string, text: string }>>('game:descriptions', () => [])
    const votes = useState<Array<{ voterId: string, targetId: string }>>('game:votes', () => [])
    const lastEliminatedId = useState<string | null>('game:lastEliminated', () => null)
    const winner = useState<'civil' | 'undercover' | null>('game:winner', () => null)

    // ── Computed ──────────────────────────────────────────────────────────────
    const isHost = computed(() => room.value?.hostId === myPlayerId.value)
    const alivePlayers = computed(() => players.value.filter(p => p.isAlive))

    const pendingDistributionPlayer = computed<Player | null>(() =>
        room.value?.status === 'distributing'
            ? (players.value.find(p => !p.hasSeenWord) ?? null)
            : null)

    const pendingDescriptionPlayer = computed<Player | null>(() =>
        room.value?.status === 'describing'
            ? (alivePlayers.value.find(p => !descriptions.value.some(d => d.playerId === p.id)) ?? null)
            : null)

    const pendingVotePlayer = computed<Player | null>(() =>
        room.value?.status === 'voting'
            ? (alivePlayers.value.find(p => !votes.value.some(v => v.voterId === p.id)) ?? null)
            : null)

    const lastEliminated = computed(() =>
        lastEliminatedId.value
            ? (players.value.find(p => p.id === lastEliminatedId.value) ?? null)
            : null)

    // Vote tally sorted by count desc — used for the recap screen
    const voteResults = computed(() =>
        alivePlayers.value
            .map(player => ({
                player,
                count: votes.value.filter(v => v.targetId === player.id).length,
            }))
            .sort((a, b) => b.count - a.count))

    // ── localStorage persistence ───────────────────────────────────────────────
    onMounted(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved && !room.value) {
                const s = JSON.parse(saved)
                if (s.room) room.value = s.room
                if (s.players) players.value = s.players
                if (s.myPlayerId) myPlayerId.value = s.myPlayerId
                if (s.currentRound) currentRound.value = s.currentRound
                if (s.descriptions) descriptions.value = s.descriptions
                if (s.votes) votes.value = s.votes
                if (s.lastEliminatedId !== undefined) lastEliminatedId.value = s.lastEliminatedId
                if (s.winner !== undefined) winner.value = s.winner
            }
        }
        catch { /* ignore parse errors */ }
    })

    watch(
        [room, players, myPlayerId, currentRound, descriptions, votes, lastEliminatedId, winner],
        () => {
            if (!import.meta.client) return
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    room: room.value,
                    players: players.value,
                    myPlayerId: myPlayerId.value,
                    currentRound: currentRound.value,
                    descriptions: descriptions.value,
                    votes: votes.value,
                    lastEliminatedId: lastEliminatedId.value,
                    winner: winner.value,
                }))
            }
            catch { /* ignore storage errors */ }
        },
        { deep: true },
    )

    // ── Actions ───────────────────────────────────────────────────────────────

    // Phase 2: $fetch('/api/room', { method: 'POST', body: { playerName } })
    async function createRoom(playerName: string): Promise<void> {
        const playerId = crypto.randomUUID()
        const code = generateCode()

        room.value = { id: crypto.randomUUID(), code, hostId: playerId, status: 'lobby' }
        players.value = [{ id: playerId, name: playerName.trim(), isAlive: true, hasSeenWord: false }]
        myPlayerId.value = playerId
        currentRound.value = 1
        descriptions.value = []
        votes.value = []
        lastEliminatedId.value = null
        winner.value = null

        await navigateTo(`/room/${code}`)
    }

    // Phase 2: $fetch('/api/room/join', { method: 'POST', body: { playerName, roomCode } })
    async function joinRoom(_roomCode: string, _playerName: string): Promise<void> {
        throw new Error('Rejoindre par code n\'est disponible qu\'en mode connecté (Phase 2)')
    }

    // Local-only. Phase 2: remove — players join via joinRoom()
    function addPlayer(playerName: string): void {
        players.value = [
            ...players.value,
            { id: crypto.randomUUID(), name: playerName.trim(), isAlive: true, hasSeenWord: false },
        ]
    }

    // Phase 2: $fetch('/api/room/start', { method: 'POST', body: { playerId, roomCode } })
    async function startGame(): Promise<void> {
        if (!room.value || players.value.length < 3) return
        players.value = assignRoles(players.value)
        room.value = { ...room.value, status: 'distributing' }
        await navigateTo(`/room/${room.value.code}/game`)
    }

    // Phase 2: $fetch(`/api/room/${roomCode}/my-role`, { query: { playerId } })
    function getPlayerWord(playerId: string): { role: Role, word: string } | null {
        const player = players.value.find(p => p.id === playerId)
        if (!player?.role || !player?.word) return null
        return { role: player.role, word: player.word }
    }

    function markWordSeen(playerId: string): void {
        players.value = players.value.map(p =>
            p.id === playerId ? { ...p, hasSeenWord: true } : p)
        if (players.value.every(p => p.hasSeenWord)) {
            room.value = room.value ? { ...room.value, status: 'playing' } : null
        }
    }

    // Phase 2: POST /api/room/describe + Realtime broadcast
    function startDescribing(): void {
        descriptions.value = []
        room.value = room.value ? { ...room.value, status: 'describing' } : null
    }

    // Phase 2: POST /api/room/description (insert row)
    function submitDescription(playerId: string, text: string): void {
        descriptions.value = [...descriptions.value, { playerId, text: text.trim() || '—' }]
    }

    // Phase 2: POST /api/room/vote-phase
    function startVoting(): void {
        votes.value = []
        room.value = room.value ? { ...room.value, status: 'voting' } : null
    }

    // Phase 2: POST /api/room/vote (insert row)
    function submitVote(voterId: string, targetId: string): void {
        votes.value = [...votes.value, { voterId, targetId }]
    }

    // Phase 2: triggered server-side after all votes
    function resolveVote(): Player | null {
        if (!room.value) return null

        const counts = new Map<string, number>()
        for (const { targetId } of votes.value) {
            counts.set(targetId, (counts.get(targetId) ?? 0) + 1)
        }

        const eliminated = alivePlayers.value.reduce<Player | null>((best, player) => {
            const count = counts.get(player.id) ?? 0
            return count > (counts.get(best?.id ?? '') ?? 0) ? player : best
        }, null)

        if (!eliminated) return null

        players.value = players.value.map(p =>
            p.id === eliminated.id ? { ...p, isAlive: false } : p)
        lastEliminatedId.value = eliminated.id

        const stillAlive = players.value.filter(p => p.isAlive)
        const undercoverCount = stillAlive.filter(p => p.role === 'undercover').length
        const civilCount = stillAlive.filter(p => p.role !== 'undercover').length

        if (undercoverCount === 0) {
            winner.value = 'civil'
            room.value = { ...room.value, status: 'result' }
        }
        else if (undercoverCount >= civilCount) {
            winner.value = 'undercover'
            room.value = { ...room.value, status: 'result' }
        }

        return eliminated
    }

    function nextRound(): void {
        currentRound.value++
        descriptions.value = []
        votes.value = []
        lastEliminatedId.value = null
        room.value = room.value ? { ...room.value, status: 'describing' } : null
    }

    function reset(): void {
        room.value = null
        players.value = []
        myPlayerId.value = ''
        currentRound.value = 1
        descriptions.value = []
        votes.value = []
        lastEliminatedId.value = null
        winner.value = null
        if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
    }

    return {
        room: readonly(room),
        players: readonly(players),
        myPlayerId: readonly(myPlayerId),
        currentRound: readonly(currentRound),
        descriptions: readonly(descriptions),
        votes: readonly(votes),
        winner: readonly(winner),
        isHost,
        alivePlayers,
        pendingDistributionPlayer,
        pendingDescriptionPlayer,
        pendingVotePlayer,
        lastEliminated,
        voteResults,
        createRoom,
        joinRoom,
        addPlayer,
        startGame,
        getPlayerWord,
        markWordSeen,
        startDescribing,
        submitDescription,
        startVoting,
        submitVote,
        resolveVote,
        nextRound,
        reset,
    }
}

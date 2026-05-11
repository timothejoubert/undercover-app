<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { RoomRow, PlayerPublic, RoomResponse } from '~/types/api'

const route = useRoute()
const code = (route.params.code as string).toUpperCase()
const supabase = useSupabaseClient<Database>()
const storedPlayerId = useLocalStorage('undercover:player-id', '')

const room = ref<RoomRow | null>(null)
const players = ref<PlayerPublic[]>([])
const loading = ref(true)
const notFound = ref(false)
const copied = ref(false)

const isHost = computed(() => room.value?.host_id === storedPlayerId.value)
const canStart = computed(() => players.value.length >= 1)
const starting = ref(false)

let roomChannel: RealtimeChannel | null = null

onMounted(async () => {
    try {
        const { room: roomData, players: playersData } = await $fetch<RoomResponse>(`/api/room/${code}`)

        room.value = roomData
        players.value = playersData
        loading.value = false

        roomChannel = supabase.channel(`room:${code}`)
        roomChannel
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'players', filter: `room_id=eq.${roomData.id}` },
                (payload) => {
                    const newPlayer = payload.new as PlayerPublic
                    if (!players.value.some(p => p.id === newPlayer.id)) {
                        players.value.push(newPlayer)
                    }
                },
            )
            .subscribe()
    }
    catch {
        notFound.value = true
        loading.value = false
    }
})

onUnmounted(() => {
    if (roomChannel) supabase.removeChannel(roomChannel)
})

async function handleStart() {
    starting.value = true
    try {
        await $fetch('/api/room/start', {
            method: 'POST',
            body: { playerId: storedPlayerId.value, roomCode: code },
        })
        await navigateTo(`/room/${code}/game`)
    }
    catch (e: unknown) {
        console.error('Erreur démarrage:', e)
        starting.value = false
    }
}

async function copyCode() {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => {
        copied.value = false
    }, 2000)
}
</script>

<template>
    <div :class="$style['root']">
        <p
            v-if="loading"
            :class="$style['loading']"
        >
            Chargement...
        </p>

        <UCard
            v-else-if="notFound"
            :class="$style['card']"
        >
            <div :class="$style['card-inner']">
                <p>Room introuvable.</p>
                <UButton
                    variant="ghost"
                    to="/"
                >
                    Retour à l'accueil
                </UButton>
            </div>
        </UCard>

        <template v-else>
            <header :class="$style['header']">
                <p :class="$style['code-label']">
                    Code de la partie
                </p>
                <div :class="$style['code-row']">
                    <span :class="$style['code']">{{ code }}</span>
                    <UButton
                        variant="ghost"
                        size="sm"
                        @click="copyCode"
                    >
                        {{ copied ? 'Copié !' : 'Copier' }}
                    </UButton>
                </div>
                <p :class="$style['code-hint']">
                    Partage ce code avec tes amis
                </p>
            </header>

            <UCard :class="$style['card']">
                <div :class="$style['card-inner']">
                    <div :class="$style['players-header']">
                        <h2 :class="$style['card-title']">
                            Joueurs
                        </h2>
                        <span :class="$style['player-count']">{{ players.length }} / 12</span>
                    </div>

                    <ul :class="$style['player-list']">
                        <li
                            v-for="player in players"
                            :key="player.id"
                            :class="[$style['player'], player.id === storedPlayerId && $style['player--me']]"
                        >
                            <span :class="$style['player-name']">{{ player.name }}</span>
                            <span
                                v-if="player.id === room?.host_id"
                                :class="$style['badge']"
                            >hôte</span>
                            <span
                                v-if="player.id === storedPlayerId"
                                :class="$style['badge--me']"
                            >vous</span>
                        </li>
                    </ul>

                    <p
                        v-if="players.length < 4"
                        :class="$style['hint']"
                    >
                        En attente de joueurs (encore {{ 4 - players.length }})
                    </p>

                    <div :class="$style['card-footer']">
                        <UButton
                            v-if="isHost"
                            block
                            size="lg"
                            :disabled="!canStart"
                            :loading="starting"
                            @click="handleStart"
                        >
                            Démarrer la partie
                        </UButton>
                        <p
                            v-else
                            :class="$style['hint']"
                        >
                            En attente que l'hôte démarre...
                        </p>
                    </div>
                </div>
            </UCard>

            <UButton
                variant="ghost"
                to="/"
                :class="$style['leave']"
            >
                Quitter la room
            </UButton>
        </template>
    </div>
</template>

<style lang="scss" module>
.root {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 24px;
}

.loading {
    color: var(--ui-text-muted);
}

.header {
    text-align: center;
}

.code-label {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.code-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    gap: 8px;
}

.code {
    color: var(--ui-primary);
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.code-hint {
    margin-top: 4px;
    color: var(--ui-text-muted);
    font-size: 0.875rem;
}

.card {
    width: 100%;
    max-width: 420px;
}

.card-inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
}

.players-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.player-count {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
}

.player-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    gap: 4px;
    list-style: none;
}

.player {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--ui-bg-elevated);
    gap: 8px;
}

.player--me {
    background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}

.player-name {
    flex: 1;
    font-weight: 500;
}

.badge {
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--ui-bg-accented);
    color: var(--ui-text-muted);
    font-size: 0.75rem;
}

.badge--me {
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
    color: var(--ui-primary);
    font-size: 0.75rem;
}

.hint {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    text-align: center;
}

.card-footer {
    margin-top: 8px;
}

.leave {
    color: var(--ui-text-muted);
}
</style>

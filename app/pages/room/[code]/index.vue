<script setup lang="ts">
const route = useRoute()
const code = (route.params.code as string).toUpperCase()

const { room, players, isHost, addPlayer, startGame } = useGame()

const showAddPlayer = ref(false)
const newPlayerName = ref('')
const starting = ref(false)
const copied = ref(false)

const canStart = computed(() => players.value.length >= 3)

onMounted(() => {
    if (!room.value || room.value.code !== code) {
        navigateTo('/')
    }
})

function handleAddPlayer() {
    const name = newPlayerName.value.trim()
    if (name.length < 2 || name.length > 24) return
    addPlayer(name)
    newPlayerName.value = ''
    showAddPlayer.value = false
}

async function handleStart() {
    starting.value = true
    try {
        await startGame()
    }
    catch (e) {
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
                Passez le téléphone à chaque joueur pour l'ajouter
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
                        :class="[$style['player'], player.id === room?.hostId && $style['player--host']]"
                    >
                        <span :class="$style['player-name']">{{ player.name }}</span>
                        <span
                            v-if="player.id === room?.hostId"
                            :class="$style['badge']"
                        >hôte</span>
                    </li>
                </ul>

                <!-- Formulaire ajout joueur -->
                <div
                    v-if="showAddPlayer"
                    :class="$style['add-form']"
                >
                    <UInput
                        v-model="newPlayerName"
                        placeholder="Prénom du joueur"
                        :maxlength="24"
                        autofocus
                        size="lg"
                        @keyup.enter="handleAddPlayer"
                    />
                    <div :class="$style['add-form-actions']">
                        <UButton
                            variant="ghost"
                            @click="showAddPlayer = false"
                        >
                            Annuler
                        </UButton>
                        <UButton
                            :disabled="newPlayerName.trim().length < 2"
                            @click="handleAddPlayer"
                        >
                            Ajouter
                        </UButton>
                    </div>
                </div>

                <UButton
                    v-else
                    variant="outline"
                    block
                    :disabled="players.length >= 12"
                    @click="showAddPlayer = true"
                >
                    + Ajouter un joueur
                </UButton>

                <p
                    v-if="players.length < 3"
                    :class="$style['hint']"
                >
                    Il faut au moins 3 joueurs pour démarrer (encore {{ 3 - players.length }})
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

.player--host {
    background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}

.player-name {
    flex: 1;
    font-weight: 500;
}

.badge {
    padding: 2px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
    color: var(--ui-primary);
    font-size: 0.75rem;
}

.add-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.add-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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
